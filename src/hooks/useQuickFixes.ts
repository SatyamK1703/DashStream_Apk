import { useApi } from './useApi';
import { quickFixService } from '../services/quickFixService';

export const useAdminQuickFixes = () => {
  return useApi(() => quickFixService.getQuickFixes(), {
    showErrorAlert: false,
  });
};

export const useCreateQuickFix = () => {
  return useApi((data: { label: string; image: string; isActive?: boolean }) => quickFixService.createQuickFix(data), {
    showErrorAlert: true,
  });
};

export const useUpdateQuickFix = () => {
  return useApi(
    ({ id, data }: { id: string; data: { label?: string; image?: string; isActive?: boolean } }) =>
      quickFixService.updateQuickFix(id, data),
    {
      showErrorAlert: true,
    }
  );
};

export const useDeleteQuickFix = () => {
  return useApi((id: string) => quickFixService.deleteQuickFix(id), {
    showErrorAlert: true,
  });
};
