import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CompanyState, RentablePlace } from '@/types/company'
import { useGameStore } from '@/stores/gameStore'
import { useAuthStore } from '@/stores/authStore'

const DEFAULT_RENT_COST: Record<RentablePlace, number> = {
  warehouse: 3000,
  atelier: 2500,
  market: 2000,
}

const DEFAULT_DAILY_FEES: Record<RentablePlace, number> = {
  warehouse: 500,
  atelier: 400,
  market: 300,
}

export const useCompanyStore = defineStore('company', () => {
  const game = useGameStore()
  const auth = useAuthStore()

  const state = ref<CompanyState>({
    location: {
      currentPointId: 7, // дом гуся — старт
      discoveredPoints: [7],
    },
    rent: {
      isRented: { warehouse: false, atelier: false, market: false },
      rentCosts: { ...DEFAULT_RENT_COST },
      dailyFees: { ...DEFAULT_DAILY_FEES },
    },
    progress: {
      level: 1,
      experience: 0,
    },
    stats: {
      ordersCompleted: 0,
      ordersEarnings: 0,
      ordersExperience: 0,
    },
    // Емкости: мини-склад дома и арендованный склад
    capacities: {
      homePantry: { materialsSlots: 10, productsSlots: 10 },
      warehouse: { level: 0, slots: 0 },
    },
  })

  // -- Персист состояния (localStorage пока; позже перенесем в Supabase) --
  const STORAGE_KEY = computed(() => `company_state_${auth.user?.id || 'guest'}`)
  function saveState() {
    try { localStorage.setItem(STORAGE_KEY.value, JSON.stringify(state.value)) } catch {}
  }
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY.value)
      if (raw) {
        const parsed = JSON.parse(raw)
        // Миграция: добавляем недостающие поля
        if (!parsed.stats) {
          parsed.stats = {
            ordersCompleted: 0,
            ordersEarnings: 0,
            ordersExperience: 0
          }
        }
        state.value = { ...state.value, ...parsed }
      }
    } catch {}
  }
  // Загружаем при инициализации
  loadState()

  // Компьютед-доступ к арендам
  const isWarehouseAvailable = computed(() => state.value.rent.isRented.warehouse)
  const isAtelierAvailable = computed(() => state.value.rent.isRented.atelier)
  const isMarketAvailable = computed(() => state.value.rent.isRented.market)

  // Аренда места: списывает деньги через gameStore
  async function rent(place: RentablePlace): Promise<boolean> {
    if (state.value.rent.isRented[place]) return true
    const cost = state.value.rent.rentCosts[place]
    const paid = auth.isAuthenticated ? await auth.spendMoney(cost) : game.spendMoney(cost)
    if (paid) {
      state.value.rent.isRented[place] = true
      if (place === 'warehouse') {
        // Базовая емкость склада при первой аренде
        state.value.capacities.warehouse.level = 1
        state.value.capacities.warehouse.slots = 20
      }
      saveState()
      return true
    }
    return false
  }

  // Отмена аренды (без возврата, можно добавить штрафы/частичный возврат)
  function cancelRent(place: RentablePlace) {
    state.value.rent.isRented[place] = false
  }

  // Ежедневные платежи — вызывается таймером дня (или игровым тиком)
  function chargeDailyFees() {
    let total = 0
    for (const p of Object.keys(state.value.rent.isRented) as RentablePlace[]) {
      if (state.value.rent.isRented[p]) total += state.value.rent.dailyFees[p]
    }
    if (total > 0) {
      if (auth.isAuthenticated) { auth.spendMoney(total) } else { game.spendMoney(total) }
      saveState()
    }
  }

  // Перемещение по карте
  function moveToPoint(pointId: number) {
    state.value.location.currentPointId = pointId
    if (!state.value.location.discoveredPoints.includes(pointId)) {
      state.value.location.discoveredPoints.push(pointId)
    }
    saveState()
  }

  // Прогрессия компании
  function addCompanyExp(amount: number) {
    state.value.progress.experience += amount
    checkCompanyLevelUp()
    saveState()
  }

  function addOrderStats(earnings: number, experience: number) {
    state.value.stats.ordersCompleted += 1
    state.value.stats.ordersEarnings += earnings
    state.value.stats.ordersExperience += experience
    saveState()
  }

  function checkCompanyLevelUp() {
    const required = 100 + (state.value.progress.level - 1) * 50
    if (state.value.progress.experience >= required) {
      state.value.progress.level += 1
      state.value.progress.experience -= required
      // Небольшой бонус — синергия с общим уровнем игрока
      game.addReputation(2)
    }
  }

  // Доступ к действиям по месту
  function canUseWarehouse() { return isWarehouseAvailable.value }
  function canUseAtelier() { return isAtelierAvailable.value }
  function canUseMarket() { return isMarketAvailable.value }

  return {
    state,
    isWarehouseAvailable,
    isAtelierAvailable,
    isMarketAvailable,
    rent,
    cancelRent,
    chargeDailyFees,
    moveToPoint,
    addCompanyExp,
    addOrderStats,
    canUseWarehouse,
    canUseAtelier,
    canUseMarket,
    // апгрейд склада (+20 слотов за уровень, цена та же, можно вынести в баланс)
    async upgradeWarehouse() {
      if (!state.value.rent.isRented.warehouse) return false
      const cost = state.value.rent.rentCosts.warehouse
      const paid = auth.isAuthenticated ? await auth.spendMoney(cost) : game.spendMoney(cost)
      if (!paid) return false
      state.value.capacities.warehouse.level += 1
      state.value.capacities.warehouse.slots += 20
      saveState()
      return true
    },

    // Сброс состояния компании к начальному
    resetState() {
      state.value = {
        location: {
          currentPointId: 7, // дом гуся — старт
          discoveredPoints: [7],
        },
        rent: {
          isRented: { warehouse: false, atelier: false, market: false },
          rentCosts: { ...DEFAULT_RENT_COST },
          dailyFees: { ...DEFAULT_DAILY_FEES },
        },
        progress: {
          level: 1,
          experience: 0,
        },
        capacities: {
          homePantry: { materialsSlots: 10, productsSlots: 10 },
          warehouse: { level: 0, slots: 0 },
        },
      }
      saveState()
    }
  }
})


