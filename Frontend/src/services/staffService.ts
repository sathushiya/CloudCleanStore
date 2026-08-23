import api from './api';

export interface StaffAccount {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  role: 'admin' | 'staff' | 'staffsupervisor';
  is_active: boolean;
  is_available?: boolean;
  created_at: string;
}

export interface StaffInput {
  name: string;
  email: string;
  phone_number?: string;
  role: 'admin' | 'staff' | 'staffsupervisor';
  is_active?: boolean;
  password?: string;
}

export interface StaffPerformance {
  id: number;
  name: string;
  role: 'admin' | 'staff' | 'staffsupervisor';
  tasks_completed: number;
}

export const staffService = {
  async list() {
    const { data } = await api.get('/admin/staff');
    return data.data as StaffAccount[];
  },

  async create(payload: StaffInput) {
    const { data } = await api.post('/admin/staff', payload);
    return data.data as StaffAccount;
  },

  async update(id: number, payload: StaffInput) {
    const { data } = await api.put(`/admin/staff/${id}`, payload);
    return data.data as StaffAccount;
  },

  async remove(id: number) {
    await api.delete(`/admin/staff/${id}`);
  },

  // Self-only -- the logged-in staff/staffsupervisor toggles their own status
  async updateAvailability(isAvailable: boolean) {
    const { data } = await api.patch('/staff/availability', { is_available: isAvailable });
    return data.data as { is_available: boolean };
  },

  async performance() {
    const { data } = await api.get('/admin/staff/performance');
    return data.data as StaffPerformance[];
  },
};

export default staffService;