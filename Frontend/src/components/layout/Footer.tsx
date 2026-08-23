import { Mail, Phone, MapPin, Instagram } from 'lucide-react';
import Logo from '../common/Logo';

export default function Footer() {
  return (
    <footer id="footer" className="relative bg-linear-to-br from-gray-50 to-purple-50 dark:from-[#0f0a1e] dark:to-[#1a1425] border-t border-gray-200 dark:border-purple-700/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <Logo variant="icon" className="mb-6" />
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
              Your trusted partner for premium cleaning products. Fast delivery, quality guaranteed.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/cloud_clean.lk?igsh=Mm01b3M2OXNhYnNw&igsi=Mm01b3M2OXNhYnNw"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Cloud Clean on Instagram"
                className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="#home" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm">
                  Home
                </a>
              </li>
              <li>
                <a href="#categories" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm">
                  Categories
                </a>
              </li>
              <li>
                <a href="#products" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm">
                  Products
                </a>
              </li>
              <li>
                <a href="#brands" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm">
                  Brands
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-bold mb-6">Stay Updated</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              Subscribe to get special offers and updates
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors text-sm"
              />
              <button
                type="submit"
                className="w-full px-4 py-3 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-2xl font-medium hover:shadow-(--glow-purple) transition-all text-sm"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-t border-b border-gray-200 dark:border-purple-700/20 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="font-semibold mb-1 text-sm">Call Us</div>
              <a href="tel:+94765427147" className="text-gray-600 dark:text-gray-400 text-sm hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                076 542 7147
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="font-semibold mb-1 text-sm">Email Us</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">support@cloudclean.store</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="font-semibold mb-1 text-sm">Visit Us</div>
              <a
                href="https://maps.app.goo.gl/bcmSAAUUY3TrCqQW9?g_st=ic"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 text-sm hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Cloud Clean Chemical
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div>
            © 2026 Cloud Clean Store. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-[128px] opacity-10 pointer-events-none" />
    </footer>
  );
}
