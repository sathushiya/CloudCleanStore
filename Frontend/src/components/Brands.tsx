const brands = [
  { name: 'CleanPro', products: 45, logo: 'CP' },
  { name: 'GreenClean', products: 38, logo: 'GC' },
  { name: 'ShineMax', products: 52, logo: 'SM' },
  { name: 'PowerClean', products: 41, logo: 'PC' },
  { name: 'SafeGuard', products: 33, logo: 'SG' },
  { name: 'TileShine', products: 28, logo: 'TS' },
  { name: 'FreshWash', products: 56, logo: 'FW' },
  { name: 'FreshAir', products: 24, logo: 'FA' },
  { name: 'EcoClean', products: 47, logo: 'EC' },
  { name: 'PureSpray', products: 35, logo: 'PS' }
];

const gradients = [
  'from-purple-500 to-pink-500',
  'from-blue-500 to-cyan-500',
  'from-orange-500 to-red-500',
  'from-teal-500 to-emerald-500',
  'from-indigo-500 to-purple-500',
  'from-pink-500 to-rose-500',
  'from-cyan-500 to-blue-500',
  'from-emerald-500 to-green-500',
  'from-violet-500 to-purple-500',
  'from-amber-500 to-orange-500'
];

export default function Brands() {
  return (
    <section className="py-16 md:py-24" id="brands">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
            Top Brands
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Shop by Brand
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Premium cleaning products from the world's most trusted brands
          </p>
        </div>

        {/* Scrollable brands */}
        <div className="relative">
          {/* Gradient overlays for scroll indication */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white dark:from-[#0f0a1e] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white dark:from-[#0f0a1e] to-transparent z-10 pointer-events-none" />

          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {brands.map((brand, index) => (
              <div
                key={index}
                className="group flex-shrink-0 w-64 backdrop-blur-xl bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20 hover:border-purple-300 dark:hover:border-purple-600/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 cursor-pointer snap-center"
              >
                {/* Brand logo */}
                <div className={`w-20 h-20 bg-gradient-to-br ${gradients[index % gradients.length]} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl font-bold text-white">{brand.logo}</span>
                </div>

                {/* Brand info */}
                <h3 className="text-xl font-bold mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {brand.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {brand.products} Products Available
                </p>

                {/* View button */}
                <button className="w-full py-2 border border-purple-300 dark:border-purple-600 text-purple-600 dark:text-purple-400 rounded-full text-sm font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                  View Products
                </button>
              </div>
            ))}
          </div>
        </div>
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
