import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../lib/format';
import { getErrorMessage } from '../lib/api';
import Spinner from '../components/Spinner';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, loading, fetch, updateItem, removeItem, clear } = useCartStore();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch();
  }, [fetch]);

  async function handleQuantityChange(productId: string, quantity: number) {
    if (quantity < 1) return;
    setBusyId(productId);
    setError(null);
    try {
      await updateItem(productId, quantity);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update quantity'));
    } finally {
      setBusyId(null);
    }
  }

  async function handleRemove(productId: string) {
    setBusyId(productId);
    setError(null);
    try {
      await removeItem(productId);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not remove item'));
    } finally {
      setBusyId(null);
    }
  }

  if (loading && !cart) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  const items = cart?.items ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>

      {error && <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {items.length === 0 ? (
        <div className="mt-12 flex flex-col items-center text-center">
          <p className="text-gray-500">Your cart is empty.</p>
          <Link to="/products" className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-4 p-4">
                  <Link to={`/products/${item.productId}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">No image</div>
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link to={`/products/${item.productId}`} className="font-medium text-gray-900 hover:text-blue-600">
                          {item.name}
                        </Link>
                        {item.category && <p className="text-xs text-gray-400">{item.category}</p>}
                      </div>
                      <button
                        onClick={() => handleRemove(item.productId)}
                        disabled={busyId === item.productId}
                        className="text-sm text-gray-400 hover:text-red-600 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center rounded-md border border-gray-300">
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                          disabled={busyId === item.productId || item.quantity <= 1}
                          className="px-2.5 py-1 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                          disabled={busyId === item.productId || item.quantity >= item.stock}
                          className="px-2.5 py-1 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatPrice(item.lineTotal, cart?.currency)}</p>
                        <p className="text-xs text-gray-400">{formatPrice(item.unitPrice, cart?.currency)} each</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <button onClick={() => clear()} className="mt-3 text-sm font-medium text-gray-500 hover:text-red-600">
              Clear cart
            </button>
          </div>

          <div className="h-fit rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
            <div className="mt-4 flex justify-between text-sm text-gray-600">
              <span>Items ({cart?.totalItems})</span>
              <span>{formatPrice(cart?.subtotal ?? 0, cart?.currency)}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-gray-100 pt-2 text-base font-semibold text-gray-900">
              <span>Total</span>
              <span>{formatPrice(cart?.subtotal ?? 0, cart?.currency)}</span>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Proceed to checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
