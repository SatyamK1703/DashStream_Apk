import apiClient from './httpClient';

export const quickFixService = {
  getQuickFixes: () => {
    return apiClient.get('/quick-fixes');
  },
  createQuickFix: (data: { label: string; image: string; isActive?: boolean }) => {
    return apiClient.post('/quick-fixes', data);
  },
  updateQuickFix: (id: string, data: { label?: string; image?: string; isActive?: boolean }) => {
    return apiClient.put(`/quick-fixes/${id}`, data);
  },
  deleteQuickFix: (id: string) => {
    return apiClient.delete(`/quick-fixes/${id}`);
  },
};
