import { detectBrand, formatCardNumber, formatExpiry } from '../lib/stripe';
import type { CardDetails, CardValidationErrors } from '../lib/stripe';

const BRAND_LABEL: Record<string, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'Amex',
  discover: 'Discover',
  unknown: '',
};

interface Props {
  card: CardDetails;
  errors: CardValidationErrors;
  disabled?: boolean;
  onChange: (card: CardDetails) => void;
}

// A Stripe Elements-style card entry block: single bordered group with
// number, expiry and CVC, plus the cardholder name. Inputs auto-format as
// you type, mirroring the real Stripe widget.
export default function StripeCardForm({ card, errors, disabled, onChange }: Props) {
  const brand = detectBrand(card.number);

  function set<K extends keyof CardDetails>(key: K, value: string) {
    onChange({ ...card, [key]: value });
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Name on card</label>
        <input
          type="text"
          autoComplete="cc-name"
          disabled={disabled}
          value={card.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="Aline Uwase"
          className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none disabled:bg-gray-50 ${
            errors.name ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
          }`}
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>

      <div className="rounded-md border border-gray-300 focus-within:border-blue-500">
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            disabled={disabled}
            value={card.number}
            onChange={(e) => set('number', formatCardNumber(e.target.value))}
            placeholder="1234 1234 1234 1234"
            className="w-full rounded-t-md border-b border-gray-200 px-3 py-2 text-sm focus:outline-none disabled:bg-gray-50"
          />
          {BRAND_LABEL[brand] && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase text-gray-400">
              {BRAND_LABEL[brand]}
            </span>
          )}
        </div>
        <div className="flex">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="cc-exp"
            disabled={disabled}
            value={card.expiry}
            onChange={(e) => set('expiry', formatExpiry(e.target.value))}
            placeholder="MM / YY"
            className="w-1/2 border-r border-gray-200 px-3 py-2 text-sm focus:outline-none disabled:bg-gray-50"
          />
          <input
            type="text"
            inputMode="numeric"
            autoComplete="cc-csc"
            disabled={disabled}
            value={card.cvc}
            onChange={(e) => set('cvc', e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="CVC"
            className="w-1/2 px-3 py-2 text-sm focus:outline-none disabled:bg-gray-50"
          />
        </div>
      </div>
      {(errors.number || errors.expiry || errors.cvc) && (
        <p className="text-xs text-red-600">{errors.number || errors.expiry || errors.cvc}</p>
      )}

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        <span>Test mode — use 4242 4242 4242 4242, any future expiry &amp; CVC.</span>
      </div>
    </div>
  );
}
