import clsx from 'clsx';
import type { OrderStatus, PaymentStatus } from '../types';

const ORDER_STYLES: Record<OrderStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-700',
  PAID: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-indigo-100 text-indigo-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-700',
  SUCCESS: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-amber-100 text-amber-700',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={clsx('inline-block rounded-full px-2.5 py-1 text-xs font-medium', ORDER_STYLES[status])}>
      {status}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={clsx('inline-block rounded-full px-2.5 py-1 text-xs font-medium', PAYMENT_STYLES[status])}>
      {status}
    </span>
  );
}
