# Render Error Fix: Property 'useAuthStore' doesn't exist

## Issue Description
The app was throwing a runtime error: "Property 'useAuthStore' doesn't exist" when trying to use `useInitializeStores` hook.

## Root Cause
**Circular Dependency Issue**: The `src/store/index.ts` file was both exporting stores AND importing them for helper functions, creating a circular dependency that caused module resolution issues in React Native Metro bundler.

## Solution Applied

### 1. **Separated Helper Functions**
- Created `src/store/helpers.ts` to contain all helper hooks
- Moved `useInitializeStores`, `useAuth`, `useCart`, etc. to the helpers file
- This breaks the circular dependency chain

### 2. **Clean Store Index**
- Updated `src/store/index.ts` to only export stores and re-export helpers
- No more internal imports that could cause circular dependencies
- Clean module resolution path

### 3. **File Structure Changes**
```
src/store/
├── index.ts          # Clean exports only
├── helpers.ts        # Helper hooks (NEW)
├── authStore.ts      # Individual stores
├── cartStore.ts
├── bookingStore.ts
├── locationStore.ts
├── notificationStore.ts
├── paymentStore.ts
├── serviceStore.ts
├── addressStore.ts
├── offerStore.ts
└── dataStore.ts
```

## Before (Problematic)
```typescript
// src/store/index.ts
export { useAuthStore } from './authStore';

import { useAuthStore } from './authStore'; // ❌ Circular dependency
export const useInitializeStores = () => {
  const initAuth = useAuthStore(state => state.initAuth);
  // ...
};
```

## After (Fixed)
```typescript
// src/store/index.ts
export { useAuthStore } from './authStore';
export { useInitializeStores, useAuth } from './helpers'; // ✅ Clean

// src/store/helpers.ts
import { useAuthStore } from './authStore'; // ✅ No circular dependency
export const useInitializeStores = () => {
  const initAuth = useAuthStore(state => state.initAuth);
  // ...
};
```

## Verification Steps

1. **Metro Bundle Reset**: Cleared Metro cache to ensure clean module resolution
2. **TypeScript Check**: Verified no compilation errors in store files
3. **Import Test**: Confirmed all exports are available

## Usage (No Changes Required)
The API remains the same for consumers:
```typescript
import { useAuth, useInitializeStores } from '../store';
// Works exactly the same as before
```

## Prevention
- Keep exports and imports separate in index files
- Use separate helper files for complex hook compositions
- Avoid importing what you export in the same file
- Use Metro cache reset when debugging module issues

## Status: ✅ RESOLVED
The circular dependency has been eliminated and all store exports should now work correctly.