// hooks/useAdminOffers.ts
import { useState, useEffect } from 'react';
import httpClient from '../services/httpClient';
import { ENDPOINTS } from '../config/env';

export const useAdminOffers = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const { data } = await httpClient.get(ENDPOINTS.OFFERS.LIST);
      setData(data || []);
    } catch (err) {
      setError(err);
      console.error('Fetch offers error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  return { data, loading, error, refresh: fetchOffers };
};

export const useCreateOffer = () => {
  const [loading, setLoading] = useState(false);
  const execute = async (offerData: any) => {
    setLoading(true);
    try {
      const { data } = await httpClient.post(ENDPOINTS.OFFERS.CREATE, offerData);
      return data;
    } finally {
      setLoading(false);
    }
  };
  return { execute, loading };
};

export const useUpdateOffer = () => {
  const [loading, setLoading] = useState(false);
  const execute = async (id: string, offerData: any) => {
    setLoading(true);
    try {
      const { data } = await httpClient.put(`${ENDPOINTS.OFFERS.UPDATE}/${id}`, offerData);
      return data;
    } finally {
      setLoading(false);
    }
  };
  return { execute, loading };
};

export const useDeleteOffer = () => {
  const [loading, setLoading] = useState(false);
  const execute = async (id: string) => {
    setLoading(true);
    try {
      await httpClient.delete(`${ENDPOINTS.OFFERS.DELETE}/${id}`);
    } finally {
      setLoading(false);
    }
  };
  return { execute, loading };
};

export const useToggleOfferStatus = () => {
  const [loading, setLoading] = useState(false);
  const execute = async (id: string, isActive: boolean) => {
    setLoading(true);
    try {
      const { data } = await httpClient.patch(`${ENDPOINTS.OFFERS.TOGGLE}/${id}`, { isActive });
      return data;
    } finally {
      setLoading(false);
    }
  };
  return { execute, loading };
};
