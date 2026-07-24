/**
 * CART PAGE COMPONENT
 * Displays cart items, allows quantity changes, shows totals.
 * Redesigned to match the Lumina Books design system (emerald + stone).
 */

import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowRight } from 'lucide-react';

function Cart({ cartItems, onRemoveFromCart, onUpdateQuantity }) {
  const navigate = useNavigate();

  const calculateTotal = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const calculateSavings = () =>
    cartItems.reduce(
      (sum, item) => sum + (Number(item.price) > 300 ? 50 * item.quantity : 0),
      0
    );

  // EMPTY CART STATE
  if (cartItems.length === 0) {
    return (
      <div className="animate-fade-up bg-stone-50">
        <div className="container-app flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
          <div className="relative grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 ring-8 ring-emerald-50/50 sm:h-32 sm:w-32">
            <ShoppingCart className="h-12 w-12 text-emerald-600 sm:h-14 sm:w-14" strokeWidth={1.5} />
          </div>
          <h1 className="mt-7 font-display text-2xl font-bold text-stone-900 sm:text-3xl">
            Your cart is empty
          </h1>
          <p className="mt-2 max-w-md text-sm text-stone-600 sm:text-base">
            Looks like you haven't added any books yet. Explore our collection and find your next favorite read.
          </p>
          <button
            onClick={() => navigate('/categories')}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-8 py-3.5 font-semibold text-white transition hover:bg-emerald-800 active:scale-95"
          >
            Browse books
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up bg-stone-50">
      {/* Header */}
      <div className="border-b border-stone-200 bg-white">
        <div className="container-app py-10 md:py-14">
          <nav className="text-sm text-stone-500">
            <button onClick={() => navigate('/')} className="hover:text-emerald-700">
              Home
            </button>
            <span className="mx-2">/</span>
            <span className="text-stone-700">Cart</span>
          </nav>
          <h1 className="mt-2 font-display text-3xl font-bold text-stone-900 sm:text-4xl">
            Your cart
          </h1>
          <p className="mt-2 text-stone-600">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} ready to
            checkout.
          </p>
        </div>
      </div>

      <div className="container-app grid gap-8 py-10 lg:grid-cols-[1fr_360px]">
        {/* ITEMS */}
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-2xl border border-stone-200 bg-white p-4 sm:p-6"
            >
              {/* Cover */}
              <div className="h-28 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-stone-100 sm:h-32 sm:w-24">
                <img
                  src={
                    item.cover_url ||
                    'https://images.unsplash.com/photo-1544716278-e513176f20b5?w=300&q=80'
                  }
                  alt={item.title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1544716278-e513176f20b5?w=300&q=80';
                  }}
                />
              </div>

              {/* Details */}
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-lg font-bold text-stone-900">
                      {item.title}
                    </h3>
                    <p className="text-sm text-stone-500">by {item.author}</p>
                  </div>
                  <button
                    onClick={() => onRemoveFromCart(item.id)}
                    className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100"
                    title="Remove from cart"
                    aria-label="Remove from cart"
                  >
                    🗑️
                  </button>
                </div>

                <div className="mt-auto flex items-end justify-between pt-3">
                  {/* Quantity */}
                  <div className="flex items-center gap-1 rounded-full border border-stone-200 p-1">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="grid h-8 w-8 place-items-center rounded-full bg-stone-100 text-lg font-bold text-stone-700 transition hover:bg-emerald-100"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold text-stone-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="grid h-8 w-8 place-items-center rounded-full bg-stone-100 text-lg font-bold text-stone-700 transition hover:bg-emerald-100"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-700">
                      ৳{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-xs text-stone-400">
                      ৳{Number(item.price).toFixed(2)} each
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Continue shopping */}
          <button
            onClick={() => navigate('/categories')}
            className="flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
          >
            ← Continue shopping
          </button>
        </div>

        {/* SUMMARY */}
        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-xl font-bold text-stone-900">
              Order summary
            </h2>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-900">
                  ৳{calculateTotal().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-600">Free</span>
              </div>
              {calculateSavings() > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>Estimated savings</span>
                  <span className="font-semibold text-amber-600">
                    −৳{calculateSavings().toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-between border-t border-stone-100 pt-5">
              <span className="font-display text-lg font-bold text-stone-900">
                Total
              </span>
              <span className="font-display text-lg font-bold text-emerald-700">
                ৳{calculateTotal().toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="mt-6 w-full rounded-full bg-emerald-700 px-6 py-3.5 font-semibold text-white transition hover:bg-emerald-800 active:scale-95"
            >
              Proceed to checkout
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-stone-500">
              <span>🔒</span>
              <span>Secure checkout · Encrypted payment</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Cart;