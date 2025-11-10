import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BottomNavigation({ currentScreen, onNavigate }) {
  const navItems = [
    {
      id: 'home',
      icon: 'home',
      activeIcon: 'home',
      label: 'Home',
    },
    {
      id: 'reading',
      icon: 'sparkles-outline',
      activeIcon: 'sparkles',
      label: 'Reading',
    },
    {
      id: 'history',
      icon: 'time-outline',
      activeIcon: 'time',
      label: 'History',
    },
    {
      id: 'usage',
      icon: 'bar-chart-outline',
      activeIcon: 'bar-chart',
      label: 'Usage',
    },
    {
      id: 'profile',
      icon: 'person-outline',
      activeIcon: 'person',
      label: 'Profile',
    },
  ];

  const handleNavPress = (screenId) => {
    if (onNavigate) {
      onNavigate(screenId);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.navItem,
                isActive && styles.activeNavItem
              ]}
              onPress={() => handleNavPress(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.navItemContent}>
                <Ionicons
                  name={isActive ? item.activeIcon : item.icon}
                  size={24}
                  color={isActive ? '#667eea' : 'rgba(255, 255, 255, 0.6)'}
                />
                <Text style={[
                  styles.navLabel,
                  isActive && styles.activeNavLabel
                ]}>
                  {item.label}
                </Text>
              </View>
              
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 10,
    paddingBottom: Platform.OS === 'ios' ? 25 : 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(102, 126, 234, 0.1)',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    position: 'relative',
  },
  activeNavItem: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  navItemContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.6)',
    marginTop: 4,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
    fontWeight: '500',
  },
  activeNavLabel: {
    color: '#667eea',
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -10,
    width: 30,
    height: 3,
    backgroundColor: '#667eea',
    borderRadius: 2,
  },
});