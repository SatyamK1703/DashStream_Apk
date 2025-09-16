# DashStream App Repository Info

## Project Overview
- **Type**: React Native mobile application using Expo
- **Framework**: React Native 0.74.1 with React 18.2.0
- **Navigation**: React Navigation v7 (native stack + bottom tabs)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: React Context + Custom hooks
- **Backend Integration**: Axios-based HTTP client with custom API services

## Architecture
### Directory Structure
- `app/` - Navigation routes and main App component
- `src/components/` - Reusable UI components
- `src/context/` - React Context providers (Auth, etc.)
- `src/hooks/` - Custom React hooks for API calls and business logic
- `src/services/` - API service layer with HTTP client
- `src/screens/` - Screen components organized by user role
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions

### Key Features
- Multi-role authentication (customer/professional/admin)
- OTP-based login system
- Service booking and management
- Payment processing
- Location services
- Push notifications
- Real-time updates

## API Integration Pattern
- API-first implementation (no hardcoded data)
- Custom hooks wrapping service calls
- Centralized error handling
- Token-based authentication with refresh
- Pagination support for list views

## User Roles & Navigation
1. **Customer**: Home, Bookings, Support, Membership, Profile
2. **Professional**: Service management and booking handling
3. **Admin**: System administration and oversight

## Development Notes
- Uses TypeScript for type safety
- ESLint and Prettier for code formatting
- Expo development environment
- Android build configuration included

## Common Issues
- React version compatibility (ensure React 18.2.0 with RN 0.74.1)
- Hook usage must follow React rules (functional components only)
- API responses must be properly typed and validated