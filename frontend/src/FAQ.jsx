import { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * FAQ page
 * - Searchable, categorized accordion of common questions
 * - CTA to contact for further help
 */
function FAQ() {
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);

  const categories = [
    {
      name: 'Orders & Shipping',
      questions: [
        {
          id: 'q1',
          q: 'How long does delivery take?',
          a: 'Standard delivery takes 3–5 business days within India and 7–14 days internationally. You will receive a tracking link by email once your order ships.',
        },
        {
          id: 'q2',
          q: 'How much does shipping cost?',
          a: 'Shipping is free on all orders above ৳999. For orders below that, a flat shipping fee of ৳49 applies within Bangladesh.',
        },
        {
          id: 'q3',
          q: 'Do you ship internationally?',
          a: 'Yes! We ship to over 120 countries. International shipping costs are calculated at checkout based on your destination and order weight.',
        },
        {
          id: 'q4',
          q: 'Can I track my order?',
          a: "Absolutely. Once your order ships, you'll get an email with a tracking number. You can also view live status under My Orders after signing in.",
        },
      ],
    },
    {
      name: 'Returns & Refunds',
      questions: [
        {
          id: 'q5',
          q: 'What is your return policy?',
          a: 'We accept returns within 7 days of delivery for books in their original condition. Just initiate a return from My Orders or contact support.',
        },
        {
          id: 'q6',
          q: 'When will I get my refund?',
          a: 'Refunds are processed within 3–5 business days after we receive the returned item. The amount will reflect in your original payment method.',
        },
        {
          id: 'q7',
          q: 'I received a damaged book. What do I do?',
          a: "We're so sorry! Please email support@bookhub.com with your order ID and a photo within 48 hours of delivery, and we'll send a replacement at no cost.",
        },
      ],
    },
    {
      name: 'Account & Payments',
      questions: [
        {
          id: 'q8',
          q: 'How do I create an account?',
          a: 'Click "Sign in" at the top right, then choose "Sign Up". You will need a valid email address — we will send a verification code to activate your account.',
        },
        {
          id: 'q9',
          q: 'What payment methods do you accept?',
          a: 'We accept all major credit/debit cards, UPI, net banking, and popular wallets. All transactions are secured with industry-standard encryption.',
        },
        {
          id: 'q10',
          q: 'Is my payment information safe?',
          a: 'Yes. We never store your full card details on our servers. Payments are processed by PCI-DSS compliant payment gateways.',
        },
        {
          id: 'q11',
          q: 'I forgot my password. How do I reset it?',
          a: 'On the login page, click "Forgot Password?", enter your email, and follow the OTP-based reset flow to set a new password.',
        },
      ],
    },
    {
      name: 'Books & Catalog',
      questions: [
        {
          id: 'q12',
          q: 'How often do you add new books?',
          a: 'Our curation team adds new titles every week. Subscribe to our newsletter to be the first to know about new arrivals and exclusive offers.',
        },
        {
          id: 'q13',
          q: 'Can I request a book that is not listed?',
          a: 'Yes! Use our Contact page to send us the title and author. We will do our best to source it for you and notify you when available.',
        },
      ],
    },
  ];

  // Flatten for search
  const allQuestions = categories.flatMap((c) =>
    c.questions.map((item) => ({ ...item, category: c.name }))
  );

  const filtered = query
    ? allQuestions.filter(
        (item) =>
          item.q.toLowerCase().includes(query.toLowerCase()) ||
          item.a.toLowerCase().includes(query.toLowerCase())
      )
    : null;

  const toggle = (id) => setOpenId((cur) => (cur === id ? null : id));

  return (
    <div className="animate-fade-up">
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-radial">
        <div className="container-app py-16 text-center md:py-24">
          <span className="fancy-divider">Help center</span>
          <h1 className="mx-auto mt-5 max-w-3xl font-display text-4xl font-bold leading-tight text-stone-900 sm:text-5xl lg:text-6xl">
            Frequently asked <span className="text-emerald-700">questions</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-stone-600">
            Everything you need to know about ordering, shipping, returns and
            more. Can't find an answer? We're a message away.
          </p>

          {/* Search */}
          <div className="mx-auto mt-8 max-w-xl">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search questions…"
                className="w-full rounded-full border border-stone-200 bg-white py-4 pl-12 pr-4 text-sm shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                🔍
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container-app py-16 md:py-24">
        {filtered ? (
          /* Search results */
          <div className="mx-auto max-w-3xl">
            <p className="mb-6 text-sm text-stone-600">
              {filtered.length} result(s) for "<strong>{query}</strong>"
            </p>
            {filtered.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-stone-200 bg-white p-10 text-center">
                <p className="text-4xl">🤔</p>
                <p className="mt-3 font-semibold text-stone-700">No matches found</p>
                <p className="text-stone-500">Try a different keyword.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((item) => (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-stone-200 bg-white"
                  >
                    <button
                      onClick={() => toggle(item.id)}
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    >
                      <span className="font-semibold text-stone-900">{item.q}</span>
                      <span
                        className={`grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700 transition-transform ${
                          openId === item.id ? 'rotate-45' : ''
                        }`}
                      >
                        +
                      </span>
                    </button>
                    {openId === item.id && (
                      <div className="border-t border-stone-100 px-6 py-5 text-sm leading-relaxed text-stone-600">
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Categorized accordions */
          <div className="mx-auto max-w-3xl space-y-12">
            {categories.map((cat) => (
              <div key={cat.name}>
                <h2 className="mb-5 flex items-center gap-3 font-display text-2xl font-bold text-stone-900">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  {cat.name}
                </h2>
                <div className="space-y-4">
                  {cat.questions.map((item) => (
                    <div
                      key={item.id}
                      className="overflow-hidden rounded-2xl border border-stone-200 bg-white"
                    >
                      <button
                        onClick={() => toggle(item.id)}
                        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                      >
                        <span className="font-semibold text-stone-900">{item.q}</span>
                        <span
                          className={`grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700 transition-transform ${
                            openId === item.id ? 'rotate-45' : ''
                          }`}
                        >
                          +
                        </span>
                      </button>
                      {openId === item.id && (
                        <div className="border-t border-stone-100 px-6 py-5 text-sm leading-relaxed text-stone-600">
                          {item.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="container-app pb-16 md:pb-24">
        <div className="rounded-3xl border border-stone-200 bg-white p-10 text-center shadow-sm">
          <p className="text-4xl">Still have questions? 💌</p>
          <h2 className="mt-3 font-display text-2xl font-bold text-stone-900 sm:text-3xl">
            Our support team is happy to help
          </h2>
          <p className="mx-auto mt-2 max-w-md text-stone-600">
            Reach out and we'll get back to you within a few hours.
          </p>
          <Link
            to="/contact"
            className="mt-6 inline-block rounded-full bg-emerald-700 px-8 py-3.5 font-semibold text-white transition hover:bg-emerald-800"
          >
            Contact us
          </Link>
        </div>
      </section>
    </div>
  );
}

export default FAQ;