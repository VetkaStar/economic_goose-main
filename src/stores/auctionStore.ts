import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Auction, AuctionBid, AuctionStatus } from '@/types/auction'
import { useAuthStore } from './authStore'
import type { RealtimeChannel } from '@supabase/supabase-js'

export const useAuctionStore = defineStore('auction', () => {
  const authStore = useAuthStore()
  
  // Состояние
  const currentAuction = ref<Auction | null>(null)
  const availableAuctions = ref<Auction[]>([])
  const isConnected = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  let auctionChannel: RealtimeChannel | null = null
  let auctionsListChannel: RealtimeChannel | null = null
  let timerInterval: number | null = null
  let listTimerInterval: number | null = null
  let heartbeatInterval: number | null = null

  // Computed
  const isParticipating = computed(() => {
    if (!currentAuction.value || !authStore.user) return false
    return currentAuction.value.participants.some(p => p.id === authStore.user?.id)
  })

  const isCurrentBidder = computed(() => {
    if (!currentAuction.value || !authStore.user) return false
    return currentAuction.value.current_bidder_id === authStore.user.id
  })

  const canPlaceBid = computed(() => {
    if (!currentAuction.value || !authStore.user) return false
    if (currentAuction.value.status !== 'active') return false
    return true
  })

  const minimumNextBid = computed(() => {
    if (!currentAuction.value) return 0
    const increment = Math.max(Math.ceil(currentAuction.value.current_bid * 0.1), 100)
    return currentAuction.value.current_bid + increment
  })

  // ИСПРАВЛЕНО: Функция для вычисления времени на основе started_at
  function calculateTimeLeft(startedAt: string | null): number {
    if (!startedAt) return 60
    
    const startTime = new Date(startedAt).getTime()
    const now = Date.now()
    const elapsed = Math.floor((now - startTime) / 1000)
    return Math.max(0, 60 - elapsed)
  }

  function sortAuctionsList(list: Auction[]): Auction[] {
    const weight: Record<AuctionStatus, number> = {
      waiting: 0,
      active: 1,
      finished: 2,
      cancelled: 3 as any
    }
    return [...list].sort((a, b) => {
      const byStatus = weight[a.status] - weight[b.status]
      if (byStatus !== 0) return byStatus
      const aTime = new Date(a.created_at || a.started_at || 0).getTime()
      const bTime = new Date(b.created_at || b.started_at || 0).getTime()
      return bTime - aTime
    })
  }

  // Загрузить список доступных аукционов
  async function loadAvailableAuctions() {
    isLoading.value = true
    error.value = null

    try {
      const { data: auctions, error: fetchError } = await supabase
        .from('auctions')
        .select('*')
        .in('status', ['waiting', 'active', 'finished'])
        .order('created_at', { ascending: false })
        .limit(20)

      if (fetchError) throw fetchError

      const mapped = (auctions || []).map(a => ({
        id: a.id,
        material: a.material_data,
        starting_price: a.starting_price,
        current_bid: a.current_bid,
        current_bidder_id: a.current_bidder_id,
        current_bidder_name: a.current_bidder_name,
        time_left: a.status === 'active' ? calculateTimeLeft(a.started_at) : a.time_left,
        status: a.status,
        participants: [],
        bids_history: [],
        winner_id: a.winner_id,
        winner_name: a.winner_name,
        created_at: a.created_at,
        started_at: a.started_at,
        finished_at: a.finished_at
      }))

      availableAuctions.value = sortAuctionsList(mapped)

      console.log(`📋 Загружено ${availableAuctions.value.length} аукционов`)
      
      subscribeToAuctionsList()

      return true
    } catch (err: any) {
      error.value = err.message
      console.error('Ошибка при загрузке аукционов:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Подписка на обновления списка аукционов
  async function subscribeToAuctionsList() {
    if (auctionsListChannel) {
      await supabase.removeChannel(auctionsListChannel)
    }

    if (listTimerInterval) {
      clearInterval(listTimerInterval)
      listTimerInterval = null
    }

    auctionsListChannel = supabase.channel('auctions_list')

    auctionsListChannel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'auctions'
        },
        async (payload) => {
          console.log('🔄 Realtime изменение в списке аукционов:', payload.eventType)
          
          const { data: auctionsData } = await supabase
            .from('auctions')
            .select('*')
            .in('status', ['waiting', 'active', 'finished'])
            .order('created_at', { ascending: false })
            .limit(20)

          if (auctionsData) {
            const mapped = auctionsData.map(a => ({
              id: a.id,
              material: a.material_data,
              starting_price: a.starting_price,
              current_bid: a.current_bid,
              current_bidder_id: a.current_bidder_id,
              current_bidder_name: a.current_bidder_name,
              time_left: a.status === 'active' ? calculateTimeLeft(a.started_at) : a.time_left,
              status: a.status,
              participants: [],
              bids_history: [],
              winner_id: a.winner_id,
              winner_name: a.winner_name,
              created_at: a.created_at,
              started_at: a.started_at,
              finished_at: a.finished_at
            }))
            availableAuctions.value = sortAuctionsList(mapped)
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Статус подписки на список аукционов:', status)
      })

    // ИСПРАВЛЕНО: Таймер обновляет время локально
    listTimerInterval = window.setInterval(() => {
      availableAuctions.value.forEach(auction => {
        if (auction.status === 'active' && auction.started_at) {
          auction.time_left = calculateTimeLeft(auction.started_at)
        }
      })
    }, 1000)

    startHeartbeat()
  }

  // Heartbeat
  function startHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval)
    }

    callHeartbeat()

    heartbeatInterval = window.setInterval(() => {
      callHeartbeat()
    }, 10000)
  }

  async function callHeartbeat() {
    try {
      const { data, error } = await supabase.rpc('heartbeat_check_auctions')
      
      if (error) {
        console.error('⚠️ Ошибка heartbeat:', error)
        return
      }

      console.log('💓 Heartbeat выполнен:', data)
    } catch (err) {
      console.error('⚠️ Критическая ошибка heartbeat:', err)
    }
  }

  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval)
      heartbeatInterval = null
    }
  }

  async function unsubscribeFromAuctionsList() {
    if (auctionsListChannel) {
      await supabase.removeChannel(auctionsListChannel)
      auctionsListChannel = null
    }

    if (listTimerInterval) {
      clearInterval(listTimerInterval)
      listTimerInterval = null
    }

    stopHeartbeat()
  }

  async function findOrCreateAuction() {
    await loadAvailableAuctions()
    
    const availableAuction = availableAuctions.value.find(a => 
      a.status === 'waiting' || a.status === 'active'
    )
    
    if (availableAuction) {
      await joinAuction(availableAuction.id)
      return availableAuction.id
    }
    
    return null
  }

  // Присоединиться к аукциону
  async function joinAuction(auctionId: string) {
    if (!authStore.user) {
      error.value = 'Необходима авторизация'
      return false
    }

    try {
      const { error: joinError } = await supabase
        .from('auction_participants')
        .insert({
          auction_id: auctionId,
          player_id: authStore.user.id,
          player_name: authStore.user.email || 'Игрок'
        })

      if (joinError && joinError.code !== '23505') {
        throw joinError
      }

      await loadAuction(auctionId)
      await subscribeToAuction(auctionId)

      setTimeout(async () => {
        await tryStartAuction(auctionId)
      }, 3000)

      return true
    } catch (err: any) {
      error.value = err.message
      console.error('Ошибка при присоединении к аукциону:', err)
      return false
    }
  }

  async function tryStartAuction(auctionId: string) {
    try {
      const { data, error: startError } = await supabase.rpc('auto_start_auction', {
        p_auction_id: auctionId
      })

      if (startError) throw startError

      if (data.success) {
        console.log('Аукцион запущен:', data.message)
      } else {
        console.log('Не удалось запустить аукцион:', data.error)
      }
    } catch (err: any) {
      console.error('Ошибка при запуске аукциона:', err)
    }
  }

  // Загрузить данные аукциона
  async function loadAuction(auctionId: string) {
    const { data: auctionData, error: auctionError } = await supabase
      .from('auctions')
      .select('*')
      .eq('id', auctionId)
      .single()

    if (auctionError) throw auctionError

    const { data: participants, error: participantsError } = await supabase
      .from('auction_participants')
      .select('player_id, player_name, is_ready')
      .eq('auction_id', auctionId)

    if (participantsError) throw participantsError

    const { data: bids, error: bidsError } = await supabase
      .from('auction_bids')
      .select('*')
      .eq('auction_id', auctionId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (bidsError) throw bidsError

    // ИСПРАВЛЕНО: Используем calculateTimeLeft
    currentAuction.value = {
      id: auctionData.id,
      material: auctionData.material_data,
      starting_price: auctionData.starting_price,
      current_bid: auctionData.current_bid,
      current_bidder_id: auctionData.current_bidder_id,
      current_bidder_name: auctionData.current_bidder_name,
      time_left: auctionData.status === 'active' ? calculateTimeLeft(auctionData.started_at) : auctionData.time_left,
      status: auctionData.status,
      participants: participants.map(p => ({
        id: p.player_id,
        name: p.player_name,
        is_ready: p.is_ready
      })),
      bids_history: bids,
      winner_id: auctionData.winner_id,
      winner_name: auctionData.winner_name,
      created_at: auctionData.created_at,
      started_at: auctionData.started_at,
      finished_at: auctionData.finished_at
    }

    console.log('📊 Аукцион загружен:', {
      status: currentAuction.value.status,
      time_left: currentAuction.value.time_left,
      current_bid: currentAuction.value.current_bid
    })
    
    if (currentAuction.value.status === 'active') {
      console.log('🚀 Запускаем таймер при загрузке')
      startTimer()
    }
  }

  // ИСПРАВЛЕНО: Подписка на Realtime БЕЗ обновления time_left
  async function subscribeToAuction(auctionId: string) {
    if (auctionChannel) {
      await supabase.removeChannel(auctionChannel)
    }

    auctionChannel = supabase.channel(`auction:${auctionId}`)

    auctionChannel
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'auctions',
          filter: `id=eq.${auctionId}`
        },
        (payload) => {
          if (currentAuction.value) {
            console.log('🔄 Realtime UPDATE auction:', {
              old_status: currentAuction.value.status,
              new_status: payload.new.status
            })

            const oldStatus = currentAuction.value.status

            // ИСПРАВЛЕНО: НЕ обновляем time_left из payload!
            currentAuction.value.current_bid = payload.new.current_bid
            currentAuction.value.current_bidder_id = payload.new.current_bidder_id
            currentAuction.value.current_bidder_name = payload.new.current_bidder_name
            currentAuction.value.status = payload.new.status
            
            // ИСПРАВЛЕНО: Сохраняем started_at для локального вычисления
            if (payload.new.started_at) {
              currentAuction.value.started_at = payload.new.started_at
            }

            if (payload.new.status === 'active' && oldStatus !== 'active') {
              console.log('🚀 Аукцион запущен через Realtime!')
              startTimer()
            }

            if (payload.new.status === 'finished') {
              console.log('🏁 Аукцион завершён через Realtime!')
              stopTimer()
              currentAuction.value.winner_id = payload.new.winner_id
              currentAuction.value.winner_name = payload.new.winner_name
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'auction_bids',
          filter: `auction_id=eq.${auctionId}`
        },
        (payload) => {
          console.log('💰 Realtime NEW BID:', payload.new)
          if (currentAuction.value) {
            currentAuction.value.bids_history.unshift(payload.new as AuctionBid)
            if (currentAuction.value.bids_history.length > 10) {
              currentAuction.value.bids_history.pop()
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'auction_participants',
          filter: `auction_id=eq.${auctionId}`
        },
        async (payload) => {
          console.log('👤 Realtime NEW PARTICIPANT:', payload.new)
          if (currentAuction.value) {
            const { data } = await supabase
              .from('auction_participants')
              .select('*')
              .eq('auction_id', auctionId)
            
            if (data) {
              currentAuction.value.participants = data.map((p: any) => ({
                id: p.player_id,
                name: p.player_name,
                is_ready: p.is_ready
              }))
            }
          }
        }
      )
      .subscribe((status) => {
        isConnected.value = status === 'SUBSCRIBED'
        console.log('Статус подключения к аукциону:', status)
      })
  }

  // Сделать ставку
  async function placeBid(amount: number) {
    if (!authStore.user || !currentAuction.value) {
      error.value = 'Необходима авторизация'
      return false
    }

    if (amount <= currentAuction.value.current_bid) {
      error.value = 'Ставка должна быть выше текущей'
      return false
    }

    if (amount > (authStore.user.money || 0)) {
      error.value = 'Недостаточно средств'
      return false
    }

    try {
      const { data, error: bidError } = await supabase.rpc('place_auction_bid', {
        p_auction_id: currentAuction.value.id,
        p_player_id: authStore.user.id,
        p_player_name: authStore.user.email || 'Игрок',
        p_bid_amount: amount
      })

      if (bidError) throw bidError

      if (!data.success) {
        error.value = data.error
        return false
      }

      if (currentAuction.value) {
        currentAuction.value.current_bid = amount
        currentAuction.value.current_bidder_id = authStore.user.id
        currentAuction.value.current_bidder_name = authStore.user.email || 'Игрок'
        
        console.log('✅ Ставка размещена:', amount)
      }

      return true
    } catch (err: any) {
      error.value = err.message
      console.error('Ошибка при размещении ставки:', err)
      return false
    }
  }

  // ИСПРАВЛЕНО: Упрощённый таймер без запросов к серверу
  function startTimer() {
    stopTimer()

    timerInterval = window.setInterval(() => {
      if (currentAuction.value && currentAuction.value.started_at) {
        const timeLeft = calculateTimeLeft(currentAuction.value.started_at)
        currentAuction.value.time_left = timeLeft
        
        if (timeLeft <= 0) {
          console.log('⏰ Время вышло локально')
          stopTimer()
        }
      }
    }, 1000)
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  // Завершить аукцион
  async function finishAuction() {
    if (!currentAuction.value) return

    stopTimer()

    try {
      const { data, error: finishError } = await supabase.rpc('finish_auction', {
        p_auction_id: currentAuction.value.id
      })

      if (finishError) throw finishError

      console.log('Аукцион завершён:', data)

      if (data.winner_id && authStore.user && data.winner_id === authStore.user.id) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', authStore.user.id)
          .single()

        if (!profileError && profile) {
          authStore.user = profile
          console.log('✅ Баланс обновлён:', profile.money)
        }
      }
    } catch (err: any) {
      error.value = err.message
      console.error('Ошибка при завершении аукциона:', err)
    }
  }

  // Покинуть аукцион
  async function leaveAuction() {
    stopTimer()

    if (auctionChannel) {
      await supabase.removeChannel(auctionChannel)
      auctionChannel = null
    }

    currentAuction.value = null
    isConnected.value = false
  }

  // Сброс состояния
  function reset() {
    stopTimer()
    unsubscribeFromAuctionsList()
    currentAuction.value = null
    availableAuctions.value = []
    isConnected.value = false
    isLoading.value = false
    error.value = null
  }

  return {
    currentAuction,
    availableAuctions,
    isConnected,
    isLoading,
    error,
    isParticipating,
    isCurrentBidder,
    canPlaceBid,
    minimumNextBid,
    loadAvailableAuctions,
    subscribeToAuctionsList,
    unsubscribeFromAuctionsList,
    findOrCreateAuction,
    joinAuction,
    placeBid,
    leaveAuction,
    reset
  }
})