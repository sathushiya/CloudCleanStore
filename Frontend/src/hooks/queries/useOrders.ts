import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderService, OrderStatus } from '../../services/orderService';
import { queryKeys } from './queryKeys';

export function useMyOrders() {
  return useQuery({
    queryKey: queryKeys.orders.mine(),
    queryFn: () => orderService.myOrders(),
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (deliveryAddress: string) => orderService.checkout(deliveryAddress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
  });
}

export function useStaffOrders(status?: OrderStatus) {
  return useQuery({
    queryKey: queryKeys.orders.staffList(status),
    queryFn: () => orderService.staffList(status),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: OrderStatus }) =>
      orderService.updateStatus(orderId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.orders.all }),
  });
}

export function useAssignOrderToSelf() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: number) => orderService.assignToSelf(orderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.orders.all }),
  });
}