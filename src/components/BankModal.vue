<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="bank-modal">
      <div class="bank-header">
        <h2 class="title">🏦 Банк "ГусьФинанс"</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="bank-content">
        <!-- Вкладки -->
        <div class="tabs">
          <button 
            class="tab" 
            :class="{ active: activeTab === 'overview' }" 
            @click="activeTab = 'overview'"
          >
            📊 Обзор
          </button>
          <button 
            class="tab" 
            :class="{ active: activeTab === 'credits' }" 
            @click="activeTab = 'credits'"
          >
            💳 Кредиты
          </button>
          <button 
            class="tab" 
            :class="{ active: activeTab === 'deposits' }" 
            @click="activeTab = 'deposits'"
          >
            💰 Вклады
          </button>
          <button 
            class="tab" 
            :class="{ active: activeTab === 'accounts' }" 
            @click="activeTab = 'accounts'"
          >
            🏢 Счета
          </button>
        </div>

        <!-- Контент вкладок -->
        <div class="tab-content">
          <!-- Обзор -->
          <div v-if="activeTab === 'overview'" class="overview-page">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">💳</div>
                <div class="stat-info">
                  <div class="stat-label">Кредитный рейтинг</div>
                  <div class="stat-value">{{ bank.creditRating }}/100</div>
                  <div class="stat-bar">
                    <div class="stat-progress" :style="{ width: bank.creditRating + '%' }"></div>
                  </div>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">📊</div>
                <div class="stat-info">
                  <div class="stat-label">Общий долг</div>
                  <div class="stat-value">₽{{ bank.totalDebt.toLocaleString() }}</div>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">💰</div>
                <div class="stat-info">
                  <div class="stat-label">Вклады</div>
                  <div class="stat-value">₽{{ bank.totalDeposits.toLocaleString() }}</div>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">📅</div>
                <div class="stat-info">
                  <div class="stat-label">Ежемесячные платежи</div>
                  <div class="stat-value">₽{{ bank.monthlyPayments.toLocaleString() }}</div>
                </div>
              </div>
            </div>

            <div class="quick-actions">
              <h3>Быстрые действия</h3>
              <div class="action-buttons">
                <button class="action-btn primary" @click="activeTab = 'credits'">
                  💳 Взять кредит
                </button>
                <button class="action-btn secondary" @click="activeTab = 'deposits'">
                  💰 Открыть вклад
                </button>
                <button class="action-btn tertiary" @click="activeTab = 'accounts'">
                  🏢 Управление счетами
                </button>
              </div>
            </div>
          </div>

          <!-- Кредиты -->
          <div v-if="activeTab === 'credits'" class="credits-page">
            <div class="page-header">
              <h3>💳 Кредиты</h3>
              <div class="credit-info">
                <span>Максимальная сумма: ₽{{ bank.maxCreditAmount.toLocaleString() }}</span>
              </div>
            </div>

            <!-- Активные кредиты -->
            <div v-if="activeCredits.length > 0" class="section">
              <h4>Активные кредиты</h4>
              <div class="credits-list">
                <div v-for="credit in activeCredits" :key="credit.id" class="credit-card">
                  <div class="credit-info">
                    <div class="credit-amount">₽{{ credit.amount.toLocaleString() }}</div>
                    <div class="credit-details">
                      <div>Ставка: {{ credit.interestRate }}% годовых</div>
                      <div>Осталось: {{ credit.remainingMonths }} мес.</div>
                      <div>Ежемесячный платеж: ₽{{ credit.monthlyPayment.toLocaleString() }}</div>
                      <div>Остаток: ₽{{ credit.remainingAmount.toLocaleString() }}</div>
                    </div>
                  </div>
                  <div class="credit-status" :class="credit.status">
                    {{ getCreditStatusText(credit.status) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Форма нового кредита -->
            <div class="section">
              <h4>Взять новый кредит</h4>
              <div class="credit-form">
                <div class="form-group">
                  <label>Сумма кредита:</label>
                  <input 
                    type="number" 
                    v-model.number="newCredit.amount" 
                    :max="bank.maxCreditAmount"
                    min="1000"
                    class="amount-input"
                  />
                  <span class="max-amount">(макс: ₽{{ bank.maxCreditAmount.toLocaleString() }})</span>
                </div>

                <div class="form-group">
                  <label>Срок кредита:</label>
                  <select v-model="newCredit.termMonths" class="term-select">
                    <option 
                      v-for="rate in bank.availableCreditRates" 
                      :key="rate.term"
                      :value="rate.term"
                    >
                      {{ rate.name }} ({{ rate.term }} мес.) - {{ rate.rate }}% годовых
                    </option>
                  </select>
                </div>

                <div v-if="selectedCreditRate" class="credit-preview">
                  <h5>Предварительный расчет:</h5>
                  <div class="preview-details">
                    <div>Сумма: ₽{{ newCredit.amount.toLocaleString() }}</div>
                    <div>Ставка: {{ selectedCreditRate.rate }}% годовых</div>
                    <div>Срок: {{ newCredit.termMonths }} месяцев</div>
                    <div class="monthly-payment">
                      Ежемесячный платеж: ₽{{ calculatedMonthlyPayment.toLocaleString() }}
                    </div>
                  </div>
                </div>

                <button 
                  class="btn primary" 
                  @click="takeNewCredit"
                  :disabled="!canTakeCredit"
                >
                  Взять кредит
                </button>
              </div>
            </div>
          </div>

          <!-- Вклады -->
          <div v-if="activeTab === 'deposits'" class="deposits-page">
            <div class="page-header">
              <h3>💰 Вклады</h3>
            </div>

            <!-- Активные вклады -->
            <div v-if="activeDeposits.length > 0" class="section">
              <h4>Активные вклады</h4>
              <div class="deposits-list">
                <div v-for="deposit in activeDeposits" :key="deposit.id" class="deposit-card">
                  <div class="deposit-info">
                    <div class="deposit-amount">₽{{ deposit.amount.toLocaleString() }}</div>
                    <div class="deposit-details">
                      <div>Ставка: {{ deposit.interestRate }}% годовых</div>
                      <div>Срок: {{ deposit.termMonths }} месяцев</div>
                      <div>Создан: {{ formatDate(deposit.createdAt) }}</div>
                      <div>Срок окончания: {{ formatDate(deposit.maturityDate) }}</div>
                    </div>
                  </div>
                  <div class="deposit-status" :class="deposit.status">
                    {{ getDepositStatusText(deposit.status) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Форма нового вклада -->
            <div class="section">
              <h4>Открыть новый вклад</h4>
              <div class="deposit-form">
                <div class="form-group">
                  <label>Сумма вклада:</label>
                  <input 
                    type="number" 
                    v-model.number="newDeposit.amount" 
                    min="1000"
                    class="amount-input"
                  />
                  <span class="min-amount">(мин: ₽1,000)</span>
                </div>

                <div class="form-group">
                  <label>Срок вклада:</label>
                  <select v-model="newDeposit.termMonths" class="term-select">
                    <option 
                      v-for="rate in bank.availableDepositRates" 
                      :key="rate.term"
                      :value="rate.term"
                    >
                      {{ rate.name }} ({{ rate.term }} мес.) - {{ rate.rate }}% годовых
                    </option>
                  </select>
                </div>

                <div v-if="selectedDepositRate" class="deposit-preview">
                  <h5>Предварительный расчет:</h5>
                  <div class="preview-details">
                    <div>Сумма: ₽{{ newDeposit.amount.toLocaleString() }}</div>
                    <div>Ставка: {{ selectedDepositRate.rate }}% годовых</div>
                    <div>Срок: {{ newDeposit.termMonths }} месяцев</div>
                    <div class="total-interest">
                      Доход: ₽{{ calculatedDepositIncome.toLocaleString() }}
                    </div>
                  </div>
                </div>

                <button 
                  class="btn primary" 
                  @click="makeNewDeposit"
                  :disabled="!canMakeDeposit"
                >
                  Открыть вклад
                </button>
              </div>
            </div>
          </div>

          <!-- Счета -->
          <div v-if="activeTab === 'accounts'" class="accounts-page">
            <div class="page-header">
              <h3>🏢 Банковские счета</h3>
            </div>

            <!-- Список счетов -->
            <div class="accounts-list">
              <div v-for="account in bank.accounts" :key="account.id" class="account-card">
                <div class="account-info">
                  <div class="account-type">{{ getAccountTypeName(account.type) }}</div>
                  <div class="account-balance">₽{{ account.balance.toLocaleString() }}</div>
                  <div class="account-status" :class="account.status">
                    {{ getAccountStatusText(account.status) }}
                  </div>
                </div>
                <div class="account-actions">
                  <button 
                    class="btn small" 
                    @click="openTransferModal(account)"
                    :disabled="account.status !== 'active'"
                  >
                    Перевод
                  </button>
                </div>
              </div>
            </div>

            <!-- Создание новых счетов -->
            <div class="section">
              <h4>Создать новый счет</h4>
              <div class="create-accounts">
                <button 
                  class="account-type-btn" 
                  @click="createAccount('personal')"
                  :disabled="hasAccount('personal')"
                >
                  <div class="account-icon">👤</div>
                  <div class="account-name">Личный счет</div>
                  <div class="account-desc">Доступен с 1 уровня</div>
                </button>

                <button 
                  class="account-type-btn" 
                  @click="createAccount('ip')"
                  :disabled="hasAccount('ip') || companyStore.state.progress.level < 3"
                >
                  <div class="account-icon">🏪</div>
                  <div class="account-name">Счет ИП</div>
                  <div class="account-desc">Доступен с 3 уровня</div>
                </button>

                <button 
                  class="account-type-btn" 
                  @click="createAccount('ooo')"
                  :disabled="hasAccount('ooo') || companyStore.state.progress.level < 5"
                >
                  <div class="account-icon">🏢</div>
                  <div class="account-name">Счет ООО</div>
                  <div class="account-desc">Доступен с 5 уровня</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Модалка переводов -->
      <div v-if="showTransferModal" class="transfer-modal-overlay" @click.self="closeTransferModal">
        <div class="transfer-modal">
          <div class="transfer-header">
            <h3>Перевод средств</h3>
            <button class="close-btn" @click="closeTransferModal">✕</button>
          </div>
          
          <div class="transfer-content">
            <div class="transfer-info">
              <div class="account-info">
                <div class="account-type">{{ getAccountTypeName(selectedAccount?.type || 'personal') }}</div>
                <div class="account-balance">Баланс: ₽{{ selectedAccount?.balance.toLocaleString() }}</div>
              </div>
            </div>

            <div class="form-group">
              <label>Сумма перевода:</label>
              <input 
                type="number" 
                v-model.number="transferAmount" 
                :max="selectedAccount?.balance"
                min="1"
                class="amount-input"
              />
            </div>

            <div class="form-group">
              <label>Направление:</label>
              <select v-model="transferDirection" class="direction-select">
                <option value="to">На счет</option>
                <option value="from">Со счета</option>
              </select>
            </div>

            <div class="transfer-actions">
              <button 
                class="btn primary" 
                @click="executeTransfer"
                :disabled="!canExecuteTransfer"
              >
                Выполнить перевод
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBankStore } from '@/stores/bankStore'
import { useCompanyStore } from '@/stores/companyStore'
import type { Credit, Deposit, BankAccount } from '@/stores/bankStore'

defineEmits<{ close: [] }>()

const bank = useBankStore()
const companyStore = useCompanyStore()

// Состояние
const activeTab = ref<'overview' | 'credits' | 'deposits' | 'accounts'>('overview')
const showTransferModal = ref(false)
const selectedAccount = ref<BankAccount | null>(null)
const transferAmount = ref(0)
const transferDirection = ref<'to' | 'from'>('to')

// Формы
const newCredit = ref({
  amount: 10000,
  termMonths: 12
})

const newDeposit = ref({
  amount: 10000,
  termMonths: 6
})

// Вычисляемые свойства
const activeCredits = computed(() => 
  bank.credits.filter(credit => credit.status === 'active')
)

const activeDeposits = computed(() => 
  bank.deposits.filter(deposit => deposit.status === 'active')
)

const selectedCreditRate = computed(() => 
  bank.availableCreditRates.find(rate => rate.term === newCredit.value.termMonths)
)

const selectedDepositRate = computed(() => 
  bank.availableDepositRates.find(rate => rate.term === newDeposit.value.termMonths)
)

const calculatedMonthlyPayment = computed(() => 
  bank.calculateMonthlyPayment(
    newCredit.value.amount, 
    selectedCreditRate.value?.rate || 0, 
    newCredit.value.termMonths
  )
)

const calculatedDepositIncome = computed(() => {
  if (!selectedDepositRate.value) return 0
  const totalInterest = newDeposit.value.amount * (selectedDepositRate.value.rate / 100) * (newDeposit.value.termMonths / 12)
  return Math.round(totalInterest)
})

const canTakeCredit = computed(() => 
  newCredit.value.amount >= 1000 && 
  newCredit.value.amount <= bank.maxCreditAmount &&
  selectedCreditRate.value !== undefined
)

const canMakeDeposit = computed(() => 
  newDeposit.value.amount >= 1000 && 
  selectedDepositRate.value !== undefined
)

const canExecuteTransfer = computed(() => 
  transferAmount.value > 0 && 
  selectedAccount.value !== null &&
  (transferDirection.value === 'to' || transferAmount.value <= (selectedAccount.value?.balance || 0))
)

// Методы
function getCreditStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'active': 'Активный',
    'paid': 'Погашен',
    'overdue': 'Просрочен'
  }
  return statusMap[status] || status
}

function getDepositStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'active': 'Активный',
    'matured': 'Созрел',
    'closed': 'Закрыт'
  }
  return statusMap[status] || status
}

function getAccountTypeName(type: string): string {
  const typeMap: Record<string, string> = {
    'personal': 'Личный счет',
    'ip': 'Счет ИП',
    'ooo': 'Счет ООО'
  }
  return typeMap[type] || type
}

function getAccountStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'active': 'Активный',
    'suspended': 'Приостановлен',
    'closed': 'Закрыт'
  }
  return statusMap[status] || status
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ru-RU')
}

function hasAccount(type: 'personal' | 'ip' | 'ooo'): boolean {
  return bank.accounts.some(acc => acc.type === type && acc.status === 'active')
}

async function takeNewCredit(): Promise<void> {
  if (!selectedCreditRate.value) return
  
  const success = await bank.takeCredit(
    newCredit.value.amount,
    newCredit.value.termMonths,
    selectedCreditRate.value.rate
  )
  
  if (success) {
    // Сбрасываем форму
    newCredit.value = { amount: 10000, termMonths: 12 }
  }
}

async function makeNewDeposit(): Promise<void> {
  if (!selectedDepositRate.value) return
  
  const success = await bank.makeDeposit(
    newDeposit.value.amount,
    newDeposit.value.termMonths,
    selectedDepositRate.value.rate
  )
  
  if (success) {
    // Сбрасываем форму
    newDeposit.value = { amount: 10000, termMonths: 6 }
  }
}

async function createAccount(type: 'personal' | 'ip' | 'ooo'): Promise<void> {
  await bank.createAccount(type)
}

function openTransferModal(account: BankAccount): void {
  selectedAccount.value = account
  transferAmount.value = 0
  transferDirection.value = 'to'
  showTransferModal.value = true
}

function closeTransferModal(): void {
  showTransferModal.value = false
  selectedAccount.value = null
  transferAmount.value = 0
}

async function executeTransfer(): Promise<void> {
  if (!selectedAccount.value) return
  
  const success = transferDirection.value === 'to' 
    ? await bank.transferToAccount(transferAmount.value, selectedAccount.value.type)
    : await bank.transferFromAccount(transferAmount.value, selectedAccount.value.type)
  
  if (success) {
    closeTransferModal()
  }
}

onMounted(async () => {
  // Загружаем данные из Supabase
  await bank.loadBankData()
  
  // Обрабатываем ежемесячные платежи при открытии банка
  bank.processMonthlyPayments()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
@import '@/styles/colors.css';

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.bank-modal {
  width: 1000px;
  height: 700px;
  background: var(--color-bg-menu-light);
  border: 2px solid var(--color-buttons);
  border-radius: 15px;
  box-shadow: 0 8px 16px var(--shadow-medium);
  display: flex;
  flex-direction: column;
  font-family: 'Orbitron', sans-serif;
}

.bank-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  background: var(--color-bg-menu);
  border-bottom: 2px solid var(--color-buttons);
  border-radius: 15px 15px 0 0;
}

.title {
  color: var(--color-text);
  font-weight: 700;
  text-shadow: 2px 2px 0 var(--shadow-light);
  font-family: 'Orbitron', sans-serif;
  font-size: 1.4rem;
  margin: 0;
}

.close-btn {
  background: var(--color-buttons);
  border: 2px solid var(--color-accents);
  border-radius: 12px;
  color: var(--color-text);
  padding: 8px 12px;
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: var(--color-accents);
  transform: scale(1.05);
}

.bank-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tabs {
  display: flex;
  background: var(--color-bg-menu);
  border-bottom: 2px solid var(--color-buttons);
}

.tab {
  flex: 1;
  padding: 12px 16px;
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  font-weight: 600;
  font-family: 'Orbitron', sans-serif;
}

.tab.active {
  background: var(--color-bg-menu-light);
  border-bottom-color: var(--color-accents);
}

.tab-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* Обзор */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: var(--color-bg-menu);
  border: 2px solid var(--color-buttons);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 2rem;
}

.stat-info {
  flex: 1;
}

.stat-label {
  color: var(--color-text);
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.stat-value {
  color: var(--color-accents);
  font-weight: 700;
  font-size: 1.2rem;
  margin-bottom: 8px;
}

.stat-bar {
  width: 100%;
  height: 8px;
  background: var(--color-bg-menu-light);
  border-radius: 4px;
  overflow: hidden;
}

.stat-progress {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  transition: width 0.3s ease;
}

.quick-actions h3 {
  color: var(--color-text);
  margin-bottom: 15px;
  font-size: 1.1rem;
}

.action-buttons {
  display: flex;
  gap: 15px;
}

.action-btn {
  padding: 12px 20px;
  border: 2px solid var(--color-buttons);
  border-radius: 10px;
  background: var(--color-bg-menu);
  color: var(--color-text);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-family: 'Orbitron', sans-serif;
}

.action-btn.primary {
  background: var(--color-accents);
  border-color: var(--color-highlights);
  color: white;
}

.action-btn.secondary {
  background: #4CAF50;
  border-color: #2E7D32;
  color: white;
}

.action-btn.tertiary {
  background: #2196F3;
  border-color: #1976D2;
  color: white;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

/* Общие стили для страниц */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h3 {
  color: var(--color-text);
  margin: 0;
  font-size: 1.2rem;
}

.section {
  margin-bottom: 30px;
}

.section h4 {
  color: var(--color-text);
  margin-bottom: 15px;
  font-size: 1rem;
}

/* Кредиты */
.credit-info {
  color: var(--color-text);
  font-size: 0.8rem;
  margin-bottom: 10px;
}

.credits-list, .deposits-list, .accounts-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.credit-card, .deposit-card, .account-card {
  background: var(--color-bg-menu);
  border: 2px solid var(--color-buttons);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.credit-amount, .deposit-amount {
  color: var(--color-accents);
  font-weight: 700;
  font-size: 1.2rem;
  margin-bottom: 8px;
}

.credit-details, .deposit-details {
  color: var(--color-text);
  font-size: 0.9rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
}

.credit-status, .deposit-status, .account-status {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}

.credit-status.active, .deposit-status.active, .account-status.active {
  background: #E8F5E8;
  color: #2E7D32;
}

.credit-status.overdue {
  background: #FFEBEE;
  color: #C62828;
}

.credit-status.paid, .deposit-status.matured {
  background: #E3F2FD;
  color: #1976D2;
}

/* Формы */
.credit-form, .deposit-form {
  background: var(--color-bg-menu);
  border: 2px solid var(--color-buttons);
  border-radius: 12px;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  color: var(--color-text);
  font-weight: 600;
  margin-bottom: 5px;
}

.amount-input, .term-select, .direction-select {
  width: 100%;
  padding: 8px 12px;
  border: 2px solid var(--color-buttons);
  border-radius: 8px;
  background: var(--color-bg-menu-light);
  color: var(--color-text);
  font-family: 'Orbitron', sans-serif;
}

.max-amount, .min-amount {
  font-size: 0.8rem;
  color: #666;
  margin-left: 10px;
}

.credit-preview, .deposit-preview {
  background: var(--color-bg-menu-light);
  border: 2px solid var(--color-accents);
  border-radius: 8px;
  padding: 15px;
  margin: 15px 0;
}

.credit-preview h5, .deposit-preview h5 {
  color: var(--color-text);
  margin: 0 0 10px 0;
  font-size: 1rem;
}

.preview-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  color: var(--color-text);
  font-size: 0.9rem;
}

.monthly-payment, .total-interest {
  grid-column: 1 / -1;
  color: var(--color-accents);
  font-weight: 700;
  font-size: 1.1rem;
  margin-top: 8px;
}

.btn {
  padding: 10px 20px;
  border: 2px solid var(--color-buttons);
  border-radius: 8px;
  background: var(--color-bg-menu-light);
  color: var(--color-text);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-family: 'Orbitron', sans-serif;
}

.btn.primary {
  background: var(--color-accents);
  border-color: var(--color-highlights);
  color: white;
}

.btn.small {
  padding: 6px 12px;
  font-size: 0.8rem;
}

.btn:disabled {
  background: #ccc;
  border-color: #999;
  color: #666;
  cursor: not-allowed;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

/* Счета */
.create-accounts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.account-type-btn {
  background: var(--color-bg-menu);
  border: 2px solid var(--color-buttons);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.account-type-btn:hover:not(:disabled) {
  border-color: var(--color-accents);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.account-type-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.account-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.account-name {
  color: var(--color-text);
  font-weight: 700;
  margin-bottom: 5px;
}

.account-desc {
  color: #666;
  font-size: 0.8rem;
}

.account-info {
  flex: 1;
}

.account-type {
  color: var(--color-text);
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: 5px;
}

.account-balance {
  color: var(--color-accents);
  font-weight: 700;
  font-size: 1.2rem;
  margin-bottom: 8px;
}

.account-actions {
  display: flex;
  gap: 10px;
}

/* Модалка переводов */
.transfer-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.transfer-modal {
  background: var(--color-bg-menu-light);
  border: 2px solid var(--color-buttons);
  border-radius: 12px;
  width: 500px;
  max-width: 90vw;
}

.transfer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--color-bg-menu);
  border-bottom: 2px solid var(--color-buttons);
  border-radius: 12px 12px 0 0;
}

.transfer-header h3 {
  margin: 0;
  color: var(--color-text);
}

.transfer-content {
  padding: 20px;
}

.transfer-info {
  background: var(--color-bg-menu);
  border: 2px solid var(--color-buttons);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.transfer-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
