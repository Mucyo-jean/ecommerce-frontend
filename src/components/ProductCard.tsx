import { Link } from "react-router-dom";
import type { Product } from "../types";
import { formatPrice } from "../lib/format";
import StarRating from "./StarRating";

export default function ProductCard({ product }: { product: Product }) {
  const outOfStock = product.stock <= 0;

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:shadow-lg"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <img
            src={`https://picsum.photos/seed/${product.id}/400/400`}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        )}
        {outOfStock && (
          <span className="absolute left-2 top-2 rounded bg-gray-900/80 px-2 py-1 text-xs font-medium text-white">
            Out of stock
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        {product.category && (
          <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
            {product.category.name}
          </span>
        )}
        <h3 className="line-clamp-2 text-sm font-medium text-gray-800 group-hover:text-blue-600">
          {product.name}
        </h3>
        <StarRating rating={product.rating} className="mt-0.5" />
        <p className="mt-1 text-base font-semibold text-gray-900">
          {formatPrice(product.price, product.currency)}
        </p>
      </div>
    </Link>
  );
}
