'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, ChevronRight, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { storageUrl } from '@/lib/storage';
import { Category, ApiResponse } from '@/types';

export default function CategoriesPage() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories-page'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Category[]>>('/categories');
      return res.data.data;
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Categories</h1>
        <p className="text-gray-500 mt-1">Browse products by category</p>
      </div>

      {/* Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4" />
              <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      )}

      {/* Category grid */}
      {categories && categories.length === 0 && (
        <div className="text-center py-24 text-gray-400">No categories found.</div>
      )}

      {categories && categories.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} cat={cat} />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryCard({ cat }: { cat: Category }) {
  const imgSrc = storageUrl(cat.image);
  const hasChildren = cat.children && cat.children.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all group">
      {/* Header link */}
      <Link href={`/products?category=${cat.slug}`} className="block p-6 pb-4">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden mb-4 group-hover:bg-blue-100 transition-colors flex-shrink-0">
            {imgSrc ? (
              <Image
                src={imgSrc}
                alt={cat.name}
                width={80}
                height={80}
                className="object-cover rounded-full"
                unoptimized
              />
            ) : (
              <ShoppingBag size={32} className="text-blue-400" />
            )}
          </div>
          <h2 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
            {cat.name}
          </h2>
          {cat.description && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{cat.description}</p>
          )}
          <span className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-blue-600">
            Shop now <ArrowRight size={12} />
          </span>
        </div>
      </Link>

      {/* Subcategories */}
      {hasChildren && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-1">
          {cat.children!.slice(0, 4).map((sub) => (
            <Link
              key={sub.id}
              href={`/products?category=${sub.slug}`}
              className="flex items-center justify-between text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
            >
              <span>{sub.name}</span>
              <ChevronRight size={12} className="text-gray-400" />
            </Link>
          ))}
          {cat.children!.length > 4 && (
            <Link
              href={`/products?category=${cat.slug}`}
              className="block text-xs text-blue-500 hover:text-blue-700 px-2 py-1"
            >
              +{cat.children!.length - 4} more
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
