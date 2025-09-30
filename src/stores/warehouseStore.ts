import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './authStore'
import { useCompanyStore } from './companyStore'
import { usePantryStore } from './pantryStore'
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
    // Если нет таблицы статистики — считаем по слотам из companyStore
    const companyStore = useCompanyStore()
    const slots = companyStore.state.capacities?.warehouse?.slots || companyStore.state.capacities?.homePantry?.materialsSlots || 0
    const used = materialsTotal.value + clothingTotal.value
    return slots > 0 ? Math.min(100, Math.round((used / slots) * 100)) : 0
  })

  const freeSpace = computed(() => {
    const companyStore = useCompanyStore()
    const slots = companyStore.state.capacities?.warehouse?.slots || companyStore.state.capacities?.homePantry?.materialsSlots || 0
    const used = materialsTotal.value + clothingTotal.value
    return Math.max(0, slots - used)
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
      console.log('📦 Загружаем материалы склада...')
      
      // Загружаем ВСЕ материалы из warehouse_materials для справочника
      const { data: allMaterialsData, error: allMaterialsError } = await supabase
        .from('warehouse_materials')
        .select('*')
        .order('name')

      if (allMaterialsError) {
        console.error('❌ Ошибка загрузки справочника материалов:', allMaterialsError)
        throw allMaterialsError
      }

      // Загружаем персональный инвентарь игрока
      if (authStore.user?.id) {
        console.log('👤 Загружаем персональный инвентарь для пользователя:', authStore.user.id)
        
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('user_warehouse_inventory')
          .select(`
            quantity,
            material_id,
            quality,
            durability,
            comfort,
            style,
            warehouse_materials (
              id,
              name,
              icon,
              price,
              description
            )
          `)
          .eq('user_id', authStore.user.id)

        console.log('📊 Результат запроса инвентаря:', { inventoryData, inventoryError })

        if (inventoryError) {
          console.error('❌ Ошибка загрузки персонального инвентаря:', inventoryError)
        } else if (inventoryData && inventoryData.length > 0) {
          // Преобразуем данные: объединяем информацию о материале с количеством
          const userMaterials = inventoryData.map((item: any) => ({
            id: item.warehouse_materials.id,
            name: item.warehouse_materials.name,
            icon: item.warehouse_materials.icon,
            quantity: item.quantity,
            price: item.warehouse_materials.price,
            quality: item.quality, // Качество из партии, а не из справочника
            durability: item.durability, // Свойства из партии
            comfort: item.comfort,
            style: item.style,
            description: item.warehouse_materials.description,
            category: 'material'
          }))
          
          console.log('✅ Персональный инвентарь загружен:', userMaterials)
          materials.value = userMaterials
          
          // Сохраняем полный справочник для использования при закупках
          if (!(window as any).__warehouseMaterialsCatalog) {
            (window as any).__warehouseMaterialsCatalog = allMaterialsData
          }
          return
        } else {
          console.log('📦 Персональный инвентарь пуст (length = 0)')
        }
      } else {
        console.log('❌ Нет авторизованного пользователя')
      }

      // Если нет авторизации или нет персонального инвентаря, показываем пустой склад
      console.log('📦 Персональный инвентарь пуст или нет авторизации')
      materials.value = []
      
      // Сохраняем полный справочник
      if (!(window as any).__warehouseMaterialsCatalog) {
        (window as any).__warehouseMaterialsCatalog = allMaterialsData || []
      }
    } catch (err) {
      console.error('❌ Error fetching materials:', err)
      throw err
    }
  }

  // Действия для работы с одеждой
  const fetchClothing = async () => {
    try {
      console.log('👕 Загружаем одежду склада...')
      
      // Загружаем персональный инвентарь одежды игрока
      if (authStore.user?.id) {
        console.log('👤 Загружаем персональную одежду для пользователя:', authStore.user.id)
        
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('user_clothing_inventory')
          .select(`
            quantity,
            clothing_id,
            quality,
            durability,
            comfort,
            style,
            warehouse_clothing (
              id,
              name,
              icon,
              price,
              description
            )
          `)
          .eq('user_id', authStore.user.id)

        console.log('📊 Результат запроса одежды:', { inventoryData, inventoryError })

        if (inventoryError) {
          console.error('❌ Ошибка загрузки персональной одежды:', inventoryError)
        } else if (inventoryData && inventoryData.length > 0) {
          // Преобразуем данные: объединяем информацию об одежде с количеством
          const userClothing = inventoryData.map((item: any) => ({
            id: item.warehouse_clothing.id,
            name: item.warehouse_clothing.name,
            icon: item.warehouse_clothing.icon,
            quantity: item.quantity,
            price: item.warehouse_clothing.price,
            quality: item.quality,
            durability: item.durability,
            comfort: item.comfort,
            style: item.style,
            description: item.warehouse_clothing.description,
            category: 'clothing'
          }))
          
          console.log('✅ Персональная одежда загружена:', userClothing)
          clothing.value = userClothing
          return
        } else {
          console.log('👕 Персональная одежда пуста (length = 0)')
        }
      } else {
        console.log('❌ Нет авторизованного пользователя')
      }

      // Если нет авторизации или нет персонального инвентаря, показываем пустой склад
      console.log('👕 Персональная одежда пуста или нет авторизации')
      clothing.value = []
    } catch (err) {
      console.error('❌ Error fetching clothing:', err)
      throw err
    }
  }

  // Действия для работы со статистикой склада
  const fetchStats = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('warehouse_stats')
        .select('*')
        .single()

      if (fetchError) {
        throw fetchError
      }

      stats.value = data
    } catch (err) {
      console.error('Error fetching warehouse stats:', err)
      throw err
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

      // Обновляем в базе данных персональную запись пользователя
      const { error: updateError } = await supabase
        .from('user_warehouse_inventory')
        .update({ quantity: newQuantity })
        .eq('user_id', authStore.user?.id || '')
        .eq('material_id', materialId)

      if (updateError) {
        throw updateError
      }

      // Обновляем локальное состояние реактивно
      material.quantity = newQuantity
      
      // Принудительно обновляем массив для Vue
      materials.value = [...materials.value]
      
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

      // Обновляем локальное состояние реактивно
      clothingItem.quantity = newQuantity
      
      // Принудительно обновляем массив для Vue
      clothing.value = [...clothing.value]
      
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


  // Продажа материалов (игрок продает свои материалы со склада)
  const sellMaterial = async (materialId: string, quantity: number) => {
    try {
      console.log(`💰 Начинаем продажу материала ${materialId}, количество: ${quantity}`)
      
      const material = materials.value.find(m => m.id === materialId)
      if (!material) {
        throw new Error('Материал не найден')
      }

      console.log(`📦 Текущее количество материала: ${material.quantity}`)

      // Проверяем, достаточно ли материала на складе игрока
      if (material.quantity < quantity) {
        throw new Error('Недостаточно материала на складе')
      }

      const totalValue = material.price * quantity * 0.8 // Продаем по 80% от цены
      console.log(`💵 Стоимость продажи: ${totalValue}₽`)
      
      // Добавляем деньги игроку
      await authStore.addMoney(totalValue)

      // При продаже УМЕНЬШАЕМ количество на складе игрока (товар уходит)
      const newQuantity = material.quantity - quantity
      console.log(`📦 Новое количество должно быть: ${newQuantity}`)

      const { error: updateError } = await supabase
        .from('user_warehouse_inventory')
        .update({ quantity: newQuantity })
        .eq('user_id', authStore.user?.id || '')
        .eq('material_id', materialId)

      if (updateError) {
        console.error('❌ Ошибка обновления в базе:', updateError)
        throw updateError
      }

      console.log('✅ База данных обновлена успешно')

      // Обновляем локальное состояние реактивно - как в authStore
      const materialIndex = materials.value.findIndex(m => m.id === materialId)
      if (materialIndex !== -1) {
        // Создаем новый массив с обновленным объектом
        const updatedMaterials = [...materials.value]
        updatedMaterials[materialIndex] = {
          ...updatedMaterials[materialIndex],
          quantity: newQuantity
        }
        // Присваиваем новый массив напрямую (как user.value.money = newAmount)
        materials.value = updatedMaterials
        console.log(`✅ Локальное состояние обновлено: ${materials.value[materialIndex].quantity}`)
      }
      
      // Записываем транзакцию
      await recordTransaction({
        itemType: 'material',
        itemId: materialId,
        quantityChange: -quantity, // Отрицательное значение - товар уходит
        reason: `Продажа игроком (${quantity} шт)`
      })
      
      console.log('✅ Продажа завершена успешно')
      return true
    } catch (err) {
      console.error('❌ Ошибка продажи материала:', err)
      return false
    }
  }

  // Продажа одежды (игрок продает свою одежду со склада)
  const sellClothing = async (clothingId: string, quantity: number) => {
    try {
      console.log(`👗 Начинаем продажу одежды ${clothingId}, количество: ${quantity}`)
      
      const clothingItem = clothing.value.find(c => c.id === clothingId)
      if (!clothingItem) {
        throw new Error('Одежда не найдена')
      }

      console.log(`📦 Текущее количество одежды: ${clothingItem.quantity}`)

      // Проверяем, достаточно ли одежды на складе игрока
      if (clothingItem.quantity < quantity) {
        throw new Error('Недостаточно одежды на складе')
      }

      const totalValue = clothingItem.price * quantity * 0.8 // Продаем по 80% от цены
      console.log(`💵 Стоимость продажи: ${totalValue}₽`)
      
      // Добавляем деньги игроку
      await authStore.addMoney(totalValue)

      // При продаже УМЕНЬШАЕМ количество на складе игрока (товар уходит)
      const newQuantity = clothingItem.quantity - quantity
      console.log(`📦 Новое количество должно быть: ${newQuantity}`)

      const { error: updateError } = await supabase
        .from('warehouse_clothing')
        .update({ quantity: newQuantity })
        .eq('id', clothingId)

      if (updateError) {
        console.error('❌ Ошибка обновления в базе:', updateError)
        throw updateError
      }

      console.log('✅ База данных обновлена успешно')

      // Обновляем локальное состояние реактивно - как в authStore
      const clothingIndex = clothing.value.findIndex(c => c.id === clothingId)
      if (clothingIndex !== -1) {
        // Создаем новый массив с обновленным объектом
        const updatedClothing = [...clothing.value]
        updatedClothing[clothingIndex] = {
          ...updatedClothing[clothingIndex],
          quantity: newQuantity
        }
        // Присваиваем новый массив напрямую (как user.value.money = newAmount)
        clothing.value = updatedClothing
        console.log(`✅ Локальное состояние обновлено: ${clothing.value[clothingIndex].quantity}`)
      }
      
      // Записываем транзакцию
      await recordTransaction({
        itemType: 'clothing',
        itemId: clothingId,
        quantityChange: -quantity, // Отрицательное значение - товар уходит
        reason: `Продажа игроком (${quantity} шт)`
      })
      
      console.log('✅ Продажа одежды завершена успешно')
      return true
    } catch (err) {
      console.error('❌ Ошибка продажи одежды:', err)
      return false
    }
  }

  // Добавление материала на склад игрока (при покупке в магазине)
  const addMaterialToWarehouse = async (materialId: string, quantity: number) => {
    try {
      if (!authStore.user?.id) {
        throw new Error('Пользователь не авторизован')
      }

      console.log(`📦 Добавляем материал ${materialId} количество: ${quantity}`)

      // Получаем информацию о материале из базы
      const { data: materialInfo } = await supabase
        .from('warehouse_materials')
        .select('*')
        .eq('id', materialId)
        .single()

      if (!materialInfo) {
        throw new Error('Материал не найден в базе данных')
      }

      // Проверяем, есть ли уже этот материал с таким же качеством в персональном складе
      const { data: existingInventory } = await supabase
        .from('user_warehouse_inventory')
        .select('quantity')
        .eq('user_id', authStore.user.id)
        .eq('material_id', materialId)
        .eq('quality', materialInfo.quality)
        .single()

      const currentQuantity = existingInventory?.quantity || 0
      const newQuantity = currentQuantity + quantity

      // Обновляем или создаем запись в персональном складе
      const { error: upsertError } = await supabase
        .from('user_warehouse_inventory')
        .upsert({
          user_id: authStore.user.id,
          material_id: materialId,
          quantity: newQuantity,
          quality: materialInfo.quality,
          durability: materialInfo.durability,
          comfort: materialInfo.comfort,
          style: materialInfo.style
        }, {
          onConflict: 'user_id,material_id,quality'
        })

      if (upsertError) {
        throw upsertError
      }

      console.log(`✅ Материал обновлён: ${currentQuantity} + ${quantity} = ${newQuantity}`)

      // Обновляем локальное состояние
      const materialIndex = materials.value.findIndex(m => m.id === materialId)
      if (materialIndex !== -1) {
        const updatedMaterials = [...materials.value]
        updatedMaterials[materialIndex] = {
          ...updatedMaterials[materialIndex],
          quantity: newQuantity
        }
        materials.value = updatedMaterials
      } else {
        // Если материала еще нет в локальном стейте, перезагружаем
        await fetchMaterials()
      }
      
      // Записываем транзакцию
      await recordTransaction({
        itemType: 'material',
        itemId: materialId,
        quantityChange: quantity,
        reason: `Покупка в магазине (${quantity} м)`
      })

      return true
    } catch (err) {
      console.error('Error adding material to warehouse:', err)
      return false
    }
  }

  // Новая функция для правильной маршрутизации материалов
  const addMaterialToCorrectStorage = async (materialId: string, quantity: number, materialData?: any) => {
    try {
      const companyStore = useCompanyStore()
      const pantryStore = usePantryStore()
      
      // Проверяем, арендован ли склад
      if (companyStore.isWarehouseAvailable) {
        // Если склад арендован - отправляем в основной склад
        console.log('📦 Склад арендован, отправляем материал в основной склад')
        return await addMaterialToWarehouse(materialId, quantity)
      } else {
        // Если склад не арендован - отправляем в кладовую дома
        console.log('🏠 Склад не арендован, отправляем материал в кладовую дома')
        
        // Получаем данные о материале из базы
        const { data: materialInfo } = await supabase
          .from('warehouse_materials')
          .select('*')
          .eq('id', materialId)
          .single()
        
        if (materialInfo) {
          console.log('📦 Добавляем материал в кладовую из базы данных:', {
            name: materialInfo.name,
            quality: materialInfo.quality,
            durability: materialInfo.durability,
            comfort: materialInfo.comfort,
            style: materialInfo.style
          })
          return pantryStore.addMaterial({
            id: materialId, // Сохраняем UUID для корректного переноса
            name: materialInfo.name,
            icon: materialInfo.icon,
            price: materialInfo.price,
            quantity: quantity,
            quality: materialInfo.quality,
            durability: materialInfo.durability,
            comfort: materialInfo.comfort,
            style: materialInfo.style
          })
        } else if (materialData) {
          // Если материал новый, используем переданные данные
          console.log('📦 Добавляем материал в кладовую из переданных данных:', {
            name: materialData.name,
            quality: materialData.quality,
            durability: materialData.durability,
            comfort: materialData.comfort,
            style: materialData.style
          })
          return pantryStore.addMaterial({
            id: materialId, // Сохраняем UUID для корректного переноса
            name: materialData.name,
            icon: materialData.icon,
            price: materialData.price,
            quantity: quantity,
            quality: materialData.quality,
            durability: materialData.durability,
            comfort: materialData.comfort,
            style: materialData.style
          })
        } else {
          throw new Error('Данные о материале не найдены')
        }
      }
    } catch (err) {
      console.error('Error adding material to correct storage:', err)
      return false
    }
  }

  // Добавление одежды на склад игрока (при покупке в магазине)
  const addClothingToWarehouse = async (clothingId: string, quantity: number) => {
    try {
      const clothingItem = clothing.value.find(c => c.id === clothingId)
      if (!clothingItem) {
        throw new Error('Одежда не найдена')
      }

      // Увеличиваем количество на складе игрока
      const newQuantity = clothingItem.quantity + quantity

      const { error: updateError } = await supabase
        .from('warehouse_clothing')
        .update({ quantity: newQuantity })
        .eq('id', clothingId)

      if (updateError) {
        throw updateError
      }

      // Обновляем локальное состояние реактивно - как в authStore
      const clothingIndex = clothing.value.findIndex(c => c.id === clothingId)
      if (clothingIndex !== -1) {
        // Создаем новый массив с обновленным объектом
        const updatedClothing = [...clothing.value]
        updatedClothing[clothingIndex] = {
          ...updatedClothing[clothingIndex],
          quantity: newQuantity
        }
        // Присваиваем новый массив напрямую (как user.value.money = newAmount)
        clothing.value = updatedClothing
      }
      
      // Записываем транзакцию
      await recordTransaction({
        itemType: 'clothing',
        itemId: clothingId,
        quantityChange: quantity, // Положительное значение - товар приходит
        reason: `Покупка в магазине (${quantity} шт)`
      })

      return true
    } catch (err) {
      console.error('Error adding clothing to warehouse:', err)
      return false
    }
  }

  // Загрузка всех данных склада
  const loadWarehouseData = async () => {
    console.log('🏭 Загружаем данные склада...')
    console.log('🔄 Устанавливаем loading = true')
    loading.value = true
    error.value = null
    
    try {
      await Promise.all([
        fetchMaterials(),
        fetchClothing(),
        fetchStats()
      ])
      console.log('✅ Данные склада загружены успешно')
    } catch (err) {
      console.error('❌ Ошибка загрузки данных склада:', err)
      error.value = 'Ошибка загрузки данных склада'
    } finally {
      console.log('🔄 Устанавливаем loading = false')
      loading.value = false
      console.log('✅ Состояние loading сброшено')
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
    sellMaterial,
    sellClothing,
    addMaterialToWarehouse,
    addClothingToWarehouse,
    addMaterialToCorrectStorage,
    loadWarehouseData,
    resetWarehouse
  }
})
