'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Category, ApiResponse } from '@/types';

// ─── types ───────────────────────────────────────────────────────────────────

interface CategoryWithParent extends Category {
  parent?: { name: string };
}

interface ModalState {
  mode: 'create' | 'edit';
  data: Partial<CategoryWithParent>;
}

// ─── slug helper ─────────────────────────────────────────────────────────────

function toSlug(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ─── modal ───────────────────────────────────────────────────────────────────

function CategoryModal({
  modal,
  categories,
  onClose,
  onSave,
  isSaving,
}: {
  modal: ModalState;
  categories: CategoryWithParent[];
  onClose: () => void;
  onSave: (data: Partial<CategoryWithParent>) => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<Partial<CategoryWithParent>>(modal.data);

  // Keep slug in sync with name (only for new)
  useEffect(() => {
    if (modal.mode === 'create') {
      setForm((f) => ({ ...f, slug: toSlug(f.name ?? '') }));
    }
  }, [form.name, modal.mode]);

  const set = (field: keyof CategoryWithParent, value: unknown) =>
    setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">
          {modal.mode === 'create' ? 'Add Category' : 'Edit Category'}
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
              placeholder="Category name"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input
              type="text"
              value={form.slug ?? ''}
              onChange={(e) => set('slug', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              placeholder="auto-generated"
            />
          </div>

          {/* Parent */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
            <select
              value={form.parent_id ?? ''}
              onChange={(e) => set('parent_id', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">None (top-level)</option>
              {categories
                .filter((c) => c.id !== form.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
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

// ─── page ────────────────────────────────────────────────────────────────────

export default function AdminCategoriesPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<ModalState | null>(null);
  const [search, setSearch] = useState('');

  const { data: categories = [], isLoading, isError } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<CategoryWithParent[]>>('/admin/categories');
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: Partial<CategoryWithParent>) => api.post('/admin/categories', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
      qc.invalidateQueries({ queryKey: ['categories-flat'] });
      setModal(null);
      toast.success('Category created');
    },
    onError: () => toast.error('Failed to create category'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Partial<CategoryWithParent> }) =>
      api.put(`/admin/categories/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
      qc.invalidateQueries({ queryKey: ['categories-flat'] });
      setModal(null);
      toast.success('Category updated');
    },
    onError: () => toast.error('Failed to update category'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
      qc.invalidateQueries({ queryKey: ['categories-flat'] });
      toast.success('Category deleted');
    },
    onError: () => toast.error('Failed to delete category'),
  });

  const handleSave = (form: Partial<CategoryWithParent>) => {
    if (modal?.mode === 'edit' && form.id) {
      updateMutation.mutate({ id: form.id, body: form });
    } else {
      createMutation.mutate({ ...form, is_active: form.is_active ?? true });
    }
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('Delete this category?')) return;
    deleteMutation.mutate(id);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const filtered = categories.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {modal && (
        <CategoryModal
          modal={modal}
          categories={categories}
          onClose={() => setModal(null)}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">{categories.length} total categories</p>
        </div>
        <button
          onClick={() => setModal({ mode: 'create', data: { is_active: true } })}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span className="text-lg leading-none">+</span>
          Add Category
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
            placeholder="Search categories..."
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
            Failed to load categories. Please try again.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Name</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Slug</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Parent</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Status</th>
                  <th className="px-5 py-3 text-right font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
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
                      No categories found
                    </td>
                  </tr>
                ) : (
                  filtered.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-900">{cat.name}</td>
                      <td className="px-5 py-3 text-gray-500 font-mono text-xs">{cat.slug}</td>
                      <td className="px-5 py-3 text-gray-600">
                        {cat.parent?.name ?? (
                          cat.parent_id
                            ? categories.find((c) => c.id === cat.parent_id)?.name ?? '—'
                            : '—'
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            cat.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {cat.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setModal({ mode: 'edit', data: { ...cat } })}
                            className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
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
      </div>
    </div>
  );
}
