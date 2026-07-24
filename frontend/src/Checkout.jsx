import { useEffect, useMemo, useState } from 'react';
import api from './services/api';
import { useNavigate } from 'react-router-dom';

const DELIVERY_CHARGE = 60;

const paymentMethods = [
  { id: 'cash_on_delivery', icon: '💵', title: 'Cash on Delivery', description: 'Pay when your order arrives.' },
  { id: 'bkash', icon: '🟣', title: 'bKash', description: 'Pay securely from your bKash account.' },
  { id: 'nagad', icon: '🟠', title: 'Nagad', description: 'Pay securely from your Nagad account.' },
  { id: 'rocket', icon: '🔵', title: 'Rocket (DBBL)', description: 'Pay securely with Rocket.' },
  { id: 'bank_transfer', icon: '🏦', title: 'Bank Transfer', description: 'Transfer using bank account details.' },
];

const providerLabels = {
  bkash: 'bKash Personal',
  nagad: 'Nagad Personal',
  rocket: 'Rocket (DBBL) Personal',
};

function Checkout({ cartItems, onClearCart, isLoggedIn, user }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', division: '', district: '', upazilaCity: '',
    address: '', postalCode: '', orderNote: '', paymentMethod: 'cash_on_delivery', transactionId: '',
  });
  const [isPlacing, setIsPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [placedTotal, setPlacedTotal] = useState(0);

  useEffect(() => {
    if (isLoggedIn && user) {
      setFormData((current) => ({
        ...current,
        name: current.name || user.name || '',
        email: current.email || user.email || '',
      }));
    }
  }, [isLoggedIn, user]);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
    [cartItems],
  );
  const discount = 0;
  const grandTotal = subtotal + DELIVERY_CHARGE - discount;
  const needsTransactionId = ['bkash', 'nagad', 'rocket'].includes(formData.paymentMethod);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
      ...(name === 'paymentMethod' ? { transactionId: '' } : {}),
    }));
  };

  const handleSubmitOrder = async (event) => {
    event.preventDefault();
    const requiredFields = [
      ['name', 'full name'], ['phone', 'phone number'], ['division', 'division'],
      ['district', 'district'], ['upazilaCity', 'upazila or city'], ['address', 'full address'],
    ];
    const missing = requiredFields.find(([field]) => !formData[field].trim());

    if (missing) {
      setErrorMessage(`Please enter your ${missing[1]}.`);
      return;
    }
    if (needsTransactionId && !formData.transactionId.trim()) {
      setErrorMessage('Please enter your transaction ID.');
      return;
    }
    if (cartItems.length === 0) {
      setErrorMessage('Your cart is empty.');
      return;
    }

    setIsPlacing(true);
    setErrorMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(
        '/api/orders',
        {
          customerName: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          division: formData.division.trim(),
          district: formData.district.trim(),
          upazilaCity: formData.upazilaCity.trim(),
          address: formData.address.trim(),
          postalCode: formData.postalCode.trim(),
          orderNote: formData.orderNote.trim(),
          paymentMethod: formData.paymentMethod,
          transactionId: needsTransactionId ? formData.transactionId.trim() : '',
          items: cartItems.map((item) => ({ bookId: item.id, quantity: item.quantity })),
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
      );
      setOrderPlaced(true);
      setOrderId(response.data.orderId);
      setPlacedTotal(response.data.totalAmount);
      onClearCart();
      setTimeout(() => navigate('/'), 3500);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsPlacing(false);
    }
  };

  if (cartItems.length === 0 && !orderPlaced) {
    return <EmptyCart navigate={navigate} />;
  }

  if (orderPlaced) {
    return (
      <div className="animate-fade-up bg-stone-50">
        <div className="container-app flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
          <div className="grid h-24 w-24 animate-bounce place-items-center rounded-full bg-emerald-100 text-5xl">✅</div>
          <h1 className="mt-6 font-display text-3xl font-bold text-emerald-700 sm:text-4xl">Order placed successfully!</h1>
          <div className="mt-6 w-full max-w-sm rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-stone-500">Order ID</p>
            <p className="font-display text-2xl font-bold text-stone-900">#{orderId}</p>
            <div className="mt-4 flex justify-between border-t border-stone-100 pt-4">
              <span className="text-stone-600">Grand total</span>
              <span className="font-bold text-emerald-700">৳{Number(placedTotal).toFixed(2)}</span>
            </div>
          </div>
          <p className="mt-6 max-w-md text-stone-600">Your order is awaiting payment verification. We will confirm it after reviewing the payment details.</p>
          <p className="mt-1 text-xs text-stone-400">Redirecting you home…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up bg-stone-50">
      <div className="border-b border-stone-200 bg-white">
        <div className="container-app py-10 md:py-14">
          <nav className="text-sm text-stone-500">
            <button onClick={() => navigate('/')} className="hover:text-emerald-700">Home</button><span className="mx-2">/</span>
            <button onClick={() => navigate('/cart')} className="hover:text-emerald-700">Cart</button><span className="mx-2">/</span>
            <span className="text-stone-700">Checkout</span>
          </nav>
          <h1 className="mt-2 font-display text-3xl font-bold text-stone-900 sm:text-4xl">Checkout</h1>
          <p className="mt-2 text-stone-600">Securely complete your Lumina Books order.</p>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="container-app grid gap-8 py-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="text-sm font-semibold text-emerald-700">01 · DELIVERY DETAILS</p><h2 className="mt-1 font-display text-2xl font-bold text-stone-900">Where should we deliver?</h2></div>
              {isLoggedIn && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Details pre-filled</span>}
            </div>
            {!isLoggedIn && (
              <p className="mt-4 rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-600">
                Already have an account? <button type="button" onClick={() => navigate('/login')} className="font-semibold text-emerald-700 hover:text-emerald-800">Sign in to automatically fill your delivery details.</button>
              </p>
            )}
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="Full Name" name="name" value={formData.name} onChange={handleInputChange} required disabled={isPlacing} placeholder="Your full name" />
              <Field label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required disabled={isPlacing} placeholder="01XXXXXXXXX" />
              <Field label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} disabled={isPlacing} placeholder="you@example.com" optional />
              <Field label="Division" name="division" value={formData.division} onChange={handleInputChange} required disabled={isPlacing} placeholder="e.g. Rajshahi" />
              <Field label="District" name="district" value={formData.district} onChange={handleInputChange} required disabled={isPlacing} placeholder="e.g. Rajshahi" />
              <Field label="Upazila / City" name="upazilaCity" value={formData.upazilaCity} onChange={handleInputChange} required disabled={isPlacing} placeholder="e.g. Rajshahi City" />
              <div className="sm:col-span-2"><Field label="Full Address" name="address" value={formData.address} onChange={handleInputChange} required disabled={isPlacing} placeholder="House, road, area, landmark" textarea /></div>
              <Field label="Postal Code" name="postalCode" value={formData.postalCode} onChange={handleInputChange} disabled={isPlacing} placeholder="Optional" optional />
              <Field label="Order Note" name="orderNote" value={formData.orderNote} onChange={handleInputChange} disabled={isPlacing} placeholder="Optional delivery instruction" optional />
            </div>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
            <p className="text-sm font-semibold text-emerald-700">02 · PAYMENT METHOD</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-stone-900">Choose how to pay</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {paymentMethods.map((method) => {
                const selected = formData.paymentMethod === method.id;
                return <button key={method.id} type="button" onClick={() => handleInputChange({ target: { name: 'paymentMethod', value: method.id } })} className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${selected ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600' : 'border-stone-200 hover:border-emerald-300 hover:bg-stone-50'}`}>
                  <span className="text-xl">{method.icon}</span><span><span className="block font-semibold text-stone-900">{method.title}</span><span className="mt-0.5 block text-xs text-stone-500">{method.description}</span></span>
                </button>;
              })}
            </div>
            <PaymentInstructions method={formData.paymentMethod} total={grandTotal} transactionId={formData.transactionId} onChange={handleInputChange} disabled={isPlacing} />
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
            <p className="font-semibold text-amber-900">Manual Payment Verification</p>
            <p className="mt-1 text-sm leading-relaxed text-amber-800">Online payments are verified manually by the administrator after order placement. Your order status will remain ‘Pending Payment Verification’ until the transaction is confirmed.</p>
          </section>

          {errorMessage && <div className="rounded-xl border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-700">{errorMessage}</div>}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="submit" disabled={isPlacing} className={`rounded-full px-7 py-3.5 font-semibold text-white transition active:scale-95 ${isPlacing ? 'cursor-not-allowed bg-stone-400' : 'bg-emerald-700 hover:bg-emerald-800'}`}>
              {isPlacing ? 'Placing order…' : `Place order · ৳${grandTotal.toFixed(2)}`}
            </button>
            <button type="button" onClick={() => navigate('/cart')} className="text-sm font-semibold text-stone-500 transition hover:text-stone-800">← Back to cart</button>
          </div>
        </div>

        <OrderSummary cartItems={cartItems} subtotal={subtotal} discount={discount} total={grandTotal} />
      </form>
    </div>
  );
}

function Field({ label, name, value, onChange, required, optional, textarea, disabled, type = 'text', placeholder }) {
  const className = 'w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:bg-stone-50';
  return <label className="block text-sm font-semibold text-stone-700">{label} {required && '*'} {optional && <span className="font-normal text-stone-400">(Optional)</span>}{textarea ? <textarea name={name} value={value} onChange={onChange} disabled={disabled} placeholder={placeholder} rows="4" className={`mt-1.5 resize-y ${className}`} /> : <input type={type} name={name} value={value} onChange={onChange} disabled={disabled} placeholder={placeholder} className={`mt-1.5 ${className}`} />}</label>;
}

function PaymentInstructions({ method, total, transactionId, onChange, disabled }) {
  if (method === 'cash_on_delivery') return <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800"><p className="font-semibold">Cash on Delivery</p><p className="mt-1">Pay when your order arrives. No transaction ID is required.</p></div>;
  if (method === 'bank_transfer') return <div className="mt-5 rounded-xl bg-stone-50 p-4 text-sm text-stone-600"><p className="font-semibold text-stone-800">Bank Transfer</p><p className="mt-1">Bank account details will be provided after order confirmation.</p></div>;
  return <div className="mt-5 rounded-xl bg-violet-50 p-4 text-sm text-stone-700"><p>Send <span className="font-bold text-emerald-700">৳{total.toFixed(2)}</span> to:</p><p className="mt-2 font-semibold text-stone-900">{providerLabels[method]}</p><p className="font-display text-xl font-bold text-stone-900">01402827287</p><p className="mt-3 text-stone-600">After completing the payment, enter your Transaction ID below.</p><Field label="Transaction ID" name="transactionId" value={transactionId} onChange={onChange} required disabled={disabled} placeholder="Enter transaction ID" /></div>;
}

function OrderSummary({ cartItems, subtotal, discount, total }) {
  return <aside className="lg:sticky lg:top-28 lg:h-fit"><div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"><h2 className="font-display text-xl font-bold text-stone-900">Order summary</h2><div className="mt-5 space-y-4 border-b border-stone-100 pb-5">{cartItems.map((item) => <div key={item.id} className="flex gap-3"><div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-stone-100"><img src={item.cover_url || 'https://images.unsplash.com/photo-1544716278-e513176f20b5?w=200&q=80'} alt={item.title} className="h-full w-full object-cover" onError={(event) => { event.currentTarget.src = 'https://images.unsplash.com/photo-1544716278-e513176f20b5?w=200&q=80'; }} /></div><div className="flex flex-1 items-start justify-between gap-2"><div><p className="text-sm font-semibold text-stone-900">{item.title}</p><p className="text-xs text-stone-500">Qty: {item.quantity}</p></div><p className="text-sm font-semibold text-emerald-700">৳{(Number(item.price) * item.quantity).toFixed(2)}</p></div></div>)}</div><div className="mt-5 space-y-3 text-sm"><SummaryRow label="Subtotal" value={`৳${subtotal.toFixed(2)}`} /><SummaryRow label="Delivery Charge" value={`৳${DELIVERY_CHARGE.toFixed(2)}`} /><SummaryRow label="Discount" value={discount ? `− ৳${discount.toFixed(2)}` : '৳0.00'} valueClass={discount ? 'text-emerald-700' : ''} /></div><div className="mt-5 flex justify-between border-t border-stone-100 pt-5"><span className="font-display text-lg font-bold text-stone-900">Grand Total</span><span className="font-display text-lg font-bold text-emerald-700">৳{total.toFixed(2)}</span></div></div></aside>;
}

function SummaryRow({ label, value, valueClass = 'text-stone-900' }) { return <div className="flex justify-between text-stone-600"><span>{label}</span><span className={`font-semibold ${valueClass}`}>{value}</span></div>; }

function EmptyCart({ navigate }) { return <div className="animate-fade-up bg-stone-50"><div className="container-app flex min-h-[60vh] flex-col items-center justify-center py-16 text-center"><div className="grid h-24 w-24 place-items-center rounded-full bg-emerald-50 text-5xl">🛒</div><h1 className="mt-6 font-display text-2xl font-bold text-stone-900">Your cart is empty</h1><p className="mt-2 max-w-md text-stone-600">Add some books before heading to checkout.</p><button onClick={() => navigate('/categories')} className="mt-8 rounded-full bg-emerald-700 px-8 py-3.5 font-semibold text-white transition hover:bg-emerald-800">Browse books</button></div></div>; }

export default Checkout;
