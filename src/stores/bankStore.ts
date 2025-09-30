import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useAuthStore } from './authStore'
import { useCompanyStore } from './companyStore'
import { supabase } from '@/lib/supabase'

export interface Credit {
  id: string
  amount: number
  interestRate: number // годовая ставка в %
  termMonths: number
  monthlyPayment: number
  remainingAmount: number
  remainingMonths: number
  takenAt: string
  status: 'active' | 'paid' | 'overdue'
}

export interface Deposit {
  id: string
  amount: number
  interestRate: number // годовая ставка в %
  termMonths: number
  createdAt: string
  maturityDate: string
  status: 'active' | 'matured' | 'closed'
}

export interface BankAccount {
  id: string
  type: 'personal' | 'ip' | 'ooo'
  balance: number
  createdAt: string
  status: 'active' | 'suspended' | 'closed'
}

export const useBankStore = defineStore('bank', () => {
  const authStore = useAuthStore()
  const companyStore = useCompanyStore()

  // Состояние
  const credits = ref<Credit[]>([])
  const deposits = ref<Deposit[]>([])
  const accounts = ref<BankAccount[]>([])
  const lastPaymentDate = ref<string>(new Date().toISOString())

  // Вычисляемые свойства
  const totalDebt = computed(() => {
    return credits.value
      .filter(credit => credit.status === 'active')
      .reduce((sum, credit) => sum + credit.remainingAmount, 0)
  })

  const totalDeposits = computed(() => {
    return deposits.value
      .filter(deposit => deposit.status === 'active')
      .reduce((sum, deposit) => sum + deposit.amount, 0)
  })

  const monthlyPayments = computed(() => {
    return credits.value
      .filter(credit => credit.status === 'active')
      .reduce((sum, credit) => sum + credit.monthlyPayment, 0)
  })

  const creditRating = computed(() => {
    const level = companyStore.state.progress.level
    const experience = companyStore.state.progress.experience
    const money = authStore.user?.money || 0
    
    // Базовый рейтинг на основе уровня компании
    let rating = level * 10
    
    // Бонус за опыт
    rating += Math.floor(experience / 100) * 5
    
    // Бонус за деньги (чем больше денег, тем выше рейтинг)
    if (money > 100000) rating += 20
    else if (money > 50000) rating += 15
    else if (money > 20000) rating += 10
    else if (money > 10000) rating += 5
    
    // Штраф за просрочки
    const overdueCredits = credits.value.filter(c => c.status === 'overdue').length
    rating -= overdueCredits * 15
    
    return Math.max(0, Math.min(100, rating))
  })

  const maxCreditAmount = computed(() => {
    const rating = creditRating.value
    const level = companyStore.state.progress.level
    
    // Базовый лимит на основе рейтинга
    let baseLimit = rating * 1000
    
    // Множитель на основе уровня компании
    const levelMultiplier = 1 + (level - 1) * 0.5
    
    return Math.floor(baseLimit * levelMultiplier)
  })

  const availableCreditRates = computed(() => {
    const rating = creditRating.value
    
    if (rating >= 80) {
      return [
        { term: 6, rate: 12, name: 'Краткосрочный' },
        { term: 12, rate: 15, name: 'Среднесрочный' },
        { term: 24, rate: 18, name: 'Долгосрочный' }
      ]
    } else if (rating >= 60) {
      return [
        { term: 6, rate: 15, name: 'Краткосрочный' },
        { term: 12, rate: 18, name: 'Среднесрочный' },
        { term: 24, rate: 22, name: 'Долгосрочный' }
      ]
    } else if (rating >= 40) {
      return [
        { term: 6, rate: 18, name: 'Краткосрочный' },
        { term: 12, rate: 22, name: 'Среднесрочный' },
        { term: 24, rate: 26, name: 'Долгосрочный' }
      ]
    } else {
      return [
        { term: 6, rate: 25, name: 'Краткосрочный' },
        { term: 12, rate: 30, name: 'Среднесрочный' }
      ]
    }
  })

  const availableDepositRates = computed(() => {
    const rating = creditRating.value
    
    if (rating >= 80) {
      return [
        { term: 3, rate: 8, name: 'Краткосрочный' },
        { term: 6, rate: 10, name: 'Среднесрочный' },
        { term: 12, rate: 12, name: 'Долгосрочный' }
      ]
    } else if (rating >= 60) {
      return [
        { term: 3, rate: 6, name: 'Краткосрочный' },
        { term: 6, rate: 8, name: 'Среднесрочный' },
        { term: 12, rate: 10, name: 'Долгосрочный' }
      ]
    } else {
      return [
        { term: 3, rate: 4, name: 'Краткосрочный' },
        { term: 6, rate: 6, name: 'Среднесрочный' }
      ]
    }
  })

  // Методы
  function calculateMonthlyPayment(amount: number, rate: number, termMonths: number): number {
    const monthlyRate = rate / 100 / 12
    const payment = amount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                   (Math.pow(1 + monthlyRate, termMonths) - 1)
    return Math.round(payment)
  }

  async function takeCredit(amount: number, termMonths: number, interestRate: number): Promise<boolean> {
    if (amount > maxCreditAmount.value) {
      console.log('❌ Сумма кредита превышает максимальную:', amount, '>', maxCreditAmount.value)
      return false
    }

    const monthlyPayment = calculateMonthlyPayment(amount, interestRate, termMonths)
    
    const credit: Credit = {
      id: `credit_${Date.now()}`,
      amount,
      interestRate,
      termMonths,
      monthlyPayment,
      remainingAmount: amount,
      remainingMonths: termMonths,
      takenAt: new Date().toISOString(),
      status: 'active'
    }

    try {
      // Сохраняем кредит в Supabase
      const { data, error } = await supabase
        .from('bank_credits')
        .insert({
          user_id: authStore.user?.id,
          amount: credit.amount,
          interest_rate: credit.interestRate,
          term_months: credit.termMonths,
          monthly_payment: credit.monthlyPayment,
          remaining_amount: credit.remainingAmount,
          remaining_months: credit.remainingMonths,
          status: credit.status,
          taken_at: credit.takenAt
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Ошибка при сохранении кредита:', error)
        return false
      }

      // Обновляем ID из базы данных
      credit.id = data.id

      credits.value.push(credit)
      
      // ДОБАВЛЯЕМ деньги на счет (кредит дает деньги!)
      authStore.addMoney(amount)
      
      console.log('✅ Кредит взят:', credit)
      return true
    } catch (err) {
      console.error('❌ Ошибка при взятии кредита:', err)
      return false
    }
  }

  async function makeDeposit(amount: number, termMonths: number, interestRate: number): Promise<boolean> {
    if (amount > (authStore.user?.money || 0)) {
      console.log('❌ Недостаточно средств для вклада:', amount, '>', authStore.user?.money)
      return false
    }

    if (amount < 1000) { // Минимальная сумма вклада
      console.log('❌ Минимальная сумма вклада: ₽1,000')
      return false
    }

    const maturityDate = new Date()
    maturityDate.setMonth(maturityDate.getMonth() + termMonths)

    const deposit: Deposit = {
      id: `deposit_${Date.now()}`,
      amount,
      interestRate,
      termMonths,
      createdAt: new Date().toISOString(),
      maturityDate: maturityDate.toISOString(),
      status: 'active'
    }

    try {
      // Сохраняем вклад в Supabase
      const { data, error } = await supabase
        .from('bank_deposits')
        .insert({
          user_id: authStore.user?.id,
          amount: deposit.amount,
          interest_rate: deposit.interestRate,
          term_months: deposit.termMonths,
          status: deposit.status,
          maturity_date: deposit.maturityDate
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Ошибка при сохранении вклада:', error)
        return false
      }

      // Обновляем ID из базы данных
      deposit.id = data.id

      deposits.value.push(deposit)
      
      // Списываем деньги с основного счета
      authStore.addMoney(-amount)
      
      console.log('✅ Вклад открыт:', deposit)
      return true
    } catch (err) {
      console.error('❌ Ошибка при открытии вклада:', err)
      return false
    }
  }

  async function createAccount(type: 'personal' | 'ip' | 'ooo'): Promise<boolean> {
    // Проверяем, есть ли уже такой тип счета
    const existingAccount = accounts.value.find(acc => acc.type === type && acc.status === 'active')
    if (existingAccount) {
      console.log('❌ Счет этого типа уже существует:', type)
      return false
    }

    // Проверяем требования для создания счета
    if (type === 'ip' && companyStore.state.progress.level < 3) {
      console.log('❌ Для открытия счета ИП нужен 3 уровень компании')
      return false
    }
    
    if (type === 'ooo' && companyStore.state.progress.level < 5) {
      console.log('❌ Для открытия счета ООО нужен 5 уровень компании')
      return false
    }

    const account: BankAccount = {
      id: `account_${type}_${Date.now()}`,
      type,
      balance: 0,
      createdAt: new Date().toISOString(),
      status: 'active'
    }

    try {
      // Сохраняем счет в Supabase
      const { data, error } = await supabase
        .from('bank_accounts')
        .insert({
          user_id: authStore.user?.id,
          account_type: account.type,
          balance: account.balance,
          status: account.status
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Ошибка при создании счета:', error)
        return false
      }

      // Обновляем ID из базы данных
      account.id = data.id

      accounts.value.push(account)
      console.log('✅ Счет создан:', account)
      return true
    } catch (err) {
      console.error('❌ Ошибка при создании счета:', err)
      return false
    }
  }

  function processMonthlyPayments(): void {
    const now = new Date()
    const lastPayment = new Date(lastPaymentDate.value)
    
    // Проверяем, прошел ли месяц
    if (now.getMonth() === lastPayment.getMonth() && now.getFullYear() === lastPayment.getFullYear()) {
      return
    }

    // Обрабатываем кредиты
    credits.value.forEach(credit => {
      if (credit.status === 'active') {
        // Списываем ежемесячный платеж
        const success = authStore.addMoney(-credit.monthlyPayment)
        
        if (success) {
          credit.remainingAmount -= credit.monthlyPayment
          credit.remainingMonths -= 1
          
          if (credit.remainingAmount <= 0) {
            credit.status = 'paid'
          }
        } else {
          // Недостаточно средств - кредит просрочен
          credit.status = 'overdue'
        }
      }
    })

    // Обрабатываем вклады
    deposits.value.forEach(deposit => {
      if (deposit.status === 'active') {
        const maturityDate = new Date(deposit.maturityDate)
        
        if (now >= maturityDate) {
          // Вклад созрел - начисляем проценты
          const totalInterest = deposit.amount * (deposit.interestRate / 100) * (deposit.termMonths / 12)
          authStore.addMoney(Math.round(totalInterest))
          deposit.status = 'matured'
        }
      }
    })

    lastPaymentDate.value = now.toISOString()
  }

  function getAccountByType(type: 'personal' | 'ip' | 'ooo'): BankAccount | undefined {
    return accounts.value.find(acc => acc.type === type && acc.status === 'active')
  }

  async function transferToAccount(amount: number, accountType: 'personal' | 'ip' | 'ooo'): Promise<boolean> {
    const account = getAccountByType(accountType)
    if (!account) return false

    if (amount > (authStore.user?.money || 0)) return false

    authStore.addMoney(-amount)
    account.balance += amount

    // Обновляем баланс в Supabase
    try {
      const { error } = await supabase
        .from('bank_accounts')
        .update({ balance: account.balance, updated_at: new Date().toISOString() })
        .eq('id', account.id)

      if (error) {
        console.error('❌ Ошибка при обновлении баланса счета:', error)
        return false
      }

      console.log('✅ Перевод на счет выполнен:', amount)
      return true
    } catch (err) {
      console.error('❌ Ошибка при переводе на счет:', err)
      return false
    }
  }

  async function transferFromAccount(amount: number, accountType: 'personal' | 'ip' | 'ooo'): Promise<boolean> {
    const account = getAccountByType(accountType)
    if (!account) return false

    if (amount > account.balance) return false

    account.balance -= amount
    authStore.addMoney(amount)

    // Обновляем баланс в Supabase
    try {
      const { error } = await supabase
        .from('bank_accounts')
        .update({ balance: account.balance, updated_at: new Date().toISOString() })
        .eq('id', account.id)

      if (error) {
        console.error('❌ Ошибка при обновлении баланса счета:', error)
        return false
      }

      console.log('✅ Перевод со счета выполнен:', amount)
      return true
    } catch (err) {
      console.error('❌ Ошибка при переводе со счета:', err)
      return false
    }
  }

  // Загрузка данных из Supabase
  async function loadBankData() {
    if (!authStore.user?.id) {
      console.log('⚠️ Нет авторизованного пользователя для загрузки банковских данных')
      return
    }

    console.log('🔄 Загрузка банковских данных для пользователя:', authStore.user.id)

    try {
      // Загружаем кредиты
      const { data: creditsData, error: creditsError } = await supabase
        .from('bank_credits')
        .select('*')
        .eq('user_id', authStore.user.id)

      if (!creditsError && creditsData) {
        credits.value = creditsData.map((c: any) => ({
          id: c.id,
          amount: c.amount,
          interestRate: c.interest_rate,
          termMonths: c.term_months,
          monthlyPayment: c.monthly_payment,
          remainingAmount: c.remaining_amount,
          remainingMonths: c.remaining_months,
          takenAt: c.taken_at,
          status: c.status
        }))
        console.log('✅ Загружены кредиты:', credits.value)
      }

      // Загружаем вклады
      const { data: depositsData, error: depositsError } = await supabase
        .from('bank_deposits')
        .select('*')
        .eq('user_id', authStore.user.id)

      if (depositsError) {
        console.error('❌ Ошибка при загрузке вкладов:', depositsError)
      } else {
        console.log('📊 Данные вкладов из Supabase:', depositsData)
        deposits.value = depositsData.map((d: any) => ({
          id: d.id,
          amount: d.amount,
          interestRate: d.interest_rate,
          termMonths: d.term_months,
          createdAt: d.created_at,
          maturityDate: d.maturity_date,
          status: d.status
        }))
        console.log('✅ Загружены вклады:', deposits.value)
      }

      // Загружаем счета
      const { data: accountsData, error: accountsError } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', authStore.user.id)

      if (!accountsError && accountsData) {
        accounts.value = accountsData.map((a: any) => ({
          id: a.id,
          type: a.account_type,
          balance: a.balance,
          createdAt: a.created_at,
          status: a.status
        }))
        console.log('✅ Загружены счета:', accounts.value)
      }
    } catch (err) {
      console.error('❌ Ошибка при загрузке банковских данных:', err)
    }
  }

  // Автоматическая загрузка данных при авторизации пользователя
  watch(() => authStore.user?.id, (userId) => {
    if (userId) {
      console.log('👤 Пользователь авторизован, загружаем банковские данные')
      loadBankData()
    } else {
      console.log('👤 Пользователь вышел, очищаем банковские данные')
      credits.value = []
      deposits.value = []
      accounts.value = []
    }
  }, { immediate: true })

  return {
    // Состояние
    credits,
    deposits,
    accounts,
    lastPaymentDate,
    
    // Вычисляемые свойства
    totalDebt,
    totalDeposits,
    monthlyPayments,
    creditRating,
    maxCreditAmount,
    availableCreditRates,
    availableDepositRates,
    
    // Методы
    calculateMonthlyPayment,
    takeCredit,
    makeDeposit,
    createAccount,
    processMonthlyPayments,
    getAccountByType,
    transferToAccount,
    transferFromAccount,
    loadBankData
  }
})
