// Типы для системы аукционов материалов

export interface AuctionMaterial {
  id: string
  name: string
  icon: string
  description: string
  base_price: number
  quality: number
  quantity: number // метры
  durability?: number
  comfort?: number
  style?: number
}

export interface AuctionBid {
  id: string
  auction_id: string
  player_id: string
  player_name: string
  amount: number
  timestamp: string
}

export interface AuctionParticipant {
  id: string
  name: string
  avatar?: string
  is_ready: boolean
}

export type AuctionStatus = 'waiting' | 'active' | 'finished' | 'cancelled'

export interface Auction {
  id: string
  material: AuctionMaterial
  starting_price: number
  current_bid: number
  current_bidder_id: string | null
  current_bidder_name: string | null
  time_left: number // секунды
  status: AuctionStatus
  participants: AuctionParticipant[]
  bids_history: AuctionBid[]
  winner_id: string | null
  winner_name: string | null
  created_at: string
  started_at: string | null
  finished_at: string | null
}

export interface AuctionRoomData {
  id: string
  status: AuctionStatus
  current_bid: number
  current_bidder_id: string | null
  current_bidder_name: string | null
  time_left: number
  participants_count: number
}
