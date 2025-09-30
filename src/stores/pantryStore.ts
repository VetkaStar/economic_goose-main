import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'

// Простейшие типы для локальной кладовой (дом гуся)
export interface PantryMaterial {
  id: string // локальный uuid или material_id из справочника, если есть
  name: string
  icon?: string
  price?: number
  quantity: number
  quality?: number | null
  durability?: number | null
  comfort?: number | null
  style?: number | null
}

export interface PantryProduct {
  id: string
  name: string
  icon?: string
  price?: number
  quantity: number
  meta?: Record<string, unknown>
}

export const usePantryStore = defineStore('pantry', () => {
  const auth = useAuthStore()

  const STORAGE_KEY = computed(() => `home_pantry_${auth.user?.id || 'guest'}`)

  const materials = ref<PantryMaterial[]>([])
  const products = ref<PantryProduct[]>([])

  const materialsSlots = computed(() => 10) // Фиксированное количество слотов для кладовой
  const productsSlots = computed(() => 10) // Фиксированное количество слотов для кладовой

  const materialsUsedSlots = computed(() => materials.value.length)
  const productsUsedSlots = computed(() => products.value.length)

  const canAddMaterialSlot = computed(() => materialsUsedSlots.value < materialsSlots.value)
  const canAddProductSlot = computed(() => productsUsedSlots.value < productsSlots.value)

  function save() {
    try {
      localStorage.setItem(
        STORAGE_KEY.value,
        JSON.stringify({ materials: materials.value, products: products.value })
      )
    } catch {}
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY.value)
      if (raw) {
        const parsed = JSON.parse(raw)
        
        // Миграция: добавляем недостающие поля к существующим материалам
        const migratedMaterials = (parsed.materials || []).map((material: any) => ({
          ...material,
          durability: material.durability ?? null,
          comfort: material.comfort ?? null,
          style: material.style ?? null,
        }))
        
        materials.value = migratedMaterials
        products.value = parsed.products || []
        
        console.log('📦 Материалы кладовой загружены:', migratedMaterials.length)
        if (migratedMaterials.length > 0) {
          console.log('📊 Пример материала:', migratedMaterials[0])
        }
      }
    } catch {}
  }

  load()
  watch([materials, products], save, { deep: true })

  function generateId() {
    if (typeof crypto !== 'undefined' && (crypto as any).randomUUID) {
      return (crypto as any).randomUUID()
    }
    return Math.random().toString(36).slice(2)
  }

  // Добавление материалов: объединяем по id+quality, если совпадает; иначе новый слот
  function addMaterial(payload: Omit<PantryMaterial, 'id'> & { id?: string }) {
    const id = payload.id || generateId()
    const same = materials.value.find(m => m.id === id || (m.name === payload.name && m.quality === payload.quality))
    if (same) {
      same.quantity += payload.quantity
      save()
      return true
    }
    if (!canAddMaterialSlot.value) return false
    materials.value.push({
      id,
      name: payload.name,
      icon: payload.icon,
      price: payload.price,
      quantity: payload.quantity,
      quality: payload.quality ?? null,
      durability: payload.durability ?? null,
      comfort: payload.comfort ?? null,
      style: payload.style ?? null,
    })
    save()
    return true
  }

  function removeMaterialByNameContains(substr: string, quantity: number): boolean {
    let need = quantity
    for (const m of materials.value) {
      if (m.name.toLowerCase().includes(substr.toLowerCase()) && need > 0) {
        const take = Math.min(m.quantity, need)
        m.quantity -= take
        need -= take
      }
    }
    materials.value = materials.value.filter(m => m.quantity > 0)
    save()
    return need === 0
  }

  function getQuantityByNameContains(substr: string): number {
    return materials.value
      .filter(m => m.name.toLowerCase().includes(substr.toLowerCase()))
      .reduce((s, m) => s + m.quantity, 0)
  }

  // Перенос материала из кладовой на склад
  async function transferMaterialToWarehouse(materialId: string, quantity: number): Promise<boolean> {
    try {
      const material = materials.value.find(m => m.id === materialId)
      if (!material || material.quantity < quantity) {
        console.log('❌ Материал не найден или недостаточно количества:', { materialId, material, quantity })
        return false
      }

      console.log('🔄 Переносим материал:', { 
        id: material.id, 
        name: material.name, 
        quantity,
        isUuid: material.id && material.id.length === 36 && material.id.includes('-')
      })

      // Импортируем warehouseStore для добавления на склад
      const { useWarehouseStore } = await import('@/stores/warehouseStore')
      const warehouseStore = useWarehouseStore()

      // Если материал уже имеет UUID (из базы данных), используем его напрямую
      if (material.id && material.id.length === 36 && material.id.includes('-')) {
        console.log('✅ Используем UUID напрямую:', material.id)
        // Это UUID, используем его напрямую
        const success = await warehouseStore.addMaterialToWarehouse(material.id, quantity)
        
        if (success) {
          // Уменьшаем количество в кладовой
          material.quantity -= quantity
          
          // Если материала не осталось, удаляем его из кладовой
          if (material.quantity <= 0) {
            const index = materials.value.findIndex(m => m.id === materialId)
            if (index !== -1) {
              materials.value.splice(index, 1)
            }
          }
          
          save()
          console.log(`📦 Перенесено ${quantity} единиц материала "${material.name}" на склад`)
          return true
        }
        return false
      }

      // Если это старый ID, ищем материал в базе данных по имени
      console.log('🔍 Ищем материал в базе данных по имени:', material.name)
      const { supabase } = await import('@/lib/supabase')
      
      const { data: materialInDb, error } = await supabase
        .from('warehouse_materials')
        .select('id')
        .eq('name', material.name)
        .single()

      if (error || !materialInDb) {
        console.error('❌ Материал не найден в базе данных:', material.name, error)
        return false
      }

      console.log('✅ Найден материал в базе данных:', materialInDb.id)
      // Добавляем материал на склад с правильным UUID
      const success = await warehouseStore.addMaterialToWarehouse(materialInDb.id, quantity)
      
      if (success) {
        // Уменьшаем количество в кладовой
        material.quantity -= quantity
        
        // Если материала не осталось, удаляем его из кладовой
        if (material.quantity <= 0) {
          const index = materials.value.findIndex(m => m.id === materialId)
          if (index !== -1) {
            materials.value.splice(index, 1)
          }
        }
        
        save()
        console.log(`📦 Перенесено ${quantity} единиц материала "${material.name}" на склад`)
        return true
      }

      return false
    } catch (error) {
      console.error('Ошибка при переносе материала на склад:', error)
      return false
    }
  }

  function addProduct(payload: Omit<PantryProduct, 'id'> & { id?: string }) {
    const id = payload.id || generateId()
    const same = products.value.find(p => p.name === payload.name)
    if (same) {
      same.quantity += payload.quantity
      save()
      return true
    }
    if (!canAddProductSlot.value) return false
    products.value.push({
      id,
      name: payload.name,
      icon: payload.icon,
      price: payload.price,
      quantity: payload.quantity,
      meta: payload.meta,
    })
    save()
    return true
  }

  return {
    // state
    materials,
    products,
    // capacity
    materialsSlots,
    productsSlots,
    materialsUsedSlots,
    productsUsedSlots,
    canAddMaterialSlot,
    canAddProductSlot,
    // actions
    addMaterial,
    addProduct,
    removeMaterialByNameContains,
    getQuantityByNameContains,
    transferMaterialToWarehouse,
    load,
    resetState() {
      materials.value = []
      products.value = []
      save()
    }
  }
})


