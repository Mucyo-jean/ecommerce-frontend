import { NavLink, Outlet } from 'react-router-dom';
import clsx from 'clsx';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/orders', label: 'Orders' },
];

export default function AdminLayout() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row lg:px-8">
      <aside className="shrink-0 md:w-48">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Admin</h2>
        <nav className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                clsx(
                  'whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition',
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
