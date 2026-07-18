export const queryKeys = {
  products: {
    all: ['products'] as const,
    admin: ['products', 'admin'] as const,
  },
  brands: {
    all: ['brands'] as const,
    admin: ['brands', 'admin'] as const,
  },
};