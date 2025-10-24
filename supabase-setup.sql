-- ChatApp Database Setup Script
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friendships"
  ON friendships FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendships"
  ON friendships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their friendships"
  ON friendships FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their friendships"
  ON friendships FOR DELETE
  USING (auth.uid() = user_id);

-- Chats table
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT different_users CHECK (user1_id != user2_id)
);

ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chats"
  ON chats FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create chats"
  ON chats FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their chats"
  ON chats FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT,
  type TEXT NOT NULL CHECK (type IN ('text', 'image', 'voice', 'video')),
  media_url TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages (mark as read)"
  ON messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Coin Prizes table
CREATE TABLE IF NOT EXISTS coin_prizes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'annual')),
  first_place INTEGER NOT NULL DEFAULT 100,
  second_place INTEGER NOT NULL DEFAULT 50,
  third_place INTEGER NOT NULL DEFAULT 25,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(period_type)
);

ALTER TABLE coin_prizes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view coin prizes"
  ON coin_prizes FOR SELECT
  USING (true);

-- Insert default coin prizes
INSERT INTO coin_prizes (period_type, first_place, second_place, third_place)
VALUES 
  ('daily', 100, 50, 25),
  ('weekly', 500, 250, 125),
  ('monthly', 2000, 1000, 500),
  ('annual', 10000, 5000, 2500)
ON CONFLICT (period_type) DO NOTHING;

-- Blocked Users table
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their blocked list"
  ON blocked_users FOR SELECT
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block others"
  ON blocked_users FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock others"
  ON blocked_users FOR DELETE
  USING (auth.uid() = blocker_id);

-- Function to create mutual friendship
CREATE OR REPLACE FUNCTION create_friendship(friend_user_id UUID)
RETURNS UUID AS $$
DECLARE
  new_chat_id UUID;
  existing_chat_id UUID;
BEGIN
  -- Insert friendship from current user to friend
  INSERT INTO friendships (user_id, friend_id, status)
  VALUES (auth.uid(), friend_user_id, 'accepted')
  ON CONFLICT (user_id, friend_id) DO NOTHING;

  -- Insert reciprocal friendship (this uses SECURITY DEFINER to bypass RLS)
  INSERT INTO friendships (user_id, friend_id, status)
  VALUES (friend_user_id, auth.uid(), 'accepted')
  ON CONFLICT (user_id, friend_id) DO NOTHING;

  -- Check if chat already exists
  SELECT id INTO existing_chat_id
  FROM chats
  WHERE (user1_id = auth.uid() AND user2_id = friend_user_id)
     OR (user1_id = friend_user_id AND user2_id = auth.uid())
  LIMIT 1;

  IF existing_chat_id IS NOT NULL THEN
    RETURN existing_chat_id;
  END IF;

  -- Create new chat
  INSERT INTO chats (user1_id, user2_id)
  VALUES (auth.uid(), friend_user_id)
  RETURNING id INTO new_chat_id;

  RETURN new_chat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get rankings by period
CREATE OR REPLACE FUNCTION get_rankings(period_type TEXT)
RETURNS TABLE (
  user_id UUID,
  name TEXT,
  avatar_url TEXT,
  message_count BIGINT,
  rank BIGINT
) AS $$
DECLARE
  start_date TIMESTAMPTZ;
BEGIN
  -- Calculate start date based on period
  CASE period_type
    WHEN 'daily' THEN
      start_date := DATE_TRUNC('day', NOW());
    WHEN 'weekly' THEN
      start_date := DATE_TRUNC('week', NOW());
    WHEN 'monthly' THEN
      start_date := DATE_TRUNC('month', NOW());
    WHEN 'annual' THEN
      start_date := DATE_TRUNC('year', NOW());
    ELSE
      start_date := DATE_TRUNC('day', NOW());
  END CASE;

  RETURN QUERY
  SELECT 
    p.id AS user_id,
    p.name,
    p.avatar_url,
    COUNT(m.id) AS message_count,
    ROW_NUMBER() OVER (ORDER BY COUNT(m.id) DESC) AS rank
  FROM profiles p
  LEFT JOIN messages m ON p.id = m.sender_id AND m.created_at >= start_date
  GROUP BY p.id, p.name, p.avatar_url
  HAVING COUNT(m.id) > 0
  ORDER BY message_count DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage buckets (Run these in Supabase Storage UI or via API)
-- 1. Create a bucket called "media"
-- 2. Set it to public
-- 3. Add policy: Allow authenticated users to upload
-- 4. Add policy: Allow public to read

-- Storage policies (if using SQL to create bucket)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- CREATE POLICY "Allow authenticated uploads"
--   ON storage.objects FOR INSERT
--   TO authenticated
--   WITH CHECK (bucket_id = 'media');

-- CREATE POLICY "Allow public reads"
--   ON storage.objects FOR SELECT
--   TO public
--   USING (bucket_id = 'media');
