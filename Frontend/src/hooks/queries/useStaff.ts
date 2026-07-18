import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { staffService, StaffInput } from '../../services/staffService';
import { queryKeys } from './queryKeys';

export function useStaffList() {
  return useQuery({
    queryKey: queryKeys.staff.all,
    queryFn: () => staffService.list(),
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StaffInput) => staffService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.staff.all }),
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: StaffInput }) => staffService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.staff.all }),
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => staffService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.staff.all }),
  });
}
