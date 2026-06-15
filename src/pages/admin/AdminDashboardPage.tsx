import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard, getSales, getTopProducts } from '../../api/analytics';
import type { DashboardData, SalesPoint, TopProduct } from '../../types';
import { formatPrice } from '../../lib/format';
import Spinner from '../../components/Spinner';

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent ?? 'text-gray-900'}`}>{value}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [sales, setSales] = useState<SalesPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboard(), getSales(14), getTopProducts()])
      .then(([d, s, t]) => {
        setDashboard(d);
        setSales(s);
        setTopProducts(t);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !dashboard) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  const maxRevenue = Math.max(...sales.map((s) => s.revenue), 1);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Revenue" value={formatPrice(dashboard.totals.revenue, dashboard.totals.currency)} accent="text-blue-600" />
        <StatCard label="Orders" value={String(dashboard.totals.orders)} />
        <StatCard label="Customers" value={String(dashboard.totals.customers)} />
        <StatCard label="Active products" value={String(dashboard.totals.activeProducts)} />
        <StatCard label="Avg. order value" value={formatPrice(dashboard.totals.averageOrderValue, dashboard.totals.currency)} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Sales — last {sales.length} days</h2>
          <div className="flex h-40 items-end gap-1">
            {sales.map((point) => (
              <div key={point.date} className="group relative flex-1">
                <div
                  className="w-full rounded-t bg-blue-500/80 transition group-hover:bg-blue-600"
                  style={{ height: `${Math.max((point.revenue / maxRevenue) * 100, 2)}%` }}
                />
                <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100">
                  {point.date}: {formatPrice(point.revenue, dashboard.totals.currency)} ({point.orders} orders)
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Orders by status</h2>
          <ul className="space-y-2 text-sm">
            {dashboard.ordersByStatus.map((g) => (
              <li key={g.status} className="flex items-center justify-between">
                <span className="text-gray-600">{g.status}</span>
                <span className="font-medium text-gray-900">{g.count}</span>
              </li>
            ))}
          </ul>

          <h2 className="mb-3 mt-5 text-sm font-semibold text-gray-900">Payments by method</h2>
          <ul className="space-y-2 text-sm">
            {dashboard.paymentsByMethod.map((g) => (
              <li key={g.method} className="flex items-center justify-between">
                <span className="text-gray-600">{g.method.replace('_', ' ')}</span>
                <span className="font-medium text-gray-900">{g.count}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Top selling products</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-gray-500">No sales yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100 text-sm">
              {topProducts.map((p) => (
                <li key={p.productId} className="flex items-center justify-between py-2">
                  <span className="text-gray-700">{p.name}</span>
                  <span className="text-gray-500">{p.unitsSold} sold</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Low stock alerts</h2>
            <Link to="/admin/products" className="text-xs text-blue-600 hover:underline">Manage products</Link>
          </div>
          {dashboard.lowStockProducts.length === 0 ? (
            <p className="text-sm text-gray-500">All products are well stocked.</p>
          ) : (
            <ul className="divide-y divide-gray-100 text-sm">
              {dashboard.lowStockProducts.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2">
                  <span className="text-gray-700">{p.name}</span>
                  <span className="font-medium text-red-600">{p.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
