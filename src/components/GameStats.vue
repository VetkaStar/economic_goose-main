<template>
  <div class="game-stats">
    <!-- Баланс -->
    <div class="stat-card money-card" @mouseenter="showMoneyDetails = true" @mouseleave="showMoneyDetails = false">
      <div class="stat-header">
        <span class="stat-icon">💰</span>
        <span class="stat-value">{{ formatMoney(money) }} ₽</span>
        <span class="stat-change" :class="{ positive: moneyChange >= 0, negative: moneyChange < 0 }">
          {{ moneyChange >= 0 ? '+' : '' }}{{ formatMoney(moneyChange) }} ₽
        </span>
      </div>
      
      <!-- Детальная панель баланса -->
      <div v-if="showMoneyDetails" class="stat-details money-details">
        <div class="details-header">
          <h3>💰 Деньги</h3>
          <button class="close-details" @click="showMoneyDetails = false">×</button>
        </div>
        
        <div class="details-content">
          <!-- Основные показатели -->
          <div class="summary-section">
            <div class="summary-item">
              <span class="summary-label">Баланс:</span>
              <span class="summary-value" :class="{ positive: money >= 0, negative: money < 0 }">
                {{ formatMoney(money) }} ₽ {{ money >= 0 ? '▲' : '▼' }}
              </span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Наличные:</span>
              <span class="summary-value">{{ formatMoney(cash) }} ₽</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">
                <span class="term-with-tooltip">
                  Инвестиции
                  <span class="term-tooltip">Деньги, вложенные в ценные бумаги, недвижимость или другие активы для получения прибыли</span>
                </span>:
              </span>
              <span class="summary-value">{{ formatMoney(investments) }} ₽</span>
            </div>
          </div>

          <!-- Доходы -->
          <div class="income-section">
            <h4>📈 Доходы</h4>
            <div class="total-income">
              <span class="total-label">Всего:</span>
              <span class="total-value positive">+{{ formatMoney(totalIncome) }} ₽</span>
            </div>
            <div class="income-breakdown">
              <div class="breakdown-item">
                <span class="breakdown-label">Продажи одежды</span>
                <span class="breakdown-value positive">+{{ formatMoney(income.sales) }} ₽</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Аренда недвижимости</span>
                <span class="breakdown-value positive">+{{ formatMoney(income.rent) }} ₽</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Инвестиции</span>
                <span class="breakdown-value positive">+{{ formatMoney(income.investments) }} ₽</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">
                  <span class="term-with-tooltip">
                    Государственные субсидии
                    <span class="term-tooltip">Финансовая помощь от государства для поддержки бизнеса</span>
                  </span>
                </span>
                <span class="breakdown-value positive">+{{ formatMoney(income.subsidies) }} ₽</span>
              </div>
            </div>
          </div>

          <!-- Расходы -->
          <div class="expenses-section">
            <h4>📉 Расходы</h4>
            <div class="total-expenses">
              <span class="total-label">Всего:</span>
              <span class="total-value negative">-{{ formatMoney(totalExpenses) }} ₽</span>
            </div>
            <div class="expenses-breakdown">
              <div class="breakdown-item">
                <span class="breakdown-label">Зарплаты сотрудников</span>
                <span class="breakdown-value negative">-{{ formatMoney(expenses.salaries) }} ₽</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Аренда помещений</span>
                <span class="breakdown-value negative">-{{ formatMoney(expenses.rent) }} ₽</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Закупка материалов</span>
                <span class="breakdown-value negative">-{{ formatMoney(expenses.materials) }} ₽</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Налоги</span>
                <span class="breakdown-value negative">-{{ formatMoney(expenses.taxes) }} ₽</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">
                  <span class="term-with-tooltip">
                    Маркетинг
                    <span class="term-tooltip">Реклама и продвижение товаров для привлечения клиентов</span>
                  </span>
                </span>
                <span class="breakdown-value negative">-{{ formatMoney(expenses.marketing) }} ₽</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Прочие расходы</span>
                <span class="breakdown-value negative">-{{ formatMoney(expenses.other) }} ₽</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Репутация -->
    <div class="stat-card reputation-card" @mouseenter="showReputationDetails = true" @mouseleave="showReputationDetails = false">
      <div class="stat-header">
        <span class="stat-icon">⭐</span>
        <span class="stat-value">{{ reputation }}</span>
        <span class="stat-change" :class="{ positive: reputationChange >= 0, negative: reputationChange < 0 }">
          {{ reputationChange >= 0 ? '+' : '' }}{{ reputationChange }}
        </span>
      </div>
      
      <!-- Детальная панель репутации -->
      <div v-if="showReputationDetails" class="stat-details reputation-details">
        <div class="details-header">
          <h3>⭐ Репутация</h3>
          <button class="close-details" @click="showReputationDetails = false">×</button>
        </div>
        
        <div class="details-content">
          <!-- Основные показатели -->
          <div class="summary-section">
            <div class="summary-item">
              <span class="summary-label">Общая репутация:</span>
              <span class="summary-value" :class="getReputationClass(reputation)">
                {{ reputation }} {{ getReputationIcon(reputation) }}
              </span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Уровень:</span>
              <span class="summary-value">{{ getReputationLevel(reputation) }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">До следующего уровня:</span>
              <span class="summary-value">{{ getNextLevelProgress(reputation) }}</span>
            </div>
          </div>

          <!-- Источники репутации -->
          <div class="reputation-sources">
            <h4>📊 Источники репутации</h4>
            <div class="sources-breakdown">
              <div class="breakdown-item">
                <span class="breakdown-label">Качество продукции</span>
                <span class="breakdown-value positive">+{{ reputationSources.quality }}</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Скорость доставки</span>
                <span class="breakdown-value positive">+{{ reputationSources.delivery }}</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Обслуживание клиентов</span>
                <span class="breakdown-value positive">+{{ reputationSources.service }}</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">
                  <span class="term-with-tooltip">
                    Социальная ответственность
                    <span class="term-tooltip">Участие в социальных программах, экологичность, помощь обществу</span>
                  </span>
                </span>
                <span class="breakdown-value positive">+{{ reputationSources.social }}</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">
                  <span class="term-with-tooltip">
                    Инновации
                    <span class="term-tooltip">Внедрение новых технологий и методов в производство</span>
                  </span>
                </span>
                <span class="breakdown-value positive">+{{ reputationSources.innovation }}</span>
              </div>
            </div>
          </div>

          <!-- Бонусы репутации -->
          <div class="reputation-bonuses">
            <h4>🎁 Бонусы репутации</h4>
            <div class="bonuses-list">
              <div v-for="bonus in activeBonuses" :key="bonus.id" class="bonus-item">
                <span class="bonus-icon">{{ bonus.icon }}</span>
                <span class="bonus-name">{{ bonus.name }}</span>
                <span class="bonus-effect">{{ bonus.effect }}</span>
              </div>
            </div>
          </div>

          <!-- Возможности -->
          <div class="reputation-opportunities">
            <h4>🚀 Возможности</h4>
            <div class="opportunities-list">
              <div v-for="opportunity in availableOpportunities" :key="opportunity.id" class="opportunity-item" :class="{ available: opportunity.available }">
                <span class="opportunity-icon">{{ opportunity.icon }}</span>
                <span class="opportunity-name">{{ opportunity.name }}</span>
                <span class="opportunity-requirement">{{ opportunity.requirement }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

// Получаем данные из authStore
const authStore = useAuthStore()

// Основные данные (используем данные из authStore)
const money = computed(() => authStore.user?.money || 0)
const reputation = ref(25)
const cash = computed(() => authStore.user?.money || 0)
const investments = ref(30000)

// Изменения
const moneyChange = ref(2500)
const reputationChange = ref(3)

// Доходы
const income = ref({
  sales: 45000,
  rent: 15000,
  investments: 5000,
  subsidies: 8000
})

// Расходы
const expenses = ref({
  salaries: 25000,
  rent: 12000,
  materials: 18000,
  taxes: 15000,
  marketing: 8000,
  other: 5000
})

// Источники репутации
const reputationSources = ref({
  quality: 8,
  delivery: 6,
  service: 5,
  social: 3,
  innovation: 3
})

// Бонусы репутации
const activeBonuses = ref([
  { id: 1, icon: '🏆', name: 'Качественная продукция', effect: '+15% к продажам' },
  { id: 2, icon: '⚡', name: 'Быстрая доставка', effect: '+10% к лояльности' },
  { id: 3, icon: '💚', name: 'Экологичность', effect: '+5% к репутации' }
])

// Возможности
const availableOpportunities = ref([
  { id: 1, icon: '🎭', name: 'Модные показы', requirement: 'Репутация 50+', available: false },
  { id: 2, icon: '🏛️', name: 'Государственные контракты', requirement: 'Репутация 75+', available: false },
  { id: 3, icon: '🌍', name: 'Международная экспансия', requirement: 'Репутация 100+', available: false },
  { id: 4, icon: '👑', name: 'Премиум бренд', requirement: 'Репутация 150+', available: false }
])

// Состояние детальных панелей
const showMoneyDetails = ref(false)
const showReputationDetails = ref(false)

// Вычисляемые свойства
const totalIncome = computed(() => {
  return Object.values(income.value).reduce((sum, value) => sum + value, 0)
})

const totalExpenses = computed(() => {
  return Object.values(expenses.value).reduce((sum, value) => sum + value, 0)
})

// Функции форматирования
const formatMoney = (amount: number): string => {
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1) + 'М'
  } else if (amount >= 1000) {
    return (amount / 1000).toFixed(1) + 'К'
  }
  return amount.toLocaleString()
}

const getReputationClass = (rep: number): string => {
  if (rep >= 100) return 'excellent'
  if (rep >= 75) return 'very-good'
  if (rep >= 50) return 'good'
  if (rep >= 25) return 'average'
  return 'poor'
}

const getReputationIcon = (rep: number): string => {
  if (rep >= 100) return '👑'
  if (rep >= 75) return '🏆'
  if (rep >= 50) return '⭐'
  if (rep >= 25) return '👍'
  return '👎'
}

const getReputationLevel = (rep: number): string => {
  if (rep >= 100) return 'Легендарный'
  if (rep >= 75) return 'Превосходный'
  if (rep >= 50) return 'Отличный'
  if (rep >= 25) return 'Хороший'
  return 'Начинающий'
}

const getNextLevelProgress = (rep: number): string => {
  if (rep >= 100) return 'Максимальный уровень'
  if (rep >= 75) return `${100 - rep} до Легендарного`
  if (rep >= 50) return `${75 - rep} до Превосходного`
  if (rep >= 25) return `${50 - rep} до Отличного`
  return `${25 - rep} до Хорошего`
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
@import '@/styles/colors.css';
@import '@/styles/menu-common.css';

.game-stats {
  position: fixed;
  top: 20px;
  left: 20px;
  display: flex;
  flex-direction: row;
  gap: 15px;
  z-index: 1000;
  font-family: 'Orbitron', sans-serif;
}

.stat-card {
  background: var(--color-bg-menu);
  border-radius: clamp(8px, 1.2vw, 15px);
  padding: clamp(10px, 1.5vw, 15px) clamp(15px, 2vw, 20px);
  border: clamp(2px, 0.3vw, 3px) solid var(--color-text);
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(8px, 1.6vw, 16px) var(--shadow-medium);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  min-width: clamp(120px, 15vw, 180px);
  backdrop-filter: blur(5px);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 clamp(6px, 1.2vw, 12px) clamp(10px, 2vw, 20px) var(--shadow-dark);
}

.stat-header {
  display: flex;
  align-items: center;
  gap: clamp(8px, 1.2vw, 12px);
  font-weight: 700;
  color: var(--color-text);
}

.stat-icon {
  font-size: clamp(1.5rem, 3vw, 2rem);
  filter: drop-shadow(0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-medium));
}

.stat-value {
  font-size: clamp(1rem, 2vw, 1.4rem);
  font-weight: 900;
  margin-left: auto;
  text-shadow: 1px 1px 0px var(--shadow-light);
  color: var(--color-text);
}

.stat-change {
  font-size: clamp(0.7rem, 1.2vw, 1rem);
  font-weight: 700;
  padding: clamp(2px, 0.4vw, 4px) clamp(6px, 1vw, 10px);
  border-radius: clamp(6px, 1vw, 10px);
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.stat-change.positive {
  background: rgba(76, 175, 80, 0.2);
  color: #2E7D32;
}

.stat-change.negative {
  background: rgba(244, 67, 54, 0.2);
  color: #C62828;
}

/* Детальные панели */
.stat-details {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-bg-menu);
  border-radius: clamp(8px, 1.2vw, 15px);
  border: clamp(2px, 0.3vw, 3px) solid var(--color-text);
  box-shadow: 0 clamp(8px, 1.6vw, 16px) clamp(16px, 3.2vw, 32px) var(--shadow-dark);
  z-index: 1001;
  margin-top: 0;
  min-width: clamp(300px, 40vw, 400px);
  max-width: clamp(400px, 50vw, 500px);
  max-height: 80vh;
  overflow-y: auto;
}

.details-header {
  background: var(--gradient-accents);
  color: white;
  padding: clamp(12px, 2vw, 20px);
  border-radius: clamp(8px, 1.2vw, 12px) clamp(8px, 1.2vw, 12px) 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
}

.details-header h3 {
  margin: 0;
  font-size: clamp(1rem, 1.8vw, 1.4rem);
  text-shadow: 1px 1px 0px var(--shadow-dark);
  font-family: 'Orbitron', sans-serif;
}

.close-details {
  background: none;
  border: none;
  color: white;
  font-size: clamp(1.2rem, 2vw, 1.8rem);
  cursor: pointer;
  padding: 0;
  width: clamp(25px, 4vw, 35px);
  height: clamp(25px, 4vw, 35px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  font-family: 'Orbitron', sans-serif;
}

.close-details:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.details-content {
  padding: clamp(15px, 2vw, 25px);
}

/* Секции */
.summary-section {
  margin-bottom: clamp(15px, 2vw, 20px);
  padding: clamp(12px, 1.8vw, 18px);
  background: var(--color-bg-menu-light);
  border-radius: clamp(8px, 1.2vw, 12px);
  border: clamp(1px, 0.2vw, 2px) solid var(--color-buttons);
  box-shadow: 0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-light);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: clamp(8px, 1.2vw, 12px);
  font-size: clamp(0.8rem, 1.4vw, 1.1rem);
  font-family: 'Orbitron', sans-serif;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-label {
  font-weight: 600;
  color: var(--color-text);
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.summary-value {
  font-weight: 700;
  font-size: clamp(0.9rem, 1.6vw, 1.2rem);
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.summary-value.positive {
  color: #2E7D32;
}

.summary-value.negative {
  color: #C62828;
}

/* Доходы и расходы */
.income-section,
.expenses-section {
  margin-bottom: clamp(15px, 2vw, 20px);
}

.income-section h4,
.expenses-section h4 {
  margin: 0 0 clamp(12px, 1.8vw, 18px) 0;
  font-size: clamp(0.9rem, 1.6vw, 1.2rem);
  color: var(--color-text);
  text-shadow: 1px 1px 0px var(--shadow-light);
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
}

.total-income,
.total-expenses {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(8px, 1.2vw, 12px) clamp(12px, 1.8vw, 18px);
  background: var(--color-bg-menu);
  border-radius: clamp(6px, 1vw, 10px);
  margin-bottom: clamp(12px, 1.8vw, 18px);
  font-weight: 700;
  font-size: clamp(0.9rem, 1.6vw, 1.2rem);
  font-family: 'Orbitron', sans-serif;
  border: clamp(1px, 0.2vw, 2px) solid var(--color-buttons);
  box-shadow: 0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-light);
}

.total-label {
  color: var(--color-text);
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.total-value.positive {
  color: #2E7D32;
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.total-value.negative {
  color: #C62828;
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.income-breakdown,
.expenses-breakdown {
  display: flex;
  flex-direction: column;
  gap: clamp(6px, 1vw, 10px);
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(6px, 1vw, 10px) clamp(10px, 1.5vw, 15px);
  background: rgba(0, 0, 0, 0.05);
  border-radius: clamp(4px, 0.8vw, 8px);
  font-size: clamp(0.7rem, 1.2vw, 1rem);
  font-family: 'Orbitron', sans-serif;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.breakdown-label {
  color: var(--color-text);
  font-weight: 500;
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.breakdown-value.positive {
  color: #2E7D32;
  font-weight: 700;
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.breakdown-value.negative {
  color: #C62828;
  font-weight: 700;
  text-shadow: 1px 1px 0px var(--shadow-light);
}

/* Репутация */
.reputation-sources,
.reputation-bonuses,
.reputation-opportunities {
  margin-bottom: clamp(15px, 2vw, 20px);
}

.reputation-sources h4,
.reputation-bonuses h4,
.reputation-opportunities h4 {
  margin: 0 0 clamp(12px, 1.8vw, 18px) 0;
  font-size: clamp(0.9rem, 1.6vw, 1.2rem);
  color: var(--color-text);
  text-shadow: 1px 1px 0px var(--shadow-light);
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
}

.sources-breakdown {
  display: flex;
  flex-direction: column;
  gap: clamp(6px, 1vw, 10px);
}

.bonuses-list,
.opportunities-list {
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 1.2vw, 12px);
}

.bonus-item,
.opportunity-item {
  display: flex;
  align-items: center;
  gap: clamp(8px, 1.2vw, 12px);
  padding: clamp(8px, 1.2vw, 12px) clamp(10px, 1.5vw, 15px);
  background: rgba(0, 0, 0, 0.05);
  border-radius: clamp(6px, 1vw, 10px);
  font-size: clamp(0.7rem, 1.2vw, 1rem);
  font-family: 'Orbitron', sans-serif;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.opportunity-item.available {
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid #4CAF50;
}

.bonus-icon,
.opportunity-icon {
  font-size: clamp(1rem, 1.8vw, 1.4rem);
}

.bonus-name,
.opportunity-name {
  flex: 1;
  font-weight: 600;
  color: var(--color-text);
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.bonus-effect,
.opportunity-requirement {
  font-size: clamp(0.6rem, 1vw, 0.8rem);
  color: #666;
  font-style: italic;
  text-shadow: 1px 1px 0px var(--shadow-light);
}

/* Классы репутации */
.excellent { color: #9C27B0; }
.very-good { color: #2196F3; }
.good { color: #4CAF50; }
.average { color: #FF9800; }
.poor { color: #F44336; }

/* Подчеркнутые термины с подсказками */
.term-with-tooltip {
  position: relative;
  text-decoration: underline;
  text-decoration-style: dotted;
  text-decoration-color: var(--color-accents);
  cursor: help;
  color: var(--color-accents);
}

.term-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-text);
  color: white;
  padding: clamp(4px, 0.8vw, 8px) clamp(8px, 1.2vw, 12px);
  border-radius: clamp(4px, 0.8vw, 8px);
  font-size: clamp(0.7rem, 1.2vw, 1rem);
  white-space: nowrap;
  z-index: 1002;
  box-shadow: 0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-dark);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  pointer-events: none;
  max-width: 200px;
  white-space: normal;
  text-align: center;
  line-height: 1.3;
}

.term-with-tooltip:hover .term-tooltip {
  opacity: 1;
  visibility: visible;
}

/* Ограничение подсказок внутри панели */
.stat-details .term-tooltip {
  left: 50%;
  transform: translateX(-50%);
  max-width: calc(100% - 20px);
  word-wrap: break-word;
  position: absolute;
  bottom: 100%;
  margin-bottom: 5px;
}

/* Позиционирование для разных секций */
.summary-section .term-tooltip {
  left: 0;
  right: 0;
  transform: none;
  max-width: 100%;
}

.breakdown-item .term-tooltip {
  left: 50%;
  transform: translateX(-50%);
  max-width: 200px;
}

/* Адаптивное позиционирование для крайних элементов */
.breakdown-item:first-child .term-tooltip {
  left: 0;
  transform: none;
}

.breakdown-item:last-child .term-tooltip {
  left: auto;
  right: 0;
  transform: none;
}

/* Для средних элементов центрируем */
.breakdown-item:not(:first-child):not(:last-child) .term-tooltip {
  left: 50%;
  transform: translateX(-50%);
}

/* Адаптивность */
@media (max-width: 768px) {
  .game-stats {
    top: 10px;
    left: 10px;
    right: 10px;
    flex-direction: row;
    gap: 10px;
  }
  
  .stat-card {
    flex: 1;
    min-width: auto;
  }
  
  .stat-details {
    min-width: 280px;
    max-width: 90vw;
  }
  
  .stat-header {
    gap: 8px;
  }
  
  .stat-icon {
    font-size: 1.2rem;
  }
  
  .stat-value {
    font-size: 1rem;
  }
  
  .stat-change {
    font-size: 0.8rem;
    padding: 2px 6px;
  }
}
</style>
