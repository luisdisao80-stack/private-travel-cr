// Push our URLs to IndexNow so Bing (and Yandex / Naver / Seznam / Yep)
// re-crawl them within hours instead of waiting weeks for their own crawler.
//
// IMPORTANT — Google does NOT participate in IndexNow. It evaluated the
// protocol after the 2021 launch and never adopted it, so this script does
// nothing for Google rankings. For Google you still use Search Console
// (sitemap + "Request indexing"). The reason this is still worth running:
// ChatGPT and Copilot answer travel questions off the Bing index, so being
// fresh in Bing is what gets us cited in AI answers.
//
// Usage:
//   npx tsx scripts/indexnow-submit.ts                 # submit every URL in the sitemap
//   npx tsx scripts/indexnow-submit.ts cahuita         # only URLs containing "cahuita"
//   npx tsx scripts/indexnow-submit.ts --dry-run       # show what WOULD be sent, send nothing
//   npx tsx scripts/indexnow-submit.ts cahuita --dry-run
//
// Prerequisites: the key file must be live in production. Check with:
//   curl https://www.privatetravelcr.com/458921b60bd0f4aae72abc8e43995d93.txt
// It must return exactly the key. If it 404s, the deploy hasn't landed yet
// and IndexNow will reject every submission with 403.

const KEY = "458921b60bd0f4aae72abc8e43995d93";
const HOST = "www.privatetravelcr.com";
const ORIGIN = `https://${HOST}`;
const KEY_LOCATION = `${ORIGIN}/${KEY}.txt`;
const SITEMAP_URL = `${ORIGIN}/sitemap.xml`;
const ENDPOINT = "https://api.indexnow.org/indexnow";

// IndexNow accepts at most 10,000 URLs per POST.
const BATCH_SIZE = 10_000;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const filter = args.find((a) => !a.startsWith("--"));

async function fetchSitemapUrls(): Promise<string[]> {
  const res = await fetch(SITEMAP_URL, { redirect: "follow" });
  if (!res.ok) {
    throw new Error(`Sitemap fetch failed: ${res.status} ${res.statusText}`);
  }
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  if (urls.length === 0) {
    throw new Error("Sitemap returned 0 <loc> entries — did the fetch land on a redirect page?");
  }
  return urls;
}

// The key file sits at the domain root, so IndexNow only accepts URLs on that
// exact host. Anything else (apex without www, a preview deploy) is a 422.
function assertSameHost(urls: string[]): void {
  const foreign = urls.filter((u) => !u.startsWith(ORIGIN));
  if (foreign.length > 0) {
    throw new Error(
      `${foreign.length} URL(s) are not on ${ORIGIN} and would be rejected with 422.\n` +
        `First offender: ${foreign[0]}`,
    );
  }
}

async function submitBatch(urlList: string[], batchNo: number, batchCount: number): Promise<void> {
  const label = batchCount > 1 ? ` (batch ${batchNo}/${batchCount})` : "";
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList,
    }),
  });

  const body = await res.text();

  // 200 = accepted, 202 = accepted but the key file hasn't been validated yet
  // (normal on the very first submission after a fresh deploy).
  if (res.status === 200 || res.status === 202) {
    const note =
      res.status === 202 ? " — key validation pending, this is normal on the first run" : "";
    console.log(`✅ ${urlList.length} URLs submitted${label}. HTTP ${res.status}${note}`);
    return;
  }

  const hints: Record<number, string> = {
    400: "Bad request — the JSON body or the key format is wrong.",
    403: `Key rejected. Confirm ${KEY_LOCATION} is live and returns exactly the key.`,
    422: "URLs don't match the host, or the key doesn't match the schema.",
    429: "Rate limited — wait a bit and re-run.",
  };
  console.error(
    `❌ Submission failed${label}. HTTP ${res.status}. ${hints[res.status] ?? ""}\n${body}`,
  );
  process.exitCode = 1;
}

async function main(): Promise<void> {
  console.log(`Reading ${SITEMAP_URL} ...`);
  const all = await fetchSitemapUrls();
  console.log(`Sitemap has ${all.length} URLs.`);

  const urls = filter ? all.filter((u) => u.includes(filter)) : all;
  if (filter) {
    console.log(`Filter "${filter}" matched ${urls.length} URL(s).`);
  }
  if (urls.length === 0) {
    console.error("Nothing to submit — the filter matched no URLs.");
    process.exitCode = 1;
    return;
  }

  assertSameHost(urls);

  if (dryRun) {
    console.log(`\n--dry-run: would POST these ${urls.length} URL(s) to ${ENDPOINT}:\n`);
    for (const u of urls.slice(0, 25)) console.log(`  ${u}`);
    if (urls.length > 25) console.log(`  ... and ${urls.length - 25} more`);
    console.log("\nNothing was sent.");
    return;
  }

  // Verify the key file is actually reachable before we burn a submission on
  // a 403 — the failure mode is otherwise confusing.
  const keyRes = await fetch(KEY_LOCATION);
  const keyBody = keyRes.ok ? (await keyRes.text()).trim() : "";
  if (!keyRes.ok || keyBody !== KEY) {
    console.error(
      `❌ Key file check failed at ${KEY_LOCATION}\n` +
        `   HTTP ${keyRes.status}, body: ${JSON.stringify(keyBody.slice(0, 80))}\n` +
        `   Expected exactly: ${KEY}\n` +
        `   The key file must be deployed to production before submitting.`,
    );
    process.exitCode = 1;
    return;
  }
  console.log("Key file verified.");

  const batchCount = Math.ceil(urls.length / BATCH_SIZE);
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    await submitBatch(urls.slice(i, i + BATCH_SIZE), i / BATCH_SIZE + 1, batchCount);
  }
}

main().catch((err) => {
  console.error(`❌ ${err instanceof Error ? err.message : String(err)}`);
  process.exitCode = 1;
});
