// ---------------------------------------------------------------------------
// Mock Stripe.js
//
// The backend (payments/payment.gateway.ts -> chargeStripe) has no real
// STRIPE_SECRET_KEY configured, so it falls back to a deterministic MOCK
// gateway that approves the charge and returns a `STRIPE-<ts>-<rand>`
// transaction id. To mirror that procedure on the client, we collect card
// details Stripe-style and "confirm" them here before the order is submitted
// with paymentMethod=STRIPE_CARD. This keeps the API contract identical while
// reproducing the real-world flow (card entry -> confirm -> server records
// the charge). Swapping this for @stripe/stripe-js + Elements later is a
// drop-in: same inputs, same `confirmCardPayment` shape.
// ---------------------------------------------------------------------------

export interface CardDetails {
  number: string; // may contain spaces
  expiry: string; // "MM / YY"
  cvc: string;
  name: string;
}

export interface ConfirmCardPaymentResult {
  status: 'succeeded' | 'failed';
  paymentIntentId: string;
  brand: CardBrand;
  last4: string;
  message: string;
}

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown';

// Stripe's standard test cards — mirrored so the demo behaves like the real
// dashboard: 4242… always succeeds, 4000…0002 is a generic decline, etc.
const DECLINE_CARDS: Record<string, string> = {
  '4000000000000002': 'Your card was declined.',
  '4000000000009995': 'Your card has insufficient funds.',
  '4000000000000069': 'Your card has expired.',
  '4000000000000127': "Your card's security code is incorrect.",
};

export function detectBrand(number: string): CardBrand {
  const n = number.replace(/\D/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  if (/^6(?:011|5)/.test(n)) return 'discover';
  return 'unknown';
}

// Luhn checksum — the same validation Stripe runs client-side.
function luhnValid(digits: string): boolean {
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0 && digits.length > 0;
}

function expiryInFuture(expiry: string): boolean {
  const match = expiry.match(/^(\d{2})\s*\/\s*(\d{2})$/);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  // Card is valid through the last day of its expiry month.
  const expEnd = new Date(year, month, 1);
  return expEnd > new Date();
}

export interface CardValidationErrors {
  number?: string;
  expiry?: string;
  cvc?: string;
  name?: string;
}

export function validateCard(card: CardDetails): CardValidationErrors {
  const errors: CardValidationErrors = {};
  const digits = card.number.replace(/\D/g, '');
  const brand = detectBrand(digits);
  const expectedCvc = brand === 'amex' ? 4 : 3;

  if (digits.length < 13 || !luhnValid(digits)) {
    errors.number = 'Enter a valid card number.';
  }
  if (!expiryInFuture(card.expiry)) {
    errors.expiry = 'Enter a valid expiry date.';
  }
  if (!new RegExp(`^\\d{${expectedCvc}}$`).test(card.cvc.trim())) {
    errors.cvc = `Enter the ${expectedCvc}-digit code.`;
  }
  if (card.name.trim().length < 2) {
    errors.name = 'Enter the name on the card.';
  }
  return errors;
}

// Mimics stripe.confirmCardPayment(): validates the card, simulates the
// network round-trip to the gateway, and approves/declines deterministically.
export async function confirmCardPayment(card: CardDetails): Promise<ConfirmCardPaymentResult> {
  const digits = card.number.replace(/\D/g, '');
  const brand = detectBrand(digits);
  const last4 = digits.slice(-4);

  // Simulated processing latency, like a real PaymentIntent confirmation.
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const declineMessage = DECLINE_CARDS[digits];
  if (declineMessage) {
    return {
      status: 'failed',
      paymentIntentId: '',
      brand,
      last4,
      message: declineMessage,
    };
  }

  return {
    status: 'succeeded',
    paymentIntentId: `pi_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    brand,
    last4,
    message: 'Card payment approved.',
  };
}

// --- Input formatting helpers (mirror Stripe Elements behaviour) ---

export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 19);
  const isAmex = /^3[47]/.test(digits);
  if (isAmex) {
    return digits.replace(/(\d{4})(\d{0,6})(\d{0,5})/, (_, a, b, c) =>
      [a, b, c].filter(Boolean).join(' '),
    );
  }
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}
