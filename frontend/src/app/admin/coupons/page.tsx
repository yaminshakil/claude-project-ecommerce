'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Coupon, ApiResponse } from '@/types';

// ─── types ────────────────────────────────────────────────────────────────────

interface ModalState {
  mode: 'create' | 'edit';
  data: Partial<Coupon>;
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function isExpired(dateStr?: string) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function formatExpiry(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString();
}

// ─── modal ────────────────────────────────────────────────────────────────────

function CouponModal({
  modal,
  onClose,
  onSave,
  isSaving,
}: {
  modal: ModalState;
  onClose: () => void;
  onSave: (data: Partial<Coupon>) => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<Partial<Coupon>>(modal.data);
  const set = (field: keyof Coupon, value: unknown) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">
          {modal.mode === 'create' ? 'Add Coupon' : 'Edit Coupon'}
        </h2>

        <div className="space-y-4">
          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
            <input
              type="text"
              value={form.code ?? ''}
              onChange={(e) => set('code', e.target.value.toUpperCase())}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
              placeholder="e.g. SAVE20"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
            <select
              value={form.type ?? 'percentage'}
              onChange={(e) => set('type', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount ($)</option>
            </select>
          </div>

          {/* Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Value {form.type === 'percentage' ? '(%)' : '($)'}
            </label>
            <input
              type="number"
              min="0"
              step={form.type === 'percentage' ? '1' : '0.01'}
              value={form.value ?? ''}
              onChange={(e) => set('value', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>

          {/* Min order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Order Amount ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.min_order_amount ?? ''}
              onChange={(e) => set('min_order_amount', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>

          {/* Max uses */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Uses <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="number"
              min="1"
              value={form.max_uses ?? ''}
              onChange={(e) => set('max_uses', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Unlimited"
            />
          </div>

          {/* Expires at */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="date"
              value={form.expires_at ? form.expires_at.split('T')[0] : ''}
              onChange={(e) => set('expires_at', e.target.value || undefined)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-gray-700">Active</span>
            <button
              type="button"
              onClick={() => set('is_active', !form.is_active)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.is_active ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  form.is_active ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={isSaving || !form.code?.trim()}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function AdminCouponsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<ModalState | null>(null);
  const [search, setSearch] = useState('');

  const { data: coupons = [], isLoading, isError } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Coupon[]>>('/admin/coupons');
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: Partial<Coupon>) => api.post('/admin/coupons', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
      setModal(null);
      toast.success('Coupon created');
    },
    onError: () => toast.error('Failed to create coupon'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Partial<Coupon> }) =>
      api.put(`/admin/coupons/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
      setModal(null);
      toast.success('Coupon updated');
    },
    onError: () => toast.error('Failed to update coupon'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/coupons/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success('Coupon deleted');
    },
    onError: () => toast.error('Failed to delete coupon'),
  });

  const handleSave = (form: Partial<Coupon>) => {
    if (modal?.mode === 'edit' && form.id) {
      updateMutation.mutate({ id: form.id, body: form });
    } else {
      createMutation.mutate({ ...form, is_active: form.is_active ?? true });
    }
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('Delete this coupon?')) return;
    deleteMutation.mutate(id);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const filtered = coupons.filter(
    (c) => !search || c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {modal && (
        <CouponModal
          modal={modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-500 mt-0.5">{coupons.length} total coupons</p>
        </div>
        <button
          onClick={() => setModal({ mode: 'create', data: { type: 'percentage', is_active: true, min_order_amount: 0 } })}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span className="text-lg leading-none">+</span>
          Add Coupon
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search coupon codes..."
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
            Failed to load coupons. Please try again.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Code</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Type</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Value</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Min Order</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Uses</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Expiry</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 8 }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-200 rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-gray-400">
                      No coupons found
                    </td>
                  </tr>
                ) : (
                  filtered.map((coupon) => {
                    const expired = isExpired(coupon.expires_at);
                    return (
                      <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 font-mono text-xs rounded font-semibold">
                            {coupon.code}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              coupon.type === 'percentage'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {coupon.type === 'percentage' ? '%' : '$'}
                            <span className="capitalize">{coupon.type}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          {coupon.type === 'percentage'
                            ? `${coupon.value}%`
                            : `$${Number(coupon.value).toFixed(2)}`}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          ${Number(coupon.min_order_amount).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600">
                          {coupon.used_count}
                          {coupon.max_uses ? ` / ${coupon.max_uses}` : ' / ∞'}
                        </td>
                        <td className={`px-4 py-3 ${expired ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                          {formatExpiry(coupon.expires_at)}
                          {expired && (
                            <span className="ml-1 text-xs text-red-500">(expired)</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              coupon.is_active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {coupon.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setModal({ mode: 'edit', data: { ...coupon } })}
                              className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(coupon.id)}
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
      </div>
    </div>
  );
}
