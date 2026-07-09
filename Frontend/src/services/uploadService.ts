import api from './api';

export const uploadService = {
  // Uploads a single image file and returns its public Cloudinary URL
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const { data } = await api.post('/admin/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data.data.url as string;
  },
};

export default uploadService;
