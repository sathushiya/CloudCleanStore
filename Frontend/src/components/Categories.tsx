import { Droplets, Sparkles, SprayCan, UtensilsCrossed, Shirt, Factory } from 'lucide-react';

const categories = [
  {
    name: 'Bathroom Cleaners',
    id: 'bathroom',
    icon: Droplets,
    gradient: 'from-blue-500 to-cyan-500',
    count: '45+ Products'
  },
  {
    name: 'Floor Cleaners',
    id: 'floor',
    icon: Sparkles,
    gradient: 'from-purple-500 to-pink-500',
    count: '38+ Products'
  },
  {
    name: 'Kitchen Chemicals',
    id: 'kitchen',
    icon: UtensilsCrossed,
    gradient: 'from-orange-500 to-red-500',
    count: '52+ Products'
  },
  {
    name: 'Glass Cleaners',
    id: 'glass',
    icon: SprayCan,
    gradient: 'from-teal-500 to-emerald-500',
    count: '28+ Products'
  },
  {
    name: 'Laundry Products',
    id: 'laundry',
    icon: Shirt,
    gradient: 'from-indigo-500 to-purple-500',
    count: '64+ Products'
  },
  {
    name: 'Industrial Chemicals',
    id: 'industrial',
    icon: Factory,
    gradient: 'from-gray-600 to-gray-800',
    count: '72+ Products'
  }
];

interface CategoriesProps {
  onCategoryClick?: (categoryId: string) => void;
}

export default function Categories({ onCategoryClick }: CategoriesProps = {}) {
  const handleCategoryClick = (categoryId: string) => {
    onCategoryClick?.(categoryId);
  };
  return (
    <section className="py-16 md:py-24" id="categories">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
            Browse Categories
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Shop by Category
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find the perfect cleaning solution for every space in your home or business
          </p>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div
                key={index}
                onClick={() => handleCategoryClick(category.id)}
                className="group relative backdrop-blur-xl bg-white/60 dark:bg-white/5 rounded-3xl p-8 border border-white/20 dark:border-purple-700/20 hover:border-purple-300 dark:hover:border-purple-600/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 cursor-pointer overflow-hidden"
              >
                {/* Background gradient glow */}
                <div className={`absolute inset-0 bg-linear-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                {/* Icon */}
                <div className={`relative w-16 h-16 bg-linear-to-br ${category.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {category.count}
                </p>

                {/* Arrow indicator */}
                <div className="flex items-center text-sm font-medium text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
