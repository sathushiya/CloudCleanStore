import { ArrowRight, Sparkles, Zap, Clock } from 'lucide-react';
import { ImageWithFallback } from './common/ImageWithFallback';
import logoWatermark from '../assets/imports/WhatsApp_Image_2026-04-30_at_7.52.21_PM__1_.jpeg';

interface HeroProps {
  onNavigateToLogin?: () => void;
  onNavigateToShop?: () => void;
  isAuthenticated?: boolean;
}

export default function Hero({ onNavigateToLogin, onNavigateToShop, isAuthenticated }: HeroProps = {}) {
  const handleActionClick = () => {
    onNavigateToShop?.();
  };
  return (
    <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden" id="home">
      {/* Purple gradient background with glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-[#0f0a1e] dark:via-[#1a1425] dark:to-[#2d1b4e]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[128px] opacity-20 dark:opacity-30" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[128px] opacity-20 dark:opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-6 backdrop-blur-sm border border-purple-200 dark:border-purple-700/50">
              <Sparkles className="w-4 h-4" />
              Premium Cleaning Products
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-purple-900 dark:from-purple-400 dark:to-purple-200 bg-clip-text text-transparent leading-tight">
              Fast Home Cleaning Product Delivery
            </h1>

            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
              Get professional-grade cleaning solutions delivered to your door in minutes. Premium quality, eco-friendly products for every space.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={handleActionClick}
                className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full font-medium hover:shadow-[var(--glow-purple-strong)] transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                Order Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={handleActionClick}
                className="px-8 py-4 backdrop-blur-xl bg-white/50 dark:bg-white/10 border border-purple-200 dark:border-purple-700/50 text-purple-700 dark:text-purple-300 rounded-full font-medium hover:bg-white/70 dark:hover:bg-white/20 transition-all"
              >
                Browse Products
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12">
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">500+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Products</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">10k+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Happy Customers</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">24/7</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Delivery</div>
              </div>
            </div>
          </div>

          {/* Right content - Floating cards */}
          <div className="relative h-[400px] md:h-[500px] hidden lg:block">
            {/* Main delivery card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 backdrop-blur-xl bg-white/70 dark:bg-white/10 rounded-3xl p-6 border border-white/20 dark:border-purple-700/30 shadow-2xl animate-float">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center mb-4 shadow-[var(--glow-purple)]">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Delivery in 30 minutes or less to your doorstep
              </p>
            </div>

            {/* Floating card 1 */}
            <div className="absolute top-8 right-8 backdrop-blur-xl bg-white/60 dark:bg-white/10 rounded-2xl p-4 border border-white/20 dark:border-purple-700/30 shadow-xl animate-float-delayed">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-sm font-medium">Order #1234</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Arriving in 15 min</div>
                </div>
              </div>
            </div>

            {/* Floating card 2 */}
            <div className="absolute bottom-12 left-4 backdrop-blur-xl bg-white/60 dark:bg-white/10 rounded-2xl p-4 border border-white/20 dark:border-purple-700/30 shadow-xl animate-float">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium">Available Now</span>
              </div>
              <div className="text-sm">100+ Products in stock</div>
            </div>
          </div>
        </div>
      </div>

      {/* Background watermark logo */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] opacity-5 dark:opacity-10 pointer-events-none flex items-center justify-center">
        <ImageWithFallback
          src={logoWatermark}
          alt=""
          className="w-full h-full object-contain"
        />
      </div>
    </section>
  );
}
