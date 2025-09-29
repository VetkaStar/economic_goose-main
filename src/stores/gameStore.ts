import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GameState } from '@/types/game'
import { GAME_CONFIG } from '@/config/gameConfig'

export const useGameStore = defineStore('game', () => {
  // Основное состояние игры
  const gameState = ref<GameState>({
    player: {
      id: 'player_1',
      name: 'Гусь-Модник',
      money: GAME_CONFIG.STARTING_MONEY,
      reputation: GAME_CONFIG.STARTING_REPUTATION,
      level: 1,
      experience: 0,
      inventory: [],
      business: {
        id: 'business_1',
        name: 'Гусиная Мода',
        type: 'boutique',
        level: 1,
        employees: [],
        products: [],
        dailyRevenue: 0,
        dailyExpenses: 0,
        location: { x: 100, y: 100, name: 'Главная улица', type: 'city' }
      },
      achievements: []
    },
    economy: {
      marketTrends: [],
      inflation: 0,
      season: 'spring',
      events: []
    },
    gameTime: 0,
    level: 1,
    experience: 0
  })

  // Вычисляемые свойства
  const player = computed(() => gameState.value.player)
  const business = computed(() => gameState.value.player.business)
  const economy = computed(() => gameState.value.economy)
  const money = computed(() => gameState.value.player.money)
  const reputation = computed(() => gameState.value.player.reputation)
  const level = computed(() => gameState.value.player.level)
  const experience = computed(() => gameState.value.player.experience)

  // Действия для управления деньгами
  const addMoney = (amount: number) => {
    gameState.value.player.money += amount
  }

  const spendMoney = (amount: number): boolean => {
    if (gameState.value.player.money >= amount) {
      gameState.value.player.money -= amount
      return true
    }
    return false
  }

  // Действия для управления репутацией
  const addReputation = (amount: number) => {
    gameState.value.player.reputation += amount
  }

  const loseReputation = (amount: number) => {
    gameState.value.player.reputation = Math.max(0, gameState.value.player.reputation - amount)
  }

  // Действия для управления опытом и уровнем
  const addExperience = (amount: number) => {
    gameState.value.player.experience += amount
    checkLevelUp()
  }

  const checkLevelUp = () => {
    const requiredExp = GAME_CONFIG.EXPERIENCE_PER_LEVEL * gameState.value.player.level
    if (gameState.value.player.experience >= requiredExp) {
      levelUp()
    }
  }

  const levelUp = () => {
    gameState.value.player.level += 1
    gameState.value.player.experience -= GAME_CONFIG.EXPERIENCE_PER_LEVEL * (gameState.value.player.level - 1)
    
    // Бонусы за повышение уровня
    const levelBonus = gameState.value.player.level * 100
    addMoney(levelBonus)
    addReputation(levelBonus / 10)
    
    // Проверяем, нужно ли еще повышение уровня
    checkLevelUp()
  }

  // Действия для управления бизнесом
  const updateBusinessRevenue = (revenue: number) => {
    gameState.value.player.business.dailyRevenue += revenue
  }

  const updateBusinessExpenses = (expenses: number) => {
    gameState.value.player.business.dailyExpenses += expenses
  }

  const upgradeBusiness = (cost: number): boolean => {
    if (spendMoney(cost)) {
      gameState.value.player.business.level += 1
      return true
    }
    return false
  }

  // Действия для управления временем игры
  const updateGameTime = (deltaTime: number) => {
    gameState.value.gameTime += deltaTime
  }

  // Действия для сброса игры
  const resetGame = () => {
    gameState.value = {
      player: {
        id: 'player_1',
        name: 'Гусь-Модник',
        money: GAME_CONFIG.STARTING_MONEY,
        reputation: GAME_CONFIG.STARTING_REPUTATION,
        level: 1,
        experience: 0,
        inventory: [],
        business: {
          id: 'business_1',
          name: 'Гусиная Мода',
          type: 'boutique',
          level: 1,
          employees: [],
          products: [],
          dailyRevenue: 0,
          dailyExpenses: 0,
          location: { x: 100, y: 100, name: 'Главная улица', type: 'city' }
        },
        achievements: []
      },
      economy: {
        marketTrends: [],
        inflation: 0,
        season: 'spring',
        events: []
      },
      gameTime: 0,
      level: 1,
      experience: 0
    }
  }

  // Действия для сохранения и загрузки
  const saveGame = () => {
    const saveData = {
      gameState: gameState.value,
      timestamp: Date.now()
    }
    localStorage.setItem('fashion_goose_save', JSON.stringify(saveData))
  }

  const loadGame = (): boolean => {
    const saveData = localStorage.getItem('fashion_goose_save')
    if (saveData) {
      try {
        const parsed = JSON.parse(saveData)
        gameState.value = parsed.gameState
        return true
      } catch (error) {
        console.error('Ошибка загрузки сохранения:', error)
        return false
      }
    }
    return false
  }

  return {
    // Состояние
    gameState,
    player,
    business,
    economy,
    money,
    reputation,
    level,
    experience,
    
    // Действия
    addMoney,
    spendMoney,
    addReputation,
    loseReputation,
    addExperience,
    updateBusinessRevenue,
    updateBusinessExpenses,
    upgradeBusiness,
    updateGameTime,
    resetGame,
    saveGame,
    loadGame
  }
})
