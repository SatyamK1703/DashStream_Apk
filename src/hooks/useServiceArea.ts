import { useCallback } from 'react';
import { useApi } from './useApi';
import * as api from '../services/httpClient';

export const useServiceArea = () => {
  const { execute: fetchServiceAreas, ...fetchState } = useApi(api.get, { showErrorAlert: false });
  const { execute: addServiceArea, ...addState } = useApi(api.post, { showErrorAlert: true });
  const { execute: deleteServiceArea, ...deleteState } = useApi(api.del, { showErrorAlert: true });
  const { execute: checkPincode, ...checkState } = useApi(api.get, { showErrorAlert: false });

  const getAreas = useCallback(() => fetchServiceAreas('/service-areas'), [fetchServiceAreas]);
  const createArea = useCallback((pincode: string) => addServiceArea('/service-areas', { pincode }), [addServiceArea]);
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
