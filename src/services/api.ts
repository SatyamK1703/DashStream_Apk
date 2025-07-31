// src/services/api.ts
// Stub for API integration

export const sendOtp = async (phone: string) => {
  // TODO: Implement API call
  return Promise.resolve({ success: true });
};

export const verifyOtp = async (phone: string, otp: string) => {
  // TODO: Implement API call
  return Promise.resolve({ success: true, user: null });
};

export const fetchBookings = async (userId: string) => {
  // TODO: Implement API call
  return Promise.resolve([]);
};

// Add more API methods as needed 