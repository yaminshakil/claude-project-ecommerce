'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Upload, X, Star, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { storageUrl } from '@/lib/storage';
import { Category, Brand, ApiResponse } from '@/types';

function toSlug(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

interface ProductForm {
  name: string;
  slug: string;
  short_description: string;
  description: string;
  price: string;
  compare_price: string;
  sku: string;
  stock: string;
  low_stock_threshold: string;
  category_id: string;
  brand_id: string;
  weight: string;
  is_featured: boolean;
  is_active: boolean;
}

interface ProductImage {
  id: number;
  image_path: string;
  alt_text?: string;
  is_primary: boolean;
  sort_order: number;
}

const defaultForm: ProductForm = {
  name: '',
  slug: '',
  short_description: '',
  description: '',
  price: '',
  compare_price: '',
  sku: '',
  stock: '0',
  low_stock_threshold: '5',
  category_id: '',
  brand_id: '',
  weight: '',
  is_featured: false,
  is_active: true,
};

export default function CreateProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ProductForm>(defaultForm);
  const [slugManual, setSlugManual] = useState(false);
  const [createdId, setCreatedId] = useState<number | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    if (!slugManual) {
      setForm((f) => ({ ...f, slug: toSlug(f.name) }));
    }
  }, [form.name, slugManual]);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories-flat'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Category[]>>('/categories');
      return res.data.data;
    },
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['brands-flat'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Brand[]>>('/admin/brands');
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: object) => api.post<ApiResponse<{ id: number }>>('/admin/products', body),
    onSuccess: (res) => {
      toast.success('Product created! Now add images below.');
      setCreatedId(res.data.data.id);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Failed to create product');
    },
  });

  const set = (field: keyof ProductForm, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Product name is required');
    if (!form.price) return toast.error('Price is required');
    createMutation.mutate({
      ...form,
      price: parseFloat(form.price) || 0,
      compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
      stock: parseInt(form.stock) || 0,
      low_stock_threshold: parseInt(form.low_stock_threshold) || 5,
      weight: form.weight ? parseFloat(form.weight) : null,
      category_id: form.category_id ? parseInt(form.category_id) : null,
      brand_id: form.brand_id ? parseInt(form.brand_id) : null,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!createdId) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append('images[]', file));
      const res = await api.post<ApiResponse<ProductImage[]>>(
        `/admin/products/${createdId}/images`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      const newImages = res.data.data;
      setImages((prev) => [...prev, ...newImages]);
      toast.success(`${newImages.length} image(s) uploaded`);
    } catch {
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!createdId) return;
    try {
      await api.delete(`/admin/products/${createdId}/images/${imageId}`);
      setImages((prev) => {
        const remaining = prev.filter((img) => img.id !== imageId);
        if (remaining.length > 0 && !remaining.some((img) => img.is_primary)) {
          remaining[0] = { ...remaining[0], is_primary: true };
        }
        return remaining;
      });
      toast.success('Image deleted');
    } catch {
      toast.error('Failed to delete image');
    }
  };

  const handleSetPrimary = async (imageId: number) => {
    if (!createdId) return;
    try {
      await api.put(`/admin/products/${createdId}/images/${imageId}/primary`);
      setImages((prev) => prev.map((img) => ({ ...img, is_primary: img.id === imageId })));
      toast.success('Primary image updated');
    } catch {
      toast.error('Failed to update primary image');
    }
  };

  const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create a new product listing</p>
        </div>
        <Link href="/admin/products"
          className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          ← Back
        </Link>
      </div>

      {/* Step 1 — Product Details */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className={`bg-white rounded-xl border p-6 space-y-4 ${createdId ? 'border-green-200 opacity-75' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Basic Information</h2>
            {createdId && <span className="flex items-center gap-1 text-xs text-green-600 font-medium"><CheckCircle size={14} /> Saved</span>}
          </div>
          <div>
            <label className={labelCls}>Product Name *</label>
            <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)}
              className={inputCls} placeholder="e.g. Wireless Headphones" required disabled={!!createdId} />
          </div>
          <div>
            <label className={labelCls}>Slug</label>
            <input type="text" value={form.slug}
              onChange={(e) => { setSlugManual(true); set('slug', e.target.value); }}
              className={`${inputCls} font-mono text-xs`} placeholder="auto-generated" disabled={!!createdId} />
            <p className="text-xs text-gray-400 mt-1">URL: /products/{form.slug || 'slug'}</p>
          </div>
          <div>
            <label className={labelCls}>Short Description</label>
            <textarea value={form.short_description} onChange={(e) => set('short_description', e.target.value)}
              rows={2} className={inputCls} placeholder="Brief product summary shown in listings" disabled={!!createdId} />
          </div>
          <div>
            <label className={labelCls}>Full Description</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
              rows={5} className={inputCls} placeholder="Detailed product description" disabled={!!createdId} />
          </div>
        </div>

        {/* Pricing */}
        <div className={`bg-white rounded-xl border p-6 space-y-4 ${createdId ? 'border-green-200 opacity-75' : 'border-gray-200'}`}>
          <h2 className="font-semibold text-gray-900">Pricing &amp; Inventory</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Price ($) *</label>
              <input type="number" min="0" step="0.01" value={form.price}
                onChange={(e) => set('price', e.target.value)}
                className={inputCls} placeholder="0.00" required disabled={!!createdId} />
            </div>
            <div>
              <label className={labelCls}>Compare Price ($) <span className="text-gray-400 font-normal">optional</span></label>
              <input type="number" min="0" step="0.01" value={form.compare_price}
                onChange={(e) => set('compare_price', e.target.value)}
                className={inputCls} placeholder="Original price" disabled={!!createdId} />
            </div>
            <div>
              <label className={labelCls}>SKU</label>
              <input type="text" value={form.sku} onChange={(e) => set('sku', e.target.value)}
                className={inputCls} placeholder="e.g. WH-1000XM5" disabled={!!createdId} />
            </div>
            <div>
              <label className={labelCls}>Stock</label>
              <input type="number" min="0" value={form.stock}
                onChange={(e) => set('stock', e.target.value)}
                className={inputCls} disabled={!!createdId} />
            </div>
            <div>
              <label className={labelCls}>Low Stock Threshold</label>
              <input type="number" min="0" value={form.low_stock_threshold}
                onChange={(e) => set('low_stock_threshold', e.target.value)}
                className={inputCls} disabled={!!createdId} />
            </div>
            <div>
              <label className={labelCls}>Weight (kg)</label>
              <input type="number" min="0" step="0.01" value={form.weight}
                onChange={(e) => set('weight', e.target.value)}
                className={inputCls} placeholder="0.00" disabled={!!createdId} />
            </div>
          </div>
        </div>

        {/* Classification */}
        <div className={`bg-white rounded-xl border p-6 space-y-4 ${createdId ? 'border-green-200 opacity-75' : 'border-gray-200'}`}>
          <h2 className="font-semibold text-gray-900">Classification</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Category</label>
              <select value={form.category_id} onChange={(e) => set('category_id', e.target.value)}
                className={`${inputCls} bg-white`} disabled={!!createdId}>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Brand</label>
              <select value={form.brand_id} onChange={(e) => set('brand_id', e.target.value)}
                className={`${inputCls} bg-white`} disabled={!!createdId}>
                <option value="">Select brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Visibility */}
        <div className={`bg-white rounded-xl border p-6 space-y-4 ${createdId ? 'border-green-200 opacity-75' : 'border-gray-200'}`}>
          <h2 className="font-semibold text-gray-900">Visibility</h2>
          <div className="space-y-3">
            {[
              { field: 'is_active' as const, label: 'Active', desc: 'Product is visible on the storefront' },
              { field: 'is_featured' as const, label: 'Featured', desc: 'Show on homepage featured section' },
            ].map(({ field, label, desc }) => (
              <div key={field} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-700">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
                <button type="button" onClick={() => !createdId && set(field, !form[field])}
                  disabled={!!createdId}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:cursor-not-allowed ${form[field] ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form[field] ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {!createdId && (
          <div className="flex items-center justify-end gap-3">
            <Link href="/admin/products"
              className="px-6 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </Link>
            <button type="submit" disabled={createMutation.isPending}
              className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
              {createMutation.isPending ? 'Creating…' : 'Create Product & Add Images →'}
            </button>
          </div>
        )}
      </form>

      {/* Step 2 — Image Upload (appears after product is created) */}
      {createdId && (
        <div className="bg-white rounded-xl border border-blue-200 p-6 space-y-4 ring-2 ring-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Product Images</h2>
              <p className="text-xs text-gray-500 mt-0.5">Upload photos to show on the storefront</p>
            </div>
            <button type="button" onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImages}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50">
              <Upload size={15} />
              {uploadingImages ? 'Uploading…' : 'Upload Images'}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
              onChange={handleImageUpload} />
          </div>

          {images.length === 0 ? (
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center gap-2 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors">
              <Upload size={32} />
              <span className="text-sm font-medium">Click to upload product images</span>
              <span className="text-xs">PNG, JPG, WEBP — up to 4 MB each, multiple allowed</span>
            </button>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {images.map((img) => (
                <div key={img.id} className="relative group aspect-square">
                  <img
                    src={storageUrl(img.image_path) ?? ''}
                    alt={img.alt_text ?? 'product'}
                    className={`w-full h-full object-cover rounded-lg border-2 transition-colors ${img.is_primary ? 'border-blue-500' : 'border-gray-200'}`}
                  />
                  {img.is_primary && (
                    <span className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    {!img.is_primary && (
                      <button type="button" onClick={() => handleSetPrimary(img.id)}
                        title="Set as primary"
                        className="p-1.5 bg-white rounded-full text-blue-600 hover:bg-blue-50">
                        <Star size={13} />
                      </button>
                    )}
                    <button type="button" onClick={() => handleDeleteImage(img.id)}
                      title="Delete image"
                      className="p-1.5 bg-white rounded-full text-red-600 hover:bg-red-50">
                      <X size={13} />
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors">
                <Upload size={20} />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              {images.length === 0 ? 'No images yet — you can also add them later from the edit page.' : `${images.length} image(s) uploaded`}
            </p>
            <button
              type="button"
              onClick={() => router.push('/admin/products')}
              className="px-6 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              {images.length === 0 ? 'Skip & Finish' : 'Done — View Products'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
