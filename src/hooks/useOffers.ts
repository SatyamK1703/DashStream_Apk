import { useState, useEffect } from 'react';
import { useApi, usePaginatedApi } from './useApi';
import { offerService } from '../services';
import { Offer } from '../types/api';

// Hook for fetching active offers
export const useActiveOffers = () => {
  return usePaginatedApi(
    (params) => offerService.getActiveOffers(params),
    { showErrorAlert: false },
    (resp) => {
      const items = resp.offers ?? [];
      const total = resp.results ?? items.length;
      return { items, total };
    }
  );
};

// Hook for fetching all offers
export const useAllOffers = (filters?: {
  status?: 'active' | 'inactive' | 'expired';
}) => {
  return usePaginatedApi(
    (params) => offerService.getAllOffers({ ...filters, ...params }),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for offer details
export const useOfferDetails = (offerId: string | null) => {
  const api = useApi(
    () => offerService.getOfferById(offerId!),
    {
      showErrorAlert: false,
    }
  );

  useEffect(() => {
    if (offerId) {
      api.execute();
    }
  }, [offerId, api.execute]);

  return api;
};

// Hook for applying offer
export const useApplyOffer = () => {
  return useApi(
    (data: {
      code: string;
      amount: number;
      serviceIds?: string[];
    }) => offerService.applyOffer(data),
    {
      showErrorAlert: false, // Handle in component for better UX
    }
  );
};

// Hook for personalized offers
export const usePersonalizedOffers = () => {
  return useApi(
    () => offerService.getPersonalizedOffers(),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for marking offer as viewed
export const useMarkOfferViewed = () => {
  return useApi(
    (offerId: string) => offerService.markOfferViewed(offerId),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for offer usage history
export const useOfferUsageHistory = (filters?: {
  startDate?: string;
  endDate?: string;
}) => {
  return usePaginatedApi(
    (params) => offerService.getOfferUsageHistory({ ...filters, ...params }),
    {
      showErrorAlert: false,
    }
  );
};