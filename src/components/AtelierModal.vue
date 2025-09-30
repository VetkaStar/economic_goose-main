<template>
  <div class="atelier-modal-overlay" @click="closeModal">
    <div class="atelier-modal" @click.stop>
      <!-- Заголовок -->
      <div class="atelier-header">
        <h2>✂️ Ателье "Игла"</h2>
        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <!-- Основной контент -->
      <div class="atelier-content">
        <!-- Левая панель - Заказы -->
        <div class="orders-panel">
          <h3>📋 Текущие заказы</h3>
          
          <div class="orders-list">
            <div v-for="order in atelierStore.atelierState.orders" :key="order.id" class="order-item">
              <div class="order-info">
                <div class="order-client">{{ order.clientName }}</div>
                <div class="order-item-name">{{ order.itemName }}</div>
                <div class="order-price">{{ order.price.toLocaleString() }}₽</div>
                <div class="order-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: order.progress + '%' }"></div>
                  </div>
                  <span class="progress-text">{{ order.progress }}%</span>
                </div>
                <div class="order-details">
                  <span class="complexity">Сложность: {{ order.complexity }}/5</span>
                  <span class="due-date">Срок: {{ order.dueDate }} дн.</span>
                </div>
              </div>
              <div class="order-actions">
                <button 
                  @click="workOnOrder(order.id)" 
                  class="work-btn" 
                  :disabled="order.progress >= 100"
                  :class="{ completed: order.progress >= 100 }"
                >
                  {{ order.progress >= 100 ? '✅' : '✂️' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Доступные заказы -->
          <div v-if="atelierStore.availableOrders.length > 0" class="available-orders">
            <h4>📝 Доступные заказы</h4>
            <div class="available-orders-list">
              <div v-for="order in atelierStore.availableOrders" :key="order.id" class="available-order">
                <div class="order-preview">
                  <div class="order-client">{{ order.clientName }}</div>
                  <div class="order-item">{{ order.itemName }}</div>
                  <div class="order-price">{{ order.price.toLocaleString() }}₽</div>
                  <div class="order-complexity">Сложность: {{ order.complexity }}/5</div>
                </div>
                <button 
                  @click="takeOrder(order.id)" 
                  class="take-order-btn"
                  :disabled="!atelierStore.canTakeOrder"
                >
                  Взять
                </button>
              </div>
            </div>
          </div>

          <button 
            @click="showNewOrderModal = true" 
            class="new-order-btn"
            :disabled="!atelierStore.canTakeOrder"
          >
            + Взять новый заказ
          </button>
        </div>

        <!-- Правая панель - Управление -->
        <div class="management-panel">
          <!-- Информация об ателье -->
          <div class="atelier-info">
            <h3>🏭 Информация об ателье</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Аренда:</span>
                <span class="info-value">{{ atelierStore.atelierState.monthlyRent.toLocaleString() }}₽/мес</span>
              </div>
              <div class="info-item">
                <span class="info-label">Доход за месяц:</span>
                <span class="info-value">{{ atelierStore.atelierState.monthlyIncome.toLocaleString() }}₽</span>
              </div>
              <div class="info-item">
                <span class="info-label">Активных заказов:</span>
                <span class="info-value">{{ atelierStore.atelierState.activeOrders }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Завершено заказов:</span>
                <span class="info-value">{{ atelierStore.atelierState.completedOrders }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Рейтинг:</span>
                <span class="info-value">{{ (atelierStore.atelierState.reputation / 20).toFixed(1) }}/5 ⭐</span>
              </div>
              <div class="info-item">
                <span class="info-label">Общая эффективность:</span>
                <span class="info-value">{{ atelierStore.totalEfficiency }}%</span>
              </div>
            </div>
          </div>

          <!-- Оборудование -->
          <div class="equipment-section">
            <h3>🔧 Оборудование</h3>
            <div class="equipment-list">
              <div v-for="equipment in atelierStore.atelierState.equipment" :key="equipment.id" class="equipment-item">
                <div class="equipment-icon">{{ equipment.icon }}</div>
                <div class="equipment-info">
                  <div class="equipment-name">{{ equipment.name }}</div>
                  <div class="equipment-stats">
                    <span class="efficiency">Эффективность: {{ equipment.efficiency }}%</span>
                    <span class="condition" :class="{ broken: equipment.condition < 50 }">
                      Состояние: {{ equipment.condition }}%
                    </span>
                  </div>
                </div>
                <div class="equipment-actions">
                  <button 
                    v-if="equipment.condition < 50" 
                    @click="repairEquipment(equipment.id)"
                    class="repair-btn"
                  >
                    🔧
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Магазин оборудования -->
            <div class="equipment-shop">
              <h4>🛒 Купить оборудование</h4>
              <div class="shop-list">
                <div v-for="equipment in atelierStore.shopEquipment" :key="equipment.id" class="shop-item">
                  <div class="shop-item-info">
                    <span class="shop-icon">{{ equipment.icon }}</span>
                    <span class="shop-name">{{ equipment.name }}</span>
                    <span class="shop-price">{{ equipment.price.toLocaleString() }}₽</span>
                  </div>
                  <button @click="buyEquipment(equipment.id)" class="buy-btn">
                    Купить
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Сотрудники -->
          <div class="staff-section">
            <h3>👥 Мастера</h3>
            <div class="staff-list">
              <div v-for="staff in atelierStore.atelierState.staff" :key="staff.id" class="staff-item">
                <div class="staff-info">
                  <div class="staff-name">{{ staff.name }}</div>
                  <div class="staff-position">{{ getPositionName(staff.position) }}</div>
                  <div class="staff-stats">
                    <span>Навык: {{ staff.skill }}/100</span>
                    <span>Зарплата: {{ staff.salary.toLocaleString() }}₽/мес</span>
                  </div>
                </div>
                <div class="staff-actions">
                  <button @click="fireStaff(staff.id)" class="fire-btn">
                    Уволить
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Найм сотрудников -->
            <div class="hire-section">
              <h4>💼 Нанять мастера</h4>
              <div class="hire-list">
                <div v-for="staff in atelierStore.availableStaff" :key="staff.id" class="hire-item">
                  <div class="hire-info">
                    <div class="hire-name">{{ staff.name }}</div>
                    <div class="hire-position">{{ getPositionName(staff.position) }}</div>
                    <div class="hire-stats">
                      <span>Навык: {{ staff.skill }}/100</span>
                      <span>Зарплата: {{ staff.salary.toLocaleString() }}₽/мес</span>
                    </div>
                  </div>
                  <button @click="hireStaff(staff.id)" class="hire-btn">
                    Нанять
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно мини-игры -->
    <div v-if="showSewingGame" class="sewing-game-overlay" @click="closeSewingGame">
      <div class="sewing-game-modal" @click.stop>
        <SewingMinigame 
          :order-id="currentOrderId"
          :game-mode="currentGameMode"
          @complete="onSewingComplete"
          @close="closeSewingGame"
        />
      </div>
    </div>

    <!-- Модальное окно выбора заказа -->
    <div v-if="showNewOrderModal" class="new-order-overlay" @click="closeNewOrderModal">
      <div class="new-order-modal" @click.stop>
        <h3>Выберите заказ</h3>
        <div class="order-selection">
          <div v-for="order in atelierStore.availableOrders" :key="order.id" class="order-option">
            <div class="order-option-info">
              <h4>{{ order.itemName }}</h4>
              <p>Клиент: {{ order.clientName }}</p>
              <p>Цена: {{ order.price.toLocaleString() }}₽</p>
              <p>Сложность: {{ order.complexity }}/5</p>
              <p>Срок: {{ order.dueDate }} дней</p>
            </div>
            <div class="order-option-actions">
              <button @click="selectOrder(order.id, 'clicker')" class="select-mode-btn">
                🎯 Кликер
              </button>
              <button @click="selectOrder(order.id, 'precision')" class="select-mode-btn">
                🎯 Точность
              </button>
              <button @click="selectOrder(order.id, 'manual')" class="select-mode-btn">
                ✂️ Ручной
              </button>
            </div>
          </div>
        </div>
        <button @click="closeNewOrderModal" class="close-selection-btn">Отмена</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAtelierStore } from '@/stores/atelierStore'
import SewingMinigame from './SewingMinigame.vue'

const emit = defineEmits<{
  close: []
}>()

const atelierStore = useAtelierStore()

// Модальные окна
const showSewingGame = ref(false)
const showNewOrderModal = ref(false)
const currentOrderId = ref<string | null>(null)
const currentGameMode = ref<'clicker' | 'precision' | 'manual'>('clicker')

// Методы
const closeModal = () => {
  emit('close')
}

const workOnOrder = (orderId: string) => {
  currentOrderId.value = orderId
  showSewingGame.value = true
}

const takeOrder = async (orderId: string) => {
  const success = await atelierStore.takeOrder(orderId)
  if (success) {
    // Можно показать уведомление
  }
}

const selectOrder = async (orderId: string, gameMode: 'clicker' | 'precision' | 'manual') => {
  const success = await atelierStore.takeOrder(orderId)
  if (success) {
    currentOrderId.value = orderId
    currentGameMode.value = gameMode
    showNewOrderModal.value = false
    showSewingGame.value = true
  }
}

const onSewingComplete = async (progress: number, quality: number) => {
  if (currentOrderId.value) {
    await atelierStore.workOnOrder(currentOrderId.value, progress)
  }
  closeSewingGame()
}

const closeSewingGame = () => {
  showSewingGame.value = false
  currentOrderId.value = null
}

const closeNewOrderModal = () => {
  showNewOrderModal.value = false
}

const hireStaff = async (staffId: string) => {
  const success = await atelierStore.hireStaff(staffId)
  if (success) {
    // Можно показать уведомление
  }
}

const fireStaff = async (staffId: string) => {
  // Реализовать увольнение
  console.log('Увольняем сотрудника:', staffId)
}

const buyEquipment = async (equipmentId: string) => {
  const success = await atelierStore.buyEquipment(equipmentId)
  if (success) {
    // Можно показать уведомление
  }
}

const repairEquipment = async (equipmentId: string) => {
  const success = await atelierStore.repairEquipment(equipmentId)
  if (success) {
    // Можно показать уведомление
  }
}

const getPositionName = (position: string) => {
  const positions: Record<string, string> = {
    seamstress: 'Швея',
    cutter: 'Закройщик',
    manager: 'Менеджер',
    buyer: 'Товаровед'
  }
  return positions[position] || position
}

// Загружаем данные при монтировании
onMounted(async () => {
  await atelierStore.loadAtelierState()
})
</script>

<style scoped>
.atelier-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.atelier-modal {
  background: var(--color-bg-menu, #F4E6D1);
  border-radius: 20px;
  width: 95%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  border: 3px solid var(--color-text, #5D4037);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.atelier-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: var(--color-bg-menu-light, #E6D3B7);
  border-bottom: 3px solid var(--color-text, #5D4037);
  border-radius: 17px 17px 0 0;
}

.atelier-header h2 {
  color: var(--color-text, #5D4037);
  margin: 0;
  font-size: 1.8rem;
}

.close-btn {
  background: var(--color-accents, #C85A54);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #B71C1C;
  transform: scale(1.1);
}

.atelier-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  padding: 30px;
}

/* Левая панель - Заказы */
.orders-panel {
  background: var(--color-bg-menu-light, #E6D3B7);
  border-radius: 15px;
  padding: 20px;
  border: 2px solid var(--color-text, #5D4037);
}

.orders-panel h3 {
  color: var(--color-text, #5D4037);
  margin: 0 0 20px 0;
  font-size: 1.3rem;
}

.orders-list {
  margin-bottom: 20px;
}

.order-item {
  background: white;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  border: 2px solid var(--color-text, #5D4037);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-info {
  flex: 1;
}

.order-client {
  font-weight: bold;
  color: var(--color-text, #5D4037);
  font-size: 1.1rem;
}

.order-item-name {
  color: var(--color-text, #5D4037);
  margin: 5px 0;
}

.order-price {
  color: var(--color-accents, #C85A54);
  font-weight: bold;
  font-size: 1.1rem;
}

.order-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}

.progress-bar {
  flex: 1;
  height: 20px;
  background: var(--color-bg-menu, #F4E6D1);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--color-text, #5D4037);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #66BB6A);
  transition: width 0.3s ease;
}

.progress-text {
  font-weight: bold;
  color: var(--color-text, #5D4037);
  min-width: 40px;
}

.order-details {
  display: flex;
  gap: 15px;
  font-size: 0.9rem;
  color: var(--color-text, #5D4037);
}

.work-btn {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  border: 2px solid var(--color-text, #5D4037);
  background: var(--color-bg-menu-light, #F9F1E8);
  cursor: pointer;
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.work-btn:hover:not(:disabled) {
  background: var(--color-accents, #C85A54);
  color: white;
  transform: scale(1.1);
}

.work-btn.completed {
  background: #4CAF50;
  color: white;
}

.work-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Доступные заказы */
.available-orders {
  margin-bottom: 20px;
}

.available-orders h4 {
  color: var(--color-text, #5D4037);
  margin: 0 0 15px 0;
}

.available-orders-list {
  max-height: 200px;
  overflow-y: auto;
}

.available-order {
  background: white;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid var(--color-text, #5D4037);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-preview {
  flex: 1;
}

.order-preview .order-client {
  font-weight: bold;
  color: var(--color-text, #5D4037);
}

.order-preview .order-item {
  color: var(--color-text, #5D4037);
  margin: 2px 0;
}

.order-preview .order-price {
  color: var(--color-accents, #C85A54);
  font-weight: bold;
}

.order-preview .order-complexity {
  font-size: 0.9rem;
  color: var(--color-text, #5D4037);
}

.take-order-btn {
  background: var(--color-accents, #C85A54);
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.take-order-btn:hover:not(:disabled) {
  background: var(--color-buttons, #D4824A);
}

.take-order-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.new-order-btn {
  width: 100%;
  background: var(--color-accents, #C85A54);
  color: white;
  border: none;
  padding: 15px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.new-order-btn:hover:not(:disabled) {
  background: var(--color-buttons, #D4824A);
  transform: translateY(-2px);
}

.new-order-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Правая панель - Управление */
.management-panel {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.atelier-info, .equipment-section, .staff-section {
  background: var(--color-bg-menu-light, #E6D3B7);
  border-radius: 15px;
  padding: 20px;
  border: 2px solid var(--color-text, #5D4037);
}

.atelier-info h3, .equipment-section h3, .staff-section h3 {
  color: var(--color-text, #5D4037);
  margin: 0 0 15px 0;
  font-size: 1.3rem;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-text, #5D4037);
}

.info-label {
  color: var(--color-text, #5D4037);
  font-weight: bold;
}

.info-value {
  color: var(--color-accents, #C85A54);
  font-weight: bold;
}

/* Оборудование */
.equipment-list {
  margin-bottom: 20px;
}

.equipment-item {
  background: white;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid var(--color-text, #5D4037);
  display: flex;
  align-items: center;
  gap: 15px;
}

.equipment-icon {
  font-size: 2rem;
}

.equipment-info {
  flex: 1;
}

.equipment-name {
  font-weight: bold;
  color: var(--color-text, #5D4037);
  margin-bottom: 5px;
}

.equipment-stats {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.9rem;
  color: var(--color-text, #5D4037);
}

.condition.broken {
  color: #F44336;
  font-weight: bold;
}

.repair-btn {
  background: #FF9800;
  color: white;
  border: none;
  padding: 8px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.2rem;
}

.repair-btn:hover {
  background: #F57C00;
}

/* Магазин оборудования */
.equipment-shop h4 {
  color: var(--color-text, #5D4037);
  margin: 0 0 15px 0;
}

.shop-list {
  max-height: 200px;
  overflow-y: auto;
}

.shop-item {
  background: white;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid var(--color-text, #5D4037);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.shop-item-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.shop-icon {
  font-size: 1.5rem;
}

.shop-name {
  color: var(--color-text, #5D4037);
  font-weight: bold;
}

.shop-price {
  color: var(--color-accents, #C85A54);
  font-weight: bold;
}

.buy-btn {
  background: var(--color-accents, #C85A54);
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.buy-btn:hover {
  background: var(--color-buttons, #D4824A);
}

/* Сотрудники */
.staff-list {
  margin-bottom: 20px;
}

.staff-item {
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  border: 1px solid var(--color-text, #5D4037);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.staff-info {
  flex: 1;
}

.staff-name {
  font-weight: bold;
  color: var(--color-text, #5D4037);
  font-size: 1.1rem;
}

.staff-position {
  color: var(--color-text, #5D4037);
  margin: 5px 0;
}

.staff-stats {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.9rem;
  color: var(--color-text, #5D4037);
}

.fire-btn {
  background: #F44336;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.fire-btn:hover {
  background: #D32F2F;
}

/* Найм сотрудников */
.hire-section h4 {
  color: var(--color-text, #5D4037);
  margin: 0 0 15px 0;
}

.hire-list {
  max-height: 200px;
  overflow-y: auto;
}

.hire-item {
  background: white;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid var(--color-text, #5D4037);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hire-info {
  flex: 1;
}

.hire-name {
  font-weight: bold;
  color: var(--color-text, #5D4037);
}

.hire-position {
  color: var(--color-text, #5D4037);
  margin: 2px 0;
}

.hire-stats {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.9rem;
  color: var(--color-text, #5D4037);
}

.hire-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.hire-btn:hover {
  background: #45A049;
}

/* Модальные окна */
.sewing-game-overlay, .new-order-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
}

.sewing-game-modal {
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.new-order-modal {
  background: var(--color-bg-menu, #F4E6D1);
  border-radius: 15px;
  padding: 30px;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  border: 3px solid var(--color-text, #5D4037);
}

.new-order-modal h3 {
  color: var(--color-text, #5D4037);
  margin: 0 0 20px 0;
  text-align: center;
}

.order-selection {
  margin-bottom: 20px;
}

.order-option {
  background: var(--color-bg-menu-light, #E6D3B7);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 15px;
  border: 2px solid var(--color-text, #5D4037);
}

.order-option-info h4 {
  color: var(--color-text, #5D4037);
  margin: 0 0 10px 0;
}

.order-option-info p {
  color: var(--color-text, #5D4037);
  margin: 5px 0;
}

.order-option-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  justify-content: center;
}

.select-mode-btn {
  background: var(--color-accents, #C85A54);
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.select-mode-btn:hover {
  background: var(--color-buttons, #D4824A);
  transform: translateY(-2px);
}

.close-selection-btn {
  width: 100%;
  background: var(--color-text, #5D4037);
  color: white;
  border: none;
  padding: 15px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1.1rem;
}

.close-selection-btn:hover {
  background: #424242;
}

/* Адаптивность */
@media (max-width: 768px) {
  .atelier-content {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 20px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .order-option-actions {
    flex-direction: column;
  }
}
</style>