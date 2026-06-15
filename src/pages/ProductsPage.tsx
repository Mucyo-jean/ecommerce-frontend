import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { listProducts } from "../api/products";
import type { Pagination as PaginationType, Product } from "../types";
import { useCategories } from "../hooks/useCategories";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import Spinner from "../components/Spinner";

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories } = useCategories();

  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const search = searchParams.get("search") ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";
  const sort = searchParams.get("sort") ?? "newest";
  const page = Number(searchParams.get("page") ?? "1");
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";

  const [minPriceInput, setMinPriceInput] = useState(minPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listProducts({
        search: search || undefined,
        categoryId: categoryId || undefined,
        sort: sort as "newest" | "price_asc" | "price_desc" | "rating",
        page,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        limit: 12,
      });
      setProducts(res.items);
      setPagination(res.pagination);
    } catch {
      setError("Could not load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search, categoryId, sort, page, minPrice, maxPrice]);

  useEffect(() => {
    let active = true;
    const timeoutId = window.setTimeout(() => {
      if (!active) return;
      void loadProducts();
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [loadProducts]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setSearchParams(next);
  }

  function applyPriceFilter(e: React.FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (minPriceInput) next.set("minPrice", minPriceInput);
    else next.delete("minPrice");
    if (maxPriceInput) next.set("maxPrice", maxPriceInput);
    else next.delete("maxPrice");
    next.delete("page");
    setSearchParams(next);
  }

  function clearFilters() {
    setSearchParams({});
  }

  const activeCategory = categories.find((c) => c.id === categoryId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">
          {activeCategory
            ? activeCategory.name
            : search
              ? `Results for "${search}"`
              : "All Products"}
        </h1>
        {pagination && (
          <p className="text-sm text-gray-500">
            {pagination.total} products found
          </p>
        )}
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="shrink-0 lg:w-60">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Categories
            </h3>
            <ul className="space-y-1.5 text-sm">
              <li>
                <button
                  onClick={() => updateParam("categoryId", "")}
                  className={`text-left hover:text-blue-600 ${!categoryId ? "font-semibold text-blue-600" : "text-gray-600"}`}
                >
                  All categories
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => updateParam("categoryId", cat.id)}
                    className={`text-left hover:text-blue-600 ${categoryId === cat.id ? "font-semibold text-blue-600" : "text-gray-600"}`}
                  >
                    {cat.name}
                    {cat._count && (
                      <span className="ml-1 text-xs text-gray-400">
                        ({cat._count.products})
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>

            <h3 className="mb-2 mt-5 text-sm font-semibold text-gray-900">
              Price range (RWF)
            </h3>
            <form
              onSubmit={applyPriceFilter}
              className="flex items-center gap-2"
            >
              <input
                type="number"
                min={0}
                placeholder="Min"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                min={0}
                placeholder="Max"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </form>
            <button
              onClick={applyPriceFilter}
              className="mt-2 w-full rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              Apply
            </button>

            {(categoryId || search || minPrice || maxPrice) && (
              <button
                onClick={clearFilters}
                className="mt-3 w-full text-center text-xs font-medium text-blue-600 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        </aside>

        <div className="flex-1">
          <div className="mb-4 flex items-center justify-end">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              Sort by
              <select
                value={sort}
                onChange={(e) => updateParam("sort", e.target.value)}
                className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <Spinner />
            </div>
          ) : error ? (
            <p className="py-12 text-center text-sm text-red-600">{error}</p>
          ) : products.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500">
              No products match your filters.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {pagination && (
            <Pagination
              pagination={pagination}
              onPageChange={(p) => {
                const next = new URLSearchParams(searchParams);
                next.set("page", String(p));
                setSearchParams(next);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
