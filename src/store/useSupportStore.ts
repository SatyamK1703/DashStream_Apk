import { create } from 'zustand';
import { supportService } from '../services/supportService';

interface SupportState {
  submitting: boolean;
  error: string | null;
  submitQuestion: (data: { issueType: string; message: string }) => Promise<void>;
}

export const useSupportStore = create<SupportState>((set) => ({
  submitting: false,
  error: null,
  submitQuestion: async (data) => {
    set({ submitting: true, error: null });
    try {
      await supportService.createQuestion(data);
      set({ submitting: false });
    } catch (error: any) {
      set({ error: error.message, submitting: false });
      throw error;
    }
  },
}));
