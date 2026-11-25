import type { Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Private Travel Costa Rica collects, uses, and protects your personal information.",
  keywords: [
    "privacy policy",
    "Private Travel CR privacy",
    "data protection shuttle Costa Rica",
  ],
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy | Private Travel CR",
    description:
      "How we collect, use, and protect your personal information at Private Travel CR.",
    url: `${siteConfig.siteUrl}/privacy`,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Private Travel CR Privacy Policy",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | Private Travel CR",
    description: "How we handle your data.",
  },
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "November 25, 2026";

export default function PrivacyPolicyPage() {
  const business = siteConfig.business;

  return (
    <main className="min-h-screen bg-white text-slate-600">
      <Navbar />
      <section className="pt-28 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 mb-6"
          >
            <ArrowLeft size={14} />
            Back to Home
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-orange-600" size={28} />
            <h1 className="text-3xl md:text-4xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-xs text-slate-500 mb-10">Last updated: {LAST_UPDATED}</p>

          <div className="space-y-8 text-slate-600 leading-relaxed">
            <section>
              <p>
                {siteConfig.name} (&quot;we&quot;, &quot;us&quot;) respects your privacy. This policy explains
                what personal information we collect when you visit{" "}
                <Link href="/" className="text-orange-600 hover:text-orange-700">
                  {siteConfig.siteUrl}
                </Link>{" "}
                or book one of our private shuttle services, why we collect it, how we use it, and
                the choices you have about it.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-3">1. Information we collect</h2>
              <p className="mb-2">When you book a trip we ask for:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Full name, email address, phone number (with country code)</li>
                <li>Pickup and drop-off addresses, travel date, time, passenger count</li>
                <li>Flight number and arrival time (for airport pickups)</li>
                <li>Any special requests you choose to share (child seats, accessibility needs, etc.)</li>
              </ul>
              <p className="mt-3 mb-2">When you pay we collect, through our payment processor (Tilopay):</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Last four digits of the card and an authorization code</li>
                <li>Transaction ID and amount</li>
              </ul>
              <p className="mt-3">
                We <strong>never see and never store</strong>{" "}the full card number, the expiration
                date, or the security code (CVV). Those details are typed directly into the payment
                processor&apos;s PCI-DSS compliant gateway and never reach our servers, our database,
                or our staff. The only card information we retain is the last four digits and the
                authorization code, which we need in order to identify the transaction and to issue
                a refund if one is due.
              </p>
              <p className="mt-3 mb-2">When you browse the site we collect (via cookies and analytics):</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>IP address and approximate location (country/region)</li>
                <li>Browser, device, and operating system</li>
                <li>Pages visited, time on page, referring site</li>
                <li>Search and route preferences (origin/destination pairs you query)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-3">2. How we use it</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>To provide the shuttle service you booked (assign a driver, coordinate pickup).</li>
                <li>To send booking confirmations, pickup reminders, and post-trip follow-ups by email and WhatsApp.</li>
                <li>To process payments.</li>
                <li>To improve the site (which routes are most searched, where visitors drop off in the booking flow).</li>
                <li>To comply with legal obligations (tax records, accounting).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-3">3. Who we share it with</h2>
              <p className="mb-2">
                We do not sell, rent, trade, or otherwise commercialize your personal data, and we
                do not share or transfer it to third parties without your authorization or a
                corresponding legal basis. We share it only with the service providers strictly
                necessary to deliver the service you booked, each of whom may use it for that
                purpose alone:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Tilopay</strong> — payment processing (Costa Rica).</li>
                <li><strong>Supabase</strong> — database hosting (United States).</li>
                <li><strong>Resend</strong> — transactional email delivery (United States).</li>
                <li><strong>Vercel</strong> — site hosting and basic analytics (United States).</li>
                <li><strong>Google Analytics</strong> — site analytics (when consent is given).</li>
                <li><strong>Our drivers</strong> — only the trip-specific info needed to do the pickup (name, pickup address, time, flight number, contact phone).</li>
              </ul>
              <p className="mt-3">
                We may also disclose information if required by Costa Rican law or to defend our
                legal rights.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-3">4. How we protect it</h2>
              <p className="mb-2">
                We apply the following security measures to protect your personal information
                against loss, misuse, and unauthorized access, alteration, or disclosure:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <strong>Encryption in transit.</strong> The entire site is served over HTTPS
                  (TLS). Everything you submit in the booking form travels encrypted between your
                  device and our servers.
                </li>
                <li>
                  <strong>Encryption at rest.</strong> Our database encrypts stored data, and
                  backups are encrypted as well.
                </li>
                <li>
                  <strong>Card data never touches our systems.</strong>{" "}Payments are processed
                  entirely inside the payment gateway&apos;s PCI-DSS certified environment. We do
                  not store the full card number, the expiration date, or the CVV at any point.
                </li>
                <li>
                  <strong>Access control.</strong>{" "}Access to booking records is limited to
                  authorized personnel through individual accounts with strong authentication, and
                  row-level security rules in the database prevent one customer&apos;s records from
                  being read by another.
                </li>
                <li>
                  <strong>Minimum necessary disclosure.</strong> Drivers receive only the
                  trip-specific details needed to perform the pickup — never any payment
                  information.
                </li>
                <li>
                  <strong>Vetted providers.</strong> We rely on established infrastructure
                  providers with their own recognized security programs, and we keep our software
                  and its dependencies up to date.
                </li>
                <li>
                  <strong>Retention limits.</strong> We keep personal data only for as long as
                  described in section 6 below, and delete or anonymize it afterwards.
                </li>
              </ul>
              <p className="mt-3">
                No system can be guaranteed to be perfectly secure. If we ever become aware of a
                breach affecting your personal data, we will notify you and the competent
                authorities as required by Costa Rican law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-3">5. Cookies and tracking</h2>
              <p className="mb-2">We use two kinds of cookies / similar storage:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <strong>Essential.</strong> Required for the site to work — for example, your
                  shopping cart, your language preference, and your cookie-consent choice. These
                  cannot be turned off.
                </li>
                <li>
                  <strong>Analytics.</strong> Vercel Analytics and (if consent is given) Google
                  Analytics 4. They help us see which pages are popular and where visitors get
                  stuck.
                </li>
              </ul>
              <p className="mt-3">
                You can decline analytics cookies from the banner that appears on your first visit,
                or by clearing the <code className="text-orange-600">ptcr_cookie_consent</code> key
                in localStorage and reloading.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-3">6. How long we keep it</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Booking records: <strong>7 years</strong> (Costa Rican tax requirement).</li>
                <li>Analytics data: <strong>14 months</strong> (Google Analytics default).</li>
                <li>Cookie consent choice: <strong>12 months</strong>, then we ask again.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-3">7. Your rights</h2>
              <p className="mb-2">
                Wherever you live, you can ask us to:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Send you a copy of the personal data we hold about you.</li>
                <li>Correct anything that&apos;s wrong.</li>
                <li>Delete your data (subject to the legal retention rules above).</li>
                <li>Stop sending you marketing communications.</li>
              </ul>
              <p className="mt-3">
                If you&apos;re in the EU/UK, you also have the rights under GDPR / UK GDPR, including
                the right to lodge a complaint with your local data-protection authority.
              </p>
              <p className="mt-3">
                To exercise any of these, write to <a className="text-orange-600 hover:text-orange-700" href={`mailto:${business.email}`}>{business.email}</a> from the same email address you used to book. We respond within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-3">8. Children</h2>
              <p>
                Our services are intended for adults booking on behalf of themselves or their
                travel group, which may include children. We do not knowingly collect personal data
                directly from anyone under 16. If you believe a child has submitted information,
                please contact us and we will delete it.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-3">9. International transfers</h2>
              <p>
                Some of our service providers (Supabase, Resend, Vercel, Google) process data in the
                United States. By using the site, you consent to your personal data being processed
                outside Costa Rica or your country of residence, with the protections offered by
                each provider&apos;s privacy program.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-3">10. Changes to this policy</h2>
              <p>
                We may update this policy occasionally. When we do, we&apos;ll change the
                &quot;Last updated&quot; date at the top. Material changes will be flagged via
                a notice on the site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 mb-3">11. Contact</h2>
              <p>
                Questions about this policy or your data?{" "}
                <a className="text-orange-600 hover:text-orange-700" href={`mailto:${business.email}`}>{business.email}</a>{" "}
                or WhatsApp{" "}
                <a className="text-orange-600 hover:text-orange-700" href={business.whatsappUrl} target="_blank" rel="noopener noreferrer">
                  {business.phone}
                </a>.
              </p>
              <p className="mt-3 text-sm text-slate-500">
                {siteConfig.name} · {business.address.city}, {business.address.region}, {business.address.countryName}
              </p>
            </section>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
