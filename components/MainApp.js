import React, { useState } from 'react';
import LandingPage from './LandingPage';
import ReadingScreen from './ReadingScreen';
import HistoryScreen from './HistoryScreen';
import UsageScreen from './UsageScreen';
import PlansScreen from './PlansScreen';
import ProfileScreen from './ProfileScreen';

export default function MainApp() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [initialQuestion, setInitialQuestion] = useState('');

  const handleNavigateToReading = (question) => {
    setInitialQuestion(question);
    setCurrentScreen('reading');
  };

  const handleBackToLanding = () => {
    setCurrentScreen('home');
    setInitialQuestion('');
  };
  
  const handleNavigation = (screen) => {
    setCurrentScreen(screen);
    if (screen === 'home') {
      setInitialQuestion('');
    }
  };

  // Route to different screens based on currentScreen state
  switch (currentScreen) {
    case 'reading':
      return (
        <ReadingScreen
          initialQuestion={initialQuestion}
          onBack={handleBackToLanding}
          currentScreen={currentScreen}
          onNavigate={handleNavigation}
        />
      );
    
    case 'history':
      return (
        <HistoryScreen
          currentScreen={currentScreen}
          onNavigate={handleNavigation}
        />
      );
    
    case 'usage':
      return (
        <UsageScreen
          currentScreen={currentScreen}
          onNavigate={handleNavigation}
        />
      );
    
    case 'plans':
      return (
        <PlansScreen
          currentScreen={currentScreen}
          onNavigate={handleNavigation}
        />
      );
    
    case 'profile':
      return (
        <ProfileScreen
          currentScreen={currentScreen}
          onNavigate={handleNavigation}
        />
      );
    
    default:
      return (
        <LandingPage
          onNavigateToReading={handleNavigateToReading}
          currentScreen={currentScreen}
          onNavigate={handleNavigation}
        />
      );
  }
}