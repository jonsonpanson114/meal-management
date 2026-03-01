export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: '朝食',
  lunch: '昼食',
  dinner: '夕食',
  snack: '間食',
};

export const MEAL_TYPE_COLORS: Record<MealType, string> = {
  breakfast: 'from-orange-400 to-yellow-400',
  lunch: 'from-green-400 to-teal-400',
  dinner: 'from-purple-400 to-indigo-400',
  snack: 'from-pink-400 to-rose-400',
};

export const FOCUS_LABELS: Record<number, string> = {
  1: 'ぼんやり',
  2: '普通',
  3: 'まあまあ',
  4: '集中できた',
  5: '最高に冴えてる',
};

export interface NutritionInfo {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  foods: { name: string; calories: number }[];
  description?: string;
}

export interface MealRecord {
  id: string;
  user_id: string;
  meal_type: MealType;
  image_url?: string;
  description: string;
  calories: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  foods?: { name: string; calories: number }[];
  ai_comment?: string;
  recorded_at: string;
  created_at: string;
}

export interface DailyRecord {
  id: string;
  user_id: string;
  date: string;
  weight?: number;
  focus_level?: number;
  target_calories?: number;
  target_protein?: number;
  target_fat?: number;
  target_carbs?: number;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  target_calories: number;
  target_protein: number;
  target_fat: number;
  target_carbs: number;
  created_at: string;
}

export interface WeeklyData {
  date: string;
  total_calories: number;
  weight?: number;
  focus_level?: number;
  meals: MealRecord[];
}

export interface GeminiAnalysisRequest {
  imageBase64?: string;
  description?: string;
  userComment?: string;
}

export interface GeminiAnalysisResponse {
  success: boolean;
  data?: NutritionInfo;
  error?: string;
}
