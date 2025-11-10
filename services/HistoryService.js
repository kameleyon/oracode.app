import { supabase } from '../lib/supabase';

class HistoryService {
  async createSession(userId, title = 'New Reading Session') {
    try {
      const { data, error } = await supabase
        .from('reading_sessions')
        .insert({
          user_id: userId,
          title: title
        })
        .select()
        .single();

      if (error) throw error;
      return { session: data, error: null };
    } catch (error) {
      console.error('Error creating session:', error);
      return { session: null, error };
    }
  }

  async saveMessage(sessionId, role, content, cards = null, hasCards = false) {
    try {
      const { data, error } = await supabase
        .from('reading_messages')
        .insert({
          session_id: sessionId,
          role,
          content,
          cards,
          has_cards: hasCards,
          timestamp: Date.now()
        })
        .select()
        .single();

      if (error) throw error;
      return { message: data, error: null };
    } catch (error) {
      console.error('Error saving message:', error);
      return { message: null, error };
    }
  }

  async getUserSessions(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('reading_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { sessions: data, error: null };
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return { sessions: [], error };
    }
  }

  async getSessionMessages(sessionId) {
    try {
      const { data, error } = await supabase
        .from('reading_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { messages: data, error: null };
    } catch (error) {
      console.error('Error fetching messages:', error);
      return { messages: [], error };
    }
  }

  async updateSessionTitle(sessionId, title) {
    try {
      const { data, error } = await supabase
        .from('reading_sessions')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return { session: data, error: null };
    } catch (error) {
      console.error('Error updating session title:', error);
      return { session: null, error };
    }
  }

  async deleteSession(sessionId) {
    try {
      const { error } = await supabase
        .from('reading_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting session:', error);
      return { error };
    }
  }

  generateSessionTitle(firstMessage) {
    // Generate a meaningful title from the first user message
    if (!firstMessage) return 'New Reading Session';
    
    let title = firstMessage.length > 40 ? 
      firstMessage.substring(0, 40) + '...' : 
      firstMessage;
    
    // Clean up the title
    title = title.replace(/[^\w\s]/g, '').trim();
    
    return title || 'New Reading Session';
  }
}

export default new HistoryService();