import { create } from 'zustand';
import { membershipService } from '../services/membershipService';
import { Membership, UserMembership } from '../types/api';

interface MembershipState {
  plans: Membership[];
  userMembership: UserMembership | null;
  loading: boolean;
  error: any;
  fetchPlans: () => Promise<void>;
  fetchUserMembership: () => Promise<void>;
  purchaseMembership: (planId: string) => Promise<any>;
}

export const useMembershipStore = create<MembershipState>((set) => ({
  plans: [],
  userMembership: null,
  loading: false,
  error: null,
  fetchPlans: async () => {
    set({ loading: true, error: null });
    try {
      const response = await membershipService.getMembershipPlans();
      set({ plans: response.data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },
  fetchUserMembership: async () => {
    set({ loading: true, error: null });
    try {
      const response = await membershipService.getMyMembership();
      set({ userMembership: response.data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },
  purchaseMembership: async (planId: string, amount: number) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(API_ENDPOINTS.MEMBERSHIPS.PURCHASE, { planId, amount });
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ error, loading: false });
      throw error;
    }
  },
}));
