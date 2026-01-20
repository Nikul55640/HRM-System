# Circular Dependency Fix

## 🔴 **Problem Identified**

The error `ReferenceError: Cannot access 'api' before initialization` was caused by a circular dependency:

```
useAuthStore.js → imports api from '../services/api'
     ↓
api.js → imports useAuthStore from '../stores/useAuthStore'  
     ↓
useAuthStore.js (circular!)
```

This created an initialization deadlock where neither module could fully initialize.

## 🔧 **Solution Applied**

### **Before (Circular Dependency)**
```javascript
// api.js
import useAuthStore from "../stores/useAuthStore"; // ❌ Circular import

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token; // ❌ Direct access
  // ...
});
```

### **After (Dependency Injection)**
```javascript
// api.js
let getAuthToken = () => null;
let getAuthStore = () => null;

export const setAuthTokenGetter = (tokenGetter, storeGetter) => {
  getAuthToken = tokenGetter;
  getAuthStore = storeGetter;
};

api.interceptors.request.use((config) => {
  const token = getAuthToken(); // ✅ Injected function
  // ...
});
```

```javascript
// useAuthStore.js
import api, { setAuthTokenGetter } from '../services/api';

// Set up dependency injection
setAuthTokenGetter(
  () => useAuthStore.getState().token,
  () => useAuthStore.getState()
);
```

## 🎯 **How This Fixes the Issue**

1. **api.js** no longer directly imports `useAuthStore`
2. **useAuthStore.js** provides token access via dependency injection
3. No circular dependency = no initialization deadlock
4. Both modules can initialize properly

## ✅ **Expected Result**

- ✅ Frontend loads without initialization errors
- ✅ Authentication works correctly  
- ✅ API requests include proper tokens
- ✅ Employee dashboard loads successfully
- ✅ 403 permission handling works as designed

The circular dependency was the root cause of the initialization error. With this fix, the frontend should load properly and the 403 permission handling improvements we made earlier will work correctly.