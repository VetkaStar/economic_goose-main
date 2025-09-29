<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2>🧵 Закупка материалов</h2>
        <button class="close-btn" @click="close">✕</button>
      </div>

      <div class="modal-body">
        <!-- Прокручиваемая область с поставщиками и материалами -->
        <div class="scrollable-content">
          <div class="suppliers-layout">
            <!-- Список поставщиков слева -->
            <div class="suppliers-sidebar">
              <h3>Поставщики</h3>
              <div class="suppliers-list">
                <div 
                  v-for="supplier in suppliers" 
                  :key="supplier.id"
                  class="supplier-card"
                  :class="{ 
                    active: activeSupplier === supplier.id,
                    locked: supplier.contract_status === 'locked',
                    available: checkSupplierAccess(supplier)
                  }"
                  @click="selectSupplier(supplier.id)"
                >
                  <div class="supplier-icon">{{ supplier.icon }}</div>
                  <div class="supplier-info">
                    <div class="supplier-name">{{ supplier.name }}</div>
                    <div class="supplier-specialty">{{ supplier.specialty }}</div>
                    <div class="supplier-status" :class="supplier.contract_status">
                      {{ getContractStatusText(supplier.contract_status) }}
                    </div>
                    <div class="supplier-requirement" :class="{ 
                      'requirement-met': checkSupplierAccess(supplier),
                      'requirement-unmet': !checkSupplierAccess(supplier) 
                    }">
                      {{ getRequirementText(supplier) }}
                    </div>
              </div>
            </div>
          </div>
        </div>

            <!-- Материалы выбранного поставщика справа -->
            <div class="materials-content">
              <div v-if="!activeSupplier" class="no-supplier-selected">
                <div class="empty-icon">📋</div>
                <p>Выберите поставщика из списка слева</p>
            </div>
              
              <div v-else class="supplier-materials">
                <div class="supplier-header">
                  <h3>{{ currentSupplier?.name }}</h3>
                  <div class="supplier-meta">
                    <span class="supplier-country" v-if="currentSupplier?.country">🌍 {{ currentSupplier.country }}</span>
                    <span class="supplier-reliability" v-if="currentSupplier?.reliability">
                      📊 Надежность: {{ currentSupplier.reliability }}%
                    </span>
                    <span class="supplier-discount" v-if="currentSupplier?.discount_threshold">
                      💰 Скидка {{ currentSupplier.discount_percent }}% от ₽{{ currentSupplier.discount_threshold.toLocaleString() }}
                    </span>
                  </div>
                  <div class="contract-actions">
                    <button 
                      v-if="currentSupplier?.contract_status === 'locked'"
                      class="negotiate-btn locked"
                      disabled
                    >
                      🔒 Заблокирован
                    </button>
                    <button 
                      v-else-if="currentSupplier?.contract_status === 'none'"
                      class="negotiate-btn"
                      :class="{ disabled: !checkSupplierAccess(currentSupplier) }"
                      :disabled="!checkSupplierAccess(currentSupplier)"
                      @click="negotiateContract"
                    >
                      💼 Договориться
                    </button>
                    <span 
                      v-else-if="currentSupplier?.contract_status === 'negotiating'"
                      class="status-text"
                    >
                      ⏳ Переговоры...
                    </span>
                    <span 
                      v-else-if="currentSupplier?.contract_status === 'active'"
                      class="status-text active"
                    >
                      ✅ Контракт активен
                    </span>
              </div>
            </div>
                
                <div v-if="currentSupplier?.contract_status !== 'active'" class="contract-required">
                  <p>🤝 Для заказа материалов необходимо заключить контракт с поставщиком</p>
                </div>

                <div v-else class="materials-table">
            <table class="procurement-table">
              <thead>
                <tr>
                  <th>Материал</th>
                  <th>На складе</th>
                  <th>Цена за м</th>
                  <th>Качество</th>
                  <th>Свойства</th>
                  <th>Количество</th>
                  <th>Сумма</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="material in currentSupplierMaterials" :key="material.id" class="material-row">
                  <td class="material-info">
                    <div class="material-icon">{{ material.icon || '🧵' }}</div>
                    <div class="material-details">
                      <span class="material-name">{{ material.name }}</span>
                      <span class="material-description">{{ material.description }}</span>
                    </div>
                  </td>
                  <td class="stock-amount">
                    <span class="stock-value">{{ material.currentStock || 0 }} м</span>
                  </td>
                  <td class="price">₽{{ material.price.toLocaleString() }}</td>
                  <td class="quality">
                    <div class="quality-bar">
                      <div class="quality-fill" :style="{ 
                        width: material.quality + '%', 
                        backgroundColor: getQualityColor(material.quality) 
                      }"></div>
                      <span class="quality-text">{{ material.quality }}%</span>
              </div>
                    <div class="quality-label">{{ getQualityGrade(material.quality).label }}</div>
                  </td>
                  <td class="properties">
                    <div class="property-item" v-if="material.durability">
                      <span class="property-icon">🛡️</span>
                      <span class="property-value">{{ material.durability }}</span>
              </div>
                    <div class="property-item" v-if="material.comfort">
                      <span class="property-icon">😌</span>
                      <span class="property-value">{{ material.comfort }}</span>
              </div>
                    <div class="property-item" v-if="material.style">
                      <span class="property-icon">✨</span>
                      <span class="property-value">{{ material.style }}</span>
                    </div>
                  </td>
                  <td class="quantity-cell">
                    <input 
                      type="number" 
                      :value="material.orderQuantity || 0" 
                      min="0" 
                      max="1000"
                      class="quantity-input"
                      @input="updateOrderQuantity(material, $event)"
                    />
                  </td>
                  <td class="cost">₽{{ (material.price * (material.orderQuantity || 0)).toLocaleString() }}</td>
                </tr>
              </tbody>
            </table>
                </div>
              </div>
            </div>
            </div>
          </div>

        <!-- Фиксированная нижняя панель заказа -->
        <div class="fixed-order-panel">
          <div class="order-summary">
            <div class="summary-row">
              <span>Общее количество:</span>
              <strong>{{ totalQuantity }} м</strong>
                </div>
            <div class="summary-row">
              <span>Общая стоимость:</span>
              <strong>₽{{ totalCost.toLocaleString() }}</strong>
                </div>
            <div class="summary-row">
              <span>Остаток средств:</span>
              <strong class="balance-after" :class="{ negative: balanceAfter < 0 }">
                ₽{{ balanceAfter.toLocaleString() }}
              </strong>
              </div>
            </div>
          
          <div class="order-actions">
            <button 
              class="order-btn"
              @click="() => { console.log('Кнопка нажата!'); placeOrder(); }"
              :disabled="!canOrder"
              :style="{ 
                opacity: canOrder ? 1 : 0.5,
                backgroundColor: canOrder ? '#4CAF50' : '#ccc',
                cursor: canOrder ? 'pointer' : 'not-allowed'
              }"
            >
              💰 Заказать материалы ({{ canOrder ? 'активна' : 'заблокирована' }})
            </button>
            <button class="clear-btn" @click="clearOrder">
              🗑️ Очистить заказ
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useWarehouseStore } from '@/stores/warehouseStore'
import { useAuthStore } from '@/stores/authStore'
import { useSuppliers, type Supplier, type SupplierMaterial } from '@/composables/useSuppliers'
import { getQualityGrade } from '@/data/suppliers'
import { supabase } from '@/lib/supabase'

const warehouseStore = useWarehouseStore()
const authStore = useAuthStore()
const { suppliers, materials, loading, error, fetchSuppliers, fetchSupplierMaterials, updateContractStatus, getSupplierMaterials, getSupplier } = useSuppliers()

const emit = defineEmits<{
  close: []
}>()

const activeSupplier = ref<string | null>(null)

// Текущий выбранный поставщик
const currentSupplier = computed(() => 
  suppliers.value.find(s => s.id === activeSupplier.value)
)

// Материалы текущего поставщика
const currentSupplierMaterials = ref<SupplierMaterial[]>([])

// Обновляем материалы при смене поставщика
watch(activeSupplier, async (newSupplierId) => {
  if (!newSupplierId) {
    currentSupplierMaterials.value = []
    return
  }
  
  // Загружаем материалы поставщика из базы данных
  await fetchSupplierMaterials(newSupplierId)
  currentSupplierMaterials.value = materials.value.map(material => ({
    ...material,
    orderQuantity: 0
  }))
}, { immediate: true })

// Получаем иконку материала из инвентаря
function getInventoryMaterialIcon(materialId: string) {
  // Простое сопоставление по ID материала
  const iconMap: Record<string, string> = {
    'cotton': '🧵',
    'linen': '🌾', 
    'silk': '🕸️',
    'denim': '👖',
    'wool': '🐑',
    'leather': '🦌'
  }
  
  const baseMaterialId = materialId.replace(/_[a-zA-Z]+$/, '') // убираем суффиксы типа _bulk, _premium
  return iconMap[baseMaterialId] || '📦'
}

// Получаем цвет для индикатора качества используя новую градацию
function getQualityColor(quality: number) {
  const grade = getQualityGrade(quality)
  return grade.color
}

const totalCost = computed(() => {
  const result = currentSupplierMaterials.value.reduce((total, material) => {
    return total + (material.price * (material.orderQuantity || 0))
  }, 0)
  console.log('totalCost computed:', {
    materials: currentSupplierMaterials.value.map(m => ({
      id: m.id,
      price: m.price,
      orderQuantity: m.orderQuantity || 0
    })),
    result: result
  })
  return result
})

const totalQuantity = computed(() => {
  return currentSupplierMaterials.value.reduce((total, material) => {
    return total + (material.orderQuantity || 0)
  }, 0)
})

const balanceAfter = computed(() => {
  return (authStore.user?.money || 0) - totalCost.value
})

const canOrder = computed(() => {
  const result = totalCost.value > 0 && totalCost.value <= (authStore.user?.money || 0)
  console.log('canOrder computed:', {
    totalCost: totalCost.value,
    userMoney: authStore.user?.money || 0,
    result: result
  })
  return result
})


// Функции для работы с поставщиками
function selectSupplier(supplierId: string) {
  activeSupplier.value = supplierId
}

function getContractStatusText(status: string) {
  switch (status) {
    case 'locked': return 'Заблокирован'
    case 'none': return 'Нет контракта'
    case 'negotiating': return 'Переговоры'
    case 'active': return 'Активен'
    default: return 'Неизвестно'
  }
}

// Проверка условий доступа к поставщику
function checkSupplierAccess(supplier: Supplier) {
  if (supplier.access_type === 'starter') {
    return true // Стартовые поставщики всегда доступны
  }
  
  if (supplier.access_type === 'simple' && supplier.requirement_type === 'auto') {
    // Автоматическое одобрение через время (пока имитируем как доступное)
    return true
  }
  
  if (supplier.access_type === 'visit' && supplier.requirement_type === 'visit') {
    // Проверка посещения локации (пока имитируем как недоступное)
    return false
  }
  
  if (supplier.access_type === 'wealth' && supplier.requirement_type === 'money') {
    return (authStore.user?.money || 0) >= (supplier.requirement_amount || 0)
  }
  
  if (supplier.access_type === 'reputation' && supplier.requirement_type === 'reputation') {
    return (authStore.user?.level || 0) >= (supplier.requirement_amount || 0)
  }
  
  if (supplier.access_type === 'exclusive' && supplier.requirement_type === 'combined') {
    return (authStore.user?.money || 0) >= (supplier.requirement_money || 0) && (authStore.user?.level || 0) >= (supplier.requirement_reputation || 0)
  }
  
  return false
}

// Получить текст требований для поставщика
function getRequirementText(supplier: Supplier) {
  if (supplier.access_type === 'starter') {
    return '✅ Доступен'
  }
  
  if (supplier.access_type === 'simple') {
    return '⏳ Автоодобрение'
  }
  
  if (supplier.access_type === 'visit') {
    return '🗺️ Нужно посетить'
  }
  
  if (supplier.access_type === 'wealth') {
    const hasEnough = (authStore.user?.money || 0) >= (supplier.requirement_amount || 0)
    return hasEnough ? '✅ Капитал достаточен' : `💰 Нужно ₽${(supplier.requirement_amount || 0).toLocaleString()}`
  }
  
  if (supplier.access_type === 'reputation') {
    const hasEnough = (authStore.user?.level || 0) >= (supplier.requirement_amount || 0)
    return hasEnough ? '✅ Уровень достаточен' : `⭐ Нужно ${supplier.requirement_amount || 0} уровня`
  }
  
  if (supplier.access_type === 'exclusive') {
    const hasMoneyEnough = (authStore.user?.money || 0) >= (supplier.requirement_money || 0)
    const hasReputationEnough = (authStore.user?.level || 0) >= (supplier.requirement_reputation || 0)
    
    if (hasMoneyEnough && hasReputationEnough) {
      return '✅ Требования выполнены'
    } else if (!hasMoneyEnough && !hasReputationEnough) {
      return `💎 Нужно ₽${(supplier.requirement_money || 0).toLocaleString()} + ${supplier.requirement_reputation || 0} репутации`
    } else if (!hasMoneyEnough) {
      return `💰 Нужно ₽${(supplier.requirement_money || 0).toLocaleString()}`
    } else {
      return `⭐ Нужно ${supplier.requirement_reputation || 0} уровня`
    }
  }
  
  return 'Условия не определены'
}

async function negotiateContract() {
  if (!currentSupplier.value) return
  
  // Проверяем условия доступа
  if (!checkSupplierAccess(currentSupplier.value)) {
    return // Не можем заключить контракт если условия не выполнены
  }
  
  // Обновляем статус на "переговоры"
  await updateContractStatus(currentSupplier.value.id, 'negotiating')
  
  // Через 2 секунды контракт становится активным
  setTimeout(async () => {
    if (currentSupplier.value) {
      await updateContractStatus(currentSupplier.value.id, 'active')
    }
  }, 2000)
}

// Функция для разблокировки поставщика (когда игрок выполнил условия)
async function unlockSupplier(supplierId: string) {
  const supplier = suppliers.value.find(s => s.id === supplierId)
  if (supplier && supplier.contract_status === 'locked') {
    await updateContractStatus(supplierId, 'none')
  }
}

// Проверяем статус поставщиков при изменении баланса/уровня
watch([() => authStore.user?.money, () => authStore.user?.level], () => {
  suppliers.value.forEach(supplier => {
    if (supplier.contract_status === 'locked' && checkSupplierAccess(supplier)) {
      unlockSupplier(supplier.id)
    }
  })
})

function updateOrderQuantity(material: SupplierMaterial, event: Event) {
  const target = event.target as HTMLInputElement
  const quantity = parseInt(target.value) || 0
  material.orderQuantity = quantity
}

function clearOrder() {
  currentSupplierMaterials.value.forEach(material => {
    material.orderQuantity = 0
  })
}

async function placeOrder() {
  console.log('placeOrder - функция вызвана!')
  console.log('placeOrder - canOrder.value:', canOrder.value)
  console.log('placeOrder - totalCost.value:', totalCost.value)
  console.log('placeOrder - userMoney:', authStore.user?.money)
  
  if (canOrder.value) {
    console.log('placeOrder - заказ может быть выполнен, переходим к обработке')
    const orderedMaterials = currentSupplierMaterials.value.filter(m => (m.orderQuantity || 0) > 0)
    console.log('placeOrder - orderedMaterials:', orderedMaterials)
    
    // Списываем деньги
    await authStore.spendMoney(totalCost.value)
    
    // Получаем полный справочник материалов
    const materialsCatalog = (window as any).__warehouseMaterialsCatalog || []
    
    // Добавляем каждый товар на склад игрока
    for (const material of orderedMaterials) {
      console.log(`🔍 Ищем материал: ${material.name}`)
      console.log('📋 Доступные материалы в базе:', materialsCatalog.map((m: any) => m.name))
      
      // Находим соответствующий материал в базе данных склада
      // Сначала ищем точное совпадение
      let existingMaterial = materialsCatalog.find((m: any) => 
        m.name.toLowerCase() === material.name.toLowerCase()
      )
      console.log('🔍 Точное совпадение:', existingMaterial?.name || 'не найдено')
      
      // Если не найдено, ищем по ключевым словам
      if (!existingMaterial) {
        const keywords = material.name.toLowerCase().split(' ')
        console.log('🔍 Ключевые слова:', keywords)
        existingMaterial = materialsCatalog.find((m: any) => {
          const materialName = m.name.toLowerCase()
          const found = keywords.some((keyword: string) => materialName.includes(keyword))
          if (found) console.log(`✅ Найдено по ключевому слову: ${m.name}`)
          return found
        })
      }
      
      // Если все еще не найдено, ищем по частичному совпадению
      if (!existingMaterial) {
        const materialWords = material.name.toLowerCase().split(' ')
        console.log('🔍 Поиск по частичному совпадению:', materialWords.filter((w: string) => w.length > 3))
        existingMaterial = materialsCatalog.find((m: any) => {
          const materialName = m.name.toLowerCase()
          const found = materialWords.some((word: string) => 
            word.length > 3 && materialName.includes(word)
          )
          if (found) console.log(`✅ Найдено по частичному совпадению: ${m.name}`)
          return found
        })
      }
      
      console.log('📋 Найденный материал:', existingMaterial)
      
      if (existingMaterial) {
        // Если материал уже есть в базе warehouse_materials, добавляем в персональный склад
        console.log(`✅ Добавляем ${material.orderQuantity || 0} м материала ${existingMaterial.name} (ID: ${existingMaterial.id})`)
        console.log(`📊 Качество от поставщика: ${material.quality}%`)
        
        // Проверяем, есть ли уже партия с таким же качеством
        const { data: existingInventory } = await supabase
          .from('user_warehouse_inventory')
          .select('quantity, quality')
          .eq('user_id', authStore.user?.id)
          .eq('material_id', existingMaterial.id)
          .eq('quality', material.quality)
          .maybeSingle()
        
        if (existingInventory) {
          // Есть партия с таким же качеством - добавляем к ней
          const currentQuantity = existingInventory.quantity || 0
          const newQuantity = currentQuantity + (material.orderQuantity || 0)
          
          const { error } = await supabase
            .from('user_warehouse_inventory')
            .update({
              quantity: newQuantity,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', authStore.user?.id)
            .eq('material_id', existingMaterial.id)
            .eq('quality', material.quality)
          
          if (error) {
            console.error('❌ Ошибка обновления инвентаря:', error)
          } else {
            console.log(`✅ Добавлено к существующей партии: ${currentQuantity} + ${material.orderQuantity} = ${newQuantity} м`)
          }
        } else {
          // Нет партии с таким качеством - создаём новую
          // Конвертируем свойства из 0-100 в 0-10
          const convertTo10 = (value: number | undefined) => 
            value ? Math.round(value / 10) : null
          
          const { error } = await supabase
            .from('user_warehouse_inventory')
            .insert({
              user_id: authStore.user?.id,
              material_id: existingMaterial.id,
              quantity: material.orderQuantity || 0,
              quality: material.quality,
              durability: convertTo10(material.durability),
              comfort: convertTo10(material.comfort),
              style: convertTo10(material.style),
              supplier_id: activeSupplier.value || null
            })
          
          if (error) {
            console.error('❌ Ошибка создания новой партии:', error)
          } else {
            console.log(`✅ Создана новая партия материала с качеством ${material.quality}%: ${material.orderQuantity} м`)
          }
        }
      } else {
        // Если материала нет в базе, создаем новый
        console.log(`🆕 Создаём новый материал: ${material.name}`)
        console.log('📊 Свойства материала:', {
          name: material.name,
          icon: material.icon,
          price: material.price,
          quality: material.quality,
          durability: material.durability,
          comfort: material.comfort,
          style: material.style
        })
        
        // Конвертируем свойства из 0-100 в 0-10
        const convertTo10 = (value: number | undefined) => 
          value ? Math.round(value / 10) : null
        
        // Сначала создаем материал в warehouse_materials
        const { data: newMaterial, error: createError } = await supabase
          .from('warehouse_materials')
          .insert({
            name: material.name,
            icon: material.icon || '🧵',
            quantity: 0, // В warehouse_materials количество всегда 0 (это справочник)
            price: Math.round(material.price),
            quality: material.quality || 50, // Качество в процентах (0-100)
            durability: convertTo10(material.durability),
            comfort: convertTo10(material.comfort),
            style: convertTo10(material.style),
            description: material.description || null,
            category: 'material'
          })
          .select()
          .single()
        
        if (createError) {
          console.error('❌ Ошибка создания материала:', createError)
        } else if (newMaterial) {
          console.log('✅ Материал создан в справочнике:', newMaterial)
          
          // Добавляем в персональный склад игрока
          const { error: inventoryError } = await supabase
            .from('user_warehouse_inventory')
            .insert({
              user_id: authStore.user?.id,
              material_id: newMaterial.id,
              quantity: material.orderQuantity || 0,
              quality: material.quality,
              durability: convertTo10(material.durability),
              comfort: convertTo10(material.comfort),
              style: convertTo10(material.style),
              supplier_id: activeSupplier.value || null
            })
          
          if (inventoryError) {
            console.error('❌ Ошибка добавления в персональный склад:', inventoryError)
          } else {
            console.log(`✅ Материал добавлен в персональный склад: ${material.orderQuantity} м`)
            
            // Обновляем справочник
            if ((window as any).__warehouseMaterialsCatalog) {
              (window as any).__warehouseMaterialsCatalog.push(newMaterial)
            }
          }
        }
      }
    }
    
    // Сохраняем сумму до сброса количества
    const spentAmount = totalCost.value
    
    // Очищаем количества заказа
    orderedMaterials.forEach(material => {
      material.orderQuantity = 0
    })
    
    // Обновляем склад после покупки
    await warehouseStore.fetchMaterials()
    console.log('🔄 Склад обновлён после покупки')
    
    // TODO: Записать в статистику расходов
    console.log(`💰 Потрачено на материалы: ${spentAmount}₽`)
    
    console.log(`✅ Заказано материалов на ₽${spentAmount}`)
    close()
  } else {
    console.log('placeOrder - заказ не может быть выполнен!')
    console.log('placeOrder - canOrder.value:', canOrder.value)
    console.log('placeOrder - totalCost.value:', totalCost.value)
    console.log('placeOrder - userMoney:', authStore.user?.money)
  }
}

// Загружаем инвентарь при открытии модального окна
onMounted(async () => {
  // Загружаем справочник материалов для поиска
  if (!(window as any).__warehouseMaterialsCatalog) {
    const { data } = await supabase
      .from('warehouse_materials')
      .select('*')
      .order('name');
    (window as any).__warehouseMaterialsCatalog = data || []
    console.log('📚 Справочник материалов загружен:', data?.length)
  }
  
  // Загружаем поставщиков из базы данных
  await fetchSuppliers()
  
  // Устанавливаем первого поставщика как активного по умолчанию
  if (suppliers.value.length > 0) {
    activeSupplier.value = suppliers.value[0].id
  }
  
  // Слушаем событие посещения промышленного района
  const handleIndustrialVisit = (event: CustomEvent) => {
    if (event.detail.location === 'industrial_district') {
      const visitedBuilding = event.detail.building
      
      // Разблокируем поставщиков, которые требуют посещения конкретного здания
      suppliers.value.forEach(supplier => {
        if (supplier.access_type === 'visit' && 
            supplier.requirement_type === 'visit' && 
            supplier.requirement_location === visitedBuilding) {
          updateContractStatus(supplier.id, 'none')
        }
      })
      
      const buildingMessages = {
        'textile_mill': 'Джинсовая фабрика теперь доступна!',
        'dye_house': 'Поставщик красителей теперь доступен!',
        'warehouse_complex': 'Оптовый склад теперь доступен!',
        'transport_hub': 'Международная логистика теперь доступна!',
        'quality_lab': 'Лаборатория премиум качества теперь доступна!'
      }
      
      console.log(`${event.detail.buildingName} посещена! ${buildingMessages[visitedBuilding as keyof typeof buildingMessages]}`)
    }
  }
  
  window.addEventListener('industrial-district-visited', handleIndustrialVisit as EventListener)
})

function close() {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(5px);
}

 .modal-content {
   background: linear-gradient(135deg, #fff7e6 0%, #fef3c7 100%);
   border: 4px solid #d8b86a;
  border-radius: 20px;
   padding: 30px;
   width: 95%;
   max-width: 1400px;
   max-height: 95vh;
   overflow-y: auto;
   box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
 }

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 800;
  color: #3a2b16;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #7a4b16;
  padding: 5px;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

 .modal-body {
  display: flex;
   flex-direction: column;
   min-height: 700px; /* Увеличена высота */
}

 .scrollable-content {
  flex: 1;
  overflow-y: auto;
   margin-bottom: 20px;
 }

 .suppliers-layout {
   display: grid;
   grid-template-columns: 350px 1fr;
   gap: 25px;
   min-height: 200px;
 }

 .suppliers-sidebar {
   background: #fff7e6;
   border: 2px solid #d8b86a;
   border-radius: 15px;
  padding: 20px;
   height: fit-content;
   max-height: 600px;
  overflow-y: auto;
   display: flex;
   flex-direction: column;
 }

.suppliers-sidebar h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
  font-weight: 800;
  color: #3a2b16;
}

 .suppliers-list {
   display: flex;
   flex-direction: column;
   gap: 10px;
   flex: 1;
   overflow-y: auto;
 }

.supplier-card {
  background: #fef4d1;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
}

.supplier-card.locked {
  opacity: 0.6;
  border-color: #ccc;
  background: #f5f5f5;
  cursor: not-allowed;
}

.supplier-card.locked:hover {
  border-color: #ccc;
  box-shadow: none;
}

.supplier-card.available {
  border-left: 4px solid #4CAF50;
}

.supplier-card:hover {
  border-color: #d8b86a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.supplier-card.active {
  border-color: #b8860b;
  background: #f4dcb3;
  box-shadow: 0 4px 15px rgba(184, 134, 11, 0.2);
}

.supplier-icon {
  font-size: 24px;
  width: 40px;
  text-align: center;
}

.supplier-info {
  flex: 1;
}

.supplier-name {
  font-weight: 700;
  font-size: 14px;
  color: #1e293b;
  margin-bottom: 2px;
}

.supplier-specialty {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.supplier-status {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
}

.supplier-status.none {
  background: #fef2f2;
  color: #dc2626;
}

.supplier-status.negotiating {
  background: #fef3c7;
  color: #d97706;
}

.supplier-status.active {
  background: #dcfce7;
  color: #16a34a;
}

.supplier-status.locked {
  color: #999;
  background: rgba(153, 153, 153, 0.1);
}

.supplier-requirement {
  font-size: 10px;
  margin-top: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.supplier-requirement.requirement-met {
  color: #4CAF50;
  background: rgba(76, 175, 80, 0.1);
}

.supplier-requirement.requirement-unmet {
  color: #F44336;
  background: rgba(244, 67, 54, 0.1);
}

.materials-content {
  background: #fef4d1;
  border: 2px solid #d8b86a;
  border-radius: 15px;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.no-supplier-selected {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #6b7280;
  min-height: 300px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.supplier-materials {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.supplier-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #d8b86a;
}

.supplier-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: #3a2b16;
}

.contract-actions {
  display: flex;
  align-items: center;
}

.negotiate-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.negotiate-btn:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-1px);
}

.negotiate-btn.locked {
  background: #ccc !important;
  color: #666 !important;
  cursor: not-allowed !important;
}

.negotiate-btn.disabled {
  background: #e0e0e0 !important;
  color: #999 !important;
  cursor: not-allowed !important;
}

.negotiate-btn.disabled:hover {
  transform: none !important;
}

.status-text {
  font-weight: 600;
  color: #6b7280;
}

.status-text.active {
  color: #16a34a;
}

.contract-required {
  background: #fef3c7;
  border: 2px solid #f59e0b;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  color: #92400e;
  font-weight: 600;
  margin-bottom: 20px;
}

.materials-table {
  background: #fef4d1;
  border: 3px solid #d8b86a;
  border-radius: 15px;
  overflow: hidden;
  margin-bottom: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.procurement-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.procurement-table th {
  background: #fff7e6;
  border-bottom: 2px solid #d8b86a;
  padding: 12px 8px;
  text-align: left;
  font-weight: 700;
  color: #3a2b16;
  font-size: 13px;
}

.procurement-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #f2e3bf;
  vertical-align: middle;
}

.material-row:hover {
  background: #fff7e6;
}

.material-info {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-width: 200px;
}

.material-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.material-details {
  display: flex;
  flex-direction: column;
}

.material-name {
  font-weight: 600;
  color: #3a2b16;
  margin-bottom: 2px;
}

.material-description {
  font-size: 11px;
  color: #6b7280;
  font-style: italic;
  line-height: 1.3;
}


.stock-amount {
  min-width: 100px;
}

.stock-value {
  font-weight: 600;
  color: #1e293b;
}


.price {
  font-weight: 600;
  color: #059669;
  min-width: 80px;
}

.quality {
  min-width: 120px;
  text-align: center;
}

.quality-bar {
  position: relative;
  background: #f2e3bf;
  border-radius: 8px;
  height: 16px;
  overflow: hidden;
  margin: 0 auto 4px;
  width: 80px;
}

.quality-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.quality-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 11px;
  font-weight: 600;
  color: #1e293b;
  text-shadow: 0 0 2px rgba(255, 255, 255, 0.8);
}

.quality-label {
  font-size: 10px;
  font-weight: 600;
  margin-top: 2px;
}

.properties {
  text-align: center;
  min-width: 120px;
}

.property-item {
  display: inline-block;
  margin: 0 2px 2px 0;
  font-size: 10px;
  background: rgba(216, 184, 106, 0.1);
  padding: 2px 4px;
  border-radius: 4px;
  border: 1px solid rgba(216, 184, 106, 0.3);
}

.property-icon {
  font-size: 8px;
  margin-right: 2px;
}

.property-value {
  font-weight: 600;
  color: #3a2b16;
}

.supplier-meta {
  display: flex;
  gap: 15px;
  margin: 8px 0;
  font-size: 12px;
  color: #6b7280;
}

.supplier-country,
.supplier-reliability,
.supplier-discount {
  display: flex;
  align-items: center;
  gap: 4px;
}

.quantity-cell {
  min-width: 100px;
}

.quantity-input {
  width: 80px;
  padding: 6px 8px;
  border: 2px solid #d8b86a;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
  background: #fef4d1;
  color: #333;
  font-weight: 500;
}

.quantity-input:focus {
  border-color: #b8860b;
  outline: none;
}

.quantity-input:disabled {
  background: #f5f5f5;
  color: #999;
}

.cost {
  font-weight: 700;
  color: #059669;
  min-width: 90px;
}


 .fixed-order-panel {
   background: linear-gradient(135deg, #fff7e6 0%, #fef3c7 100%);
   border: 3px solid #d8b86a;
   border-radius: 15px;
   padding: 20px;
   box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.1);
   flex-shrink: 0; /* Не сжимается */
 }

 .order-summary {
   display: grid;
   grid-template-columns: 1fr 1fr 1fr;
   gap: 20px;
   margin-bottom: 15px;
   background: rgba(216, 184, 106, 0.1);
   border-radius: 10px;
   padding: 15px;
 }

 .summary-row {
   display: flex;
   flex-direction: column;
   align-items: center;
   text-align: center;
   gap: 5px;
 }

 .summary-row span {
  font-size: 12px;
   color: #6b7280;
   font-weight: 500;
   text-transform: uppercase;
   letter-spacing: 0.5px;
 }

 .summary-row strong {
   font-size: 18px;
   font-weight: 700;
   color: #3a2b16;
 }

 .balance-after.negative {
   color: #dc2626 !important;
 }

 .order-actions {
   display: flex;
   gap: 15px;
 }

.order-btn {
  flex: 1;
  padding: 15px;
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.order-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #15803d 0%, #166534 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(22, 163, 74, 0.3);
}

.order-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.clear-btn {
  padding: 15px 25px;
  background: #fff7e6;
  color: #7a4b16;
  border: 2px solid #d8b86a;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: #f4dcb3;
  border-color: #b8860b;
}
</style>
