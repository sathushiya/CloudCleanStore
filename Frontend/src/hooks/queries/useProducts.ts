import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productService, toFrontendProduct, Brand } from '../../services/productService';
import { Product } from '../../data/products';
import { queryKeys } from './queryKeys';

// ─── Products ───────────────────────────────────────────────────────────────

export function useAdminProducts() {
  return useQuery({
    queryKey: queryKeys.products.admin,
    queryFn: async (): Promise<Product[]> => {
      const apiProducts = await productService.adminList();
      return apiProducts.map(toFrontendProduct);
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof productService.create>[0]) =>
      productService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.admin });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof productService.update>[1] }) =>
      productService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.admin });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.admin });
    },
  });
}

// ─── Brands ─────────────────────────────────────────────────────────────────

export function useAdminBrands() {
  return useQuery({
    queryKey: queryKeys.brands.admin,
    queryFn: (): Promise<Brand[]> => productService.adminListBrands(),
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof productService.createBrand>[0]) =>
      productService.createBrand(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.admin });
    },
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof productService.updateBrand>[1] }) =>
      productService.updateBrand(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.admin });
    },
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productService.removeBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.admin });
    },
  });
}