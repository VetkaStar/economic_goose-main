<template>
  <div class="modal-overlay" @click.self="close">
    <div class="logistics-modal">
      <!-- Заголовок -->
      <div class="modal-header">
        <h2 class="modal-title">● Логистическая гонка</h2>
        <button class="close-btn" @click="close">✕</button>
      </div>

      <!-- Игровое поле -->
      <div class="game-container">
        <!-- Информационная панель -->
        <div class="info-panel">
          <div class="game-stats">
            <div class="stat-item">
              <span class="stat-label">Время:</span>
              <span class="stat-value timer" :class="{ urgent: timeLeft <= 10 }">
                {{ formatTime(timeLeft) }}
              </span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Очки:</span>
              <span class="stat-value score">{{ score }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Доставлено:</span>
              <span class="stat-value">{{ deliveredOrders }}/{{ totalOrders }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Комбо:</span>
              <span class="stat-value combo" :class="{ 'combo-active': combo > 0 }">{{ combo }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Ошибки:</span>
              <span class="stat-value mistakes">{{ mistakes }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Раунд:</span>
              <span class="stat-value rounds">{{ rounds }}</span>
            </div>
          </div>
          
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
        </div>

        <!-- Карта городов -->
        <div class="map-container">
          <div class="map-grid">
            <div 
              v-for="city in cities" 
              :key="city.id"
              class="city-card"
              :class="{ 
                'has-orders': city.orders.length > 0,
                'selected': selectedCity?.id === city.id,
                'delivered': city.orders.every(o => o.delivered)
              }"
              @click="selectCity(city)"
            >
              <div class="city-icon">{{ city.icon }}</div>
              <div class="city-name">{{ city.name }}</div>
              <div class="city-preferences">
                <span 
                  v-for="pref in city.preferences" 
                  :key="pref"
                  class="preference-badge"
                  :class="pref"
                >
                  {{ getPreferenceIcon(pref) }}
                </span>
              </div>
              <div class="city-orders" v-if="city.orders.length > 0">
                <div class="order-count">{{ city.orders.length }}</div>
                <div class="order-items">
                  <div 
                    v-for="order in city.orders" 
                    :key="order.id"
                    class="order-item"
                    :class="{ delivered: order.delivered }"
                  >
                    {{ order.item }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Склад с товарами -->
        <div class="warehouse-section">
          <h3>📦 Склад</h3>
          
          <!-- Легенда категорий -->
          <div class="category-legend">
            <div class="legend-item">
              <span class="legend-color clothing"></span>
              <span class="legend-text">Одежда и материалы</span>
            </div>
            <div class="legend-item">
              <span class="legend-color food"></span>
              <span class="legend-text">Еда</span>
            </div>
            <div class="legend-item">
              <span class="legend-color electronics"></span>
              <span class="legend-text">Электроника</span>
            </div>
            <div class="legend-item">
              <span class="legend-color entertainment"></span>
              <span class="legend-text">Развлечения</span>
            </div>
            <div class="legend-item">
              <span class="legend-color sports"></span>
              <span class="legend-text">Спорт</span>
            </div>
            <div class="legend-item">
              <span class="legend-color useless"></span>
              <span class="legend-text">Хлам</span>
            </div>
          </div>
          
          <div class="warehouse-grid">
            <div 
              v-for="item in warehouseItems" 
              :key="item.id"
              class="warehouse-item"
              :class="{ 
                'selected': selectedItem?.id === item.id,
                'low-stock': item.quantity <= 2
              }"
              :data-category="item.category"
              @click="selectItem(item)"
            >
              <div class="item-icon">{{ item.icon }}</div>
              <div class="item-name">{{ item.name }}</div>
              <div class="item-quantity">{{ item.quantity }}</div>
            </div>
          </div>
        </div>

        <!-- Действия -->
        <div class="actions-panel">
          <div class="action-buttons">
            <button 
              class="action-btn deliver-btn"
              @click="deliverOrder"
              :disabled="!canDeliver"
            >
              🚚 Доставить заказ
            </button>
            <button 
              class="action-btn restock-btn"
              @click="restockWarehouse"
              :disabled="!canRestock"
            >
              📦 Пополнить склад
            </button>
            <button 
              class="action-btn clear-btn"
              @click="clearUselessItems"
              :disabled="!canClearUseless"
            >
              🗑️ Очистить хлам
            </button>
          </div>
          
          <div class="selected-info" v-if="selectedCity && selectedItem">
            <div class="delivery-info">
              <span>Доставить {{ selectedItem.name }} в {{ selectedCity.name }}</span>
              <span class="delivery-reward">+{{ getDeliveryReward(selectedCity, selectedItem) }} очков</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Экран результатов -->
      <div v-if="gameEnded" class="results-overlay">
        <div class="results-modal">
          <div class="results-header">
            <h2>🏁 Игра завершена!</h2>
          </div>
          
          <div class="results-content">
            <div class="final-stats">
              <div class="final-stat">
                <span class="stat-label">Финальный счет:</span>
                <span class="stat-value">{{ score }}</span>
              </div>
              <div class="final-stat">
                <span class="stat-label">Доставлено заказов:</span>
                <span class="stat-value">{{ deliveredOrders }}/{{ totalOrders }}</span>
              </div>
              <div class="final-stat">
                <span class="stat-label">Эффективность:</span>
                <span class="stat-value">{{ Math.round((deliveredOrders / totalOrders) * 100) }}%</span>
              </div>
              <div class="final-stat">
                <span class="stat-label">Максимальное комбо:</span>
                <span class="stat-value">{{ combo }}</span>
              </div>
              <div class="final-stat">
                <span class="stat-label">Ошибок:</span>
                <span class="stat-value">{{ mistakes }}</span>
              </div>
              <div class="final-stat">
                <span class="stat-label">Завершенных раундов:</span>
                <span class="stat-value">{{ rounds }}</span>
              </div>
            </div>

            <div class="performance-rating">
              <div class="rating-icon">{{ getPerformanceIcon() }}</div>
              <div class="rating-text">{{ getPerformanceText() }}</div>
            </div>

            <div class="earnings">
              <div class="earnings-label">Заработано денег:</div>
              <div class="earnings-amount">₽{{ Math.round(score * 10) }}</div>
            </div>

            <div class="points-earned">
              <div class="points-label">Получено очков:</div>
              <div class="points-amount">⭐ {{ score }}</div>
            </div>
          </div>

          <div class="results-actions">
            <button class="btn-primary" @click="restartGame">
              🔄 Играть снова
            </button>
            <button class="btn-secondary" @click="close">
              ✅ Закрыть
            </button>
          </div>
        </div>
      </div>

      <!-- Экран начала игры -->
      <div v-if="!gameStarted" class="start-overlay">
        <div class="start-modal">
          <div class="start-header">
            <h2>● Логистическая гонка</h2>
          </div>
          
          <div class="start-content">
            <div class="game-description">
              <p>🎯 <strong>Цель:</strong> Доставьте максимальное количество заказов за отведенное время</p>
              <p>🚚 <strong>Как играть:</strong></p>
              <ul>
                <li>Выберите город с заказом</li>
                <li>Выберите товар на складе</li>
                <li>Нажмите "Доставить заказ"</li>
                <li>Получайте очки за быструю доставку!</li>
              </ul>
              <p>⏱️ <strong>Время:</strong> 60 секунд</p>
              <p>🔥 <strong>Комбо:</strong> Безошибочные доставки увеличивают комбо и дают больше очков!</p>
              <p>🔄 <strong>Бесконечная игра:</strong> После выполнения всех заказов генерируются новые!</p>
              <p>🎲 <strong>Особенность:</strong> Склад и предпочтения городов рандомизируются каждый раз!</p>
            </div>
          </div>

          <div class="start-actions">
            <button class="btn-primary start-btn" @click="startGame">
              🚀 Начать игру
            </button>
            <button class="btn-secondary" @click="close">
              ❌ Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { usePlayerPoints } from '@/composables/usePlayerPoints'

// Типы
interface City {
  id: string
  name: string
  icon: string
  orders: Order[]
  distance: number
  preferences: string[]
}

interface Order {
  id: string
  item: string
  quantity: number
  delivered: boolean
  deliveryTime: number
}

interface WarehouseItem {
  id: string
  name: string
  icon: string
  quantity: number
  maxQuantity: number
  category: string
}

// Эмиты
const emit = defineEmits<{
  close: []
}>()

// Composable для работы с очками
const { addLogisticsPoints } = usePlayerPoints()

// Состояние игры
const gameStarted = ref(false)
const gameEnded = ref(false)
const timeLeft = ref(60)
const score = ref(0)
const deliveredOrders = ref(0)
const totalOrders = ref(0)
const combo = ref(0)
const mistakes = ref(0)
const rounds = ref(1)

// Выбранные элементы
const selectedCity = ref<City | null>(null)
const selectedItem = ref<WarehouseItem | null>(null)

// Таймер
let gameTimer: number | null = null

// Города с случайными предпочтениями
const cities = ref<City[]>([
  { 
    id: 'moscow', 
    name: 'Москва', 
    icon: '🏛️', 
    orders: [], 
    distance: 1,
    preferences: []
  },
  { 
    id: 'spb', 
    name: 'СПб', 
    icon: '🏰', 
    orders: [], 
    distance: 2,
    preferences: []
  },
  { 
    id: 'kazan', 
    name: 'Казань', 
    icon: '🕌', 
    orders: [], 
    distance: 3,
    preferences: []
  },
  { 
    id: 'ekaterinburg', 
    name: 'Екатеринбург', 
    icon: '🏭', 
    orders: [], 
    distance: 4,
    preferences: []
  },
  { 
    id: 'novosibirsk', 
    name: 'Новосибирск', 
    icon: '🌲', 
    orders: [], 
    distance: 5,
    preferences: []
  },
  { 
    id: 'vladivostok', 
    name: 'Владивосток', 
    icon: '🌊', 
    orders: [], 
    distance: 6,
    preferences: []
  }
])

// Склад - базовые товары
const baseWarehouseItems = [
  // Одежда
  { id: 'shirt', name: 'Рубашки', icon: '👕', category: 'clothing', maxQuantity: 15 },
  { id: 'pants', name: 'Брюки', icon: '👖', category: 'clothing', maxQuantity: 12 },
  { id: 'dress', name: 'Платья', icon: '👗', category: 'clothing', maxQuantity: 10 },
  { id: 'shoes', name: 'Обувь', icon: '👟', category: 'clothing', maxQuantity: 15 },
  { id: 'hat', name: 'Головные уборы', icon: '🧢', category: 'clothing', maxQuantity: 8 },
  { id: 'bag', name: 'Сумки', icon: '👜', category: 'clothing', maxQuantity: 10 },
  { id: 'jacket', name: 'Куртки', icon: '🧥', category: 'clothing', maxQuantity: 12 },
  { id: 'sweater', name: 'Свитеры', icon: '🧶', category: 'clothing', maxQuantity: 10 },
  { id: 'socks', name: 'Носки', icon: '🧦', category: 'clothing', maxQuantity: 20 },
  { id: 'tie', name: 'Галстуки', icon: '👔', category: 'clothing', maxQuantity: 15 },
  { id: 'coat', name: 'Пальто', icon: '🧥', category: 'clothing', maxQuantity: 8 },
  { id: 'shorts', name: 'Шорты', icon: '🩳', category: 'clothing', maxQuantity: 18 },
  { id: 'skirt', name: 'Юбки', icon: '👗', category: 'clothing', maxQuantity: 12 },
  { id: 'suit', name: 'Костюмы', icon: '🤵', category: 'clothing', maxQuantity: 6 },
  { id: 'boots', name: 'Сапоги', icon: '👢', category: 'clothing', maxQuantity: 10 },
  { id: 'sandals', name: 'Сандалии', icon: '👡', category: 'clothing', maxQuantity: 15 },
  { id: 'belt', name: 'Ремни', icon: '👝', category: 'clothing', maxQuantity: 18 },
  { id: 'scarf', name: 'Шарфы', icon: '🧣', category: 'clothing', maxQuantity: 22 },
  { id: 'gloves', name: 'Перчатки', icon: '🧤', category: 'clothing', maxQuantity: 25 },
  { id: 'underwear', name: 'Белье', icon: '🩲', category: 'clothing', maxQuantity: 25 },
  
  // Материалы для одежды
  { id: 'cotton', name: 'Хлопок', icon: '🌾', category: 'clothing', maxQuantity: 20 },
  { id: 'leather', name: 'Кожа', icon: '🟫', category: 'clothing', maxQuantity: 15 },
  { id: 'wool', name: 'Шерсть', icon: '🐑', category: 'clothing', maxQuantity: 18 },
  { id: 'silk', name: 'Шелк', icon: '🕷️', category: 'clothing', maxQuantity: 12 },
  { id: 'denim', name: 'Деним', icon: '👖', category: 'clothing', maxQuantity: 16 },
  { id: 'fabric', name: 'Ткань', icon: '📐', category: 'clothing', maxQuantity: 22 },
  { id: 'thread', name: 'Нитки', icon: '🧵', category: 'clothing', maxQuantity: 30 },
  { id: 'buttons', name: 'Пуговицы', icon: '🔘', category: 'clothing', maxQuantity: 40 },
  { id: 'zippers', name: 'Молнии', icon: '⚡', category: 'clothing', maxQuantity: 25 },
  { id: 'elastic', name: 'Резинка', icon: '🔗', category: 'clothing', maxQuantity: 35 },
  { id: 'lace', name: 'Кружево', icon: '🌸', category: 'clothing', maxQuantity: 20 },
  { id: 'velvet', name: 'Бархат', icon: '🟣', category: 'clothing', maxQuantity: 15 },
  { id: 'linen', name: 'Лен', icon: '🌿', category: 'clothing', maxQuantity: 18 },
  { id: 'polyester', name: 'Полиэстер', icon: '🔬', category: 'clothing', maxQuantity: 25 },
  
  // Еда
  { id: 'orange', name: 'Апельсины', icon: '🍊', category: 'food', maxQuantity: 20 },
  { id: 'apple', name: 'Яблоки', icon: '🍎', category: 'food', maxQuantity: 18 },
  { id: 'bread', name: 'Хлеб', icon: '🍞', category: 'food', maxQuantity: 15 },
  { id: 'milk', name: 'Молоко', icon: '🥛', category: 'food', maxQuantity: 12 },
  { id: 'cheese', name: 'Сыр', icon: '🧀', category: 'food', maxQuantity: 10 },
  
  // Электроника
  { id: 'phone', name: 'Телефоны', icon: '📱', category: 'electronics', maxQuantity: 8 },
  { id: 'laptop', name: 'Ноутбуки', icon: '💻', category: 'electronics', maxQuantity: 5 },
  { id: 'headphones', name: 'Наушники', icon: '🎧', category: 'electronics', maxQuantity: 12 },
  { id: 'camera', name: 'Камеры', icon: '📷', category: 'electronics', maxQuantity: 6 },
  
  // Книги и развлечения
  { id: 'book', name: 'Книги', icon: '📚', category: 'entertainment', maxQuantity: 20 },
  { id: 'game', name: 'Игры', icon: '🎮', category: 'entertainment', maxQuantity: 15 },
  { id: 'puzzle', name: 'Пазлы', icon: '🧩', category: 'entertainment', maxQuantity: 10 },
  
  // Спорт и активность
  { id: 'ball', name: 'Мячи', icon: '⚽', category: 'sports', maxQuantity: 15 },
  { id: 'yoga_mat', name: 'Коврики для йоги', icon: '🧘', category: 'sports', maxQuantity: 8 },
  { id: 'bike', name: 'Велосипеды', icon: '🚲', category: 'sports', maxQuantity: 5 },
  
  // Бесполезные и смешные вещи
  { id: 'sock', name: 'Тухлые носки', icon: '🧦', category: 'useless', maxQuantity: 25 },
  { id: 'banana_peel', name: 'Банановая кожура', icon: '🍌', category: 'useless', maxQuantity: 30 },
  { id: 'broken_clock', name: 'Сломанные часы', icon: '⏰', category: 'useless', maxQuantity: 20 },
  { id: 'empty_bottle', name: 'Пустые бутылки', icon: '🍾', category: 'useless', maxQuantity: 35 },
  { id: 'old_newspaper', name: 'Старые газеты', icon: '📰', category: 'useless', maxQuantity: 40 },
  { id: 'dust_bunny', name: 'Пылевые кролики', icon: '🐰', category: 'useless', maxQuantity: 50 },
  { id: 'left_sock', name: 'Одинокие носки', icon: '🧦', category: 'useless', maxQuantity: 45 },
  { id: 'mystery_box', name: 'Таинственные коробки', icon: '📦', category: 'useless', maxQuantity: 15 }
]

const warehouseItems = ref<WarehouseItem[]>([])

// Вычисляемые свойства
const progressPercent = computed(() => {
  if (totalOrders.value === 0) return 0
  return Math.round((deliveredOrders.value / totalOrders.value) * 100)
})

const canDeliver = computed(() => {
  return selectedCity.value && 
         selectedItem.value && 
         selectedItem.value.quantity > 0 &&
         selectedCity.value.orders.some(o => o.item === selectedItem.value!.name && !o.delivered)
})

const canRestock = computed(() => {
  return selectedItem.value && selectedItem.value.quantity < selectedItem.value.maxQuantity
})

const canClearUseless = computed(() => {
  return warehouseItems.value.some(item => item.category === 'useless' && item.quantity > 0)
})

// Функции
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function startGame() {
  gameStarted.value = true
  gameEnded.value = false
  timeLeft.value = 60
  score.value = 0
  deliveredOrders.value = 0
  combo.value = 0
  mistakes.value = 0
  rounds.value = 1
  
  // Рандомизируем склад
  randomizeWarehouse()
  
  // Генерируем заказы
  generateOrders()
  
  // Запускаем таймер
  startTimer()
}

// Рандомизация склада и предпочтений городов
function randomizeWarehouse() {
  // Выбираем случайные 8-12 товаров из всех доступных
  const availableItems = [...baseWarehouseItems]
  const selectedCount = Math.floor(Math.random() * 5) + 8 // 8-12 товаров
  const selectedItems = []
  
  for (let i = 0; i < selectedCount; i++) {
    const randomIndex = Math.floor(Math.random() * availableItems.length)
    const item = availableItems.splice(randomIndex, 1)[0]
    selectedItems.push({
      ...item,
      quantity: Math.floor(Math.random() * (item.maxQuantity * 0.6)) + Math.floor(item.maxQuantity * 0.2)
    })
  }
  
  warehouseItems.value = selectedItems
  
  // Рандомизируем предпочтения городов (только одежда и её материалы)
  const clothingRelatedCategories = ['clothing']
  
  cities.value.forEach(city => {
    // Каждый город получает 1-3 случайных предпочтения из связанных с одеждой
    const prefCount = Math.floor(Math.random() * 3) + 1
    const shuffled = [...clothingRelatedCategories].sort(() => 0.5 - Math.random())
    city.preferences = shuffled.slice(0, prefCount)
  })
  
  console.log('🎲 Склад рандомизирован:', warehouseItems.value.map(item => item.name))
  console.log('🏙️ Предпочтения городов:', cities.value.map(city => 
    `${city.name}: ${city.preferences.join(', ')}`
  ).join(' | '))
}

function generateOrders() {
  totalOrders.value = 0
  
  cities.value.forEach(city => {
    city.orders = []
    
    // Находим товары, которые предпочитает этот город (только связанные с одеждой)
    const preferredItems = warehouseItems.value.filter(item => 
      city.preferences.includes(item.category)
    )
    
    // Если нет предпочитаемых товаров, берем любые подходящие (только одежда)
    const availableItems = preferredItems.length > 0 ? preferredItems : 
      warehouseItems.value.filter(item => 
        item.category === 'clothing'
      )
    
    if (availableItems.length === 0) {
      console.log(`⚠️ Нет подходящих товаров для заказов в ${city.name}!`)
      return
    }
    
    // Каждый город получает 1-3 заказа
    const orderCount = Math.floor(Math.random() * 3) + 1
    
    for (let i = 0; i < orderCount; i++) {
      // Выбираем случайный товар из предпочитаемых
      const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)]
      
      city.orders.push({
        id: `${city.id}-${i}`,
        item: randomItem.name,
        quantity: 1,
        delivered: false,
        deliveryTime: Date.now()
      })
    }
    
    totalOrders.value += city.orders.length
  })
  
  console.log('📦 Сгенерированы заказы:', cities.value.map(city => 
    `${city.name}: ${city.orders.map(o => o.item).join(', ')}`
  ).join(' | '))
}

function generateNewOrders() {
  // Сбрасываем счетчик доставленных заказов
  deliveredOrders.value = 0
  
  // Увеличиваем счетчик раундов
  rounds.value++
  
  // Генерируем новые заказы
  generateOrders()
  
  // Показываем уведомление о новых заказах
  showNewOrdersNotification()
  
  console.log(`🔄 Раунд ${rounds.value}! Новые заказы сгенерированы! Продолжаем игру!`)
}

function selectCity(city: City) {
  selectedCity.value = city
}


function selectItem(item: WarehouseItem) {
  selectedItem.value = item
}

function deliverOrder() {
  if (!canDeliver.value) return
  
  const city = selectedCity.value!
  const item = selectedItem.value!
  
  // Находим первый невыполненный заказ на этот товар
  const order = city.orders.find(o => o.item === item.name && !o.delivered)
  
  if (order) {
    // Увеличиваем комбо за успешную доставку
    combo.value++
    
    // Вычисляем очки за доставку (базовые очки + бонус за комбо)
    const baseReward = 10
    const comboBonus = Math.min(combo.value * 2, 20) // Максимум +20 за комбо
    const distanceBonus = city.distance * 2
    const totalReward = baseReward + comboBonus + distanceBonus
    
    score.value += totalReward
    
    // Отмечаем заказ как выполненный
    order.delivered = true
    deliveredOrders.value++
    
    // Уменьшаем количество товара на складе
    item.quantity--
    
    // Анимация успешной доставки
    showDeliverySuccess(city)
    
    console.log(`✅ Доставка: ${item.name} в ${city.name} (+${totalReward} очков, комбо: ${combo.value})`)
    
    // Проверяем, не закончились ли заказы
    if (deliveredOrders.value >= totalOrders.value) {
      // Генерируем новые заказы вместо окончания игры
      generateNewOrders()
    }
  }
}

function getDeliveryReward(city: City, item: WarehouseItem): number {
  // Базовые очки за доставку
  let reward = 10
  
  // Бонус за категорию товара
  const categoryMultipliers = {
    'clothing': 1.5,      // Одежда - основная продукция
    'electronics': 2.0,   // Электроника - дорогие товары
    'food': 1.2,          // Еда - средняя ценность
    'entertainment': 1.3, // Развлечения - хорошая ценность
    'sports': 1.4,        // Спорт - активный образ жизни
    'useless': 0.1        // Бесполезные вещи - почти без очков
  }
  
  const multiplier = categoryMultipliers[item.category as keyof typeof categoryMultipliers] || 1.0
  reward *= multiplier
  
  // Бонус за расстояние (чем дальше, тем больше очков)
  reward += city.distance * 2
  
  // Бонус за время (чем быстрее, тем больше очков)
  const timeBonus = Math.max(0, timeLeft.value - 30) * 0.5
  reward += Math.round(timeBonus)
  
  // Бонус за дефицитный товар
  if (item.quantity <= 2) {
    reward += 5
  }
  
  // Штраф за бесполезные вещи
  if (item.category === 'useless') {
    reward = Math.max(1, reward - 5) // Минимум 1 очко
  }
  
  return Math.round(reward)
}

function restockWarehouse() {
  if (!canRestock.value) return
  
  const item = selectedItem.value!
  const restockAmount = Math.min(3, item.maxQuantity - item.quantity)
  item.quantity += restockAmount
  
  // Сбрасываем комбо за пополнение склада
  if (combo.value > 0) {
    combo.value = 0
    console.log('⚠️ Комбо сброшен из-за пополнения склада')
  }
}

function clearUselessItems() {
  if (!canClearUseless.value) return
  
  // Удаляем все бесполезные вещи
  const uselessItems = warehouseItems.value.filter(item => item.category === 'useless')
  uselessItems.forEach(item => {
    item.quantity = 0
  })
  
  // Сбрасываем комбо за очистку склада
  if (combo.value > 0) {
    combo.value = 0
    console.log('⚠️ Комбо сброшен из-за очистки склада')
  }
  
  console.log('🗑️ Хлам очищен!')
}

function startTimer() {
  gameTimer = window.setInterval(() => {
    timeLeft.value--
    
    if (timeLeft.value <= 0) {
      endGame()
    }
  }, 1000)
}

async function endGame() {
  gameEnded.value = true
  if (gameTimer) {
    clearInterval(gameTimer)
    gameTimer = null
  }

  // Начисляем очки за логистическую гонку
  try {
    await addLogisticsPoints(
      score.value,
      deliveredOrders.value,
      totalOrders.value,
      combo.value,
      mistakes.value,
      rounds.value
    )
    console.log(`🏁 Игра завершена! Получено очков: ${score.value}`)
  } catch (error) {
    console.error('Ошибка при начислении очков за логистическую гонку:', error)
  }
}

function restartGame() {
  gameStarted.value = false
  gameEnded.value = false
  selectedCity.value = null
  selectedItem.value = null
}

function showDeliverySuccess(city: City) {
  // Простая анимация успеха
  const cityElement = document.querySelector(`[data-city="${city.id}"]`) as HTMLElement
  if (cityElement) {
    cityElement.style.animation = 'deliverySuccess 0.5s ease-in-out'
    setTimeout(() => {
      cityElement.style.animation = ''
    }, 500)
  }
}

function showNewOrdersNotification() {
  // Создаем временное уведомление о новых заказах
  const notification = document.createElement('div')
  notification.className = 'new-orders-notification'
  notification.innerHTML = '🔄 Новые заказы поступили!'
  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--color-highlights);
    color: white;
    padding: 20px 30px;
    border-radius: 10px;
    font-size: 18px;
    font-weight: bold;
    z-index: 1000;
    animation: newOrdersPulse 2s ease-in-out;
  `
  
  // Добавляем стили для анимации
  const style = document.createElement('style')
  style.textContent = `
    @keyframes newOrdersPulse {
      0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
      50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
      100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
    }
  `
  document.head.appendChild(style)
  
  document.body.appendChild(notification)
  
  // Удаляем уведомление через 2 секунды
  setTimeout(() => {
    document.body.removeChild(notification)
    document.head.removeChild(style)
  }, 2000)
}

function getPerformanceIcon(): string {
  const efficiency = (deliveredOrders.value / totalOrders.value) * 100
  if (efficiency >= 90) return '🏆'
  if (efficiency >= 70) return '🥈'
  if (efficiency >= 50) return '🥉'
  return '📦'
}

function getPerformanceText(): string {
  const efficiency = (deliveredOrders.value / totalOrders.value) * 100
  
  if (rounds.value >= 3 && mistakes.value === 0) {
    return 'Мастер логистики! Несколько раундов без ошибок!'
  }
  
  if (rounds.value >= 2 && combo.value >= 10) {
    return 'Отличная выносливость! Многократные комбо!'
  }
  
  if (mistakes.value === 0 && combo.value >= 5) {
    return 'Идеальная игра! Без единой ошибки!'
  }
  
  if (mistakes.value === 0) {
    return 'Отлично! Без ошибок!'
  }
  
  if (combo.value >= 10) {
    return 'Великолепное комбо!'
  }
  
  if (rounds.value >= 2) {
    return 'Хорошая выносливость!'
  }
  
  if (efficiency >= 90) return 'Отличная работа!'
  if (efficiency >= 70) return 'Хороший результат!'
  if (efficiency >= 50) return 'Неплохо!'
  return 'Попробуйте еще раз!'
}

function getPreferenceIcon(category: string): string {
  const icons = {
    'clothing': '👕',
    'electronics': '📱',
    'entertainment': '🎮',
    'sports': '⚽',
    'food': '🍎',
    'useless': '🗑️'
  }
  return icons[category as keyof typeof icons] || '❓'
}

function close() {
  if (gameTimer) {
    clearInterval(gameTimer)
    gameTimer = null
  }
  emit('close')
}

// Очистка при размонтировании
onUnmounted(() => {
  if (gameTimer) {
    clearInterval(gameTimer)
  }
})
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
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.logistics-modal {
  background: var(--color-bg-menu-light);
  border-radius: 15px;
  width: clamp(1200px, 85vw, 1800px);
  height: clamp(700px, 85vh, 1000px);
  overflow: hidden;
  box-shadow: 0 8px 16px var(--shadow-medium);
  border: 2px solid var(--color-buttons);
  display: flex;
  flex-direction: column;
  position: relative;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 25px;
  background: var(--color-bg-menu);
  border-bottom: 2px solid var(--color-buttons);
  border-radius: 15px 15px 0 0;
}

.modal-title {
  margin: 0;
  color: var(--color-text);
  font-size: clamp(1.4rem, 2.2vw, 1.8rem);
  font-weight: 700;
  text-shadow: 2px 2px 0px var(--shadow-light);
}

.close-btn {
  background: var(--color-buttons);
  border: 2px solid var(--color-accents);
  border-radius: 12px;
  color: var(--color-text);
  font-size: clamp(1rem, 1.5vw, 1.2rem);
  font-weight: 600;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px var(--shadow-light);
}

.close-btn:hover {
  background: var(--color-accents);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px var(--shadow-medium);
}

.game-container {
  flex: 1;
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 20px;
  background: var(--color-bg-menu-light);
}

.info-panel {
  grid-column: 1 / -1;
  background: var(--color-bg-menu);
  border: 2px solid var(--color-buttons);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 4px var(--shadow-light);
}

.game-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: clamp(0.7rem, 1.1vw, 0.9rem);
  color: var(--color-text);
  opacity: 0.8;
}

.stat-value {
  font-size: clamp(1.2rem, 1.8vw, 1.5rem);
  font-weight: 700;
  color: var(--color-text);
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.stat-value.timer {
  font-family: 'Courier New', monospace;
  color: var(--color-accents);
}

.stat-value.timer.urgent {
  color: var(--color-highlights);
  animation: pulse 1s infinite;
}

.stat-value.score {
  color: var(--color-highlights);
}

.stat-value.combo {
  color: var(--color-accents);
}

.stat-value.combo.combo-active {
  color: var(--color-highlights);
  animation: pulse 1s infinite;
}

.stat-value.mistakes {
  color: #FF5722;
}

.stat-value.rounds {
  color: var(--color-accents);
  font-weight: bold;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--color-bg-menu-light);
  border: 2px solid var(--color-buttons);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accents), var(--color-highlights));
  transition: width 0.3s ease;
}

.map-container {
  background: var(--color-bg-menu);
  border: 2px solid var(--color-buttons);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 4px var(--shadow-light);
}

.map-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  height: 100%;
}

.city-card {
  background: var(--color-bg-menu-light);
  border: 2px solid var(--color-buttons);
  border-radius: 10px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 4px var(--shadow-light);
}

.city-card:hover {
  border-color: var(--color-accents);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px var(--shadow-medium);
}

.city-card.has-orders {
  border-color: var(--color-highlights);
  background: var(--color-bg-menu);
}

.city-card.selected {
  border-color: var(--color-accents);
  background: var(--color-accents);
  color: var(--color-text);
}

.city-card.delivered {
  opacity: 0.6;
  border-color: var(--color-buttons);
}

.city-icon {
  font-size: clamp(1.8rem, 2.5vw, 2.2rem);
}

.city-name {
  font-size: clamp(0.8rem, 1.2vw, 1rem);
  font-weight: 600;
  text-align: center;
  color: var(--color-text);
}

.city-preferences {
  display: flex;
  justify-content: center;
  gap: 2px;
  margin: 4px 0;
}

.preference-badge {
  display: inline-block;
  padding: 2px 4px;
  border-radius: 4px;
  font-size: clamp(0.6rem, 1vw, 0.8rem);
  background: var(--color-bg-menu-light);
  border: 1px solid var(--color-buttons);
}

.city-orders {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.order-count {
  background: var(--color-highlights);
  color: var(--color-text);
  border-radius: 12px;
  padding: 2px 8px;
  font-size: clamp(0.6rem, 1vw, 0.8rem);
  font-weight: 700;
  text-align: center;
  align-self: center;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.order-item {
  background: var(--color-bg-menu-light);
  border: 1px solid var(--color-buttons);
  border-radius: 6px;
  padding: 4px 6px;
  font-size: clamp(0.6rem, 1vw, 0.8rem);
  text-align: center;
  color: var(--color-text);
}

.order-item.delivered {
  opacity: 0.5;
  text-decoration: line-through;
}

.warehouse-section {
  background: var(--color-bg-menu);
  border: 2px solid var(--color-buttons);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 4px var(--shadow-light);
}

.warehouse-section h3 {
  margin: 0 0 12px 0;
  font-size: clamp(1rem, 1.5vw, 1.2rem);
  font-weight: 700;
  color: var(--color-text);
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.category-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px;
  background: var(--color-bg-menu-light);
  border: 2px solid var(--color-buttons);
  border-radius: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: clamp(0.6rem, 1vw, 0.8rem);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  border: 1px solid var(--color-text);
}

.legend-color.clothing { background: #4CAF50; }
.legend-color.electronics { background: #2196F3; }
.legend-color.food { background: #FF9800; }
.legend-color.entertainment { background: #9C27B0; }
.legend-color.sports { background: #F44336; }
.legend-color.useless { background: #9E9E9E; }

.legend-text {
  color: var(--color-text);
  font-weight: 600;
}

.warehouse-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 8px;
}

/* Скроллбар для склада */
.warehouse-grid::-webkit-scrollbar {
  width: 6px;
}

.warehouse-grid::-webkit-scrollbar-track {
  background: var(--color-bg-menu-light);
  border-radius: 3px;
}

.warehouse-grid::-webkit-scrollbar-thumb {
  background: var(--color-buttons);
  border-radius: 3px;
}

.warehouse-grid::-webkit-scrollbar-thumb:hover {
  background: var(--color-accents);
}

.warehouse-item {
  background: var(--color-bg-menu-light);
  border: 2px solid var(--color-buttons);
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 4px var(--shadow-light);
}

.warehouse-item:hover {
  border-color: var(--color-accents);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px var(--shadow-medium);
}

.warehouse-item.selected {
  border-color: var(--color-accents);
  background: var(--color-accents);
}

.warehouse-item.low-stock {
  border-color: var(--color-highlights);
  background: var(--color-bg-menu);
}

/* Категории товаров */
.warehouse-item[data-category="clothing"] {
  border-left: 4px solid #4CAF50;
}

.warehouse-item[data-category="electronics"] {
  border-left: 4px solid #2196F3;
}

.warehouse-item[data-category="food"] {
  border-left: 4px solid #FF9800;
}

.warehouse-item[data-category="entertainment"] {
  border-left: 4px solid #9C27B0;
}

.warehouse-item[data-category="sports"] {
  border-left: 4px solid #F44336;
}

.warehouse-item[data-category="useless"] {
  border-left: 4px solid #9E9E9E;
  opacity: 0.7;
}

.item-icon {
  font-size: clamp(1.2rem, 1.8vw, 1.5rem);
}

.item-name {
  font-size: clamp(0.7rem, 1.1vw, 0.9rem);
  font-weight: 600;
  text-align: center;
  color: var(--color-text);
}

.item-quantity {
  background: var(--color-buttons);
  color: var(--color-text);
  border-radius: 8px;
  padding: 2px 6px;
  font-size: clamp(0.6rem, 1vw, 0.8rem);
  font-weight: 700;
}

.actions-panel {
  grid-column: 1 / -1;
  background: var(--color-bg-menu);
  border: 2px solid var(--color-buttons);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 4px var(--shadow-light);
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.action-btn {
  flex: 1;
  padding: 12px 20px;
  border: 2px solid var(--color-buttons);
  border-radius: 10px;
  font-weight: 600;
  font-size: clamp(0.8rem, 1.2vw, 1rem);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px var(--shadow-light);
}

.deliver-btn {
  background: var(--color-accents);
  color: var(--color-text);
  border-color: var(--color-highlights);
}

.deliver-btn:hover:not(:disabled) {
  background: var(--color-highlights);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px var(--shadow-medium);
}

.restock-btn {
  background: var(--color-bg-menu-light);
  color: var(--color-text);
}

.restock-btn:hover:not(:disabled) {
  background: var(--color-bg-menu);
  border-color: var(--color-accents);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px var(--shadow-medium);
}

.clear-btn {
  background: #FF5722;
  color: var(--color-text);
  border-color: #D32F2F;
}

.clear-btn:hover:not(:disabled) {
  background: #D32F2F;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px var(--shadow-medium);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.selected-info {
  background: var(--color-bg-menu-light);
  border: 2px solid var(--color-buttons);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: clamp(0.7rem, 1.1vw, 0.9rem);
  color: var(--color-text);
}

.delivery-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.delivery-reward {
  color: var(--color-highlights);
  font-weight: 700;
}

/* Экран результатов */
.results-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.results-modal {
  background: var(--color-bg-menu-light);
  border: 2px solid var(--color-buttons);
  border-radius: 15px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 8px 16px var(--shadow-medium);
}

.results-header h2 {
  margin: 0 0 20px 0;
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  font-weight: 700;
  color: var(--color-text);
  text-align: center;
  text-shadow: 2px 2px 0px var(--shadow-light);
}

.final-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.final-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--color-bg-menu);
  border: 2px solid var(--color-buttons);
  border-radius: 8px;
}

.performance-rating {
  text-align: center;
  margin-bottom: 20px;
}

.rating-icon {
  font-size: clamp(3rem, 5vw, 4rem);
  margin-bottom: 10px;
}

.rating-text {
  font-size: clamp(1rem, 1.5vw, 1.2rem);
  font-weight: 700;
  color: var(--color-text);
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.earnings {
  text-align: center;
  margin-bottom: 20px;
}

.earnings-label {
  font-size: clamp(0.8rem, 1.2vw, 1rem);
  color: var(--color-text);
  opacity: 0.8;
  margin-bottom: 5px;
}

.earnings-amount {
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  font-weight: 700;
  color: var(--color-highlights);
  text-shadow: 2px 2px 0px var(--shadow-light);
}

.points-earned {
  text-align: center;
  margin-bottom: 20px;
  padding: 15px;
  background: var(--color-accents);
  border: 2px solid var(--color-highlights);
  border-radius: 12px;
  animation: pointsEarned 0.8s ease-in-out;
}

.points-label {
  font-size: clamp(0.8rem, 1.2vw, 1rem);
  color: var(--color-text);
  opacity: 0.9;
  margin-bottom: 5px;
}

.points-amount {
  font-size: clamp(1.8rem, 2.8vw, 2.2rem);
  font-weight: 700;
  color: var(--color-text);
  text-shadow: 2px 2px 0px var(--shadow-light);
  animation: pointsPulse 1.5s infinite;
}

@keyframes pointsEarned {
  0% { 
    opacity: 0; 
    transform: scale(0.8) translateY(20px); 
  }
  50% { 
    opacity: 1; 
    transform: scale(1.05) translateY(-5px); 
  }
  100% { 
    opacity: 1; 
    transform: scale(1) translateY(0); 
  }
}

@keyframes pointsPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.results-actions {
  display: flex;
  gap: 12px;
}

.btn-primary, .btn-secondary {
  flex: 1;
  padding: 12px 20px;
  border: 2px solid var(--color-buttons);
  border-radius: 10px;
  font-weight: 600;
  font-size: clamp(0.8rem, 1.2vw, 1rem);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px var(--shadow-light);
}

.btn-primary {
  background: var(--color-accents);
  color: var(--color-text);
  border-color: var(--color-highlights);
}

.btn-primary:hover {
  background: var(--color-highlights);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px var(--shadow-medium);
}

.btn-secondary {
  background: var(--color-bg-menu-light);
  color: var(--color-text);
}

.btn-secondary:hover {
  background: var(--color-bg-menu);
  border-color: var(--color-accents);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px var(--shadow-medium);
}

/* Экран начала игры */
.start-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.start-modal {
  background: var(--color-bg-menu-light);
  border: 2px solid var(--color-buttons);
  border-radius: 15px;
  padding: 30px;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 8px 16px var(--shadow-medium);
}

.start-header h2 {
  margin: 0 0 20px 0;
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  font-weight: 700;
  color: var(--color-text);
  text-align: center;
  text-shadow: 2px 2px 0px var(--shadow-light);
}

.game-description {
  margin-bottom: 20px;
}

.game-description p {
  margin: 0 0 10px 0;
  font-size: clamp(0.8rem, 1.2vw, 1rem);
  color: var(--color-text);
  line-height: 1.4;
}

.game-description ul {
  margin: 10px 0;
  padding-left: 20px;
}

.game-description li {
  margin: 5px 0;
  font-size: clamp(0.8rem, 1.2vw, 1rem);
  color: var(--color-text);
  line-height: 1.4;
}

.start-actions {
  display: flex;
  gap: 12px;
}

.start-btn {
  flex: 2;
}

/* Анимации */
@keyframes deliverySuccess {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* Адаптивность */
@media (max-width: 1200px) {
  .game-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr 1fr auto;
  }
  
  .map-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .logistics-modal {
    width: 98%;
    height: 95vh;
  }
  
  .map-grid {
    grid-template-columns: 1fr;
  }
  
  .warehouse-grid {
    grid-template-columns: 1fr;
    max-height: 350px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .results-actions,
  .start-actions {
    flex-direction: column;
  }
  
  .category-legend {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>