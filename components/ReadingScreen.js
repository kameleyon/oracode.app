import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Platform, 
  Alert, 
  KeyboardAvoidingView,
  Text,
  TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ChatInterface from './ChatInterface';
import BottomNavigation from './BottomNavigation';
import AgentService from '../services/AgentService';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function ReadingScreen({ 
  initialQuestion, 
  onBack, 
  currentScreen, 
  onNavigate 
}) {
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();
  const mounted = useRef(true);

  // Initialize chat session
  useEffect(() => {
    if (initialQuestion && messages.length === 0) {
      startNewReading(initialQuestion);
    }
    
    return () => {
      mounted.current = false;
    };
  }, [initialQuestion]);

  // Save chat session to Supabase
  const saveChatSession = async (chatMessages, readingData = null) => {
    if (!user || !chatMessages.length) return;

    try {
      const chatSession = {
        user_id: user.id,
        messages: chatMessages,
        reading_data: readingData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (currentChatId) {
        // Update existing session
        const { error } = await supabase
          .from('chat_sessions')
          .update({ 
            messages: chatMessages, 
            reading_data: readingData,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentChatId);
        
        if (error) console.error('Error updating chat session:', error);
      } else {
        // Create new session
        const { data, error } = await supabase
          .from('chat_sessions')
          .insert(chatSession)
          .select('id')
          .single();
        
        if (error) {
          console.error('Error saving chat session:', error);
        } else if (data) {
          setCurrentChatId(data.id);
        }
      }
    } catch (error) {
      console.error('Error in saveChatSession:', error);
    }
  };

  // Start a new reading
  const startNewReading = async (question) => {
    const userMessage = {
      id: Date.now().toString(),
      text: question,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    const newMessages = [userMessage];
    setMessages(newMessages);
    setIsGenerating(true);
    setIsTyping(true);

    try {
      // Generate reading from AgentService
      const readingResult = await AgentService.generateReading(question);
      
      if (!mounted.current) return;

      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (!mounted.current) return;

      const oracleMessage = {
        id: (Date.now() + 1).toString(),
        text: readingResult.reading,
        isUser: false,
        timestamp: new Date().toISOString(),
        cards: readingResult.cards,
        readingData: readingResult
      };

      const updatedMessages = [...newMessages, oracleMessage];
      setMessages(updatedMessages);
      
      // Save to database
      await saveChatSession(updatedMessages, readingResult);
      
    } catch (error) {
      console.error('Error generating reading:', error);
      
      if (!mounted.current) return;
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'I sense a disturbance in the cosmic connection. Please try again, dear seeker.',
        isUser: false,
        timestamp: new Date().toISOString(),
        isError: true
      };

      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);
    } finally {
      if (mounted.current) {
        setIsGenerating(false);
        setIsTyping(false);
      }
    }
  };

  // Send a new message
  const sendMessage = async (text) => {
    if (!text.trim() || isGenerating) return;

    const userMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsGenerating(true);
    setIsTyping(true);

    try {
      // Generate quick reading for follow-up questions
      const readingResult = await AgentService.generateQuickReading(text.trim());
      
      if (!mounted.current) return;

      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      if (!mounted.current) return;

      const oracleMessage = {
        id: (Date.now() + 1).toString(),
        text: readingResult.reading,
        isUser: false,
        timestamp: new Date().toISOString(),
        card: readingResult.card,
        readingData: readingResult
      };

      const updatedMessages = [...newMessages, oracleMessage];
      setMessages(updatedMessages);
      
      // Save to database
      await saveChatSession(updatedMessages, readingResult);
      
    } catch (error) {
      console.error('Error generating response:', error);
      
      if (!mounted.current) return;
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'The cosmic energies are clouded at this moment. Please try asking again.',
        isUser: false,
        timestamp: new Date().toISOString(),
        isError: true
      };

      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);
    } finally {
      if (mounted.current) {
        setIsGenerating(false);
        setIsTyping(false);
      }
    }
  };

  // Start a completely new reading session
  const startNewSession = () => {
    setMessages([]);
    setCurrentChatId(null);
    setIsGenerating(false);
    setIsTyping(false);
    onBack();
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Oracle Reading</Text>
            <Text style={styles.headerSubtitle}>The cards reveal...</Text>
          </View>
          
          <TouchableOpacity onPress={startNewSession} style={styles.newButton}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Chat Interface */}
        <ChatInterface
          messages={messages}
          onSendMessage={sendMessage}
          isGenerating={isGenerating}
          isTyping={isTyping}
        />

        {/* Bottom Navigation */}
        <BottomNavigation 
          currentScreen={currentScreen}
          onNavigate={onNavigate}
        />
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
    fontStyle: 'italic',
  },
  newButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});