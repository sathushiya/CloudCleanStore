import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { productService } from '../../services/productService';
import { useProducts } from '../queries/useProducts';
vi.mock('../../services/productService', async () => {
  const actual = await vi.importActual('../../services/productService');
  return {
    ...actual,
    productService: {
      list: vi.fn(),
    },
  };
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts in a loading state', () => {
    (productService.list as any).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useProducts({}), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('returns product data once the request resolves', async () => {
    const mockResponse = {
      data: [{ id: 1, name: 'Test Product', brand_id: 1, category: 'kitchen', variants: [] }],
      current_page: 1,
    };
    (productService.list as any).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useProducts({}), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockResponse);
    expect(productService.list).toHaveBeenCalledWith({});
  });

  it('exposes an error state when the request fails', async () => {
    (productService.list as any).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useProducts({}), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('passes category filters through to the service call', async () => {
    (productService.list as any).mockResolvedValue({ data: [], current_page: 1 });

    renderHook(() => useProducts({ category: 'bathroom' }), { wrapper: createWrapper() });

    await waitFor(() =>
      expect(productService.list).toHaveBeenCalledWith({ category: 'bathroom' })
    );
  });
});