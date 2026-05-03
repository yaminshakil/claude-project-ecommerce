'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Brand, ApiResponse } from '@/types';

// ─── types ────────────────────────────────────────────────────────────────────

interface ModalState {
  mode: 'create' | 'edit';
  data: Partial<Brand>;
}

// ─── modal ────────────────────────────────────────────────────────────────────

function BrandModal({
  modal,
  onClose,
  onSave,
  isSaving,
}: {
  modal: ModalState;
  onClose: () => void;
  onSave: (data: Partial<Brand>) => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<Partial<Brand>>(modal.data);
  const set = (field: keyof Brand, value: unknown) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">
          {modal.mode === 'create' ? 'Add Brand' : 'Edit Brand'}
        </h2>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={form.name ?? ''}
              onChange={(e) => set('name', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brand name"
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
            disabled={isSaving || !form.name?.trim()}
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

export default function AdminBrandsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<ModalState | null>(null);
  const [search, setSearch] = useState('');

  const { data: brands = [], isLoading, isError } = useQuery({
    queryKey: ['admin-brands'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Brand[]>>('/admin/brands');
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: Partial<Brand>) => api.post('/admin/brands', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-brands'] });
      setModal(null);
      toast.success('Brand created');
    },
    onError: () => toast.error('Failed to create brand'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Partial<Brand> }) =>
      api.put(`/admin/brands/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-brands'] });
      setModal(null);
      toast.success('Brand updated');
    },
    onError: () => toast.error('Failed to update brand'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/brands/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-brands'] });
      toast.success('Brand deleted');
    },
    onError: () => toast.error('Failed to delete brand'),
  });

  const handleSave = (form: Partial<Brand>) => {
    if (modal?.mode === 'edit' && form.id) {
      updateMutation.mutate({ id: form.id, body: form });
    } else {
      createMutation.mutate({ ...form, is_active: form.is_active ?? true });
    }
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('Delete this brand?')) return;
    deleteMutation.mutate(id);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const filtered = brands.filter(
    (b) =>
      !search ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {modal && (
        <BrandModal
          modal={modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
          <p className="text-sm text-gray-500 mt-0.5">{brands.length} total brands</p>
        </div>
        <button
          onClick={() => setModal({ mode: 'create', data: { is_active: true } })}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span className="text-lg leading-none">+</span>
          Add Brand
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
            placeholder="Search brands..."
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
            Failed to load brands. Please try again.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Logo</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Name</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Slug</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Status</th>
                  <th className="px-5 py-3 text-right font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 5 }).map((__, j) => (
                        <td key={j} className="px-5 py-3">
                          <div className="h-4 bg-gray-200 rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-gray-400">
                      No brands found
                    </td>
                  </tr>
                ) : (
                  filtered.map((brand) => {
                    const initials = brand.name
                      .split(' ')
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join('')
                      .toUpperCase();

                    return (
                      <tr key={brand.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          {brand.logo ? (
                            <img
                              src={`http://localhost:8000/storage/${brand.logo}`}
                              alt={brand.name}
                              className="w-10 h-10 object-contain rounded-lg border border-gray-200 bg-gray-50"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xs font-bold">
                              {initials}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3 font-medium text-gray-900">{brand.name}</td>
                        <td className="px-5 py-3 text-gray-500 font-mono text-xs">{brand.slug}</td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              brand.is_active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {brand.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setModal({ mode: 'edit', data: { ...brand } })}
                              className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(brand.id)}
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
