import api from './api';

export interface Profile {
  id: number;
  name: string;
  email: string;
  phone_number: string | null;
  phone_verified_at: string | null;
  has_whatsapp: boolean | null;
  created_at: string;
  notify_push: boolean;
  notify_email: boolean;
  notify_sms: boolean;
}

export const profileService = {
  async get() {
    const { data } = await api.get('/profile');
    return data.data as Profile;
  },
  async update(name: string) {
    const { data } = await api.put('/profile', { name });
    return data.data;
  },
  async updatePreferences(prefs: { notify_push?: boolean; notify_email?: boolean; notify_sms?: boolean }) {
    await api.put('/profile/preferences', prefs);
  },
  async changePassword(currentPassword: string, newPassword: string, newPasswordConfirmation: string) {
    const { data } = await api.put('/profile/password', {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: newPasswordConfirmation,
    });
    return data;
  },
};

export default profileService;