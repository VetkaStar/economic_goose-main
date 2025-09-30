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

  // Доступные заказы (генерируются динамически)
  const availableOrders = ref<Order[]>([])

  // Генерация новых заказов
  const generateNewOrders = () => {
    const orderTemplates = [
      {
        clientName: 'Анна Петрова',
        itemName: 'Вечернее платье',
        price: 15000,
        dueDate: 3,
        complexity: 3,
        materials: ['fabric_silk', 'thread_gold', 'zipper']
      },
      {
        clientName: 'Михаил Соколов',
        itemName: 'Деловой костюм',
        price: 25000,
        dueDate: 7,
        complexity: 4,
        materials: ['fabric_wool', 'thread_black', 'buttons_pearl']
      },
      {
        clientName: 'Елена Козлова',
        itemName: 'Летнее платье',
        price: 8000,
        dueDate: 2,
        complexity: 2,
        materials: ['fabric_cotton', 'thread_white']
      },
      {
        clientName: 'Дмитрий Волков',
        itemName: 'Рубашка',
        price: 6000,
        dueDate: 1,
        complexity: 1,
        materials: ['fabric_cotton', 'thread_blue']
      },
      {
        clientName: 'Светлана Морозова',
        itemName: 'Пальто',
        price: 35000,
        dueDate: 10,
        complexity: 5,
        materials: ['fabric_wool', 'thread_black', 'buttons_wood', 'lining']
      },
      {
        clientName: 'Александр Новиков',
        itemName: 'Брюки',
        price: 12000,
        dueDate: 4,
        complexity: 3,
        materials: ['fabric_denim', 'thread_blue', 'zipper']
      }
    ]

    // Генерируем 2-4 случайных заказа
    const numOrders = Math.floor(Math.random() * 3) + 2 // 2-4 заказа
    const newOrders: Order[] = []
    
    for (let i = 0; i < numOrders; i++) {
      const template = orderTemplates[Math.floor(Math.random() * orderTemplates.length)]
      const order: Order = {
        id: `order_${Date.now()}_${i}`,
        ...template,
        progress: 0,
        status: 'pending',
        createdAt: Date.now()
      }
      newOrders.push(order)
    }
    
    availableOrders.value = newOrders
    console.log('📋 Сгенерированы новые заказы:', newOrders.length)
  }

  // Инициализация заказов
  generateNewOrders()

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
    // Можно брать заказы если есть хотя бы одно работающее оборудование
    // Сотрудники не обязательны для начала
    return atelierState.value.isRented && atelierState.value.equipment.some(e => e.isWorking)
  })

  // Методы
  const rentAtelier = async () => {
    if (!authStore.user) {
      console.log('❌ Нет пользователя для аренды ателье')
      return false
    }
    
    // Не списываем деньги - это уже сделал company.rent()
    console.log('🏭 Инициализация ателье (деньги уже списаны через company.rent)')
    
    atelierState.value.isRented = true
    atelierState.value.equipment = [...initialEquipment]
    console.log('✅ Ателье арендовано, добавлено оборудование:', atelierState.value.equipment.length)
    
    // Сохраняем в Supabase
    await saveAtelierState()
    console.log('💾 Состояние ателье сохранено')
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
    
    // Генерируем новый заказ взамен взятого
    if (availableOrders.value.length < 2) {
      generateNewOrders()
    }
    
    await saveAtelierState()
    return true
  }

  const checkMaterials = async (_materials: string[]) => {
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
    const hiredStaff = { ...staff, isWorking: true, hiredAt: Date.now() }
    atelierState.value.staff.push(hiredStaff)
    
    // Убираем из доступных для найма
    const staffIndex = availableStaff.value.findIndex(s => s.id === staffId)
    if (staffIndex !== -1) {
      availableStaff.value.splice(staffIndex, 1)
    }
    
    console.log('✅ Нанят сотрудник:', staff.name)
    await saveAtelierState()
    return true
  }

  const buyEquipment = async (equipmentId: string) => {
    const equipment = shopEquipment.value.find(e => e.id === equipmentId)
    if (!equipment || !authStore.user) return false
    
    if (authStore.user.money < equipment.price) return false
    
    const success = await authStore.spendMoney(equipment.price)
    if (!success) return false
    
    // Добавляем оборудование в ателье
    atelierState.value.equipment.push({ ...equipment })
    
    // Убираем из магазина
    const shopIndex = shopEquipment.value.findIndex(e => e.id === equipmentId)
    if (shopIndex !== -1) {
      shopEquipment.value.splice(shopIndex, 1)
    }
    
    console.log('✅ Куплено оборудование:', equipment.name)
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
    
    console.log('🔧 Отремонтировано оборудование:', equipment.name)
    await saveAtelierState()
    return true
  }

  const fireStaff = async (staffId: string) => {
    const staffIndex = atelierState.value.staff.findIndex(s => s.id === staffId)
    if (staffIndex === -1) return false
    
    const staff = atelierState.value.staff[staffIndex]
    
    // Возвращаем в доступные для найма
    availableStaff.value.push({
      ...staff,
      isWorking: false,
      hiredAt: 0
    })
    
    // Убираем из нанятых
    atelierState.value.staff.splice(staffIndex, 1)
    
    console.log('👋 Уволен сотрудник:', staff.name)
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
      
      if (data && data.atelier_data) {
        // Полностью заменяем состояние данными из базы
        atelierState.value = data.atelier_data
        
        // Если ателье арендовано, но нет оборудования - добавляем базовое
        if (atelierState.value.isRented && (!atelierState.value.equipment || atelierState.value.equipment.length === 0)) {
          atelierState.value.equipment = [...initialEquipment]
          console.log('🔧 Добавлено базовое оборудование при загрузке')
        }
        
        // Обновляем массивы сотрудников и оборудования
        if (data.atelier_data.equipment) {
          // Помечаем купленное оборудование как недоступное для покупки
          data.atelier_data.equipment.forEach((ownedEquipment: Equipment) => {
            const shopIndex = shopEquipment.value.findIndex(e => e.id === ownedEquipment.id)
            if (shopIndex !== -1) {
              shopEquipment.value.splice(shopIndex, 1)
            }
          })
        }
        
        if (data.atelier_data.staff) {
          // Помечаем нанятых сотрудников как недоступных для найма
          data.atelier_data.staff.forEach((hiredStaff: Staff) => {
            const staffIndex = availableStaff.value.findIndex(s => s.id === hiredStaff.id)
            if (staffIndex !== -1) {
              availableStaff.value.splice(staffIndex, 1)
            }
          })
        }
        
        console.log('✅ Загружено состояние ателье:', atelierState.value)
        console.log('🔧 Работающее оборудование:', atelierState.value.equipment.filter(e => e.isWorking).length)
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
    generateNewOrders,
    rentAtelier,
    takeOrder,
    workOnOrder,
    hireStaff,
    fireStaff,
    buyEquipment,
    repairEquipment,
    saveAtelierState,
    loadAtelierState
  }
})
