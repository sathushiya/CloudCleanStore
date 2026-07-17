import api from './api';

export interface StaffAccount {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  role: 'admin' | 'staff' | 'staffsupervisor';
  is_active: boolean;
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
};

export default staffService;