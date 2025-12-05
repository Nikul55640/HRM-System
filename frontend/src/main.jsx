import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import store from './store';
import { initializeAuth } from './features/auth/thunks';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';

// Initialize auth from localStorage
console.log('🚀 [APP] Application starting, initializing auth...');
store.dispatch(initializeAuth());
console.log('🚀 [APP] Auth initialized, rendering app...');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
