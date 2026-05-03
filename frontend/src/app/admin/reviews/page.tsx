'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Review, PaginatedResponse, ApiResponse } from '@/types';

// ─── helpers ──────────────────────────────────────────────────────────────────

type StatusTab = 'all' | 'pending' | 'approved';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={i < rating ? 'text-yellow-400' : 'text-gray-300'}
          style={{ fontSize: '14px', lineHeight: 1 }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function truncate(str: string, max: number) {
  return str.length <= max ? str : str.slice(0, max) + '…';
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function AdminReviewsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<StatusTab>('all');
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [tab]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-reviews', tab, page],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedResponse<Review>>>('/admin/reviews', {
        params: {
          page,
          status: tab === 'all' ? undefined : tab,
        },
      });
      return res.data.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => api.put(`/admin/reviews/${id}/approve`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success('Review approved');
    },
    onError: () => toast.error('Failed to approve review'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/reviews/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success('Review deleted');
    },
    onError: () => toast.error('Failed to delete review'),
  });

  const handleDelete = (id: number) => {
    if (!window.confirm('Delete this review?')) return;
    deleteMutation.mutate(id);
  };

  const reviews = data?.data ?? [];
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? 0;
  const pageNumbers = Array.from({ length: lastPage }, (_, i) => i + 1);

  const TABS: { key: StatusTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total reviews</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-1 inline-flex gap-1">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === key
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isError ? (
          <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            Failed to load reviews. Please try again.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Rating</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Product</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Comment</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  Array.from({ length: 7 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-200 rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : reviews.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-gray-400">
                      No reviews found
                    </td>
                  </tr>
                ) : (
                  reviews.map((review) => (
                    <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <StarRating rating={review.rating} />
                        <span className="text-xs text-gray-400 mt-0.5 block">
                          {review.rating}/5
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 line-clamp-1 max-w-[160px]">
                          {review.product?.name ?? '—'}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {review.user?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[240px]">
                        {review.title && (
                          <p className="font-medium text-gray-800 text-xs mb-0.5">{truncate(review.title, 40)}</p>
                        )}
                        <p className="text-xs">{truncate(review.comment, 80)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            review.is_approved
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {review.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(review.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!review.is_approved && (
                            <button
                              onClick={() => approveMutation.mutate(review.id)}
                              disabled={approveMutation.isPending}
                              className="px-3 py-1.5 text-xs font-medium text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(review.id)}
                            disabled={deleteMutation.isPending}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
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
