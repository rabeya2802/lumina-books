import { useState } from 'react';
import api from './services/api';
import { toast } from 'react-toastify';
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Send,
  CheckCircle2,
  Clock,
  Headset,
  ArrowRight,
  Share2,
} from 'lucide-react';

/** Minimal brand-mark SVGs — lucide intentionally ships no logo icons. */
const SocialIcons = {
  facebook: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.44 2.91h-2.34v7.03C18.34 21.24 22 17.08 22 12.06z" />
    </svg>
  ),
  instagram: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  linkedin: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M6.94 8.5H3.56V20.5H6.94V8.5ZM5.25 3.5A1.97 1.97 0 1 0 5.25 7.44 1.97 1.97 0 0 0 5.25 3.5ZM20.5 20.5H17.13V14.63C17.13 13.21 17.1 11.39 15.14 11.39C13.15 11.39 12.84 12.93 12.84 14.53V20.5H9.46V8.5H12.7V10H12.75C13.2 9.14 14.31 8.23 15.97 8.23C19.39 8.23 20.5 10.45 20.5 13.75V20.5Z" />
    </svg>
  ),
  x: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.24 3H21l-6.6 7.54L22 21h-6.18l-4.84-6.32L5.4 21H2.6l7.06-8.07L2 3h6.34l4.37 5.78L18.24 3Zm-1.08 16.2h1.53L7.9 4.7H6.26l10.9 14.5Z" />
    </svg>
  ),
};

/**
 * Contact page
 * - Contact info cards (email, phone, address, hours)
 * - Contact form with front-end validation + success state
 * - Social links
 */
function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/api/contact', form);
      setSent(true);
      toast.success('✅ Thanks! Your message has been sent.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Could not send your message. Please try again.'
      );
    } finally {
      setSending(false);
    }
  };

  const info = [
    {
      icon: Mail,
      title: 'Email us',
      lines: ['rabeya2802@gmail.com'],
      href: 'mailto:rabeya2802@gmail.com',
    },
    {
      icon: Phone,
      title: 'Call us',
      lines: ['01402-827287'],
      href: 'tel:+8801402827287',
    },
    {
      icon: MapPin,
      title: 'Visit us',
      lines: ['Talaimari', 'Rajshahi'],
      href: 'https://www.google.com/maps/search/?api=1&query=Talaimari%2C+Rajshahi',
    },
    {
      icon: MessageCircle,
      title: 'Live chat',
      lines: ['Average reply: 2 min', 'Available 24/7'],
      href: '#',
    },
  ];

  const socials = [
    { key: 'x', label: 'X (Twitter)' },
    { key: 'instagram', label: 'Instagram' },
    { key: 'facebook', label: 'Facebook' },
    { key: 'linkedin', label: 'LinkedIn' },
  ];

  return (
    <div className="animate-fade-up">
      {/* Hero — compact, self-contained, never overlaps content below */}
      <section className="relative overflow-hidden bg-hero-radial">
        <div className="container-app relative z-10 py-10 text-center md:py-14">
          <span className="fancy-divider">We are here to help</span>
          <h1 className="mx-auto mt-4 max-w-3xl font-display text-3xl font-bold leading-tight text-stone-900 sm:text-4xl lg:text-5xl">
            Get in <span className="text-teal-700">touch</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-stone-600">
            Questions about an order, a book recommendation, or a partnership?
            Our team usually replies within a few hours.
          </p>
        </div>
      </section>

      {/* Info cards — normal document flow, no negative margins */}
      <section className="container-app grid gap-5 pb-14 pt-10 sm:grid-cols-2 md:pt-12 lg:grid-cols-4">
        {info.map((c) => (
          <a
            key={c.title}
            href={c.href}
            target={c.href.startsWith('http') ? '_blank' : undefined}
            rel={c.href.startsWith('http') ? 'noreferrer' : undefined}
            className="card-lift flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-colors hover:border-teal-200"
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-teal-50 text-teal-700">
              <c.icon className="h-5 w-5" strokeWidth={2} />
            </span>
            <h3 className="mt-4 font-display text-lg font-bold text-stone-900">
              {c.title}
            </h3>
            <div className="mt-1 space-y-0.5">
              {c.lines.map((line) => (
                <p key={line} className="text-sm text-stone-600">
                  {line}
                </p>
              ))}
            </div>
          </a>
        ))}
      </section>

      {/* Form + sidebar */}
      <section className="container-app grid gap-10 pb-20 pt-2 md:pb-24 lg:grid-cols-[1fr_380px]">
        {/* Form */}
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="font-display text-2xl font-bold text-stone-900 sm:text-3xl">
            Send us a message
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            Fill out the form below and we'll get back to you shortly.
          </p>

          {sent ? (
            <div className="mt-6 rounded-2xl border-2 border-dashed border-teal-300 bg-teal-50 p-8 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-teal-700 text-white">
                <CheckCircle2 className="h-7 w-7" />
              </span>
              <h3 className="mt-4 font-display text-2xl font-bold text-teal-700">
                Message sent!
              </h3>
              <p className="mt-2 text-sm text-teal-800">
                Thanks for reaching out. We'll reply to your email within 24 hours.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-6 rounded-full bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-stone-700">
                    Full name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Jane Doe"
                    className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-stone-700">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="jane@example.com"
                    className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-stone-700">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-stone-700">
                  Message *
                </label>
                <textarea
                  name="message"
                  required
                  rows="5"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us more…"
                  className="w-full resize-y rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={sending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-teal-700 px-6 py-3.5 font-semibold text-white transition hover:bg-teal-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {sending ? (
                  'Sending…'
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send message
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Customer support */}
          <div className="rounded-3xl bg-brand-gradient p-7 text-white shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/15">
                <Headset className="h-5 w-5" />
              </span>
              <h3 className="font-display text-xl font-bold">Customer support</h3>
            </div>
            <ul className="mt-5 space-y-2.5 text-sm text-teal-50">
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0" />
                rabeya2802@gmail.com
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 shrink-0" />
                Average reply: under 2 hours
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircle className="h-4 w-4 shrink-0" />
                Live chat available 24/7
              </li>
            </ul>
            <a
              href="mailto:rabeya2802@gmail.com"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
            >
              Email support
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* Office hours */}
          <div className="rounded-3xl border border-stone-200 bg-white p-7">
            <div className="flex items-center gap-2.5">
              <Clock className="h-5 w-5 text-teal-700" />
              <h3 className="font-display text-xl font-bold text-stone-900">
                Office hours
              </h3>
            </div>
            <ul className="mt-4 space-y-0 text-sm text-stone-600">
              <li className="flex items-center justify-between border-b border-stone-100 py-2.5">
                <span>Mon – Fri</span>
                <span className="font-semibold text-stone-900">9:00 – 18:00</span>
              </li>
              <li className="flex items-center justify-between border-b border-stone-100 py-2.5">
                <span>Saturday</span>
                <span className="font-semibold text-stone-900">10:00 – 16:00</span>
              </li>
              <li className="flex items-center justify-between py-2.5">
                <span>Sunday</span>
                <span className="font-semibold text-red-500">Closed</span>
              </li>
            </ul>
          </div>

          {/* Follow us */}
          <div className="rounded-3xl border border-stone-200 bg-white p-7">
            <div className="flex items-center gap-2.5">
              <Share2 className="h-5 w-5 text-teal-700" />
              <h3 className="font-display text-xl font-bold text-stone-900">
                Follow us
              </h3>
            </div>
            <p className="mt-2 text-sm text-stone-600">
              Bookish updates, giveaways and more.
            </p>
            <div className="mt-4 flex gap-3">
              {socials.map(({ key, label }) => {
                const Icon = SocialIcons[key];
                return (
                  <a
                    key={key}
                    href="#"
                    aria-label={label}
                    className="grid h-10 w-10 place-items-center rounded-full bg-stone-100 text-stone-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-600 hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

export default Contact;
