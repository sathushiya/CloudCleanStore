import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { products, categories } from '../../data/products';
import type { Product } from '../../data/products';

interface SearchBarProps {
  onProductSelect: (product: Product) => void;
}

export default function SearchBar({ onProductSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesQuery =
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.brand.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase());

    return matchesQuery;
  });

  const handleProductClick = (product: Product) => {
    onProductSelect(product);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search products by brand or name"
          className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a1425] border border-gray-200 dark:border-purple-700/20 rounded-2xl shadow-2xl max-h-96 overflow-y-auto z-50">
          {filteredProducts.length > 0 ? (
            <div className="p-2">
              <div className="text-xs text-gray-500 dark:text-gray-400 px-3 py-2">
                {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} found
              </div>
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{product.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{product.brand}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        From LKR {product.variants[0].price.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">
                        • {categories.find((c) => c.id === product.category)?.name}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No products found</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
