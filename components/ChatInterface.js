import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Dimensions,
  Animated,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CardDisplay from './CardDisplay';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

export default function ChatInterface({ 
  messages, 
  onSendMessage, 
  isGenerating, 
  isTyping 
}) {
  const [inputText, setInputText] = useState('');
  const [typingText, setTypingText] = useState('');
  const [showTypingEffect, setShowTypingEffect] = useState(false);
  const scrollViewRef = useRef();
  const typingAnimation = useRef(new Animated.Value(0)).current;
  const typingTimeout = useRef(null);
  const currentTypingIndex = useRef(0);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Typing effect for the latest Oracle message
  useEffect(() => {
    if (isTyping) {
      setShowTypingEffect(true);
      startTypingAnimation();
    } else {
      setShowTypingEffect(false);
      stopTypingAnimation();
    }
    
    return () => {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    };
  }, [isTyping]);

  // Start typing animation (dots)
  const startTypingAnimation = () => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(typingAnimation, {
          toValue: 1,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(typingAnimation, {
          toValue: 0,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (isTyping) {
          animate();
        }
      });
    };
    animate();
  };

  const stopTypingAnimation = () => {
    typingAnimation.stopAnimation();
    typingAnimation.setValue(0);
  };

  // Send message handler
  const handleSendMessage = () => {
    if (inputText.trim() && !isGenerating) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  // Render typing indicator
  const renderTypingIndicator = () => {
    if (!showTypingEffect) return null;

    const dotStyle = {
      opacity: typingAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 1],
      }),
      transform: [{
        scale: typingAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.2],
        }),
      }],
    };

    return (
      <View style={[styles.messageBubble, styles.oracleMessage]}>
        <Text style={styles.oracleLabel}>The Oracle is consulting the cards...</Text>
        <View style={styles.typingContainer}>
          <Animated.View style={[styles.typingDot, dotStyle]} />
          <Animated.View style={[styles.typingDot, dotStyle, { animationDelay: '0.2s' }]} />
          <Animated.View style={[styles.typingDot, dotStyle, { animationDelay: '0.4s' }]} />
        </View>
      </View>
    );
  };

  // Render individual message
  const renderMessage = (message) => {
    const isUser = message.isUser;
    const bubbleStyle = [
      styles.messageBubble,
      isUser ? styles.userMessage : styles.oracleMessage,
      {
        maxWidth: isTablet ? '65%' : '75%', // Responsive width
        alignSelf: isUser ? 'flex-end' : 'flex-start',
      }
    ];

    return (
      <View key={message.id} style={bubbleStyle}>
        {!isUser && (
          <Text style={styles.oracleLabel}>The Oracle</Text>
        )}
        
        <Text style={[
          styles.messageText,
          isUser ? styles.userMessageText : styles.oracleMessageText
        ]}>
          {message.text}
        </Text>

        {/* Display cards if present */}
        {message.cards && message.cards.length > 0 && (
          <View style={styles.cardsContainer}>
            {message.cards.map((card, index) => (
              <CardDisplay 
                key={index} 
                card={card} 
                compact={true}
                style={styles.chatCard}
              />
            ))}
          </View>
        )}

        {/* Display single card if present */}
        {message.card && (
          <View style={styles.cardContainer}>
            <CardDisplay 
              card={message.card} 
              compact={true}
              style={styles.chatCard}
            />
          </View>
        )}

        <Text style={[
          styles.timestamp,
          isUser ? styles.userTimestamp : styles.oracleTimestamp
        ]}>
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Messages Area */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map(renderMessage)}
        {renderTypingIndicator()}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask another question..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isGenerating}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isGenerating) && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isGenerating}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={(!inputText.trim() || isGenerating) ? '#999' : '#667eea'} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  messagesContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  messageBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 18,
    padding: 15,
    marginVertical: 5,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  oracleMessage: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  oracleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 5,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  userMessageText: {
    color: '#333',
  },
  oracleMessageText: {
    color: 'white',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 8,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  userTimestamp: {
    color: '#666',
    textAlign: 'right',
  },
  oracleTimestamp: {
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'left',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    justifyContent: 'center',
  },
  cardContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  chatCard: {
    marginHorizontal: 5,
    marginVertical: 5,
  },
  typingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    marginHorizontal: 3,
  },
  inputContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingBottom: 100, // Space for bottom navigation
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    maxHeight: 100,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
    paddingVertical: 5,
  },
  sendButton: {
    marginLeft: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  sendButtonDisabled: {
    backgroundColor: 'transparent',
  },
});