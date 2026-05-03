'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { User, PaginatedResponse, ApiResponse } from '@/types';

// ─── helpers ──────────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

// Lock icon
function LockIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

// Unlock icon
function UnlockIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
    </svg>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function AdminCustomersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 400);
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-customers', debouncedSearch, page],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedResponse<User>>>('/admin/customers', {
        params: { page, search: debouncedSearch || undefined },
      });
      return res.data.data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => api.put(`/admin/customers/${id}/toggle-status`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-customers'] });
      toast.success('Customer status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  const customers = data?.data ?? [];
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? 0;
  const pageNumbers = Array.from({ length: lastPage }, (_, i) => i + 1);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total customers</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isError ? (
          <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            Failed to load customers. Please try again.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Phone</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Role</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Joined</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-200 rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-gray-400">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      {/* Avatar + Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {getInitials(customer.name)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{customer.name}</p>
                            <p className="text-xs text-gray-400">{customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{customer.phone ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            customer.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {customer.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            customer.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {customer.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(customer.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => toggleMutation.mutate(customer.id)}
                          disabled={toggleMutation.isPending}
                          title={customer.is_active ? 'Deactivate' : 'Activate'}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors disabled:opacity-50 ${
                            customer.is_active
                              ? 'text-red-600 border-red-200 hover:bg-red-50'
                              : 'text-green-600 border-green-200 hover:bg-green-50'
                          }`}
                        >
                          {customer.is_active ? <LockIcon /> : <UnlockIcon />}
                          {customer.is_active ? 'Deactivate' : 'Activate'}
                        </button>
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
