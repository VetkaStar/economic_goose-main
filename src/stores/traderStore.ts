import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Trader, TraderMaterial, MarketState } from '@/types/traders'

export const useTraderStore = defineStore('trader', () => {
  // Состояние рынка
  const marketState = ref<MarketState>({
    currentDay: 1,
    activeTraders: [],
    traderHistory: [],
    marketTrends: {
      demandMultiplier: 1.0,
      priceFluctuation: 0.0,
      rareMaterialChance: 0.1
    }
  })

  // Базовые торговцы
  const baseTraders: Trader[] = [
    {
      id: 'textile_master',
      name: 'Мастер Тканей',
      description: 'Специализируется на редких тканях и материалах',
      icon: '🧵',
      rarity: 'common',
      arrivalTime: 1,
      departureTime: 3,
      reputation: 75,
      materials: []
    },
    {
      id: 'accessory_dealer',
      name: 'Торговец Аксессуарами',
      description: 'Привозит уникальные пуговицы, молнии и фурнитуру',
      icon: '💎',
      rarity: 'rare',
      arrivalTime: 2,
      departureTime: 5,
      reputation: 60,
      materials: []
    },
    {
      id: 'exotic_merchant',
      name: 'Экзотический Купец',
      description: 'Редкие материалы из далёких стран',
      icon: '🌍',
      rarity: 'epic',
      arrivalTime: 4,
      departureTime: 7,
      reputation: 90,
      materials: []
    },
    {
      id: 'legendary_craftsman',
      name: 'Легендарный Мастер',
      description: 'Самые редкие и ценные материалы',
      icon: '👑',
      rarity: 'legendary',
      arrivalTime: 8,
      departureTime: 10,
      reputation: 100,
      materials: []
    }
  ]

  // Базовые материалы торговцев
  const baseMaterials: TraderMaterial[] = [
    // Обычные ткани
    {
      id: 'silk_fabric',
      name: 'Шёлковая ткань',
      description: 'Высококачественный шёлк для элитной одежды',
      icon: '🕸️',
      category: 'fabric',
      rarity: 'common',
      basePrice: 500,
      quantity: 10,
      maxQuantity: 20,
      quality: 3,
      effects: [
        { type: 'quality_boost', value: 0.15, description: '+15% к качеству' }
      ]
    },
    {
      id: 'cashmere_wool',
      name: 'Кашемировая шерсть',
      description: 'Мягкая и тёплая шерсть для зимней коллекции',
      icon: '🐑',
      category: 'fabric',
      rarity: 'rare',
      basePrice: 800,
      quantity: 5,
      maxQuantity: 10,
      quality: 4,
      effects: [
        { type: 'quality_boost', value: 0.25, description: '+25% к качеству' },
        { type: 'cost_reduction', value: 0.1, description: '-10% к стоимости производства' }
      ]
    },
    // Аксессуары
    {
      id: 'golden_buttons',
      name: 'Золотые пуговицы',
      description: 'Роскошные пуговицы с позолотой',
      icon: '🔘',
      category: 'accessories',
      rarity: 'rare',
      basePrice: 200,
      quantity: 15,
      maxQuantity: 30,
      quality: 4,
      effects: [
        { type: 'quality_boost', value: 0.2, description: '+20% к качеству' }
      ]
    },
    {
      id: 'diamond_zipper',
      name: 'Молния с бриллиантами',
      description: 'Эксклюзивная молния с инкрустированными камнями',
      icon: '💎',
      category: 'accessories',
      rarity: 'epic',
      basePrice: 1500,
      quantity: 3,
      maxQuantity: 5,
      quality: 5,
      effects: [
        { type: 'quality_boost', value: 0.4, description: '+40% к качеству' },
        { type: 'special', value: 1, description: 'Уникальный дизайн' }
      ]
    },
    // Инструменты
    {
      id: 'precision_scissors',
      name: 'Точные ножницы',
      description: 'Профессиональные ножницы для идеальной резки',
      icon: '✂️',
      category: 'tools',
      rarity: 'common',
      basePrice: 300,
      quantity: 8,
      maxQuantity: 15,
      quality: 3,
      effects: [
        { type: 'production_speed', value: 0.2, description: '+20% к скорости производства' }
      ]
    },
    {
      id: 'magic_needle',
      name: 'Волшебная игла',
      description: 'Легендарная игла, которая никогда не ломается',
      icon: '🪡',
      category: 'tools',
      rarity: 'legendary',
      basePrice: 5000,
      quantity: 1,
      maxQuantity: 1,
      quality: 5,
      effects: [
        { type: 'production_speed', value: 0.5, description: '+50% к скорости производства' },
        { type: 'quality_boost', value: 0.3, description: '+30% к качеству' },
        { type: 'special', value: 1, description: 'Вечная игла' }
      ]
    }
  ]

  // Вычисляемые свойства
  const activeTraders = computed(() => marketState.value.activeTraders)
  const currentDay = computed(() => marketState.value.currentDay)
  const marketTrends = computed(() => marketState.value.marketTrends)

  // Инициализация торговцев с материалами
  function initializeTraders() {
    baseTraders.forEach(trader => {
      // Назначаем материалы каждому торговцу в зависимости от его типа
      const traderMaterials = getTraderMaterials(trader.id)
      trader.materials = traderMaterials.map(material => ({
        ...material,
        basePrice: Math.round(material.basePrice * (1 + marketState.value.marketTrends.priceFluctuation))
      }))
    })
  }

  // Получение материалов для конкретного торговца
  function getTraderMaterials(traderId: string): TraderMaterial[] {
    const materials: TraderMaterial[] = []
    
    switch (traderId) {
      case 'textile_master':
        materials.push(
          baseMaterials.find(m => m.id === 'silk_fabric')!,
          baseMaterials.find(m => m.id === 'cashmere_wool')!
        )
        break
      case 'accessory_dealer':
        materials.push(
          baseMaterials.find(m => m.id === 'golden_buttons')!,
          baseMaterials.find(m => m.id === 'diamond_zipper')!
        )
        break
      case 'exotic_merchant':
        materials.push(
          baseMaterials.find(m => m.id === 'diamond_zipper')!,
          baseMaterials.find(m => m.id === 'precision_scissors')!
        )
        break
      case 'legendary_craftsman':
        materials.push(
          baseMaterials.find(m => m.id === 'magic_needle')!
        )
        break
    }
    
    return materials
  }

  // Обновление активных торговцев
  function updateActiveTraders() {
    const active: Trader[] = []
    
    baseTraders.forEach(trader => {
      if (marketState.value.currentDay >= trader.arrivalTime && 
          marketState.value.currentDay <= trader.departureTime) {
        active.push(trader)
      }
    })
    
    marketState.value.activeTraders = active
  }

  // Покупка материала у торговца
  async function buyMaterial(traderId: string, materialId: string, quantity: number): Promise<boolean> {
    const trader = marketState.value.activeTraders.find(t => t.id === traderId)
    if (!trader) return false
    
    const material = trader.materials.find(m => m.id === materialId)
    if (!material || material.quantity < quantity) return false
    
    const totalPrice = material.basePrice * quantity
    
    // Импортируем authStore для проверки баланса и списания денег
    const { useAuthStore } = await import('@/stores/authStore')
    const authStore = useAuthStore()
    
    // Проверяем баланс и списываем деньги
    if (!authStore.user || authStore.user.money < totalPrice) {
      return false
    }
    
    const success = await authStore.spendMoney(totalPrice)
    if (!success) return false
    
    // Уменьшаем количество материала
    material.quantity -= quantity
    
    // Добавляем материал в правильное хранилище (кладовая или склад)
    const { useWarehouseStore } = await import('@/stores/warehouseStore')
    const warehouseStore = useWarehouseStore()
    await warehouseStore.addMaterialToCorrectStorage(materialId, quantity)
    
    // Записываем в историю
    const existingVisit = marketState.value.traderHistory.find(v => 
      v.traderId === traderId && v.day === marketState.value.currentDay
    )
    
    if (existingVisit) {
      existingVisit.materialsSold.push(materialId)
      existingVisit.totalSpent += totalPrice
    } else {
      marketState.value.traderHistory.push({
        traderId,
        day: marketState.value.currentDay,
        materialsSold: [materialId],
        totalSpent: totalPrice
      })
    }
    
    return true
  }

  // Переход к следующему дню
  function nextDay() {
    marketState.value.currentDay++
    updateActiveTraders()
    updateMarketTrends()
  }

  // Обновление рыночных трендов
  function updateMarketTrends() {
    // Случайные колебания трендов
    marketState.value.marketTrends.demandMultiplier = 0.8 + Math.random() * 0.4 // 0.8-1.2
    marketState.value.marketTrends.priceFluctuation = -0.2 + Math.random() * 0.4 // -0.2 до +0.2
    marketState.value.marketTrends.rareMaterialChance = 0.05 + Math.random() * 0.1 // 0.05-0.15
  }

  // Инициализация при создании стора
  initializeTraders()
  updateActiveTraders()

  return {
    marketState,
    activeTraders,
    currentDay,
    marketTrends,
    buyMaterial,
    nextDay,
    updateActiveTraders
  }
})
