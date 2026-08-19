import { useEffect, useState } from 'react';
import { productService, Brand } from '../services/productService';

interface BrandsProps {
  onNavigateToShop?: () => void;
}

// Fallback color for brands that don't have a logo uploaded yet
const FALLBACK_COLORS = [
  'from-purple-500 to-purple-600',
  'from-blue-500 to-blue-600',
  'from-orange-500 to-orange-600',
  'from-green-500 to-green-600',
  'from-pink-500 to-pink-600',
];

export default function Brands({ onNavigateToShop }: BrandsProps = {}) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    productService.listBrands()
      .then((data) => { if (!cancelled) setBrands(data); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Browsing by brand is open to everyone, guest or not -- login is only
  // required once someone tries to actually buy something inside the Shop.
  const handleViewProducts = (brand: Brand) => {
    sessionStorage.setItem('selectedBrandId', String(brand.id));
    sessionStorage.setItem('selectedBrandName', brand.name);
    onNavigateToShop?.();
  };

  if (!isLoading && brands.length === 0) {
    return null; // nothing to show yet, don't render an empty section
  }

  return (
    <section className="py-16 md:py-24" id="brands">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
            Top Brands
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Brand</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Premium cleaning products from our trusted brand partners
          </p>
        </div>

        {isLoading && (
          <div className="text-center py-8 text-gray-500">Loading brands...</div>
        )}

        {!isLoading && (
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {brands.map((brand, index) => (
              <div
                key={brand.id}
                className="shrink-0 w-64 bg-white dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-purple-700/20 p-6 hover:border-purple-300 dark:hover:border-purple-600/50 transition-all hover:shadow-lg"
              >
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-20 h-20 rounded-2xl object-cover mb-4"
                  />
                ) : (
                  <div
                    className={`w-20 h-20 rounded-2xl bg-linear-to-br ${FALLBACK_COLORS[index % FALLBACK_COLORS.length]} flex items-center justify-center mb-4`}
                  >
                    <span className="text-white font-bold text-xl">
                      {brand.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}

                <h3 className="text-xl font-bold mb-1">{brand.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {brand.products_count ?? 0} product{brand.products_count === 1 ? '' : 's'} available
                </p>

                <button
                  onClick={() => handleViewProducts(brand)}
                  className="w-full py-2.5 rounded-full border-2 border-purple-600 text-purple-600 dark:text-purple-400 font-medium hover:bg-purple-600 hover:text-white transition-all"
                >
                  View Products
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}