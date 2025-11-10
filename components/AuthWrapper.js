import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from './auth/LoginScreen';
import SignupScreen from './auth/SignupScreen';
import ForgotPasswordScreen from './auth/ForgotPasswordScreen';
import MainApp from './MainApp';

export default function AuthWrapper() {
  const { user, loading } = useAuth();
  const [authScreen, setAuthScreen] = useState('login'); // 'login', 'signup', 'forgot'

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  if (user) {
    return <MainApp />;
  }

  switch (authScreen) {
    case 'signup':
      return (
        <SignupScreen 
          onNavigateToLogin={() => setAuthScreen('login')}
        />
      );
    case 'forgot':
      return (
        <ForgotPasswordScreen 
          onBack={() => setAuthScreen('login')}
        />
      );
    case 'login':
    default:
      return (
        <LoginScreen 
          onNavigateToSignup={() => setAuthScreen('signup')}
          onForgotPassword={() => setAuthScreen('forgot')}
        />
      );
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#031b7d',
  },
});