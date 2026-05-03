'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { CreditCard, Truck, Lock, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

const addressSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  address_line_1: z.string().min(5, 'Address is required'),
  address_line_2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip_code: z.string().min(3, 'ZIP code is required'),
  country: z.string().min(2, 'Country is required'),
});

type AddressFormData = z.infer<typeof addressSchema>;

type PaymentMethod = 'cod' | 'stripe';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { items, totalPrice, clearCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: user?.name ?? '',
      phone: user?.phone ?? '',
      country: 'US',
    },
  });

  const shippingFee = totalPrice() >= 50 ? 0 : 5.99;
  const total = totalPrice() + shippingFee;

  const onSubmit = async (addressData: AddressFormData) => {
    if (!user) {
      toast.error('Please login to place an order.');
      router.push('/auth/login');
      return;
    }
    if (items.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/orders', {
        shipping_address: addressData,
        payment_method: paymentMethod,
        items: items.map((item) => ({
          product_id: item.product_id,
          product_variant_id: item.product_variant_id,
          quantity: item.quantity,
        })),
      });
      const order = response.data.data;
      setOrderId(order.order_number);
      clearCart();
      setOrderPlaced(true);
      toast.success('Order placed successfully!');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to place order.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="bg-white border border-gray-200 rounded-2xl p-10">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-5" />
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Order Confirmed!</h1>
          <p className="text-gray-500 mb-2">
            Thank you for your purchase. Your order has been placed.
          </p>
          {orderId && (
            <p className="font-semibold text-gray-900 mb-6">Order #{orderId}</p>
          )}
          <div className="flex flex-col gap-3">
            <Link
              href="/orders"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              View My Orders
            </Link>
            <Link
              href="/products"
              className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 rounded-xl transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 text-lg mb-4">Your cart is empty.</p>
        <Link
          href="/products"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2">
                <Truck size={20} className="text-blue-600" />
                Shipping Address
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('name')}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 ${
                      errors.name ? 'border-red-400' : 'border-gray-300'
                    }`}
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('phone')}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 ${
                      errors.phone ? 'border-red-400' : 'border-gray-300'
                    }`}
                    placeholder="+1 (555) 000-0000"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1 <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('address_line_1')}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 ${
                      errors.address_line_1 ? 'border-red-400' : 'border-gray-300'
                    }`}
                    placeholder="123 Main Street"
                  />
                  {errors.address_line_1 && (
                    <p className="mt-1 text-xs text-red-500">{errors.address_line_1.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    {...register('address_line_2')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Apt, Suite, Floor..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('city')}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 ${
                      errors.city ? 'border-red-400' : 'border-gray-300'
                    }`}
                    placeholder="New York"
                  />
                  {errors.city && (
                    <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State / Province <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('state')}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 ${
                      errors.state ? 'border-red-400' : 'border-gray-300'
                    }`}
                    placeholder="NY"
                  />
                  {errors.state && (
                    <p className="mt-1 text-xs text-red-500">{errors.state.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP / Postal Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('zip_code')}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 ${
                      errors.zip_code ? 'border-red-400' : 'border-gray-300'
                    }`}
                    placeholder="10001"
                  />
                  {errors.zip_code && (
                    <p className="mt-1 text-xs text-red-500">{errors.zip_code.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('country')}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 ${
                      errors.country ? 'border-red-400' : 'border-gray-300'
                    }`}
                    placeholder="US"
                  />
                  {errors.country && (
                    <p className="mt-1 text-xs text-red-500">{errors.country.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2">
                <CreditCard size={20} className="text-blue-600" />
                Payment Method
              </h2>

              <div className="space-y-3">
                {/* COD */}
                <label
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    paymentMethod === 'cod'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="text-blue-600 accent-blue-600"
                  />
                  <Truck
                    size={22}
                    className={paymentMethod === 'cod' ? 'text-blue-600' : 'text-gray-400'}
                  />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Cash on Delivery</p>
                    <p className="text-xs text-gray-500">Pay when your order arrives</p>
                  </div>
                </label>

                {/* Stripe */}
                <label
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    paymentMethod === 'stripe'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="stripe"
                    checked={paymentMethod === 'stripe'}
                    onChange={() => setPaymentMethod('stripe')}
                    className="text-blue-600 accent-blue-600"
                  />
                  <CreditCard
                    size={22}
                    className={paymentMethod === 'stripe' ? 'text-blue-600' : 'text-gray-400'}
                  />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Credit / Debit Card</p>
                    <p className="text-xs text-gray-500">Powered by Stripe (coming soon)</p>
                  </div>
                </label>

                {paymentMethod === 'stripe' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                    <p className="text-sm text-yellow-800">
                      Online card payments are coming soon. Please use Cash on Delivery for now.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-24">
              <h2 className="font-bold text-gray-900 text-lg mb-5">Order Summary</h2>

              <div className="space-y-3 mb-5">
                {items.map((item) => {
                  const itemPrice = item.variant ? item.variant.price : item.product.price;
                  const primaryImage =
                    item.product.images?.find((img) => img.is_primary) ??
                    item.product.images?.[0];
                  const imageSrc = primaryImage?.image_path ?? '/placeholder-product.png';

                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative w-12 h-12 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={imageSrc}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          unoptimized={imageSrc.startsWith('http')}
                        />
                        <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 font-medium line-clamp-1">
                          {item.product.name}
                        </p>
                        {item.variant && (
                          <p className="text-xs text-gray-500">{item.variant.name}</p>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                        ${(itemPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${totalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shippingFee === 0 ? 'text-green-600 font-medium' : ''}>
                    {shippingFee === 0 ? 'Free' : `$${shippingFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-base text-gray-900">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || paymentMethod === 'stripe'}
                className="mt-5 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Lock size={16} />
                {isSubmitting ? 'Placing Order...' : 'Place Order'}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                <Lock size={11} /> Secure SSL encrypted checkout
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
