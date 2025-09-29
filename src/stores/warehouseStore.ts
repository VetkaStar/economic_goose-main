import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './authStore'
import type { 
  WarehouseMaterial, 
  WarehouseClothing, 
  WarehouseStats, 
  WarehouseSummary,
  WarehouseTransaction,
  WarehouseUpdateRequest 
} from '@/types/warehouse'

export const useWarehouseStore = defineStore('warehouse', () => {
  // Состояние склада
  const materials = ref<WarehouseMaterial[]>([])
  const clothing = ref<WarehouseClothing[]>([])
  const stats = ref<WarehouseStats | null>(null)
  const transactions = ref<WarehouseTransaction[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Получаем доступ к auth store для работы с деньгами
  const authStore = useAuthStore()

  // Вычисляемые свойства для статистики
  const materialsTotal = computed(() => {
    return materials.value.reduce((sum, material) => sum + material.quantity, 0)
  })

  const materialsValue = computed(() => {
    return materials.value.reduce((sum, material) => sum + (material.quantity * material.price), 0)
  })

  const clothingTotal = computed(() => {
    return clothing.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const clothingValue = computed(() => {
    return clothing.value.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  })

  const totalValue = computed(() => {
    return materialsValue.value + clothingValue.value
  })

  const warehouseCapacity = computed(() => {
    return stats.value?.capacity_percent || 0
  })

  const freeSpace = computed(() => {
    return stats.value?.free_space || 0
  })

  const summary = computed<WarehouseSummary>(() => ({
    materialsTotal: materialsTotal.value,
    materialsValue: materialsValue.value,
    clothingTotal: clothingTotal.value,
    clothingValue: clothingValue.value,
    totalValue: totalValue.value,
    capacityUsed: warehouseCapacity.value,
    freeSpace: freeSpace.value
  }))

  // Действия для работы с материалами
  const fetchMaterials = async () => {
    try {
      loading.value = true
      error.value = null
      
      console.log('📦 Загружаем материалы склада...')
      
      const { data, error: fetchError } = await supabase
        .from('warehouse_materials')
        .select('*')
        .order('name')

      if (fetchError) {
        console.error('❌ Ошибка загрузки материалов:', fetchError)
        throw fetchError
      }

      console.log('✅ Материалы загружены:', data)
      materials.value = data || []
    } catch (err) {
      error.value = 'Ошибка загрузки материалов'
      console.error('❌ Error fetching materials:', err)
    } finally {
      loading.value = false
    }
  }

  // Действия для работы с одеждой
  const fetchClothing = async () => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('warehouse_clothing')
        .select('*')
        .order('name')

      if (fetchError) {
        throw fetchError
      }

      clothing.value = data || []
    } catch (err) {
      error.value = 'Ошибка загрузки одежды'
      console.error('Error fetching clothing:', err)
    } finally {
      loading.value = false
    }
  }

  // Действия для работы со статистикой склада
  const fetchStats = async () => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('warehouse_stats')
        .select('*')
        .single()

      if (fetchError) {
        throw fetchError
      }

      stats.value = data
    } catch (err) {
      error.value = 'Ошибка загрузки статистики склада'
      console.error('Error fetching warehouse stats:', err)
    } finally {
      loading.value = false
    }
  }

  // Обновление количества материалов
  const updateMaterialQuantity = async (materialId: string, quantityChange: number, reason?: string) => {
    try {
      loading.value = true
      error.value = null

      const material = materials.value.find(m => m.id === materialId)
      if (!material) {
        throw new Error('Материал не найден')
      }

      const newQuantity = material.quantity + quantityChange
      if (newQuantity < 0) {
        throw new Error('Недостаточно материала на складе')
      }

      // Обновляем в базе данных
      const { error: updateError } = await supabase
        .from('warehouse_materials')
        .update({ quantity: newQuantity })
        .eq('id', materialId)

      if (updateError) {
        throw updateError
      }

      // Обновляем локальное состояние
      material.quantity = newQuantity
      
      // Записываем транзакцию
      await recordTransaction({
        itemType: 'material',
        itemId: materialId,
        quantityChange,
        reason
      })

    } catch (err) {
      error.value = 'Ошибка обновления количества материала'
      console.error('Error updating material quantity:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Обновление количества одежды
  const updateClothingQuantity = async (clothingId: string, quantityChange: number, reason?: string) => {
    try {
      loading.value = true
      error.value = null

      const clothingItem = clothing.value.find(c => c.id === clothingId)
      if (!clothingItem) {
        throw new Error('Одежда не найдена')
      }

      const newQuantity = clothingItem.quantity + quantityChange
      if (newQuantity < 0) {
        throw new Error('Недостаточно одежды на складе')
      }

      // Обновляем в базе данных
      const { error: updateError } = await supabase
        .from('warehouse_clothing')
        .update({ quantity: newQuantity })
        .eq('id', clothingId)

      if (updateError) {
        throw updateError
      }

      // Обновляем локальное состояние
      clothingItem.quantity = newQuantity
      
      // Записываем транзакцию
      await recordTransaction({
        itemType: 'clothing',
        itemId: clothingId,
        quantityChange,
        reason
      })

    } catch (err) {
      error.value = 'Ошибка обновления количества одежды'
      console.error('Error updating clothing quantity:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Запись транзакции
  const recordTransaction = async (update: WarehouseUpdateRequest) => {
    try {
      // Генерируем UUID используя crypto API
      const generateUUID = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
          return crypto.randomUUID()
        }
        // Fallback для старых браузеров
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0
          const v = c == 'x' ? r : (r & 0x3 | 0x8)
          return v.toString(16)
        })
      }

      const transaction: WarehouseTransaction = {
        id: generateUUID(),
        transaction_type: update.quantityChange > 0 ? 'in' : 'out',
        item_type: update.itemType,
        item_id: update.itemId, // Это уже UUID из базы данных
        item_name: update.itemType === 'material' 
          ? materials.value.find(m => m.id === update.itemId)?.name || 'Unknown'
          : clothing.value.find(c => c.id === update.itemId)?.name || 'Unknown',
        quantity_change: update.quantityChange,
        price_per_unit: update.itemType === 'material'
          ? materials.value.find(m => m.id === update.itemId)?.price || 0
          : clothing.value.find(c => c.id === update.itemId)?.price || 0,
        total_value: Math.abs(update.quantityChange) * (update.itemType === 'material'
          ? materials.value.find(m => m.id === update.itemId)?.price || 0
          : clothing.value.find(c => c.id === update.itemId)?.price || 0),
        reason: update.reason,
        performed_by: 'current_user', // Здесь будет ID текущего пользователя
        created_at: new Date().toISOString()
      }

      // Сохраняем транзакцию в базе данных
      const { error: insertError } = await supabase
        .from('warehouse_transactions')
        .insert(transaction)

      if (insertError) {
        throw insertError
      }

      transactions.value.unshift(transaction)

    } catch (err) {
      console.error('Error recording transaction:', err)
    }
  }

  // Покупка материалов
  const buyMaterial = async (materialId: string, quantity: number) => {
    try {
      loading.value = true
      error.value = null

      console.log('🛒 Покупка материала:', { materialId, quantity })

      const material = materials.value.find(m => m.id === materialId)
      if (!material) {
        throw new Error('Материал не найден')
      }

      const totalCost = material.price * quantity
      console.log('💰 Стоимость покупки:', totalCost)
      
      // Проверяем, достаточно ли денег у игрока
      if (!await authStore.spendMoney(totalCost)) {
        throw new Error('Недостаточно денег для покупки')
      }

      console.log('✅ Деньги списаны, обновляем количество в базе...')

      // При покупке УМЕНЬШАЕМ количество на складе
      const newQuantity = material.quantity - quantity
      if (newQuantity < 0) {
        throw new Error('Недостаточно товара на складе')
      }

      const { error: updateError } = await supabase
        .from('warehouse_materials')
        .update({ quantity: newQuantity })
        .eq('id', materialId)

      if (updateError) {
        throw updateError
      }

      // Обновляем локальное состояние
      material.quantity = newQuantity
      
      // Записываем транзакцию (отрицательное изменение - товар уходит со склада)
      await recordTransaction({
        itemType: 'material',
        itemId: materialId,
        quantityChange: -quantity, // Отрицательное значение - товар уходит
        reason: `Покупка игроком (${quantity} шт)`
      })
      
      // Добавляем опыт за покупку
      // Опыт будет добавлен через authStore позже(quantity * 2)

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка покупки материала'
      console.error('Error buying material:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Покупка одежды
  const buyClothing = async (clothingId: string, quantity: number) => {
    try {
      loading.value = true
      error.value = null

      const clothingItem = clothing.value.find(c => c.id === clothingId)
      if (!clothingItem) {
        throw new Error('Одежда не найдена')
      }

      const totalCost = clothingItem.price * quantity
      
      // Проверяем, достаточно ли денег у игрока
      if (!await authStore.spendMoney(totalCost)) {
        throw new Error('Недостаточно денег для покупки')
      }

      // При покупке УМЕНЬШАЕМ количество на складе
      const newQuantity = clothingItem.quantity - quantity
      if (newQuantity < 0) {
        throw new Error('Недостаточно товара на складе')
      }

      const { error: updateError } = await supabase
        .from('warehouse_clothing')
        .update({ quantity: newQuantity })
        .eq('id', clothingId)

      if (updateError) {
        throw updateError
      }

      // Обновляем локальное состояние
      clothingItem.quantity = newQuantity
      
      // Записываем транзакцию (отрицательное изменение - товар уходит со склада)
      await recordTransaction({
        itemType: 'clothing',
        itemId: clothingId,
        quantityChange: -quantity, // Отрицательное значение - товар уходит
        reason: `Покупка игроком (${quantity} шт)`
      })
      
      // Добавляем опыт за покупку
      // Опыт будет добавлен через authStore позже(quantity * 3)

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка покупки одежды'
      console.error('Error buying clothing:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Продажа материалов (игрок продает свои материалы на склад)
  const sellMaterial = async (materialId: string, quantity: number) => {
    try {
      loading.value = true
      error.value = null

      const material = materials.value.find(m => m.id === materialId)
      if (!material) {
        throw new Error('Материал не найден')
      }

      const totalValue = material.price * quantity * 0.8 // Склад покупает по 80% от цены
      
      // Добавляем деньги игроку
      await authStore.addMoney(totalValue)

      // Обновляем количество материала напрямую
      const { error: updateError } = await supabase
        .from('warehouse_materials')
        .update({ quantity: material.quantity + quantity })
        .eq('id', materialId)

      if (updateError) {
        throw updateError
      }

      // Обновляем локальное состояние
      material.quantity += quantity
      
      // Записываем транзакцию
      await recordTransaction({
        itemType: 'material',
        itemId: materialId,
        quantityChange: quantity,
        reason: `Продажа игроком (${quantity} шт)`
      })
      
      // Добавляем опыт за продажу
      // Опыт будет добавлен через authStore позже(quantity)

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка продажи материала'
      console.error('Error selling material:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Продажа одежды (игрок продает свою одежду на склад)
  const sellClothing = async (clothingId: string, quantity: number) => {
    try {
      loading.value = true
      error.value = null

      const clothingItem = clothing.value.find(c => c.id === clothingId)
      if (!clothingItem) {
        throw new Error('Одежда не найдена')
      }

      const totalValue = clothingItem.price * quantity * 0.8 // Склад покупает по 80% от цены
      
      // Добавляем деньги игроку
      await authStore.addMoney(totalValue)

      // Обновляем количество одежды напрямую
      const { error: updateError } = await supabase
        .from('warehouse_clothing')
        .update({ quantity: clothingItem.quantity + quantity })
        .eq('id', clothingId)

      if (updateError) {
        throw updateError
      }

      // Обновляем локальное состояние
      clothingItem.quantity += quantity
      
      // Записываем транзакцию
      await recordTransaction({
        itemType: 'clothing',
        itemId: clothingId,
        quantityChange: quantity,
        reason: `Продажа игроком (${quantity} шт)`
      })
      
      // Добавляем опыт за продажу
      // Опыт будет добавлен через authStore позже(quantity * 2)

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка продажи одежды'
      console.error('Error selling clothing:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Загрузка всех данных склада
  const loadWarehouseData = async () => {
    console.log('🏭 Загружаем данные склада...')
    try {
      await Promise.all([
        fetchMaterials(),
        fetchClothing(),
        fetchStats()
      ])
      console.log('✅ Данные склада загружены успешно')
    } catch (err) {
      console.error('❌ Ошибка загрузки данных склада:', err)
    }
  }

  // Сброс состояния склада
  const resetWarehouse = () => {
    materials.value = []
    clothing.value = []
    stats.value = null
    transactions.value = []
    error.value = null
  }

  return {
    // Состояние
    materials,
    clothing,
    stats,
    transactions,
    loading,
    error,
    
    // Вычисляемые свойства
    materialsTotal,
    materialsValue,
    clothingTotal,
    clothingValue,
    totalValue,
    warehouseCapacity,
    freeSpace,
    summary,
    
    // Действия
    fetchMaterials,
    fetchClothing,
    fetchStats,
    updateMaterialQuantity,
    updateClothingQuantity,
    recordTransaction,
    buyMaterial,
    buyClothing,
    sellMaterial,
    sellClothing,
    loadWarehouseData,
    resetWarehouse
  }
})
