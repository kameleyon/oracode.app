# Oracle Code - Tarot App Setup

## Overview
Oracle Code is a mystical tarot reading app that provides AI-powered tarot readings through an interactive chat interface.

## Environment Setup

1. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Configure your environment variables:**
   - `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `EXPO_PUBLIC_OPENROUTER_API_KEY`: Your OpenRouter API key for Claude Sonnet

## Database Setup (Supabase)

Create a table called `chat_sessions` with the following structure:

```sql
CREATE TABLE chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  reading_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access only their own sessions
CREATE POLICY "Users can access own chat sessions" ON chat_sessions
  FOR ALL USING (auth.uid() = user_id);
```

## Card Images

Place tarot card images in the `public/cards/` directory (for web) or `assets/cards/` directory (for mobile). 

Expected filename format:
- `the_fool.jpg` (for "The Fool")
- `ace_of_cups.jpg` (for "Ace of Cups")
- `card_back.jpg` (fallback image)

## Installation

```bash
npm install
```

## Running the App

```bash
# Web
npm run web

# iOS (requires iOS simulator)
npm run ios

# Android (requires Android emulator)
npm run android
```

## Features

- ✨ AI-powered tarot readings using Claude Sonnet
- 💬 Interactive chat interface with typing effects
- 🃏 Responsive card displays (compact mode in chat)
- 📱 Mobile-first responsive design (75% width mobile, 65% desktop)
- 🔐 User authentication via Supabase
- 💾 Chat session persistence
- 🎨 Beautiful gradient UI with Montserrat font
- 🌟 Mystical Oracle personality

## Architecture

- **Frontend**: React Native (Expo)
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **AI Service**: OpenRouter API (Claude Sonnet 4)
- **Styling**: Custom components with responsive design