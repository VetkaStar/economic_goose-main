import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './authStore'
import { useCompanyStore } from './companyStore'
import { useWarehouseStore } from './warehouseStore'
import { useTraderStore } from './traderStore'
import { useSocialStore } from './socialStore'

export interface DailyReport {
  day: number
  income: {
    sales: number
    orders: number // Доходы с заказов из социальной сети
    rent: number
    investments: number
    total: number
  }
  expenses: {
    rent: number
    materials: number
    purchases: number // Покупки материалов
    salaries: number
    taxes: number
    total: number
  }
  production: {
    itemsProduced: number
    materialsUsed: number
    quality: number
  }
  orders: {
    completed: number
    failed: number
    totalEarnings: number
  }
  netProfit: number
  balance: number
}

export const useEconomyStore = defineStore('economy', () => {
  // Сторы
  const authStore = useAuthStore()
  const companyStore = useCompanyStore()
  const warehouseStore = useWarehouseStore()
  const traderStore = useTraderStore()
  const socialStore = useSocialStore()

  // Состояние
  const dailyReports = ref<DailyReport[]>([])
  const isProcessing = ref(false)

  // Настройки экономики (пока отключены)
  const economySettings = ref({
    baseSalesPerDay: 0, // Пока нет продаж
    dailyRentCost: 0, // Пока нет аренды
    materialCostPerItem: 0, // Пока нет производства
    taxRate: 0, // Пока нет налогов
    itemsPerDay: 0 // Пока нет производства
  })

  // Вычисляемые свойства
  const lastReport = computed(() => {
    return dailyReports.value[dailyReports.value.length - 1] || null
  })

  const totalProfit = computed(() => {
    return dailyReports.value.reduce((sum, report) => sum + report.netProfit, 0)
  })

  // Основная функция обработки дневных расчётов
  const processDailyCalculations = async (targetDay?: number): Promise<DailyReport> => {
    if (isProcessing.value) {
      throw new Error('Расчёты уже выполняются')
    }

    isProcessing.value = true

    try {
      const currentDay = targetDay || traderStore.currentDay
      console.log('🔄 Создаем отчет для дня:', currentDay)
      
      // Проверяем, не существует ли уже отчет для этого дня
      const existingReport = dailyReports.value.find(r => r.day === currentDay)
      if (existingReport) {
        console.log('⚠️ Отчет для дня', currentDay, 'уже существует')
        return existingReport
      }
      
      const report: DailyReport = {
        day: currentDay,
        income: { sales: 0, orders: 0, rent: 0, investments: 0, total: 0 },
        expenses: { rent: 0, materials: 0, purchases: 0, salaries: 0, taxes: 0, total: 0 },
        production: { itemsProduced: 0, materialsUsed: 0, quality: 0 },
        orders: { completed: 0, failed: 0, totalEarnings: 0 },
        netProfit: 0,
        balance: authStore.user?.money || 0
      }

      // 1. РАСХОДЫ
      await processExpenses(report)

      // 2. ПРОИЗВОДСТВО
      await processProduction(report)

      // 3. ДОХОДЫ
      await processIncome(report)

      // 4. НАЛОГИ
      await processTaxes(report)

      // 5. ИТОГОВЫЕ РАСЧЁТЫ
      report.netProfit = report.income.total - report.expenses.total
      report.balance = (authStore.user?.money || 0) + report.netProfit

      // 6. ОБНОВЛЕНИЕ БАЛАНСА
      if (report.netProfit !== 0) {
        await authStore.addMoney(report.netProfit)
      }

      // 7. СОХРАНЕНИЕ ОТЧЁТА
      dailyReports.value.push(report)

      // 8. ОБНОВЛЕНИЕ ТОРГОВЦЕВ
      traderStore.nextDay()

      return report
    } finally {
      isProcessing.value = false
    }
  }

  // Обработка расходов
  const processExpenses = async (report: DailyReport) => {
    const { rent } = companyStore.state

    // Аренда
    if (rent.isRented.warehouse) {
      report.expenses.rent += rent.rentCosts.warehouse / 30
    }
    if (rent.isRented.atelier) {
      report.expenses.rent += rent.rentCosts.atelier / 30
    }
    if (rent.isRented.market) {
      report.expenses.rent += rent.rentCosts.market / 30
    }

    // Материалы для производства
    report.expenses.materials = economySettings.value.materialCostPerItem * 
                               economySettings.value.itemsPerDay

    // Покупки материалов (пока заглушка - можно добавить отслеживание покупок из MarketModal)
    report.expenses.purchases = 0 // TODO: Собирать данные о покупках материалов

    report.expenses.total = report.expenses.rent + report.expenses.materials + report.expenses.purchases
  }

  // Обработка производства
  const processProduction = async (report: DailyReport) => {
    if (!companyStore.canUseAtelier()) {
      return
    }

    report.production.itemsProduced = economySettings.value.itemsPerDay
    report.production.materialsUsed = report.production.itemsProduced * 2
    report.production.quality = 3 // Базовая качество
  }

  // Обработка доходов
  const processIncome = async (report: DailyReport) => {
    // Доходы с заказов из социальной сети
    const todayOrders = socialStore.takenOrders.filter(order => {
      const orderDate = new Date(order.takenAt)
      const today = new Date()
      return orderDate.toDateString() === today.toDateString() && order.status === 'completed'
    })
    
    report.orders.completed = todayOrders.length
    report.orders.failed = socialStore.takenOrders.filter(order => {
      const orderDate = new Date(order.takenAt)
      const today = new Date()
      return orderDate.toDateString() === today.toDateString() && order.status === 'failed'
    }).length
    
    report.orders.totalEarnings = todayOrders.reduce((sum, order) => {
      return sum + (order.quantity * order.pricePerUnit)
    }, 0)
    
    report.income.orders = report.orders.totalEarnings
    
    // Обычные продажи (пока заглушка)
    let salesIncome = economySettings.value.baseSalesPerDay
    const qualityMultiplier = 1 + (report.production.quality - 2) * 0.2
    salesIncome *= qualityMultiplier
    report.income.sales = Math.round(salesIncome)
    
    report.income.total = report.income.sales + report.income.orders
  }

  // Обработка налогов
  const processTaxes = async (report: DailyReport) => {
    const taxableIncome = Math.max(0, report.income.total - report.expenses.materials)
    report.expenses.taxes = Math.round(taxableIncome * economySettings.value.taxRate)
    report.expenses.total += report.expenses.taxes
  }

  return {
    dailyReports,
    isProcessing,
    economySettings,
    lastReport,
    totalProfit,
    processDailyCalculations
  }
})