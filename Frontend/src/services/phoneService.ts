import api from './api';

export interface WhatsAppCheckResult {
  formatted: string;
  has_whatsapp: boolean | null;
}

export const phoneService = {
  async checkWhatsapp(phone: string) {
    const { data } = await api.post('/phone/check-whatsapp', { phone });
    return data.data as WhatsAppCheckResult;
  },

  async sendOtp(phone: string) {
    await api.post('/phone/send-otp', { phone });
  },

  async verifyOtp(phone: string, otp: string) {
    const { data } = await api.post('/phone/verify-otp', { phone, otp });
    return data.data as {
      phone_number: string;
      phone_verified_at: string;
      has_whatsapp: boolean | null;
    };
  },
};

export default phoneService;