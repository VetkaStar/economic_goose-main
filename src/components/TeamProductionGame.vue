<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="game-modal">
      <div class="modal-header">
        <h2 class="modal-title">◉ Командное производство</h2>
        <button class="close-btn" @click="handleClose">✕</button>
      </div>
      <div class="modal-body">
        <div v-if="store.error" class="error-box">{{ store.error }}</div>

        <div v-if="!store.room" class="center-box">
          <div class="icon">◉</div>
          <div class="title">Командное производство</div>
          <div class="desc">Создавайте одежду вместе с друзьями</div>
          <button class="btn" :disabled="store.isConnecting" @click="createRoom">{{ store.isConnecting ? 'Подключение…' : 'Присоединиться к комнате' }}</button>
        </div>

        <div v-else class="game-content">
          <div class="top-bar">
            <div class="progress">
              <div class="progress-label">Прогресс: {{ store.room.producedItems }}/{{ store.room.targetItems }} ({{ store.progressPercent }}%)</div>
              <div class="progress-bar"><div class="progress-fill" :style="{ width: store.progressPercent + '%' }"></div></div>
            </div>
            <div class="status">Статус: <strong>{{ statusText }}</strong></div>
          </div>

          <div class="layout">
            <div class="left">
              <h3>Роль</h3>
              <div class="roles">
                <button class="role" :class="{ active: store.you?.role==='designer' }" @click="setRole('designer')">🎨 Дизайнер</button>
                <button class="role" :class="{ active: store.you?.role==='cutter' }" @click="setRole('cutter')">✂️ Кройщик</button>
                <button class="role" :class="{ active: store.you?.role==='sewer' }" @click="setRole('sewer')">🧵 Швея</button>
                <button class="role" :class="{ active: store.you?.role==='quality' }" @click="setRole('quality')">✅ Контроль качества</button>
              </div>

              <div class="ready">
                <button class="btn" :class="{ primary: store.you?.isReady }" @click="toggleReady">{{ store.you?.isReady ? 'Готов(а)' : 'Готов?' }}</button>
              </div>

              <div class="actions" v-if="store.room.status==='active'">
                <button class="btn primary" @click="performAction">Выполнить действие</button>
              </div>
              <div class="actions" v-else-if="store.room.status==='lobby'">
                <button class="btn primary" :disabled="!store.isReadyToStart" @click="startGame">Начать игру</button>
              </div>
            </div>

            <div class="right">
              <h3>Команда ({{ store.players.length }})</h3>
              <div class="players">
                <div class="player" v-for="p in store.players" :key="p.id" :class="{ you: p.id===store.you?.id }">
                  <div class="name">{{ p.name }} <span v-if="p.id===store.you?.id" class="you-tag">(Вы)</span></div>
                  <div class="meta">
                    <span class="role-tag" v-if="p.role">{{ roleLabel(p.role) }}</span>
                    <span class="ready-tag" :class="{ on: p.isReady }">{{ p.isReady ? 'Готов' : 'Не готов' }}</span>
                    <span class="contrib">Вклад: {{ p.contributed }}</span>
                  </div>
                </div>
              </div>

              <div class="result" v-if="store.room.status==='finished'">
                <div class="result-title">Миссия выполнена!</div>
                <div class="result-sub">Изготовлено изделий: {{ store.room.producedItems }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useTeamProductionStore, type TeamRole } from '@/stores/teamProductionStore'
const emit = defineEmits<{ close: [] }>()

const store = useTeamProductionStore()

const statusText = computed(() => {
  if (!store.room) return 'не подключено'
  switch (store.room.status) {
    case 'lobby': return 'лобби'
    case 'active': return 'идёт производство'
    case 'finished': return 'завершено'
  }
})

function roleLabel(role: TeamRole): string {
  switch (role) {
    case 'designer': return 'Дизайнер'
    case 'cutter': return 'Кройщик'
    case 'sewer': return 'Швея'
    case 'quality': return 'Контроль качества'
  }
}

function createRoom() { store.createOrJoinRoom() }
function setRole(role: TeamRole) { store.setRole(role) }
function toggleReady() { store.toggleReady() }
function startGame() { store.startGame() }
function performAction() { store.performAction() }

async function handleClose() {
  await store.leaveRoom()
  emit('close')
}

onMounted(() => {
  // можно автоподключаться при открытии
})

onUnmounted(() => {
  store.leaveRoom()
})
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1100; }
.game-modal { background: var(--color-bg-menu-light); border-radius: 15px; width: clamp(960px, 75vw, 1600px); height: clamp(600px, 75vh, 1000px); overflow: hidden; border: 2px solid var(--color-buttons); display: flex; flex-direction: column; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: var(--color-bg-menu); border-bottom: 2px solid var(--color-buttons); }
.modal-title { margin: 0; color: var(--color-text); font-weight: 700; }
.close-btn { background: var(--color-buttons); border: 2px solid var(--color-accents); border-radius: 10px; color: var(--color-text); padding: 6px 10px; cursor: pointer; }
.modal-body { flex: 1; padding: 20px; }
.center-box { height: 100%; display: grid; place-items: center; text-align: center; gap: 10px; }
.icon { font-size: 64px; color: var(--color-accents); }
.title { font-size: 20px; font-weight: 700; color: var(--color-text); }
.desc { color: var(--color-text); opacity: .8; }
.btn { padding: 10px 16px; border: 2px solid var(--color-buttons); border-radius: 10px; background: var(--color-bg-menu); color: var(--color-text); cursor: pointer; font-weight: 600; }
.btn.primary { background: var(--color-accents); border-color: var(--color-highlights); }
.error-box { background: var(--color-bg-menu); border: 2px solid var(--color-highlights); color: var(--color-text); padding: 10px; border-radius: 8px; margin-bottom: 10px; }

.game-content { display: flex; flex-direction: column; gap: 16px; height: 100%; }
.top-bar { display: flex; justify-content: space-between; gap: 16px; align-items: center; }
.progress { flex: 1; }
.progress-label { font-weight: 700; color: var(--color-text); margin-bottom: 6px; }
.progress-bar { height: 12px; background: var(--color-bg-menu); border: 2px solid var(--color-buttons); border-radius: 999px; overflow: hidden; }
.progress-fill { height: 100%; background: var(--color-accents); }
.status { color: var(--color-text); font-weight: 600; }

.layout { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; height: 100%; }
.left, .right { background: var(--color-bg-menu); border: 2px solid var(--color-buttons); border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 12px; overflow: auto; }

.roles { display: grid; grid-template-columns: repeat(2, minmax(140px, 1fr)); gap: 10px; }
.role { padding: 10px; border: 2px solid var(--color-buttons); border-radius: 10px; background: var(--color-bg-menu-light); color: var(--color-text); cursor: pointer; font-weight: 600; }
.role.active { background: var(--color-accents); border-color: var(--color-highlights); }

.players { display: flex; flex-direction: column; gap: 8px; }
.player { padding: 8px; background: var(--color-bg-menu-light); border: 2px solid var(--color-buttons); border-radius: 10px; }
.player.you { border-color: var(--color-accents); }
.name { font-weight: 700; color: var(--color-text); }
.meta { display: flex; flex-wrap: wrap; gap: 8px; font-size: 12px; color: var(--color-text); }
.role-tag { padding: 2px 8px; border: 1px solid var(--color-buttons); border-radius: 999px; background: var(--color-bg-menu); }
.ready-tag { padding: 2px 8px; border: 1px solid var(--color-buttons); border-radius: 999px; background: var(--color-bg-menu); }
.ready-tag.on { background: var(--color-accents); border-color: var(--color-highlights); }
.contrib { font-weight: 700; color: var(--color-accents); }
.you-tag { color: var(--color-highlights); }

.result { text-align: center; padding: 10px; background: var(--color-bg-menu-light); border: 2px solid var(--color-buttons); border-radius: 10px; }
.result-title { font-weight: 700; color: var(--color-text); }
.result-sub { color: var(--color-text); opacity: .8; }
</style>



