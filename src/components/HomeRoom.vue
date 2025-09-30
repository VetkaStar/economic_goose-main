<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="room-modal">
      <div class="room-header">
        <h2 class="title">▲ Дом гуся</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <!-- Сцена комнаты с фоновым изображением -->
      <div class="scene">
        <!-- Фоновое изображение комнаты -->
        <img src="/home_goose/фон комната гуся.svg" alt="Комната гуся" class="room-background" />
        
        <!-- Статичный стол на картинке -->
        <div class="static-table">
          <img src="/home_goose/стол.svg" alt="Стол" class="table-image" />
        </div>

        <!-- Интерактивные элементы -->
        <div class="interactive-elements">
          <!-- Швейная машинка на столе (слева) - конструктор одежды -->
          <div class="interactive-item sewing-machine" @click="showConstructor = true" title="Конструктор одежды">
            <img src="/home_goose/машинка.svg" alt="Швейная машинка" class="item-image" />
            <div class="item-label">швейная машинка</div>
          </div>

          <!-- Компьютер на столе (справа) - социальная сеть -->
          <div class="interactive-item computer" @click="showSocial = true" title="Социальная сеть">
            <img src="/home_goose/комп.svg" alt="Компьютер" class="item-image" />
            <div class="item-label">компьютер</div>
          </div>

          <!-- Коробки в нижнем углу (Кладовая) -->
          <div class="interactive-item boxes" @click="showPantry = true" title="Кладовая">
            <img src="/home_goose/коробки.svg" alt="Коробки" class="item-image" />
            <div class="item-label">кладовая</div>
          </div>
        </div>
      </div>

      <ClothesConstructor v-if="showConstructor" @close="showConstructor = false" />
      <PantryModal v-if="showPantry" @close="showPantry = false" />
      <SocialNetworkModal v-if="showSocial" @close="showSocial = false" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ClothesConstructor from './ClothesConstructor.vue'
import PantryModal from './PantryModal.vue'
import SocialNetworkModal from './SocialNetworkModal.vue'

const showConstructor = ref(false)
const showPantry = ref(false)
const showSocial = ref(false)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
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

.room-modal {
  width: 1000px;
  height: 700px;
  background: var(--color-bg-menu-light);
  border: 2px solid var(--color-buttons);
  border-radius: 15px;
  box-shadow: 0 8px 16px var(--shadow-medium);
  display: flex;
  flex-direction: column;
  font-family: 'Orbitron', sans-serif;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  background: var(--color-bg-menu);
  border-bottom: 2px solid var(--color-buttons);
  border-radius: 15px 15px 0 0;
}

.title { 
  color: var(--color-text); 
  font-weight: 700; 
  text-shadow: 2px 2px 0 var(--shadow-light);
  font-family: 'Orbitron', sans-serif;
  font-size: 1.4rem;
}

.close-btn {
  background: var(--color-buttons);
  border: 2px solid var(--color-accents);
  border-radius: 12px;
  color: var(--color-text);
  padding: 8px 12px;
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: var(--color-accents);
  transform: scale(1.05);
}

.scene {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.room-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

/* Статичный стол как элемент фона */
.static-table {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  pointer-events: none; /* Стол не кликабельный */
  width: 80%;
  height: 40%;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.table-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
}

.interactive-elements {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Отключаем события для контейнера */
}

.interactive-item {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 10px;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  border: 2px solid transparent;
  pointer-events: auto; /* Включаем события для элементов */
}

.interactive-item:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.2);
  border-color: var(--color-accents);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.item-image {
  width: 120px;
  height: 120px;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  transition: all 0.3s ease;
}

/* Размеры для элементов на столе */
.sewing-machine .item-image,
.computer .item-image {
  width: 90px;
  height: 90px;
}


/* Размеры для коробок в нижнем углу */
.boxes .item-image {
  width: 100px;
  height: 100px;
}

.interactive-item:hover .item-image {
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.4));
}

.item-label {
  margin-top: 10px;
  color: white;
  font-family: 'Orbitron', sans-serif;
  font-weight: 400;
  font-size: 0.9rem;
  text-align: center;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 8px;
  border-radius: 8px;
  backdrop-filter: blur(5px);
}

/* Позиционирование элементов */
.sewing-machine {
  /* Швейная машинка на столе слева */
  bottom: 25%;
  left: 35%;
  transform: translateX(-50%);
}

.computer {
  /* Компьютер на столе справа */
  bottom: 25%;
  right: 35%;
  transform: translateX(50%);
}

.boxes {
  /* Коробки в нижнем углу */
  bottom: 20px;
  left: 20px;
  transform: none;
}
</style>


