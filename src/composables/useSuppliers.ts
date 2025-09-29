import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export interface Supplier {
  id: string
  name: string
  icon: string
  specialty: string
  country: string
  reliability: number
  discount_threshold: number
  discount_percent: number
  contract_status: 'locked' | 'none' | 'negotiating' | 'active'
  access_type: 'starter' | 'simple' | 'visit' | 'wealth' | 'reputation' | 'exclusive'
  requirement_type?: string
  requirement_amount?: number
  requirement_money?: number
  requirement_reputation?: number
  requirement_location?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SupplierMaterial {
  id: string
  supplier_id: string
  name: string
  price: number
  quality: number
  description: string
  durability: number
  comfort: number
  style: number
  min_order_quantity: number
  max_order_quantity: number
  delivery_time: number
  is_available: boolean
  created_at: string
  updated_at: string
  orderQuantity?: number
  icon?: string
  currentStock?: number
}

export function useSuppliers() {
  const suppliers = ref<Supplier[]>([])
  const materials = ref<SupplierMaterial[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Загрузка всех поставщиков
  const fetchSuppliers = async () => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('suppliers')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (fetchError) throw fetchError

      suppliers.value = data || []
      console.log('📦 Поставщики загружены:', suppliers.value.length)
    } catch (err) {
      console.error('❌ Ошибка загрузки поставщиков:', err)
      error.value = err instanceof Error ? err.message : 'Неизвестная ошибка'
    } finally {
      loading.value = false
    }
  }

  // Загрузка материалов поставщика
  const fetchSupplierMaterials = async (supplierId: string) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('supplier_materials')
        .select('*')
        .eq('supplier_id', supplierId)
        .eq('is_available', true)
        .order('name')

      if (fetchError) throw fetchError

      materials.value = data || []
      console.log(`📦 Материалы поставщика ${supplierId} загружены:`, materials.value.length)
    } catch (err) {
      console.error('❌ Ошибка загрузки материалов поставщика:', err)
      error.value = err instanceof Error ? err.message : 'Неизвестная ошибка'
    } finally {
      loading.value = false
    }
  }

  // Обновление статуса контракта поставщика
  const updateContractStatus = async (supplierId: string, status: Supplier['contract_status']) => {
    try {
      const { error: updateError } = await supabase
        .from('suppliers')
        .update({ 
          contract_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', supplierId)

      if (updateError) throw updateError

      // Обновляем локальное состояние
      const supplier = suppliers.value.find(s => s.id === supplierId)
      if (supplier) {
        supplier.contract_status = status
        supplier.updated_at = new Date().toISOString()
      }

      console.log(`✅ Статус контракта поставщика ${supplierId} обновлен на ${status}`)
    } catch (err) {
      console.error('❌ Ошибка обновления статуса контракта:', err)
      error.value = err instanceof Error ? err.message : 'Неизвестная ошибка'
    }
  }

  // Получение материалов поставщика по ID
  const getSupplierMaterials = (supplierId: string) => {
    return materials.value.filter(m => m.supplier_id === supplierId)
  }

  // Получение поставщика по ID
  const getSupplier = (supplierId: string) => {
    return suppliers.value.find(s => s.id === supplierId)
  }

  return {
    suppliers: computed(() => suppliers.value),
    materials: computed(() => materials.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchSuppliers,
    fetchSupplierMaterials,
    updateContractStatus,
    getSupplierMaterials,
    getSupplier
  }
}
