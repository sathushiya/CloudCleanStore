import api from './api';

export const profileService = {
  async get() {
    const { data } = await api.get('/customer/profile');
    return data.data;
  },
  async update(name: string) {
    const { data } = await api.put('/customer/profile', { name });
    return data.data;
  },
  async updatePreferences(prefs: { notify_push?: boolean; notify_email?: boolean; notify_sms?: boolean }) {
    await api.put('/customer/profile/preferences', prefs);
  },
};

export default profileService;