import { createClient } from '@supabase/supabase-js';

// Конфигурация Supabase
const supabaseUrl = 'https://mcdhnxkzsbcifsaijieu.supabase.co'; // Замените на ваш URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jZGhueGt6c2JjaWZzYWlqaWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4ODEwOTAsImV4cCI6MjA3MzQ1NzA5MH0.njdhv1MANZ0K1EFTsfAl61F38aVxspkgtbNo2GGZUYY'; // Замените на ваш анонимный ключ

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Типы для базы данных
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          phone?: string;
          address?: string;
          date_of_birth?: string;
          gender?: 'male' | 'female' | 'other';
          profile_image?: string;
          newsletter_subscription: boolean;
          notifications_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          phone?: string;
          address?: string;
          date_of_birth?: string;
          gender?: 'male' | 'female' | 'other';
          profile_image?: string;
          newsletter_subscription?: boolean;
          notifications_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          phone?: string;
          address?: string;
          date_of_birth?: string;
          gender?: 'male' | 'female' | 'other';
          profile_image?: string;
          newsletter_subscription?: boolean;
          notifications_enabled?: boolean;
          updated_at?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          quantity: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          quantity?: number;
          updated_at?: string;
        };
      };
      wishlist_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
        };
      };
    };
  };
}
