'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Star, ImageOff } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import api from '@/lib/api';
import { storageUrl } from '@/lib/storage';
import toast from 'react-hot-toast';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [adding, setAdding] = useState(false);
  const { addItem } = useCartStore();

  const primaryImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0];
  const imageSrc = storageUrl(primaryImage?.image_path);

  const price = Number(product.price);
  const comparePrice = product.compare_price != null ? Number(product.compare_price) : null;

  const hasDiscount = comparePrice !== null && comparePrice > price;

  const discountPct = hasDiscount
    ? Math.round(((comparePrice! - price) / comparePrice!) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    try {
      const response = await api.post('/cart', {
        product_id: product.id,
        quantity: 1,
      });
      addItem(response.data.data);
      toast.success('Added to cart!');
    } catch {
      toast.error('Failed to add to cart.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200 flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={primaryImage?.alt_text ?? product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ImageOff size={40} />
          </div>
        )}
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discountPct}%
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-sm font-semibold px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        {product.category && (
          <span className="text-xs text-blue-600 font-medium mb-1">
            {product.category.name}
          </span>
        )}
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 flex-1 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">
            ${price.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              ${comparePrice!.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={adding || product.stock === 0}
          className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors"
        >
          <ShoppingCart size={16} />
          {adding ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
}
