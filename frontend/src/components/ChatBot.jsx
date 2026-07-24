import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * ChatBot
 * A lightweight bookstore assistant that answers common FAQs about
 * orders, shipping, returns, payments, and contact — using a simple
 * keyword-matching engine (no external API needed).
 *
 * Renders as a floating button + slide-up panel in the bottom-right.
 */
function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Hi! I'm Lumina Books Assistant 🤖 — ask me about orders, shipping, returns, payments, or anything else!",
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const sendMessage = (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;

    setMessages((m) => [...m, { role: 'user', text: userMsg }]);
    setInput('');
    setTyping(true);

    // Simulate thinking delay for a natural feel
    setTimeout(() => {
      const reply = getReply(userMsg);
      setMessages((m) => [...m, { role: 'bot', text: reply.text, links: reply.links }]);
      setTyping(false);
    }, 600 + Math.random() * 500);
  };

  // Quick-reply chips shown when the chat opens
  const quickReplies = [
    'How long does delivery take?',
    'What is your return policy?',
    'How do I track my order?',
    'How do I contact support?',
  ];

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-teal-700 text-2xl text-white shadow-lg shadow-teal-700/30 transition hover:scale-110 hover:bg-teal-800 active:scale-95"
          aria-label="Open chat assistant"
        >
          💬
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[520px] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between bg-brand-gradient px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-lg">
                🤖
              </span>
              <div>
                <p className="font-display text-base font-bold">Lumina Books Assistant</p>
                <p className="text-xs text-teal-100">Online · usually replies instantly</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto bg-stone-50 p-4"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === 'user'
                      ? 'rounded-br-sm bg-teal-700 text-white'
                      : 'rounded-bl-sm bg-white text-stone-700 shadow-sm'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  {msg.links && msg.links.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {msg.links.map((link, li) => (
                        <Link
                          key={li}
                          to={link.to}
                          onClick={() => setOpen(false)}
                          className="inline-block rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 transition hover:bg-teal-100"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-stone-300 [animation-delay:0ms]"></span>
                    <span className="h-2 w-2 animate-bounce rounded-full bg-stone-300 [animation-delay:150ms]"></span>
                    <span className="h-2 w-2 animate-bounce rounded-full bg-stone-300 [animation-delay:300ms]"></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick replies (only on first message) */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 border-t border-stone-100 px-4 py-3">
              {quickReplies.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="rounded-full border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-2 border-t border-stone-100 p-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question…"
              className="flex-1 rounded-full border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-teal-700 text-lg text-white transition hover:bg-teal-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send message"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}

/**
 * Keyword-based FAQ engine.
 * Returns a reply object with text + optional navigation links.
 */
function getReply(query) {
  const q = query.toLowerCase();

  // ---- Orders & tracking ----
  if (q.includes('track') || q.includes('my order') || q.includes('order status') || q.includes('where is my')) {
    return {
      text: "You can track your order in My Orders. After signing in, go to Order History and click on any order to see its status (Pending → Processing → Shipped → Delivered).",
      links: [{ label: '📦 My Orders', to: '/order-history' }],
    };
  }

  // ---- Delivery time ----
  if (q.includes('delivery') || q.includes('how long') || q.includes('shipping time') || q.includes('arrive') || q.includes('when will')) {
    return {
      text: "Standard delivery takes 3–5 business days within Bangladesh and 7–14 days internationally. You'll receive a tracking link by email once your order ships.",
    };
  }

  // ---- Shipping cost ----
  if (q.includes('shipping cost') || q.includes('shipping fee') || q.includes('how much') && q.includes('ship')) {
    return {
      text: "Shipping is free on all orders above ৳999. For orders below that, a flat shipping fee of ৳49 applies within Bangladesh.",
    };
  }

  // ---- Returns ----
  if (q.includes('return') || q.includes('refund') || q.includes('damaged') || q.includes('wrong')) {
    return {
      text: "We accept returns within 7 days of delivery for books in their original condition. For damaged books, email support@bookhub.com within 48 hours with a photo for a free replacement.",
      links: [{ label: '↩️ Return Policy (FAQ)', to: '/faq' }],
    };
  }

  // ---- Payment ----
  if (q.includes('payment') || q.includes('pay') || q.includes('card') || q.includes('upi') || q.includes('safe') || q.includes('secure')) {
    return {
      text: "We accept all major credit/debit cards, UPI, net banking, and popular wallets. All transactions are secured with industry-standard encryption. We never store your full card details.",
    };
  }

  // ---- Account / login ----
  if (q.includes('login') || q.includes('sign in') || q.includes('account') || q.includes('register') || q.includes('sign up') || q.includes('password')) {
    return {
      text: "You can sign in or create an account from the Login page. If you forgot your password, click 'Forgot Password?' on the login page to reset it via OTP.",
      links: [{ label: '🔐 Sign in', to: '/login' }],
    };
  }

  // ---- Contact ----
  if (q.includes('contact') || q.includes('support') || q.includes('help') || q.includes('email') || q.includes('phone') || q.includes('reach')) {
    return {
      text: "You can reach our support team at support@bookhub.com or call +1 (800) 555-BOOK. We're available Mon–Fri, 9am–6pm. You can also use our Contact page.",
      links: [{ label: '📧 Contact Us', to: '/contact' }],
    };
  }

  // ---- Wishlist ----
  if (q.includes('wishlist') || q.includes('favorite') || q.includes('save for later')) {
    return {
      text: "Tap the ❤️ heart icon on any book to add it to your wishlist. You can view all your saved books on the Wishlist page.",
      links: [{ label: '❤️ My Wishlist', to: '/wishlist' }],
    };
  }

  // ---- Browse / books / categories ----
  if (q.includes('browse') || q.includes('book') || q.includes('category') || q.includes('genre') || q.includes('search')) {
    return {
      text: "You can browse all books by category on our Books page. Use the search bar at the top to find specific titles or authors!",
      links: [{ label: '📚 Browse Books', to: '/categories' }],
    };
  }

  // ---- Cart / checkout ----
  if (q.includes('cart') || q.includes('checkout') || q.includes('buy') || q.includes('purchase')) {
    return {
      text: "Add books to your cart by clicking 'Add to Cart' on any book. When you're ready, go to your cart and click 'Proceed to Checkout'. You'll need to be signed in to complete your purchase.",
      links: [{ label: '🛒 View Cart', to: '/cart' }],
    };
  }

  // ---- Greetings ----
  if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('good morning') || q.includes('good evening')) {
    return {
      text: "Hello! 👋 Welcome to Lumina Books. How can I help you today? You can ask me about orders, shipping, returns, payments, or anything else!",
    };
  }

  // ---- Thanks ----
  if (q.includes('thank') || q.includes('thanks') || q.includes('great') || q.includes('awesome')) {
    return {
      text: "You're welcome! 😊 Happy reading! If you have any more questions, I'm always here.",
    };
  }

  // ---- FAQ link ----
  if (q.includes('faq') || q.includes('question')) {
    return {
      text: "We have a comprehensive FAQ page covering orders, shipping, returns, payments, and more. Check it out!",
      links: [{ label: '❓ FAQ Page', to: '/faq' }],
    };
  }

  // ---- Default fallback ----
  return {
    text: "I'm not sure about that one, but I can help with orders, shipping, returns, payments, accounts, and contacting support. Try asking 'How long does delivery take?' or check our FAQ page for more.",
    links: [{ label: '❓ View FAQ', to: '/faq' }, { label: '📧 Contact Support', to: '/contact' }],
  };
}

export default ChatBot;