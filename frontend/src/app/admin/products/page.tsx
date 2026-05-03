'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { storageUrl } from '@/lib/storage';
import { Product, Category, PaginatedResponse, ApiResponse } from '@/types';

// ─── helpers ────────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-gray-100">
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded w-full" />
        </td>
      ))}
    </tr>
  );
}

// ─── page ───────────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const qc = useQueryClient();

  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);

  const debouncedSearch = useDebounce(search, 400);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [debouncedSearch, categoryId]);

  // ── fetch products ──
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-products', debouncedSearch, categoryId, page],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedResponse<Product>>>('/admin/products', {
        params: { page, search: debouncedSearch || undefined, category: categoryId || undefined },
      });
      return res.data.data;
    },
  });

  // ── fetch categories for filter ──
  const { data: categories } = useQuery({
    queryKey: ['categories-flat'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Category[]>>('/categories');
      return res.data.data;
    },
  });

  // ── delete single ──
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/products/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted');
    },
    onError: () => toast.error('Failed to delete product'),
  });

  // ── bulk delete ──
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(ids.map((id) => api.delete(`/admin/products/${id}`)));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      setSelected([]);
      toast.success('Selected products deleted');
    },
    onError: () => toast.error('Failed to delete some products'),
  });

  const products = data?.data ?? [];
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? 0;

  // ── selection helpers ──
  const allSelected = products.length > 0 && products.every((p) => selected.includes(p.id));

  const toggleAll = useCallback(() => {
    setSelected(allSelected ? [] : products.map((p) => p.id));
  }, [allSelected, products]);

  const toggleOne = useCallback((id: number) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }, []);

  const handleDelete = (id: number) => {
    if (!window.confirm('Delete this product?')) return;
    deleteMutation.mutate(id);
  };

  const handleBulkDelete = () => {
    if (!selected.length) return;
    if (!window.confirm(`Delete ${selected.length} selected product(s)?`)) return;
    bulkDeleteMutation.mutate(selected);
  };

  // ── pagination pages ──
  const pageNumbers = Array.from({ length: lastPage }, (_, i) => i + 1);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total products</p>
        </div>
        <Link
          href="/admin/products/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span className="text-lg leading-none">+</span>
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Categories</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {selected.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              Delete Selected ({selected.length})
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isError ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl m-4 text-red-700 text-sm">
            Failed to load products. Please try again.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Image</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Name / SKU</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Category</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Price</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Stock</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-gray-400">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const firstImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0];
                    const stockColor =
                      product.stock === 0
                        ? 'text-red-600 font-semibold'
                        : product.stock <= 5
                        ? 'text-orange-500 font-semibold'
                        : 'text-gray-900';

                    return (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selected.includes(product.id)}
                            onChange={() => toggleOne(product.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          {firstImage && storageUrl(firstImage.image_path) ? (
                            <img
                              src={storageUrl(firstImage.image_path)!}
                              alt={firstImage.alt_text ?? product.name}
                              className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                              N/A
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">SKU: {product.sku}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{product.category?.name ?? '—'}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          ${Number(product.price).toFixed(2)}
                        </td>
                        <td className={`px-4 py-3 text-right ${stockColor}`}>{product.stock}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              product.is_active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(product.id)}
                              disabled={deleteMutation.isPending}
                              className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !isError && lastPage > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Page {page} of {lastPage}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>
              {pageNumbers
                .filter((n) => n === 1 || n === lastPage || Math.abs(n - page) <= 2)
                .reduce<(number | '...')[]>((acc, n, i, arr) => {
                  if (i > 0 && typeof arr[i - 1] === 'number' && (n as number) - (arr[i - 1] as number) > 1) {
                    acc.push('...');
                  }
                  acc.push(n);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item as number)}
                      className={`px-3 py-1.5 text-sm border rounded-lg transition-colors ${
                        page === item
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                disabled={page === lastPage}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
