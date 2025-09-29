import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Auction, AuctionParticipant, AuctionBid, AuctionStatus } from '@/types/auction'
import { useAuthStore } from './authStore'
import type { RealtimeChannel } from '@supabase/supabase-js'

export const useAuctionStore = defineStore('auction', () => {
  const authStore = useAuthStore()
  
  // Состояние
  const currentAuction = ref<Auction | null>(null)
  const availableAuctions = ref<Auction[]>([])  // Список всех активных аукционов
  const isConnected = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  let auctionChannel: RealtimeChannel | null = null
  let auctionsListChannel: RealtimeChannel | null = null // Канал для списка аукционов
  let timerInterval: number | null = null
  let listTimerInterval: number | null = null // Таймер для списка аукционов
  let heartbeatInterval: number | null = null // Heartbeat для автоматического завершения аукционов

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
    // Минимальная следующая ставка = текущая + 10% или минимум +100
    const increment = Math.max(Math.ceil(currentAuction.value.current_bid * 0.1), 100)
    return currentAuction.value.current_bid + increment
  })

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

      availableAuctions.value = (auctions || []).map(a => {
        // Вычисляем реальное время сразу при загрузке
        let realTimeLeft = a.time_left
        if (a.status === 'active' && a.started_at) {
          const startedAt = new Date(a.started_at).getTime()
          const now = Date.now()
          const elapsed = Math.floor((now - startedAt) / 1000)
          realTimeLeft = Math.max(0, 60 - elapsed)
        }

        return {
          id: a.id,
          material: a.material_data,
          starting_price: a.starting_price,
          current_bid: a.current_bid,
          current_bidder_id: a.current_bidder_id,
          current_bidder_name: a.current_bidder_name,
          time_left: realTimeLeft,  // Используем вычисленное время
          status: a.status,
          participants: [],
          bids_history: [],
          winner_id: a.winner_id,
          winner_name: a.winner_name,
          created_at: a.created_at,
          started_at: a.started_at,
          finished_at: a.finished_at
        }
      })

      console.log(`📋 Загружено ${availableAuctions.value.length} аукционов`)
      
      // Подписываемся на обновления списка аукционов
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

  // Подписка на обновления списка аукционов (Realtime)
  async function subscribeToAuctionsList() {
    // Отписываемся от предыдущего канала
    if (auctionsListChannel) {
      await supabase.removeChannel(auctionsListChannel)
    }

    // Останавливаем предыдущий таймер
    if (listTimerInterval) {
      clearInterval(listTimerInterval)
      listTimerInterval = null
    }

    auctionsListChannel = supabase.channel('auctions_list')

    // Подписка на изменения в таблице auctions
    auctionsListChannel
      .on(
        'postgres_changes',
        {
          event: '*', // Все события (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'auctions'
        },
        async (payload) => {
          console.log('🔄 Realtime изменение в списке аукционов:', payload.eventType)
          
          // Перезагружаем список аукционов
          const { data: auctionsData } = await supabase
            .from('auctions')
            .select('*')
            .in('status', ['waiting', 'active', 'finished'])
            .order('created_at', { ascending: false })
            .limit(20)

          if (auctionsData) {
            availableAuctions.value = auctionsData.map(a => {
              // Вычисляем реальное время сразу
              let realTimeLeft = a.time_left
              if (a.status === 'active' && a.started_at) {
                const startedAt = new Date(a.started_at).getTime()
                const now = Date.now()
                const elapsed = Math.floor((now - startedAt) / 1000)
                realTimeLeft = Math.max(0, 60 - elapsed)
              }

              return {
                id: a.id,
                material: a.material_data,
                starting_price: a.starting_price,
                current_bid: a.current_bid,
                current_bidder_id: a.current_bidder_id,
                current_bidder_name: a.current_bidder_name,
                time_left: realTimeLeft,
                status: a.status,
                participants: [],
                bids_history: [],
                winner_id: a.winner_id,
                winner_name: a.winner_name,
                created_at: a.created_at,
                started_at: a.started_at,
                finished_at: a.finished_at
              }
            })
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Статус подписки на список аукционов:', status)
      })

    // Запускаем таймер для обновления времени локально (каждую секунду)
    listTimerInterval = window.setInterval(() => {
      availableAuctions.value.forEach(auction => {
        if (auction.status === 'active' && auction.started_at) {
          const startedAt = new Date(auction.started_at).getTime()
          const now = Date.now()
          const elapsed = Math.floor((now - startedAt) / 1000)
          auction.time_left = Math.max(0, 60 - elapsed)
        }
      })
    }, 1000)

    // Запускаем heartbeat для автоматического завершения аукционов (каждые 10 секунд)
    startHeartbeat()
  }

  // Запуск heartbeat для автоматического завершения аукционов
  function startHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval)
    }

    // Вызываем сразу при запуске
    callHeartbeat()

    // И затем каждые 10 секунд
    heartbeatInterval = window.setInterval(() => {
      callHeartbeat()
    }, 10000)
  }

  // Вызов heartbeat функции на сервере
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

  // Остановка heartbeat
  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval)
      heartbeatInterval = null
    }
  }

  // Отписаться от списка аукционов
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

  // Найти доступный аукцион или создать новый (DEPRECATED - использовать loadAvailableAuctions)
  async function findOrCreateAuction() {
    await loadAvailableAuctions()
    
    // Присоединяемся к первому доступному
    const availableAuction = availableAuctions.value.find(a => 
      a.status === 'waiting' || a.status === 'active'
    )
    
    if (availableAuction) {
      await joinAuction(availableAuction.id)
      return availableAuction.id
    }
    
    return null
  }

  // Создание аукционов теперь на сервере через heartbeat_check_auctions()

  // Присоединиться к аукциону
  async function joinAuction(auctionId: string) {
    if (!authStore.user) {
      error.value = 'Необходима авторизация'
      return false
    }

    try {
      // Добавляем игрока в участники
      const { error: joinError } = await supabase
        .from('auction_participants')
        .insert({
          auction_id: auctionId,
          player_id: authStore.user.id,
          player_name: authStore.user.email || 'Игрок'
        })

      if (joinError && joinError.code !== '23505') { // Игнорируем ошибку дубликата
        throw joinError
      }

      // Загружаем данные аукциона
      await loadAuction(auctionId)

      // Подключаемся к real-time каналу
      await subscribeToAuction(auctionId)

      // Пытаемся автоматически запустить аукцион через 3 секунды
      // (даёт время другим игрокам присоединиться)
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

  // Попытка запустить аукцион
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

    // Загружаем участников
    const { data: participants, error: participantsError } = await supabase
      .from('auction_participants')
      .select('player_id, player_name, is_ready')
      .eq('auction_id', auctionId)

    if (participantsError) throw participantsError

    // Загружаем историю ставок
    const { data: bids, error: bidsError } = await supabase
      .from('auction_bids')
      .select('*')
      .eq('auction_id', auctionId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (bidsError) throw bidsError

    // Вычисляем реальное время
    let realTimeLeft = auctionData.time_left
    if (auctionData.status === 'active' && auctionData.started_at) {
      const startedAt = new Date(auctionData.started_at).getTime()
      const now = Date.now()
      const elapsed = Math.floor((now - startedAt) / 1000)
      realTimeLeft = Math.max(0, 60 - elapsed)
    }

    // Формируем объект аукциона
    currentAuction.value = {
      id: auctionData.id,
      material: auctionData.material_data,
      starting_price: auctionData.starting_price,
      current_bid: auctionData.current_bid,
      current_bidder_id: auctionData.current_bidder_id,
      current_bidder_name: auctionData.current_bidder_name,
      time_left: realTimeLeft,
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

    // Запускаем таймер если аукцион активен
    console.log('📊 Аукцион загружен:', {
      status: currentAuction.value.status,
      time_left: currentAuction.value.time_left,
      current_bid: currentAuction.value.current_bid
    })
    
    if (currentAuction.value.status === 'active') {
      console.log('🚀 Запускаем таймер при загрузке (статус active)')
      startTimer()
    } else {
      console.log('⏸️ Таймер не запущен, статус:', currentAuction.value.status)
    }
  }

  // Подписаться на обновления аукциона через Realtime
  async function subscribeToAuction(auctionId: string) {
    // Отписываемся от предыдущего канала
    if (auctionChannel) {
      await supabase.removeChannel(auctionChannel)
    }

    auctionChannel = supabase.channel(`auction:${auctionId}`)

    // Подписка на изменения в таблице auctions
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
              new_status: payload.new.status,
              old_bid: currentAuction.value.current_bid,
              new_bid: payload.new.current_bid
            })

            // Сохраняем старый статус ДО обновления
            const oldStatus = currentAuction.value.status

            // Обновляем данные аукциона
            currentAuction.value.current_bid = payload.new.current_bid
            currentAuction.value.current_bidder_id = payload.new.current_bidder_id
            currentAuction.value.current_bidder_name = payload.new.current_bidder_name
            currentAuction.value.status = payload.new.status
            currentAuction.value.time_left = payload.new.time_left

            // Если аукцион начался (переход waiting -> active)
            if (payload.new.status === 'active' && oldStatus !== 'active') {
              console.log('🚀 Аукцион запущен через Realtime!')
              startTimer()
            }

            // Если аукцион завершён
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
          // Перезагружаем список участников
          if (currentAuction.value) {
            const { data } = await supabase
              .from('auction_participants')
              .select('*')
              .eq('auction_id', auctionId)
            
            if (data) {
              currentAuction.value.participants = data
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

      // Оптимистичное обновление UI (сразу показываем изменения)
      // Realtime подтвердит через секунду
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

  // Получить актуальное время с сервера (защита от подкрутки времени)
  async function getServerTimeLeft(): Promise<number> {
    if (!currentAuction.value?.id) return 0
    
    try {
      const { data, error } = await supabase.rpc('get_auction_time_left', {
        p_auction_id: currentAuction.value.id
      })
      
      if (error) {
        console.error('Ошибка получения времени с сервера:', error)
        return calculateTimeLeftLocally() // Fallback на локальное вычисление
      }
      
      return data || 0
    } catch (err) {
      console.error('Ошибка при запросе времени:', err)
      return calculateTimeLeftLocally()
    }
  }

  // Локальное вычисление времени (fallback)
  function calculateTimeLeftLocally(): number {
    if (!currentAuction.value?.started_at) return 60
    
    const startedAt = new Date(currentAuction.value.started_at).getTime()
    const now = Date.now()
    const elapsed = Math.floor((now - startedAt) / 1000)
    const timeLeft = Math.max(0, 60 - elapsed)
    
    return timeLeft
  }

  // Таймер обратного отсчёта (синхронизация с сервером каждые 5 секунд)
  function startTimer() {
    stopTimer() // Останавливаем предыдущий таймер если есть

    let tickCount = 0

    timerInterval = window.setInterval(async () => {
      if (currentAuction.value) {
        tickCount++

        // Каждые 5 секунд запрашиваем время с сервера для синхронизации
        if (tickCount % 5 === 0) {
          const serverTime = await getServerTimeLeft()
          currentAuction.value.time_left = serverTime
          
          // Если сервер говорит что время вышло
          if (serverTime <= 0) {
            console.log('⏰ Сервер подтвердил окончание времени')
            stopTimer()
            // Перезагружаем аукцион для получения обновлённого статуса
            await loadAvailableAuctions()
            return
          }
        } else {
          // Между запросами к серверу используем локальное вычисление
          const localTime = calculateTimeLeftLocally()
          currentAuction.value.time_left = localTime
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

      // Обновляем баланс пользователя если он победитель
      if (data.winner_id === authStore.user?.id) {
        // Перезагружаем профиль пользователя
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

        // Новые аукционы создаются автоматически через heartbeat на сервере

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
    // State
    currentAuction,
    availableAuctions,  // Новое!
    isConnected,
    isLoading,
    error,

    // Computed
    isParticipating,
    isCurrentBidder,
    canPlaceBid,
    minimumNextBid,

    // Actions
    loadAvailableAuctions,  // Новое!
    subscribeToAuctionsList,
    unsubscribeFromAuctionsList,
    findOrCreateAuction,
    joinAuction,
    placeBid,
    leaveAuction,
    reset
  }
})
