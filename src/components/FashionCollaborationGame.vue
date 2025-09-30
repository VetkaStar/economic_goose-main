<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="game-modal">
      <div class="modal-header">
        <h2 class="modal-title">▲ Модная коллаборация</h2>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>
      <div class="modal-body">
        <div class="placeholder">
          <div class="icon">▲</div>
          <div class="title">Модная коллаборация</div>
          <div class="desc">Разработайте коллекцию в команде</div>
          <div class="note">Прототип. Скоро добавим полноценный геймплей.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{ close: [] }>()
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1100; }
.game-modal { background: var(--color-bg-menu-light); border-radius: 15px; width: clamp(960px, 75vw, 1600px); height: clamp(600px, 75vh, 1000px); overflow: hidden; border: 2px solid var(--color-buttons); display: flex; flex-direction: column; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: var(--color-bg-menu); border-bottom: 2px solid var(--color-buttons); }
.modal-title { margin: 0; color: var(--color-text); font-weight: 700; }
.close-btn { background: var(--color-buttons); border: 2px solid var(--color-accents); border-radius: 10px; color: var(--color-text); padding: 6px 10px; cursor: pointer; }
.modal-body { flex: 1; padding: 20px; }
.placeholder { height: 100%; display: grid; place-items: center; text-align: center; gap: 10px; }
.icon { font-size: 64px; color: var(--color-accents); }
.title { font-size: 20px; font-weight: 700; color: var(--color-text); }
.desc { color: var(--color-text); opacity: .8; }
.note { font-size: 12px; color: var(--color-text); opacity: .7; }
</style>



