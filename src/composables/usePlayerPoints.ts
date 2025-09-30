import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export interface GameSessionData {
  final_score: number
  duration_seconds?: number
  game_specific_data?: any
}

export interface PlayerStats {
  total_points: number
  auction_points: number
  logistics_points: number
  fashion_battle_points: number
  team_production_points: number
  games_played: number
  rank: number
  last_played_at: string
}

export interface LeaderboardEntry {
  rank: number
  user_id: string
  username: string
  total_points: number
  auction_points: number
  logistics_points: number
  fashion_battle_points: number
  team_production_points: number
  games_played: number
  last_played_at: string
}

export interface MinigameLeaderboardEntry {
  rank: number
  user_id: string
  username: string
  game_type: string
  total_points: number
  games_played: number
  avg_score: number
  best_score: number
  last_played_at: string
}

export interface PlayerMinigameStats {
  game_type: string
  total_points: number
  games_played: number
  avg_score: number
  best_score: number
  rank: number
  last_played_at: string
}

export interface Achievement {
  achievement_id: string
  achievement_name: string
  achievement_icon: string
  description: string
  category: string
  target_value: number
  current_progress: number
  progress_percent: number
  is_unlocked: boolean
  unlocked_at: string | null
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface AchievementUnlocked {
  achievement_id: string
  achievement_name: string
  achievement_icon: string
  description: string
  category: string
  unlocked_at: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export function usePlayerPoints() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Добавить очки игроку
  async function addPoints(
    gameType: 'auction' | 'logistics_race' | 'fashion_battle' | 'team_production',
    points: number,
    sessionData?: GameSessionData
  ) {
    try {
      isLoading.value = true
      error.value = null

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Пользователь не авторизован')
      }

      const { data, error: dbError } = await supabase.rpc('add_player_points', {
        p_user_id: user.id,
        p_game_type: gameType,
        p_points: points,
        p_session_data: sessionData ? JSON.stringify(sessionData) : null
      })

      if (dbError) {
        throw dbError
      }

      console.log(`✅ Добавлено ${points} очков за ${gameType}`)
      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Ошибка при добавлении очков:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Получить статистику игрока
  async function getPlayerStats(): Promise<PlayerStats | null> {
    try {
      isLoading.value = true
      error.value = null

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Пользователь не авторизован')
      }

      const { data, error: dbError } = await supabase.rpc('get_player_stats', {
        p_user_id: user.id
      })

      if (dbError) {
        throw dbError
      }

      if (data && data.length > 0) {
        return data[0] as PlayerStats
      }

      return null
    } catch (err: any) {
      error.value = err.message
      console.error('Ошибка при получении статистики:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Получить рейтинг игроков
  async function getLeaderboard(limit = 10, offset = 0): Promise<LeaderboardEntry[]> {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: dbError } = await supabase.rpc('get_player_leaderboard', {
        p_limit: limit,
        p_offset: offset
      })

      if (dbError) {
        throw dbError
      }

      return (data || []) as LeaderboardEntry[]
    } catch (err: any) {
      error.value = err.message
      console.error('Ошибка при получении рейтинга:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  // Начислить очки за аукцион
  async function addAuctionPoints(
    auctionId: string,
    bidAmount: number,
    isWinner: boolean,
    finalBid: number
  ) {
    let points = 0

    if (isWinner) {
      // Победитель получает очки в зависимости от выигранной суммы
      points = Math.round(finalBid / 100) // 1 очко за каждые 100 рублей
      points = Math.max(points, 10) // Минимум 10 очков за победу
    } else {
      // Участник получает очки за участие
      points = Math.round(bidAmount / 200) // 1 очко за каждые 200 рублей ставки
      points = Math.max(points, 1) // Минимум 1 очко за участие
    }

    const sessionData: GameSessionData = {
      final_score: points,
      game_specific_data: {
        auction_id: auctionId,
        bid_amount: bidAmount,
        is_winner: isWinner,
        final_bid: finalBid
      }
    }

    return await addPoints('auction', points, sessionData)
  }

  // Начислить очки за логистическую гонку
  async function addLogisticsPoints(
    finalScore: number,
    deliveredOrders: number,
    totalOrders: number,
    combo: number,
    mistakes: number,
    rounds: number
  ) {
    // Базовые очки = финальный счет игры
    let points = finalScore

    // Бонусы за эффективность
    const efficiency = (deliveredOrders / totalOrders) * 100
    if (efficiency >= 90) points += 50 // Бонус за отличную эффективность
    else if (efficiency >= 70) points += 25 // Бонус за хорошую эффективность

    // Бонус за комбо
    if (combo >= 10) points += 30
    else if (combo >= 5) points += 15

    // Бонус за количество раундов
    if (rounds >= 3) points += 20
    else if (rounds >= 2) points += 10

    // Штраф за ошибки (минимальный)
    points = Math.max(points - (mistakes * 2), 1)

    const sessionData: GameSessionData = {
      final_score: points,
      duration_seconds: 60, // Фиксированная длительность игры
      game_specific_data: {
        delivered_orders: deliveredOrders,
        total_orders: totalOrders,
        combo: combo,
        mistakes: mistakes,
        rounds: rounds,
        efficiency: efficiency
      }
    }

    return await addPoints('logistics_race', points, sessionData)
  }

  // Получить рейтинг мини-игр
  async function getMinigamesLeaderboard(
    gameType?: 'auction' | 'logistics_race' | 'fashion_battle' | 'team_production',
    limit = 10,
    offset = 0
  ): Promise<MinigameLeaderboardEntry[]> {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: dbError } = await supabase.rpc('get_minigames_leaderboard', {
        p_game_type: gameType || null,
        p_limit: limit,
        p_offset: offset
      })

      if (dbError) {
        throw dbError
      }

      return (data || []) as MinigameLeaderboardEntry[]
    } catch (err: any) {
      error.value = err.message
      console.error('Ошибка при получении рейтинга мини-игр:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  // Получить статистику игрока по мини-играм
  async function getPlayerMinigamesStats(): Promise<PlayerMinigameStats[]> {
    try {
      isLoading.value = true
      error.value = null

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Пользователь не авторизован')
      }

      const { data, error: dbError } = await supabase.rpc('get_player_minigames_stats', {
        p_user_id: user.id
      })

      if (dbError) {
        throw dbError
      }

      return (data || []) as PlayerMinigameStats[]
    } catch (err: any) {
      error.value = err.message
      console.error('Ошибка при получении статистики мини-игр:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  // Получить все достижения с прогрессом
  async function getAllAchievementsWithProgress(): Promise<Achievement[]> {
    try {
      isLoading.value = true
      error.value = null

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Пользователь не авторизован')
      }

      const { data, error: dbError } = await supabase.rpc('get_all_achievements_with_progress', {
        p_user_id: user.id
      })

      if (dbError) {
        throw dbError
      }

      return (data || []) as Achievement[]
    } catch (err: any) {
      error.value = err.message
      console.error('Ошибка при получении достижений с прогрессом:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  // Получить только разблокированные достижения
  async function getPlayerAchievements(): Promise<AchievementUnlocked[]> {
    try {
      isLoading.value = true
      error.value = null

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Пользователь не авторизован')
      }

      const { data, error: dbError } = await supabase.rpc('get_player_achievements_unlocked', {
        p_user_id: user.id
      })

      if (dbError) {
        throw dbError
      }

      return (data || []) as AchievementUnlocked[]
    } catch (err: any) {
      error.value = err.message
      console.error('Ошибка при получении разблокированных достижений:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    addPoints,
    getPlayerStats,
    getLeaderboard,
    addAuctionPoints,
    addLogisticsPoints,
    getMinigamesLeaderboard,
    getPlayerMinigamesStats,
    getPlayerAchievements,
    getAllAchievementsWithProgress
  }
}
