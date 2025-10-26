import { useCallback } from 'react';
import { useApi } from './useApi';
import api from '../services/httpClient';

export const useServiceArea = () => {
  const getApi = useCallback((...args: [string, any]) => api.get(...args), []);
  const postApi = useCallback((...args: [string, any]) => api.post(...args), []);
  const deleteApi = useCallback((...args: [string, any]) => api.delete(...args), []);

  const { execute: fetchServiceAreas, ...fetchState } = useApi(getApi, { showErrorAlert: false, cacheDuration: 300000 });
  const { execute: addServiceArea, ...addState } = useApi(postApi, { showErrorAlert: true });
  const { execute: deleteServiceArea, ...deleteState } = useApi(deleteApi, { showErrorAlert: true });
  const { execute: checkPincode, ...checkState } = useApi(getApi, { showErrorAlert: false });

  const getAreas = useCallback(() => {
    console.log('useServiceArea: Calling getAreas for /service-areas');
    return fetchServiceAreas('/service-areas');
  }, [fetchServiceAreas]);
  const createArea = useCallback((pincode: string, name: string) => addServiceArea('/service-areas', { pincode, name }), [addServiceArea]);
  const removeArea = useCallback((id: string) => deleteServiceArea(`/service-areas/${id}`), [deleteServiceArea]);
  const checkPincodeAvailability = useCallback((pincode: string) => checkPincode(`/service-areas/check?pincode=${pincode}`), [checkPincode]);

  return {
    getAreas,
    createArea,
    removeArea,
    checkPincodeAvailability,
    fetchState,
    addState,
    deleteState,
    checkState,
  };
};