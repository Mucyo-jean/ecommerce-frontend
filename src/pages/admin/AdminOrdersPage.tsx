import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as ordersApi from "../../api/orders";
import type {
  Order,
  OrderStatus,
  Pagination as PaginationType,
} from "../../types";
import { formatDate, formatPrice } from "../../lib/format";
import { getErrorMessage } from "../../lib/api";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "../../components/StatusBadge";
import Pagination from "../../components/Pagination";
import Spinner from "../../components/Spinner";

const STATUS_OPTIONS: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    ordersApi
      .allOrders({ page, status: status || undefined, limit: 15 })
      .then((res) => {
        setOrders(res.items);
        setPagination(res.pagination);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [page, status]);

  useEffect(() => {
    let active = true;
    const timeoutId = window.setTimeout(() => {
      if (!active) return;
      void load();
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [load]);

  async function handleStatusChange(order: Order, newStatus: OrderStatus) {
    setUpdatingId(order.id);
    try {
      const updated = await ordersApi.updateOrderStatus(order.id, newStatus);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id ? { ...o, status: updated.status } : o,
        ),
      );
    } catch (err) {
      alert(getErrorMessage(err, "Could not update order status"));
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as OrderStatus | "");
            setPage(1);
          }}
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

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <div>{order.customerName}</div>
                    <div className="text-xs text-gray-400">
                      {order.user?.email ?? order.customerEmail}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    {order.payment && (
                      <PaymentStatusBadge status={order.payment.status} />
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {formatPrice(order.totalAmount, order.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) =>
                        handleStatusChange(order, e.target.value as OrderStatus)
                      }
                      className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <div className="mt-1">
                      <OrderStatusBadge status={order.status} />
                    </div>
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
        <Pagination pagination={pagination} onPageChange={setPage} />
      )}
    </div>
  );
}
