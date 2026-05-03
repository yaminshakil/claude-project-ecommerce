'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ['password_confirmation'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError('');
    setIsLoading(true);
    try {
      await registerUser(data.name, data.email, data.password);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Registration failed. Please try again.';
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              ShopNow
            </Link>
            <h1 className="text-xl font-bold text-gray-900 mt-4">Create your account</h1>
            <p className="text-gray-500 text-sm mt-1">Start shopping in seconds</p>
          </div>

          {serverError && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name
              </label>
              <input
                {...register('name')}
                type="text"
                autoComplete="name"
                placeholder="John Doe"
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors ${
                  errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors ${
                  errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min 8 characters"
                  className={`w-full border rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-blue-500 transition-colors ${
                    errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  {...register('password_confirmation')}
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  className={`w-full border rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-blue-500 transition-colors ${
                    errors.password_confirmation ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.password_confirmation.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
            >
              <UserPlus size={18} />
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
