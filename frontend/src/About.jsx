import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedinIn } from 'react-icons/fa';
import { Database, Layers3, MonitorSmartphone, ShieldCheck } from 'lucide-react';

/**
 * About page
 * Academic project story, goals, values and developer profile.
 */
function About() {
  const values = [
    {
      icon: '✨',
      title: 'User experience',
      desc: 'A clear, intuitive journey helps readers discover books and complete tasks with ease.',
    },
    {
      icon: '🧩',
      title: 'Clean code',
      desc: 'Thoughtful structure and reusable components keep the project maintainable and scalable.',
    },
    {
      icon: '⚡',
      title: 'Performance',
      desc: 'Responsive interactions and efficient data handling support a smooth shopping experience.',
    },
    {
      icon: '🔒',
      title: 'Security',
      desc: 'Authentication and protected admin features are designed with responsible access in mind.',
    },
  ];

  const stats = [
    { icon: MonitorSmartphone, label: 'Responsive Design' },
    { icon: Layers3, label: 'Full-Stack Architecture' },
    { icon: ShieldCheck, label: 'Secure Authentication' },
    { icon: Database, label: 'Database Integration' },
  ];

  return (
    <div className="animate-fade-up">
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-radial">
        <div className="container-app py-16 text-center md:py-24">
          <span className="fancy-divider">The project story</span>
          <h1 className="mx-auto mt-5 max-w-3xl font-display text-4xl font-bold leading-tight text-stone-900 sm:text-5xl lg:text-6xl">
            Building a Better Book Shopping Experience
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-medium italic text-teal-700">
            Illuminate Your Mind, One Book at a Time.
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-stone-600">
            Lumina Books is an academic full-stack e-commerce project developed as part
            of the undergraduate Electrical &amp; Computer Engineering program. The
            goal was to design and develop a modern online bookstore with database
            integration, a responsive UI, and a complete shopping experience.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-stone-200 bg-white">
        <div className="container-app grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <s.icon
                aria-hidden="true"
                className="mx-auto h-10 w-10 text-emerald-700"
                strokeWidth={2.25}
              />
              <p className="mt-1 text-sm uppercase tracking-wider text-stone-500">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="container-app grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2">
        <div>
          <span className="fancy-divider">Project mission</span>
          <h2 className="mt-4 font-display text-3xl font-bold text-stone-900 sm:text-4xl">
            A practical, polished bookstore built for the web
          </h2>
          <p className="mt-5 leading-relaxed text-stone-600">
            Lumina Books was created to demonstrate how modern web technologies can
            come together in a clean, user-friendly, and scalable online bookstore.
            The project focuses on making browsing, account access, and shopping
            feel simple and reliable on every screen size.
          </p>
          <p className="mt-4 leading-relaxed text-stone-600">
            From the interface to the database, each part was designed as a
            hands-on full-stack learning experience with a complete e-commerce
            workflow at its core.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/categories"
              className="rounded-full bg-emerald-700 px-6 py-3 font-semibold text-white transition hover:bg-emerald-800"
            >
              Explore books
            </Link>
            <Link
              to="/contact"
              className="rounded-full border-2 border-emerald-700 px-6 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              Get in touch
            </Link>
          </div>
        </div>
        <div className="relative">
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&q=80"
              alt="Cozy reading corner"
              className="aspect-[4/5] w-full rounded-2xl object-cover shadow-lg"
              loading="lazy"
            />
            <img
              src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80"
              alt="Stack of books"
              className="mt-8 aspect-[4/5] w-full rounded-2xl object-cover shadow-lg"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-stone-200 bg-stone-50">
        <div className="container-app py-16 md:py-24">
          <div className="mb-12 text-center">
            <span className="fancy-divider">Project principles</span>
            <h2 className="mt-4 font-display text-3xl font-bold text-stone-900 sm:text-4xl">
              Our values
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-stone-200 bg-white p-6 card-lift"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-2xl">
                  {v.icon}
                </span>
                <h3 className="mt-4 font-display text-xl font-bold text-stone-900">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer */}
      <section className="container-app py-16 md:py-24">
        <div className="mb-12 text-center">
          <span className="fancy-divider">The person behind Lumina Books</span>
          <h2 className="mt-4 font-display text-3xl font-bold text-stone-900 sm:text-4xl">
            Project developer
          </h2>
        </div>
        <div className="mx-auto max-w-4xl rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8 md:p-10">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
            <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-brand-gradient font-display text-3xl font-bold text-white shadow-lg shadow-teal-700/20">
              RK
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-2xl font-bold text-stone-900">
                    Rabeya Khatun
                  </h3>
                  <p className="mt-1 font-medium text-emerald-700">Full-Stack Developer</p>
                </div>
                <div className="flex gap-2">
                  <a
                    href="https://github.com/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="GitHub profile"
                    className="grid h-10 w-10 place-items-center rounded-full border border-stone-200 text-stone-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <FaGithub className="h-4 w-4" />
                  </a>
                  <a
                    href="https://www.linkedin.com/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="LinkedIn profile"
                    className="grid h-10 w-10 place-items-center rounded-full border border-stone-200 text-stone-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <FaLinkedinIn className="h-4 w-4" />
                  </a>
                </div>
              </div>
              <dl className="mt-6 grid gap-4 border-y border-stone-100 py-5 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-stone-500">Department</dt>
                  <dd className="mt-1 font-semibold text-stone-900">Electrical &amp; Computer Engineering (ECE)</dd>
                </div>
                <div>
                  <dt className="text-stone-500">Institution</dt>
                  <dd className="mt-1 font-semibold text-stone-900">Rajshahi University of Engineering &amp; Technology (RUET), Bangladesh</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-stone-500">Project</dt>
                  <dd className="mt-1 font-semibold text-stone-900">Lumina Books – A Full-Stack Online Bookstore E-Commerce Platform</dd>
                </div>
              </dl>
              <p className="mt-5 leading-relaxed text-stone-600">
                Designed and developed the complete application independently, including the
                frontend, backend, database integration, authentication, shopping cart,
                wishlist, reviews, responsive user interface, and admin dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-app pb-16 md:pb-24">
        <div className="rounded-3xl bg-brand-gradient px-8 py-14 text-center text-white shadow-xl">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Experience the project
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-emerald-50">
            Explore Lumina Books and see a complete online bookstore experience in action.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/login"
              className="rounded-full bg-white px-8 py-4 font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              Create an account
            </Link>
            <Link
              to="/categories"
              className="rounded-full border-2 border-white/80 px-8 py-4 font-semibold text-white transition hover:bg-white/10"
            >
              Browse Books
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
