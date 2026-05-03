'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ShoppingBag, Truck, Shield, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { storageUrl } from '@/lib/storage';
import { Product, Category, PaginatedResponse, ApiResponse } from '@/types';
import ProductCard from '@/components/store/ProductCard';

function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-2xl">
          <span className="inline-block bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            New Season, New Arrivals
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Shop the Latest
            <br />
            <span className="text-blue-200">Trends Online</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed">
            Discover thousands of products at unbeatable prices. Free shipping on
            orders over $50.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
            >
              Shop Now
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/products?is_featured=1"
              className="inline-flex items-center gap-2 bg-transparent border-2 border-white/60 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors"
            >
              View Featured
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesBar() {
  const features = [
    { icon: Truck, label: 'Free Shipping', desc: 'On orders over $50' },
    { icon: Shield, label: 'Secure Payment', desc: '100% protected' },
    { icon: RefreshCw, label: 'Easy Returns', desc: '30-day policy' },
    { icon: ShoppingBag, label: '10k+ Products', desc: 'Wide selection' },
  ];
  return (
    <section className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="bg-blue-50 rounded-xl p-3 flex-shrink-0">
                <Icon size={22} className="text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedProducts() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const res = await api.get('/products', {
        params: { is_featured: 1, per_page: 8 },
      });
      return res.data.data as PaginatedResponse<Product>;
    },
  });

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Featured Products
            </h2>
            <p className="text-gray-500 mt-1">Handpicked top sellers just for you</p>
          </div>
          <Link
            href="/products?is_featured=1"
            className="hidden md:inline-flex items-center gap-1 text-blue-600 font-medium hover:text-blue-700 text-sm"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="text-center py-12 text-gray-500">
            Failed to load featured products.
          </div>
        )}

        {data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {data.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/products?is_featured=1"
            className="inline-flex items-center gap-1 text-blue-600 font-medium text-sm"
          >
            View all featured <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CategoriesSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['categories-home'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Category[]>>('/categories');
      return res.data.data;
    },
  });

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Shop by Category
          </h2>
          <p className="text-gray-500">Find what you&apos;re looking for</p>
        </div>

        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3" />
                <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto" />
              </div>
            ))}
          </div>
        )}

        {data && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {data.slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="bg-white rounded-xl p-6 flex flex-col items-center gap-3 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden group-hover:bg-blue-100 transition-colors">
                  {storageUrl(cat.image) ? (
                    <Image
                      src={storageUrl(cat.image)!}
                      alt={cat.name}
                      width={64}
                      height={64}
                      className="object-cover rounded-full"
                      unoptimized
                    />
                  ) : (
                    <ShoppingBag size={28} className="text-blue-500" />
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-800 text-center group-hover:text-blue-600 transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 font-medium px-6 py-2.5 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            All Categories <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesBar />
      <FeaturedProducts />
      <CategoriesSection />
    </>
  );
}
