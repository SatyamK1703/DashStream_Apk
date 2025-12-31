import apiClient from './httpClient';

export interface Testimonial {
  id: string;
  name: string;
  instagramUrl: string;
  thumbnail: string;
}

// Mock data for now - replace with actual API calls later
const mockTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Aadarsh',
    instagramUrl: 'https://www.instagram.com/reel/DPHNxayjJpQ/?igsh=djExeXhjejhmYzQy',
    thumbnail: 'https://via.placeholder.com/300x300.png?text=Video+1',
  },
  {
    id: '2',
    name: 'Dolly Parma',
    instagramUrl: 'https://www.instagram.com/reel/DPHNxayjJpQ/?igsh=djExeXhjejhmYzQy',
    thumbnail: 'https://via.placeholder.com/300x300.png?text=Video+2',
  },
  {
    id: '3',
    name: 'Parma',
    instagramUrl: 'https://www.instagram.com/reel/DPHNxayjJpQ/?igsh=djExeXhjejhmYzQy',
    thumbnail: 'https://via.placeholder.com/300x300.png?text=Video+3',
  },
];

export const testimonialService = {
  getTestimonials: () => {
    // Mock implementation - replace with actual API call
    return Promise.resolve({
      success: true,
      status: 'success',
      message: 'Testimonials retrieved successfully',
      data: mockTestimonials
    });
    // return apiClient.get('/testimonials');
  },
  createTestimonial: (data: Omit<Testimonial, 'id'>) => {
    // Mock implementation
    const newTestimonial = { ...data, id: Date.now().toString() };
    mockTestimonials.push(newTestimonial);
    return Promise.resolve({
      success: true,
      status: 'success',
      message: 'Testimonial created successfully',
      data: newTestimonial
    });
    // return apiClient.post('/testimonials', data);
  },
  updateTestimonial: (id: string, data: Partial<Testimonial>) => {
    // Mock implementation
    const index = mockTestimonials.findIndex(t => t.id === id);
    if (index !== -1) {
      mockTestimonials[index] = { ...mockTestimonials[index], ...data };
      return Promise.resolve({
        success: true,
        status: 'success',
        message: 'Testimonial updated successfully',
        data: mockTestimonials[index]
      });
    }
    throw new Error('Testimonial not found');
    // return apiClient.put(`/testimonials/${id}`, data);
  },
  deleteTestimonial: (id: string) => {
    // Mock implementation
    const index = mockTestimonials.findIndex(t => t.id === id);
    if (index !== -1) {
      mockTestimonials.splice(index, 1);
      return Promise.resolve({
        success: true,
        status: 'success',
        message: 'Testimonial deleted successfully',
        data: null
      });
    }
    throw new Error('Testimonial not found');
    // return apiClient.delete(`/testimonials/${id}`);
  },
};