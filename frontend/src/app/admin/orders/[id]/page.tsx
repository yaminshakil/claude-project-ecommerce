'use client';

import { use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Link from 'next/link';
import api from '@/lib/api';
import { storageUrl } from '@/lib/storage';
import { ApiResponse } from '@/types';

interface OrderDetail {
  id: number;
  order_number: string;
  status: string;
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  tax_amount: number;
  total: number;
  coupon_code?: string;
  payment_method: string;
  payment_status: string;
  notes?: string;
  delivered_at?: string;
  created_at: string;
  shipping_address: {
    name: string;
    phone: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  user: { id: number; name: string; email: string; phone?: string };
  items: {
    id: number;
    product_name: string;
    variant_name?: string;
    product_image?: string;
    quantity: number;
    unit_price: number;
    total: number;
  }[];
}

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-orange-100 text-orange-700',
};

const PAYMENT_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-orange-100 text-orange-700',
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const qc = useQueryClient();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<OrderDetail>>(`/admin/orders/${id}`);
      return res.data.data;
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => api.put(`/admin/orders/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-order', id] });
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse max-w-4xl">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
        Failed to load order. <Link href="/admin/orders" className="underline">Go back</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order #{order.order_number}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Placed on {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/orders"
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            ← Back
          </Link>
        </div>
      </div>

      {/* Status + Payment Row */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Order Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Order Status</p>
          <div className="flex items-center gap-3 mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
              {order.status}
            </span>
          </div>
          <select
            value={order.status}
            onChange={(e) => statusMutation.mutate(e.target.value)}
            disabled={statusMutation.isPending}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black disabled:opacity-50"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Payment</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${PAYMENT_COLORS[order.payment_status] ?? 'bg-gray-100 text-gray-600'}`}>
                {order.payment_status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Method</span>
              <span className="font-medium text-gray-900 uppercase text-xs">{order.payment_method}</span>
            </div>
            {order.coupon_code && (
              <div className="flex justify-between">
                <span className="text-gray-500">Coupon</span>
                <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{order.coupon_code}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Items ({order.items.length})</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-4">
              {item.product_image ? (
                <img src={storageUrl(item.product_image) ?? ''} alt={item.product_name}
                  className="w-14 h-14 object-cover rounded-lg border border-gray-200 flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs flex-shrink-0">
                  N/A
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{item.product_name}</p>
                {item.variant_name && <p className="text-xs text-gray-500 mt-0.5">{item.variant_name}</p>}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-gray-900">${Number(item.total).toFixed(2)}</p>
                <p className="text-xs text-gray-400">{item.quantity} × ${Number(item.unit_price).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-gray-200 px-5 py-4 space-y-2 bg-gray-50">
          {[
            { label: 'Subtotal', value: order.subtotal },
            ...(order.discount_amount > 0 ? [{ label: 'Discount', value: -order.discount_amount }] : []),
            { label: 'Shipping', value: order.shipping_fee },
            ...(order.tax_amount > 0 ? [{ label: 'Tax', value: order.tax_amount }] : []),
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-gray-500">{label}</span>
              <span className={`font-medium ${value < 0 ? 'text-green-600' : 'text-gray-900'}`}>
                {value < 0 ? '-' : ''}${Math.abs(value).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
            <span>Total</span>
            <span>${Number(order.total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Customer + Shipping */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Customer */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Customer</p>
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-gray-900">{order.user.name}</p>
            <p className="text-gray-500">{order.user.email}</p>
            {order.user.phone && <p className="text-gray-500">{order.user.phone}</p>}
            <Link href={`/admin/customers`} className="text-blue-600 text-xs hover:underline mt-1 block">
              View customer →
            </Link>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Shipping Address</p>
          <div className="text-sm text-gray-700 space-y-0.5">
            <p className="font-semibold">{order.shipping_address.name}</p>
            <p>{order.shipping_address.phone}</p>
            <p>{order.shipping_address.address_line_1}</p>
            {order.shipping_address.address_line_2 && <p>{order.shipping_address.address_line_2}</p>}
            <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip_code}</p>
            <p>{order.shipping_address.country}</p>
          </div>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Customer Notes</p>
          <p className="text-sm text-gray-700">{order.notes}</p>
        </div>
      )}
    </div>
  );
}
