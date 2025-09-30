<template>
  <div class="phone-interface" v-if="show" @click="closePhone">
    <div class="phone" @click.stop>
      <div class="screen">
        <div class="notch"></div>
        
        <div class="status-bar">
          <span>{{ currentTime }}</span>
          <div style="display: flex; align-items: center; gap: 5px;">
            <div class="signal">
              <div style="height: 8px;"></div>
              <div style="height: 11px;"></div>
              <div style="height: 14px;"></div>
              <div style="height: 6px;"></div>
            </div>
            <span style="font-size: 14px; margin-left: 10px;">LTE</span>
          </div>
        </div>
        
        <!-- Навигация по вкладкам -->
        <div class="tab-navigation">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            :class="['tab-btn', { active: activeTab === tab.id }]"
            @click="setActiveTab(tab.id)"
          >
            {{ tab.icon }} {{ tab.name }}
          </button>
        </div>
        
        <!-- Контент вкладок -->
        <div class="tab-content">
          <!-- Главный экран -->
          <div v-if="activeTab === 'home'" class="apps">
            <div class="app" v-for="app in apps" :key="app.id" @click="openApp(app.id)">
              <div class="app-icon" :class="app.class">
                <div v-if="app.badge" class="badge">{{ app.badge }}</div>
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 30px;">{{ app.icon }}</div>
              </div>
              <div class="app-label">{{ app.name }}</div>
            </div>
          </div>
          
          <!-- ГусьПочта -->
          <div v-if="activeTab === 'mail'" class="app-content">
            <div class="app-header">
              <h3>🦢 ГусьПочта</h3>
              <button class="back-btn" @click="setActiveTab('home')">← Назад</button>
            </div>
            <div class="mail-list">
              <div v-for="email in emails" :key="email.id" class="email-item" :class="{ unread: !email.read }">
                <div class="email-sender">{{ email.sender }}</div>
                <div class="email-subject">{{ email.subject }}</div>
                <div class="email-preview">{{ email.preview }}</div>
                <div class="email-time">{{ email.time }}</div>
              </div>
            </div>
          </div>
          
          <!-- ГагаЧат -->
          <div v-if="activeTab === 'messages'" class="app-content">
            <div class="app-header">
              <h3>🦆 ГагаЧат</h3>
              <button class="back-btn" @click="setActiveTab('home')">← Назад</button>
            </div>
            <div class="chat-list">
              <div v-for="chat in chats" :key="chat.id" class="chat-item">
                <div class="chat-avatar">{{ chat.avatar }}</div>
                <div class="chat-info">
                  <div class="chat-name">{{ chat.name }}</div>
                  <div class="chat-last-message">{{ chat.lastMessage }}</div>
                </div>
                <div class="chat-time">{{ chat.time }}</div>
                <div v-if="chat.unread" class="chat-unread">{{ chat.unread }}</div>
              </div>
            </div>
          </div>
          
          <!-- ГусьДень (Календарь) -->
          <div v-if="activeTab === 'calendar'" class="app-content">
            <div class="app-header">
              <h3>📅 ГусьДень</h3>
              <button class="back-btn" @click="setActiveTab('home')">← Назад</button>
            </div>
            <div class="calendar">
              <div class="calendar-header">
                <button @click="prevMonth">←</button>
                <h4>{{ currentMonth }}</h4>
                <button @click="nextMonth">→</button>
              </div>
              <div class="calendar-grid">
                <div v-for="day in calendarDays" :key="day.date" class="calendar-day" :class="{ today: day.isToday, event: day.hasEvent }">
                  <span>{{ day.day }}</span>
                  <div v-if="day.hasEvent" class="event-dot"></div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Твиттер -->
          <div v-if="activeTab === 'social'" class="app-content">
            <div class="app-header">
              <h3>🐧 Твиттер</h3>
              <button class="back-btn" @click="setActiveTab('home')">← Назад</button>
            </div>
            <div class="feed">
              <div v-for="post in posts" :key="post.id" class="post">
                <div class="post-header">
                  <div class="post-avatar">{{ post.avatar }}</div>
                  <div class="post-info">
                    <div class="post-author">{{ post.author }}</div>
                    <div class="post-time">{{ post.time }}</div>
                  </div>
                </div>
                <div class="post-content">{{ post.content }}</div>
                <div class="post-actions">
                  <button>🔄 {{ post.retweets }}</button>
                  <button>❤️ {{ post.likes }}</button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- ГусьМагазин -->
          <div v-if="activeTab === 'orders'" class="app-content">
            <div class="app-header">
              <h3>🛍️ ГусьМагазин</h3>
              <button class="back-btn" @click="setActiveTab('home')">← Назад</button>
            </div>
            <div class="orders-list">
              <div v-for="order in orders" :key="order.id" class="order-item">
                <div class="order-number">Заказ #{{ order.number }}</div>
                <div class="order-status" :class="order.status">{{ order.statusText }}</div>
                <div class="order-items">{{ order.items }}</div>
                <div class="order-total">{{ order.total }}₽</div>
              </div>
            </div>
          </div>
          
          <!-- ГусьБанк -->
          <div v-if="activeTab === 'bank'" class="app-content">
            <div class="app-header">
              <h3>🏦 ГусьБанк</h3>
              <button class="back-btn" @click="setActiveTab('home')">← Назад</button>
            </div>
            <div class="bank-info">
              <div class="balance">
                <div class="balance-label">Баланс</div>
                <div class="balance-amount">{{ balance }}₽</div>
              </div>
              <div class="bank-actions">
                <button class="bank-btn">💳 Карты</button>
                <button class="bank-btn">📊 Статистика</button>
                <button class="bank-btn">💸 Переводы</button>
                <button class="bank-btn">📈 Инвестиции</button>
              </div>
            </div>
          </div>
          
          <!-- ГусьНовости -->
          <div v-if="activeTab === 'news'" class="app-content">
            <div class="app-header">
              <h3>📰 ГусьНовости</h3>
              <button class="back-btn" @click="setActiveTab('home')">← Назад</button>
            </div>
            <div class="news-list">
              <div v-for="article in news" :key="article.id" class="news-item">
                <div class="news-category">{{ article.category }}</div>
                <div class="news-title">{{ article.title }}</div>
                <div class="news-preview">{{ article.preview }}</div>
                <div class="news-time">{{ article.time }}</div>
              </div>
            </div>
          </div>
          
          <!-- ГусьДела -->
          <div v-if="activeTab === 'tasks'" class="app-content">
            <div class="app-header">
              <h3>✅ ГусьДела</h3>
              <button class="back-btn" @click="setActiveTab('home')">← Назад</button>
            </div>
            <div class="tasks-list">
              <div v-for="task in tasks" :key="task.id" class="task-item" :class="{ completed: task.completed }">
                <input type="checkbox" v-model="task.completed" @change="updateTask(task)">
                <span class="task-text">{{ task.text }}</span>
                <span class="task-priority" :class="task.priority">{{ task.priorityText }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="home-indicator"></div>
      </div>
    </div>
    
    <!-- Уведомления -->
    <div v-if="notificationText" class="notification show">
      {{ notificationText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTimeStore } from '@/stores/timeStore'

interface PhoneInterfaceProps {
  show: boolean
  unreadMessages?: number
}

withDefaults(defineProps<PhoneInterfaceProps>(), {
  unreadMessages: 0
})

const emit = defineEmits<{
  close: []
}>()

// Время и дата (игровое время)
const timeStore = useTimeStore()
const currentTime = computed(() => {
  console.log('🕐 Phone time update:', timeStore.currentTime.time)
  return timeStore.currentTime.time
})
const currentDate = computed(() => {
  console.log('📅 Phone date update:', timeStore.gameDate)
  return timeStore.gameDate
})

// Состояние
const activeTab = ref('home')
const notificationText = ref('')

// Вкладки
const tabs = ref([
  { id: 'home', name: 'Главная', icon: '🏠' },
  { id: 'mail', name: 'Почта', icon: '📧' },
  { id: 'messages', name: 'Чат', icon: '💬' },
  { id: 'calendar', name: 'Календарь', icon: '📅' },
  { id: 'social', name: 'Соцсети', icon: '🐧' },
  { id: 'orders', name: 'Заказы', icon: '🛍️' },
  { id: 'bank', name: 'Банк', icon: '🏦' },
  { id: 'news', name: 'Новости', icon: '📰' },
  { id: 'tasks', name: 'Задачи', icon: '✅' }
])

// Приложения на главном экране
const apps = ref([
  { id: 'mail', name: 'ГусьПочта', icon: '📧', class: 'mail', badge: '🐣' },
  { id: 'messages', name: 'ГагаЧат', icon: '💬', class: 'messages' },
  { id: 'calendar', name: 'ГусьДень', icon: '📅', class: 'calendar' },
  { id: 'social', name: 'Твиттер', icon: '🐧', class: 'social' },
  { id: 'orders', name: 'ГусьМагазин', icon: '🛍️', class: 'orders' },
  { id: 'bank', name: 'ГусьБанк', icon: '🏦', class: 'bank' },
  { id: 'news', name: 'ГусьНовости', icon: '📰', class: 'news' },
  { id: 'tasks', name: 'ГусьДела', icon: '✅', class: 'tasks' }
])

// Данные для приложений
const emails = ref([
  { id: 1, sender: 'Поставщик "Ткани+"', subject: 'Новая партия хлопка', preview: 'Скидка 15% до конца недели...', time: '14:30', read: false },
  { id: 2, sender: 'Администрация', subject: 'Модный показ', preview: 'Ваша репутация позволяет участвовать...', time: '12:15', read: false },
  { id: 3, sender: 'Банк "Сбербанк"', subject: 'Кредит одобрен', preview: '500,000₽ под 12% годовых...', time: '10:00', read: true }
])

const chats = ref([
  { id: 1, name: 'Гусь-менеджер', avatar: '🦢', lastMessage: 'Заказы готовы к отправке', time: '15:30', unread: 2 },
  { id: 2, name: 'Дизайнер Анна', avatar: '👩‍🎨', lastMessage: 'Новые эскизы готовы', time: '14:20', unread: 1 },
  { id: 3, name: 'Склад', avatar: '📦', lastMessage: 'Материалы поступили', time: '11:45', unread: null }
])

const posts = ref([
  { id: 1, author: 'МодныйГусь', avatar: '🦆', content: 'Новая коллекция весна-лето выходит завтра! 🦢✨', time: '2ч', retweets: 15, likes: 42 },
  { id: 2, author: 'ТекстильПлюс', avatar: '🧵', content: 'Лучшие ткани для модных домов. Скидки до 20%!', time: '4ч', retweets: 8, likes: 23 },
  { id: 3, author: 'ГусьБанк', avatar: '🏦', content: 'Специальные условия для малого бизнеса в сфере моды', time: '6ч', retweets: 12, likes: 35 }
])

const orders = ref([
  { id: 1, number: '12345', status: 'shipped', statusText: 'В пути', items: 'Платье "Весенний гусь"', total: '2500' },
  { id: 2, number: '12346', status: 'processing', statusText: 'В обработке', items: 'Костюм "Деловой гусь"', total: '4500' },
  { id: 3, number: '12347', status: 'delivered', statusText: 'Доставлено', items: 'Блузка "Элегантный гусь"', total: '1800' }
])

const news = ref([
  { id: 1, category: 'Мода', title: 'Тренды весны 2024', preview: 'Новые цвета и фасоны сезона...', time: '1ч назад' },
  { id: 2, category: 'Бизнес', title: 'Рост продаж модной одежды', preview: 'Статистика показывает рост на 15%...', time: '3ч назад' },
  { id: 3, category: 'Технологии', title: 'ИИ в дизайне одежды', preview: 'Как искусственный интеллект помогает...', time: '5ч назад' }
])

const tasks = ref([
  { id: 1, text: 'Покормить гусей', completed: false, priority: 'high', priorityText: 'Высокий' },
  { id: 2, text: 'Проверить заказы', completed: true, priority: 'medium', priorityText: 'Средний' },
  { id: 3, text: 'Обновить каталог', completed: false, priority: 'low', priorityText: 'Низкий' },
  { id: 4, text: 'Связаться с поставщиком', completed: false, priority: 'high', priorityText: 'Высокий' }
])

const balance = ref('125,750')

// Функции времени (теперь используются из timeStore)

const currentMonth = computed(() => {
  const season = timeStore.getSeason()
  const seasonNames = {
    spring: 'Весна',
    summer: 'Лето', 
    autumn: 'Осень',
    winter: 'Зима'
  }
  return seasonNames[season as keyof typeof seasonNames] || 'Весна'
})

const calendarDays = computed(() => {
  const days = []
  const now = new Date()
  // const firstDay = new Date(now.getFullYear(), now.getMonth(), 1) // Пока не используется
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({
      day: i,
      date: `${now.getFullYear()}-${now.getMonth() + 1}-${i}`,
      isToday: i === now.getDate(),
      hasEvent: Math.random() > 0.7
    })
  }
  
  return days
})

// Функции навигации
const setActiveTab = (tabId: string) => {
  activeTab.value = tabId
}

const openApp = (appId: string) => {
  setActiveTab(appId)
}

// Функции календаря
const prevMonth = () => {
  // Логика переключения месяца
}

const nextMonth = () => {
  // Логика переключения месяца
}

// Функции задач
const updateTask = (_task: any) => {
  // Логика обновления задачи
}

// Функции телефона
const closePhone = () => {
  emit('close')
}

// Интервал для автоматического тика времени
let timeInterval: NodeJS.Timeout | null = null

// Жизненный цикл (время теперь управляется timeStore)
onMounted(() => {
  console.log('📱 PhoneInterface mounted, starting time tick')
  // Запускаем автоматический тик времени
  if (!timeInterval) {
    timeInterval = setInterval(() => {
      console.log('⏰ PhoneInterface tick interval')
      timeStore.tick()
    }, 1000) // Каждую секунду
  }
})

onUnmounted(() => {
  // Очищаем интервал
  if (timeInterval) {
    clearInterval(timeInterval)
    timeInterval = null
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&family=Comfortaa:wght@400;600&display=swap');

/* Интерфейс телефона */
.phone-interface {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  font-family: 'Nunito', sans-serif;
}

.phone {
  width: 350px;
  height: 720px;
  background: linear-gradient(145deg, #8b7355, #6b5b47);
  border-radius: 60px;
  padding: 20px;
  position: relative;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  border: 3px solid #f6ce90;
}

.phone::before {
  content: "🦆";
  position: absolute;
  font-size: 20px;
  top: -10px;
  right: -10px;
  animation: gentleFloat 3s infinite ease-in-out;
}

@keyframes gentleFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

.screen {
  width: 310px;
  height: 650px;
  background: #f6ce90;
  border-radius: 45px;
  position: relative;
  overflow: hidden;
  border: 2px solid #e8c078;
}

.notch {
  width: 100px;
  height: 30px;
  background: #8b7355;
  border-radius: 15px;
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  border: 2px solid #f6ce90;
}

.notch::after {
  content: "🦢";
  position: absolute;
  font-size: 12px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.status-bar {
  display: flex;
  justify-content: space-between;
  padding: 20px 25px;
  font-size: 18px;
  font-weight: 600;
  color: #8b4513;
  font-family: 'Comfortaa', cursive;
}

.signal {
  display: flex;
  gap: 2px;
  align-items: flex-end;
}

.signal div {
  background: #8b4513;
  width: 3px;
}

/* Навигация по вкладкам */
.tab-navigation {
  display: flex;
  background: #e8c078;
  border-bottom: 2px solid #8b7355;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tab-navigation::-webkit-scrollbar {
  display: none;
}

.tab-btn {
  flex-shrink: 0;
  padding: 8px 12px;
  background: none;
  border: none;
  font-size: 10px;
  color: #8b4513;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tab-btn:hover {
  background: rgba(139, 69, 19, 0.1);
}

.tab-btn.active {
  background: #f6ce90;
  font-weight: 600;
  border-bottom: 2px solid #8b4513;
}

/* Контент вкладок */
.tab-content {
  height: calc(100% - 120px);
  overflow-y: auto;
}

.apps {
  padding: 25px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 35px;
  row-gap: 45px;
}

.app {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.app:hover {
  transform: scale(1.02);
}

.app:active {
  transform: scale(0.98);
}

.app-icon {
  width: 75px;
  height: 75px;
  border-radius: 18px;
  position: relative;
  margin-bottom: 10px;
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.15);
  border: 2px solid rgba(255,255,255,0.8);
}

.app-label {
  font-size: 13px;
  color: #8b4513;
  text-align: center;
  font-family: 'Comfortaa', cursive;
  font-weight: 600;
}

.badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #cd853f;
  color: white;
  border-radius: 14px;
  width: 22px;
  height: 22px;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-family: 'Comfortaa', cursive;
  border: 1px solid #f6ce90;
}

/* Контент приложений */
.app-content {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e8c078;
}

.app-header h3 {
  margin: 0;
  color: #8b4513;
  font-family: 'Comfortaa', cursive;
}

.back-btn {
  background: #8b7355;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
}

.back-btn:hover {
  background: #6b5b47;
}

/* Иконки приложений в бежевых тонах */
.mail { background: linear-gradient(135deg, #deb887, #d2b48c); }
.messages { background: linear-gradient(135deg, #f5deb3, #e6d3a3); }
.calendar { background: linear-gradient(135deg, #f6ce90, #e8c078); }
.social { background: linear-gradient(135deg, #e6d3a3, #d2b48c); }
.orders { background: linear-gradient(135deg, #deb887, #cd853f); }
.bank { background: linear-gradient(135deg, #f5deb3, #deb887); }
.news { background: linear-gradient(135deg, #cd853f, #a0522d); }
.tasks { background: linear-gradient(135deg, #f6ce90, #deb887); }

/* Стили для контента приложений */
.email-item, .chat-item, .post, .order-item, .news-item, .task-item {
  background: white;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.email-item.unread {
  border-left: 4px solid #cd853f;
}

.chat-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.chat-avatar {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f6ce90;
  border-radius: 50%;
}

.chat-info {
  flex: 1;
}

.chat-name {
  font-weight: 600;
  color: #8b4513;
}

.chat-last-message {
  color: #666;
  font-size: 12px;
}

.chat-time {
  font-size: 10px;
  color: #999;
}

.chat-unread {
  background: #cd853f;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.post-avatar {
  font-size: 20px;
}

.post-author {
  font-weight: 600;
  color: #8b4513;
}

.post-time {
  font-size: 10px;
  color: #999;
}

.post-content {
  margin-bottom: 10px;
  color: #333;
}

.post-actions {
  display: flex;
  gap: 15px;
}

.post-actions button {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 12px;
}

.order-status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
}

.order-status.shipped {
  background: #e3f2fd;
  color: #1976d2;
}

.order-status.processing {
  background: #fff3e0;
  color: #f57c00;
}

.order-status.delivered {
  background: #e8f5e8;
  color: #388e3c;
}

.balance {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.balance-label {
  color: #666;
  font-size: 14px;
  margin-bottom: 5px;
}

.balance-amount {
  font-size: 28px;
  font-weight: bold;
  color: #8b4513;
  font-family: 'Comfortaa', cursive;
}

.bank-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.bank-btn {
  background: white;
  border: 2px solid #e8c078;
  padding: 15px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.bank-btn:hover {
  background: #f6ce90;
  border-color: #cd853f;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.task-item.completed .task-text {
  text-decoration: line-through;
  color: #999;
}

.task-priority {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: bold;
}

.task-priority.high {
  background: #ffebee;
  color: #c62828;
}

.task-priority.medium {
  background: #fff3e0;
  color: #ef6c00;
}

.task-priority.low {
  background: #e8f5e8;
  color: #2e7d32;
}

.home-indicator {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 5px;
  background: #8b4513;
  border-radius: 3px;
}

/* Всплывающие уведомления */
.notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(139, 69, 19, 0.9);
  color: #f6ce90;
  padding: 12px 20px;
  border-radius: 20px;
  z-index: 1001;
  font-family: 'Comfortaa', cursive;
  font-size: 14px;
  font-weight: 600;
  border: 2px solid #f6ce90;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.notification.show {
  animation: gentleSlide 0.4s ease;
}

@keyframes gentleSlide {
  from { 
    opacity: 0; 
    transform: translateX(-50%) translateY(-20px); 
  }
  to { 
    opacity: 1; 
    transform: translateX(-50%) translateY(0); 
  }
}
</style>
