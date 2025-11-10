import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import HistoryService from '../services/HistoryService';
import BottomNavigation from './BottomNavigation';

export default function HistoryScreen({ currentScreen, onNavigate }) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState('all'); // all, recent, favorites
  const [statistics, setStatistics] = useState({
    totalSessions: 0,
    totalMessages: 0,
    averagePerSession: 0
  });

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [sessions, searchQuery, filterType]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const { sessions: userSessions, error } = await HistoryService.getUserSessions(user.id);
      
      if (error) {
        console.error('Error loading sessions:', error);
        Alert.alert('Error', 'Failed to load reading history');
        return;
      }

      setSessions(userSessions || []);
      calculateStatistics(userSessions || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
      Alert.alert('Error', 'Failed to load reading history');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };

  const calculateStatistics = async (sessionList) => {
    let totalMessages = 0;
    
    // Calculate total messages across all sessions
    for (const session of sessionList) {
      const { messages } = await HistoryService.getSessionMessages(session.id);
      totalMessages += messages?.length || 0;
    }

    const averagePerSession = sessionList.length > 0 ? 
      (totalMessages / sessionList.length).toFixed(1) : 0;

    setStatistics({
      totalSessions: sessionList.length,
      totalMessages,
      averagePerSession: parseFloat(averagePerSession)
    });
  };

  const applyFilters = () => {
    let filtered = [...sessions];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(session =>
        session.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.id?.toString().includes(searchQuery)
      );
    }

    // Apply type filter
    switch (filterType) {
      case 'recent':
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filtered = filtered.filter(session =>
          new Date(session.created_at) > oneWeekAgo
        );
        break;
      case 'favorites':
        filtered = filtered.filter(session => session.is_favorite);
        break;
      default:
        break;
    }

    setFilteredSessions(filtered);
  };

  const deleteSession = async (sessionId) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this reading session? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await HistoryService.deleteSession(sessionId);
            if (error) {
              Alert.alert('Error', 'Failed to delete session');
            } else {
              loadSessions(); // Refresh the list
            }
          }
        }
      ]
    );
  };

  const viewSessionDetails = (session) => {
    // TODO: Navigate to session detail view
    Alert.alert('Session Details', `Session: ${session.title}\nCreated: ${new Date(session.created_at).toLocaleDateString()}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const renderSession = ({ item }) => (
    <View style={styles.sessionCard}>
      <TouchableOpacity
        style={styles.sessionContent}
        onPress={() => viewSessionDetails(item)}
        activeOpacity={0.8}
      >
        <View style={styles.sessionHeader}>
          <Text style={styles.sessionTitle} numberOfLines={2}>
            {item.title || 'Untitled Session'}
          </Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteSession(item.id)}
          >
            <Ionicons name="trash-outline" size={18} color="#ff6b6b" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sessionDate}>
          {formatDate(item.created_at)}
        </Text>
        
        <View style={styles.sessionMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color="#667eea" />
            <Text style={styles.metaText}>
              {new Date(item.created_at).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="time-outline" size={64} color="rgba(255, 255, 255, 0.4)" />
      <Text style={styles.emptyTitle}>No Reading History</Text>
      <Text style={styles.emptySubtitle}>
        Your tarot reading sessions will appear here
      </Text>
      <TouchableOpacity
        style={styles.startReadingButton}
        onPress={() => onNavigate('reading')}
      >
        <Text style={styles.startReadingText}>Start Your First Reading</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={['#031b7d', '#5cc5e6', '#0c847d']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Reading History</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
            <Ionicons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{statistics.totalSessions}</Text>
            <Text style={styles.statLabel}>Total Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{statistics.totalMessages}</Text>
            <Text style={styles.statLabel}>Total Messages</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{statistics.averagePerSession}</Text>
            <Text style={styles.statLabel}>Avg per Session</Text>
          </View>
        </View>

        {/* Search and Filters */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="rgba(255, 255, 255, 0.6)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search sessions..."
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.filterContainer}>
          {['all', 'recent', 'favorites'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                filterType === filter && styles.activeFilterButton
              ]}
              onPress={() => setFilterType(filter)}
            >
              <Text style={[
                styles.filterText,
                filterType === filter && styles.activeFilterText
              ]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sessions List */}
        <View style={styles.listContainer}>
          {filteredSessions.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={filteredSessions}
              renderItem={renderSession}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>

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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 15,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    textAlign: 'center',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#fff',
    fontSize: 16,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginRight: 10,
  },
  activeFilterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 100,
  },
  sessionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  sessionContent: {
    padding: 15,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    marginRight: 10,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  deleteButton: {
    padding: 4,
  },
  sessionDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  metaText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 4,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  emptySubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  startReadingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  startReadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
});