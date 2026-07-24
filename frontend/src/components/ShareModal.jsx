import { useState } from 'react';
import { toast } from 'react-toastify';
import { Copy, Check, Mail, X } from 'lucide-react';
import { FaWhatsapp, FaFacebookF, FaXTwitter } from 'react-icons/fa6';

/**
 * ShareModal
 * Share dialog with copy link + share-intent links for WhatsApp,
 * Facebook, X, and Email.
 */
function ShareModal({ open, onClose, url, title, text }) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy the link.');
    }
  };

  const shareText = `${text} ${url}`;
  const links = [
    {
      label: 'WhatsApp',
      icon: FaWhatsapp,
      href: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      cls: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
    },
    {
      label: 'Facebook',
      icon: FaFacebookF,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      cls: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    },
    {
      label: 'X',
      icon: FaXTwitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      cls: 'bg-stone-100 text-stone-700 hover:bg-stone-200',
    },
    {
      label: 'Email',
      icon: Mail,
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareText)}`,
      cls: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
    },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-stone-900">Share this book</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full bg-stone-100 text-stone-600 transition hover:bg-stone-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-1 text-sm text-stone-600 line-clamp-1">{title}</p>

        <div className="mt-5 grid grid-cols-4 gap-3">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5"
              >
                <span className={`grid h-12 w-12 place-items-center rounded-full transition ${link.cls}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-medium text-stone-600">{link.label}</span>
              </a>
            );
          })}
        </div>

        <div className="mt-6 flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 p-1.5 pl-4">
          <span className="flex-1 truncate text-sm text-stone-500">{url}</span>
          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
              copied
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-teal-700 text-white hover:bg-teal-800'
            }`}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;
