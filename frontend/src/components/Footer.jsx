import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Send } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';

/**
 * Footer
 * Rich, multi-column footer with newsletter signup,
 * quick links, categories and social icons.
 */
function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    // Front-end only demo — wire to backend later
    toast.success('🎉 Thanks for subscribing to the Lumina Books newsletter!');
    setEmail('');
  };

  const year = new Date().getFullYear();

  const columns = [
    {
      title: 'Shop',
      links: [
        { label: 'All Books', to: '/categories' },
        { label: 'Fiction', to: '/categories?genre=Fiction' },
        { label: 'Self-help', to: '/categories?genre=Self-help' },
        { label: 'Productivity', to: '/categories?genre=Productivity' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', to: '/about' },
        { label: 'Contact', to: '/contact' },
        { label: 'FAQ', to: '/faq' },
        { label: 'Cart', to: '/cart' },
      ],
    },
    {
      title: 'Account',
      links: [
        { label: 'Sign In', to: '/login' },
        { label: 'My Orders', to: '/order-history' },
        { label: 'Checkout', to: '/checkout' },
      ],
    },
  ];

  const socials = [
    { label: 'X (Twitter)', icon: FaXTwitter, href: '#' },
    { label: 'Instagram', icon: FaInstagram, href: '#' },
    { label: 'Facebook', icon: FaFacebookF, href: '#' },
    { label: 'LinkedIn', icon: FaLinkedinIn, href: '#' },
  ];

  return (
    <footer className="mt-20 bg-stone-900 text-teal-300">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="container-app grid gap-6 py-10 text-center md:grid-cols-2 md:items-center md:gap-8 md:py-12 md:text-left">
          <div>
            <h3 className="font-display text-3xl font-bold text-white">
              Join the reading circle
            </h3>
            <p className="mx-auto mt-2 max-w-md text-stone-400 md:mx-0">
              Get handpicked book recommendations, new arrivals and exclusive
              offers delivered straight to your inbox.
            </p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-white placeholder-stone-500 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
            />
            <button
              type="submit"
              className="inline-flex w-full flex-shrink-0 items-center justify-center gap-2 rounded-full bg-teal-600 px-6 py-3 font-semibold text-white transition hover:bg-teal-500 active:scale-95 sm:w-auto"
            >
              Subscribe
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-app grid gap-8 py-10 text-center sm:grid-cols-2 sm:gap-10 sm:py-14 sm:text-left lg:grid-cols-5">
        {/* Brand */}
        <div className="sm:col-span-2 lg:col-span-2">
          <Link to="/" className="flex items-center justify-center gap-2 sm:justify-start">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-600 text-white text-xl">
              📚
            </span>
            <span className="font-display text-2xl font-bold text-white">
              Lumina <span className="text-teal-400">Books</span>
            </span>
          </Link>
          <p className="mx-auto mt-2 max-w-sm text-sm italic text-teal-400 sm:mx-0">
            Illuminate Your Mind, One Book at a Time.
          </p>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-stone-400 sm:mx-0">
            Lumina Books is a modern online bookstore built for people who love to
            read. We curate stories that inspire, educate and entertain —
            delivered to your doorstep with care.
          </p>

          <div className="mt-6 flex justify-center gap-3 sm:justify-start">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-base transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-600 hover:text-white hover:shadow-lg hover:shadow-teal-600/20"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              {col.title}
            </h4>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-stone-400 transition hover:text-teal-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-app flex flex-col items-center justify-between gap-4 py-6 text-center text-sm tracking-wide text-stone-500 sm:flex-row sm:py-7 sm:text-left">
          <p>© {year} Lumina Books. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6 font-medium">
            <a href="#" className="transition hover:text-teal-400">Privacy</a>
            <a href="#" className="transition hover:text-teal-400">Terms</a>
            <a href="#" className="transition hover:text-teal-400">Shipping</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
