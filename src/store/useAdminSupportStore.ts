import { create } from 'zustand';
import { adminSupportService } from '../services/adminSupportService';

interface AdminSupportState {
  questions: any[];
  loading: boolean;
  error: string | null;
  fetchQuestions: () => Promise<void>;
  replyToQuestion: (questionId: string, message: string) => Promise<void>;
}

export const useAdminSupportStore = create<AdminSupportState>((set) => ({
  questions: [],
  loading: false,
  error: null,
  fetchQuestions: async () => {
    set({ loading: true, error: null });
    try {
      const response = await adminSupportService.getQuestions();
      set({ questions: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  replyToQuestion: async (questionId, message) => {
    try {
      await adminSupportService.replyToQuestion(questionId, message);
    } catch (error: any) {
      // Handle error appropriately
      console.error('Failed to reply to question:', error);
      throw error;
    }
  },
}));
