import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProduct } from "../api/products";
import * as recommendationsApi from "../api/recommendations";
import type { Product } from "../types";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { formatPrice } from "../lib/format";
import { getErrorMessage } from "../lib/api";
import StarRating from "../components/StarRating";
import ProductRow from "../components/ProductRow";
import Spinner from "../components/Spinner";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [alsoViewed, setAlsoViewed] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function loadProduct(productId: string) {
    setLoading(true);
    setNotFound(false);
    setProduct(null);
    setQuantity(1);

    try {
      const data = await getProduct(productId);
      setProduct(data);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }

    recommendationsApi
      .related(productId)
      .then((data) => setRelated(data))
      .catch(() => undefined);
    recommendationsApi
      .alsoViewed(productId)
      .then((data) => setAlsoViewed(data))
      .catch(() => undefined);
  }

  useEffect(() => {
    if (!id) return;
    let active = true;
    const timeoutId = window.setTimeout(() => {
      if (!active) return;
      void loadProduct(id);
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [id]);

  async function handleAddToCart() {
    if (!product) return;
    if (!user) {
      navigate("/login", {
        state: { from: { pathname: `/products/${product.id}` } },
      });
      return;
    }
    setAdding(true);
    setFeedback(null);
    try {
      await addItem(product.id, quantity);
      setFeedback({ type: "success", text: "Added to your cart." });
    } catch (err) {
      setFeedback({
        type: "error",
        text: getErrorMessage(err, "Could not add item to cart"),
      });
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
        <Link to="/products" className="mt-4 text-blue-600 hover:underline">
          Browse all products
        </Link>
      </div>
    );
  }

  const outOfStock = product.stock <= 0;

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-4 text-sm text-gray-500">
          <Link to="/products" className="hover:text-blue-600">
            Shop
          </Link>
          {product.category && (
            <>
              {" / "}
              <Link
                to={`/products?categoryId=${product.category.id}`}
                className="hover:text-blue-600"
              >
                {product.category.name}
              </Link>
            </>
          )}
          {" / "}
          <span className="text-gray-700">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <img
                src={`https://picsum.photos/seed/${product.id}/800/800`}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            )}
          </div>

          <div className="flex flex-col">
            {product.category && (
              <span className="text-xs font-medium uppercase tracking-wide text-blue-600">
                {product.category.name}
              </span>
            )}
            <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
              {product.name}
            </h1>
            <div className="mt-2 flex items-center gap-2">
              <StarRating rating={product.rating} />
              <span className="text-sm text-gray-500">
                {product.rating.toFixed(1)} / 5
              </span>
            </div>

            <p className="mt-4 text-3xl font-bold text-gray-900">
              {formatPrice(product.price, product.currency)}
            </p>

            <p className="mt-4 leading-relaxed text-gray-600">
              {product.description}
            </p>

            <p className="mt-4 text-sm">
              {outOfStock ? (
                <span className="font-medium text-red-600">Out of stock</span>
              ) : (
                <span className="font-medium text-green-600">
                  In stock — {product.stock} available
                </span>
              )}
            </p>

            {!outOfStock && (
              <div className="mt-6 flex items-center gap-3">
                <div className="flex items-center rounded-md border border-gray-300">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-50"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock, q + 1))
                    }
                    className="px-3 py-2 text-gray-600 hover:bg-gray-50"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="flex-1 rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60 sm:flex-none"
                >
                  {adding ? "Adding..." : "Add to cart"}
                </button>
              </div>
            )}

            {feedback && (
              <p
                className={`mt-3 text-sm ${feedback.type === "success" ? "text-green-600" : "text-red-600"}`}
              >
                {feedback.text}
              </p>
            )}

            {!user && (
              <p className="mt-3 text-sm text-gray-500">
                <Link to="/login" className="text-blue-600 hover:underline">
                  Sign in
                </Link>{" "}
                to add items to your cart.
              </p>
            )}
          </div>
        </div>
      </div>

      <ProductRow
        title="Related products"
        subtitle="More from this category"
        products={related}
      />
      <ProductRow title="Customers also viewed" products={alsoViewed} />
    </div>
  );
}
