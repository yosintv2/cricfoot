export interface FaqItem {
  q: string;
  a: string;
}

// Server-rendered FAQ accordion (native <details>, no JS) with FAQPage
// JSON-LD so the questions are eligible for rich results.
export default function Faq({ title = 'Frequently Asked Questions', items }: { title?: string; items: FaqItem[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };

  return (
    <section className="faq-section" aria-label={title}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h2 className="section-heading">
        <div className="accent-bar" />
        {title}
      </h2>
      {items.map(({ q, a }) => (
        <details key={q} className="faq-item">
          <summary className="faq-q">{q}</summary>
          <p className="faq-a">{a}</p>
        </details>
      ))}
    </section>
  );
}
