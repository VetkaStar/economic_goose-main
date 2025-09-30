<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="social-modal">
      <div class="header">
        <h2>💻 Социальная сеть "ГусьМаркет"</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="content">
        <!-- Вкладки -->
        <div class="tabs">
          <button 
            class="tab" 
            :class="{ active: activeTab === 'orders' }" 
            @click="activeTab = 'orders'"
          >
            ✨ Заказы
          </button>
          <button 
            class="tab" 
            :class="{ active: activeTab === 'taken' }" 
            @click="activeTab = 'taken'"
          >
            🎯 Мои заказы
          </button>
          <button 
            class="tab" 
            :class="{ active: activeTab === 'create' }" 
            @click="activeTab = 'create'"
          >
            🌈 Поделиться
          </button>
        </div>

        <!-- Контент вкладок -->
        <div class="tab-content">
          <!-- Доступные заказы -->
          <div v-if="activeTab === 'orders'" class="orders-page">
            <h3 class="section-title">✨ Заказы для тебя</h3>
            <div class="orders-list" v-if="visibleOrders.length > 0">
              <div v-for="order in visibleOrders" :key="order.id" class="order-card">
                <div class="order-icon">{{ order.itemIcon }}</div>
                <div class="order-info">
                  <div class="order-title">{{ order.title }}</div>
                  <div class="order-meta">от {{ order.customer }}</div>
                  <div class="order-details">{{ order.quantity }} шт · {{ order.pricePerUnit }}₽/шт</div>
                  <div class="order-requirements">
                    <div class="req-item">🎨 {{ order.requirements.color }}</div>
                    <div class="req-item">👕 {{ order.itemName }}</div>
                    <div class="req-item">🎭 {{ getPatternName(order.requirements.pattern) }}</div>
                    <div class="req-item">🧵 {{ order.requirements.material }}</div>
                    <div class="req-item">⭐ Качество: {{ order.requirements.quality }}% <span class="dev-note">(в разработке)</span></div>
                  </div>
                </div>
                <button class="btn take-btn" @click="take(order.id)">Взять</button>
              </div>
            </div>
            <div class="empty cute" v-else>
              <div class="empty-icon">🍀</div>
              <p>Новых заказов пока нет. Скоро появятся!</p>
              <div class="hint">Обновление каждые 5 минут ✨</div>
            </div>
          </div>

          <!-- Взятые заказы -->
          <div v-if="activeTab === 'taken'" class="taken-page">
            <h3 class="section-title">
              🎯 Мои заказы 
              <span v-if="activeOrdersCount > 0" class="active-orders-badge">
                ({{ activeOrdersCount }} активных)
              </span>
            </h3>
            <div v-if="takenOrders.length === 0" class="empty">
              <div class="empty-icon">📋</div>
              <p>У вас пока нет взятых заказов</p>
            </div>
            <div v-else class="taken-list">
              <div v-for="order in sortedTakenOrders" :key="order.id" class="taken-card">
                <div class="taken-header">
                  <div class="order-icon">{{ order.itemIcon }}</div>
                  <div class="order-info">
                    <div class="order-title">{{ order.title }}</div>
                    <div class="order-meta">от {{ order.customer }}</div>
                    <div class="order-status" :class="order.status">
                      {{ getOrderStatusText(order.status) }}
                    </div>
                  </div>
                </div>
                
                <div class="requirements">
                  <h4>Требования:</h4>
                  <div class="req-grid">
                    <div class="req-item">🎨 Цвет: {{ order.requirements.color }}</div>
                    <div class="req-item">👕 Изделие: {{ order.itemName }}</div>
                    <div class="req-item">🎭 Узор: {{ getPatternName(order.requirements.pattern) }}</div>
                    <div class="req-item">🧵 Материал: {{ order.requirements.material }}</div>
                    <div class="req-item">⭐ Качество: {{ order.requirements.quality }}% <span class="dev-note">(в разработке)</span></div>
                  </div>
                </div>

                <div v-if="order.status === 'in_progress' || order.status === 'failed'" class="submit-section">
                  <h4>Сдать заказ:</h4>
                  <div class="submit-form">
                    <div class="form-group">
                      <label>Количество предметов (нужно: {{ order.quantity }}):</label>
                      <input 
                        type="number" 
                        v-model.number="submitQuantities[order.id]" 
                        :max="order.quantity"
                        min="1"
                        class="quantity-input"
                      />
                    </div>
                    <div class="submit-buttons">
                      <button 
                        class="btn submit-btn" 
                        @click="submitOrder(order.id)"
                        :disabled="!submitQuantities[order.id] || submitQuantities[order.id] < 1"
                      >
                        Сдать заказ
                      </button>
                      <button 
                        class="btn submit-all-btn" 
                        @click="submitAllOrder(order.id)"
                        :disabled="!canSubmitAll(order.id)"
                      >
                        Передать всё
                      </button>
                    </div>
                  </div>
                </div>

                <div v-if="order.status === 'completed'" class="success-message">
                  ✅ Заказ выполнен успешно! +{{ order.quantity * order.pricePerUnit }}₽
                </div>

                <div v-if="order.status === 'failed'" class="error-message">
                  ❌ Заказ не прошёл проверку. Проверьте соответствие требованиям.
                </div>
              </div>
            </div>
          </div>

          <!-- Создание поста -->
          <div v-if="activeTab === 'create'" class="create-page">
            <h3 class="section-title">🌈 Поделись своей красотой</h3>
            <div class="create-tabs">
              <button 
                class="create-tab" 
                :class="{ active: createType === 'offer' }" 
                @click="createType = 'offer'"
              >
                📦 Предложить товар
              </button>
              <button 
                class="create-tab" 
                :class="{ active: createType === 'request' }" 
                @click="createType = 'request'"
              >
                🔍 Искать товар
              </button>
            </div>

            <div class="create-form">
              <div class="form-group">
                <label>Выберите товар:</label>
                <select v-model="selectedItem" class="item-select">
                  <option value="">-- Выберите товар --</option>
                  <option 
                    v-for="item in availableItems" 
                    :key="`${item.name}-${item.source}`" 
                    :value="item"
                  >
                    {{ item.icon }} {{ item.name }} ({{ item.quantity }} шт) - {{ item.source === 'pantry' ? 'Кладовая' : 'Склад' }}
                  </option>
                </select>
              </div>

              <div v-if="selectedItem" class="form-group">
                <label>Количество:</label>
                <input 
                  type="number" 
                  v-model.number="itemQuantity" 
                  :max="selectedItem.quantity"
                  min="1"
                  class="quantity-input"
                />
                <span class="max-quantity">(макс: {{ selectedItem.quantity }})</span>
              </div>

              <div v-if="selectedItem" class="form-group">
                <label>{{ createType === 'offer' ? 'Цена за штуку:' : 'Максимальная цена за штуку:' }}</label>
                <input 
                  type="number" 
                  v-model.number="itemPrice" 
                  min="1"
                  class="price-input"
                />
                <span>₽</span>
              </div>

              <div class="form-group">
                <label>Описание (необязательно):</label>
                <textarea 
                  v-model="itemDescription" 
                  class="description-input"
                  placeholder="Дополнительная информация о товаре..."
                ></textarea>
              </div>

              <div class="form-actions">
                <button 
                  class="btn create-btn" 
                  @click="createPost"
                  :disabled="!canCreatePost"
                >
                  {{ createType === 'offer' ? 'Разместить предложение' : 'Разместить запрос' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модалка отклика -->
    <div v-if="showRespond" class="respond-modal-overlay" @click.self="closeRespondModal">
      <div class="respond-modal">
        <div class="respond-header">
          <h3>Откликнуться на объявление</h3>
          <button class="close-btn" @click="closeRespondModal">✕</button>
        </div>
        
        <div class="respond-content">
          <div class="post-preview">
            <h4>{{ selectedPost?.title }}</h4>
            <p>{{ selectedPost?.description }}</p>
          </div>

          <div class="form-group">
            <label>Ваше сообщение:</label>
            <textarea 
              v-model="respondMessage" 
              class="message-input"
              placeholder="Напишите сообщение продавцу..."
            ></textarea>
          </div>

          <div class="form-group">
            <label>Количество:</label>
            <input 
              type="number" 
              v-model.number="respondQuantity" 
              :max="selectedPost?.quantity"
              min="1"
              class="quantity-input"
            />
          </div>

          <div class="form-group">
            <label>Ваша цена за штуку:</label>
            <input 
              type="number" 
              v-model.number="respondPrice" 
              min="1"
              class="price-input"
            />
            <span>₽</span>
          </div>

          <div class="respond-actions">
            <button 
              class="btn respond-submit-btn" 
              @click="submitResponse"
              :disabled="!canSubmitResponse"
            >
              Отправить отклик
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSocialStore } from '@/stores/socialStore'
import { useAuthStore } from '@/stores/authStore'
import { useCompanyStore } from '@/stores/companyStore'
import type { SocialPost } from '@/stores/socialStore'

defineEmits<{ close: [] }>()

const social = useSocialStore()
const auth = useAuthStore()
const company = useCompanyStore()

const activeTab = ref<'orders' | 'taken' | 'create' | 'my-posts' | 'my-responses'>('orders')
const createType = ref<'offer' | 'request'>('offer')

// Данные для создания поста
const selectedItem = ref<any>(null)
const itemQuantity = ref(1)
const itemPrice = ref(0)
const itemDescription = ref('')

// Данные для отклика
const showRespond = ref(false)
const selectedPost = ref<SocialPost | null>(null)
const respondMessage = ref('')
const respondQuantity = ref(1)
const respondPrice = ref(0)

const { availableItems, visibleOrders, takenOrders } = social

// Активные заказы (в работе или неудачные)
const activeOrdersCount = computed(() => {
  return takenOrders.filter((order: any) => 
    order.status === 'in_progress' || order.status === 'failed'
  ).length
})

// Отсортированные заказы (активные сверху)
const sortedTakenOrders = computed(() => {
  return [...takenOrders].sort((a: any, b: any) => {
    // Активные заказы (in_progress, failed) идут первыми
    const aActive = a.status === 'in_progress' || a.status === 'failed'
    const bActive = b.status === 'in_progress' || b.status === 'failed'
    
    if (aActive && !bActive) return -1
    if (!aActive && bActive) return 1
    
    // Среди активных: in_progress идет перед failed
    if (aActive && bActive) {
      if (a.status === 'in_progress' && b.status === 'failed') return -1
      if (a.status === 'failed' && b.status === 'in_progress') return 1
    }
    
    // Остальные сортируем по дате взятия (новые сверху)
    return new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime()
  })
})

// Количества для сдачи заказов
const submitQuantities = ref<Record<string, number>>({})

const canCreatePost = computed(() => {
  return selectedItem.value && 
         itemQuantity.value > 0 && 
         itemQuantity.value <= selectedItem.value.quantity &&
         itemPrice.value > 0
})

const canSubmitResponse = computed(() => {
  return respondMessage.value.trim() && 
         respondQuantity.value > 0 && 
         respondPrice.value > 0
})

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getStatusText(status: string) {
  const statusMap: Record<string, string> = {
    'active': 'Активно',
    'completed': 'Завершено',
    'cancelled': 'Отменено'
  }
  return statusMap[status] || status
}

function getResponseStatusText(status: string) {
  const statusMap: Record<string, string> = {
    'pending': 'Ожидает',
    'accepted': 'Принято',
    'rejected': 'Отклонено'
  }
  return statusMap[status] || status
}

function createPost() {
  if (!canCreatePost.value) return

  const success = createType.value === 'offer' 
    ? social.createOfferPost({
        name: selectedItem.value.name,
        icon: selectedItem.value.icon,
        quantity: itemQuantity.value,
        pricePerUnit: itemPrice.value,
        description: itemDescription.value
      })
    : social.createRequestPost({
        name: selectedItem.value.name,
        icon: selectedItem.value.icon,
        quantity: itemQuantity.value,
        maxPricePerUnit: itemPrice.value,
        description: itemDescription.value
      })

  if (success) {
    // Сбрасываем форму
    selectedItem.value = null
    itemQuantity.value = 1
    itemPrice.value = 0
    itemDescription.value = ''
    
    // Переключаемся на вкладку с постами
    activeTab.value = 'my-posts'
  }
}

function showRespondModal(post: SocialPost) {
  selectedPost.value = post
  respondMessage.value = ''
  respondQuantity.value = 1
  respondPrice.value = post.pricePerUnit
  showRespond.value = true
}

function closeRespondModal() {
  showRespond.value = false
  selectedPost.value = null
  respondMessage.value = ''
  respondQuantity.value = 1
  respondPrice.value = 0
}

function submitResponse() {
  if (!canSubmitResponse.value || !selectedPost.value) return

  const success = social.respondToPost(selectedPost.value.id, {
    message: respondMessage.value,
    offeredQuantity: respondQuantity.value,
    offeredPrice: respondPrice.value
  })

  if (success) {
    closeRespondModal()
    activeTab.value = 'my-responses'
  }
}

function deletePost(postId: string) {
  if (confirm('Удалить этот пост?')) {
    social.deletePost(postId)
  }
}

function take(id: string) {
  social.takeOrder(id)
  // Переключаемся на вкладку взятых заказов
  activeTab.value = 'taken'
}

function submitOrder(orderId: string) {
  const order = social.getOrderById(orderId)
  if (!order) return

  const quantity = submitQuantities.value[orderId] || 1
  
  // Для демо создаём фиктивные предметы с правильными характеристиками
  const submittedItems = Array(quantity).fill(null).map(() => ({
    name: order.itemName, // Используем точное название из заказа
    color: order.requirements.color || 'любой',
    type: order.requirements.type || 'tshirt',
    pattern: order.requirements.pattern || 'plain',
    material: order.requirements.material || 'любой',
    quality: order.requirements.quality || 80
  }))

  const success = social.submitOrder(orderId, submittedItems)
  
  if (success) {
    // Добавляем деньги игроку
    auth.addMoney(quantity * order.pricePerUnit)
    
    // Добавляем опыт компании за выполненный заказ
    const earnings = quantity * order.pricePerUnit
    const expGained = Math.max(1, Math.floor(earnings / 100)) // 1 опыт за каждые 100₽
    company.addOrderStats(earnings, expGained)
    
    // Убираем из количества для сдачи
    delete submitQuantities.value[orderId]
    
    console.log(`✅ Заказ выполнен! Получено: ${quantity * order.pricePerUnit}₽ и ${expGained} опыта компании`)
  }
}

function submitAllOrder(orderId: string) {
  const order = social.getOrderById(orderId)
  if (!order) return

  // Устанавливаем количество на максимум
  submitQuantities.value[orderId] = order.quantity
  submitOrder(orderId)
}

function canSubmitAll(orderId: string) {
  const order = social.getOrderById(orderId)
  if (!order) return false
  
  // Проверяем, есть ли у нас достаточно предметов в инвентаре
  // Пока что всегда возвращаем true для демо
  return true
}

function getTypeName(type?: string) {
  const types: Record<string, string> = {
    'tshirt': 'Футболка',
    'shirt': 'Рубашка', 
    'dress': 'Платье',
    'hoodie': 'Худи',
    'pants': 'Брюки',
    'skirt': 'Юбка'
  }
  return types[type || ''] || type || 'любой'
}

function getPatternName(pattern?: string) {
  const patterns: Record<string, string> = {
    'plain': 'Однотонный',
    'dots': 'Горошек',
    'stripes': 'Полоски',
    'flowers': 'Цветы'
  }
  return patterns[pattern || ''] || pattern || 'любой'
}

function getOrderStatusText(status: string) {
  const statuses: Record<string, string> = {
    'in_progress': 'В работе',
    'completed': 'Выполнен',
    'failed': 'Не прошёл проверку'
  }
  return statuses[status] || status
}

onMounted(() => {
  social.seedDemoOrders()
  social.startOrderSpawner()
})

onUnmounted(() => {
  social.stopOrderSpawner()
})
</script>

<style scoped>
@import '@/styles/colors.css';

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.social-modal {
  width: 900px;
  max-width: 95vw;
  height: 700px;
  max-height: 90vh;
  background: var(--color-bg-menu-light);
  border: 2px solid var(--color-buttons);
  border-radius: 15px;
  box-shadow: 0 8px 16px var(--shadow-medium);
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--color-bg-menu);
  border-bottom: 2px solid var(--color-buttons);
  border-radius: 15px 15px 0 0;
}

.header h2 {
  color: var(--color-text);
  font-weight: 700;
  margin: 0;
}

.close-btn {
  background: var(--color-buttons);
  border: 2px solid var(--color-accents);
  border-radius: 10px;
  color: var(--color-text);
  padding: 6px 10px;
  cursor: pointer;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tabs {
  display: flex;
  background: var(--color-bg-menu);
  border-bottom: 2px solid var(--color-buttons);
}

.tab {
  flex: 1;
  padding: 12px 16px;
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  font-weight: 600;
}

.tab.active {
  background: var(--color-bg-menu-light);
  border-bottom-color: var(--color-accents);
}

.tab-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.section-title {
  color: var(--color-text);
  font-weight: 800;
  margin: 4px 0 12px;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.active-orders-badge {
  background: #ff6b35;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.orders-list, .taken-list {
  display: grid;
  gap: 12px;
}

.order-card, .taken-card {
  background: var(--color-bg-menu-light);
  border: 2px solid var(--color-buttons);
  border-radius: 12px;
  padding: 16px;
}

.order-card {
  display: grid;
  grid-template-columns: 50px 1fr auto;
  align-items: start;
  gap: 12px;
}

.taken-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.taken-header {
  display: grid;
  grid-template-columns: 50px 1fr;
  align-items: start;
  gap: 12px;
}

.order-icon {
  font-size: 24px;
  text-align: center;
}

.order-title {
  color: var(--color-text);
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 4px;
}

.order-meta {
  color: #7a7a7a;
  font-size: 12px;
  margin-bottom: 4px;
}

.order-details {
  color: var(--color-accents);
  font-weight: 700;
  font-size: 14px;
}

.order-requirements {
  margin-top: 8px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
}

.req-item {
  font-size: 12px;
  color: #666;
  background: rgba(0,0,0,0.05);
  padding: 4px 8px;
  border-radius: 6px;
}

.dev-note {
  color: #ff9800;
  font-style: italic;
}

.requirements {
  background: var(--color-bg-menu);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--color-buttons);
}

.requirements h4 {
  margin: 0 0 8px 0;
  color: var(--color-text);
  font-size: 14px;
}

.req-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.submit-section {
  background: #e8f5e8;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #4caf50;
}

.submit-section h4 {
  margin: 0 0 8px 0;
  color: var(--color-text);
  font-size: 14px;
}

.submit-form {
  display: flex;
  align-items: end;
  gap: 12px;
}

.submit-buttons {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.submit-btn {
  background: #4caf50;
  border-color: #2e7d32;
  color: white;
  padding: 8px 16px;
  flex: 1;
}

.submit-btn:disabled {
  background: #ccc;
  border-color: #999;
  color: #666;
}

.submit-all-btn {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
  padding: 8px 16px;
  flex: 1;
}

.submit-all-btn:hover:not(:disabled) {
  background: #0056b3;
  border-color: #0056b3;
}

.submit-all-btn:disabled {
  background: #ccc;
  border-color: #999;
  color: #666;
}

.success-message {
  background: #e8f5e8;
  color: #2e7d32;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #4caf50;
  font-weight: 600;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #f44336;
  font-weight: 600;
}

.order-status {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.order-status.in_progress {
  background: #fff3e0;
  color: #f57c00;
}

.order-status.completed {
  background: #e8f5e8;
  color: #2e7d32;
}

.order-status.failed {
  background: #ffebee;
  color: #c62828;
}

.take-btn {
  background: var(--color-accents);
  border-color: var(--color-highlights);
  color: white;
  padding: 8px 16px;
  font-weight: 600;
}

.hint {
  color: #888;
  font-size: 12px;
  margin-top: 8px;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--color-text);
  opacity: 0.7;
}

.empty.cute {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border: 2px dashed var(--color-buttons);
  border-radius: 12px;
  margin: 20px 0;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.create-tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 2px solid var(--color-buttons);
}

.create-tab {
  flex: 1;
  padding: 12px 16px;
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  font-weight: 600;
}

.create-tab.active {
  background: var(--color-bg-menu);
  border-bottom-color: var(--color-accents);
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: var(--color-text);
}

.item-select, .quantity-input, .price-input, .description-input {
  padding: 8px 12px;
  border: 2px solid var(--color-buttons);
  border-radius: 8px;
  background: var(--color-bg-menu-light);
  color: var(--color-text);
  font-size: 14px;
}

.description-input {
  min-height: 80px;
  resize: vertical;
}

.max-quantity {
  font-size: 12px;
  color: #666;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.create-btn {
  background: var(--color-accents);
  border-color: var(--color-highlights);
  color: white;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
}

.create-btn:disabled {
  background: #ccc;
  border-color: #999;
  color: #666;
  cursor: not-allowed;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--color-text);
  opacity: 0.7;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.posts-list, .responses-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-card, .response-card {
  background: var(--color-bg-menu);
  border: 2px solid var(--color-buttons);
  border-radius: 12px;
  padding: 16px;
}

.post-header, .response-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.author {
  font-weight: 600;
  color: var(--color-text);
}

.post-type {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.post-type.offer {
  background: #e8f5e8;
  color: #2e7d32;
}

.post-type.request {
  background: #e3f2fd;
  color: #1976d2;
}

.post-status, .status {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.post-status.active, .status.pending {
  background: #fff3e0;
  color: #f57c00;
}

.post-status.completed, .status.accepted {
  background: #e8f5e8;
  color: #2e7d32;
}

.post-status.cancelled, .status.rejected {
  background: #ffebee;
  color: #c62828;
}

.date {
  color: #666;
  font-size: 12px;
}

.post-content h3 {
  margin: 0 0 8px 0;
  color: var(--color-text);
  font-size: 16px;
}

.post-content p {
  margin: 0 0 12px 0;
  color: var(--color-text);
  opacity: 0.8;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--color-bg-menu-light);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.item-icon {
  font-size: 24px;
}

.item-details {
  flex: 1;
}

.item-name {
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 4px;
}

.item-quantity, .item-price {
  font-size: 14px;
  color: #666;
}

.responses-count {
  color: var(--color-accents);
  font-weight: 600;
  font-size: 14px;
}

.post-actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: 2px solid var(--color-buttons);
  border-radius: 8px;
  background: var(--color-bg-menu-light);
  color: var(--color-text);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.respond-btn {
  background: var(--color-accents);
  border-color: var(--color-highlights);
  color: white;
}

.respond-btn:disabled {
  background: #ccc;
  border-color: #999;
  color: #666;
  cursor: not-allowed;
}

.delete-btn {
  background: #ffebee;
  border-color: #f44336;
  color: #c62828;
}

.create-tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 2px solid var(--color-buttons);
}

.create-tab {
  flex: 1;
  padding: 12px 16px;
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
}

.create-tab.active {
  background: var(--color-bg-menu);
  border-bottom-color: var(--color-accents);
  font-weight: 600;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: var(--color-text);
}

.item-select, .quantity-input, .price-input, .description-input, .message-input {
  padding: 8px 12px;
  border: 2px solid var(--color-buttons);
  border-radius: 8px;
  background: var(--color-bg-menu-light);
  color: var(--color-text);
  font-size: 14px;
}

.description-input, .message-input {
  min-height: 80px;
  resize: vertical;
}

.max-quantity {
  font-size: 12px;
  color: #666;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.create-btn {
  background: var(--color-accents);
  border-color: var(--color-highlights);
  color: white;
  padding: 12px 24px;
  font-size: 16px;
}

.create-btn:disabled {
  background: #ccc;
  border-color: #999;
  color: #666;
  cursor: not-allowed;
}

.respond-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.respond-modal {
  background: var(--color-bg-menu-light);
  border: 2px solid var(--color-buttons);
  border-radius: 12px;
  width: 500px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
}

.respond-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--color-bg-menu);
  border-bottom: 2px solid var(--color-buttons);
  border-radius: 12px 12px 0 0;
}

.respond-header h3 {
  margin: 0;
  color: var(--color-text);
}

.respond-content {
  padding: 20px;
}

.post-preview {
  background: var(--color-bg-menu);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.post-preview h4 {
  margin: 0 0 8px 0;
  color: var(--color-text);
}

.post-preview p {
  margin: 0;
  color: var(--color-text);
  opacity: 0.8;
}

.respond-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.respond-submit-btn {
  background: var(--color-accents);
  border-color: var(--color-highlights);
  color: white;
  padding: 10px 20px;
}

.respond-submit-btn:disabled {
  background: #ccc;
  border-color: #999;
  color: #666;
  cursor: not-allowed;
}
</style>
