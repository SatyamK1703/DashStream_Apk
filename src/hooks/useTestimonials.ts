import { useState, useEffect } from 'react';
import { useApi } from './useApi';
import { testimonialService, Testimonial } from '../services';

export const useTestimonials = () => {
  return useApi(
    () => testimonialService.getTestimonials(),
    {
      showErrorAlert: false,
    }
  );
};

export const useCreateTestimonial = () => {
  return useApi(
    (data: Omit<Testimonial, 'id'>) => testimonialService.createTestimonial(data),
    {
      showErrorAlert: false,
    }
  );
};

export const useUpdateTestimonial = () => {
  return useApi(
    ({ id, data }: { id: string; data: Partial<Testimonial> }) => testimonialService.updateTestimonial(id, data),
    {
      showErrorAlert: false,
    }
  );
};

export const useDeleteTestimonial = () => {
  return useApi(
    (id: string) => testimonialService.deleteTestimonial(id),
    {
      showErrorAlert: false,
    }
  );
};