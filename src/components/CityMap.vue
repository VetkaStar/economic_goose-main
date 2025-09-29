<template>
  <div class="city-map">
    <!-- Игровая статистика -->
    <GameStats />

    <!-- Карта города -->
    <div class="map-container">
      <!-- Отладочные направляющие (временно для настройки) -->
      <div v-if="showDebugGrid" class="debug-grid">
        <!-- Горизонтальные направляющие -->
        <div v-for="i in 5" :key="`h-${i}`" 
             class="debug-line horizontal" 
             :style="{ top: (i * 20) + '%' }">
        </div>
        <!-- Вертикальные направляющие -->
        <div v-for="i in 7" :key="`v-${i}`" 
             class="debug-line vertical" 
             :style="{ left: (i * 16.66) + '%' }">
        </div>
        
        <!-- Номера всех точек пересечения -->
        <div v-for="(point, index) in allGridIntersections" :key="`point-${index}`"
             class="grid-point-label"
             :style="{ 
               left: point.x + '%', 
               top: point.y + '%',
               transform: 'translate(-50%, -50%)'
             }">
          {{ point.number }}
        </div>
      </div>

      <!-- Фоновое изображение (пока заглушка) -->
      <div class="map-background">
        <!-- Здесь будет фоновое изображение с дорогами и дизайном -->
      </div>

      <!-- Система дорог -->
      <div class="roads-network">
        <!-- Основная замкнутая дорога: 2→3→4→9→14→13→18→17→16→11→12→7→2 -->
        <div class="road road-2-to-3"></div>
        <div class="road road-3-to-4"></div>
        <div class="road road-4-to-9"></div>
        <div class="road road-9-to-14"></div>
        <div class="road road-14-to-13"></div>
        <div class="road road-13-to-18"></div>
        <div class="road road-18-to-17"></div>
        <div class="road road-17-to-16"></div>
        <div class="road road-16-to-11"></div>
        <div class="road road-11-to-12"></div>
        <div class="road road-12-to-7"></div>
        <div class="road road-7-to-2"></div>

        <!-- Дороги за пределы карты -->
        <div class="road road-7-to-6"></div>
        <div class="road road-6-exit"></div>
        <div class="road road-3-exit"></div>
        <div class="road road-9-to-10"></div>
        <div class="road road-10-exit"></div>
        <div class="road road-14-to-19"></div>
        <div class="road road-19-to-20"></div>
      </div>

      <!-- Здания на доступных точках пересечения -->
      <div class="buildings">
        <!-- Точка 1 - Банк -->
        <div class="building bank" @click="openBank">
          <img :src="buildingImages.bank" alt="Банк" class="building-image" />
        </div>

        <!-- Точка 2 - Торговый центр -->
        <div class="building mall" @click="openMall">
          <img :src="buildingImages.mall" alt="Торговый центр" class="building-image" />
        </div>

        <!-- Точка 3 - Администрация -->
        <div class="building government" @click="openGovernment">
          <img :src="buildingImages.government" alt="Администрация" class="building-image" />
        </div>

        <!-- Точка 4 - Жилой дом 1 -->
        <div class="building house-1" @click="openHouse">
          <img :src="buildingImages.houses[0]" alt="Дом" class="building-image" />
        </div>

        <!-- Точка 5 - Жилой дом 2 -->
        <div class="building house-2" @click="openHouse">
          <img :src="buildingImages.houses[1]" alt="Дом" class="building-image" />
        </div>

        <!-- Точка 6 - Жилой дом 3 -->
        <div class="building house-3" @click="openHouse">
          <img :src="buildingImages.houses[2]" alt="Дом" class="building-image" />
        </div>

        <!-- Точка 7 - Производственный цех -->
        <div class="building workshop" @click="openWorkshop">
          <img :src="buildingImages.workshop" alt="Производственный цех" class="building-image" />
        </div>

        <!-- Точка 8 - Офисное здание -->
        <div class="building office" @click="openOffice">
          <img :src="buildingImages.office" alt="Офисное здание" class="building-image" />
        </div>

        <!-- Точка 9 - Склад -->
        <div class="building warehouse" @click="openWarehouse">
          <img :src="buildingImages.warehouse" alt="Склад" class="building-image" />
        </div>

        <!-- Дополнительные здания на свободных точках -->
        <!-- Магазин (можно добавить на точку 1.5 - между 1 и 2) -->
        <div class="building shop" @click="openShop">
          <img :src="buildingImages.shop" alt="Магазин" class="building-image" />
        </div>

        <!-- Рынок (можно добавить на точку 2.5 - между 2 и 3) -->
        <div class="building market" @click="openMarket">
          <img :src="buildingImages.market" alt="Рынок" class="building-image" />
        </div>

        <!-- Ателье (можно добавить на точку 3.5 - между 3 и 4) -->
        <div class="building atelier" @click="openAtelier">
          <img :src="buildingImages.atelier" alt="Ателье" class="building-image" />
        </div>
      </div>

    </div>

    <!-- Микрофон с always-on display -->
    <div class="microphone" @click="togglePhone">
      <div class="mic-body">
        <div class="mic-screen">
          <div class="time-display">{{ currentTime }}</div>
          <div class="date-display">{{ currentDate }}</div>
        </div>
      </div>
      <div v-if="unreadMessages > 0" class="notification-badge">{{ unreadMessages }}</div>
    </div>

    <!-- Интерфейс телефона -->
    <PhoneInterface 
      :show="showPhone" 
      :unread-messages="unreadMessages"
      @close="closePhone"
    />

    <!-- Кнопка настроек -->
    <button class="settings-btn" @click="openSettings" title="Настройки">
      <img src="/main-menu/шестерня.svg" alt="Настройки" class="settings-icon">
    </button>

    <!-- Кнопка отладки сетки (временно) -->
    <button class="debug-btn" @click="showDebugGrid = !showDebugGrid" title="Показать/скрыть сетку">
      🔧
    </button>

    <!-- Кнопки сбоку от настроек (только когда открыто модальное окно) -->
    <div v-if="showSettings" class="settings-side-buttons">
      <button class="side-btn hotkeys-side-btn" @click="openHotkeys" title="Горячие клавиши">
        ⌨️
      </button>
      <button class="side-btn account-side-btn" @click="openAccount" title="Учетная запись">
        👤
      </button>
    </div>
    

    <!-- Модальное окно настроек -->
    <SettingsModal 
      v-if="showSettings"
      :show-exit-button="true"
      @close="closeSettings"
      @exit-to-main-menu="exitToMainMenu"
    />

    <!-- Модальные окна горячих клавиш и учетной записи -->
    <HotkeysModal 
      v-if="showHotkeys"
      @close="closeHotkeys"
    />
    
    <AccountModal 
      v-if="showAccount"
      @close="closeAccount"
    />

    <!-- Модальное окно склада -->
    <WarehouseModal 
      v-if="showWarehouse"
      @close="closeWarehouse"
    />

    <!-- Модальное окно ателье -->
    <AtelierModal 
      v-if="showAtelier"
      @close="closeAtelier"
    />

    <!-- Модальное окно рынка -->
    <MarketModal 
      v-if="showMarket"
      @close="closeMarket"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
// import { useAuthStore } from '@/stores/authStore' // Пока не используется
import GameStats from './GameStats.vue'
import SettingsModal from './SettingsModal.vue'
import HotkeysModal from './HotkeysModal.vue'
import AccountModal from './AccountModal.vue'
import WarehouseModal from './WarehouseModal.vue'
import AtelierModal from './AtelierModal.vue'
import MarketModal from './MarketModal.vue'
import PhoneInterface from './PhoneInterface.vue'

const emit = defineEmits<{
  exitToMainMenu: []
}>()

// Инициализация auth store
// const authStore = useAuthStore() // Пока не используется

// Состояние модальных окон
const showSettings = ref(false)
const showHotkeys = ref(false)
const showAccount = ref(false)
const showWarehouse = ref(false)
const showAtelier = ref(false)
const showMarket = ref(false)

// Отладочная сетка (временно)
const showDebugGrid = ref(true)

// Все точки пересечения направляющих (для отладки)
const allGridIntersections = ref([
  // Первый ряд (20%)
  { x: 16.66, y: 20, number: 1 },  // Колонка 1 (левая)
  { x: 33.33, y: 20, number: 2 },  // Колонка 2
  { x: 50, y: 20, number: 3 },     // Колонка 3 (центр)
  { x: 66.66, y: 20, number: 4 },  // Колонка 4
  { x: 83.33, y: 20, number: 5 },  // Колонка 5 (правая)
  
  // Второй ряд (40%)
  { x: 16.66, y: 40, number: 6 },  // Колонка 1 (левая)
  { x: 33.33, y: 40, number: 7 },  // Колонка 2
  { x: 50, y: 40, number: 8 },     // Колонка 3 (центр)
  { x: 66.66, y: 40, number: 9 },  // Колонка 4
  { x: 83.33, y: 40, number: 10 }, // Колонка 5 (правая)
  
  // Третий ряд (60%)
  { x: 16.66, y: 60, number: 11 }, // Колонка 1 (левая)
  { x: 33.33, y: 60, number: 12 }, // Колонка 2
  { x: 50, y: 60, number: 13 },    // Колонка 3 (центр)
  { x: 66.66, y: 60, number: 14 }, // Колонка 4
  { x: 83.33, y: 60, number: 15 }, // Колонка 5 (правая)
  
  // Четвертый ряд (80%)
  { x: 16.66, y: 80, number: 16 }, // Колонка 1 (левая)
  { x: 33.33, y: 80, number: 17 }, // Колонка 2
  { x: 50, y: 80, number: 18 },    // Колонка 3 (центр)
  { x: 66.66, y: 80, number: 19 }, // Колонка 4
  { x: 83.33, y: 80, number: 20 }  // Колонка 5 (правая)
])



// Изображения зданий с прозрачным фоном
const buildingImages = ref({
  houses: [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=150&h=150&fit=crop&crop=center&auto=format&q=80&fm=png',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=150&h=150&fit=crop&crop=center&auto=format&q=80&fm=png',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=150&h=150&fit=crop&crop=center&auto=format&q=80&fm=png'
  ],
  bank: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=150&h=150&fit=crop&crop=center&auto=format&q=80&fm=png',
  government: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&h=150&fit=crop&crop=center&auto=format&q=80&fm=png',
  mall: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150&h=150&fit=crop&crop=center&auto=format&q=80&fm=png',
  workshop: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=150&h=150&fit=crop&crop=center&auto=format&q=80&fm=png',
  warehouse: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=150&h=150&fit=crop&crop=center&auto=format&q=80&fm=png',
  office: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&h=150&fit=crop&crop=center&auto=format&q=80&fm=png',
  shop: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150&h=150&fit=crop&crop=center&auto=format&q=80&fm=png',
  atelier: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=150&h=150&fit=crop&crop=center&auto=format&q=80&fm=png',
  market: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150&h=150&fit=crop&crop=center&auto=format&q=80&fm=png'
})

// Время и дата
const currentTime = ref('')
const currentDate = ref('')
let timeInterval: NodeJS.Timeout | null = null

// Телефон
const showPhone = ref(false)
const unreadMessages = ref(3)



const messages = ref([
  {
    id: 1,
    sender: 'Поставщик "Ткани+"',
    text: 'Новая партия хлопка поступила! Скидка 15% до конца недели.',
    time: '14:30',
    read: false
  },
  {
    id: 2,
    sender: 'Администрация города',
    text: 'Приглашаем на модный показ! Ваша репутация позволяет участвовать.',
    time: '12:15',
    read: false
  },
  {
    id: 3,
    sender: 'Банк "Сбербанк"',
    text: 'Одобрен кредит на расширение производства. 500,000₽ под 12% годовых.',
    time: '10:00',
    read: true
  }
])

// Функции времени
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.getHours().toString().padStart(2, '0') + ':' + 
                     now.getMinutes().toString().padStart(2, '0')
  
  const options: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'short' 
  }
  currentDate.value = now.toLocaleDateString('ru-RU', options)
}

// Функции телефона
const togglePhone = () => {
  showPhone.value = !showPhone.value
  if (showPhone.value) {
    // Отмечаем все сообщения как прочитанные
    messages.value.forEach((msg: any) => msg.read = true)
    unreadMessages.value = 0
  }
}

const closePhone = () => {
  showPhone.value = false
}



// Жизненный цикл
onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})

// Функции зданий
const openBank = () => {
  alert('🏦 Сбербанк\n\nКредиты: 500,000₽ под 12%\nДепозиты: 8% годовых\nПереводы: 1% комиссия')
}

const openGovernment = () => {
  // Временное значение репутации, в реальной игре это должно быть из GameStats
  const currentReputation = 25
  if (currentReputation >= 50) {
    alert('🏛️ Администрация\n\n✅ Модные показы доступны!\n✅ Скидки на налоги 10%\n✅ Приоритетные лицензии')
  } else {
    alert('🏛️ Администрация\n\n❌ Модные показы недоступны\n❌ Стандартные налоги\n💡 Повысьте репутацию до 50')
  }
}

const openMall = () => {
  alert('🏬 Торговый центр "Модный"\n\nАренда торгового места:\n• 50,000₽/мес\n• Высокий трафик\n• Престижное расположение')
}

const openWorkshop = () => {
  alert('🏭 Производственный цех\n\nПокупка: 500,000₽\nАренда: 30,000₽/мес\n\nПроизводство одежды\nСклад материалов\nОфис управления')
}

const openWarehouse = () => {
  showWarehouse.value = true
}

const openOffice = () => {
  alert('🏢 Офисный центр\n\nАренда: 30,000₽/мес\n\n• 200 м²\n• Конференц-зал\n• Парковка\n• Wi-Fi')
}

const openShop = () => {
  alert('🏪 Магазин "Стиль"\n\nПокупка: 200,000₽\nАренда: 15,000₽/мес\n\n• Торговый зал 80 м²\n• Витрины\n• Склад 20 м²')
}

const openAtelier = () => {
  showAtelier.value = true
}

const openMarket = () => {
  showMarket.value = true
}

const openHouse = () => {
  alert('🏠 Жилой дом\n\nАренда: 20,000₽/мес\n\n• 2-комнатная квартира\n• Для персонала\n• Меблировка\n• Коммунальные услуги')
}

// Функции настроек
const openSettings = () => {
  showSettings.value = true
}

const closeSettings = () => {
  showSettings.value = false
}

const exitToMainMenu = () => {
  emit('exitToMainMenu')
}

// Функции для горячих клавиш и учетной записи
const openHotkeys = () => {
  showHotkeys.value = true
}

const closeHotkeys = () => {
  showHotkeys.value = false
}

const openAccount = () => {
  showAccount.value = true
}

const closeAccount = () => {
  showAccount.value = false
}

const closeWarehouse = () => {
  showWarehouse.value = false
}

const closeAtelier = () => {
  showAtelier.value = false
}

const closeMarket = () => {
  showMarket.value = false
}

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&family=Comfortaa:wght@400;600&display=swap');
@import '@/styles/colors.css';
@import '@/styles/menu-common.css';

/* 2D Карта города */
.city-map {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #4CAF50; /* Зеленый фон как трава */
  overflow: hidden;
  font-family: 'Orbitron', sans-serif;
}


/* Кнопка настроек */
.settings-btn {
  position: absolute;
  top: clamp(0px, 0.1vw, 0px);
  right: clamp(5px, 0.8vw, 10px);
  width: clamp(105px, 12.6vw, 147px);
  height: clamp(105px, 12.6vw, 147px);
  background: transparent;
  color: white;
  border: none;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  font-family: 'Orbitron', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1004;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  user-select: none;
}

.settings-btn:hover {
  transform: translateY(-2px) scale(1.1);
}

.settings-btn:active {
  transform: translateY(0px) scale(0.95);
}

.settings-icon {
  width: clamp(3.15rem, 6.3vw, 4.2rem);
  height: clamp(3.15rem, 6.3vw, 4.2rem);
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  pointer-events: none;
}

/* Кнопка отладки */
.debug-btn {
  position: absolute;
  top: clamp(15px, 2vw, 25px);
  right: clamp(120px, 15vw, 160px);
  width: clamp(40px, 5vw, 60px);
  height: clamp(40px, 5vw, 60px);
  background: rgba(255, 0, 0, 0.8);
  color: white;
  border: 2px solid white;
  border-radius: 50%;
  font-size: clamp(1.2rem, 2vw, 1.5rem);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.debug-btn:hover {
  background: rgba(255, 0, 0, 1);
  transform: scale(1.1);
}


/* Контейнер карты */
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #4CAF50;
}

/* Отладочные направляющие */
.debug-grid {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.debug-line {
  position: absolute;
  background: rgba(255, 0, 0, 0.3);
  border: 1px solid rgba(255, 0, 0, 0.6);
}

.debug-line.horizontal {
  width: 100%;
  height: 2px;
}

.debug-line.vertical {
  height: 100%;
  width: 2px;
}

/* Номера точек пересечения */
.grid-point-label {
  position: absolute;
  width: 30px;
  height: 30px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  border: 2px solid white;
  z-index: 25;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

/* Фоновое изображение карты */
.map-background {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #4CAF50;
  z-index: 0;
  /* Здесь будет фоновое изображение с дорогами */
}

/* Система дорог */
.roads-network {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 5;
  pointer-events: none;
}

.road {
  position: absolute;
  background: #8B4513;
  border: 3px solid #654321;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 2px rgba(255, 255, 255, 0.1);
}

/* Основная замкнутая дорога */
.road-2-to-3 {
  /* От точки 2 (33.33%, 20%) до точки 3 (50%, 20%) */
  top: 20%;
  left: 33.33%;
  width: 16.67%;
  height: 8px;
  transform: translateY(-4px);
}

.road-3-to-4 {
  /* От точки 3 (50%, 20%) до точки 4 (66.66%, 20%) */
  top: 20%;
  left: 50%;
  width: 16.66%;
  height: 8px;
  transform: translateY(-4px);
}

.road-4-to-9 {
  /* От точки 4 (66.66%, 20%) до точки 9 (66.66%, 40%) */
  top: 20%;
  left: 66.66%;
  width: 8px;
  height: 20%;
  transform: translateX(-4px);
}

.road-9-to-14 {
  /* От точки 9 (66.66%, 40%) до точки 14 (66.66%, 60%) */
  top: 40%;
  left: 66.66%;
  width: 8px;
  height: 20%;
  transform: translateX(-4px);
}

.road-14-to-13 {
  /* От точки 14 (66.66%, 60%) до точки 13 (50%, 60%) */
  top: 60%;
  left: 50%;
  width: 16.66%;
  height: 8px;
  transform: translateY(-4px);
}

.road-13-to-18 {
  /* От точки 13 (50%, 60%) до точки 18 (50%, 80%) */
  top: 60%;
  left: 50%;
  width: 8px;
  height: 20%;
  transform: translateX(-4px);
}

.road-18-to-17 {
  /* От точки 18 (50%, 80%) до точки 17 (33.33%, 80%) */
  top: 80%;
  left: 33.33%;
  width: 16.67%;
  height: 8px;
  transform: translateY(-4px);
}

.road-17-to-16 {
  /* От точки 17 (33.33%, 80%) до точки 16 (16.66%, 80%) */
  top: 80%;
  left: 16.66%;
  width: 16.67%;
  height: 8px;
  transform: translateY(-4px);
}

.road-16-to-11 {
  /* От точки 16 (16.66%, 80%) до точки 11 (16.66%, 60%) */
  top: 60%;
  left: 16.66%;
  width: 8px;
  height: 20%;
  transform: translateX(-4px);
}

.road-11-to-12 {
  /* От точки 11 (16.66%, 60%) до точки 12 (33.33%, 60%) */
  top: 60%;
  left: 16.66%;
  width: 16.67%;
  height: 8px;
  transform: translateY(-4px);
}

.road-12-to-7 {
  /* От точки 12 (33.33%, 60%) до точки 7 (33.33%, 40%) */
  top: 40%;
  left: 33.33%;
  width: 8px;
  height: 20%;
  transform: translateX(-4px);
}

.road-7-to-2 {
  /* От точки 7 (33.33%, 40%) до точки 2 (33.33%, 20%) */
  top: 20%;
  left: 33.33%;
  width: 8px;
  height: 20%;
  transform: translateX(-4px);
}

/* Дороги за пределы карты */
.road-7-to-6 {
  /* От точки 7 (33.33%, 40%) до точки 6 (16.66%, 40%) */
  top: 40%;
  left: 16.66%;
  width: 16.67%;
  height: 8px;
  transform: translateY(-4px);
}

.road-6-exit {
  /* От точки 6 (16.66%, 40%) за левый край экрана */
  top: 40%;
  left: 0%;
  width: 16.66%;
  height: 8px;
  transform: translateY(-4px);
}

.road-3-exit {
  /* От точки 3 (50%, 20%) за верхний край экрана */
  top: 0%;
  left: 50%;
  width: 8px;
  height: 20%;
  transform: translateX(-4px);
}

.road-9-to-10 {
  /* От точки 9 (66.66%, 40%) до точки 10 (83.33%, 40%) */
  top: 40%;
  left: 66.66%;
  width: 16.67%;
  height: 8px;
  transform: translateY(-4px);
}

.road-10-exit {
  /* От точки 10 (83.33%, 40%) за правый край экрана */
  top: 40%;
  left: 83.33%;
  width: 16.67%;
  height: 8px;
  transform: translateY(-4px);
}

.road-14-to-19 {
  /* От точки 14 (66.66%, 60%) до точки 19 (83.33%, 80%) */
  top: 60%;
  left: 66.66%;
  width: 8px;
  height: 20%;
  transform: translateX(-4px);
}

.road-19-to-20 {
  /* От точки 19 (66.66%, 80%) до точки 20 (83.33%, 80%) - горизонтальная дорога */
  top: 80%;
  left: 66.66%;
  width: 16.67%;
  height: 8px;
  transform: translateY(-4px);
}



/* Здания */
.buildings {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 10;
}

.building {
  position: absolute;
  cursor: pointer;
  transition: all 0.3s ease;
  transform-style: preserve-3d;
}

.building:hover {
  transform: translateY(-5px) scale(1.05);
  z-index: 20;
}

.building-roof {
  position: relative;
  z-index: 2;
}

.building-body {
  position: relative;
  z-index: 1;
  border: 2px solid #8D6E63;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.building-windows {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  bottom: 10px;
  z-index: 3;
  pointer-events: none;
}

.building-windows::before,
.building-windows::after {
  content: '';
  position: absolute;
  background: #87CEEB;
  border: 1px solid #4682B4;
}

.building-windows::before {
  top: 0;
  left: 0;
  width: 8px;
  height: 8px;
}

.building-windows::after {
  top: 0;
  right: 0;
  width: 8px;
  height: 8px;
}

/* Здания на новых позициях */
.bank {
  width: 100px;
  height: 100px;
  position: absolute;
  top: 80%;
  left: 33.33%;
  transform: translate(-50%, -50%);
}

.government {
  width: 100px;
  height: 100px;
  position: absolute;
  top: 20%;
  left: 66.66%;
  transform: translate(-50%, -50%);
}

.mall {
  width: 120px;
  height: 100px;
  position: absolute;
  top: 40%;
  left: 16.66%;
  transform: translate(-50%, -50%);
}

.house-1 {
  width: 80px;
  height: 80px;
  position: absolute;
  top: 40%;
  left: 33.33%;
  transform: translate(-50%, -50%);
}

.house-2 {
  width: 80px;
  height: 80px;
  position: absolute;
  top: 60%;
  left: 33.33%;
  transform: translate(-50%, -50%);
}

.house-3 {
  width: 80px;
  height: 80px;
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.workshop {
  width: 100px;
  height: 100px;
  position: absolute;
  top: 80%;
  left: 16.66%;
  transform: translate(-50%, -50%);
}

.office {
  width: 100px;
  height: 100px;
  position: absolute;
  top: 60%;
  left: 66.66%;
  transform: translate(-50%, -50%);
}

.warehouse {
  width: 100px;
  height: 100px;
  position: absolute;
  top: 80%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Дополнительные здания */
.shop {
  width: 80px;
  height: 80px;
  position: absolute;
  top: 20%;
  left: 33.33%;
  transform: translate(-50%, -50%);
}

.market {
  width: 100px;
  height: 80px;
  position: absolute;
  top: 40%;
  left: 66.66%;
  transform: translate(-50%, -50%);
}

.atelier {
  width: 80px;
  height: 80px;
  position: absolute;
  top: 40%;
  left: 83.33%;
  transform: translate(-50%, -50%);
}

/* Общий стиль для всех изображений зданий */
.building-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
  transition: all 0.3s ease;
}

.building-image:hover {
  transform: scale(1.05);
  filter: drop-shadow(4px 4px 8px rgba(0, 0, 0, 0.4));
}


/* Микрофон с always-on display */
.microphone {
  position: absolute;
  bottom: 20px;
  left: 20px;
  width: 80px;
  height: 120px;
  cursor: pointer;
  z-index: 100;
  transition: all 0.3s ease;
}

.microphone:hover {
  transform: scale(1.05);
}

.mic-body {
  width: 100%;
  height: 100%;
  background: linear-gradient(145deg, #8b7355, #6b5b47);
  border-radius: 40px;
  padding: 8px;
  position: relative;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  border: 3px solid #f6ce90;
}

.mic-screen {
  width: 100%;
  height: 60px;
  background: #f6ce90;
  border-radius: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid #e8c078;
  margin-bottom: 8px;
}

.time-display {
  font-family: 'Orbitron', monospace;
  font-size: 16px;
  font-weight: 700;
  color: #8b4513;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.date-display {
  font-family: 'Orbitron', monospace;
  font-size: 10px;
  color: #8b4513;
  margin-top: 2px;
}


.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #cd853f;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  border: 2px solid #f6ce90;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}


/* Кнопки сбоку от настроек */
.settings-side-buttons {
  position: fixed;
  top: 50%;
  left: calc(50% + 250px + 20px); /* Позиция справа от модального окна */
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: clamp(15px, 2vw, 25px);
  z-index: 1002;
  pointer-events: auto;
}

.side-btn {
  width: clamp(50px, 6vw, 80px);
  height: clamp(50px, 6vw, 80px);
  border-radius: 50%;
  background: var(--color-bg-menu, #F4E6D1);
  border: clamp(2px, 0.3vw, 4px) solid var(--color-text, #5D4037);
  font-size: clamp(1.5rem, 2.5vw, 2.5rem);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(8px, 1.6vw, 16px) var(--shadow-medium, rgba(0, 0, 0, 0.2));
  position: relative;
  z-index: 1003;
}

.side-btn:hover {
  transform: scale(1.1);
  background: var(--color-buttons, #D4824A);
  color: white;
  box-shadow: 0 clamp(6px, 1.2vw, 12px) clamp(12px, 2.4vw, 24px) var(--shadow-dark, rgba(0, 0, 0, 0.3));
}

.hotkeys-side-btn:hover {
  background: var(--color-highlights, #81C4E7);
}

.account-side-btn:hover {
  background: var(--color-accents, #C85A54);
}

/* Адаптивность */
@media (max-width: 768px) {
  .top-hud {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .phone-panel {
    width: calc(100vw - 40px);
    left: 20px;
    right: 20px;
  }
  
  .building {
    transform: scale(0.8);
  }

  .settings-side-buttons {
    right: clamp(10px, 2vw, 20px);
    gap: clamp(10px, 1.5vw, 20px);
  }
  
  .side-btn {
    width: clamp(40px, 5vw, 60px);
    height: clamp(40px, 5vw, 60px);
    font-size: clamp(1.2rem, 2vw, 2rem);
  }
}
</style>
