'use client';

import { use, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import { Product, Category, Brand, PaginatedResponse, ApiResponse } from '@/types';
import ProductCard from '@/components/store/ProductCard';

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const SORT_OPTIONS = [
  { value: '', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A-Z' },
];

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = use(searchParams);
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const page = Number(params.page ?? 1);
  const category = (params.category as string) ?? '';
  const brand = (params.brand as string) ?? '';
  const sort = (params.sort as string) ?? '';
  const search = (params.search as string) ?? '';
  const isFeatured = params.is_featured === '1';
  const minPrice = (params.min_price as string) ?? '';
  const maxPrice = (params.max_price as string) ?? '';

  const updateParams = useCallback(
    (updates: Record<string, string | number | undefined>) => {
      const current = new URLSearchParams();
      if (page > 1) current.set('page', String(page));
      if (category) current.set('category', category);
      if (brand) current.set('brand', brand);
      if (sort) current.set('sort', sort);
      if (search) current.set('search', search);
      if (isFeatured) current.set('is_featured', '1');
      if (minPrice) current.set('min_price', minPrice);
      if (maxPrice) current.set('max_price', maxPrice);

      Object.entries(updates).forEach(([key, val]) => {
        if (val === undefined || val === '' || val === 0) {
          current.delete(key);
        } else {
          current.set(key, String(val));
        }
      });
      // reset page on filter change unless explicitly setting page
      if (!('page' in updates)) current.delete('page');
      router.push(`/products?${current.toString()}`);
    },
    [page, category, brand, sort, search, isFeatured, minPrice, maxPrice, router]
  );

  const { data: productsData, isLoading, isError } = useQuery({
    queryKey: ['products', { page, category, brand, sort, search, isFeatured, minPrice, maxPrice }],
    queryFn: async () => {
      const queryParams: Record<string, string | number | boolean> = { page, per_page: 12 };
      if (category) queryParams.category = category;
      if (brand) queryParams.brand = brand;
      if (sort) queryParams.sort = sort;
      if (search) queryParams.search = search;
      if (isFeatured) queryParams.is_featured = 1;
      if (minPrice) queryParams.min_price = minPrice;
      if (maxPrice) queryParams.max_price = maxPrice;
      const res = await api.get<PaginatedResponse<Product>>('/products', { params: queryParams });
      return res.data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Category[]>>('/categories');
      return res.data.data;
    },
  });

  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Brand[]>>('/brands');
      return res.data.data;
    },
  });

  const totalPages = productsData?.last_page ?? 1;

  const Sidebar = () => (
    <aside className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
          Category
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => updateParams({ category: '' })}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !category ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Categories
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParams({ category: cat.slug })}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                category === cat.slug
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      {brands && brands.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
            Brand
          </h3>
          <div className="space-y-1">
            <button
              onClick={() => updateParams({ brand: '' })}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                !brand ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Brands
            </button>
            {brands.map((b) => (
              <button
                key={b.id}
                onClick={() => updateParams({ brand: b.slug })}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  brand === b.slug
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
          Price Range
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={minPrice}
            onBlur={(e) => updateParams({ min_price: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
          <span className="text-gray-400 text-sm">–</span>
          <input
            type="number"
            placeholder="Max"
            defaultValue={maxPrice}
            onBlur={(e) => updateParams({ max_price: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Clear Filters */}
      {(category || brand || minPrice || maxPrice) && (
        <button
          onClick={() => router.push('/products')}
          className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
        >
          <X size={14} /> Clear All Filters
        </button>
      )}
    </aside>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {search ? `Results for "${search}"` : isFeatured ? 'Featured Products' : 'All Products'}
          </h1>
          {productsData && (
            <p className="text-gray-500 text-sm mt-1">
              {productsData.total} product{productsData.total !== 1 ? 's' : ''} found
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-56 flex-shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-white overflow-y-auto p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg text-gray-900">Filters</h2>
                <button onClick={() => setSidebarOpen(false)}>
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
              <Sidebar />
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="flex-1 min-w-0">
          {isLoading && (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
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
            <div className="text-center py-20 text-gray-500">
              Failed to load products. Please try again.
            </div>
          )}

          {productsData && productsData.data.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No products found.</p>
              <button
                onClick={() => router.push('/products')}
                className="mt-4 text-blue-600 font-medium hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}

          {productsData && productsData.data.length > 0 && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productsData.data.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => updateParams({ page: page - 1 })}
                    disabled={page <= 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
                    .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, idx) =>
                      p === '...' ? (
                        <span key={`dots-${idx}`} className="px-2 text-gray-400">
                          ...
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => updateParams({ page: p as number })}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                            page === p
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                  <button
                    onClick={() => updateParams({ page: page + 1 })}
                    disabled={page >= totalPages}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
