import { useState, useEffect } from 'react';
import { useApi, usePaginatedApi } from './useApi';
import { membershipService } from '../services';
import { Membership, UserMembership } from '../types/api';

// Hook for fetching membership plans
export const useMembershipPlans = () => {
  return useApi(
    () => membershipService.getMembershipPlans(),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for current user membership
export const useMyMembership = () => {
  return useApi(
    () => membershipService.getMyMembership(),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for purchasing membership
export const usePurchaseMembership = () => {
  return useApi(
    (data: {
      membershipId: string;
      paymentMethod: 'card' | 'upi' | 'wallet' | 'netbanking';
    }) => membershipService.purchaseMembership(data),
    {
      showErrorAlert: true,
    }
  );
};

// Hook for verifying membership payment
export const useVerifyMembershipPayment = () => {
  return useApi(
    (data: {
      orderId: string;
      paymentId: string;
      signature: string;
      membershipId: string;
    }) => membershipService.verifyMembershipPayment(data),
    {
      showErrorAlert: true,
    }
  );
};

// Hook for canceling membership
export const useCancelMembership = () => {
  return useApi(
    (reason?: string) => membershipService.cancelMembership(reason),
    {
      showErrorAlert: true,
    }
  );
};

// Hook for membership usage history
export const useMembershipUsage = (filters?: {
  startDate?: string;
  endDate?: string;
}) => {
  return usePaginatedApi(
    (params) => membershipService.getMembershipUsage({ ...filters, ...params }),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for calculating membership benefits
export const useCalculateMembershipBenefits = () => {
  return useApi(
    (data: {
      serviceId: string;
      amount: number;
    }) => membershipService.calculateMembershipBenefits(data),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for renewing membership
export const useRenewMembership = () => {
  return useApi(
    (data: {
      membershipId?: string;
      paymentMethod: 'card' | 'upi' | 'wallet' | 'netbanking';
    }) => membershipService.renewMembership(data),
    {
      showErrorAlert: true,
    }
  );
};