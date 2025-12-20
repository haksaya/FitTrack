
export interface ActivityType {
  id: string;
  name: string;
  unit: string;
  icon: string;
  user_id: string | null;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  activity_type_id: string;
  value: number;
  date: string;
  notes?: string;
  created_at: string;
  activity_type?: ActivityType;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'user';
  avatar_url?: string;
  // Added created_at field to UserProfile to fix usage in AdminPanel
  created_at?: string;
}

export type ViewState = 'dashboard' | 'logs' | 'settings' | 'new-activity' | 'admin-panel';
