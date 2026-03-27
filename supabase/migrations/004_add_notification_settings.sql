-- Notification settings for meal reminders
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  breakfast_time TIME DEFAULT '08:00',
  lunch_time TIME DEFAULT '12:00',
  dinner_time TIME DEFAULT '19:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Policies: users can only access their own notification settings
CREATE POLICY "Users can view their own notification settings"
ON notification_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification settings"
ON notification_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings"
ON notification_settings FOR UPDATE
USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);
