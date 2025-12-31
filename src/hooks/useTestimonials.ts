import { useState, useEffect } from 'react';
import { useApi } from './useApi';
import { testimonialService } from '../services';
import { Testimonial } from '../services/testimonialService';

export const useTestimonials = () => {
  const api = useApi(
    () => testimonialService.getTestimonials(),
    {
      showErrorAlert: false,
    }
  );

  return {
    ...api,
    refresh: api.execute,
  };
};

export const useCreateTestimonial = () => {
  return useApi(
    (data: FormData) => testimonialService.createTestimonial(data),
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