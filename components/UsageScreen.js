import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import BottomNavigation from './BottomNavigation';

export default function UsageScreen({ currentScreen, onNavigate }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [usageData, setUsageData] = useState({
    currentPeriod: {
      readingsUsed: 0,
      readingsLimit: 10,
      tokensUsed: 0,
      estimatedCost: 0
    },
    thisMonth: {
      totalReadings: 0,
      totalTokens: 0,
      totalCost: 0
    },
    lastMonth: {
      totalReadings: 0,
      totalTokens: 0,
      totalCost: 0
    }
  });
  const [selectedPeriod, setSelectedPeriod] = useState('current'); // current, month, last

  useEffect(() => {
    if (user) {
      loadUsageData();
    }
  }, [user]);

  const loadUsageData = async () => {
    setLoading(true);
    try {
      // Get current month usage
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      
      // Get last month usage
      const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
      const endOfLastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0);

      const [currentMonthUsage, lastMonthUsage] = await Promise.all([
        getUsageForPeriod(startOfMonth, currentMonth),
        getUsageForPeriod(lastMonth, endOfLastMonth)
      ]);

      // Calculate estimated costs (example: $0.002 per 1K tokens)
      const tokenCostPer1K = 0.002;
      
      setUsageData({
        currentPeriod: {
          readingsUsed: currentMonthUsage.readings,
          readingsLimit: getUserPlanLimit(),
          tokensUsed: currentMonthUsage.tokens,
          estimatedCost: (currentMonthUsage.tokens / 1000) * tokenCostPer1K
        },
        thisMonth: {
          totalReadings: currentMonthUsage.readings,
          totalTokens: currentMonthUsage.tokens,
          totalCost: (currentMonthUsage.tokens / 1000) * tokenCostPer1K
        },
        lastMonth: {
          totalReadings: lastMonthUsage.readings,
          totalTokens: lastMonthUsage.tokens,
          totalCost: (lastMonthUsage.tokens / 1000) * tokenCostPer1K
        }
      });
    } catch (error) {
      console.error('Error loading usage data:', error);
      Alert.alert('Error', 'Failed to load usage statistics');
    } finally {
      setLoading(false);
    }
  };

  const getUsageForPeriod = async (startDate, endDate) => {
    try {
      // Get reading sessions for the period
      const { data: sessions, error: sessionsError } = await supabase
        .from('reading_sessions')
        .select('id, created_at')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (sessionsError) throw sessionsError;

      // Get messages for these sessions to calculate tokens
      let totalTokens = 0;
      if (sessions?.length > 0) {
        const sessionIds = sessions.map(s => s.id);
        const { data: messages, error: messagesError } = await supabase
          .from('reading_messages')
          .select('content')
          .in('session_id', sessionIds);

        if (messagesError) throw messagesError;

        // Estimate tokens (rough calculation: ~4 characters per token)
        totalTokens = messages?.reduce((sum, msg) => {
          return sum + Math.ceil((msg.content?.length || 0) / 4);
        }, 0) || 0;
      }

      return {
        readings: sessions?.length || 0,
        tokens: totalTokens
      };
    } catch (error) {
      console.error('Error getting usage for period:', error);
      return { readings: 0, tokens: 0 };
    }
  };

  const getUserPlanLimit = () => {
    // TODO: Get actual user plan from database
    // For now, return Free plan limit
    return 10;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsageData();
    setRefreshing(false);
  };

  const getCurrentPeriodData = () => {
    switch (selectedPeriod) {
      case 'month':
        return usageData.thisMonth;
      case 'last':
        return usageData.lastMonth;
      default:
        return usageData.currentPeriod;
    }
  };

  const getPeriodTitle = () => {
    switch (selectedPeriod) {
      case 'month':
        return 'This Month';
      case 'last':
        return 'Last Month';
      default:
        return 'Current Period';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 3
    }).format(amount);
  };

  const formatNumber = (number) => {
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M';
    } else if (number >= 1000) {
      return (number / 1000).toFixed(1) + 'K';
    }
    return number.toString();
  };

  const getUsageColor = (used, limit) => {
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return '#ff6b6b';
    if (percentage >= 70) return '#ffa500';
    return '#4ecdc4';
  };

  const currentData = getCurrentPeriodData();

  return (
    <LinearGradient
      colors={['#031b7d', '#5cc5e6', '#0c847d']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Usage & Billing</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
            <Ionicons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Period Selector */}
          <View style={styles.periodSelector}>
            {[
              { key: 'current', label: 'Current' },
              { key: 'month', label: 'This Month' },
              { key: 'last', label: 'Last Month' }
            ].map((period) => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.key && styles.activePeriodButton
                ]}
                onPress={() => setSelectedPeriod(period.key)}
              >
                <Text style={[
                  styles.periodText,
                  selectedPeriod === period.key && styles.activePeriodText
                ]}>
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Usage Overview */}
          <View style={styles.overviewCard}>
            <Text style={styles.cardTitle}>{getPeriodTitle()} Overview</Text>
            
            {selectedPeriod === 'current' && (
              <View style={styles.usageProgress}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Readings Used</Text>
                  <Text style={styles.progressValue}>
                    {currentData.readingsUsed || 0} / {currentData.readingsLimit || 10}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(((currentData.readingsUsed || 0) / (currentData.readingsLimit || 10)) * 100, 100)}%`,
                        backgroundColor: getUsageColor(currentData.readingsUsed || 0, currentData.readingsLimit || 10)
                      }
                    ]} 
                  />
                </View>
                {(currentData.readingsUsed || 0) >= (currentData.readingsLimit || 10) && (
                  <Text style={styles.warningText}>
                    You've reached your reading limit. Upgrade for more readings!
                  </Text>
                )}
              </View>
            )}

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Ionicons name="book-outline" size={24} color="#4ecdc4" />
                <Text style={styles.statNumber}>
                  {selectedPeriod === 'current' ? currentData.readingsUsed || 0 : currentData.totalReadings || 0}
                </Text>
                <Text style={styles.statLabel}>Readings</Text>
              </View>
              
              <View style={styles.statBox}>
                <Ionicons name="flash-outline" size={24} color="#667eea" />
                <Text style={styles.statNumber}>
                  {formatNumber(selectedPeriod === 'current' ? currentData.tokensUsed || 0 : currentData.totalTokens || 0)}
                </Text>
                <Text style={styles.statLabel}>Tokens</Text>
              </View>
              
              <View style={styles.statBox}>
                <Ionicons name="card-outline" size={24} color="#ffa500" />
                <Text style={styles.statNumber}>
                  {formatCurrency(selectedPeriod === 'current' ? currentData.estimatedCost || 0 : currentData.totalCost || 0)}
                </Text>
                <Text style={styles.statLabel}>Cost</Text>
              </View>
            </View>
          </View>

          {/* Usage Breakdown */}
          <View style={styles.breakdownCard}>
            <Text style={styles.cardTitle}>Usage Breakdown</Text>
            
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLabel}>
                <Ionicons name="chatbubble-outline" size={20} color="#4ecdc4" />
                <Text style={styles.breakdownText}>Chat Messages</Text>
              </View>
              <Text style={styles.breakdownValue}>
                {formatNumber(Math.floor((selectedPeriod === 'current' ? currentData.tokensUsed || 0 : currentData.totalTokens || 0) * 0.6))} tokens
              </Text>
            </View>

            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLabel}>
                <Ionicons name="sparkles-outline" size={20} color="#667eea" />
                <Text style={styles.breakdownText}>Card Interpretations</Text>
              </View>
              <Text style={styles.breakdownValue}>
                {formatNumber(Math.floor((selectedPeriod === 'current' ? currentData.tokensUsed || 0 : currentData.totalTokens || 0) * 0.4))} tokens
              </Text>
            </View>

            <View style={styles.breakdownDivider} />

            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLabel}>
                <Text style={styles.breakdownText}>Rate per 1K tokens</Text>
              </View>
              <Text style={styles.breakdownValue}>$0.002</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsCard}>
            <Text style={styles.cardTitle}>Quick Actions</Text>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onNavigate('plans')}
            >
              <Ionicons name="arrow-up-outline" size={20} color="#667eea" />
              <Text style={styles.actionText}>Upgrade Plan</Text>
              <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.6)" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert('Export Usage', 'Export functionality will be available soon.')}
            >
              <Ionicons name="download-outline" size={20} color="#4ecdc4" />
              <Text style={styles.actionText}>Export Usage Data</Text>
              <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.6)" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert('Usage Alerts', 'Configure usage alert preferences.')}
            >
              <Ionicons name="notifications-outline" size={20} color="#ffa500" />
              <Text style={styles.actionText}>Usage Alerts</Text>
              <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.6)" />
            </TouchableOpacity>
          </View>

          {/* Chart Placeholder */}
          <View style={styles.chartCard}>
            <Text style={styles.cardTitle}>Usage Trends</Text>
            <View style={styles.chartPlaceholder}>
              <Ionicons name="bar-chart-outline" size={48} color="rgba(255, 255, 255, 0.4)" />
              <Text style={styles.chartText}>
                Usage chart visualization will be available in the next update
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
  refreshButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activePeriodButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  periodText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  activePeriodText: {
    color: '#fff',
    fontWeight: '600',
  },
  overviewCard: {
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
  usageProgress: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  progressValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  warningText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 8,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
    marginBottom: 4,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  breakdownCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  breakdownLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginLeft: 10,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  breakdownValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 8,
  },
  actionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 15,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  chartCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  chartPlaceholder: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  chartText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 15,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
});