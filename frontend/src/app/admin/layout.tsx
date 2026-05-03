'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Tag,
  Layers,
  ShoppingCart,
  Users,
  Ticket,
  Star,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/products', icon: Package, label: 'Products' },
  { href: '/admin/categories', icon: Layers, label: 'Categories' },
  { href: '/admin/brands', icon: Tag, label: 'Brands' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/admin/customers', icon: Users, label: 'Customers' },
  { href: '/admin/coupons', icon: Ticket, label: 'Coupons' },
  { href: '/admin/reviews', icon: Star, label: 'Reviews' },
];

function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-gray-200">
        <Link href="/admin/dashboard" className="text-lg font-bold text-blue-600">
          ShopNow Admin
        </Link>
        {onClose && (
          <button onClick={onClose} className="md:hidden text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-0.5">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'} />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={15} className="opacity-70" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 px-3 py-4">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors mb-1"
        >
          <ChevronRight size={18} className="text-gray-400 rotate-180" />
          Back to Store
        </Link>
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full"
        >
          <LogOut size={18} className="text-red-400" />
          Logout
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-60 bg-white border-r border-gray-200 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-gray-600 hover:text-gray-900"
          >
            <Menu size={22} />
          </button>
          <h1 className="text-gray-900 font-semibold text-sm">Admin Panel</h1>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
