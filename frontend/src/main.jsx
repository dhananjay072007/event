import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
import { UserAuthProvider } from './context/UserAuthContext.jsx';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <SettingsProvider>
          <AuthProvider>
            <UserAuthProvider>
              <App />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: { background: '#1a1a2e', color: '#fff', border: '1px solid #6366f1' },
                  success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
                }}
              />
            </UserAuthProvider>
          </AuthProvider>
        </SettingsProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
