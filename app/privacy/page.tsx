import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: "Privacy Policy | Private Travel Costa Rica",
  description: "How Private Travel Costa Rica collects, uses, and protects your personal information.",
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "May 12, 2026";

export default function PrivacyPolicyPage() {
  const business = siteConfig.business;

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <section className="pt-28 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 mb-6"
          >
            <ArrowLeft size={14} />
            Back to Home
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-amber-400" size={28} />
            <h1 className="text-3xl md:text-4xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-xs text-gray-500 mb-10">Last updated: {LAST_UPDATED}</p>

          <div className="space-y-8 text-gray-300 leading-relaxed">
            <section>
              <p>
                {siteConfig.name} (&quot;we&quot;, &quot;us&quot;) respects your privacy. This policy explains
                what personal information we collect when you visit{" "}
                <Link href="/" className="text-amber-400 hover:text-amber-300">
                  {siteConfig.siteUrl}
                </Link>{" "}
                or book one of our private shuttle services, why we collect it, how we use it, and
                the choices you have about it.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">1. Information we collect</h2>
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
                We <strong>never see</strong> the full card number, expiration date, or CVV — those go
                straight to Tilopay&apos;s PCI-compliant gateway.
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
              <h2 className="text-xl font-bold text-white mb-3">2. How we use it</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>To provide the shuttle service you booked (assign a driver, coordinate pickup).</li>
                <li>To send booking confirmations, pickup reminders, and post-trip follow-ups by email and WhatsApp.</li>
                <li>To process payments.</li>
                <li>To improve the site (which routes are most searched, where visitors drop off in the booking flow).</li>
                <li>To comply with legal obligations (tax records, accounting).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">3. Who we share it with</h2>
              <p className="mb-2">
                We do not sell your personal data. We share it only with the service providers that
                make the booking possible:
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
              <h2 className="text-xl font-bold text-white mb-3">4. Cookies and tracking</h2>
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
                or by clearing the <code className="text-amber-300">ptcr_cookie_consent</code> key
                in localStorage and reloading.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">5. How long we keep it</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Booking records: <strong>7 years</strong> (Costa Rican tax requirement).</li>
                <li>Analytics data: <strong>14 months</strong> (Google Analytics default).</li>
                <li>Cookie consent choice: <strong>12 months</strong>, then we ask again.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">6. Your rights</h2>
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
                To exercise any of these, write to <a className="text-amber-400 hover:text-amber-300" href={`mailto:${business.email}`}>{business.email}</a> from the same email address you used to book. We respond within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">7. Children</h2>
              <p>
                Our services are intended for adults booking on behalf of themselves or their
                travel group, which may include children. We do not knowingly collect personal data
                directly from anyone under 16. If you believe a child has submitted information,
                please contact us and we will delete it.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">8. International transfers</h2>
              <p>
                Some of our service providers (Supabase, Resend, Vercel, Google) process data in the
                United States. By using the site, you consent to your personal data being processed
                outside Costa Rica or your country of residence, with the protections offered by
                each provider&apos;s privacy program.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">9. Changes to this policy</h2>
              <p>
                We may update this policy occasionally. When we do, we&apos;ll change the
                &quot;Last updated&quot; date at the top. Material changes will be flagged via
                a notice on the site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">10. Contact</h2>
              <p>
                Questions about this policy or your data?{" "}
                <a className="text-amber-400 hover:text-amber-300" href={`mailto:${business.email}`}>{business.email}</a>{" "}
                or WhatsApp{" "}
                <a className="text-amber-400 hover:text-amber-300" href={business.whatsappUrl} target="_blank" rel="noopener noreferrer">
                  {business.phone}
                </a>.
              </p>
              <p className="mt-3 text-sm text-gray-400">
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
