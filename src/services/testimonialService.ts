import apiClient from './httpClient';

export interface Testimonial {
  id: string;
  name: string;
  instagramUrl: string;
  thumbnail: {
    public_id?: string;
    url: string;
  };
}

export const testimonialService = {
  getTestimonials: () => {
    return apiClient.get('/testimonials');
  },
  createTestimonial: (data: FormData) => {
    return apiClient.post('/testimonials', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteTestimonial: (id: string) => {
    return apiClient.delete(`/testimonials/${id}`);
  },
};