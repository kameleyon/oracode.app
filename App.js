import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './contexts/AuthContext';
import AuthWrapper from './components/AuthWrapper';

SplashScreen.preventAutoHideAsync();

const App = () => {
  useEffect(() => {
    const hideSplash = async () => {
      // Add Google Fonts link for web
      if (Platform.OS === 'web') {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        
        // Add CSS custom properties for consistent font usage
        const style = document.createElement('style');
        style.textContent = `
          * {
            font-family: 'Montserrat', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Arial', sans-serif !important;
          }
        `;
        document.head.appendChild(style);
      }
      
      await SplashScreen.hideAsync();
    };

    hideSplash();
  }, []);

  return (
    <AuthProvider>
      <AuthWrapper />
    </AuthProvider>
  );
};

export default App;