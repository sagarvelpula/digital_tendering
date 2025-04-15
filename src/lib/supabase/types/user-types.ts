
import { Role } from '@/context/AuthContext';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status?: 'active' | 'banned';
  photo_url?: string;
  company?: string;
  categories?: string[];
  email_notifications?: boolean;
};

export type UserProfileUpdate = Partial<{
  name: string;
  email: string;
  role: Role;
  status: 'active' | 'banned';
  photo_url: string;
  company: string;
  categories: string[];
  email_notifications: boolean;
}>;
