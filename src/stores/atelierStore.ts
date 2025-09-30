import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './authStore'

export interface Order {
  id: string
  clientName: string
  itemName: string
  price: number
  progress: number
  status: 'in_progress' | 'completed' | 'pending'
  dueDate: number // игровые дни
  createdAt: number
  complexity: number // 1-5, влияет на время выполнения
  materials: string[] // ID материалов
}

export interface Equipment {
  id: string
  name: string
  type: 'sewing_machine' | 'overlock' | 'mannequin' | 'ironing_board' | 'cutting_table' | 'fabric_cutter'
  level: number
  efficiency: number // 0-100, влияет на скорость работы
  condition: number // 0-100, влияет на качество
  price: number
  isWorking: boolean
  icon: string
}

export interface Staff {
  id: string
  name: string
  position: 'seamstress' | 'cutter' | 'manager' | 'buyer'
  skill: number // 0-100
  salary: number // в месяц
  efficiency: number // 0-100, влияет на скорость работы
  isWorking: boolean
  hiredAt: number
}

export interface AtelierState {
  isRented: boolean
  monthlyRent: number
  orders: Order[]
  equipment: Equipment[]
  staff: Staff[]
  reputation: number // 0-100
  dailyIncome: number
  monthlyIncome: number
  activeOrders: number
  completedOrders: number
}

export const useAtelierStore = defineStore('atelier', () => {
  const authStore = useAuthStore()
  
  // Состояние ателье
  const atelierState = ref<AtelierState>({
    isRented: false,
    monthlyRent: 15000,
    orders: [],
    equipment: [],
    staff: [],
    reputation: 0,
    dailyIncome: 0,
    monthlyIncome: 0,
    activeOrders: 0,
    completedOrders: 0
  })

  // Базовое оборудование при аренде
  const initialEquipment: Equipment[] = [
    {
      id: 'basic_sewing_machine',
      name: 'Базовая швейная машина',
      type: 'sewing_machine',
      level: 1,
      efficiency: 50,
      condition: 80,
      price: 0,
      isWorking: true,
      icon: '🧵'
    }
  ]

  // Доступные заказы
  const availableOrders = ref<Order[]>([
    {
      id: 'order_1',
      clientName: 'Анна Петрова',
      itemName: 'Вечернее платье',
      price: 15000,
      progress: 0,
      status: 'pending',
      dueDate: 3,
      createdAt: 0,
      complexity: 3,
      materials: ['fabric_silk', 'thread_gold', 'zipper']
    },
    {
      id: 'order_2',
      clientName: 'Михаил Соколов',
      itemName: 'Костюм на заказ',
      price: 25000,
      progress: 0,
      status: 'pending',
      dueDate: 5,
      createdAt: 0,
      complexity: 4,
      materials: ['fabric_wool', 'thread_black', 'buttons']
    },
    {
      id: 'order_3',
      clientName: 'Елена Козлова',
      itemName: 'Платье для выпускного',
      price: 12000,
      progress: 0,
      status: 'pending',
      dueDate: 2,
      createdAt: 0,
      complexity: 2,
      materials: ['fabric_satin', 'thread_white', 'lace']
    }
  ])

  // Доступные сотрудники для найма
  const availableStaff = ref<Staff[]>([
    {
      id: 'staff_1',
      name: 'Мария Иванова',
      position: 'seamstress',
      skill: 85,
      salary: 30000,
      efficiency: 80,
      isWorking: false,
      hiredAt: 0
    },
    {
      id: 'staff_2',
      name: 'Ольга Смирнова',
      position: 'cutter',
      skill: 72,
      salary: 25000,
      efficiency: 75,
      isWorking: false,
      hiredAt: 0
    },
    {
      id: 'staff_3',
      name: 'Татьяна Козлова',
      position: 'manager',
      skill: 90,
      salary: 35000,
      efficiency: 85,
      isWorking: false,
      hiredAt: 0
    }
  ])

  // Доступное оборудование для покупки
  const shopEquipment = ref<Equipment[]>([
    {
      id: 'sewing_machine_pro',
      name: 'Профессиональная швейная машина',
      type: 'sewing_machine',
      level: 3,
      efficiency: 90,
      condition: 100,
      price: 50000,
      isWorking: true,
      icon: '🧵'
    },
    {
      id: 'overlock_juki',
      name: 'Оверлок Juki',
      type: 'overlock',
      level: 2,
      efficiency: 80,
      condition: 100,
      price: 35000,
      isWorking: true,
      icon: '⚡'
    },
    {
      id: 'mannequin_pro',
      name: 'Профессиональный манекен',
      type: 'mannequin',
      level: 2,
      efficiency: 70,
      condition: 100,
      price: 20000,
      isWorking: true,
      icon: '👗'
    },
    {
      id: 'ironing_board_pro',
      name: 'Профессиональная гладильная доска',
      type: 'ironing_board',
      level: 2,
      efficiency: 60,
      condition: 100,
      price: 15000,
      isWorking: true,
      icon: '🔥'
    },
    {
      id: 'cutting_table_pro',
      name: 'Профессиональный раскройный стол',
      type: 'cutting_table',
      level: 2,
      efficiency: 75,
      condition: 100,
      price: 25000,
      isWorking: true,
      icon: '📏'
    }
  ])

  // Computed свойства
  const totalEfficiency = computed(() => {
    const staffEfficiency = atelierState.value.staff
      .filter(s => s.isWorking)
      .reduce((sum, s) => sum + s.efficiency, 0)
    
    const equipmentEfficiency = atelierState.value.equipment
      .filter(e => e.isWorking)
      .reduce((sum, e) => sum + e.efficiency, 0)
    
    return Math.min(100, staffEfficiency + equipmentEfficiency)
  })

  const dailyExpenses = computed(() => {
    return atelierState.value.staff
      .filter(s => s.isWorking)
      .reduce((sum, s) => sum + s.salary / 30, 0) // дневная зарплата
  })

  const canTakeOrder = computed(() => {
    return atelierState.value.equipment.some(e => e.isWorking) && 
           atelierState.value.staff.some(s => s.isWorking)
  })

  // Методы
  const rentAtelier = async () => {
    if (!authStore.user) return false
    
    const success = await authStore.spendMoney(atelierState.value.monthlyRent)
    if (!success) return false
    
    atelierState.value.isRented = true
    atelierState.value.equipment = [...initialEquipment]
    
    // Сохраняем в Supabase
    await saveAtelierState()
    return true
  }

  const takeOrder = async (orderId: string) => {
    const order = availableOrders.value.find(o => o.id === orderId)
    if (!order || !canTakeOrder.value) return false
    
    // Проверяем материалы
    const hasMaterials = await checkMaterials(order.materials)
    if (!hasMaterials) return false
    
    // Добавляем заказ
    const newOrder = { ...order, status: 'in_progress' as const, createdAt: Date.now() }
    atelierState.value.orders.push(newOrder)
    atelierState.value.activeOrders++
    
    // Удаляем из доступных
    availableOrders.value = availableOrders.value.filter(o => o.id !== orderId)
    
    await saveAtelierState()
    return true
  }

  const checkMaterials = async (materials: string[]) => {
    // Проверяем наличие материалов на складе
    // Пока возвращаем true, позже интегрируем с warehouseStore
    return true
  }

  const workOnOrder = async (orderId: string, progress: number) => {
    const order = atelierState.value.orders.find(o => o.id === orderId)
    if (!order) return false
    
    order.progress = Math.min(100, order.progress + progress)
    
    if (order.progress >= 100) {
      order.status = 'completed'
      atelierState.value.activeOrders--
      atelierState.value.completedOrders++
      
      // Начисляем деньги
      await authStore.addMoney(order.price)
      
      // Удаляем заказ
      atelierState.value.orders = atelierState.value.orders.filter(o => o.id !== orderId)
    }
    
    await saveAtelierState()
    return true
  }

  const hireStaff = async (staffId: string) => {
    const staff = availableStaff.value.find(s => s.id === staffId)
    if (!staff || !authStore.user) return false
    
    // Проверяем баланс (первый месяц зарплаты)
    if (authStore.user.money < staff.salary) return false
    
    // Списываем зарплату
    const success = await authStore.spendMoney(staff.salary)
    if (!success) return false
    
    // Нанимаем
    staff.isWorking = true
    staff.hiredAt = Date.now()
    atelierState.value.staff.push({ ...staff })
    
    await saveAtelierState()
    return true
  }

  const buyEquipment = async (equipmentId: string) => {
    const equipment = shopEquipment.value.find(e => e.id === equipmentId)
    if (!equipment || !authStore.user) return false
    
    if (authStore.user.money < equipment.price) return false
    
    const success = await authStore.spendMoney(equipment.price)
    if (!success) return false
    
    atelierState.value.equipment.push({ ...equipment })
    
    await saveAtelierState()
    return true
  }

  const repairEquipment = async (equipmentId: string) => {
    const equipment = atelierState.value.equipment.find(e => e.id === equipmentId)
    if (!equipment) return false
    
    const repairCost = Math.floor(equipment.price * 0.1) // 10% от стоимости
    if (!authStore.user || authStore.user.money < repairCost) return false
    
    const success = await authStore.spendMoney(repairCost)
    if (!success) return false
    
    equipment.condition = 100
    equipment.isWorking = true
    
    await saveAtelierState()
    return true
  }

  const saveAtelierState = async () => {
    if (!authStore.user) return
    
    try {
      const { error } = await supabase
        .from('user_atelier')
        .upsert({
          user_id: authStore.user.id,
          atelier_data: atelierState.value
        })
      
      if (error) throw error
    } catch (error) {
      console.error('Ошибка сохранения состояния ателье:', error)
    }
  }

  const loadAtelierState = async () => {
    if (!authStore.user) return
    
    try {
      const { data, error } = await supabase
        .from('user_atelier')
        .select('atelier_data')
        .eq('user_id', authStore.user.id)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      
      if (data) {
        atelierState.value = { ...atelierState.value, ...data.atelier_data }
      }
    } catch (error) {
      console.error('Ошибка загрузки состояния ателье:', error)
    }
  }

  return {
    // State
    atelierState,
    availableOrders,
    availableStaff,
    shopEquipment,
    
    // Computed
    totalEfficiency,
    dailyExpenses,
    canTakeOrder,
    
    // Methods
    rentAtelier,
    takeOrder,
    workOnOrder,
    hireStaff,
    buyEquipment,
    repairEquipment,
    saveAtelierState,
    loadAtelierState
  }
})
