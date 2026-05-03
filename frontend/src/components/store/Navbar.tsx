'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, User, Menu, X, Search } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/hooks/useAuth';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/categories', label: 'Categories' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { user } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems());
  const { logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-blue-600 flex-shrink-0"
          >
            ShopNow
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  pathname === link.href
                    ? 'text-blue-600'
                    : 'text-gray-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-1.5 gap-2 flex-1 max-w-sm mx-6"
          >
            <Search size={16} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm outline-none flex-1 text-gray-700 placeholder-gray-400"
            />
          </form>

          {/* Right Icons */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-2 text-gray-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-100"
                aria-label="User menu"
              >
                <User size={22} />
                {user && (
                  <span className="text-sm font-medium max-w-[100px] truncate">
                    {user.name}
                  </span>
                )}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        My Profile
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        My Orders
                      </Link>
                      {(user.role === 'admin' || user.role === 'super_admin') && (
                        <Link
                          href="/admin/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      <hr className="my-1" />
                      <button
                        onClick={async () => {
                          setUserMenuOpen(false);
                          await logout();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Register
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-1">
            <form
              onSubmit={handleSearch}
              className="flex items-center bg-gray-100 rounded-lg px-3 py-2 gap-2 mb-3"
            >
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm outline-none flex-1 text-gray-700 placeholder-gray-400"
              />
            </form>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2" />
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  My Profile
                </Link>
                <Link
                  href="/orders"
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  My Orders
                </Link>
                <button
                  onClick={async () => {
                    setMobileOpen(false);
                    await logout();
                  }}
                  className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
