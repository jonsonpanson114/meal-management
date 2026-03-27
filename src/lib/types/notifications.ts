export interface NotificationSettings {
  id: string;
  user_id: string;
  enabled: boolean;
  breakfast_time: string;
  lunch_time: string;
  dinner_time: string;
  created_at: string;
  updated_at: string;
}

export interface MealNotificationRequest {
  userId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
}
