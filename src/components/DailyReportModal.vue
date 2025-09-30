<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal daily-report-modal">
      <div class="modal-header">
        <h2 class="menu-title">📊 Дневной отчёт</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      
      <div class="modal-content">
        <div v-if="!report" class="no-report">
          <div class="no-report-icon">📊</div>
          <h3>Отчёт за день {{ day }}</h3>
          <p>Дневные отчёты пока не реализованы</p>
          <p class="no-report-note">Экономическая система будет добавлена в следующих обновлениях</p>
        </div>
        
        <div v-else class="report-content">
          <!-- Заголовок отчёта -->
          <div class="report-header">
            <h3>День {{ report.day }}</h3>
            <div class="report-summary">
              <div class="summary-item" :class="report.netProfit >= 0 ? 'positive' : 'negative'">
                <span class="summary-label">Итоговая прибыль:</span>
                <span class="summary-value">
                  {{ report.netProfit >= 0 ? '+' : '' }}₽{{ report.netProfit.toLocaleString() }}
                </span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Баланс:</span>
                <span class="summary-value">₽{{ report.balance.toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <!-- Доходы -->
          <div class="report-section">
            <h4 class="section-title">📈 Доходы</h4>
            <div class="section-content">
              <div class="income-item">
                <span class="item-label">Продажи:</span>
                <span class="item-value positive">+₽{{ report.income.sales.toLocaleString() }}</span>
              </div>
              <div class="income-item">
                <span class="item-label">Аренда:</span>
                <span class="item-value positive">+₽{{ report.income.rent.toLocaleString() }}</span>
              </div>
              <div class="income-item">
                <span class="item-label">Инвестиции:</span>
                <span class="item-value positive">+₽{{ report.income.investments.toLocaleString() }}</span>
              </div>
              <div class="income-total">
                <span class="total-label">Всего доходов:</span>
                <span class="total-value positive">+₽{{ report.income.total.toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <!-- Расходы -->
          <div class="report-section">
            <h4 class="section-title">📉 Расходы</h4>
            <div class="section-content">
              <div class="expense-item">
                <span class="item-label">Аренда:</span>
                <span class="item-value negative">-₽{{ report.expenses.rent.toLocaleString() }}</span>
              </div>
              <div class="expense-item">
                <span class="item-label">Материалы:</span>
                <span class="item-value negative">-₽{{ report.expenses.materials.toLocaleString() }}</span>
              </div>
              <div class="expense-item">
                <span class="item-label">Зарплаты:</span>
                <span class="item-value negative">-₽{{ report.expenses.salaries.toLocaleString() }}</span>
              </div>
              <div class="expense-item">
                <span class="item-label">Налоги:</span>
                <span class="item-value negative">-₽{{ report.expenses.taxes.toLocaleString() }}</span>
              </div>
              <div class="expense-total">
                <span class="total-label">Всего расходов:</span>
                <span class="total-value negative">-₽{{ report.expenses.total.toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <!-- Производство -->
          <div class="report-section">
            <h4 class="section-title">🏭 Производство</h4>
            <div class="section-content">
              <div class="production-item">
                <span class="item-label">Произведено предметов:</span>
                <span class="item-value">{{ report.production.itemsProduced }}</span>
              </div>
              <div class="production-item">
                <span class="item-label">Использовано материалов:</span>
                <span class="item-value">{{ report.production.materialsUsed }}</span>
              </div>
              <div class="production-item">
                <span class="item-label">Среднее качество:</span>
                <span class="item-value quality">{{ report.production.quality.toFixed(1) }}</span>
              </div>
            </div>
          </div>

          <!-- График прибыли -->
          <div class="report-section">
            <h4 class="section-title">📊 График прибыли</h4>
            <div class="profit-chart">
              <div class="chart-bars">
                <div 
                  v-for="(dayReport, index) in lastWeekReports" 
                  :key="dayReport.day"
                  class="chart-bar"
                  :class="{ active: dayReport.day === report.day }"
                  :style="{ height: getBarHeight(dayReport.netProfit) + '%' }"
                >
                  <div class="bar-value">{{ dayReport.netProfit >= 0 ? '+' : '' }}{{ dayReport.netProfit }}</div>
                  <div class="bar-day">Д{{ dayReport.day }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEconomyStore } from '@/stores/economyStore'
import type { DailyReport } from '@/stores/economyStore'

// Пропсы
interface Props {
  day: number
}

const props = defineProps<Props>()

// Эмиты
const emit = defineEmits<{
  close: []
}>()

// Сторы
const economyStore = useEconomyStore()

// Вычисляемые свойства
const report = computed(() => {
  return economyStore.dailyReports.find(r => r.day === props.day) || null
})

const lastWeekReports = computed(() => {
  const reports = economyStore.dailyReports
  const startDay = Math.max(1, props.day - 6)
  return reports.filter(r => r.day >= startDay && r.day <= props.day)
})

const maxProfit = computed(() => {
  if (lastWeekReports.value.length === 0) return 1000
  const profits = lastWeekReports.value.map(r => Math.abs(r.netProfit))
  return Math.max(...profits, 1000)
})

// Методы
const getBarHeight = (profit: number) => {
  if (maxProfit.value === 0) return 0
  return Math.max(5, (Math.abs(profit) / maxProfit.value) * 100)
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
@import '@/styles/colors.css';
@import '@/styles/menu-common.css';

.daily-report-modal {
  background: var(--color-bg-menu, #F4E6D1);
  border-radius: clamp(15px, 2vw, 30px);
  max-width: 900px;
  width: 95%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 clamp(15px, 3vw, 30px) clamp(40px, 8vw, 80px) var(--shadow-dark, rgba(0, 0, 0, 0.4));
  border: clamp(3px, 0.5vw, 5px) solid var(--color-text, #5D4037);
  position: relative;
  z-index: 10001;
}

.modal-content {
  padding: clamp(20px, 3vw, 40px);
}

/* Заголовок отчёта */
.report-header {
  text-align: center;
  margin-bottom: clamp(25px, 4vw, 35px);
  padding: clamp(20px, 3vw, 30px);
  background: var(--gradient-bg, linear-gradient(135deg, #F4E6D1 0%, #E6D3B7 100%));
  border-radius: clamp(12px, 2vw, 20px);
  border: clamp(2px, 0.3vw, 4px) solid var(--color-buttons, #C85A54);
}

.report-header h3 {
  margin: 0 0 clamp(15px, 2vw, 20px) 0;
  font-size: clamp(1.5rem, 3vw, 2.2rem);
  font-weight: 900;
  color: var(--color-text, #5D4037);
  font-family: 'Orbitron', sans-serif;
}

.report-summary {
  display: flex;
  justify-content: space-around;
  gap: clamp(20px, 3vw, 30px);
  flex-wrap: wrap;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(8px, 1.2vw, 12px);
  padding: clamp(12px, 2vw, 18px);
  background: white;
  border-radius: clamp(8px, 1.2vw, 12px);
  border: clamp(1px, 0.2vw, 2px) solid var(--color-buttons-light, #D4824A);
  min-width: clamp(120px, 15vw, 160px);
}

.summary-label {
  font-size: clamp(0.9rem, 1.6vw, 1.2rem);
  color: var(--color-text, #5D4037);
  opacity: 0.8;
  font-family: 'Orbitron', sans-serif;
}

.summary-value {
  font-size: clamp(1.2rem, 2.2vw, 1.6rem);
  font-weight: 900;
  font-family: 'Orbitron', sans-serif;
}

.summary-value.positive {
  color: #2E7D32;
}

.summary-value.negative {
  color: #C62828;
}

/* Секции отчёта */
.report-section {
  margin-bottom: clamp(25px, 4vw, 35px);
}

.section-title {
  margin: 0 0 clamp(15px, 2vw, 20px) 0;
  font-size: clamp(1.1rem, 2.2vw, 1.6rem);
  color: var(--color-text, #5D4037);
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  border-bottom: clamp(2px, 0.3vw, 3px) solid var(--color-buttons, #C85A54);
  padding-bottom: clamp(8px, 1.2vw, 12px);
}

.section-content {
  background: white;
  border-radius: clamp(8px, 1.2vw, 12px);
  padding: clamp(15px, 2vw, 20px);
  border: clamp(1px, 0.2vw, 2px) solid var(--color-buttons-light, #D4824A);
}

/* Элементы доходов и расходов */
.income-item,
.expense-item,
.production-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(8px, 1.2vw, 12px) 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.income-item:last-child,
.expense-item:last-child,
.production-item:last-child {
  border-bottom: none;
}

.item-label {
  font-size: clamp(0.9rem, 1.6vw, 1.2rem);
  color: var(--color-text, #5D4037);
  font-family: 'Orbitron', sans-serif;
  font-weight: 600;
}

.item-value {
  font-size: clamp(0.9rem, 1.6vw, 1.2rem);
  font-weight: 700;
  font-family: 'Orbitron', sans-serif;
}

.item-value.positive {
  color: #2E7D32;
}

.item-value.negative {
  color: #C62828;
}

.item-value.quality {
  color: var(--color-accents, #C85A54);
}

/* Итоговые суммы */
.income-total,
.expense-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(12px, 1.8vw, 18px) 0;
  margin-top: clamp(8px, 1.2vw, 12px);
  border-top: clamp(2px, 0.3vw, 3px) solid var(--color-buttons, #C85A54);
  font-weight: 900;
  font-family: 'Orbitron', sans-serif;
}

.total-label {
  font-size: clamp(1rem, 1.8vw, 1.3rem);
  color: var(--color-text, #5D4037);
}

.total-value {
  font-size: clamp(1.1rem, 2vw, 1.4rem);
}

.total-value.positive {
  color: #2E7D32;
}

.total-value.negative {
  color: #C62828;
}

/* График прибыли */
.profit-chart {
  background: white;
  border-radius: clamp(8px, 1.2vw, 12px);
  padding: clamp(15px, 2vw, 20px);
  border: clamp(1px, 0.2vw, 2px) solid var(--color-buttons-light, #D4824A);
}

.chart-bars {
  display: flex;
  align-items: end;
  gap: clamp(8px, 1.2vw, 12px);
  height: clamp(120px, 20vw, 160px);
  padding: clamp(10px, 1.5vw, 15px) 0;
}

.chart-bar {
  flex: 1;
  background: var(--gradient-accents, linear-gradient(135deg, #C85A54 0%, #D4824A 100%));
  border-radius: clamp(4px, 0.6vw, 6px) clamp(4px, 0.6vw, 6px) 0 0;
  position: relative;
  transition: all 0.3s ease;
  min-height: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding: clamp(4px, 0.8vw, 6px);
}

.chart-bar:hover {
  transform: scale(1.05);
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(8px, 1.6vw, 16px) var(--shadow-medium, rgba(0,0,0,0.2));
}

.chart-bar.active {
  background: var(--gradient-buttons, linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%));
  box-shadow: 0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-medium, rgba(0,0,0,0.2));
}

.bar-value {
  position: absolute;
  top: clamp(-20px, -3vw, -15px);
  font-size: clamp(0.7rem, 1.2vw, 0.9rem);
  font-weight: 700;
  color: var(--color-text, #5D4037);
  font-family: 'Orbitron', sans-serif;
  white-space: nowrap;
}

.bar-day {
  font-size: clamp(0.6rem, 1vw, 0.8rem);
  color: white;
  font-weight: 700;
  font-family: 'Orbitron', sans-serif;
  margin-top: clamp(4px, 0.8vw, 6px);
}

/* Нет отчёта */
.no-report {
  text-align: center;
  padding: clamp(40px, 6vw, 60px);
  color: var(--color-text, #5D4037);
  font-family: 'Orbitron', sans-serif;
}

.no-report-icon {
  font-size: clamp(3rem, 6vw, 4rem);
  margin-bottom: clamp(20px, 3vw, 30px);
  opacity: 0.7;
}

.no-report h3 {
  margin: 0 0 clamp(15px, 2vw, 20px) 0;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 900;
  color: var(--color-text, #5D4037);
}

.no-report p {
  margin: 0 0 clamp(10px, 1.5vw, 15px) 0;
  font-size: clamp(1rem, 2vw, 1.4rem);
  opacity: 0.8;
}

.no-report-note {
  font-size: clamp(0.8rem, 1.4vw, 1.1rem) !important;
  opacity: 0.6 !important;
  font-style: italic;
}

/* Адаптивность */
@media (max-width: 768px) {
  .daily-report-modal {
    width: 98%;
    height: 95vh;
  }
  
  .report-summary {
    flex-direction: column;
    align-items: center;
  }
  
  .chart-bars {
    height: clamp(100px, 25vw, 120px);
  }
  
  .bar-value {
    font-size: clamp(0.6rem, 1vw, 0.8rem);
  }
}
</style>
