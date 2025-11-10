// Oracle Tarot Reading Service with OpenRouter Integration
class AgentService {
  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
    this.baseUrl = 'https://openrouter.ai/api/v1';
    this.model = 'claude-3.5-sonnet'; // Using Claude Sonnet model
    
    if (!this.apiKey) {
      console.error('Missing OpenRouter API key');
    }
  }

  // Get a random tarot card
  getRandomCard() {
    const cards = [
      // Major Arcana
      { name: 'The Fool', number: 0, suit: 'Major Arcana', meaning: 'New beginnings, innocence, spontaneity' },
      { name: 'The Magician', number: 1, suit: 'Major Arcana', meaning: 'Manifestation, resourcefulness, power' },
      { name: 'The High Priestess', number: 2, suit: 'Major Arcana', meaning: 'Intuition, sacred knowledge, divine feminine' },
      { name: 'The Empress', number: 3, suit: 'Major Arcana', meaning: 'Femininity, beauty, nature, abundance' },
      { name: 'The Emperor', number: 4, suit: 'Major Arcana', meaning: 'Authority, structure, control, father-figure' },
      { name: 'The Hierophant', number: 5, suit: 'Major Arcana', meaning: 'Spiritual wisdom, religious beliefs, conformity' },
      { name: 'The Lovers', number: 6, suit: 'Major Arcana', meaning: 'Love, harmony, relationships, values alignment' },
      { name: 'The Chariot', number: 7, suit: 'Major Arcana', meaning: 'Control, willpower, success, determination' },
      { name: 'Strength', number: 8, suit: 'Major Arcana', meaning: 'Strength, courage, patience, control' },
      { name: 'The Hermit', number: 9, suit: 'Major Arcana', meaning: 'Soul searching, introspection, inner guidance' },
      { name: 'Wheel of Fortune', number: 10, suit: 'Major Arcana', meaning: 'Good luck, karma, life cycles, destiny' },
      { name: 'Justice', number: 11, suit: 'Major Arcana', meaning: 'Justice, fairness, truth, cause and effect' },
      { name: 'The Hanged Man', number: 12, suit: 'Major Arcana', meaning: 'Suspension, restriction, letting go' },
      { name: 'Death', number: 13, suit: 'Major Arcana', meaning: 'Endings, beginnings, change, transformation' },
      { name: 'Temperance', number: 14, suit: 'Major Arcana', meaning: 'Balance, moderation, patience, purpose' },
      { name: 'The Devil', number: 15, suit: 'Major Arcana', meaning: 'Shadow self, attachment, addiction, restriction' },
      { name: 'The Tower', number: 16, suit: 'Major Arcana', meaning: 'Sudden change, upheaval, chaos, revelation' },
      { name: 'The Star', number: 17, suit: 'Major Arcana', meaning: 'Hope, faith, purpose, renewal, spirituality' },
      { name: 'The Moon', number: 18, suit: 'Major Arcana', meaning: 'Illusion, fear, anxiety, subconscious, intuition' },
      { name: 'The Sun', number: 19, suit: 'Major Arcana', meaning: 'Positivity, fun, warmth, success, vitality' },
      { name: 'Judgement', number: 20, suit: 'Major Arcana', meaning: 'Judgement, rebirth, inner calling, absolution' },
      { name: 'The World', number: 21, suit: 'Major Arcana', meaning: 'Completion, accomplishment, travel, success' },
      
      // Minor Arcana samples
      { name: 'Ace of Cups', number: 1, suit: 'Cups', meaning: 'Love, new relationships, compassion, creativity' },
      { name: 'Two of Cups', number: 2, suit: 'Cups', meaning: 'Unified love, partnership, mutual attraction' },
      { name: 'Three of Cups', number: 3, suit: 'Cups', meaning: 'Celebration, friendship, creativity, collaborations' },
      { name: 'Ace of Pentacles', number: 1, suit: 'Pentacles', meaning: 'New financial opportunity, manifestation' },
      { name: 'Ace of Swords', number: 1, suit: 'Swords', meaning: 'New ideas, mental clarity, breakthrough' },
      { name: 'Ace of Wands', number: 1, suit: 'Wands', meaning: 'Inspiration, new opportunities, growth' }
    ];

    return cards[Math.floor(Math.random() * cards.length)];
  }

  // Generate card filename for image loading
  getCardImagePath(card) {
    // Convert card name to filename format
    // e.g., "The Fool" -> "the_fool.jpg", "Ace of Cups" -> "ace_of_cups.jpg"
    const filename = card.name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/^the_/, ''); // Remove "the_" prefix for consistency
    
    return `${filename}.jpg`;
  }

  // Generate Oracle reading with cards
  async generateReading(question, cards = null) {
    try {
      // If no cards provided, draw random cards
      const drawnCards = cards || [this.getRandomCard(), this.getRandomCard(), this.getRandomCard()];
      
      const prompt = `You are the Oracle, a mystical tarot reader with ancient wisdom. 

A seeker has come to you with this question: "${question}"

The cards drawn for this reading are:
${drawnCards.map((card, index) => `${index + 1}. ${card.name} (${card.suit}) - ${card.meaning}`).join('\n')}

Provide a mystical, insightful tarot reading that:
- Addresses their specific question
- Interprets each card in context of their question
- Weaves the cards together into a coherent narrative
- Offers guidance and wisdom
- Uses mystical, oracle-like language but remains accessible
- Is 3-4 paragraphs long

Speak as the Oracle in first person. Begin with "I see..." or "The cards reveal..." or similar mystical opening.`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://oracode-app.com', // Optional: your app's domain
          'X-Title': 'OracleCode Tarot App', // Optional: your app name
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are the Oracle, an ancient mystical tarot reader who speaks with wisdom and mystical insight. Always stay in character as a mystical oracle.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const reading = data.choices?.[0]?.message?.content;

      if (!reading) {
        throw new Error('No reading generated from API response');
      }

      return {
        reading,
        cards: drawnCards,
        timestamp: new Date().toISOString(),
        question
      };

    } catch (error) {
      console.error('Error generating reading:', error);
      
      // Fallback reading if API fails
      const fallbackReading = this.generateFallbackReading(question, cards);
      return fallbackReading;
    }
  }

  // Fallback reading generator for offline/error scenarios
  generateFallbackReading(question, cards = null) {
    const drawnCards = cards || [this.getRandomCard(), this.getRandomCard(), this.getRandomCard()];
    
    const reading = `I sense your energy reaching across the veil with the question: "${question}"

The cosmos has drawn ${drawnCards[0].name}, revealing ${drawnCards[0].meaning.toLowerCase()}. This card speaks to the foundation of your current situation.

${drawnCards[1].name} appears in the present position, indicating ${drawnCards[1].meaning.toLowerCase()}. The energies surrounding you now are shifting.

Finally, ${drawnCards[2].name} illuminates your path forward with ${drawnCards[2].meaning.toLowerCase()}. Trust in the wisdom these cards offer.

The universe speaks through these ancient symbols. Meditate upon their message, for within their imagery lies the guidance you seek. Remember, dear seeker, you hold the power to shape your destiny.`;

    return {
      reading,
      cards: drawnCards,
      timestamp: new Date().toISOString(),
      question,
      isOffline: true
    };
  }

  // Quick yes/no oracle response
  async generateQuickReading(question) {
    try {
      const card = this.getRandomCard();
      
      const prompt = `You are the Oracle. Someone asks: "${question}"

The card drawn is: ${card.name} - ${card.meaning}

Give a brief, mystical response (2-3 sentences) that interprets this card in relation to their question. Speak as the Oracle.`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are the Oracle. Give brief, mystical responses.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 200
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const reading = data.choices?.[0]?.message?.content;

      return {
        reading: reading || `The ${card.name} whispers of ${card.meaning.toLowerCase()}. The answer lies within this energy.`,
        card,
        timestamp: new Date().toISOString(),
        question
      };

    } catch (error) {
      console.error('Error generating quick reading:', error);
      const card = this.getRandomCard();
      return {
        reading: `The ${card.name} appears, speaking of ${card.meaning.toLowerCase()}. Trust in this guidance, seeker.`,
        card,
        timestamp: new Date().toISOString(),
        question,
        isOffline: true
      };
    }
  }
}

export default new AgentService();