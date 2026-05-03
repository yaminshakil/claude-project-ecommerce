'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, useCallback, useRef } from 'react';
import { ArrowRight, ShoppingBag, Truck, Shield, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import { storageUrl } from '@/lib/storage';
import { Product, Category, PaginatedResponse, ApiResponse } from '@/types';
import ProductCard from '@/components/store/ProductCard';

const SLIDES = [
  {
    id: 1,
    image: '/images/hero1.avif',
    badge: 'New Season Arrivals',
    heading: 'Shop the Latest',
    accent: 'Trends Online',
    sub: 'Discover thousands of products at unbeatable prices. Free shipping on orders over $50.',
    cta: { label: 'Shop Now', href: '/products' },
    ctaSecondary: { label: 'View Featured', href: '/products?is_featured=1' },
  },
  {
    id: 2,
    image: '/images/hero2.avif',
    badge: 'Hot Deals This Week',
    heading: 'Unbeatable Prices',
    accent: 'Every Day',
    sub: 'Save big on top brands. Limited-time offers across electronics, fashion, and more.',
    cta: { label: 'See Deals', href: '/products?sort=price_asc' },
    ctaSecondary: { label: 'All Products', href: '/products' },
  },
  {
    id: 3,
    image: '/images/hero3.avif',
    badge: 'Free Shipping on $50+',
    heading: 'Everything You Need,',
    accent: 'Delivered Fast',
    sub: 'From electronics to home essentials — browse categories and find exactly what you want.',
    cta: { label: 'Browse Categories', href: '/categories' },
    ctaSecondary: { label: 'Shop Now', href: '/products' },
  },
  {
    id: 4,
    image: '/images/hero4.avif',
    badge: 'Top-Rated Products',
    heading: 'Quality You Can',
    accent: 'Trust & Love',
    sub: 'Thousands of 5-star reviews. Shop our most popular and highly rated products today.',
    cta: { label: 'Top Products', href: '/products?sort=popular' },
    ctaSecondary: { label: 'New Arrivals', href: '/products?sort=latest' },
  },
];

const INTERVAL = 4500;

function HeroSection() {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number) => {
    setActive(index);
  }, []);

  const next = useCallback(() => goTo((active + 1) % SLIDES.length), [active, goTo]);
  const prev = useCallback(() => goTo((active - 1 + SLIDES.length) % SLIDES.length), [active, goTo]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive((a) => (a + 1) % SLIDES.length);
    }, INTERVAL);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const handleManual = (fn: () => void) => { fn(); resetTimer(); };

  const slide = SLIDES[active];

  return (
    <section className="relative overflow-hidden bg-black text-white" style={{ height: 'clamp(420px, 60vh, 680px)' }}>
      {/* Slide images — all mounted, only active is visible */}
      {SLIDES.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === active ? 1 : 0, zIndex: i === active ? 1 : 0 }}
        >
          <Image
            src={s.image}
            alt={s.heading}
            fill
            sizes="100vw"
            className="object-cover"
            priority={i === 0}
          />
        </div>
      ))}

      {/* Dark gradient overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent z-10" />

      {/* Text content */}
      <div className="relative z-20 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full">
          <div className="max-w-xl">
            <span
              key={`badge-${slide.id}`}
              className="inline-block bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full mb-5 animate-fade-in"
            >
              {slide.badge}
            </span>

            <h1
              key={`h-${slide.id}`}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 animate-slide-up drop-shadow-lg"
            >
              {slide.heading}<br />
              <span className="text-blue-300">{slide.accent}</span>
            </h1>

            <p
              key={`sub-${slide.id}`}
              className="text-base md:text-lg text-white/85 mb-8 leading-relaxed animate-slide-up drop-shadow"
            >
              {slide.sub}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href={slide.cta.href}
                className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-7 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-xl"
              >
                {slide.cta.label}
                <ArrowRight size={18} />
              </Link>
              <Link
                href={slide.ctaSecondary.href}
                className="inline-flex items-center gap-2 border-2 border-white/70 backdrop-blur-sm text-white font-semibold px-7 py-3 rounded-xl hover:bg-white/15 transition-colors"
              >
                {slide.ctaSecondary.label}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={() => handleManual(prev)}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white rounded-full p-2.5 transition-colors backdrop-blur-sm"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        onClick={() => handleManual(next)}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white rounded-full p-2.5 transition-colors backdrop-blur-sm"
      >
        <ChevronRight size={22} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => handleManual(() => goTo(i))}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === active ? 'w-7 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-5 right-6 z-30 text-white/60 text-xs font-medium tabular-nums">
        {active + 1} / {SLIDES.length}
      </div>
    </section>
  );
}

function FeaturesBar() {
  const features = [
    { icon: Truck, label: 'Free Shipping', desc: 'On orders over $50' },
    { icon: Shield, label: 'Secure Payment', desc: '100% protected' },
    { icon: RefreshCw, label: 'Easy Returns', desc: '30-day policy' },
    { icon: ShoppingBag, label: '10k+ Products', desc: 'Wide selection' },
  ];
  return (
    <section className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="bg-blue-50 rounded-xl p-3 flex-shrink-0">
                <Icon size={22} className="text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedProducts() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const res = await api.get('/products', {
        params: { is_featured: 1, per_page: 8 },
      });
      return res.data.data as PaginatedResponse<Product>;
    },
  });

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Featured Products
            </h2>
            <p className="text-gray-500 mt-1">Handpicked top sellers just for you</p>
          </div>
          <Link
            href="/products?is_featured=1"
            className="hidden md:inline-flex items-center gap-1 text-blue-600 font-medium hover:text-blue-700 text-sm"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="text-center py-12 text-gray-500">
            Failed to load featured products.
          </div>
        )}

        {data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {data.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/products?is_featured=1"
            className="inline-flex items-center gap-1 text-blue-600 font-medium text-sm"
          >
            View all featured <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CategoriesSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['categories-home'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Category[]>>('/categories');
      return res.data.data;
    },
  });

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Shop by Category
          </h2>
          <p className="text-gray-500">Find what you&apos;re looking for</p>
        </div>

        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3" />
                <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto" />
              </div>
            ))}
          </div>
        )}

        {data && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {data.slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="bg-white rounded-xl p-6 flex flex-col items-center gap-3 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden group-hover:bg-blue-100 transition-colors">
                  {storageUrl(cat.image) ? (
                    <Image
                      src={storageUrl(cat.image)!}
                      alt={cat.name}
                      width={64}
                      height={64}
                      className="object-cover rounded-full"
                      unoptimized
                    />
                  ) : (
                    <ShoppingBag size={28} className="text-blue-500" />
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-800 text-center group-hover:text-blue-600 transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 font-medium px-6 py-2.5 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            All Categories <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesBar />
      <FeaturedProducts />
      <CategoriesSection />
    </>
  );
}
