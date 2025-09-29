// Основные типы для игры Fashion Goose

export interface GameState {
  player: Player
  economy: EconomyState
  gameTime: number
  level: number
  experience: number
}

export interface Player {
  id: string
  name: string
  money: number
  reputation: number
  level: number
  experience: number
  inventory: InventoryItem[]
  business: Business
  achievements: Achievement[]
}

export interface InventoryItem {
  id: string
  type: 'fabric' | 'accessory' | 'tool' | 'clothing'
  name: string
  quantity: number
  quality: number
  price: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface Business {
  id: string
  name: string
  type: 'boutique' | 'factory' | 'market_stall'
  level: number
  employees: Employee[]
  products: Product[]
  dailyRevenue: number
  dailyExpenses: number
  location: Location
}

export interface Employee {
  id: string
  name: string
  role: 'designer' | 'seamstress' | 'salesperson' | 'manager'
  skill: number
  salary: number
  happiness: number
}

export interface Product {
  id: string
  name: string
  type: 'dress' | 'shirt' | 'pants' | 'accessory'
  materials: MaterialRequirement[]
  basePrice: number
  quality: number
  demand: number
  productionTime: number
}

export interface MaterialRequirement {
  materialId: string
  quantity: number
  quality: number
}

export interface EconomyState {
  marketTrends: MarketTrend[]
  inflation: number
  season: 'spring' | 'summer' | 'autumn' | 'winter'
  events: EconomicEvent[]
}

export interface MarketTrend {
  category: string
  direction: 'up' | 'down' | 'stable'
  strength: number
  duration: number
}

export interface EconomicEvent {
  id: string
  name: string
  description: string
  type: 'positive' | 'negative' | 'neutral'
  effects: EventEffect[]
  duration: number
}

export interface EventEffect {
  target: 'demand' | 'supply' | 'price' | 'reputation'
  value: number
  category?: string
}

export interface Location {
  x: number
  y: number
  name: string
  type: 'city' | 'suburb' | 'mall' | 'market'
}

export interface Achievement {
  id: string
  name: string
  description: string
  reward: AchievementReward
  completed: boolean
  progress: number
  maxProgress: number
}

export interface AchievementReward {
  money?: number
  experience?: number
  item?: InventoryItem
  reputation?: number
}

// Типы для мультиплеера
export interface MultiplayerState {
  players: Player[]
  chatMessages: ChatMessage[]
  tradeOffers: TradeOffer[]
  competitions: Competition[]
}

export interface ChatMessage {
  id: string
  playerId: string
  playerName: string
  message: string
  timestamp: number
  type: 'general' | 'trade' | 'system'
}

export interface TradeOffer {
  id: string
  fromPlayerId: string
  toPlayerId?: string
  offeredItems: InventoryItem[]
  requestedItems: InventoryItem[]
  money: number
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  expiresAt: number
}

export interface Competition {
  id: string
  name: string
  description: string
  type: 'design' | 'sales' | 'efficiency'
  participants: string[]
  prize: AchievementReward
  startTime: number
  endTime: number
  status: 'upcoming' | 'active' | 'finished'
}
