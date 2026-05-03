import Navbar from '@/components/store/Navbar';
import Link from 'next/link';

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-white text-xl font-bold mb-3">ShopNow</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your one-stop shop for quality products at the best prices.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">
              Shop
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/categories" className="hover:text-white transition-colors">Categories</Link></li>
              <li><Link href="/products?is_featured=1" className="hover:text-white transition-colors">Featured</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">
              Account
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth/login" className="hover:text-white transition-colors">Login</Link></li>
              <li><Link href="/auth/register" className="hover:text-white transition-colors">Register</Link></li>
              <li><Link href="/orders" className="hover:text-white transition-colors">My Orders</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">
              Help
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">Returns</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} ShopNow. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
