<template>
  <div class="warehouse-modal-overlay" @click="closeModal">
    <div class="warehouse-modal" @click.stop>
      <!-- Заголовок -->
      <div class="warehouse-header">
        <div class="header-left">
          <h2>🏭 Склад "Логистик+"</h2>
          <div class="player-balance">
            <span class="balance-label">Баланс:</span>
            <span class="balance-amount">{{ authStore.user?.money?.toLocaleString() || '0' }}₽</span>
          </div>
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
        <div v-if="loading" class="loading-indicator">
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
            <h3>📦 Содержимое склада</h3>
            
            <!-- Материалы -->
            <div class="inventory-section">
              <h4>🧵 Материалы</h4>
              <div class="inventory-grid">
                <div v-for="material in materials" :key="material.id" class="inventory-item">
                  <div class="item-icon">{{ material.icon }}</div>
                  <div class="item-info">
                    <div class="item-name">{{ material.name }}</div>
                    <div class="item-quantity">{{ material.quantity }} шт</div>
                    <div class="item-price">{{ material.price }}₽ за шт</div>
                    <div class="item-quality">Качество: {{ material.quality }}/5</div>
                  </div>
                  <div class="item-value">
                    <div class="total-value">{{ (material.quantity * material.price).toLocaleString() }}₽</div>
                  </div>
                  <div class="item-actions">
                    <button 
                      @click="handleBuyMaterial(material.id, 1)" 
                      class="action-btn buy-btn"
                      :disabled="(authStore.user?.money || 0) < material.price || loading || material.quantity < 1"
                      title="Купить 1 шт"
                    >
                      Купить
                    </button>
                    <button 
                      @click="handleSellMaterial(material.id, 1)" 
                      class="action-btn sell-btn"
                      :disabled="material.quantity < 1 || loading"
                      title="Продать 1 шт"
                    >
                      Продать
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Готовая одежда -->
            <div class="inventory-section">
              <h4>👕 Готовая одежда</h4>
              <div class="inventory-grid">
                <div v-for="clothingItem in clothing" :key="clothingItem.id" class="inventory-item">
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
                    <button 
                      @click="handleBuyClothing(clothingItem.id, 1)" 
                      class="action-btn buy-btn"
                      :disabled="(authStore.user?.money || 0) < clothingItem.price || loading || clothingItem.quantity < 1"
                      title="Купить 1 шт"
                    >
                      Купить
                    </button>
                    <button 
                      @click="handleSellClothing(clothingItem.id, 1)" 
                      class="action-btn sell-btn"
                      :disabled="clothingItem.quantity < 1 || loading"
                      title="Продать 1 шт"
                    >
                      Продать
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Правая панель - Статистика склада -->
          <div class="management-panel">
            <!-- Информация о складе -->
            <div class="warehouse-info">
              <h3>📊 Статистика склада</h3>
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
import { onMounted, ref } from 'vue'
import { useWarehouseStore } from '@/stores/warehouseStore'
import { useAuthStore } from '@/stores/authStore'

const emit = defineEmits<{
  close: []
}>()

// Используем store для управления складом и авторизацией
const warehouseStore = useWarehouseStore()
const authStore = useAuthStore()

// Состояние для уведомлений
const notification = ref<{ type: 'success' | 'error', message: string } | null>(null)

// Загружаем данные склада при монтировании компонента
onMounted(async () => {
  console.log('🏭 WarehouseModal: Начинаем загрузку данных склада...')
  await warehouseStore.loadWarehouseData()
  console.log('🏭 WarehouseModal: Данные склада загружены, материалы:', warehouseStore.materials.length)
  console.log('🏭 WarehouseModal: Одежда:', warehouseStore.clothing.length)
})

// Функция для показа уведомлений
const showNotification = (type: 'success' | 'error', message: string) => {
  notification.value = { type, message }
  setTimeout(() => {
    notification.value = null
  }, 3000)
}

// Получаем данные из store
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
  freeSpace,
  buyMaterial,
  buyClothing,
  sellMaterial,
  sellClothing
} = warehouseStore

// Обработчики для кнопок покупки/продажи
const handleBuyMaterial = async (materialId: string, quantity: number) => {
  try {
    const success = await buyMaterial(materialId, quantity)
    if (success) {
      showNotification('success', 'Материал успешно куплен!')
    } else {
      showNotification('error', 'Ошибка покупки материала')
    }
  } catch (error) {
    console.error('Error buying material:', error)
    showNotification('error', 'Ошибка покупки материала')
  }
}

const handleBuyClothing = async (clothingId: string, quantity: number) => {
  try {
    const success = await buyClothing(clothingId, quantity)
    if (success) {
      showNotification('success', 'Одежда успешно куплена!')
    } else {
      showNotification('error', 'Ошибка покупки одежды')
    }
  } catch (error) {
    console.error('Error buying clothing:', error)
    showNotification('error', 'Ошибка покупки одежды')
  }
}

const handleSellMaterial = async (materialId: string, quantity: number) => {
  try {
    const success = await sellMaterial(materialId, quantity)
    if (success) {
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

.action-btn:disabled {
  background: #ccc;
  color: #666;
  cursor: not-allowed;
  transform: none;
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
