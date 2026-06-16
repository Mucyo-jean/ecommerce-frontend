import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { getErrorMessage } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);
  const fetchCart = useCartStore((s) => s.fetch);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await login({ email, password });
      setAuth(result.user, result.tokens);
      await fetchCart();
      const from = (location.state as { from?: Location })?.from?.pathname ?? '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid email or password'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="text-2xl font-bold text-gray-900">Sign in to Matic All in One Shop</h1>
      <p className="mt-1 text-sm text-gray-500">Welcome back! Enter your details to continue.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        {error && (
          <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-medium text-blue-600 hover:underline">
          Create one
        </Link>
      </p>

    </div>
  );
}
