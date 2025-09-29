// Конфигурация Supabase для Fashion Goose
export const SUPABASE_CONFIG = {
  url: 'https://aqsxaujlfrbghcnwevrz.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxc3hhdWpsZnJiZ2hjbndldnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwODE3OTcsImV4cCI6MjA3NDY1Nzc5N30.h3G2H3EKzE2yTlPClA11cx-C8qXG0lDbRNueDjS3RXw'
}

// Типы таблиц для TypeScript
export const WAREHOUSE_TABLES = {
  MATERIALS: 'warehouse_materials',
  CLOTHING: 'warehouse_clothing',
  STATS: 'warehouse_stats',
  TRANSACTIONS: 'warehouse_transactions',
  USERS: 'warehouse_users'
} as const

// Конфигурация для работы со складом
export const WAREHOUSE_CONFIG = {
  DEFAULT_CAPACITY: 1000, // м²
  DEFAULT_MONTHLY_RENT: 25000, // ₽
  TEMPERATURE_RANGE: { min: 18, max: 22 }, // °C
  HUMIDITY_RANGE: { min: 45, max: 55 }, // %
  SECURITY_LEVEL: '24/7',
  TRACKING_SYSTEM: 'RFID'
} as const
