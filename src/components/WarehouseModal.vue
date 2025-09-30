<template>
  <div class="warehouse-modal-overlay" @click="closeModal">
    <div class="warehouse-modal" @click.stop>
      <!-- Заголовок -->
      <div class="warehouse-header">
        <div class="header-left">
          <h2>📦 Мой склад</h2>
        </div>
        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <!-- Уведомления -->
      <div v-if="notification" class="notification" :class="notification.type">
        <span class="notification-icon">{{ notification.type === 'success' ? '✅' : '❌' }}</span>
        <span class="notification-message">{{ notification.message }}</span>
      </div>

      <!-- Основной контент -->
      <div class="warehouse-content">
        <!-- Индикатор загрузки -->
        <div v-if="initialLoading" class="loading-indicator">
          <div class="spinner"></div>
          <p>Загрузка данных склада...</p>
        </div>

        <!-- Ошибка загрузки -->
        <div v-else-if="error" class="error-message">
          <p>❌ {{ error }}</p>
          <button @click="warehouseStore.loadWarehouseData()" class="retry-btn">Повторить</button>
        </div>

        <!-- Основной контент -->
        <template v-else>
          <!-- Левая панель - Инвентарь -->
          <div class="inventory-panel">
            <div class="table-skeleton" v-if="!materials || !clothing">
              <div class="row" v-for="i in 5" :key="i"></div>
            </div>
            
            <!-- Материалы -->
            <div class="inventory-section">
              <h4>🧵 Материалы</h4>
              <div v-if="materialsWithStock.length === 0" class="empty-section">
                <p>📦 На складе нет материалов</p>
              </div>
              <div v-else class="inventory-grid">
                <div v-for="(material, index) in materialsWithStock" :key="`${material.id}-${index}`" class="inventory-item">
                  <div class="item-icon">{{ material.icon }}</div>
                  <div class="item-info">
                    <div class="item-name">{{ material.name }}</div>
                    <div class="item-stats">
                      <div class="stat-row">
                        <span class="stat-label">Количество</span>
                        <span class="stat-value">{{ material.quantity }} м</span>
                      </div>
                      <div class="stat-row">
                        <span class="stat-label">Качество</span>
                        <span class="stat-value">{{ material.quality }}%</span>
                      </div>
                      <div v-if="material.durability" class="stat-row">
                        <span class="stat-label">🛡️ Прочность</span>
                        <span class="stat-value">{{ material.durability }}/10</span>
                      </div>
                      <div v-if="material.comfort" class="stat-row">
                        <span class="stat-label">😌 Комфорт</span>
                        <span class="stat-value">{{ material.comfort }}/10</span>
                      </div>
                      <div v-if="material.style" class="stat-row">
                        <span class="stat-label">✨ Стиль</span>
                        <span class="stat-value">{{ material.style }}/10</span>
                      </div>
                    </div>
                    <div class="item-price-tag">💰 {{ material.price }}₽/м</div>
                  </div>
                  <div class="item-value">
                    <div class="total-value">{{ (material.quantity * material.price).toLocaleString() }}₽</div>
                  </div>
                  <div class="item-actions">
                    <div class="quantity-controls">
                      <input 
                        type="number" 
                        :id="`material-quantity-${material.id}`"
                        :max="material.quantity"
                        min="1"
                        :value="1"
                        class="quantity-input"
                        :disabled="loading.value"
                      />
                      <button 
                        @click="handleSellMaterial(material.id, getQuantityInput(`material-quantity-${material.id}`))" 
                        class="action-btn sell-btn"
                        :disabled="material.quantity < 1 || loading.value"
                        title="Продать указанное количество"
                      >
                        Продать
                      </button>
                      <button 
                        @click="handleSellMaterial(material.id, material.quantity)" 
                        class="action-btn sell-all-btn"
                        :disabled="material.quantity < 1 || loading.value"
                        title="Продать всё"
                      >
                        Всё
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Готовая одежда -->
            <div class="inventory-section">
              <h4>👕 Готовая одежда</h4>
              <div v-if="clothingWithStock.length === 0" class="empty-section">
                <p>👕 На складе нет готовой одежды</p>
              </div>
              <div v-else class="inventory-grid">
                <div v-for="clothingItem in clothingWithStock" :key="clothingItem.id" class="inventory-item">
                  <div class="item-icon">{{ clothingItem.icon }}</div>
                  <div class="item-info">
                    <div class="item-name">{{ clothingItem.name }}</div>
                    <div class="item-quantity">{{ clothingItem.quantity }} шт</div>
                    <div class="item-price">{{ clothingItem.price }}₽ за шт</div>
                    <div class="item-details" v-if="clothingItem.size || clothingItem.color">
                      {{ clothingItem.size }} {{ clothingItem.color }}
                    </div>
                  </div>
                  <div class="item-value">
                    <div class="total-value">{{ (clothingItem.quantity * clothingItem.price).toLocaleString() }}₽</div>
                  </div>
                  <div class="item-actions">
                    <div class="quantity-controls">
                      <input 
                        type="number" 
                        :id="`clothing-quantity-${clothingItem.id}`"
                        :max="clothingItem.quantity"
                        min="1"
                        :value="1"
                        class="quantity-input"
                        :disabled="loading.value"
                      />
                      <button 
                        @click="handleSellClothing(clothingItem.id, getQuantityInput(`clothing-quantity-${clothingItem.id}`))" 
                        class="action-btn sell-btn"
                        :disabled="clothingItem.quantity < 1 || loading.value"
                        title="Продать указанное количество"
                      >
                        Продать
                      </button>
                      <button 
                        @click="handleSellClothing(clothingItem.id, clothingItem.quantity)" 
                        class="action-btn sell-all-btn"
                        :disabled="clothingItem.quantity < 1 || loading.value"
                        title="Продать всё"
                      >
                        Всё
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Правая панель - Статистика склада -->
          <div class="management-panel">
            <!-- Информация о складе -->
            <div class="warehouse-info">
              <h3>📊 Статистика инвентаря</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Загруженность:</span>
                  <span class="info-value">{{ warehouseCapacity }}%</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Свободное место:</span>
                  <span class="info-value">{{ freeSpace }} м²</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Аренда:</span>
                  <span class="info-value">{{ stats?.monthly_rent?.toLocaleString() || '25,000' }}₽/мес</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Общая стоимость товаров:</span>
                  <span class="info-value">{{ totalValue.toLocaleString() }}₽</span>
                </div>
              </div>
            </div>

            <!-- Сводка по категориям -->
            <div class="summary-section">
              <h3>📈 Сводка по категориям</h3>
              <div class="summary-grid">
                <div class="summary-item">
                  <div class="summary-icon">🧵</div>
                  <div class="summary-info">
                    <div class="summary-name">Материалы</div>
                    <div class="summary-count">{{ materialsTotal }} шт</div>
                    <div class="summary-value">{{ materialsValue.toLocaleString() }}₽</div>
                  </div>
                </div>
                <div class="summary-item">
                  <div class="summary-icon">👕</div>
                  <div class="summary-info">
                    <div class="summary-name">Одежда</div>
                    <div class="summary-count">{{ clothingTotal }} шт</div>
                    <div class="summary-value">{{ clothingValue.toLocaleString() }}₽</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Условия хранения -->
            <div class="storage-conditions">
              <h3>🌡️ Условия хранения</h3>
              <div class="conditions-list">
                <div class="condition-item">
                  <span class="condition-icon">🌡️</span>
                  <span class="condition-text">Температура: {{ stats?.temperature_min || 18 }}-{{ stats?.temperature_max || 22 }}°C</span>
                </div>
                <div class="condition-item">
                  <span class="condition-icon">💧</span>
                  <span class="condition-text">Влажность: {{ stats?.humidity_min || 45 }}-{{ stats?.humidity_max || 55 }}%</span>
                </div>
                <div class="condition-item">
                  <span class="condition-icon">🔒</span>
                  <span class="condition-text">Охрана: {{ stats?.security_level || '24/7' }}</span>
                </div>
                <div class="condition-item">
                  <span class="condition-icon">📦</span>
                  <span class="condition-text">Система учета: {{ stats?.tracking_system || 'RFID' }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useWarehouseStore } from '@/stores/warehouseStore'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps<{
  show?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

// Используем store для управления складом и авторизацией
const warehouseStore = useWarehouseStore()
const authStore = useAuthStore()

// Состояние для уведомлений
const notification = ref<{ type: 'success' | 'error', message: string } | null>(null)

// Локальное состояние загрузки только для первого раза
const initialLoading = ref(true)

// Загружаем данные склада только при монтировании компонента
onMounted(async () => {
  console.log('🏭 WarehouseModal: Начинаем загрузку данных склада...')
  
  // Загружаем данные БЕЗ использования loading из store
  try {
    await warehouseStore.loadWarehouseData()
    console.log('🏭 WarehouseModal: Данные склада загружены, материалы:', materials.value?.length || 0)
    console.log('🏭 WarehouseModal: Одежда:', clothing.value?.length || 0)
  } catch (error) {
    console.error('Ошибка загрузки:', error)
  } finally {
    console.log('🏭 WarehouseModal: Сбрасываем initialLoading')
    initialLoading.value = false
  }
})

// Функция для показа уведомлений
const showNotification = (type: 'success' | 'error', message: string) => {
  notification.value = { type, message }
  setTimeout(() => {
    notification.value = null
  }, 3000)
}

// Получаем данные из store правильно с помощью storeToRefs
const {
  materials,
  clothing,
  stats,
  loading,
  error,
  materialsTotal,
  materialsValue,
  clothingTotal,
  clothingValue,
  totalValue,
  warehouseCapacity,
  freeSpace
} = storeToRefs(warehouseStore)

// Получаем методы из store
const { sellMaterial, sellClothing } = warehouseStore

// Фильтруем товары с наличием на складе
const materialsWithStock = computed(() => {
  if (!materials.value) return []
  console.log('🔄 Пересчитываем materialsWithStock, всего материалов:', materials.value.length)
  const filtered = materials.value.filter(material => material.quantity > 0)
  console.log('📦 Материалы с наличием:', filtered.map(m => `${m.name}: ${m.quantity}`))
  return filtered
})

const clothingWithStock = computed(() => {
  if (!clothing.value) return []
  console.log('🔄 Пересчитываем clothingWithStock, всего одежды:', clothing.value.length)
  const filtered = clothing.value.filter(item => item.quantity > 0)
  console.log('👗 Одежда с наличием:', filtered.map(c => `${c.name}: ${c.quantity}`))
  return filtered
})


// Получение количества из input поля
const getQuantityInput = (inputId: string): number => {
  const input = document.getElementById(inputId) as HTMLInputElement
  if (!input) return 1
  
  const value = parseInt(input.value) || 1
  const max = parseInt(input.max) || 1
  const min = parseInt(input.min) || 1
  
  // Проверяем границы
  if (value < min) return min
  if (value > max) return max
  
  return value
}

// Обработчики для кнопок продажи

const handleSellMaterial = async (materialId: string, quantity: number) => {
  try {
    console.log(`🛒 Продаем материал ${materialId}, количество: ${quantity}`)
    const materialBefore = materials.value?.find(m => m.id === materialId)
    console.log('📦 Количество до продажи:', materialBefore?.quantity)
    
    const success = await sellMaterial(materialId, quantity)
    if (success) {
      // Принудительно обновляем Vue
      await nextTick()
      
      const materialAfter = materials.value?.find(m => m.id === materialId)
      console.log('📦 Количество после продажи:', materialAfter?.quantity)
      
      showNotification('success', 'Материал успешно продан!')
    } else {
      showNotification('error', 'Ошибка продажи материала')
    }
  } catch (error) {
    console.error('Error selling material:', error)
    showNotification('error', 'Ошибка продажи материала')
  }
}

const handleSellClothing = async (clothingId: string, quantity: number) => {
  try {
    const success = await sellClothing(clothingId, quantity)
    if (success) {
      // Принудительно обновляем Vue
      await nextTick()
      showNotification('success', 'Одежда успешно продана!')
    } else {
      showNotification('error', 'Ошибка продажи одежды')
    }
  } catch (error) {
    console.error('Error selling clothing:', error)
    showNotification('error', 'Ошибка продажи одежды')
  }
}

// Закрытие модального окна
const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
@import '@/styles/colors.css';
@import '@/styles/menu-common.css';

.warehouse-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  font-family: 'Orbitron', sans-serif;
}

.warehouse-modal {
  background: var(--color-bg-menu, #F4E6D1);
  border: 4px solid var(--color-text, #5D4037);
  border-radius: 20px;
  width: 90vw;
  max-width: 1200px;
  height: 80vh;
  max-height: 800px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.warehouse-header {
  background: var(--gradient-accents, linear-gradient(135deg, #C85A54, #D4824A));
  color: white;
  padding: 20px;
  border-radius: 16px 16px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.player-balance {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
}

.balance-label {
  opacity: 0.9;
}

.balance-amount {
  font-weight: 700;
  font-size: 16px;
}

/* Уведомления */
.notification {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  z-index: 1001;
  animation: slideDown 0.3s ease-out;
}

.notification.success {
  background: #4CAF50;
  color: white;
}

.notification.error {
  background: #f44336;
  color: white;
}

.notification-icon {
  font-size: 16px;
}

.notification-message {
  font-size: 14px;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.warehouse-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 30px;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.warehouse-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.inventory-panel {
  flex: 1;
  padding: 20px;
  border-right: 2px solid var(--color-text, #5D4037);
  overflow-y: auto;
}

.management-panel {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.inventory-panel h3,
.management-panel h3 {
  color: var(--color-text, #5D4037);
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 700;
}

.inventory-section {
  margin-bottom: 25px;
}

.inventory-section h4 {
  color: var(--color-text, #5D4037);
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 600;
}

.inventory-grid {
  display: grid;
  gap: 10px;
}

.inventory-item {
  background: white;
  border: 2px solid var(--color-buttons, #D4824A);
  border-radius: 10px;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  position: relative;
}

.inventory-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.item-icon {
  font-size: 24px;
  width: 40px;
  text-align: center;
}

.item-info {
  flex: 1;
}

.item-name {
  font-weight: 600;
  color: var(--color-text, #5D4037);
  margin-bottom: 2px;
}

.item-quantity,
.item-price {
  font-size: 12px;
  color: #666;
}

.item-value {
  text-align: right;
}

.total-value {
  font-weight: 700;
  color: var(--color-accents, #C85A54);
  font-size: 14px;
}

.info-grid {
  display: grid;
  gap: 10px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid var(--color-buttons, #D4824A);
}

.info-label {
  font-weight: 600;
  color: var(--color-text, #5D4037);
}

.info-value {
  color: var(--color-accents, #C85A54);
  font-weight: 700;
}

/* Сводка по категориям */
.summary-section {
  margin-bottom: 25px;
}

.summary-grid {
  display: grid;
  gap: 15px;
}

.summary-item {
  background: white;
  border: 2px solid var(--color-buttons, #D4824A);
  border-radius: 10px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.3s ease;
}

.summary-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.summary-icon {
  font-size: 32px;
  width: 50px;
  text-align: center;
}

.summary-info {
  flex: 1;
}

.summary-name {
  font-weight: 600;
  color: var(--color-text, #5D4037);
  font-size: 16px;
  margin-bottom: 5px;
}

.summary-count {
  color: #666;
  font-size: 14px;
  margin-bottom: 2px;
}

.summary-value {
  color: var(--color-accents, #C85A54);
  font-weight: 700;
  font-size: 16px;
}

/* Условия хранения */
.storage-conditions {
  margin-bottom: 20px;
}

.conditions-list {
  display: grid;
  gap: 10px;
}

.condition-item {
  background: white;
  border: 1px solid var(--color-buttons, #D4824A);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.condition-icon {
  font-size: 18px;
  width: 25px;
  text-align: center;
}

.condition-text {
  color: var(--color-text, #5D4037);
  font-size: 14px;
  font-weight: 500;
}

/* Индикатор загрузки */
.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text, #5D4037);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-buttons, #D4824A);
  border-top: 4px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-indicator p {
  font-size: 16px;
  font-weight: 600;
}

/* Обработка ошибок */
.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-accents, #C85A54);
  text-align: center;
  padding: 20px;
}

.error-message p {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
}

.retry-btn {
  background: var(--gradient-accents, linear-gradient(135deg, #C85A54, #D4824A));
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Дополнительные стили для деталей товаров */
.item-quality {
  font-size: 11px;
  color: #888;
  font-style: italic;
}

.item-stats {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.stat-label {
  color: #888;
  font-weight: 500;
}

.stat-value {
  color: #333;
  font-weight: 600;
}

.item-price-tag {
  margin-top: 10px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #C85A54 0%, #d4786f 100%);
  color: white;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}

.item-details {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

/* Кнопки действий */
.item-actions {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-left: 10px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.quantity-input {
  width: 60px;
  padding: 4px 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
  background: white;
  color: #333;
  font-weight: 500;
}

.quantity-input:disabled {
  background: #f5f5f5;
  color: #999;
}

.quantity-input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
  color: #333;
}

.quantity-input::placeholder {
  color: #999;
  opacity: 1;
}

.quantity-input::-webkit-outer-spin-button,
.quantity-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.quantity-input[type=number] {
  -moz-appearance: textfield;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 70px;
}

.buy-btn {
  background: var(--color-accents, #C85A54);
  color: white;
}

.buy-btn:hover:not(:disabled) {
  background: #B04944;
  transform: translateY(-1px);
}

.sell-btn {
  background: var(--color-buttons, #D4824A);
  color: white;
}

.sell-btn:hover:not(:disabled) {
  background: #C0733F;
  transform: translateY(-1px);
}

.sell-all-btn {
  background: #FF9800;
  color: white;
  font-size: 11px;
  padding: 4px 8px;
}

.sell-all-btn:hover:not(:disabled) {
  background: #F57C00;
  transform: translateY(-1px);
}

.action-btn:disabled {
  background: #ccc;
  color: #666;
  cursor: not-allowed;
  transform: none;
}

/* Пустые секции */
.empty-section {
  text-align: center;
  padding: 40px 20px;
  color: #666;
  font-style: italic;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  border: 2px dashed var(--color-buttons, #D4824A);
}

.empty-section p {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

/* Адаптивность */
@media (max-width: 768px) {
  .warehouse-modal {
    width: 95vw;
    height: 90vh;
  }
  
  .warehouse-content {
    flex-direction: column;
  }
  
  .inventory-panel {
    border-right: none;
    border-bottom: 2px solid var(--color-text, #5D4037);
  }
}
</style>
