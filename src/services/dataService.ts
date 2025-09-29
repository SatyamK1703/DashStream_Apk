// src/services/dataService.ts
// Centralized data service that aggregates all individual services

import { authService } from './authService';
import { userService } from './userService';
import { serviceService } from './serviceService';
import { bookingService } from './bookingService';
import { paymentService } from './paymentService';
import { vehicleService } from './vehicleService';
import { offerService } from './offerService';
import { notificationService } from './notificationService';
import { membershipService } from './membershipService';
import { locationService } from './locationService';
import { adminService } from './adminService';
import { professionalService } from './professionalService';

class DataService {
  // Auth methods
  async sendOtp(phone: string) {
    return authService.sendOtp(phone);
  }

  async verifyOtp(phone: string, otp: string) {
    return authService.verifyOtp(phone, otp);
  }

  async logout() {
    return authService.logout();
  }

  async loginAsGuest() {
    return authService.loginAsGuest();
  }

  async updateUserProfile(userId: string, userData: any) {
    return authService.updateProfile(userId, userData);
  }

  async getCurrentUser() {
    return authService.getCurrentUser();
  }

  // User methods
  async getUsers(filters?: any) {
    return userService.getAllUsers(filters);
  }

  async getUserById(id: string) {
    return userService.getUserById(id);
  }

  // Service methods
  async getServices(filters?: any) {
    return serviceService.getAllServices(filters);
  }

  async getServiceById(id: string) {
    return serviceService.getServiceById(id);
  }

  async getPopularServices(limit?: number) {
    return serviceService.getPopularServices(limit);
  }

  // Offer methods
  async getOffers() {
    return offerService.getAllOffers();
  }

  async getOfferById(id: string) {
    return offerService.getOfferById(id);
  }

  async validateOfferCode(code: string, serviceId?: string, orderAmount?: number) {
    const response = await offerService.applyOffer({ code, amount: orderAmount || 0, serviceIds: serviceId ? [serviceId] : undefined });
    return {
      isValid: response.valid,
      offer: response.offer,
      error: response.message ? undefined : 'Invalid offer code'
    };
  }

  // Booking methods
  async getBookings(userId?: string) {
    return bookingService.getMyBookings();
  }

  async createBooking(bookingData: any) {
    return bookingService.createBooking(bookingData);
  }

  async updateBookingStatus(id: string, status: string) {
    return bookingService.updateBookingStatus(id, status as 'confirmed' | 'in-progress' | 'completed');
  }

  async getBookingById(id: string) {
    return bookingService.getBookingById(id);
  }

  async cancelBooking(id: string, reason: string) {
    return bookingService.cancelBooking(id, reason);
  }

  // Professional methods
  async getProfessionals(filters?: any) {
    return professionalService.getAllProfessionals(filters);
  }

  async getNearbyProfessionals(location: { latitude: number; longitude: number }, radius?: number) {
    return professionalService.getNearbyProfessionals(location, radius);
  }

  async getProfessionalById(id: string) {
    return professionalService.getProfessionalById(id);
  }

  // Payment methods
  async processPayment(paymentData: any) {
    return paymentService.processPayment(paymentData);
  }

  // Vehicle methods
  async getUserVehicles(userId: string) {
    return vehicleService.getUserVehicles(userId);
  }

  async createVehicle(vehicleData: any) {
    return vehicleService.createVehicle(vehicleData);
  }

  // Notification methods
  async getNotifications(userId: string) {
    return notificationService.getNotifications(userId);
  }

  // Membership methods
  async getMemberships() {
    return membershipService.getAllMemberships();
  }

  async purchaseMembership(membershipId: string) {
    return membershipService.purchaseMembership(membershipId);
  }

  // Location methods
  async searchLocations(query: string) {
    return locationService.searchLocations(query);
  }

  // Admin methods
  async getDashboardStats() {
    return adminService.getDashboardStats();
  }
}

// Export singleton instance
const dataService = new DataService();
export default dataService;