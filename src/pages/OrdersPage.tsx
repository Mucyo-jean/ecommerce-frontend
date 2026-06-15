import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { myOrders } from "../api/orders";
import type {
  Order,
  OrderStatus,
  Pagination as PaginationType,
} from "../types";
import { formatDate, formatPrice } from "../lib/format";
import { OrderStatusBadge } from "../components/StatusBadge";
import Pagination from "../components/Pagination";
import Spinner from "../components/Spinner";

const STATUS_OPTIONS: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = (searchParams.get("status") ?? "") as OrderStatus | "";
  const page = Number(searchParams.get("page") ?? "1");

  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await myOrders({
        page,
        status: status || undefined,
        limit: 10,
      });
      setOrders(res.items);
      setPagination(res.pagination);
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    let active = true;
    const timeoutId = window.setTimeout(() => {
      if (!active) return;
      void loadOrders();
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [loadOrders]);

  function updateStatus(value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("status", value);
    else next.delete("status");
    next.delete("page");
    setSearchParams(next);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <select
          value={status}
          onChange={(e) => updateStatus(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-12 flex flex-col items-center text-center">
          <p className="text-gray-500">You have no orders yet.</p>
          <Link
            to="/products"
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {formatPrice(order.totalAmount, order.currency)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/orders/${order.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && (
        <Pagination
          pagination={pagination}
          onPageChange={(p) => {
            const next = new URLSearchParams(searchParams);
            next.set("page", String(p));
            setSearchParams(next);
          }}
        />
      )}
    </div>
  );
}
