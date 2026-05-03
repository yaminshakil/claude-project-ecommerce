'use client';

import { use, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingCart,
  Star,
  Check,
  ChevronLeft,
  ChevronRight,
  Package,
  Truck,
  Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { storageUrl } from '@/lib/storage';
import { Product, Review, ApiResponse, PaginatedResponse } from '@/types';
import { useCartStore } from '@/store/cartStore';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = use(params);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addItem } = useCartStore();

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Product>>(`/products/${slug}`);
      return res.data.data;
    },
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', slug],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Review>>(`/products/${slug}/reviews`);
      return res.data;
    },
    enabled: !!product,
  });

  const selectedVariant = product?.variants?.find((v) => v.id === selectedVariantId);
  const displayPrice = Number(selectedVariant ? selectedVariant.price : product?.price ?? 0);
  const stockCount = selectedVariant ? selectedVariant.stock : product?.stock ?? 0;
  const inStock = stockCount > 0;

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    try {
      const response = await api.post('/cart', {
        product_id: product.id,
        product_variant_id: selectedVariantId ?? undefined,
        quantity,
      });
      addItem(response.data.data);
      toast.success('Added to cart!');
    } catch {
      toast.error('Failed to add to cart.');
    } finally {
      setAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse grid md:grid-cols-2 gap-12">
          <div className="aspect-square bg-gray-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 text-lg">Product not found.</p>
        <Link href="/products" className="mt-4 inline-block text-blue-600 hover:underline">
          Back to Products
        </Link>
      </div>
    );
  }

  const images = product.images ?? [];

  const productPrice = Number(product.price);
  const productComparePrice = product.compare_price != null ? Number(product.compare_price) : null;

  const hasDiscount = productComparePrice !== null && productComparePrice > productPrice;

  const avgRating =
    reviews && reviews.data.length > 0
      ? reviews.data.reduce((sum, r) => sum + r.rating, 0) / reviews.data.length
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-blue-600">Products</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-blue-600">
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
            {storageUrl(images[activeImage]?.image_path) ? (
              <Image
                src={storageUrl(images[activeImage].image_path)!}
                alt={images[activeImage]?.alt_text ?? product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
                unoptimized
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
              </div>
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage((prev) => (prev - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 shadow hover:bg-white transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setActiveImage((prev) => (prev + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 shadow hover:bg-white transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(idx)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    activeImage === idx ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <Image
                    src={storageUrl(img.image_path) ?? ''}
                    alt={img.alt_text ?? product.name}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-5">
          {product.brand && (
            <span className="text-sm font-medium text-blue-600">{product.brand.name}</span>
          )}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>

          {/* Rating */}
          {avgRating !== null && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={i < Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {avgRating.toFixed(1)} ({reviews?.total ?? 0} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-gray-900">${displayPrice.toFixed(2)}</span>
            {hasDiscount && !selectedVariant && (
              <>
                <span className="text-xl text-gray-400 line-through">${productComparePrice!.toFixed(2)}</span>
                <span className="bg-red-100 text-red-600 text-sm font-semibold px-2 py-0.5 rounded-full">
                  {Math.round(((productComparePrice! - productPrice) / productComparePrice!) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {inStock ? (
              <>
                <Check size={16} className="text-green-500" />
                <span className="text-sm text-green-600 font-medium">
                  In Stock {stockCount <= 10 && `(${stockCount} left)`}
                </span>
              </>
            ) : (
              <span className="text-sm text-red-600 font-medium">Out of Stock</span>
            )}
          </div>

          {/* Short Description */}
          {product.short_description && (
            <p className="text-gray-600 text-sm leading-relaxed">{product.short_description}</p>
          )}

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                Select Option
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.filter((v) => v.is_active).map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariantId(variant.id === selectedVariantId ? null : variant.id)}
                    disabled={variant.stock === 0}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      selectedVariantId === variant.id
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : variant.stock === 0
                        ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed line-through'
                        : 'border-gray-300 text-gray-700 hover:border-blue-400'
                    }`}
                  >
                    {variant.name}
                    {Number(variant.price) !== productPrice && (
                      <span className="ml-1 text-xs opacity-80">(${Number(variant.price).toFixed(2)})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">Quantity</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors font-bold"
              >
                -
              </button>
              <span className="w-10 text-center font-semibold text-gray-900">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(stockCount, q + 1))}
                disabled={quantity >= stockCount}
                className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={addingToCart || !inStock}
            className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-8 rounded-xl transition-colors text-base shadow-sm"
          >
            <ShoppingCart size={20} />
            {addingToCart ? 'Adding to Cart...' : !inStock ? 'Out of Stock' : 'Add to Cart'}
          </button>

          {/* Perks */}
          <div className="border-t border-gray-200 pt-5 grid grid-cols-3 gap-4">
            {[
              { icon: Truck, label: 'Free Shipping', sub: 'Over $50' },
              { icon: Shield, label: 'Secure Pay', sub: '100% Safe' },
              { icon: Package, label: 'Easy Returns', sub: '30 Days' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center gap-1 text-center">
                <Icon size={20} className="text-blue-600" />
                <span className="text-xs font-semibold text-gray-800">{label}</span>
                <span className="text-xs text-gray-500">{sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="mt-14 border-t border-gray-200 pt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Product Description</h2>
          <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
            {product.description}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="mt-14 border-t border-gray-200 pt-10">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Customer Reviews
          {reviews && (
            <span className="ml-2 text-base font-normal text-gray-500">
              ({reviews.total})
            </span>
          )}
        </h2>

        {!reviews || reviews.data.length === 0 ? (
          <p className="text-gray-500 text-sm">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-6">
            {reviews.data.map((review) => (
              <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {review.user?.name ?? 'Anonymous'}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                {review.title && (
                  <p className="font-medium text-gray-800 text-sm mb-1">{review.title}</p>
                )}
                <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
