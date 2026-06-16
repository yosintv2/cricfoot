import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | CricFoot',
  description: 'CricFoot privacy policy — how we collect, use and protect your information, including cookies, Google Analytics, and Google AdSense.',
  alternates: { canonical: '/privacy/' },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="seo-section" style={{ maxWidth: 760, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy)', marginBottom: 6 }}>
        Privacy Policy
      </h1>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 28 }}>
        Last updated: June 2026
      </p>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>1. Who We Are</h2>
        <p>
          CricFoot (<strong>cricfoot.net</strong>) is a free football TV guide that lists match schedules,
          kick-off times, and the TV channels broadcasting each fixture worldwide. We do not stream or
          broadcast any content. If you have questions about this policy, contact us at{' '}
          <a href="mailto:mail.yosintv@gmail.com" style={{ color: 'var(--navy)' }}>mail.yosintv@gmail.com</a>.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>2. Information We Collect</h2>
        <p>We do not collect or store any personal information directly. However, third-party services
        we use (detailed below) may collect certain data automatically:</p>
        <ul style={{ paddingLeft: 20, marginTop: 10, lineHeight: 1.8 }}>
          <li><strong>Usage data</strong> — pages visited, time on site, browser type, device type, and approximate location (country/city level), collected via Google Analytics.</li>
          <li><strong>Advertising data</strong> — ad impressions and clicks, collected by Google AdSense to serve relevant ads.</li>
          <li><strong>Cookies</strong> — small text files stored in your browser by us and third-party services (see Section 4).</li>
        </ul>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>3. How We Use Information</h2>
        <ul style={{ paddingLeft: 20, lineHeight: 1.8 }}>
          <li>To understand how visitors use the site (analytics).</li>
          <li>To serve relevant advertisements that support the free service.</li>
          <li>To improve site performance and content.</li>
        </ul>
        <p style={{ marginTop: 10 }}>We do not sell, rent, or share personal data with third parties for their own marketing purposes.</p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>4. Cookies</h2>
        <p>We use the following types of cookies:</p>
        <div style={{ overflowX: 'auto', marginTop: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-section)' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Cookie</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Provider</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-lt)' }}>cookie-consent</td>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-lt)' }}>CricFoot</td>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-lt)' }}>Stores your cookie consent preference</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-lt)' }}>_ga, _gid</td>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-lt)' }}>Google Analytics</td>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-lt)' }}>Track site usage and visitor statistics</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-lt)' }}>__gads, DSID</td>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-lt)' }}>Google AdSense</td>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-lt)' }}>Serve and measure relevant advertisements</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 12 }}>
          You can manage or disable cookies at any time via your browser settings or by clicking
          &ldquo;Decline&rdquo; on our cookie banner. Note that disabling certain cookies may affect
          site functionality.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>5. Google Analytics</h2>
        <p>
          We use Google Analytics 4 (GA4) to understand how visitors interact with the site. GA4
          collects anonymised usage data. We use Google&apos;s Consent Mode so that tracking is only
          activated after you accept cookies. You can opt out of Google Analytics tracking by installing
          the{' '}
          <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--navy)' }}>
            Google Analytics Opt-out Browser Add-on
          </a>.
          Google&apos;s privacy policy:{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--navy)' }}>
            policies.google.com/privacy
          </a>.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>6. Google AdSense</h2>
        <p>
          CricFoot uses Google AdSense to display advertisements. Google AdSense may use cookies and
          web beacons to serve ads based on your prior visits to this and other websites. You can opt
          out of personalised advertising by visiting{' '}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--navy)' }}>
            Google Ads Settings
          </a>{' '}
          or{' '}
          <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--navy)' }}>
            aboutads.info
          </a>.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>7. Third-Party Links</h2>
        <p>
          CricFoot links to broadcaster websites. These third-party sites have their own privacy
          policies and we are not responsible for their content or practices. We recommend reviewing
          the privacy policy of any site you visit.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>8. Your Rights (GDPR)</h2>
        <p>If you are located in the European Economic Area (EEA), you have the right to:</p>
        <ul style={{ paddingLeft: 20, lineHeight: 1.8, marginTop: 10 }}>
          <li>Access personal data we hold about you</li>
          <li>Request correction or deletion of your data</li>
          <li>Object to or restrict processing</li>
          <li>Withdraw consent at any time (by declining cookies)</li>
          <li>Lodge a complaint with your local data protection authority</li>
        </ul>
        <p style={{ marginTop: 10 }}>
          To exercise any of these rights, contact us at{' '}
          <a href="mailto:mail.yosintv@gmail.com" style={{ color: 'var(--navy)' }}>mail.yosintv@gmail.com</a>.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>9. Children&apos;s Privacy</h2>
        <p>
          CricFoot is not directed at children under 13. We do not knowingly collect personal
          information from children. If you believe a child has provided personal data, please contact
          us and we will take steps to delete it.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>10. Changes to This Policy</h2>
        <p>
          We may update this policy from time to time. Changes will be posted on this page with an
          updated date. Continued use of the site after changes constitutes acceptance.
        </p>
      </section>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, marginTop: 8 }}>
        <Link href="/" style={{ color: 'var(--navy)', fontWeight: 600 }}>← Back to CricFoot</Link>
      </div>
    </div>
  );
}
