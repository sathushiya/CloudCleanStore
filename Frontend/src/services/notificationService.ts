import api from './api';

export interface AdminNotification {
  id: number;
  type: 'order' | 'staff' | 'product' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  read_at: string | null;
  created_at: string;
}

export const notificationService = {
  async list() {
    const { data } = await api.get('/admin/notifications');
    return data.data as AdminNotification[];
  },
  async markRead(id: number) {
    const { data } = await api.patch(`/admin/notifications/${id}/read`);
    return data.data as AdminNotification;
  },
  async markAllRead() {
    await api.patch('/admin/notifications/read-all');
  },
  async remove(id: number) {
    await api.delete(`/admin/notifications/${id}`);
  },
  async clearAll() {
    await api.delete('/admin/notifications');
  },
};

export default notificationService;
