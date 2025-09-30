import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CompanyState, RentablePlace } from '@/types/company'
import { useGameStore } from '@/stores/gameStore'

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
  })

  // Компьютед-доступ к арендам
  const isWarehouseAvailable = computed(() => state.value.rent.isRented.warehouse)
  const isAtelierAvailable = computed(() => state.value.rent.isRented.atelier)
  const isMarketAvailable = computed(() => state.value.rent.isRented.market)

  // Аренда места: списывает деньги через gameStore
  function rent(place: RentablePlace): boolean {
    if (state.value.rent.isRented[place]) return true
    const cost = state.value.rent.rentCosts[place]
    if (game.spendMoney(cost)) {
      state.value.rent.isRented[place] = true
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
    if (total > 0) game.spendMoney(total)
  }

  // Перемещение по карте
  function moveToPoint(pointId: number) {
    state.value.location.currentPointId = pointId
    if (!state.value.location.discoveredPoints.includes(pointId)) {
      state.value.location.discoveredPoints.push(pointId)
    }
  }

  // Прогрессия компании
  function addCompanyExp(amount: number) {
    state.value.progress.experience += amount
    checkCompanyLevelUp()
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
    canUseWarehouse,
    canUseAtelier,
    canUseMarket,
  }
})


