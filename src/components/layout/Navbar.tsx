import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { useCategories } from "../../hooks/useCategories";

export default function Navbar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
  const [menuOpen, setMenuOpen] = useState(false);

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const cart = useCartStore((s) => s.cart);
  const resetCart = useCartStore((s) => s.reset);

  const { categories } = useCategories();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    navigate(`/products?${params.toString()}`);
  }

  function handleLogout() {
    logout();
    resetCart();
    setMenuOpen(false);
    navigate("/");
  }

  const cartCount = cart?.totalItems ?? 0;

  return (
    <header className="sticky top-0 z-30 bg-white shadow-sm">
      <div className="bg-blue-600 py-1.5 text-center text-xs font-medium text-white">
        Free delivery across Rwanda on orders over 50,000 RWF
      </div>

      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-blue-600">
            Matic
          </span>
          <span className="hidden text-xs font-medium text-gray-500 sm:inline">
            All in One Shop
          </span>
        </Link>

        <form
          onSubmit={handleSearch}
          className="order-3 flex w-full flex-1 sm:order-2 sm:w-auto"
        >
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for products..."
            className="w-full rounded-l-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-r-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Search
          </button>
        </form>

        <div className="order-2 ml-auto flex items-center gap-4 sm:order-3">
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0"
                />
              </svg>
              <span className="hidden sm:inline">
                {user ? user.name.split(" ")[0] : "Account"}
              </span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                {user ? (
                  <>
                    <div className="border-b border-gray-100 px-4 py-2 text-xs text-gray-500">
                      Signed in as{" "}
                      <span className="font-medium text-gray-800">
                        {user.name}
                      </span>
                    </div>
                    <Link
                      to="/orders"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      My Orders
                    </Link>
                    {user.role === "ADMIN" && (
                      <Link
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Create account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <Link
            to="/cart"
            className="relative flex items-center text-gray-700 hover:text-blue-600"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
              />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <nav className="hidden bg-blue-600 sm:block">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-2 text-sm font-medium text-white sm:px-6 lg:px-8">
          <Link to="/" className="hover:text-blue-100">
            Home
          </Link>
          <Link to="/products" className="hover:text-blue-100">
            Shop
          </Link>
          {categories.slice(0, 6).map((cat) => (
            <Link
              key={cat.id}
              to={`/products?categoryId=${cat.id}`}
              className="hover:text-blue-100"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
