-- Create the notification_settings table
CREATE TABLE IF NOT EXISTS notification_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT FALSE,
  breakfast_time TEXT DEFAULT '08:00',
  lunch_time TEXT DEFAULT '12:00',
  dinner_time TEXT DEFAULT '19:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own notification settings"
  ON notification_settings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Explicit separate policies for better clarity if needed
-- DROP POLICY IF EXISTS "Users can manage their own notification settings" ON notification_settings;
-- CREATE POLICY "Users can select their own notification settings" ON notification_settings FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can insert their own notification settings" ON notification_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can update their own notification settings" ON notification_settings FOR UPDATE USING (auth.uid() = user_id);
