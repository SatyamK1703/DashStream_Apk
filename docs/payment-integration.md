# Razorpay Payment Integration Documentation

## Overview

This document outlines the implementation of Razorpay payment gateway integration in the DashStream application. The integration allows users to make secure payments for services booked through the platform.

## Architecture

The payment system follows a client-server architecture with the following components:

1. **Frontend (React Native)**
   - Payment form and checkout UI
   - Payment state management
   - Success/failure handling
   - Payment history display

2. **Backend (Node.js/Express)**
   - Payment order creation
   - Webhook handling for payment status updates
   - Payment verification
   - Payment data storage and retrieval

## Backend Implementation

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/payments/create-order` | POST | Creates a new payment order |
| `/api/payments/verify` | POST | Verifies a completed payment |
| `/api/payments/webhook` | POST | Receives payment status updates from Razorpay |
| `/api/payments/user` | GET | Retrieves payment history for the current user |
| `/api/payments/:id` | GET | Retrieves details for a specific payment |

### Key Files

- `controllers/paymentController.js`: Handles payment-related business logic
- `routes/paymentRoutes.js`: Defines payment API routes
- `middleware/webhookMiddleware.js`: Processes raw webhook data
- `services/paymentService.js`: Interacts with Razorpay API
- `models/Payment.js`: Database schema for payment records

### Security Measures

1. **API Key Management**
   - Razorpay API keys stored in environment variables
   - Different keys for development and production environments

2. **Webhook Verification**
   - Raw body parsing for signature verification
   - Cryptographic verification of webhook signatures

3. **Payment Verification**
   - Server-side verification of payment authenticity
   - Prevention of payment spoofing

## Frontend Implementation

### Key Components

- `RazorpayCheckout.tsx`: Handles payment initialization and processing
- `PaymentScreen.tsx`: Main payment flow UI
- `PaymentHistoryScreen.tsx`: Displays user's payment history
- `PaymentDetailsScreen.tsx`: Shows detailed information for a specific payment

### State Management

- `PaymentContext.tsx`: Manages payment-related state across the application
- Handles payment methods, history, loading states, and errors

### Error Handling

- `notificationUtils.ts`: Provides utilities for displaying payment-related notifications
- Success and error notifications for payment events
- Consistent error handling across payment flows

## Integration Flow

1. **Order Creation**
   - User initiates payment from the booking screen
   - Frontend requests a new order from the backend
   - Backend creates order with Razorpay and returns order details

2. **Payment Processing**
   - Frontend displays Razorpay payment form with order details
   - User completes payment through Razorpay UI
   - Razorpay returns payment details to the frontend

3. **Payment Verification**
   - Frontend sends payment details to backend for verification
   - Backend verifies payment signature with Razorpay
   - Backend updates payment status in database

4. **Webhook Processing**
   - Razorpay sends payment status updates to webhook endpoint
   - Backend verifies webhook signature
   - Backend updates payment status based on webhook data

## Testing

### Test Environment

- Razorpay test mode for development and testing
- Test API keys for sandbox environment

### Test Script

- `tests/paymentFlow.test.js`: End-to-end test for payment flow
- Tests order creation, payment simulation, and verification

## Troubleshooting

### Common Issues

1. **Payment Verification Failures**
   - Check webhook signature verification
   - Ensure correct API keys are being used
   - Verify order details match payment details

2. **Webhook Not Receiving Updates**
   - Ensure webhook URL is publicly accessible
   - Check webhook endpoint is correctly configured in Razorpay dashboard
   - Verify raw body parsing middleware is correctly implemented

3. **Payment Form Not Loading**
   - Check Razorpay script is properly loaded
   - Verify order creation is successful
   - Check for console errors in frontend

## Future Improvements

1. **Additional Payment Methods**
   - UPI integration
   - Saved cards functionality
   - Subscription payments

2. **Enhanced Analytics**
   - Payment success/failure metrics
   - Conversion rate tracking
   - Payment method preferences

3. **User Experience**
   - Streamlined checkout process
   - Better error recovery
   - Payment receipt generation

## References

- [Razorpay Documentation](https://razorpay.com/docs/)
- [React Native Razorpay](https://www.npmjs.com/package/react-native-razorpay)
- [Express.js Documentation](https://expressjs.com/)