import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG } from '@/config/supabase'

// Создаем Supabase клиент
export const supabase = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey
)

// Типы для базы данных
export interface Database {
  public: {
    Tables: {
      warehouse_materials: {
        Row: {
          id: string
          name: string
          icon: string
          quantity: number
          price: number
          category: string
          quality: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          icon: string
          quantity?: number
          price: number
          category?: string
          quality?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          icon?: string
          quantity?: number
          price?: number
          category?: string
          quality?: number
          updated_at?: string
        }
      }
      warehouse_clothing: {
        Row: {
          id: string
          name: string
          icon: string
          quantity: number
          price: number
          category: string
          quality: number
          size?: string
          color?: string
          brand?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          icon: string
          quantity?: number
          price: number
          category?: string
          quality?: number
          size?: string
          color?: string
          brand?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          icon?: string
          quantity?: number
          price?: number
          category?: string
          quality?: number
          size?: string
          color?: string
          brand?: string
          updated_at?: string
        }
      }
      warehouse_stats: {
        Row: {
          id: string
          warehouse_name: string
          capacity_percent: number
          free_space: number
          monthly_rent: number
          temperature_min: number
          temperature_max: number
          humidity_min: number
          humidity_max: number
          security_level: string
          tracking_system: string
          last_updated?: string
          created_at: string
        }
        Insert: {
          id?: string
          warehouse_name?: string
          capacity_percent?: number
          free_space?: number
          monthly_rent?: number
          temperature_min?: number
          temperature_max?: number
          humidity_min?: number
          humidity_max?: number
          security_level?: string
          tracking_system?: string
          last_updated?: string
          created_at?: string
        }
        Update: {
          id?: string
          warehouse_name?: string
          capacity_percent?: number
          free_space?: number
          monthly_rent?: number
          temperature_min?: number
          temperature_max?: number
          humidity_min?: number
          humidity_max?: number
          security_level?: string
          tracking_system?: string
          last_updated?: string
        }
      }
      warehouse_transactions: {
        Row: {
          id: string
          transaction_type: 'in' | 'out' | 'transfer' | 'adjustment'
          item_type: 'material' | 'clothing'
          item_id: string
          item_name: string
          quantity_change: number
          price_per_unit: number
          total_value: number
          reason?: string
          performed_by?: string
          created_at: string
        }
        Insert: {
          id?: string
          transaction_type: 'in' | 'out' | 'transfer' | 'adjustment'
          item_type: 'material' | 'clothing'
          item_id: string
          item_name: string
          quantity_change: number
          price_per_unit: number
          total_value: number
          reason?: string
          performed_by?: string
          created_at?: string
        }
        Update: {
          id?: string
          transaction_type?: 'in' | 'out' | 'transfer' | 'adjustment'
          item_type?: 'material' | 'clothing'
          item_id?: string
          item_name?: string
          quantity_change?: number
          price_per_unit?: number
          total_value?: number
          reason?: string
          performed_by?: string
        }
      }
    }
  }
}
