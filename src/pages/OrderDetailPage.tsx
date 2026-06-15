import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { getOrder } from "../api/orders";
import type { Order } from "../types";
import { formatDate, formatPrice } from "../lib/format";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "../components/StatusBadge";
import Spinner from "../components/Spinner";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const justPlaced = Boolean(
    (location.state as { justPlaced?: boolean } | null)?.justPlaced,
  );

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadOrder(orderId: string) {
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const data = await getOrder(orderId);
      setOrder(data);
    } catch {
      setError("Order not found.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    let active = true;
    const timeoutId = window.setTimeout(() => {
      if (!active) return;
      void loadOrder(id);
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Order not found</h1>
        <Link to="/orders" className="mt-4 text-blue-600 hover:underline">
          Back to my orders
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {justPlaced && (
        <div className="mb-6 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
          🎉 Thanks! Your order has been placed successfully.
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Order {order.orderNumber}
          </h1>
          <p className="text-sm text-gray-500">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold text-gray-900">
            Shipping details
          </h2>
          <dl className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <dt>Name</dt>
              <dd>{order.customerName}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Email</dt>
              <dd>{order.customerEmail}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Phone</dt>
              <dd>{order.customerPhone}</dd>
            </div>
            <div className="flex justify-between">
              <dt>City</dt>
              <dd>{order.city}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Address</dt>
              <dd className="text-right">{order.shippingAddress}</dd>
            </div>
            {order.notes && (
              <div className="flex justify-between gap-4">
                <dt>Notes</dt>
                <dd className="text-right">{order.notes}</dd>
              </div>
            )}
          </dl>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold text-gray-900">Payment</h2>
          {order.payment ? (
            <dl className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <dt>Method</dt>
                <dd>{order.payment.method.replace("_", " ")}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt>Status</dt>
                <dd>
                  <PaymentStatusBadge status={order.payment.status} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Amount</dt>
                <dd>
                  {formatPrice(order.payment.amount, order.payment.currency)}
                </dd>
              </div>
              {order.payment.transactionId && (
                <div className="flex justify-between gap-4">
                  <dt>Transaction ID</dt>
                  <dd className="truncate text-right">
                    {order.payment.transactionId}
                  </dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="text-sm text-gray-500">No payment record.</p>
          )}
        </section>
      </div>

      <section className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <h2 className="border-b border-gray-100 px-4 py-3 text-sm font-semibold text-gray-900">
          Items
        </h2>
        <ul className="divide-y divide-gray-100">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-gray-400">
                  Qty {item.quantity} ×{" "}
                  {formatPrice(item.price, order.currency)}
                </p>
              </div>
              <p className="font-medium text-gray-900">
                {formatPrice(
                  Number(item.price) * item.quantity,
                  order.currency,
                )}
              </p>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-gray-100 px-4 py-3 text-base font-semibold text-gray-900">
          <span>Total</span>
          <span>{formatPrice(order.totalAmount, order.currency)}</span>
        </div>
      </section>

      <Link
        to="/orders"
        className="mt-6 inline-block text-sm text-blue-600 hover:underline"
      >
        ← Back to my orders
      </Link>
    </div>
  );
}
