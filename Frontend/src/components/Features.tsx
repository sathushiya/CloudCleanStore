import { Package, ShoppingBag, Truck, Shield, Clock, Leaf, HeadphonesIcon, Award } from 'lucide-react';

const deliverySteps = [
  {
    step: '01',
    title: 'Browse Products',
    description: 'Explore our wide range of premium cleaning products',
    icon: ShoppingBag
  },
  {
    step: '02',
    title: 'Place Order',
    description: 'Add items to cart and checkout securely',
    icon: Package
  },
  {
    step: '03',
    title: 'Fast Delivery',
    description: 'Get your products delivered in 30 minutes or less',
    icon: Truck
  }
];

const features = [
  {
    title: 'Quality Guaranteed',
    description: 'Premium products from trusted brands',
    icon: Award,
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    title: 'Fast Delivery',
    description: 'Express shipping to your doorstep',
    icon: Clock,
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'Eco-Friendly',
    description: 'Sustainable and environmentally safe',
    icon: Leaf,
    gradient: 'from-emerald-500 to-green-500'
  },
  {
    title: 'Secure Payment',
    description: 'Safe and encrypted transactions',
    icon: Shield,
    gradient: 'from-orange-500 to-red-500'
  },
  {
    title: '24/7 Support',
    description: 'Always here to help you',
    icon: HeadphonesIcon,
    gradient: 'from-indigo-500 to-purple-500'
  },
  {
    title: 'Best Prices',
    description: 'Competitive pricing guaranteed',
    icon: Package,
    gradient: 'from-pink-500 to-rose-500'
  }
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Homeowner',
    avatar: 'SJ',
    rating: 5,
    text: 'Amazing service! The products are top quality and delivery is incredibly fast. My home has never been cleaner.',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    name: 'Michael Chen',
    role: 'Restaurant Owner',
    avatar: 'MC',
    rating: 5,
    text: 'We switched to Cloud Clean Store for our restaurant supplies. The industrial cleaners are excellent and prices are competitive.',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    name: 'Emily Davis',
    role: 'Office Manager',
    avatar: 'ED',
    rating: 5,
    text: 'Perfect for our office needs. The eco-friendly products work great and the bulk ordering is so convenient.',
    gradient: 'from-emerald-500 to-green-500'
  }
];

export default function Features() {
  return (
    <>
      {/* Delivery Process */}
      <section className="py-16 md:py-24 bg-gray-50/50 dark:bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
              How It Works
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple Delivery Process
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Get your cleaning products delivered in just three easy steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {deliverySteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  {/* Connector line */}
                  {index < deliverySteps.length - 1 && (
                    <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-purple-300 to-purple-100 dark:from-purple-700 dark:to-purple-900" />
                  )}

                  <div className="relative backdrop-blur-xl bg-white dark:bg-white/5 rounded-3xl p-8 border border-gray-200 dark:border-purple-700/20 hover:border-purple-300 dark:hover:border-purple-600/50 transition-all duration-300 hover:shadow-xl">
                    {/* Step number */}
                    <div className="text-6xl font-bold text-purple-100 dark:text-purple-900/50 mb-4">
                      {step.step}
                    </div>

                    {/* Icon */}
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mobile App Preview */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
                Download Our App
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Shop On The Go
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Download our mobile app for a seamless shopping experience. Order anytime, anywhere with exclusive app-only deals.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button className="flex items-center justify-center gap-3 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl hover:scale-105 transition-transform">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs">Download on the</div>
                    <div className="text-lg font-semibold">App Store</div>
                  </div>
                </button>

                <button className="flex items-center justify-center gap-3 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl hover:scale-105 transition-transform">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs">Get it on</div>
                    <div className="text-lg font-semibold">Google Play</div>
                  </div>
                </button>
              </div>

              <div className="flex items-center gap-8">
                <div>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">4.9</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">App Rating</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">50k+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Downloads</div>
                </div>
              </div>
            </div>

            <div className="relative h-[500px] hidden lg:block">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-72 h-[600px] bg-gradient-to-br from-purple-600 to-purple-800 rounded-[3rem] p-3 shadow-2xl shadow-purple-500/50 rotate-6 hover:rotate-0 transition-transform duration-500">
                  <div className="w-full h-full bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden">
                    <div className="h-8 bg-gray-100 dark:bg-gray-800" />
                    <div className="p-6">
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl mx-auto mb-3" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto mb-2" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto" />
                      </div>
                      <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-gray-50/50 dark:bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
              Why Choose Us
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Makes Us Different
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Experience premium service and quality with every order
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="backdrop-blur-xl bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20 hover:border-purple-300 dark:hover:border-purple-600/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-4`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
              Testimonials
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our Customers Say
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust Cloud Clean Store
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="backdrop-blur-xl bg-white dark:bg-white/5 rounded-3xl p-8 border border-gray-200 dark:border-purple-700/20 hover:border-purple-300 dark:hover:border-purple-600/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  "{testimonial.text}"
                </p>

                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${testimonial.gradient} rounded-full flex items-center justify-center text-white font-bold`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
