<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal gift-modal" @click.stop>
      <div class="modal-header">
        <h2>🎁 Ежедневный подарок</h2>
        <button class="close-btn" @click="closeModal">✕</button>
      </div>
      
      <div class="modal-content">
        <!-- Информация о подарке -->
        <div class="gift-info">
          <div class="gift-icon">🎁</div>
          <h3>Ваш ежедневный подарок готов!</h3>
          <p class="gift-description">
            Заходите каждый день, чтобы получить уникальные награды и бонусы!
          </p>
        </div>
        
        <!-- Серия подарков -->
        <div class="gift-series">
          <h4>📅 Серия подарков ({{ currentDay }}/7 дней)</h4>
          <div class="gift-calendar">
            <div 
              v-for="(gift, index) in giftSeries" 
              :key="index"
              class="gift-day"
              :class="{
                'completed': index < currentDay - 1,
                'current': index === currentDay - 1,
                'locked': index > currentDay - 1
              }"
            >
              <div class="day-number">{{ index + 1 }}</div>
              <div class="gift-preview">
                <span class="gift-emoji">{{ gift.icon }}</span>
              </div>
              <div class="gift-name">{{ gift.name }}</div>
              <div class="gift-value">{{ gift.value }}</div>
            </div>
          </div>
        </div>
        
        <!-- Текущий подарок -->
        <div class="current-gift" v-if="!isClaimed">
          <div class="gift-box">
            <div class="gift-box-icon">📦</div>
            <div class="gift-box-content">
              <h4>{{ currentGift.name }}</h4>
              <p class="gift-value">{{ currentGift.value }}</p>
              <p class="gift-description">{{ currentGift.description }}</p>
            </div>
          </div>
          
          <button 
            class="claim-btn" 
            @click="claimGift"
            :disabled="isClaiming"
          >
            {{ isClaiming ? 'Получаем...' : 'Получить подарок' }}
          </button>
        </div>
        
        <!-- Подарок уже получен -->
        <div class="gift-claimed" v-else>
          <div class="claimed-icon">✅</div>
          <h4>Подарок получен!</h4>
          <p>Заходите завтра за новым подарком!</p>
          
          <div class="next-gift-info">
            <h5>Следующий подарок:</h5>
            <div class="next-gift">
              <span class="gift-emoji">{{ nextGift.icon }}</span>
              <span class="gift-name">{{ nextGift.name }}</span>
            </div>
          </div>
        </div>
        
        <!-- Бонусы -->
        <div class="bonus-section">
          <h4>🎯 Бонусы за активность</h4>
          <div class="bonus-list">
            <div class="bonus-item">
              <span class="bonus-icon">🔥</span>
              <span class="bonus-text">Заходите 3 дня подряд</span>
              <span class="bonus-reward">+50% к опыту</span>
            </div>
            <div class="bonus-item">
              <span class="bonus-icon">💎</span>
              <span class="bonus-text">Заходите 7 дней подряд</span>
              <span class="bonus-reward">Эксклюзивный предмет</span>
            </div>
            <div class="bonus-item">
              <span class="bonus-icon">⭐</span>
              <span class="bonus-text">Заходите 30 дней подряд</span>
              <span class="bonus-reward">Легендарный гусь</span>
            </div>
          </div>
        </div>
        
        <!-- Статистика -->
        <div class="gift-stats">
          <h4>📊 Ваша статистика</h4>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Дней подряд:</span>
              <span class="stat-value">{{ consecutiveDays }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Всего подарков:</span>
              <span class="stat-value">{{ totalGifts }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Монет получено:</span>
              <span class="stat-value">{{ totalCoins }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Опыта получено:</span>
              <span class="stat-value">{{ totalExp }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'

// Эмиты
const emit = defineEmits<{
  close: []
}>()

const gameStore = useGameStore()

// Состояние
const isClaimed = ref(false)
const isClaiming = ref(false)
const currentDay = ref(1)
const consecutiveDays = ref(5)
const totalGifts = ref(12)
const totalCoins = ref(2500)
const totalExp = ref(1800)

// Серия подарков на 7 дней
const giftSeries = ref([
  { icon: '💰', name: 'Монеты', value: '100', description: 'Базовые монеты для старта' },
  { icon: '⭐', name: 'Опыт', value: '50 XP', description: 'Опыт для повышения уровня' },
  { icon: '🧵', name: 'Ткань', value: '5 шт', description: 'Материал для создания одежды' },
  { icon: '💎', name: 'Драгоценности', value: '3 шт', description: 'Редкие украшения' },
  { icon: '🎨', name: 'Краски', value: '10 шт', description: 'Для окрашивания одежды' },
  { icon: '🏆', name: 'Трофей', value: '1 шт', description: 'Эксклюзивный трофей' },
  { icon: '🦆', name: 'Новый гусь', value: '1 шт', description: 'Уникальный персонаж' }
])

// Текущий подарок
const currentGift = computed(() => giftSeries.value[currentDay.value - 1])

// Следующий подарок
const nextGift = computed(() => {
  const nextIndex = currentDay.value % giftSeries.value.length
  return giftSeries.value[nextIndex]
})

// Загрузка данных при монтировании
onMounted(() => {
  loadGiftData()
})

const loadGiftData = () => {
  // Загружаем данные из localStorage
  const giftData = localStorage.getItem('fashion_goose_gifts')
  if (giftData) {
    try {
      const data = JSON.parse(giftData)
      isClaimed.value = data.isClaimed || false
      currentDay.value = data.currentDay || 1
      consecutiveDays.value = data.consecutiveDays || 0
      totalGifts.value = data.totalGifts || 0
      totalCoins.value = data.totalCoins || 0
      totalExp.value = data.totalExp || 0
    } catch (error) {
      console.error('Ошибка загрузки данных подарков:', error)
    }
  }
}

// Получение подарка
const claimGift = async () => {
  isClaiming.value = true
  
  try {
    // Анимация получения подарка
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Получаем награду
    const gift = currentGift.value
    if (gift.name === 'Монеты') {
      gameStore.addMoney(parseInt(gift.value))
      totalCoins.value += parseInt(gift.value)
    } else if (gift.name === 'Опыт') {
      gameStore.addExperience(parseInt(gift.value))
      totalExp.value += parseInt(gift.value)
    }
    
    // Обновляем состояние
    isClaimed.value = true
    totalGifts.value += 1
    
    // Сохраняем данные
    saveGiftData()
    
  } catch (error) {
    console.error('Ошибка получения подарка:', error)
  } finally {
    isClaiming.value = false
  }
}

// Сохранение данных подарков
const saveGiftData = () => {
  const giftData = {
    isClaimed: isClaimed.value,
    currentDay: currentDay.value,
    consecutiveDays: consecutiveDays.value,
    totalGifts: totalGifts.value,
    totalCoins: totalCoins.value,
    totalExp: totalExp.value,
    lastClaimDate: new Date().toISOString()
  }
  
  localStorage.setItem('fashion_goose_gifts', JSON.stringify(giftData))
}

// Закрытие модального окна
const closeModal = () => {
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
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.gift-modal {
  background: white;
  border-radius: 20px;
  max-width: 700px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 2px solid #f0f0f0;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  border-radius: 20px 20px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: white;
  padding: 5px;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-content {
  padding: 30px;
}

.gift-info {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 15px;
}

.gift-icon {
  font-size: 4rem;
  margin-bottom: 15px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.gift-info h3 {
  margin: 0 0 10px 0;
  font-size: 1.5rem;
}

.gift-description {
  margin: 0;
  opacity: 0.9;
}

.gift-series {
  margin-bottom: 30px;
}

.gift-series h4 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.2rem;
}

.gift-calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.gift-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 10px;
  border-radius: 10px;
  background: #f8f9fa;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.gift-day.completed {
  background: #d4edda;
  border-color: #28a745;
}

.gift-day.current {
  background: #fff3cd;
  border-color: #ffc107;
  animation: pulse 2s infinite;
}

.gift-day.locked {
  background: #e9ecef;
  opacity: 0.6;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.day-number {
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.gift-preview {
  font-size: 1.5rem;
  margin-bottom: 5px;
}

.gift-name {
  font-size: 0.8rem;
  text-align: center;
  font-weight: 600;
  margin-bottom: 2px;
}

.gift-value {
  font-size: 0.7rem;
  color: #666;
  text-align: center;
}

.current-gift {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 15px;
}

.gift-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.gift-box-icon {
  font-size: 3rem;
  animation: shake 1s infinite;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.gift-box-content h4 {
  margin: 0 0 5px 0;
  color: #333;
  font-size: 1.3rem;
}

.gift-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: #28a745;
  margin: 0 0 5px 0;
}

.claim-btn {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
}

.claim-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
}

.claim-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.gift-claimed {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: #d4edda;
  border-radius: 15px;
}

.claimed-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.gift-claimed h4 {
  margin: 0 0 10px 0;
  color: #155724;
  font-size: 1.3rem;
}

.gift-claimed p {
  margin: 0 0 20px 0;
  color: #155724;
}

.next-gift-info {
  background: white;
  padding: 15px;
  border-radius: 10px;
  margin-top: 15px;
}

.next-gift-info h5 {
  margin: 0 0 10px 0;
  color: #333;
}

.next-gift {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.gift-emoji {
  font-size: 1.5rem;
}

.bonus-section {
  margin-bottom: 30px;
}

.bonus-section h4 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.2rem;
}

.bonus-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bonus-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  border-left: 4px solid #667eea;
}

.bonus-icon {
  font-size: 1.5rem;
}

.bonus-text {
  flex: 1;
  font-weight: 600;
  color: #333;
}

.bonus-reward {
  font-weight: bold;
  color: #28a745;
}

.gift-stats {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 15px;
}

.gift-stats h4 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: white;
  border-radius: 8px;
}

.stat-label {
  color: #666;
  font-weight: 600;
}

.stat-value {
  font-weight: bold;
  color: #333;
  font-size: 1.1rem;
}

/* Адаптивность */
@media (max-width: 768px) {
  .gift-calendar {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .gift-box {
    flex-direction: column;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .bonus-item {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
}
</style>
