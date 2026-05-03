'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { Order, PaginatedResponse, ApiResponse } from '@/types';

// ─── types ────────────────────────────────────────────────────────────────────

interface AdminOrder extends Order {
  order_number: string;
  user: { name: string; email: string };
  payment_method: 'cod' | 'stripe';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-orange-100 text-orange-700',
};

const PAYMENT_BADGE: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-orange-100 text-orange-700',
};

const STATUS_OPTIONS = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] as const;

// ─── page ─────────────────────────────────────────────────────────────────────

export default function AdminOrdersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => { setPage(1); }, [debouncedSearch, status]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-orders', debouncedSearch, status, page],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedResponse<AdminOrder>>>('/admin/orders', {
        params: {
          page,
          search: debouncedSearch || undefined,
          status: status === 'all' ? undefined : status,
        },
      });
      return res.data.data;
    },
  });

  const orders = data?.data ?? [];
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? 0;
  const pageNumbers = Array.from({ length: lastPage }, (_, i) => i + 1);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by order # or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Status filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white capitalize"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isError ? (
          <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            Failed to load orders. Please try again.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Order #</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Payment</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Method</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Total</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Date</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 8 }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-200 rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-gray-400">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-semibold text-blue-600 hover:text-blue-700"
                        >
                          #{order.order_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{order.user?.name}</p>
                        <p className="text-xs text-gray-400">{order.user?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            STATUS_BADGE[order.status] ?? 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            PAYMENT_BADGE[order.payment_status] ?? 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 uppercase text-xs font-medium">
                        {order.payment_method}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        ${Number(order.total).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !isError && lastPage > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">Page {page} of {lastPage}</p>
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
