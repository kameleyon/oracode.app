import React, { useState } from 'react';
import LandingPage from './LandingPage';
import ReadingScreen from './ReadingScreen';

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

  if (currentScreen === 'reading') {
    return (
      <ReadingScreen
        initialQuestion={initialQuestion}
        onBack={handleBackToLanding}
        currentScreen={currentScreen}
        onNavigate={handleNavigation}
      />
    );
  }

  return (
    <LandingPage
      onNavigateToReading={handleNavigateToReading}
      currentScreen={currentScreen}
      onNavigate={handleNavigation}
    />
  );
}