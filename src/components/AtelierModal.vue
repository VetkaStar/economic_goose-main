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
            <div v-for="order in currentOrders" :key="order.id" class="order-item">
              <div class="order-info">
                <div class="order-client">{{ order.client }}</div>
                <div class="order-item-name">{{ order.item }}</div>
                <div class="order-price">{{ order.price.toLocaleString() }}₽</div>
                <div class="order-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: order.progress + '%' }"></div>
                  </div>
                  <span class="progress-text">{{ order.progress }}%</span>
                </div>
              </div>
              <div class="order-actions">
                <button @click="workOnOrder(order.id)" class="work-btn" :disabled="order.progress >= 100">
                  {{ order.progress >= 100 ? '✅' : '✂️' }}
                </button>
              </div>
            </div>
          </div>

          <button @click="takeNewOrder" class="new-order-btn">+ Взять новый заказ</button>
        </div>

        <!-- Правая панель - Управление -->
        <div class="management-panel">
          <!-- Информация об ателье -->
          <div class="atelier-info">
            <h3>🏭 Информация об ателье</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Аренда:</span>
                <span class="info-value">15,000₽/мес</span>
              </div>
              <div class="info-item">
                <span class="info-label">Доход за месяц:</span>
                <span class="info-value">{{ monthlyIncome.toLocaleString() }}₽</span>
              </div>
              <div class="info-item">
                <span class="info-label">Активных заказов:</span>
                <span class="info-value">{{ activeOrdersCount }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Рейтинг:</span>
                <span class="info-value">{{ rating }}/5 ⭐</span>
              </div>
            </div>
          </div>

          <!-- Оборудование -->
          <div class="equipment-section">
            <h3>🛠️ Оборудование</h3>
            <div class="equipment-list">
              <div v-for="equipment in equipmentList" :key="equipment.id" class="equipment-item">
                <div class="equipment-icon">{{ equipment.icon }}</div>
                <div class="equipment-info">
                  <div class="equipment-name">{{ equipment.name }}</div>
                  <div class="equipment-status" :class="equipment.status">
                    {{ equipment.status === 'working' ? 'Работает' : 'Сломан' }}
                  </div>
                </div>
                <div class="equipment-actions">
                  <button v-if="equipment.status === 'broken'" @click="repairEquipment(equipment.id)" class="repair-btn">
                    🔧
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Мастера -->
          <div class="masters-section">
            <h3>👨‍🎨 Мастера</h3>
            <div class="masters-list">
              <div v-for="master in masters" :key="master.id" class="master-item">
                <div class="master-info">
                  <div class="master-name">{{ master.name }}</div>
                  <div class="master-skill">Навык: {{ master.skill }}/100</div>
                  <div class="master-salary">{{ master.salary.toLocaleString() }}₽/мес</div>
                </div>
                <div class="master-actions">
                  <button @click="trainMaster(master.id)" class="train-btn">📚</button>
                  <button @click="fireMaster(master.id)" class="fire-btn">🔥</button>
                </div>
              </div>
            </div>
            <button @click="hireMaster" class="hire-master-btn">+ Нанять мастера</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{
  close: []
}>()

// Состояние ателье
const monthlyIncome = ref(125000)
const rating = ref(4.2)

// Текущие заказы
const currentOrders = ref([
  {
    id: 1,
    client: 'Анна Петрова',
    item: 'Вечернее платье',
    price: 15000,
    progress: 75
  },
  {
    id: 2,
    client: 'Михаил Соколов',
    item: 'Костюм на заказ',
    price: 25000,
    progress: 30
  },
  {
    id: 3,
    client: 'Елена Козлова',
    item: 'Платье для выпускного',
    price: 12000,
    progress: 100
  }
])

// Оборудование
const equipmentList = ref([
  { id: 1, name: 'Швейная машина Brother', icon: '🧵', status: 'working' },
  { id: 2, name: 'Оверлок Juki', icon: '⚡', status: 'working' },
  { id: 3, name: 'Манекен', icon: '👗', status: 'working' },
  { id: 4, name: 'Гладильная доска', icon: '🔥', status: 'broken' },
  { id: 5, name: 'Раскройный стол', icon: '📏', status: 'working' }
])

// Мастера
const masters = ref([
  { id: 1, name: 'Мария Иванова', skill: 85, salary: 30000 },
  { id: 2, name: 'Ольга Смирнова', skill: 72, salary: 25000 },
  { id: 3, name: 'Татьяна Козлова', skill: 90, salary: 35000 }
])

// Вычисляемые свойства
const activeOrdersCount = computed(() => {
  return currentOrders.value.filter(order => order.progress < 100).length
})

// Функции для заказов
const workOnOrder = (orderId: number) => {
  const order = currentOrders.value.find(o => o.id === orderId)
  if (order && order.progress < 100) {
    order.progress += 25
    if (order.progress >= 100) {
      monthlyIncome.value += order.price
      alert(`Заказ "${order.item}" завершен! Получено ${order.price.toLocaleString()}₽`)
    }
  }
}

const takeNewOrder = () => {
  const newOrder = {
    id: currentOrders.value.length + 1,
    client: `Клиент ${currentOrders.value.length + 1}`,
    item: 'Новый заказ',
    price: Math.floor(Math.random() * 20000) + 5000,
    progress: 0
  }
  currentOrders.value.push(newOrder)
  alert('Новый заказ принят!')
}

// Функции для оборудования
const repairEquipment = (equipmentId: number) => {
  const equipment = equipmentList.value.find(e => e.id === equipmentId)
  if (equipment) {
    equipment.status = 'working'
    alert('Оборудование отремонтировано!')
  }
}

// Функции для мастеров
const trainMaster = (masterId: number) => {
  const master = masters.value.find(m => m.id === masterId)
  if (master && master.skill < 100) {
    master.skill += 5
    master.salary += 2000
    alert('Мастер прошел обучение! Навык +5, зарплата +2000₽')
  }
}

const fireMaster = (masterId: number) => {
  if (confirm('Вы уверены, что хотите уволить этого мастера?')) {
    masters.value = masters.value.filter(m => m.id !== masterId)
  }
}

const hireMaster = () => {
  const newMaster = {
    id: masters.value.length + 1,
    name: `Мастер ${masters.value.length + 1}`,
    skill: 50,
    salary: 20000
  }
  masters.value.push(newMaster)
  alert('Новый мастер нанят!')
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

.atelier-modal-overlay {
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

.atelier-modal {
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

.atelier-header {
  background: var(--gradient-accents, linear-gradient(135deg, #4CAF50, #8BC34A));
  color: white;
  padding: 20px;
  border-radius: 16px 16px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.atelier-header h2 {
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

.atelier-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.orders-panel {
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

.orders-panel h3,
.management-panel h3 {
  color: var(--color-text, #5D4037);
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 700;
}

.orders-list {
  margin-bottom: 20px;
}

.order-item {
  background: white;
  border: 2px solid var(--color-buttons, #D4824A);
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.order-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.order-info {
  flex: 1;
}

.order-client {
  font-weight: 600;
  color: var(--color-text, #5D4037);
  font-size: 16px;
  margin-bottom: 5px;
}

.order-item-name {
  color: #666;
  font-size: 14px;
  margin-bottom: 5px;
}

.order-price {
  color: var(--color-accents, #C85A54);
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 10px;
}

.order-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--gradient-accents, linear-gradient(135deg, #4CAF50, #8BC34A));
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text, #5D4037);
}

.order-actions {
  margin-left: 15px;
}

.work-btn {
  background: var(--gradient-buttons, linear-gradient(135deg, #D4824A, #C85A54));
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 15px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
}

.work-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.work-btn:disabled {
  background: #90EE90;
  cursor: not-allowed;
}

.new-order-btn {
  background: var(--gradient-accents, linear-gradient(135deg, #4CAF50, #8BC34A));
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  cursor: pointer;
  font-weight: 600;
  width: 100%;
  transition: all 0.3s ease;
}

.new-order-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
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

.equipment-section,
.masters-section {
  margin-bottom: 25px;
}

.equipment-list,
.masters-list {
  margin-bottom: 15px;
}

.equipment-item,
.master-item {
  background: white;
  border: 2px solid var(--color-buttons, #D4824A);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.equipment-info,
.master-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.equipment-name,
.master-name {
  font-weight: 600;
  color: var(--color-text, #5D4037);
}

.equipment-status {
  font-size: 12px;
  font-weight: 600;
}

.equipment-status.working {
  color: #4CAF50;
}

.equipment-status.broken {
  color: #F44336;
}

.master-skill,
.master-salary {
  font-size: 12px;
  color: #666;
}

.equipment-actions,
.master-actions {
  display: flex;
  gap: 5px;
}

.repair-btn,
.train-btn,
.fire-btn {
  background: none;
  border: 1px solid var(--color-buttons, #D4824A);
  border-radius: 5px;
  padding: 5px 8px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.repair-btn:hover {
  background: var(--color-highlights, #81C4E7);
  color: white;
}

.train-btn:hover {
  background: var(--color-accents, #C85A54);
  color: white;
}

.fire-btn:hover {
  background: #F44336;
  color: white;
}

.hire-master-btn {
  background: var(--gradient-buttons, linear-gradient(135deg, #D4824A, #C85A54));
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 15px;
  cursor: pointer;
  font-weight: 600;
  width: 100%;
  transition: all 0.3s ease;
}

.hire-master-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Адаптивность */
@media (max-width: 768px) {
  .atelier-modal {
    width: 95vw;
    height: 90vh;
  }
  
  .atelier-content {
    flex-direction: column;
  }
  
  .orders-panel {
    border-right: none;
    border-bottom: 2px solid var(--color-text, #5D4037);
  }
}
</style>
