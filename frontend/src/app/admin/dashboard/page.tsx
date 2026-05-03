'use client';

import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { Order } from '@/types';

interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  total_products: number;
  revenue_change: number;
  orders_change: number;
  customers_change: number;
  products_change: number;
}

interface LowStockProduct {
  id: number;
  name: string;
  sku: string;
  stock: number;
  slug: string;
}

interface AdminStatsResponse extends DashboardStats {
  recent_orders: Order[];
  low_stock_products: LowStockProduct[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const PAYMENT_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-orange-100 text-orange-700',
};

function StatCard({
  title,
  value,
  icon: Icon,
  change,
  color,
  prefix = '',
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  change?: number;
  color: string;
  prefix?: string;
}) {
  const isPositive = (change ?? 0) >= 0;
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {prefix}
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
              {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              <span>
                {isPositive ? '+' : ''}{change.toFixed(1)}% from last month
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-7 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get<{ data: AdminStatsResponse }>('/admin/stats');
      return res.data.data;
    },
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back! Here&apos;s what&apos;s happening with your store.
        </p>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          Failed to load dashboard stats. Please try again.
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard
            title="Total Revenue"
            value={data.total_revenue.toFixed(2)}
            icon={DollarSign}
            change={data.revenue_change}
            color="bg-blue-600"
            prefix="$"
          />
          <StatCard
            title="Total Orders"
            value={data.total_orders}
            icon={ShoppingCart}
            change={data.orders_change}
            color="bg-indigo-600"
          />
          <StatCard
            title="Total Customers"
            value={data.total_customers}
            icon={Users}
            change={data.customers_change}
            color="bg-violet-600"
          />
          <StatCard
            title="Total Products"
            value={data.total_products}
            icon={Package}
            change={data.products_change}
            color="bg-emerald-600"
          />
        </div>
      ) : null}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock size={17} className="text-blue-600" />
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-5 space-y-3 animate-pulse">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-4 bg-gray-200 rounded flex-1" />
                    <div className="h-4 bg-gray-200 rounded w-20" />
                    <div className="h-4 bg-gray-200 rounded w-16" />
                    <div className="h-4 bg-gray-200 rounded w-16" />
                  </div>
                ))}
              </div>
            ) : data?.recent_orders?.length === 0 ? (
              <div className="px-5 py-10 text-center text-gray-400 text-sm">
                No orders yet.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Order</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Payment</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-600">Total</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.recent_orders?.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-medium text-blue-600 hover:text-blue-700"
                        >
                          #{order.order_number}
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            PAYMENT_COLORS[order.payment_status] ?? 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-900">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-5 py-3 text-right text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle size={17} className="text-orange-500" />
              Low Stock
            </h2>
            <Link
              href="/admin/products?low_stock=1"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {isLoading ? (
              <div className="p-5 space-y-4 animate-pulse">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !data?.low_stock_products?.length ? (
              <div className="px-5 py-10 text-center text-gray-400 text-sm">
                All products are well stocked.
              </div>
            ) : (
              data.low_stock_products.map((product) => (
                <div key={product.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      product.stock === 0
                        ? 'bg-red-100 text-red-600'
                        : product.stock <= 5
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-yellow-100 text-yellow-600'
                    }`}
                  >
                    {product.stock}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-1"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-gray-400">SKU: {product.sku}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold flex-shrink-0 ${
                      product.stock === 0 ? 'text-red-600' : 'text-orange-500'
                    }`}
                  >
                    {product.stock === 0 ? 'Out' : 'Low'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
