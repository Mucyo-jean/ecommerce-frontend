import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 text-sm text-gray-600 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <Link to="/" className="text-xl font-bold text-blue-600">
            Matic <span className="text-gray-900">All in One Shop</span>
          </Link>
          <p className="mt-3 text-gray-500">
            Your everyday online store for electronics, fashion, home essentials and Rwandan handicrafts.
          </p>
        </div>
        <div>
          <h3 className="mb-3 font-semibold text-gray-900">Shop</h3>
          <ul className="space-y-2">
            <li><Link to="/products" className="hover:text-blue-600">All products</Link></li>
            <li><Link to="/products?sort=newest" className="hover:text-blue-600">New arrivals</Link></li>
            <li><Link to="/products?sort=rating" className="hover:text-blue-600">Top rated</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-semibold text-gray-900">Account</h3>
          <ul className="space-y-2">
            <li><Link to="/orders" className="hover:text-blue-600">My orders</Link></li>
            <li><Link to="/cart" className="hover:text-blue-600">Cart</Link></li>
            <li><Link to="/login" className="hover:text-blue-600">Sign in</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-semibold text-gray-900">Contact</h3>
          <p className="text-gray-500">Kigali, Rwanda</p>
          <p className="text-gray-500">support@matic.rw</p>
        </div>
      </div>
      <div className="border-t border-gray-100 py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Matic All in One Shop. All rights reserved.
      </div>
    </footer>
  );
}
