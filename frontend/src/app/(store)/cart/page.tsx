'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ShoppingBag, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/cartStore';
import api from '@/lib/api';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCartStore();
  const [coupon, setCoupon] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const shippingFee = totalPrice() >= 50 ? 0 : 5.99;
  const subtotal = totalPrice();
  const total = subtotal - discount + shippingFee;

  const handleQuantityChange = async (itemId: number, newQty: number) => {
    setUpdatingId(itemId);
    try {
      await api.patch(`/cart/${itemId}`, { quantity: newQty });
      updateQuantity(itemId, newQty);
    } catch {
      toast.error('Failed to update quantity.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (itemId: number) => {
    try {
      await api.delete(`/cart/${itemId}`);
      removeItem(itemId);
      toast.success('Item removed from cart.');
    } catch {
      toast.error('Failed to remove item.');
    }
  };

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponLoading(true);
    try {
      const res = await api.post('/coupons/validate', { code: coupon, total: subtotal });
      setDiscount(res.data.data.discount_amount ?? 0);
      toast.success('Coupon applied!');
    } catch {
      toast.error('Invalid or expired coupon.');
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="max-w-md mx-auto">
          <ShoppingBag size={64} className="text-gray-300 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h1>
          <p className="text-gray-500 mb-8">
            Looks like you haven&apos;t added anything yet.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Shopping Cart
        <span className="ml-2 text-base font-normal text-gray-500">
          ({totalItems()} {totalItems() === 1 ? 'item' : 'items'})
        </span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const itemPrice = item.variant ? item.variant.price : item.product.price;
            const primaryImage =
              item.product.images?.find((img) => img.is_primary) ?? item.product.images?.[0];
            const imageSrc = primaryImage?.image_path ?? '/placeholder-product.png';

            return (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4"
              >
                {/* Image */}
                <Link href={`/products/${item.product.slug}`} className="flex-shrink-0">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={imageSrc}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      unoptimized={imageSrc.startsWith('http')}
                    />
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 text-sm"
                  >
                    {item.product.name}
                  </Link>
                  {item.variant && (
                    <p className="text-xs text-gray-500 mt-0.5">{item.variant.name}</p>
                  )}
                  <p className="text-blue-600 font-bold mt-1">${itemPrice.toFixed(2)}</p>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || updatingId === item.id}
                        className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">
                        {updatingId === item.id ? '...' : item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={updatingId === item.id}
                        className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Subtotal + Remove */}
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900 text-sm">
                        ${(itemPrice * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex justify-between items-center pt-2">
            <Link
              href="/products"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              &larr; Continue Shopping
            </Link>
            <button
              onClick={() => {
                clearCart();
                toast.success('Cart cleared.');
              }}
              className="text-sm text-red-500 hover:text-red-600 font-medium"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-24">
            <h2 className="font-bold text-gray-900 text-lg mb-5">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({totalItems()} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shippingFee === 0 ? 'text-green-600 font-medium' : ''}>
                  {shippingFee === 0 ? 'Free' : `$${shippingFee.toFixed(2)}`}
                </span>
              </div>
              {subtotal < 50 && (
                <p className="text-xs text-gray-400">
                  Add ${(50 - subtotal).toFixed(2)} more for free shipping
                </p>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-base text-gray-900">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Coupon */}
            <div className="mt-5">
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Tag size={14} /> Coupon Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !coupon.trim()}
                  className="bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 text-white text-sm font-medium px-4 rounded-lg transition-colors"
                >
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </div>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm"
            >
              Proceed to Checkout
            </button>

            <p className="text-xs text-gray-400 text-center mt-3">
              Secure checkout powered by SSL encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
