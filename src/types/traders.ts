// Типы для системы торговцев на рынке

export interface Trader {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  arrivalTime: number // время прибытия в игровых днях
  departureTime: number // время отъезда в игровых днях
  materials: TraderMaterial[]
  reputation: number // репутация торговца (влияет на цены)
}

export interface TraderMaterial {
  id: string
  name: string
  description: string
  icon: string
  category: 'fabric' | 'accessories' | 'tools' | 'special'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  basePrice: number
  quantity: number
  maxQuantity: number
  quality: number // 1-5, влияет на качество продукции
  effects: MaterialEffect[]
}

export interface MaterialEffect {
  type: 'quality_boost' | 'production_speed' | 'cost_reduction' | 'special'
  value: number
  description: string
}

export interface MarketState {
  currentDay: number
  activeTraders: Trader[]
  traderHistory: TraderVisit[]
  marketTrends: MarketTrend
}

export interface TraderVisit {
  traderId: string
  day: number
  materialsSold: string[]
  totalSpent: number
}

export interface MarketTrend {
  demandMultiplier: number // множитель спроса (0.5-2.0)
  priceFluctuation: number // колебание цен (-0.3 до +0.3)
  rareMaterialChance: number // шанс появления редких материалов
}
