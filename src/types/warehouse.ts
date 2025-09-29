// Типы для склада "Логистик+" в Fashion Goose

export interface WarehouseMaterial {
  id: string
  name: string
  icon: string
  quantity: number
  price: number
  category: string
  quality: number
  durability?: number // Прочность материала
  comfort?: number // Комфорт материала
  style?: number // Стиль материала
  description?: string // Описание материала
  created_at?: string
  updated_at?: string
}

export interface WarehouseClothing {
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
  created_at?: string
  updated_at?: string
}

export interface WarehouseStats {
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
  created_at?: string
}

export interface WarehouseTransaction {
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
  created_at?: string
}

export interface WarehouseUser {
  id: string
  username: string
  email: string
  full_name: string
  role: 'admin' | 'manager' | 'operator' | 'viewer'
  permissions: {
    read: boolean
    write: boolean
    delete?: boolean
    admin?: boolean
  }
  last_login?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface WarehouseSummary {
  materialsTotal: number
  materialsValue: number
  clothingTotal: number
  clothingValue: number
  totalValue: number
  capacityUsed: number
  freeSpace: number
}

export interface WarehouseUpdateRequest {
  itemType: 'material' | 'clothing'
  itemId: string
  quantityChange: number
  reason?: string
}
