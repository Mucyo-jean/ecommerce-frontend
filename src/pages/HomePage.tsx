import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listProducts } from "../api/products";
import * as recommendationsApi from "../api/recommendations";
import type { Product } from "../types";
import { useAuthStore } from "../store/authStore";
import { useCategories } from "../hooks/useCategories";
import ProductRow from "../components/ProductRow";

import { demoProducts } from "../lib/demo-data";

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const { categories } = useCategories();
  const [newest, setNewest] = useState<Product[]>(demoProducts);
  const [trending, setTrending] = useState<Product[]>([]);
  const [forYou, setForYou] = useState<Product[]>([]);

  useEffect(() => {
    listProducts({ sort: "newest", limit: 10 })
      .then((res) => setNewest(res.items))
      .catch(() => undefined);
    recommendationsApi
      .trending()
      .then(setTrending)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!user) return;
    recommendationsApi
      .forYou()
      .then(setForYou)
      .catch(() => undefined);
  }, [user]);

  const personalizedProducts = user ? forYou : [];

  return (
    <div>
      <section className="bg-gradient-to-r from-blue-700 to-blue-500 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-16 sm:px-6 md:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-100">
              Welcome to Matic All in One Shop
            </p>
            <h1 className="mt-2 text-4xl font-bold leading-tight sm:text-5xl">
              Everything you need, delivered across Rwanda
            </h1>
            <p className="mt-4 text-blue-100">
              Electronics, fashion, home essentials, groceries and authentic
              Rwandan handicrafts — all in one place.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-block rounded-md bg-white px-6 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              Shop now →
            </Link>
          </div>
          
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Shop by category
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?categoryId=${cat.id}`}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-6 text-center transition hover:border-blue-300 hover:shadow-md"
              >
                {cat.imageUrl ? (
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-lg font-bold text-blue-600">
                    {cat.name.charAt(0)}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <ProductRow
        title="New arrivals"
        subtitle="Freshly added to the store"
        products={newest}
      />
      <ProductRow
        title="Trending now"
        subtitle="Popular with other shoppers"
        products={trending}
      />
      {user && (
        <ProductRow
          title="Picked for you"
          subtitle={`Recommended for ${user.name.split(" ")[0]}`}
          products={personalizedProducts}
        />
      )}

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gray-900 px-8 py-10 text-center text-white">
          <h2 className="text-2xl font-bold">
            Proudly Rwandan, built for everyone
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-gray-300">
            From Akabanga to Imigongo art, discover handcrafted products
            alongside the latest electronics and fashion.
          </p>
          <Link
            to="/products"
            className="mt-5 inline-block rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold hover:bg-blue-500"
          >
            Browse all products
          </Link>
        </div>
      </section>
    </div>
  );
}
