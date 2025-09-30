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
          <h2>▲ Доступные аукционы</h2>
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
          <div class="content-section">
        <!-- Хедер -->
        <div class="auction-header">
          <button class="back-btn" @click="auctionStore.leaveAuction()">
            ← Назад к списку
          </button>
          <div class="auction-title">
            <h2>▲ Аукцион материалов</h2>
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

        <div class="main-panels">
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
              <div v-if="auction.winner_id === authStore.user?.id" class="points-earned">
                <span class="points-icon">⭐</span>
                <span class="points-text">Получено очков: {{ calculateWinnerPoints(auction.current_bid) }}</span>
              </div>
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
        </div>

        <div class="side-panels">
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
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuctionStore } from '@/stores/auctionStore'
import { useAuthStore } from '@/stores/authStore'
import { usePlayerPoints } from '@/composables/usePlayerPoints'
import { supabase } from '@/lib/supabase'

const emit = defineEmits<{
  close: []
}>()

const auctionStore = useAuctionStore()
const authStore = useAuthStore()
const { addAuctionPoints } = usePlayerPoints()

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
    case 'waiting': return '◉ Ожидание'
    case 'active': return '● Активен'
    case 'finished': return '■ Завершён'
    case 'cancelled': return '▲ Отменён'
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

// Расчет очков для победителя
function calculateWinnerPoints(finalBid: number): number {
  const points = Math.round(finalBid / 100) // 1 очко за каждые 100 рублей
  return Math.max(points, 10) // Минимум 10 очков за победу
}

// Расчет очков для участника
function calculateParticipantPoints(bidAmount: number): number {
  const points = Math.round(bidAmount / 200) // 1 очко за каждые 200 рублей ставки
  return Math.max(points, 1) // Минимум 1 очко за участие
}

// Обработка завершения аукциона и начисление очков
async function handleAuctionFinish() {
  if (!auction.value || !authStore.user) return

  try {
    const isWinner = auction.value.winner_id === authStore.user.id
    const bidAmount = auction.value.current_bid

    if (isWinner) {
      // Победитель получает очки
      const points = calculateWinnerPoints(bidAmount)
      await addAuctionPoints(
        auction.value.id,
        bidAmount,
        true,
        bidAmount
      )
      console.log(`🏆 Победитель аукциона! Получено ${points} очков`)

      // Добавляем материал победителю в правильное хранилище
      if (auction.value.material) {
        const { useWarehouseStore } = await import('@/stores/warehouseStore')
        const warehouseStore = useWarehouseStore()
        
        // Создаем материал в базе данных если его нет
        const { data: existingMaterial } = await supabase
          .from('warehouse_materials')
          .select('id')
          .eq('name', auction.value.material.name)
          .single()

        let materialId = existingMaterial?.id

        if (!materialId) {
          const { data: newMaterial, error: createError } = await supabase
            .from('warehouse_materials')
            .insert({
              name: auction.value.material.name,
              icon: auction.value.material.icon || '🧵',
              price: auction.value.material.base_price || 0,
              quality: auction.value.material.quality || 1,
              durability: auction.value.material.durability || null,
              comfort: auction.value.material.comfort || null,
              style: auction.value.material.style || null,
              description: auction.value.material.description || null
            })
            .select('id')
            .single()

          if (createError) {
            console.error('Ошибка создания материала:', createError)
            return
          }
          materialId = newMaterial.id
        }

        // Добавляем материал в правильное хранилище
        const success = await warehouseStore.addMaterialToCorrectStorage(
          materialId, 
          auction.value.material.quantity || 1,
          auction.value.material
        )

        if (success) {
          console.log(`📦 Материал "${auction.value.material.name}" добавлен в хранилище`)
        }
      }
    } else {
      // Участники получают очки за участие (находим последнюю ставку игрока)
      const playerBids = auction.value.bids_history?.filter(
        (bid: any) => bid.player_id === authStore.user?.id
      ) || []
      
      if (playerBids.length > 0) {
        const lastBid = playerBids[playerBids.length - 1]
        const points = calculateParticipantPoints(lastBid.amount)
        await addAuctionPoints(
          auction.value.id,
          lastBid.amount,
          false,
          bidAmount
        )
        console.log(`🎯 Участие в аукционе! Получено ${points} очков`)
      }
    }
  } catch (error) {
    console.error('Ошибка при начислении очков за аукцион:', error)
  }
}

// Watcher для отслеживания изменения статуса аукциона
watch(() => auction.value?.status, (newStatus, oldStatus) => {
  if (newStatus === 'finished' && oldStatus !== 'finished') {
    // Запускаем обработку завершения с небольшой задержкой
    setTimeout(() => {
      handleAuctionFinish()
    }, 1000)
  }
})

// Принудительная обработка при монтировании (если аукцион уже завершен)
onMounted(async () => {
  await auctionStore.loadAvailableAuctions()
  
  // Проверяем, не завершен ли уже текущий аукцион
  if (auction.value?.status === 'finished') {
    setTimeout(() => {
      handleAuctionFinish()
    }, 1000)
  }
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
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.auction-modal {
  background: var(--color-bg-menu-light);
  border: 2px solid var(--color-buttons);
  border-radius: 15px;
  width: clamp(1000px, 80vw, 1700px);
  height: clamp(700px, 80vh, 1050px);
  overflow: hidden;
  box-shadow: 0 8px 16px var(--shadow-medium);
  display: flex;
  flex-direction: column;
  position: relative;
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
  padding: 20px 25px;
  background: var(--color-bg-menu);
  border-bottom: 2px solid var(--color-buttons);
  border-radius: 15px 15px 0 0;
}

.auction-title {
  display: flex;
  align-items: center;
  gap: 15px;
}

.auction-title h2 {
  font-size: clamp(1.4rem, 2.2vw, 1.8rem);
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  text-shadow: 2px 2px 0px var(--shadow-light);
}

.auction-status {
  padding: 5px 12px;
  border-radius: 8px;
  font-size: clamp(0.7rem, 1.1vw, 0.9rem);
  font-weight: 600;
}

.auction-status.waiting {
  background: var(--color-bg-menu-light);
  color: var(--color-text);
  border: 2px solid var(--color-buttons);
}

.auction-status.active {
  background: var(--color-accents);
  color: var(--color-text);
  border: 2px solid var(--color-highlights);
  animation: pulse-status 2s infinite;
}

@keyframes pulse-status {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.auction-status.finished {
  background: var(--color-bg-menu-light);
  color: var(--color-text);
  border: 2px solid var(--color-buttons);
  opacity: 0.8;
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

/* Таймер */
.auction-timer {
  background: var(--color-bg-menu);
  border: 2px solid var(--color-buttons);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  margin: 12px 20px 16px 20px;
  box-shadow: 0 2px 4px var(--shadow-light);
}

.auction-timer.urgent {
  border-color: var(--color-highlights);
  background: var(--color-accents);
  animation: shake 0.5s infinite;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.timer-icon {
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  margin-bottom: 10px;
  color: var(--color-accents);
}

.timer-value {
  font-size: clamp(1.6rem, 3vw, 2.6rem);
  font-weight: 700;
  color: var(--color-text);
  font-family: 'Courier New', monospace;
  text-shadow: 2px 2px 0px var(--shadow-light);
}

.timer-label {
  font-size: clamp(0.7rem, 1.1vw, 0.9rem);
  color: var(--color-text);
  margin-top: 5px;
  opacity: 0.8;
}

/* Материал */
.material-showcase {
  background: var(--color-bg-menu);
  border: 2px solid var(--color-buttons);
  border-radius: 12px;
  padding: 16px;
  margin: 0;
  box-shadow: 0 2px 4px var(--shadow-light);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.material-header {
  display: flex;
  gap: 15px;
  margin-bottom: 12px;
}

.material-icon {
  font-size: clamp(2.5rem, 4vw, 3rem);
  flex-shrink: 0;
  /* Иконки материалов сохраняются как есть - это часть игры */
}

.material-info {
  flex: 1;
}

.material-name {
  font-size: clamp(1.1rem, 1.8vw, 1.4rem);
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 5px 0;
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.material-description {
  font-size: clamp(0.7rem, 1.1vw, 0.9rem);
  color: var(--color-text);
  margin: 0;
  opacity: 0.8;
}

.material-stats {
  display: grid;
  grid-template-columns: repeat(5, minmax(120px, 1fr));
  gap: 12px;
}

.stat-card {
  background: var(--color-bg-menu-light);
  border: 2px solid var(--color-buttons);
  border-radius: 8px;
  padding: 10px 8px;
  text-align: center;
}

.stat-label {
  font-size: clamp(0.6rem, 1vw, 0.8rem);
  color: var(--color-text);
  margin-bottom: 5px;
  opacity: 0.8;
}

.stat-value {
  font-size: clamp(1rem, 1.5vw, 1.2rem);
  font-weight: 700;
  color: var(--color-text);
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.stat-value.quality {
  color: var(--color-accents);
}

/* Текущая ставка */
.current-bid-section {
  background: var(--color-bg-menu);
  border: 2px solid var(--color-buttons);
  border-radius: 12px;
  padding: 16px;
  margin: 0;
  box-shadow: 0 2px 4px var(--shadow-light);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.bid-info {
  text-align: center;
  margin-bottom: 20px;
}

.bid-label {
  font-size: clamp(0.7rem, 1.1vw, 0.9rem);
  color: var(--color-text);
  margin-bottom: 5px;
  opacity: 0.8;
}

.bid-amount {
  font-size: clamp(1.8rem, 3vw, 2.2rem);
  font-weight: 700;
  color: var(--color-accents);
  margin-bottom: 10px;
  text-shadow: 2px 2px 0px var(--shadow-light);
}

.bid-leader {
  font-size: clamp(0.9rem, 1.4vw, 1.1rem);
  color: var(--color-text);
  font-weight: 600;
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.you-badge {
  color: var(--color-highlights);
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
  border: 2px solid var(--color-buttons);
  border-radius: 10px;
  font-weight: 600;
  font-size: clamp(0.7rem, 1.1vw, 0.9rem);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px var(--shadow-light);
}

.bid-btn.quick {
  background: var(--color-bg-menu-light);
  color: var(--color-text);
}

.bid-btn.quick:hover:not(:disabled) {
  background: var(--color-bg-menu);
  border-color: var(--color-accents);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px var(--shadow-medium);
}

.bid-btn.primary {
  background: var(--color-accents);
  color: var(--color-text);
  border-color: var(--color-highlights);
}

.bid-btn.primary:hover:not(:disabled) {
  background: var(--color-highlights);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px var(--shadow-medium);
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
  border: 2px solid var(--color-buttons);
  border-radius: 10px;
  font-size: clamp(0.9rem, 1.4vw, 1.1rem);
  font-weight: 600;
  text-align: center;
  background: var(--color-bg-menu-light);
  color: var(--color-text);
}

.bid-input:focus {
  outline: none;
  border-color: var(--color-accents);
}

.player-balance {
  text-align: center;
  font-size: clamp(0.7rem, 1.1vw, 0.9rem);
  color: var(--color-text);
  opacity: 0.8;
}

/* Контент секция */
.content-section {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--color-bg-menu-light);
}

.auction-content {
  display: flex;
  flex-direction: column;
  height: 100%;
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
  font-size: clamp(2.5rem, 4vw, 4rem);
  margin-bottom: 15px;
}

.winner-text {
  font-size: clamp(1.2rem, 1.8vw, 1.5rem);
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 10px 0;
  text-shadow: 2px 2px 0px var(--shadow-light);
}

.final-price {
  font-size: clamp(1rem, 1.5vw, 1.2rem);
  color: var(--color-accents);
  font-weight: 600;
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.points-earned {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 15px;
  padding: 10px 20px;
  background: var(--color-accents);
  border: 2px solid var(--color-highlights);
  border-radius: 12px;
  animation: pointsEarned 0.8s ease-in-out;
}

.points-icon {
  font-size: clamp(1.2rem, 1.8vw, 1.5rem);
  animation: pointsPulse 1s infinite;
}

.points-text {
  font-size: clamp(0.9rem, 1.4vw, 1.1rem);
  font-weight: 700;
  color: var(--color-text);
  text-shadow: 1px 1px 0px var(--shadow-light);
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
  50% { transform: scale(1.2); }
}

.no-winner {
  padding: 40px 20px;
  color: var(--color-text);
  opacity: 0.8;
}

.participants-count {
  font-size: clamp(0.9rem, 1.4vw, 1.1rem);
  color: var(--color-text);
  margin-top: 10px;
  opacity: 0.8;
}

.auto-start-info {
  font-size: clamp(0.7rem, 1.1vw, 0.9rem);
  color: var(--color-accents);
  margin: 10px 0;
  font-weight: 600;
}

/* История ставок */
.bids-history {
  background: var(--color-bg-menu);
  border: 2px solid var(--color-buttons);
  border-radius: 12px;
  padding: 12px;
  margin: 0;
  box-shadow: 0 2px 4px var(--shadow-light);
}

.bids-history h4 {
  font-size: clamp(1rem, 1.5vw, 1.2rem);
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 10px 0;
  text-shadow: 1px 1px 0px var(--shadow-light);
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
  background: var(--color-bg-menu-light);
  border: 2px solid var(--color-buttons);
  border-radius: 8px;
  font-size: clamp(0.7rem, 1.1vw, 0.9rem);
}

.bid-player {
  font-weight: 600;
  color: var(--color-text);
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.bid-value {
  color: var(--color-accents);
  font-weight: 700;
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.bid-time {
  color: var(--color-text);
  font-size: clamp(0.6rem, 1vw, 0.8rem);
  opacity: 0.8;
}

/* Участники */
.participants-panel {
  background: var(--color-bg-menu);
  border: 2px solid var(--color-buttons);
  border-radius: 12px;
  padding: 12px;
  margin: 0;
  box-shadow: 0 2px 4px var(--shadow-light);
}

/* Боковые панели в ряд на широких экранах */
.side-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 0 20px 16px 20px;
}

/* Основные панели (материал слева, ставка справа) */
.main-panels {
  display: grid;
  grid-template-columns: 1.3fr 0.7fr;
  gap: 16px;
  margin: 0 20px 16px 20px;
  align-items: stretch;
}
.main-panels > * { align-self: start; }

@media (max-width: 1200px) {
  .main-panels {
    grid-template-columns: 1fr;
  }
  .current-bid-section {
    margin: 0 20px 16px 20px;
  }
}

@media (max-width: 1024px) {
  .side-panels {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

.participants-panel h4 {
  font-size: clamp(1rem, 1.5vw, 1.2rem);
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 10px 0;
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.participants-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.participant-item {
  padding: 6px 12px;
  background: var(--color-bg-menu-light);
  border: 2px solid var(--color-buttons);
  border-radius: 8px;
  font-size: clamp(0.7rem, 1.1vw, 0.9rem);
  color: var(--color-text);
}

.participant-item.is-you {
  background: var(--color-accents);
  border-color: var(--color-highlights);
}

.you-tag {
  color: var(--color-highlights);
  font-weight: 600;
}

.btn-primary {
  padding: 12px 24px;
  background: var(--color-accents);
  color: var(--color-text);
  border: 2px solid var(--color-highlights);
  border-radius: 10px;
  font-weight: 600;
  font-size: clamp(0.7rem, 1.1vw, 0.9rem);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px var(--shadow-light);
}

.btn-primary:hover {
  background: var(--color-highlights);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px var(--shadow-medium);
}

/* Адаптивность */
@media (max-width: 1024px) {
  .auction-modal {
    width: 95%;
    height: 85vh;
  }
}

@media (max-width: 768px) {
  .auction-modal {
    width: 98%;
    height: 90vh;
  }

  .material-stats {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  }

  .quick-bids {
    grid-template-columns: 1fr;
  }
}

/* Скроллбар */
.content-section::-webkit-scrollbar {
  width: 8px;
}

.content-section::-webkit-scrollbar-track {
  background: var(--color-bg-menu-light);
  border-radius: 10px;
}

.content-section::-webkit-scrollbar-thumb {
  background: var(--color-buttons);
  border-radius: 10px;
}

.content-section::-webkit-scrollbar-thumb:hover {
  background: var(--color-accents);
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
  padding: 20px 25px;
  background: var(--color-bg-menu);
  border-bottom: 2px solid var(--color-buttons);
  border-radius: 15px 15px 0 0;
}

.auctions-header h2 {
  font-size: clamp(1.4rem, 2.2vw, 1.8rem);
  color: var(--color-text);
  margin: 0;
  font-weight: 700;
  text-shadow: 2px 2px 0px var(--shadow-light);
}

.auctions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
  overflow-y: auto;
  background: var(--color-bg-menu-light);
  flex: 1;
}

.auction-card {
  background: var(--color-bg-menu);
  border: 2px solid var(--color-buttons);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 2px 4px var(--shadow-light);
}

.auction-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-medium);
  border-color: var(--color-accents);
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
  background: var(--color-bg-menu-light);
  color: var(--color-text);
  border: 2px solid var(--color-buttons);
}

.status-badge.active {
  background: var(--color-accents);
  color: var(--color-text);
  border: 2px solid var(--color-highlights);
}

.status-badge.finished {
  background: var(--color-bg-menu-light);
  color: var(--color-text);
  border: 2px solid var(--color-buttons);
  opacity: 0.8;
}

.leading-badge {
  padding: 4px 10px;
  background: var(--color-highlights);
  color: var(--color-text);
  border: 2px solid var(--color-accents);
  border-radius: 12px;
  font-size: clamp(0.6rem, 1vw, 0.8rem);
  font-weight: 700;
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.winner-badge {
  padding: 4px 10px;
  background: var(--color-bg-menu-light);
  color: var(--color-text);
  border: 2px solid var(--color-buttons);
  border-radius: 12px;
  font-size: clamp(0.6rem, 1vw, 0.8rem);
  font-weight: 700;
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.winner-badge.winner-you {
  background: var(--color-accents);
  border-color: var(--color-highlights);
  color: var(--color-text);
}

.time-left {
  font-size: clamp(0.7rem, 1.1vw, 0.9rem);
  font-weight: 600;
  color: var(--color-accents);
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.card-material {
  display: flex;
  gap: 16px;
  align-items: center;
}

.card-icon {
  font-size: clamp(2.5rem, 4vw, 3rem);
  line-height: 1;
  /* Иконки материалов сохраняются как есть - это часть игры */
}

.card-info h3 {
  font-size: clamp(1rem, 1.5vw, 1.2rem);
  color: var(--color-text);
  font-weight: 600;
  margin: 0 0 4px 0;
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.card-quantity {
  font-size: clamp(0.7rem, 1.1vw, 0.9rem);
  color: var(--color-text);
  margin: 0;
  opacity: 0.8;
}

.card-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: var(--color-bg-menu-light);
  border: 2px solid var(--color-buttons);
  border-radius: 8px;
}

.card-stat {
  display: flex;
  justify-content: space-between;
  font-size: clamp(0.7rem, 1.1vw, 0.9rem);
}

.stat-label {
  color: var(--color-text);
  font-weight: 500;
  opacity: 0.8;
}

.stat-value {
  color: var(--color-text);
  font-weight: 700;
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.card-action {
  padding: 12px;
  background: var(--color-accents);
  color: var(--color-text);
  border: 2px solid var(--color-highlights);
  border-radius: 8px;
  font-size: clamp(0.9rem, 1.4vw, 1.1rem);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px var(--shadow-light);
}

.card-action:hover:not(:disabled) {
  background: var(--color-highlights);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px var(--shadow-medium);
}

.card-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.back-btn {
  padding: 8px 16px;
  background: var(--color-bg-menu-light);
  color: var(--color-text);
  border: 2px solid var(--color-buttons);
  border-radius: 8px;
  font-size: clamp(0.7rem, 1.1vw, 0.9rem);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px var(--shadow-light);
}

.back-btn:hover {
  background: var(--color-bg-menu);
  border-color: var(--color-accents);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px var(--shadow-medium);
}
</style>
