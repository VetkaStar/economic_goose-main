<template>
  <div class="modal-overlay" @click.self="onClose">
    <div class="game-modal">
      <div class="modal-header">
        <h2 class="modal-title">◆ Fashion Battle</h2>
        <div class="header-right">
          <div class="round-indicator" v-if="stage !== 'lobby'">
            Раунд {{ currentRound + 1 }} / {{ totalRounds }}
          </div>
          <button class="close-btn" @click="onClose">✕</button>
        </div>
      </div>

      <div class="modal-body">
        <!-- Экран лобби -->
        <div v-if="stage === 'lobby'" class="lobby">
          <div class="intro-card">
            <div class="icon">◆</div>
            <div class="title">Fashion Battle</div>
            <div class="desc">Покажите свои дизайны и победите в модном состязании</div>
            <ul class="rules">
              <li>3 раунда, в каждом — новая тема.</li>
              <li>Выберите лучший дизайн под критерии раунда.</li>
              <li>Зарабатывайте очки, побеждайте соперников и получайте награды.</li>
            </ul>
            <button class="primary-btn" @click="startGame">Начать</button>
          </div>
        </div>

        <!-- Экран раунда -->
        <div v-else-if="stage === 'playing'" class="round">
          <div class="top-panel">
            <div class="theme-card">
              <div class="theme-title">Тема: {{ current.theme }}</div>
              <div class="criteria">
                <span class="chip">Стиль: ×{{ current.criteria.style }}</span>
                <span class="chip">Оригинальность: ×{{ current.criteria.originality }}</span>
                <span class="chip">Трендовость: ×{{ current.criteria.trend }}</span>
              </div>
            </div>
            <div class="timer" :class="{ urgent: timeLeft <= 5 }">
              ⏱️ {{ timeLeft }}s
            </div>
          </div>

          <div class="cards">
            <button 
              v-for="card in designOptions" 
              :key="card.id" 
              class="design-card"
              :class="{ selected: selectedDesign?.id === card.id }"
              @click="selectDesign(card)"
            >
              <div class="design-icon">{{ card.icon }}</div>
              <div class="design-name">{{ card.name }}</div>
              <div class="design-stats">
                <span>Стиль {{ card.style }}</span>
                <span>Оригинальность {{ card.originality }}</span>
                <span>Трендовость {{ card.trend }}</span>
              </div>
            </button>
          </div>

          <div class="actions">
            <button class="secondary-btn" @click="reroll" :disabled="rerollsLeft === 0">Перебросить ({{ rerollsLeft }})</button>
            <button class="primary-btn" @click="submitDesign" :disabled="!selectedDesign">Отправить дизайн</button>
          </div>

          <div class="scoreboard">
            <div class="board-title">Табло</div>
            <div class="board-grid">
              <div class="player-row you">
                <span class="name">Вы</span>
                <span class="score">{{ totalScore }}</span>
              </div>
              <div 
                v-for="op in opponents" 
                :key="op.id" 
                class="player-row"
              >
                <span class="name">{{ op.name }}</span>
                <span class="score">{{ op.total }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Итоги -->
        <div v-else-if="stage === 'results'" class="results">
          <div class="results-card">
            <div class="title">Итоги Fashion Battle</div>
            <div class="placement">Место: {{ placeText }}</div>
            <div class="scores">
              Ваш счёт: <strong>{{ totalScore }}</strong>
            </div>
            <div class="rewards">
              Награды: ₽{{ rewards.money }} · Репутация +{{ rewards.reputation }} · Опыт +{{ rewards.experience }}
            </div>
            <div class="buttons">
              <button class="secondary-btn" @click="restart">Сыграть ещё</button>
              <button class="primary-btn" @click="onClose">Закрыть</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'

type Stage = 'lobby' | 'playing' | 'results'

type Criteria = {
  style: number
  originality: number
  trend: number
}

type Round = {
  theme: string
  criteria: Criteria
}

type Design = {
  id: string
  name: string
  icon: string
  style: number
  originality: number
  trend: number
}

type Opponent = {
  id: string
  name: string
  total: number
}

const emit = defineEmits<{ close: [] }>()
const gameStore = useGameStore()

const stage = ref<Stage>('lobby')
const totalRounds = 3
const currentRound = ref(0)
const timeLeft = ref(20)
let timer: number | undefined

const rounds = ref<Round[]>([
  { theme: 'Уличный стиль', criteria: { style: 2, originality: 1, trend: 1 } },
  { theme: 'Эко-минимализм', criteria: { style: 1, originality: 2, trend: 1 } },
  { theme: 'Подиум будущего', criteria: { style: 1, originality: 1, trend: 2 } }
])

const opponents = ref<Opponent[]>([
  { id: 'op1', name: 'Алекс', total: 0 },
  { id: 'op2', name: 'Мира', total: 0 },
  { id: 'op3', name: 'Рэй', total: 0 }
])

const totalScore = ref(0)
const selectedDesign = ref<Design | null>(null)
const designOptions = ref<Design[]>([])
const rerollsLeft = ref(2)

const current = computed(() => rounds.value[currentRound.value])

function generateDesigns(): Design[] {
  const pool: Omit<Design, 'id'>[] = [
    { name: 'Street Flex', icon: '👟', style: 8, originality: 6, trend: 7 },
    { name: 'Eco Pure', icon: '🌿', style: 6, originality: 8, trend: 6 },
    { name: 'Neo Runway', icon: '✨', style: 7, originality: 6, trend: 9 },
    { name: 'Retro Chic', icon: '👜', style: 7, originality: 7, trend: 6 },
    { name: 'Bold Art', icon: '🎨', style: 6, originality: 9, trend: 6 },
    { name: 'Tech Wear', icon: '🤖', style: 8, originality: 7, trend: 7 }
  ]
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 3)
  return shuffled.map((d, i) => ({ id: `${Date.now()}_${i}`, ...d }))
}

function scoreDesign(design: Design, criteria: Criteria): number {
  const s = design.style * criteria.style
  const o = design.originality * criteria.originality
  const t = design.trend * criteria.trend
  return Math.round((s + o + t) + Math.random() * 3)
}

function aiRoundGain(): number {
  // Простая модель ИИ — компетентные соперники
  return 14 + Math.floor(Math.random() * 11) // 14..24
}

function startTimer() {
  clearTimer()
  timeLeft.value = 20
  timer = window.setInterval(() => {
    timeLeft.value -= 1
    if (timeLeft.value <= 0) {
      submitDesign()
    }
  }, 1000)
}

function clearTimer() {
  if (timer) {
    clearInterval(timer)
    timer = undefined
  }
}

function startGame() {
  stage.value = 'playing'
  currentRound.value = 0
  totalScore.value = 0
  opponents.value.forEach(o => (o.total = 0))
  rerollsLeft.value = 2
  selectedDesign.value = null
  designOptions.value = generateDesigns()
  startTimer()
}

function selectDesign(d: Design) {
  selectedDesign.value = d
}

function reroll() {
  if (rerollsLeft.value > 0) {
    rerollsLeft.value -= 1
    designOptions.value = generateDesigns()
    selectedDesign.value = null
  }
}

function submitDesign() {
  clearTimer()
  const chosen = selectedDesign.value ?? designOptions.value[0]
  const gained = scoreDesign(chosen, current.value.criteria)
  totalScore.value += gained
  opponents.value.forEach(o => (o.total += aiRoundGain()))
  nextRound()
}

function nextRound() {
  if (currentRound.value + 1 >= totalRounds) {
    finishGame()
    return
  }
  currentRound.value += 1
  selectedDesign.value = null
  designOptions.value = generateDesigns()
  startTimer()
}

const placement = computed(() => {
  const all = [totalScore.value, ...opponents.value.map(o => o.total)].sort((a, b) => b - a)
  const idx = all.indexOf(totalScore.value)
  return idx + 1 // 1..N
})

const placeText = computed(() => {
  switch (placement.value) {
    case 1: return '1 (Победа)'
    case 2: return '2'
    case 3: return '3'
    default: return '4'
  }
})

const rewards = computed(() => {
  // Награды за место
  if (placement.value === 1) return { money: 600, reputation: 8, experience: 40 }
  if (placement.value === 2) return { money: 350, reputation: 5, experience: 25 }
  if (placement.value === 3) return { money: 200, reputation: 3, experience: 15 }
  return { money: 120, reputation: 2, experience: 10 }
})

function grantRewards() {
  gameStore.addMoney(rewards.value.money)
  gameStore.addReputation(rewards.value.reputation)
  gameStore.addExperience(rewards.value.experience)
}

function finishGame() {
  stage.value = 'results'
  grantRewards()
}

function restart() {
  startGame()
}

function onClose() {
  clearTimer()
  emit('close')
}

onMounted(() => {
  // Можно автостартовать или оставить лобби — оставим лобби для UX
})

onUnmounted(() => {
  clearTimer()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}
.game-modal {
  background: var(--color-bg-menu-light);
  border-radius: 15px;
  width: clamp(960px, 75vw, 1600px);
  height: clamp(600px, 75vh, 1000px);
  overflow: hidden;
  border: 2px solid var(--color-buttons);
  display: flex;
  flex-direction: column;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--color-bg-menu);
  border-bottom: 2px solid var(--color-buttons);
}
.modal-title { margin: 0; color: var(--color-text); font-weight: 700; }
.header-right { display: flex; align-items: center; gap: 10px; }
.round-indicator { color: var(--color-text); font-weight: 700; opacity: .9; }
.close-btn {
  background: var(--color-buttons);
  border: 2px solid var(--color-accents);
  border-radius: 10px;
  color: var(--color-text);
  padding: 6px 10px;
  cursor: pointer;
}
.modal-body { flex: 1; padding: 20px; display: flex; flex-direction: column; gap: 16px; }

/* Лобби */
.lobby { height: 100%; display: grid; place-items: center; }
.intro-card { background: var(--color-bg-menu); border: 2px solid var(--color-buttons); border-radius: 12px; padding: 24px; width: min(680px, 100%); box-shadow: 0 2px 6px var(--shadow-light); text-align: center; }
.icon { font-size: 64px; color: var(--color-accents); }
.title { font-size: 20px; font-weight: 700; color: var(--color-text); }
.desc { color: var(--color-text); opacity: .8; margin-bottom: 8px; }
.rules { text-align: left; margin: 12px 0 18px; color: var(--color-text); opacity: .9; }
.rules li { margin: 6px 0; }

/* Раунд */
.top-panel { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.theme-card { background: var(--color-bg-menu); border: 2px solid var(--color-buttons); border-radius: 10px; padding: 12px; flex: 1; }
.theme-title { font-weight: 700; color: var(--color-text); margin-bottom: 8px; }
.criteria { display: flex; flex-wrap: wrap; gap: 6px; }
.chip { padding: 4px 8px; border-radius: 999px; background: var(--color-bg-menu-light); border: 1px solid var(--color-buttons); color: var(--color-text); font-weight: 600; font-size: 12px; }
.timer { background: var(--color-bg-menu); border: 2px solid var(--color-buttons); border-radius: 10px; padding: 10px 12px; min-width: 90px; text-align: center; font-weight: 700; color: var(--color-text); }
.timer.urgent { border-color: var(--color-highlights); background: var(--color-accents); }

.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.design-card { background: var(--color-bg-menu); border: 2px solid var(--color-buttons); border-radius: 12px; padding: 12px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px; transition: transform .15s ease; }
.design-card:hover { transform: translateY(-2px); border-color: var(--color-accents); }
.design-card.selected { outline: 3px solid var(--color-accents); }
.design-icon { font-size: 32px; }
.design-name { font-weight: 700; color: var(--color-text); }
.design-stats { display: flex; gap: 8px; font-size: 12px; color: var(--color-text); opacity: .9; }

.actions { display: flex; justify-content: space-between; gap: 12px; }
.primary-btn { padding: 10px 16px; background: var(--color-accents); color: var(--color-text); border: 2px solid var(--color-highlights); border-radius: 10px; font-weight: 700; cursor: pointer; }
.secondary-btn { padding: 10px 16px; background: var(--color-bg-menu-light); color: var(--color-text); border: 2px solid var(--color-buttons); border-radius: 10px; font-weight: 700; cursor: pointer; }

.scoreboard { background: var(--color-bg-menu); border: 2px solid var(--color-buttons); border-radius: 12px; padding: 12px; }
.board-title { font-weight: 700; color: var(--color-text); margin-bottom: 10px; }
.board-grid { display: grid; grid-template-columns: 1fr auto; gap: 8px 12px; align-items: center; }
.player-row .name { color: var(--color-text); }
.player-row .score { font-weight: 700; color: var(--color-accents); }
.player-row.you .name { color: var(--color-highlights); font-weight: 700; }

/* Итоги */
.results { height: 100%; display: grid; place-items: center; }
.results-card { background: var(--color-bg-menu); border: 2px solid var(--color-buttons); border-radius: 12px; padding: 24px; width: min(560px, 100%); text-align: center; box-shadow: 0 2px 6px var(--shadow-light); }
.results-card .title { font-size: 22px; margin-bottom: 8px; }
.placement { color: var(--color-text); opacity: .9; margin-bottom: 8px; font-weight: 700; }
.scores { color: var(--color-text); margin: 6px 0 12px; }
.rewards { color: var(--color-text); font-weight: 700; margin-bottom: 16px; }
.buttons { display: flex; justify-content: center; gap: 12px; }

/* Адаптивность */
@media (max-width: 1024px) {
  .cards { grid-template-columns: 1fr; }
  .actions { flex-direction: column; }
}
</style>
