import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { EconomyState, MarketTrend, EconomicEvent } from '@/types/game'
import { GAME_CONFIG } from '@/config/gameConfig'

export const useEconomyStore = defineStore('economy', () => {
  // Состояние экономики
  const economyState = ref<EconomyState>({
    marketTrends: [],
    inflation: 0,
    season: 'spring',
    events: []
  })

  // Вычисляемые свойства
  const marketTrends = computed(() => economyState.value.marketTrends)
  const inflation = computed(() => economyState.value.inflation)
  const season = computed(() => economyState.value.season)
  const events = computed(() => economyState.value.events)

  // Сезонные модификаторы
  const seasonModifiers = {
    spring: { demand: 1.1, price: 1.0, reputation: 1.0 },
    summer: { demand: 1.2, price: 1.1, reputation: 1.1 },
    autumn: { demand: 0.9, price: 0.9, reputation: 0.9 },
    winter: { demand: 0.8, price: 1.2, reputation: 0.8 }
  }

  // Действия для управления рыночными трендами
  const addMarketTrend = (trend: MarketTrend) => {
    economyState.value.marketTrends.push(trend)
  }

  const updateMarketTrends = () => {
    // Обновляем существующие тренды
    economyState.value.marketTrends = economyState.value.marketTrends
      .map(trend => ({
        ...trend,
        duration: trend.duration - 1
      }))
      .filter(trend => trend.duration > 0)

    // Добавляем новые случайные тренды
    if (Math.random() < 0.1) { // 10% вероятность нового тренда
      const categories = ['dresses', 'shirts', 'pants', 'accessories']
      const directions = ['up', 'down', 'stable'] as const
      
      const newTrend: MarketTrend = {
        category: categories[Math.floor(Math.random() * categories.length)],
        direction: directions[Math.floor(Math.random() * directions.length)],
        strength: Math.random() * 0.5 + 0.1, // 0.1 - 0.6
        duration: Math.floor(Math.random() * 7) + 3 // 3-10 дней
      }
      
      addMarketTrend(newTrend)
    }
  }

  // Действия для управления инфляцией
  const updateInflation = () => {
    economyState.value.inflation += GAME_CONFIG.ECONOMY.INFLATION_RATE / 30 // Ежедневное обновление
  }

  // Действия для смены сезона
  const changeSeason = (newSeason: 'spring' | 'summer' | 'autumn' | 'winter') => {
    economyState.value.season = newSeason
  }

  const getNextSeason = (): 'spring' | 'summer' | 'autumn' | 'winter' => {
    const seasons = ['spring', 'summer', 'autumn', 'winter'] as const
    const currentIndex = seasons.indexOf(economyState.value.season)
    return seasons[(currentIndex + 1) % seasons.length]
  }

  // Действия для управления событиями
  const addEvent = (event: EconomicEvent) => {
    economyState.value.events.push(event)
  }

  const removeEvent = (eventId: string) => {
    economyState.value.events = economyState.value.events.filter(e => e.id !== eventId)
  }

  const updateEvents = () => {
    // Обновляем длительность событий
    economyState.value.events = economyState.value.events
      .map(event => ({
        ...event,
        duration: event.duration - 1
      }))
      .filter(event => event.duration > 0)

    // Добавляем новые случайные события
    if (Math.random() < GAME_CONFIG.ECONOMY.EVENT_PROBABILITY) {
      const randomEvent = generateRandomEvent()
      addEvent(randomEvent)
    }
  }

  // Генерация случайных событий
  const generateRandomEvent = (): EconomicEvent => {
    const events = [
      {
        name: 'Модная неделя',
        description: 'Повышенный спрос на одежду',
        type: 'positive' as const,
        effects: [{ target: 'demand' as const, value: 0.3, category: 'all' }]
      },
      {
        name: 'Экономический кризис',
        description: 'Снижение покупательной способности',
        type: 'negative' as const,
        effects: [{ target: 'demand' as const, value: -0.2, category: 'all' }]
      },
      {
        name: 'Новый тренд',
        description: 'Популярность определенного стиля',
        type: 'positive' as const,
        effects: [{ target: 'demand' as const, value: 0.4, category: 'dresses' }]
      },
      {
        name: 'Проблемы с поставками',
        description: 'Рост цен на материалы',
        type: 'negative' as const,
        effects: [{ target: 'price' as const, value: 0.2, category: 'materials' }]
      }
    ]

    const randomEvent = events[Math.floor(Math.random() * events.length)]
    return {
      id: `event_${Date.now()}`,
      name: randomEvent.name,
      description: randomEvent.description,
      type: randomEvent.type,
      effects: randomEvent.effects,
      duration: Math.floor(Math.random() * 5) + 3 // 3-8 дней
    }
  }

  // Расчет цены с учетом всех модификаторов
  const calculatePrice = (basePrice: number, category: string): number => {
    let price = basePrice

    // Применяем инфляцию
    price *= (1 + economyState.value.inflation)

    // Применяем сезонные модификаторы
    const seasonMod = seasonModifiers[economyState.value.season]
    price *= seasonMod.price

    // Применяем рыночные тренды
    const relevantTrends = economyState.value.marketTrends.filter(
      trend => trend.category === category || trend.category === 'all'
    )

    for (const trend of relevantTrends) {
      if (trend.direction === 'up') {
        price *= (1 + trend.strength)
      } else if (trend.direction === 'down') {
        price *= (1 - trend.strength)
      }
    }

    // Применяем события
    for (const event of economyState.value.events) {
      for (const effect of event.effects) {
        if (effect.target === 'price' && (!effect.category || effect.category === category)) {
          price *= (1 + effect.value)
        }
      }
    }

    return Math.round(price)
  }

  // Расчет спроса с учетом всех модификаторов
  const calculateDemand = (baseDemand: number, category: string): number => {
    let demand = baseDemand

    // Применяем сезонные модификаторы
    const seasonMod = seasonModifiers[economyState.value.season]
    demand *= seasonMod.demand

    // Применяем рыночные тренды
    const relevantTrends = economyState.value.marketTrends.filter(
      trend => trend.category === category || trend.category === 'all'
    )

    for (const trend of relevantTrends) {
      if (trend.direction === 'up') {
        demand *= (1 + trend.strength)
      } else if (trend.direction === 'down') {
        demand *= (1 - trend.strength)
      }
    }

    // Применяем события
    for (const event of economyState.value.events) {
      for (const effect of event.effects) {
        if (effect.target === 'demand' && (!effect.category || effect.category === category)) {
          demand *= (1 + effect.value)
        }
      }
    }

    return Math.max(0, Math.min(2, demand)) // Ограничиваем от 0 до 2
  }

  // Ежедневное обновление экономики
  const dailyUpdate = () => {
    updateMarketTrends()
    updateInflation()
    updateEvents()
  }

  // Сброс экономики
  const resetEconomy = () => {
    economyState.value = {
      marketTrends: [],
      inflation: 0,
      season: 'spring',
      events: []
    }
  }

  return {
    // Состояние
    economyState,
    marketTrends,
    inflation,
    season,
    events,
    
    // Действия
    addMarketTrend,
    updateMarketTrends,
    updateInflation,
    changeSeason,
    getNextSeason,
    addEvent,
    removeEvent,
    updateEvents,
    calculatePrice,
    calculateDemand,
    dailyUpdate,
    resetEconomy
  }
})
