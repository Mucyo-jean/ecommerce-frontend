import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { checkout } from '../api/orders';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../lib/format';
import { getErrorMessage } from '../lib/api';
import { confirmCardPayment, validateCard } from '../lib/stripe';
import type { CardDetails, CardValidationErrors } from '../lib/stripe';
import type { CheckoutInput, PaymentMethod } from '../types';
import StripeCardForm from '../components/StripeCardForm';
import Spinner from '../components/Spinner';

const PAYMENT_METHODS: { value: PaymentMethod; label: string; description: string }[] = [
  { value: 'MOBILE_MONEY', label: 'Mobile Money', description: 'Pay with MTN MoMo' },
  { value: 'STRIPE_CARD', label: 'Card payment', description: 'Pay securely with Visa, Mastercard or Amex via Stripe' },
  { value: 'CASH_ON_DELIVERY', label: 'Cash on delivery', description: 'Pay when your order arrives' },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { cart, loading, fetch } = useCartStore();

  const [form, setForm] = useState<CheckoutInput>({
    customerName: user?.name ?? '',
    customerEmail: user?.email ?? '',
    customerPhone: user?.phone ?? '',
    shippingAddress: '',
    city: '',
    notes: '',
    paymentMethod: 'MOBILE_MONEY',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [card, setCard] = useState<CardDetails>({ number: '', expiry: '', cvc: '', name: user?.name ?? '' });
  const [cardErrors, setCardErrors] = useState<CardValidationErrors>({});
  const [payStatus, setPayStatus] = useState<'idle' | 'processing' | 'placing'>('idle');

  const isCard = form.paymentMethod === 'STRIPE_CARD';

  useEffect(() => {
    fetch();
  }, [fetch]);

  useEffect(() => {
    if (!loading && cart && cart.items.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [loading, cart, navigate]);

  function handleChange<K extends keyof CheckoutInput>(key: K, value: CheckoutInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Card payments: collect + confirm the card client-side (mirroring the
    // backend's Stripe gateway) before placing the order. The backend still
    // records the charge under paymentMethod=STRIPE_CARD.
    if (isCard) {
      const validation = validateCard(card);
      setCardErrors(validation);
      if (Object.keys(validation).length > 0) return;
    }

    setSubmitting(true);
    try {
      if (isCard) {
        setPayStatus('processing');
        const result = await confirmCardPayment(card);
        if (result.status !== 'succeeded') {
          setError(result.message);
          return;
        }
      }

      setPayStatus('placing');
      const order = await checkout(form);
      await fetch();
      navigate(`/orders/${order.id}`, { replace: true, state: { justPlaced: true } });
    } catch (err) {
      setError(getErrorMessage(err, 'Could not place order'));
    } finally {
      setSubmitting(false);
      setPayStatus('idle');
    }
  }

  const buttonLabel =
    payStatus === 'processing'
      ? 'Processing payment…'
      : payStatus === 'placing'
        ? 'Placing order…'
        : isCard
          ? `Pay ${formatPrice(cart?.subtotal ?? 0, cart?.currency)}`
          : 'Place order';

  if (loading && !cart) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 lg:col-span-2">
          {error && <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <section className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Contact details</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Full name</label>
                <input
                  required
                  minLength={2}
                  value={form.customerName}
                  onChange={(e) => handleChange('customerName', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  required
                  type="email"
                  value={form.customerEmail}
                  onChange={(e) => handleChange('customerEmail', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
                <input
                  required
                  minLength={7}
                  value={form.customerPhone}
                  onChange={(e) => handleChange('customerPhone', e.target.value)}
                  placeholder="+250788000000"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">City</label>
                <input
                  required
                  minLength={2}
                  value={form.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Kigali"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Shipping address</label>
                <input
                  required
                  minLength={3}
                  value={form.shippingAddress}
                  onChange={(e) => handleChange('shippingAddress', e.target.value)}
                  placeholder="KK 508 St, Gasabo"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Order notes <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Payment method</h2>
            <div className="mt-4 flex flex-col gap-3">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 ${
                    form.paymentMethod === method.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={form.paymentMethod === method.value}
                    onChange={() => handleChange('paymentMethod', method.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{method.label}</p>
                    <p className="text-xs text-gray-500">{method.description}</p>
                    {method.value === 'STRIPE_CARD' && isCard && (
                      <StripeCardForm
                        card={card}
                        errors={cardErrors}
                        disabled={submitting}
                        onChange={(c) => {
                          setCard(c);
                          if (Object.keys(cardErrors).length) setCardErrors({});
                        }}
                      />
                    )}
                  </div>
                </label>
              ))}
            </div>
          </section>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {buttonLabel}
          </button>
        </form>

        <div className="h-fit rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {cart?.items.map((item) => (
              <li key={item.productId} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.name} <span className="text-gray-400">× {item.quantity}</span>
                </span>
                <span className="font-medium text-gray-900">{formatPrice(item.lineTotal, cart.currency)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-gray-100 pt-3 text-base font-semibold text-gray-900">
            <span>Total</span>
            <span>{formatPrice(cart?.subtotal ?? 0, cart?.currency)}</span>
          </div>
          <Link to="/cart" className="mt-4 block text-center text-sm text-blue-600 hover:underline">
            Edit cart
          </Link>
        </div>
      </div>
    </div>
  );
}
