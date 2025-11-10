import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Switch
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import BottomNavigation from './BottomNavigation';

export default function ProfileScreen({ currentScreen, onNavigate }) {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    avatar_url: '',
    bio: '',
    preferences: {
      notifications: true,
      email_updates: true,
      data_analytics: false
    }
  });
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      // Load user profile from Supabase profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(prevProfile => ({
          ...prevProfile,
          full_name: data.full_name || '',
          avatar_url: data.avatar_url || '',
          bio: data.bio || '',
          preferences: data.preferences || prevProfile.preferences
        }));
      }

      // Set email from auth user
      setProfile(prev => ({
        ...prev,
        email: user.email || ''
      }));
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile information');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          bio: profile.bio,
          preferences: profile.preferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (passwords.new !== passwords.confirm) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (passwords.new.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });

      if (error) throw error;

      setPasswords({ current: '', new: '', confirm: '' });
      Alert.alert('Success', 'Password updated successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const result = await signOut();
            if (!result.success) {
              Alert.alert('Error', 'Failed to sign out');
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone and will remove all your data including reading history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Type "DELETE" to confirm account deletion:',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Proceed',
                  onPress: () => {
                    // TODO: Implement account deletion
                    Alert.alert('Info', 'Account deletion will be available in a future update. Please contact support if you need to delete your account.');
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const updatePreference = (key, value) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  return (
    <LinearGradient
      colors={['#031b7d', '#5cc5e6', '#0c847d']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={editing ? saveProfile : () => setEditing(true)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons 
                name={editing ? 'checkmark' : 'pencil'} 
                size={24} 
                color="#fff" 
              />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Information */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={40} color="#667eea" />
              </View>
              {editing && (
                <TouchableOpacity style={styles.avatarEdit}>
                  <Ionicons name="camera" size={20} color="#fff" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.profileInfo}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={[styles.input, !editing && styles.disabledInput]}
                  value={profile.full_name}
                  onChangeText={(text) => setProfile(prev => ({ ...prev, full_name: text }))}
                  placeholder="Enter your full name"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  editable={editing}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={profile.email}
                  placeholder="Email address"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  editable={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.textArea, !editing && styles.disabledInput]}
                  value={profile.bio}
                  onChangeText={(text) => setProfile(prev => ({ ...prev, bio: text }))}
                  placeholder="Tell us about yourself..."
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  editable={editing}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          </View>

          {/* Account Settings */}
          <View style={styles.settingsCard}>
            <Text style={styles.cardTitle}>Account Settings</Text>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Ionicons name="key-outline" size={24} color="#667eea" />
                <Text style={styles.settingText}>Change Password</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.6)" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => onNavigate('usage')}
            >
              <View style={styles.settingContent}>
                <Ionicons name="bar-chart-outline" size={24} color="#4ecdc4" />
                <Text style={styles.settingText}>Usage & Billing</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.6)" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => onNavigate('plans')}
            >
              <View style={styles.settingContent}>
                <Ionicons name="diamond-outline" size={24} color="#ffa500" />
                <Text style={styles.settingText}>Subscription Plans</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.6)" />
            </TouchableOpacity>
          </View>

          {/* Preferences */}
          <View style={styles.settingsCard}>
            <Text style={styles.cardTitle}>Preferences</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Ionicons name="notifications-outline" size={24} color="#667eea" />
                <Text style={styles.settingText}>Push Notifications</Text>
              </View>
              <Switch
                value={profile.preferences.notifications}
                onValueChange={(value) => updatePreference('notifications', value)}
                trackColor={{ false: 'rgba(255, 255, 255, 0.3)', true: '#667eea' }}
                thumbColor={profile.preferences.notifications ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Ionicons name="mail-outline" size={24} color="#4ecdc4" />
                <Text style={styles.settingText}>Email Updates</Text>
              </View>
              <Switch
                value={profile.preferences.email_updates}
                onValueChange={(value) => updatePreference('email_updates', value)}
                trackColor={{ false: 'rgba(255, 255, 255, 0.3)', true: '#4ecdc4' }}
                thumbColor={profile.preferences.email_updates ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Ionicons name="analytics-outline" size={24} color="#ffa500" />
                <Text style={styles.settingText}>Data Analytics</Text>
              </View>
              <Switch
                value={profile.preferences.data_analytics}
                onValueChange={(value) => updatePreference('data_analytics', value)}
                trackColor={{ false: 'rgba(255, 255, 255, 0.3)', true: '#ffa500' }}
                thumbColor={profile.preferences.data_analytics ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Change Password Card */}
          <View style={styles.settingsCard}>
            <Text style={styles.cardTitle}>Change Password</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <TextInput
                style={styles.input}
                value={passwords.current}
                onChangeText={(text) => setPasswords(prev => ({ ...prev, current: text }))}
                placeholder="Enter current password"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput
                style={styles.input}
                value={passwords.new}
                onChangeText={(text) => setPasswords(prev => ({ ...prev, new: text }))}
                placeholder="Enter new password"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                value={passwords.confirm}
                onChangeText={(text) => setPasswords(prev => ({ ...prev, confirm: text }))}
                placeholder="Confirm new password"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={styles.passwordButton}
              onPress={changePassword}
              disabled={loading}
            >
              <Text style={styles.passwordButtonText}>Change Password</Text>
            </TouchableOpacity>
          </View>

          {/* Danger Zone */}
          <View style={styles.dangerCard}>
            <Text style={styles.cardTitle}>Danger Zone</Text>

            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleSignOut}
              disabled={loading}
            >
              <Ionicons name="log-out-outline" size={20} color="#ff6b6b" />
              <Text style={styles.dangerButtonText}>Sign Out</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dangerButton, styles.deleteButton]}
              onPress={handleDeleteAccount}
              disabled={loading}
            >
              <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
              <Text style={styles.dangerButtonText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <BottomNavigation 
          currentScreen={currentScreen}
          onNavigate={onNavigate}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  editButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEdit: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: '#667eea',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    gap: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  disabledInput: {
    opacity: 0.7,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  settingsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 15,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  passwordButton: {
    backgroundColor: '#667eea',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  passwordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  dangerCard: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
  },
  dangerButtonText: {
    fontSize: 16,
    color: '#ff6b6b',
    marginLeft: 10,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
});