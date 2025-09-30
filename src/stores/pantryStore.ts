import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useCompanyStore } from '@/stores/companyStore'

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
  const company = useCompanyStore()

  const STORAGE_KEY = computed(() => `home_pantry_${auth.user?.id || 'guest'}`)

  const materials = ref<PantryMaterial[]>([])
  const products = ref<PantryProduct[]>([])

  const materialsSlots = computed(() => company.state.capacities.homePantry.materialsSlots)
  const productsSlots = computed(() => company.state.capacities.homePantry.productsSlots)

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
        materials.value = parsed.materials || []
        products.value = parsed.products || []
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
    load,
    resetState() {
      materials.value = []
      products.value = []
      save()
    }
  }
})


