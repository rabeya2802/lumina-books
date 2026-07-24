import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * ScrollToTopButton
 * Floating button that fades in once the page has scrolled past 300px,
 * and smoothly scrolls back to the top when clicked.
 */
function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 300);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-5 left-5 z-50 grid h-12 w-12 place-items-center rounded-full bg-teal-700 text-white shadow-lg shadow-teal-700/30 transition-all duration-300 hover:scale-110 hover:bg-teal-800 active:scale-95 ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
    </button>
  );
}

export default ScrollToTopButton;
