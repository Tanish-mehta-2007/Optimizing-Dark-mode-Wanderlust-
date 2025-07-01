
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { TripProvider } from './contexts/TripContext';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider> {/* Wrap AuthProvider with LanguageProvider */}
        <AuthProvider> {/* Wrap TripProvider (and App) with AuthProvider */}
          <TripProvider>
            <App />
          </TripProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>
);