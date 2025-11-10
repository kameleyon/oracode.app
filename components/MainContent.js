import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Platform,
  Dimensions,
  Alert
} from 'react-native';

const { width } = Dimensions.get('window');

export default function MainContent({ onNavigateToReading }) {
  const [question, setQuestion] = useState('');

  const handleStartReading = () => {
    if (!question.trim()) {
      Alert.alert('Question Required', 'Please enter a question for the Oracle to answer.');
      return;
    }
    onNavigateToReading(question.trim());
  };

  const handleQuickQuestion = (quickQuestion) => {
    setQuestion(quickQuestion);
    onNavigateToReading(quickQuestion);
  };

  const quickQuestions = [
    'What guidance do you have for me today?',
    'What should I focus on this week?',
    'What energy surrounds my love life?',
    'How can I improve my career path?',
    'What do I need to let go of?',
    'What opportunities await me?'
  ];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.instructionText}>
          Ask the Oracle a question and receive mystical guidance through the ancient art of tarot.
        </Text>

        <View style={styles.inputSection}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask your question here..."
            placeholderTextColor="#999"
            value={question}
            onChangeText={setQuestion}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          
          <TouchableOpacity 
            style={[styles.startButton, !question.trim() && styles.startButtonDisabled]}
            onPress={handleStartReading}
            disabled={!question.trim()}
          >
            <Text style={styles.startButtonText}>Consult the Oracle</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or choose a quick question</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.quickQuestions}>
          {quickQuestions.map((quickQuestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickQuestionButton}
              onPress={() => handleQuickQuestion(quickQuestion)}
            >
              <Text style={styles.quickQuestionText}>{quickQuestion}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ✨ Each reading is uniquely crafted for your question and energy ✨
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  content: {
    width: '100%',
    maxWidth: 500,
  },
  instructionText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  inputSection: {
    marginBottom: 30,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    minHeight: 100,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
    textAlignVertical: 'top',
  },
  startButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    marginHorizontal: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  quickQuestions: {
    marginBottom: 30,
  },
  quickQuestionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  quickQuestionText: {
    color: 'white',
    fontSize: 14,
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
});