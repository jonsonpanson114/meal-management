-- Create the push_subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own subscriptions"
  ON push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
  ON push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster lookup
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
