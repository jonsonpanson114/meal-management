-- Add PFC target columns to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS target_protein INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS target_fat INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS target_carbs INTEGER DEFAULT 200;

-- Update existing records if necessary
-- UPDATE user_profiles SET target_protein = 50, target_fat = 50, target_carbs = 200 WHERE target_protein IS NULL;
