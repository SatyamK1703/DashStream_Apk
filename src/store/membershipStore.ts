import { create } from 'zustand';
import { MEMBERSHIP_PLANS } from '../config/membershipPlans';
import { LocalMembershipPlan, MembershipPlan, UserMembership } from '../types/api';
import { membershipService } from '../services';

interface MembershipState {
  plans: MembershipPlan[];
  userMembership: UserMembership | null;
  loading: boolean;
  error: string | null;
  fetchUserMembership: () => Promise<void>;
  purchaseMembership: (planId: string, price: number) => Promise<any>;
  // You can add more state and actions related to membership here
}

export const useMembershipStore = create<MembershipState>((set) => ({
  plans: MEMBERSHIP_PLANS as MembershipPlan[],
  userMembership: null,
  loading: false,
  error: null,

  fetchUserMembership: async () => {
    set({ loading: true, error: null });
    try {
      const response = await membershipService.getMyMembership();
      if (response.success) {
        set({ userMembership: response.data, loading: false });
      } else {
        set({ error: response.message || 'Failed to fetch user membership', loading: false });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch user membership', loading: false });
    }
  },

  purchaseMembership: async (planId: string, amount: number) => {
    set({ loading: true, error: null });
    try {
      const response = await membershipService.purchaseMembership({ planId, amount });
      if (response.success) {
        set({ loading: false });
        return response.data; // This should now contain orderId, amount, currency
      } else {
        set({ error: response.message || 'Failed to purchase membership', loading: false });
        throw new Error(response.message || 'Failed to purchase membership');
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to purchase membership', loading: false });
      throw error;
    }
  },
}));
