// Debug script to check authentication issue
console.log('=== DEBUGGING AUTH ISSUE ===');

// Check localStorage
const token = localStorage.getItem('auth_token');
const authStorage = localStorage.getItem('auth-storage');

console.log('Token in localStorage:', token ? 'Present' : 'Missing');
console.log('Auth storage:', authStorage);

if (authStorage) {
  try {
    const parsed = JSON.parse(authStorage);
    console.log('Parsed auth storage:', parsed);
    console.log('User role:', parsed.state?.user?.role);
    console.log('Is authenticated:', parsed.state?.isAuthenticated);
  } catch (e) {
    console.log('Error parsing auth storage:', e);
  }
}

// Check if there are any network errors
console.log('Current URL:', window.location.href);
console.log('User agent:', navigator.userAgent);

// Test API call
fetch('/api/admin/designations', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('API Response status:', response.status);
  console.log('API Response headers:', [...response.headers.entries()]);
  return response.text();
})
.then(text => {
  console.log('API Response body:', text);
})
.catch(error => {
  console.log('API Error:', error);
});