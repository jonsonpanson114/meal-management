-- Add body stats columns to user_profiles for auto-calculation of calorie/PFC targets
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS height_cm NUMERIC(5,1),
ADD COLUMN IF NOT EXISTS body_weight NUMERIC(5,1),
ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'male' CHECK (gender IN ('male', 'female')),
ADD COLUMN IF NOT EXISTS activity_level TEXT DEFAULT 'light' CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'very_active'));
