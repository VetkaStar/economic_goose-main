<template>
  <div class="modal-overlay" @click.self="close">
    <div class="auction-modal">
      <!-- Загрузка -->
      <div v-if="auctionStore.isLoading" class="loading-screen">
        <div class="loading-spinner">🔄</div>
        <p>Загрузка аукционов...</p>
      </div>

      <!-- Ошибка -->
      <div v-else-if="auctionStore.error" class="error-screen">
        <div class="error-icon">❌</div>
        <p>{{ auctionStore.error }}</p>
        <button class="btn-primary" @click="close">Закрыть</button>
      </div>

      <!-- Список аукционов (если не выбран конкретный) -->
      <div v-else-if="!auction && auctionStore.availableAuctions.length > 0" class="auctions-list">
        <div class="auctions-header">
          <h2>🔨 Доступные аукционы</h2>
          <button class="close-btn" @click="close">✕</button>
        </div>

        <div class="auctions-grid">
          <div 
            v-for="auc in auctionStore.availableAuctions" 
            :key="auc.id" 
            class="auction-card"
            :class="auc.status"
            @click="selectAuction(auc.id)"
          >
            <!-- Статус -->
            <div class="card-status">
              <span class="status-badge" :class="auc.status">
                {{ getStatusText(auc.status) }}
              </span>
              <!-- Показываем лидера на активных аукционах -->
              <span 
                v-if="auc.status === 'active' && auc.current_bidder_id === authStore.user?.id" 
                class="leading-badge"
              >
                👑 Вы лидируете
              </span>
              <!-- Показываем победителя на завершённых аукционах -->
              <span 
                v-if="auc.status === 'finished' && auc.winner_name" 
                class="winner-badge"
                :class="{ 'winner-you': auc.winner_id === authStore.user?.id }"
              >
                {{ auc.winner_id === authStore.user?.id ? '🏆 Вы победили!' : `🏆 ${auc.winner_name}` }}
              </span>
              <span v-if="auc.status === 'active'" class="time-left">
                ⏱️ {{ formatTime(auc.time_left) }}
              </span>
            </div>

            <!-- Материал -->
            <div class="card-material">
              <div class="card-icon">{{ auc.material.icon }}</div>
              <div class="card-info">
                <h3>{{ auc.material.name }}</h3>
                <p class="card-quantity">{{ auc.material.quantity }} метров</p>
              </div>
            </div>

            <!-- Статистика -->
            <div class="card-stats">
              <div class="card-stat">
                <span class="stat-label">Качество:</span>
                <span class="stat-value">{{ auc.material.quality }}%</span>
              </div>
              <div class="card-stat">
                <span class="stat-label">Текущая ставка:</span>
                <span class="stat-value">{{ auc.current_bid }}₽</span>
              </div>
            </div>

            <!-- Действие -->
            <button class="card-action" :disabled="auc.status === 'finished'">
              {{ auc.status === 'waiting' ? '🎯 Присоединиться' : 
                 auc.status === 'active' ? '🔥 Участвовать' : 
                 '✅ Завершён' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Просмотр конкретного аукциона -->
      <div v-else-if="auction" class="auction-content">
        <!-- Хедер -->
        <div class="auction-header">
          <button class="back-btn" @click="auctionStore.leaveAuction()">
            ← Назад к списку
          </button>
          <div class="auction-title">
            <h2>🔨 Аукцион материалов</h2>
            <div class="auction-status" :class="auction.status">
              {{ getStatusText(auction.status) }}
            </div>
          </div>
          <button class="close-btn" @click="close">✕</button>
        </div>

        <!-- Таймер -->
        <div class="auction-timer" :class="{ urgent: auction.time_left <= 10 }">
          <div class="timer-icon">⏱️</div>
          <div class="timer-value">{{ formatTime(auction.time_left) }}</div>
          <div class="timer-label">до конца</div>
        </div>

        <!-- Материал -->
        <div class="material-showcase">
          <div class="material-header">
            <div class="material-icon">{{ auction.material.icon }}</div>
            <div class="material-info">
              <h3 class="material-name">{{ auction.material.name }}</h3>
              <p class="material-description">{{ auction.material.description }}</p>
            </div>
          </div>

          <div class="material-stats">
            <div class="stat-card">
              <div class="stat-label">Количество</div>
              <div class="stat-value">{{ auction.material.quantity }} м</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Качество</div>
              <div class="stat-value quality">{{ auction.material.quality }}%</div>
            </div>
            <div class="stat-card" v-if="auction.material.durability">
              <div class="stat-label">🛡️ Прочность</div>
              <div class="stat-value">{{ auction.material.durability }}/10</div>
            </div>
            <div class="stat-card" v-if="auction.material.comfort">
              <div class="stat-label">😌 Комфорт</div>
              <div class="stat-value">{{ auction.material.comfort }}/10</div>
            </div>
            <div class="stat-card" v-if="auction.material.style">
              <div class="stat-label">✨ Стиль</div>
              <div class="stat-value">{{ auction.material.style }}/10</div>
            </div>
          </div>
        </div>

        <!-- Текущая ставка -->
        <div class="current-bid-section">
          <div class="bid-info">
            <div class="bid-label">Текущая ставка</div>
            <div class="bid-amount">₽{{ auction.current_bid.toLocaleString() }}</div>
            <div class="bid-leader" v-if="auction.current_bidder_name">
              <span v-if="auctionStore.isCurrentBidder" class="you-badge">👑 Вы лидируете!</span>
              <span v-else>👤 {{ auction.current_bidder_name }}</span>
            </div>
          </div>

          <!-- Действия -->
          <div class="bid-actions" v-if="auction.status === 'active'">
            <div class="quick-bids">
              <button 
                class="bid-btn quick"
                @click="quickBid(100)"
                :disabled="!canBid(auction.current_bid + 100)"
              >
                +₽100
              </button>
              <button 
                class="bid-btn quick"
                @click="quickBid(500)"
                :disabled="!canBid(auction.current_bid + 500)"
              >
                +₽500
              </button>
              <button 
                class="bid-btn quick"
                @click="quickBid(1000)"
                :disabled="!canBid(auction.current_bid + 1000)"
              >
                +₽1,000
              </button>
            </div>

            <div class="custom-bid">
              <input 
                type="number" 
                v-model.number="customBidAmount"
                :min="auctionStore.minimumNextBid"
                :max="authStore.user?.money || 0"
                placeholder="Ваша ставка"
                class="bid-input"
              />
              <button 
                class="bid-btn primary"
                @click="placeCustomBid"
                :disabled="!canBid(customBidAmount)"
              >
                💰 Сделать ставку
              </button>
            </div>

            <div class="player-balance">
              Ваш баланс: <strong>₽{{ (authStore.user?.money || 0).toLocaleString() }}</strong>
            </div>
          </div>

          <!-- Результат -->
          <div class="auction-result" v-else-if="auction.status === 'finished'">
            <div v-if="auction.winner_id" class="winner-announcement">
              <div class="winner-icon">🎉</div>
              <h3 v-if="auction.winner_id === authStore.user?.id" class="winner-text">
                Поздравляем! Вы выиграли аукцион!
              </h3>
              <h3 v-else class="winner-text">
                Победитель: {{ auction.winner_name }}
              </h3>
              <p class="final-price">Финальная цена: ₽{{ auction.current_bid.toLocaleString() }}</p>
            </div>
            <div v-else class="no-winner">
              <p>Аукцион завершён без победителя</p>
            </div>
            <button class="btn-primary" @click="close">Закрыть</button>
          </div>

          <!-- Ожидание -->
          <div class="waiting-screen" v-else-if="auction.status === 'waiting'">
            <p>⏳ Ожидание начала аукциона...</p>
            <p class="participants-count">Участников: {{ auction.participants.length }}</p>
            <p class="auto-start-info">Аукцион начнётся автоматически через несколько секунд</p>
            <button class="btn-primary" @click="startAuctionManually">
              🚀 Начать сейчас
            </button>
          </div>
        </div>

        <!-- История ставок -->
        <div class="bids-history" v-if="auction.bids_history.length > 0">
          <h4>📊 История ставок</h4>
          <div class="bids-list">
            <div 
              v-for="bid in auction.bids_history.slice(0, 5)" 
              :key="bid.id"
              class="bid-item"
            >
              <span class="bid-player">{{ bid.player_name }}</span>
              <span class="bid-value">₽{{ bid.amount.toLocaleString() }}</span>
              <span class="bid-time">{{ formatTimestamp(bid.timestamp) }}</span>
            </div>
          </div>
        </div>

        <!-- Участники -->
        <div class="participants-panel">
          <h4>👥 Участники ({{ auction.participants.length }})</h4>
          <div class="participants-list">
            <div 
              v-for="participant in auction.participants" 
              :key="participant.id"
              class="participant-item"
              :class="{ 'is-you': participant.id === authStore.user?.id }"
            >
              <span class="participant-name">
                {{ participant.name }}
                <span v-if="participant.id === authStore.user?.id" class="you-tag">(Вы)</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuctionStore } from '@/stores/auctionStore'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'

const emit = defineEmits<{
  close: []
}>()

const auctionStore = useAuctionStore()
const authStore = useAuthStore()

const customBidAmount = ref(0)

const auction = computed(() => auctionStore.currentAuction)

// Форматирование времени
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Форматирование timestamp
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// Статус аукциона
function getStatusText(status: string): string {
  switch (status) {
    case 'waiting': return '⏳ Ожидание'
    case 'active': return '🔥 Активен'
    case 'finished': return '✅ Завершён'
    case 'cancelled': return '❌ Отменён'
    default: return status
  }
}

// Проверка возможности ставки
function canBid(amount: number): boolean {
  if (!auction.value || !authStore.user) return false
  if (auction.value.status !== 'active') return false
  if (amount <= auction.value.current_bid) return false
  if (amount > (authStore.user.money || 0)) return false
  return true
}

// Быстрая ставка
async function quickBid(increment: number) {
  if (!auction.value) return
  const amount = auction.value.current_bid + increment
  await auctionStore.placeBid(amount)
}

// Кастомная ставка
async function placeCustomBid() {
  if (customBidAmount.value > 0) {
    const success = await auctionStore.placeBid(customBidAmount.value)
    if (success) {
      customBidAmount.value = 0
    }
  }
}

// Ручной запуск аукциона
async function startAuctionManually() {
  if (!auction.value) return
  
  try {
    const { data, error } = await supabase.rpc('auto_start_auction', {
      p_auction_id: auction.value.id
    })
    
    if (error) throw error
    
    if (!data.success) {
      alert(data.error)
    }
  } catch (err: any) {
    console.error('Ошибка при запуске аукциона:', err)
    alert('Не удалось запустить аукцион')
  }
}

// Закрыть модальное окно
function close() {
  auctionStore.leaveAuction()
  emit('close')
}

// Выбрать аукцион из списка
async function selectAuction(auctionId: string) {
  await auctionStore.joinAuction(auctionId)
  
  // Устанавливаем минимальную ставку по умолчанию
  if (auction.value) {
    customBidAmount.value = auctionStore.minimumNextBid
  }
}

// При монтировании загружаем список аукционов
onMounted(async () => {
  await auctionStore.loadAvailableAuctions()
})

// При размонтировании выходим из текущего аукциона
onUnmounted(() => {
  if (auction.value) {
    auctionStore.leaveAuction()
  }
  // Отписываемся от списка аукционов при закрытии компонента
  // (это произойдёт через auctionStore.reset() при закрытии модального окна)
})
</script>

<style scoped>
.modal-overlay {
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

.auction-modal {
  background: linear-gradient(135deg, #fff7e6 0%, #fef3c7 100%);
  border: 4px solid #d8b86a;
  border-radius: 20px;
  padding: 30px;
  width: 95%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
}

/* Загрузка и ошибки */
.loading-screen,
.error-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner {
  font-size: 48px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

/* Хедер */
.auction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #d8b86a;
}

.auction-title {
  display: flex;
  align-items: center;
  gap: 15px;
}

.auction-title h2 {
  font-size: 24px;
  font-weight: 800;
  color: #3a2b16;
  margin: 0;
}

.auction-status {
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}

.auction-status.waiting {
  background: #fef3c7;
  color: #d97706;
}

.auction-status.active {
  background: #dcfce7;
  color: #16a34a;
  animation: pulse-status 2s infinite;
}

@keyframes pulse-status {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.auction-status.finished {
  background: #e5e7eb;
  color: #6b7280;
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
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

/* Таймер */
.auction-timer {
  background: #fef4d1;
  border: 2px solid #d8b86a;
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  margin-bottom: 20px;
}

.auction-timer.urgent {
  border-color: #dc2626;
  background: #fee2e2;
  animation: shake 0.5s infinite;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.timer-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.timer-value {
  font-size: 48px;
  font-weight: 800;
  color: #3a2b16;
  font-family: 'Courier New', monospace;
}

.timer-label {
  font-size: 14px;
  color: #6b7280;
  margin-top: 5px;
}

/* Материал */
.material-showcase {
  background: #fef4d1;
  border: 2px solid #d8b86a;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
}

.material-header {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.material-icon {
  font-size: 48px;
  flex-shrink: 0;
}

.material-info {
  flex: 1;
}

.material-name {
  font-size: 20px;
  font-weight: 700;
  color: #3a2b16;
  margin: 0 0 5px 0;
}

.material-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.material-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 10px;
}

.stat-card {
  background: rgba(216, 184, 106, 0.15);
  border-radius: 8px;
  padding: 10px;
  text-align: center;
}

.stat-label {
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #3a2b16;
}

.stat-value.quality {
  color: #16a34a;
}

/* Текущая ставка */
.current-bid-section {
  background: #fef4d1;
  border: 3px solid #d8b86a;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
}

.bid-info {
  text-align: center;
  margin-bottom: 20px;
}

.bid-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 5px;
}

.bid-amount {
  font-size: 42px;
  font-weight: 800;
  color: #16a34a;
  margin-bottom: 10px;
}

.bid-leader {
  font-size: 16px;
  color: #3a2b16;
  font-weight: 600;
}

.you-badge {
  color: #d97706;
  font-weight: 700;
}

/* Действия */
.bid-actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.quick-bids {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.bid-btn {
  padding: 12px 20px;
  border: 2px solid #d8b86a;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.bid-btn.quick {
  background: #fff7e6;
  color: #3a2b16;
}

.bid-btn.quick:hover:not(:disabled) {
  background: #f4dcb3;
  transform: translateY(-2px);
}

.bid-btn.primary {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  color: white;
  border: none;
}

.bid-btn.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #15803d 0%, #166534 100%);
  transform: translateY(-2px);
}

.bid-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.custom-bid {
  display: flex;
  gap: 10px;
}

.bid-input {
  flex: 1;
  padding: 12px;
  border: 2px solid #d8b86a;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  background: #fff7e6;
}

.bid-input:focus {
  outline: none;
  border-color: #b8860b;
}

.player-balance {
  text-align: center;
  font-size: 14px;
  color: #6b7280;
}

/* Результат */
.auction-result,
.waiting-screen {
  text-align: center;
  padding: 20px;
}

.winner-announcement {
  margin-bottom: 20px;
}

.winner-icon {
  font-size: 64px;
  margin-bottom: 15px;
}

.winner-text {
  font-size: 24px;
  font-weight: 700;
  color: #3a2b16;
  margin: 0 0 10px 0;
}

.final-price {
  font-size: 18px;
  color: #16a34a;
  font-weight: 600;
}

.no-winner {
  padding: 40px 20px;
  color: #6b7280;
}

.participants-count {
  font-size: 16px;
  color: #6b7280;
  margin-top: 10px;
}

.auto-start-info {
  font-size: 14px;
  color: #16a34a;
  margin: 10px 0;
  font-weight: 600;
}

/* История ставок */
.bids-history {
  background: rgba(216, 184, 106, 0.1);
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
}

.bids-history h4 {
  font-size: 16px;
  font-weight: 700;
  color: #3a2b16;
  margin: 0 0 10px 0;
}

.bids-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bid-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #fef4d1;
  border-radius: 8px;
  font-size: 13px;
}

.bid-player {
  font-weight: 600;
  color: #3a2b16;
}

.bid-value {
  color: #16a34a;
  font-weight: 700;
}

.bid-time {
  color: #6b7280;
  font-size: 11px;
}

/* Участники */
.participants-panel {
  background: rgba(216, 184, 106, 0.1);
  border-radius: 12px;
  padding: 15px;
}

.participants-panel h4 {
  font-size: 16px;
  font-weight: 700;
  color: #3a2b16;
  margin: 0 0 10px 0;
}

.participants-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.participant-item {
  padding: 6px 12px;
  background: #fef4d1;
  border-radius: 8px;
  font-size: 13px;
  color: #3a2b16;
}

.participant-item.is-you {
  background: #dcfce7;
  border: 2px solid #16a34a;
}

.you-tag {
  color: #16a34a;
  font-weight: 600;
}

.btn-primary {
  padding: 12px 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-1px);
}

/* Адаптивность */
@media (max-width: 768px) {
  .auction-modal {
    width: 98%;
    padding: 20px;
  }

  .material-stats {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  }

  .quick-bids {
    grid-template-columns: 1fr;
  }
}

/* Скроллбар */
.auction-modal::-webkit-scrollbar {
  width: 8px;
}

.auction-modal::-webkit-scrollbar-track {
  background: rgba(216, 184, 106, 0.1);
  border-radius: 10px;
}

.auction-modal::-webkit-scrollbar-thumb {
  background: #d8b86a;
  border-radius: 10px;
}

.auction-modal::-webkit-scrollbar-thumb:hover {
  background: #b8860b;
}

/* Список аукционов */
.auctions-list {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.auctions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 2px solid rgba(216, 184, 106, 0.3);
}

.auctions-header h2 {
  font-size: 28px;
  color: #d8b86a;
  margin: 0;
}

.auctions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 24px;
  overflow-y: auto;
}

.auction-card {
  background: linear-gradient(135deg, rgba(216, 184, 106, 0.25) 0%, rgba(200, 90, 84, 0.15) 100%);
  border: 2px solid rgba(216, 184, 106, 0.5);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.auction-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(216, 184, 106, 0.3);
  border-color: #d8b86a;
}

.auction-card.finished {
  opacity: 0.6;
  cursor: default;
}

.auction-card.finished:hover {
  transform: none;
}

.card-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.waiting {
  background: rgba(100, 180, 255, 0.2);
  color: #64b4ff;
}

.status-badge.active {
  background: rgba(255, 140, 50, 0.2);
  color: #ff8c32;
}

.status-badge.finished {
  background: rgba(100, 200, 100, 0.2);
  color: #64c864;
}

.leading-badge {
  padding: 4px 10px;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #2c1810;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
}

.winner-badge {
  padding: 4px 10px;
  background: linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%);
  color: #2c1810;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
}

.winner-badge.winner-you {
  background: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%);
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.time-left {
  font-size: 14px;
  font-weight: 600;
  color: #ff8c32;
}

.card-material {
  display: flex;
  gap: 16px;
  align-items: center;
}

.card-icon {
  font-size: 48px;
  line-height: 1;
}

.card-info h3 {
  font-size: 18px;
  color: #f4e4c1;
  font-weight: 600;
  margin: 0 0 4px 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.card-quantity {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.card-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 8px;
}

.card-stat {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.stat-label {
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

.stat-value {
  color: #f4e4c1;
  font-weight: 700;
}

.card-action {
  padding: 12px;
  background: linear-gradient(135deg, #d8b86a 0%, #b8860b 100%);
  color: #2c1810;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.card-action:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(216, 184, 106, 0.5);
}

.card-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.back-btn {
  padding: 8px 16px;
  background: rgba(216, 184, 106, 0.2);
  color: #d8b86a;
  border: 1px solid rgba(216, 184, 106, 0.3);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(216, 184, 106, 0.3);
  border-color: #d8b86a;
}
</style>
