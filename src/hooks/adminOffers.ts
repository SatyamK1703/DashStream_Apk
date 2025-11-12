import { useState, useEffect, useCallback } from 'react';
import httpClient from '../services/httpClient';
import { API_ENDPOINTS } from '../config/config';

export const useAdminOffers = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await httpClient.get(API_ENDPOINTS.OFFERS.ALL);
      const items = (resp as any)?.offers || (resp as any)?.data?.offers || (resp as any)?.data || [];
      setData(Array.isArray(items) ? items : []);
    } catch (err) {
      setError(err);
      console.error('Fetch offers error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  return { data, loading, error, refresh: fetchOffers };
};

export const useCreateOffer = () => {
  const [loading, setLoading] = useState(false);
  const execute = async (offerData: any) => {
    setLoading(true);
    try {
      const resp = await httpClient.post(API_ENDPOINTS.OFFERS.ALL, offerData);
      // Backend returns { status, data: { offer } }
      return (resp as any)?.data?.offer || (resp as any)?.offer || resp;
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
      const resp = await httpClient.patch(API_ENDPOINTS.OFFERS.BY_ID(id), offerData);
      // Backend returns { status, data: { offer } }
      return (resp as any)?.data?.offer || (resp as any)?.offer || resp;
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
      await httpClient.delete(API_ENDPOINTS.OFFERS.BY_ID(id));
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
      // Backend has separate API_ENDPOINTS for activate/deactivate
      const url = isActive
        ? `${API_ENDPOINTS.OFFERS.BY_ID(id)}/activate`
        : `${API_ENDPOINTS.OFFERS.BY_ID(id)}/deactivate`;
      const resp = await httpClient.patch(url);
      return (resp as any)?.data?.offer || (resp as any)?.offer || resp;
    } finally {
      setLoading(false);
    }
  };
  return { execute, loading };
};

export const useOfferStats = (offerId: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchStats = useCallback(async () => {
    if (!offerId) return;
    try {
      setLoading(true);
      const resp = await httpClient.get(API_ENDPOINTS.OFFERS.STATS(offerId));
      // Backend returns { status, data: { offer, usageHistory, topUsers, totalRevenue, totalSavings } }
      setData((resp as any)?.data || resp);
    } catch (err) {
      setError(err);
      console.error('Fetch offer stats error:', err);
    } finally {
      setLoading(false);
    }
  }, [offerId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refresh: fetchStats };
};
