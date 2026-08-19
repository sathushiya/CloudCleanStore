import api from './api';

export const profileService = {
  async get() {
    const { data } = await api.get('/profile');
    return data.data;
  },
  async update(name: string) {
    const { data } = await api.put('/profile', { name });
    return data.data;
  },
  async updatePreferences(prefs: { notify_push?: boolean; notify_email?: boolean; notify_sms?: boolean }) {
    await api.put('/profile/preferences', prefs);
  },
};

export default profileService;