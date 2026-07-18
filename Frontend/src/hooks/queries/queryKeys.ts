export const queryKeys = {
  products: {
    all: ['products'] as const,
    list: (filters: any) => ['products', 'list', filters] as const,
    admin: ['products', 'admin'] as const,
  },
  brands: {
    all: ['brands'] as const,
    admin: ['brands', 'admin'] as const,
  },
  orders: {
    all: ['orders'] as const,
    mine: () => ['orders', 'mine'] as const,
    staffList: (status?: string) => ['orders', 'staff', status] as const,
  },
  cart: {
    all: ['cart'] as const,
  },
  staff: {
    all: ['staff'] as const,
  },
};