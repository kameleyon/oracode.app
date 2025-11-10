import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  Platform,
  TouchableOpacity,
  Dimensions 
} from 'react-native';
import AgentService from '../services/AgentService';

const { width } = Dimensions.get('window');

export default function CardDisplay({ card, compact = false, style }) {
  const [imageError, setImageError] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  if (!card) return null;

  // Generate image path
  const imagePath = AgentService.getCardImagePath(card);
  let imageUri;
  let fallbackImage;

  if (Platform.OS === 'web') {
    imageUri = `/cards/${imagePath}`;
    fallbackImage = '/cards/card_back.jpg';
  } else {
    // For mobile, use placeholder service since we don't have bundled assets yet
    const cardName = card.name || card;
    const formattedName = cardName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    imageUri = `https://via.placeholder.com/300x500/667eea/ffffff?text=${encodeURIComponent(formattedName)}`;
    fallbackImage = { uri: 'https://via.placeholder.com/300x500/333333/ffffff?text=Card' };
  }

  const cardStyle = compact ? styles.compactCard : styles.fullCard;
  const textStyle = compact ? styles.compactText : styles.fullText;
  const titleStyle = compact ? styles.compactTitle : styles.fullTitle;

  const handleCardPress = () => {
    if (compact) {
      setShowDetails(!showDetails);
    }
  };

  const renderCardImage = () => {
    return (
      <View style={[cardStyle.imageContainer, style]}>
        <Image
          source={imageError ? fallbackImage : { uri: imageUri }}
          style={cardStyle.image}
          onError={() => setImageError(true)}
          resizeMode="cover"
        />
        
        {/* Overlay with card info */}
        <View style={cardStyle.overlay}>
          <Text style={[titleStyle, cardStyle.overlayTitle]}>
            {card.name}
          </Text>
          {card.suit && (
            <Text style={[textStyle, cardStyle.overlaySubtitle]}>
              {card.suit}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderCardDetails = () => {
    if (compact && !showDetails) return null;
    
    return (
      <View style={cardStyle.detailsContainer}>
        <Text style={titleStyle}>{card.name}</Text>
        {card.suit && (
          <Text style={[textStyle, cardStyle.suit]}>{card.suit}</Text>
        )}
        <Text style={[textStyle, cardStyle.meaning]}>{card.meaning}</Text>
      </View>
    );
  };

  if (compact) {
    return (
      <TouchableOpacity onPress={handleCardPress} style={[styles.compactContainer, style]}>
        {renderCardImage()}
        {showDetails && renderCardDetails()}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.fullContainer, style]}>
      {renderCardImage()}
      {renderCardDetails()}
    </View>
  );
}

const styles = StyleSheet.create({
  // Compact mode styles (for chat bubbles)
  compactContainer: {
    alignItems: 'center',
    marginVertical: 5,
  },
  compactCard: {
    imageContainer: {
      width: 60,
      height: 100,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    overlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: 4,
    },
    overlayTitle: {
      color: 'white',
      fontSize: 9,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    overlaySubtitle: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: 7,
      textAlign: 'center',
    },
    detailsContainer: {
      marginTop: 8,
      alignItems: 'center',
      paddingHorizontal: 8,
    },
    suit: {
      marginBottom: 4,
    },
    meaning: {
      textAlign: 'center',
    },
  },
  compactTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
  compactText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },

  // Full mode styles (for detailed display)
  fullContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  fullCard: {
    imageContainer: {
      width: Math.min(width * 0.4, 150),
      height: Math.min(width * 0.6, 250),
      borderRadius: 15,
      overflow: 'hidden',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    overlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: 10,
    },
    overlayTitle: {
      color: 'white',
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    overlaySubtitle: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: 12,
      textAlign: 'center',
      marginTop: 2,
    },
    detailsContainer: {
      marginTop: 15,
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    suit: {
      marginBottom: 8,
      fontStyle: 'italic',
    },
    meaning: {
      textAlign: 'center',
      lineHeight: 22,
    },
  },
  fullTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
    textAlign: 'center',
    marginBottom: 5,
  },
  fullText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'System',
  },
});