import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import BottomNavigation from './BottomNavigation';

export default function PlansScreen({ currentScreen, onNavigate }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [selectedPlan, setSelectedPlan] = useState('free');

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      readingsLimit: 10,
      features: [
        '10 readings per month',
        'Basic card interpretations',
        'Standard support',
        'Basic reading history'
      ],
      color: '#4ecdc4',
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$9.99',
      period: 'month',
      readingsLimit: 100,
      features: [
        '100 readings per month',
        'Advanced card interpretations',
        'Priority support',
        'Detailed reading history',
        'Advanced spread layouts',
        'Export readings',
        'Custom reading notes'
      ],
      color: '#667eea',
      popular: true
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$19.99',
      period: 'month',
      readingsLimit: 'unlimited',
      features: [
        'Unlimited readings',
        'AI-powered personalization',
        'Premium support',
        'Complete reading analytics',
        'All spread layouts',
        'Advanced export options',
        'Reading scheduling',
        'Custom AI training',
        'API access'
      ],
      color: '#ffa500',
      popular: false
    }
  ];

  useEffect(() => {
    if (user) {
      loadUserPlan();
    }
  }, [user]);

  const loadUserPlan = async () => {
    try {
      // TODO: Get user plan from database
      // For now, set default to free
      setCurrentPlan('free');
      setSelectedPlan('free');
    } catch (error) {
      console.error('Error loading user plan:', error);
    }
  };

  const handleUpgrade = async (planId) => {
    if (planId === 'free') {
      Alert.alert('Current Plan', 'You are already on the Free plan.');
      return;
    }

    setLoading(true);
    try {
      // TODO: Integrate with Stripe for payment processing
      // For now, show placeholder
      Alert.alert(
        'Upgrade Plan',
        `Upgrade to ${plans.find(p => p.id === planId)?.name} plan?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Proceed',
            onPress: () => handleStripeCheckout(planId)
          }
        ]
      );
    } catch (error) {
      console.error('Error upgrading plan:', error);
      Alert.alert('Error', 'Failed to process upgrade. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStripeCheckout = async (planId) => {
    try {
      // TODO: Implement Stripe checkout
      const plan = plans.find(p => p.id === planId);
      
      // Placeholder for Stripe integration
      const stripeUrl = `${process.env.EXPO_PUBLIC_STRIPE_CHECKOUT_URL}?plan=${planId}&userId=${user.id}`;
      
      if (Platform.OS === 'web') {
        window.open(stripeUrl, '_blank');
      } else {
        await Linking.openURL(stripeUrl);
      }
      
      Alert.alert(
        'Payment Processing',
        'You will be redirected to our secure payment processor. Your plan will be updated once payment is complete.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error opening Stripe checkout:', error);
      Alert.alert('Error', 'Unable to open payment processor. Please try again.');
    }
  };

  const handleTopUp = () => {
    Alert.alert(
      'Top Up Readings',
      'Purchase additional readings for your current plan.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy 10 readings ($4.99)',
          onPress: () => handleStripeCheckout('topup_10')
        },
        {
          text: 'Buy 25 readings ($9.99)',
          onPress: () => handleStripeCheckout('topup_25')
        }
      ]
    );
  };

  const handleManageSubscription = () => {
    Alert.alert(
      'Manage Subscription',
      'You will be redirected to manage your subscription settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            const customerPortalUrl = `${process.env.EXPO_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL}?userId=${user.id}`;
            if (Platform.OS === 'web') {
              window.open(customerPortalUrl, '_blank');
            } else {
              Linking.openURL(customerPortalUrl);
            }
          }
        }
      ]
    );
  };

  const renderPlan = (plan) => {
    const isCurrentPlan = currentPlan === plan.id;
    const isSelected = selectedPlan === plan.id;

    return (
      <TouchableOpacity
        key={plan.id}
        style={[
          styles.planCard,
          isSelected && styles.selectedPlanCard,
          plan.popular && styles.popularPlanCard
        ]}
        onPress={() => setSelectedPlan(plan.id)}
        activeOpacity={0.9}
      >
        {plan.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>Most Popular</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <Text style={styles.planName}>{plan.name}</Text>
          {isCurrentPlan && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>Current</Text>
            </View>
          )}
        </View>

        <View style={styles.priceSection}>
          <Text style={styles.planPrice}>{plan.price}</Text>
          <Text style={styles.planPeriod}>/{plan.period}</Text>
        </View>

        <View style={styles.readingsInfo}>
          <Ionicons name="book-outline" size={20} color={plan.color} />
          <Text style={styles.readingsText}>
            {typeof plan.readingsLimit === 'number' 
              ? `${plan.readingsLimit} readings/month`
              : `${plan.readingsLimit} readings`
            }
          </Text>
        </View>

        <View style={styles.featuresSection}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Ionicons name="checkmark" size={16} color={plan.color} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.planButton,
            isCurrentPlan ? styles.currentPlanButton : styles.upgradePlanButton,
            { backgroundColor: isCurrentPlan ? 'rgba(255, 255, 255, 0.2)' : plan.color }
          ]}
          onPress={() => isCurrentPlan ? null : handleUpgrade(plan.id)}
          disabled={isCurrentPlan || loading}
        >
          {loading && selectedPlan === plan.id ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[
              styles.planButtonText,
              isCurrentPlan && styles.currentPlanButtonText
            ]}>
              {isCurrentPlan ? 'Current Plan' : `Upgrade to ${plan.name}`}
            </Text>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={['#031b7d', '#5cc5e6', '#0c847d']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Subscription Plans</Text>
          <TouchableOpacity 
            style={styles.manageButton}
            onPress={handleManageSubscription}
          >
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Current Plan Summary */}
          <View style={styles.currentPlanSummary}>
            <Text style={styles.summaryTitle}>Your Current Plan</Text>
            <View style={styles.summaryContent}>
              <View style={styles.summaryInfo}>
                <Text style={styles.summaryPlanName}>
                  {plans.find(p => p.id === currentPlan)?.name || 'Free'}
                </Text>
                <Text style={styles.summaryPrice}>
                  {plans.find(p => p.id === currentPlan)?.price || '$0'}/
                  {plans.find(p => p.id === currentPlan)?.period || 'forever'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.topUpButton}
                onPress={handleTopUp}
              >
                <Text style={styles.topUpButtonText}>Top Up</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Plans Grid */}
          <View style={styles.plansContainer}>
            <Text style={styles.plansTitle}>Choose Your Plan</Text>
            <View style={styles.plansGrid}>
              {plans.map(renderPlan)}
            </View>
          </View>

          {/* Features Comparison */}
          <View style={styles.comparisonCard}>
            <Text style={styles.cardTitle}>Features Comparison</Text>
            
            <View style={styles.comparisonTable}>
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonFeature}>Monthly Readings</Text>
                <Text style={styles.comparisonFree}>10</Text>
                <Text style={styles.comparisonPremium}>100</Text>
                <Text style={styles.comparisonPro}>∞</Text>
              </View>
              
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonFeature}>AI Personalization</Text>
                <Ionicons name="close" size={16} color="#ff6b6b" />
                <Ionicons name="close" size={16} color="#ff6b6b" />
                <Ionicons name="checkmark" size={16} color="#4ecdc4" />
              </View>
              
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonFeature}>Priority Support</Text>
                <Ionicons name="close" size={16} color="#ff6b6b" />
                <Ionicons name="checkmark" size={16} color="#4ecdc4" />
                <Ionicons name="checkmark" size={16} color="#4ecdc4" />
              </View>
              
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonFeature}>Advanced Spreads</Text>
                <Ionicons name="close" size={16} color="#ff6b6b" />
                <Ionicons name="checkmark" size={16} color="#4ecdc4" />
                <Ionicons name="checkmark" size={16} color="#4ecdc4" />
              </View>
              
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonFeature}>API Access</Text>
                <Ionicons name="close" size={16} color="#ff6b6b" />
                <Ionicons name="close" size={16} color="#ff6b6b" />
                <Ionicons name="checkmark" size={16} color="#4ecdc4" />
              </View>
            </View>
          </View>

          {/* FAQ */}
          <View style={styles.faqCard}>
            <Text style={styles.cardTitle}>Frequently Asked Questions</Text>
            
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Can I cancel anytime?</Text>
              <Text style={styles.faqAnswer}>
                Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </Text>
            </View>
            
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>What happens to unused readings?</Text>
              <Text style={styles.faqAnswer}>
                Unused readings don't roll over to the next month. We recommend using them before your billing cycle resets.
              </Text>
            </View>
            
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Can I upgrade/downgrade plans?</Text>
              <Text style={styles.faqAnswer}>
                Yes, you can change your plan at any time. Changes will be prorated and reflected in your next bill.
              </Text>
            </View>
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
  manageButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  currentPlanSummary: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryInfo: {
    flex: 1,
  },
  summaryPlanName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  summaryPrice: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  topUpButton: {
    backgroundColor: '#4ecdc4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  topUpButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  plansContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  plansTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  plansGrid: {
    gap: 15,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    position: 'relative',
  },
  selectedPlanCard: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  popularPlanCard: {
    borderWidth: 2,
    borderColor: '#667eea',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: 20,
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  currentBadge: {
    backgroundColor: '#4ecdc4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currentBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 15,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  planPeriod: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 4,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  readingsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  readingsText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 8,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  featuresSection: {
    marginBottom: 25,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 10,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  planButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  currentPlanButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  upgradePlanButton: {
    backgroundColor: '#667eea',
  },
  planButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  currentPlanButtonText: {
    opacity: 0.7,
  },
  comparisonCard: {
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
  comparisonTable: {
    gap: 15,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  comparisonFeature: {
    flex: 2,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  comparisonFree: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#fff',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  comparisonPremium: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#fff',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  comparisonPro: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#fff',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  faqCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  faqItem: {
    marginBottom: 15,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 5,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  faqAnswer: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
});