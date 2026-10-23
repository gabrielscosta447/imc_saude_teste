export interface Measurement {
  id: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm"
  weight: number; // in kg
  height: number; // in meters
  bmi: number;
  classification: string;
  statusLabel?: string;
}

export interface UserProfile {
  uid?: string;
  name: string;
  email: string;
  photoURL?: string;
  height: number;
  isLoggedIn: boolean;
}

export type TimeFilter = '30d' | '3m' | '1y' | 'all';

export type Screen = 'login' | 'register' | 'dashboard' | 'new-measurement';
