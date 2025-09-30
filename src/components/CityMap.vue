<template>
  <div class="city-map">
    <!-- Мини-HUD: красивые карточки с деталями при наведении -->
    <div class="mini-hud">
      <!-- Баланс с деталями -->
      <div class="hud-card money-card" @mouseenter="showMoneyDetails = true" @mouseleave="showMoneyDetails = false">
        <div class="hud-header">
          <span class="hud-icon">💰</span>
          <span class="hud-value">₽{{ (authStore.user?.money || 0).toLocaleString() }}</span>
      </div>
        
        <!-- Детали баланса -->
        <div v-if="showMoneyDetails" class="hud-details money-details">
          <div class="details-header">
            <h3>💰 Финансы</h3>
            <button class="close-details" @click="showMoneyDetails = false">×</button>
          </div>
          <div class="details-content">
            <div class="summary-item">
              <span class="summary-label">Баланс:</span>
              <span class="summary-value">₽{{ (authStore.user?.money || 0).toLocaleString() }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Аренда (месяц):</span>
              <span class="summary-value negative">-₽{{ totalRentCost.toLocaleString() }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Доходы (день):</span>
              <span class="summary-value positive">+₽{{ dailyIncome.toLocaleString() }}</span>
    </div>

            <!-- Статистика заказов -->
            <div class="stats-section">
              <h4>📋 Заказы</h4>
              <div class="summary-item">
                <span class="summary-label">Выполнено:</span>
                <span class="summary-value">{{ company.state.stats?.ordersCompleted || 0 }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Заработано с заказов:</span>
                <span class="summary-value positive">+₽{{ (company.state.stats?.ordersEarnings || 0).toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Прогресс компании с деталями -->
      <div class="hud-card progress-card" @mouseenter="showProgressDetails = true" @mouseleave="showProgressDetails = false">
        <div class="hud-header">
          <span class="hud-icon">🏢</span>
          <span class="hud-value">{{ company.state.progress.level }} ур.</span>
        </div>
        <div class="hud-progress">
          <div class="hud-progress-bar" :style="{ width: companyProgressPct + '%' }"></div>
        </div>
        
        <!-- Детали прогресса -->
        <div v-if="showProgressDetails" class="hud-details progress-details">
          <div class="details-header">
            <h3>🏢 Компания</h3>
            <button class="close-details" @click="showProgressDetails = false">×</button>
          </div>
          <div class="details-content">
            <div class="summary-item">
              <span class="summary-label">Уровень:</span>
              <span class="summary-value">{{ company.state.progress.level }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Опыт:</span>
              <span class="summary-value">{{ company.state.progress.experience }}/{{ requiredExp }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Арендовано:</span>
              <span class="summary-value">{{ rentedCount }}/3</span>
            </div>
            
            <!-- Статистика заказов -->
            <div class="stats-section">
              <h4>📋 Заказы</h4>
              <div class="summary-item">
                <span class="summary-label">Выполнено:</span>
                <span class="summary-value">{{ company.state.stats?.ordersCompleted || 0 }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Заработано:</span>
                <span class="summary-value positive">+₽{{ (company.state.stats?.ordersEarnings || 0).toLocaleString() }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Опыт с заказов:</span>
                <span class="summary-value">+{{ company.state.stats?.ordersExperience || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

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

        <!-- Фоновое изображение карты -->
        <div class="map-background">
          <!-- Слой 1: Фоновые куски -->
          <div class="background-pieces">
            <img src="/maps/flora/фон 1.svg" alt="Фон 1" class="bg-piece bg-1" />
            <img src="/maps/flora/фон 2.svg" alt="Фон 2" class="bg-piece bg-2" />
            <img src="/maps/flora/фон3.svg" alt="Фон 3" class="bg-piece bg-3" />
            <img src="/maps/flora/фон 4.svg" alt="Фон 4" class="bg-piece bg-4" />
            <img src="/maps/flora/фон 1.svg" alt="Фон 1" class="bg-piece bg-5" />
            <img src="/maps/flora/фон 2.svg" alt="Фон 2" class="bg-piece bg-6" />
            <img src="/maps/flora/фон3.svg" alt="Фон 3" class="bg-piece bg-7" />
            <img src="/maps/flora/фон 4.svg" alt="Фон 4" class="bg-piece bg-8" />
            <img src="/maps/flora/фон 1.svg" alt="Фон 1" class="bg-piece bg-9" />
            <img src="/maps/flora/фон 2.svg" alt="Фон 2" class="bg-piece bg-10" />
            <img src="/maps/flora/фон3.svg" alt="Фон 3" class="bg-piece bg-11" />
            <img src="/maps/flora/фон 4.svg" alt="Фон 4" class="bg-piece bg-12" />
            <img src="/maps/flora/фон 1.svg" alt="Фон 1" class="bg-piece bg-13" />
            <img src="/maps/flora/фон 2.svg" alt="Фон 2" class="bg-piece bg-14" />
            <img src="/maps/flora/фон3.svg" alt="Фон 3" class="bg-piece bg-15" />
            <img src="/maps/flora/фон 4.svg" alt="Фон 4" class="bg-piece bg-16" />
          </div>

          <!-- Слой 2: Деревья -->
          <div class="trees-layer">
            <img src="/maps/flora/дерево круглое.svg" alt="Дерево" class="tree tree-1" />
            <img src="/maps/flora/деревце.svg" alt="Деревце" class="tree tree-2" />
            <img src="/maps/flora/елочка.svg" alt="Елочка" class="tree tree-3" />
            <img src="/maps/flora/ёлочка.svg" alt="Елочка" class="tree tree-4" />
            <img src="/maps/flora/маленькое дерево конус 1.svg" alt="Маленькое дерево" class="tree tree-5" />
            <img src="/maps/flora/яблоня.svg" alt="Яблоня" class="tree tree-6" />
            <img src="/maps/flora/дерево круглое.svg" alt="Дерево" class="tree tree-7" />
            <img src="/maps/flora/деревце.svg" alt="Деревце" class="tree tree-8" />
            <img src="/maps/flora/елочка.svg" alt="Елочка" class="tree tree-9" />
            <img src="/maps/flora/яблоня.svg" alt="Яблоня" class="tree tree-10" />
            <img src="/maps/flora/дерево круглое.svg" alt="Дерево" class="tree tree-11" />
            <img src="/maps/flora/деревце.svg" alt="Деревце" class="tree tree-12" />
            <img src="/maps/flora/елочка.svg" alt="Елочка" class="tree tree-13" />
            <img src="/maps/flora/ёлочка.svg" alt="Елочка" class="tree tree-14" />
            <img src="/maps/flora/маленькое дерево конус 1.svg" alt="Маленькое дерево" class="tree tree-15" />
            <img src="/maps/flora/яблоня.svg" alt="Яблоня" class="tree tree-16" />
            <img src="/maps/flora/дерево круглое.svg" alt="Дерево" class="tree tree-17" />
            <img src="/maps/flora/деревце.svg" alt="Деревце" class="tree tree-18" />
            <img src="/maps/flora/елочка.svg" alt="Елочка" class="tree tree-19" />
            <img src="/maps/flora/яблоня.svg" alt="Яблоня" class="tree tree-20" />
            <img src="/maps/flora/дерево круглое.svg" alt="Дерево" class="tree tree-21" />
            <img src="/maps/flora/деревце.svg" alt="Деревце" class="tree tree-22" />
            <img src="/maps/flora/елочка.svg" alt="Елочка" class="tree tree-23" />
            <img src="/maps/flora/ёлочка.svg" alt="Елочка" class="tree tree-24" />
            <img src="/maps/flora/маленькое дерево конус 1.svg" alt="Маленькое дерево" class="tree tree-25" />
            <img src="/maps/flora/яблоня.svg" alt="Яблоня" class="tree tree-26" />
            <!-- Деревья по краям карты -->
            <img src="/maps/flora/дерево круглое.svg" alt="Дерево" class="tree tree-27" />
            <img src="/maps/flora/елочка.svg" alt="Елочка" class="tree tree-28" />
            <img src="/maps/flora/деревце.svg" alt="Деревце" class="tree tree-29" />
            <img src="/maps/flora/ёлочка.svg" alt="Елочка" class="tree tree-30" />
            <img src="/maps/flora/яблоня.svg" alt="Яблоня" class="tree tree-31" />
            <img src="/maps/flora/дерево круглое.svg" alt="Дерево" class="tree tree-32" />
            <img src="/maps/flora/елочка.svg" alt="Елочка" class="tree tree-33" />
            <img src="/maps/flora/деревце.svg" alt="Деревце" class="tree tree-34" />
            <img src="/maps/flora/ёлочка.svg" alt="Елочка" class="tree tree-35" />
            <img src="/maps/flora/яблоня.svg" alt="Яблоня" class="tree tree-36" />
            <img src="/maps/flora/дерево круглое.svg" alt="Дерево" class="tree tree-37" />
            <img src="/maps/flora/елочка.svg" alt="Елочка" class="tree tree-38" />
            <img src="/maps/flora/деревце.svg" alt="Деревце" class="tree tree-39" />
            <img src="/maps/flora/ёлочка.svg" alt="Елочка" class="tree tree-40" />
            <img src="/maps/flora/яблоня.svg" alt="Яблоня" class="tree tree-41" />
            <img src="/maps/flora/дерево круглое.svg" alt="Дерево" class="tree tree-42" />
            <img src="/maps/flora/елочка.svg" alt="Елочка" class="tree tree-43" />
            <img src="/maps/flora/деревце.svg" alt="Деревце" class="tree tree-44" />
            <img src="/maps/flora/ёлочка.svg" alt="Елочка" class="tree tree-45" />
            <img src="/maps/flora/яблоня.svg" alt="Яблоня" class="tree tree-46" />
          </div>

          <!-- Слой 3: Кусты -->
          <div class="bushes-layer">
            <img src="/maps/flora/куст как кучка.svg" alt="Куст" class="bush bush-1" />
            <img src="/maps/flora/кустик маленький.svg" alt="Маленький кустик" class="bush bush-2" />
            <img src="/maps/flora/кустик.svg" alt="Кустик" class="bush bush-3" />
            <img src="/maps/flora/широкий кус.svg" alt="Широкий куст" class="bush bush-4" />
            <img src="/maps/flora/куст как кучка.svg" alt="Куст" class="bush bush-5" />
            <img src="/maps/flora/кустик маленький.svg" alt="Маленький кустик" class="bush bush-6" />
            <img src="/maps/flora/кустик.svg" alt="Кустик" class="bush bush-7" />
            <img src="/maps/flora/широкий кус.svg" alt="Широкий куст" class="bush bush-8" />
            <img src="/maps/flora/куст как кучка.svg" alt="Куст" class="bush bush-9" />
            <img src="/maps/flora/кустик.svg" alt="Кустик" class="bush bush-10" />
            <img src="/maps/flora/куст как кучка.svg" alt="Куст" class="bush bush-11" />
            <img src="/maps/flora/кустик маленький.svg" alt="Маленький кустик" class="bush bush-12" />
            <img src="/maps/flora/кустик.svg" alt="Кустик" class="bush bush-13" />
            <img src="/maps/flora/широкий кус.svg" alt="Широкий куст" class="bush bush-14" />
            <img src="/maps/flora/куст как кучка.svg" alt="Куст" class="bush bush-15" />
            <img src="/maps/flora/кустик маленький.svg" alt="Маленький кустик" class="bush bush-16" />
            <img src="/maps/flora/кустик.svg" alt="Кустик" class="bush bush-17" />
            <img src="/maps/flora/широкий кус.svg" alt="Широкий куст" class="bush bush-18" />
            <img src="/maps/flora/куст как кучка.svg" alt="Куст" class="bush bush-19" />
            <img src="/maps/flora/кустик.svg" alt="Кустик" class="bush bush-20" />
            <img src="/maps/flora/куст как кучка.svg" alt="Куст" class="bush bush-21" />
            <img src="/maps/flora/кустик маленький.svg" alt="Маленький кустик" class="bush bush-22" />
            <img src="/maps/flora/кустик.svg" alt="Кустик" class="bush bush-23" />
            <img src="/maps/flora/широкий кус.svg" alt="Широкий куст" class="bush bush-24" />
            <!-- Дополнительные кусты для плотности -->
            <img src="/maps/flora/куст как кучка.svg" alt="Куст" class="bush bush-25" />
            <img src="/maps/flora/кустик маленький.svg" alt="Маленький кустик" class="bush bush-26" />
            <img src="/maps/flora/кустик.svg" alt="Кустик" class="bush bush-27" />
            <img src="/maps/flora/широкий кус.svg" alt="Широкий куст" class="bush bush-28" />
            <img src="/maps/flora/куст как кучка.svg" alt="Куст" class="bush bush-29" />
            <img src="/maps/flora/кустик маленький.svg" alt="Маленький кустик" class="bush bush-30" />
            <img src="/maps/flora/кустик.svg" alt="Кустик" class="bush bush-31" />
            <img src="/maps/flora/широкий кус.svg" alt="Широкий куст" class="bush bush-32" />
            <img src="/maps/flora/куст как кучка.svg" alt="Куст" class="bush bush-33" />
            <img src="/maps/flora/кустик.svg" alt="Кустик" class="bush bush-34" />
            <img src="/maps/flora/кустик маленький.svg" alt="Маленький кустик" class="bush bush-35" />
            <img src="/maps/flora/широкий кус.svg" alt="Широкий куст" class="bush bush-36" />
            <img src="/maps/flora/куст как кучка.svg" alt="Куст" class="bush bush-37" />
            <img src="/maps/flora/кустик.svg" alt="Кустик" class="bush bush-38" />
          </div>

          <!-- Слой 4: Цветы -->
          <div class="flowers-layer">
            <img src="/maps/flora/flower.svg" alt="Цветок" class="flower flower-1" />
            <img src="/maps/flora/flowers_2.svg" alt="Цветы" class="flower flower-2" />
            <img src="/maps/flora/flower.svg" alt="Цветок" class="flower flower-3" />
            <img src="/maps/flora/flowers_2.svg" alt="Цветы" class="flower flower-4" />
            <img src="/maps/flora/flower.svg" alt="Цветок" class="flower flower-5" />
            <img src="/maps/flora/flowers_2.svg" alt="Цветы" class="flower flower-6" />
            <img src="/maps/flora/flower.svg" alt="Цветок" class="flower flower-7" />
            <img src="/maps/flora/flowers_2.svg" alt="Цветы" class="flower flower-8" />
            <img src="/maps/flora/flower.svg" alt="Цветок" class="flower flower-9" />
            <img src="/maps/flora/flowers_2.svg" alt="Цветы" class="flower flower-10" />
            <img src="/maps/flora/flower.svg" alt="Цветок" class="flower flower-11" />
            <img src="/maps/flora/flowers_2.svg" alt="Цветы" class="flower flower-12" />
            <img src="/maps/flora/flower.svg" alt="Цветок" class="flower flower-13" />
            <img src="/maps/flora/flowers_2.svg" alt="Цветы" class="flower flower-14" />
            <img src="/maps/flora/flower.svg" alt="Цветок" class="flower flower-15" />
            <img src="/maps/flora/flowers_2.svg" alt="Цветы" class="flower flower-16" />
            <img src="/maps/flora/flower.svg" alt="Цветок" class="flower flower-17" />
            <img src="/maps/flora/flowers_2.svg" alt="Цветы" class="flower flower-18" />
            <img src="/maps/flora/flower.svg" alt="Цветок" class="flower flower-19" />
            <img src="/maps/flora/flowers_2.svg" alt="Цветы" class="flower flower-20" />
            <!-- Дополнительные цветы для плотности -->
            <img src="/maps/flora/flower.svg" alt="Цветок" class="flower flower-21" />
            <img src="/maps/flora/flowers_2.svg" alt="Цветы" class="flower flower-22" />
            <img src="/maps/flora/flower.svg" alt="Цветок" class="flower flower-23" />
            <img src="/maps/flora/flowers_2.svg" alt="Цветы" class="flower flower-24" />
            <img src="/maps/flora/flower.svg" alt="Цветок" class="flower flower-25" />
            <img src="/maps/flora/flowers_2.svg" alt="Цветы" class="flower flower-26" />
            <img src="/maps/flora/flower.svg" alt="Цветок" class="flower flower-27" />
            <img src="/maps/flora/flowers_2.svg" alt="Цветы" class="flower flower-28" />
            <img src="/maps/flora/flower.svg" alt="Цветок" class="flower flower-29" />
            <img src="/maps/flora/flowers_2.svg" alt="Цветы" class="flower flower-30" />
            <img src="/maps/flora/flower.svg" alt="Цветок" class="flower flower-31" />
            <img src="/maps/flora/flowers_2.svg" alt="Цветы" class="flower flower-32" />
            <img src="/maps/flora/flower.svg" alt="Цветок" class="flower flower-33" />
            <img src="/maps/flora/flowers_2.svg" alt="Цветы" class="flower flower-34" />
            <img src="/maps/flora/flower.svg" alt="Цветок" class="flower flower-35" />
            <img src="/maps/flora/flowers_2.svg" alt="Цветы" class="flower flower-36" />
          </div>
        </div>

        <!-- Маркер гуся (текущая позиция игрока) -->
        <img v-if="gooseMarker"
             class="goose-marker"
             :src="gooseImage"
             alt="Гусь"
             :style="gooseStyle" />

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

         <!-- Соединительные элементы для плавных стыков -->
         <div class="road-junction junction-2"></div>
         <div class="road-junction junction-3"></div>
         <div class="road-junction junction-4"></div>
         <div class="road-junction junction-7"></div>
         <div class="road-junction junction-9"></div>
         <div class="road-junction junction-11"></div>
         <div class="road-junction junction-12"></div>
         <div class="road-junction junction-13"></div>
         <div class="road-junction junction-14"></div>
         <div class="road-junction junction-16"></div>
         <div class="road-junction junction-17"></div>
         <div class="road-junction junction-18"></div>
         <div class="road-junction junction-19"></div>
       </div>

       <!-- Здания на доступных точках пересечения -->
      <div class="buildings">
         <!-- Точка 1 - Банк -->
        <div class="building bank" @click="openBank">
           <img src="/maps/банк.svg" alt="Банк" class="building-image" />
           <div class="building-label">Банк</div>
        </div>

         <!-- Точка 2 - Торговый центр -->
        <div class="building mall" @click="openMall">
           <img src="/maps/тц стиль.svg" alt="Торговый центр" class="building-image" />
           <div class="building-label">Торговый центр</div>
        </div>

         <!-- Точка 3 - Администрация -->
        <div class="building government" @click="openGovernment">
           <img src="/maps/администрация.svg" alt="Администрация" class="building-image" />
           <div class="building-label">Администрация</div>
        </div>

         <!-- Точка 4 - Жилой дом 1 -->
        <div class="building house-1" @click="openHouse">
           <img src="/maps/дом1.svg" alt="Дом" class="building-image" />
           <div class="building-label">Жилой дом</div>
        </div>

         <!-- Точка 5 - Жилой дом 2 -->
         <div class="building house-2" @click="openHouse">
           <img src="/maps/дом2.svg" alt="Дом" class="building-image" />
           <div class="building-label">Многоквартирный дом</div>
        </div>

         <!-- Точка 6 - Жилой дом 3 -->
         <div class="building house-3" @click="openHouse">
           <img src="/maps/дом3.svg" alt="Дом" class="building-image" />
           <div class="building-label">Частный дом</div>
        </div>

         <!-- Точка 7 - Производственный цех -->
        <div class="building workshop" @click="openWorkshop">
           <img src="/maps/фабрика.svg" alt="Производственный цех" class="building-image" />
           <div class="building-label">Производственный цех</div>
        </div>

         <!-- Точка 8 - Офисное здание -->
        <div class="building office" @click="openOffice">
           <img src="/maps/офис.svg" alt="Офисное здание" class="building-image" />
           <div class="building-label">Офисное здание</div>
        </div>

         <!-- Точка 9 - Склад -->
        <div class="building warehouse" @click="openWarehouse">
           <img src="/maps/склад.svg" alt="Склад" class="building-image" />
           <div class="building-label">Склад</div>
        </div>

         <!-- Дополнительные здания на свободных точках -->
        <!-- Магазин -->
        <div class="building shop" @click="openShop">
           <img src="/maps/магазин.svg" alt="Магазин" class="building-image" />
           <div class="building-label">Магазин</div>
        </div>

        <!-- Рынок -->
        <div class="building market" @click="openMarket">
           <img src="/maps/рынок.svg" alt="Рынок" class="building-image" />
           <div class="building-label">Рынок</div>
        </div>

        <!-- Ателье -->
        <div class="building atelier" @click="openAtelier">
           <img src="/maps/ателье модный дом.svg" alt="Ателье" class="building-image" />
           <div class="building-label">Ателье</div>
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

    <!-- Компактная панель управления временем -->
    <div class="time-controls-strip">
      <TimeControls />
    </div>

    <!-- Кнопка настроек -->
    <button class="settings-btn" @click="openSettings" title="Настройки">
      <img src="/main-menu/шестерня.svg" alt="Настройки" class="settings-icon">
    </button>

    <!-- Кнопка отладки сетки (временно) -->
    <button class="debug-btn" @click="showDebugGrid = !showDebugGrid" title="Показать/скрыть сетку">
      🔧
      </button>

    

    <!-- Модальное окно настроек -->
    <SettingsModal 
      v-if="showSettings"
      :show-exit-button="true"
      @close="closeSettings"
      @exit-to-main-menu="exitToMainMenu"
      @open-hotkeys="openHotkeys"
      @open-account="openAccount"
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
      :show="showWarehouse"
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
    
    <!-- Модальное окно магазина -->
    <ShopModal 
      v-if="showShop"
      @close="closeShop"
    />
    
    <!-- Комната дома гуся -->
    <HomeRoom v-if="showHome" @close="() => (showHome = false)" />

    <!-- Кастомная модалка аренды -->
    <div v-if="rentDialog?.visible" class="rent-modal-overlay" @click.self="cancelRentDialog">
      <div class="rent-modal">
        <div class="rent-header">
          <h3>{{ rentDialog.title }}</h3>
          <button class="close" @click="cancelRentDialog">✕</button>
        </div>
        <div class="rent-body">
          <p>{{ rentDialog.description }}</p>
          <div class="price">Цена аренды: ₽{{ rentDialog.price.toLocaleString() }}</div>
        </div>
        <div class="rent-actions">
          <button class="btn" @click="cancelRentDialog">Отмена</button>
          <button class="btn primary" @click="confirmRent">Арендовать</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useCompanyStore } from '@/stores/companyStore'
import { useCharacterStore } from '@/stores/characterStore'
import { useTraderStore } from '@/stores/traderStore'
import { useAtelierStore } from '@/stores/atelierStore'
import SettingsModal from './SettingsModal.vue'
import HotkeysModal from './HotkeysModal.vue'
import AccountModal from './AccountModal.vue'
import WarehouseModal from './WarehouseModal.vue'
import AtelierModal from './AtelierModal.vue'
import MarketModal from './MarketModal.vue'
import ShopModal from './ShopModal.vue'
import PhoneInterface from './PhoneInterface.vue'
import TimeControls from './TimeControls.vue'
import HomeRoom from './HomeRoom.vue'

const emit = defineEmits<{
  exitToMainMenu: []
}>()

// Инициализация auth store
const authStore = useAuthStore()

// Состояние модальных окон
const showSettings = ref(false)
const showHotkeys = ref(false)
const showAccount = ref(false)
const showWarehouse = ref(false)
const showAtelier = ref(false)
const showMarket = ref(false)
const showShop = ref(false)
const showHome = ref(false)
const company = useCompanyStore()
const traderStore = useTraderStore()
const atelierStore = useAtelierStore()

// Состояние деталей
const showMoneyDetails = ref(false)
const showProgressDetails = ref(false)

// Прогресс в процентах
const companyProgressPct = computed(() => {
  const lvl = company.state.progress.level
  const exp = company.state.progress.experience
  const required = 100 + (lvl - 1) * 50
  return Math.max(0, Math.min(100, Math.round((exp / required) * 100)))
})

// Требуемый опыт для следующего уровня
const requiredExp = computed(() => {
  const lvl = company.state.progress.level
  return 100 + (lvl - 1) * 50
})

// Количество арендованных зданий
const rentedCount = computed(() => {
  const rent = company.state.rent.isRented
  return Object.values(rent).filter(Boolean).length
})

// Общая стоимость аренды в месяц
const totalRentCost = computed(() => {
  const rent = company.state.rent.isRented
  const costs = company.state.rent.rentCosts
  let total = 0
  if (rent.warehouse) total += costs.warehouse
  if (rent.atelier) total += costs.atelier
  if (rent.market) total += costs.market
  return total
})

// Дневной доход (пока заглушка, позже из экономики)
const dailyIncome = computed(() => {
  // Пока возвращаем 0, позже подключим реальную экономику
  return 0
})

// Кастомная модалка аренды
const rentDialog = ref<{ place: 'warehouse'|'atelier'|'market'; title: string; description: string; price: number; visible: boolean }|null>(null)
async function confirmRent() {
  if (!rentDialog.value) return
  const place = rentDialog.value.place
  const ok = await company.rent(place)
  // после успешной аренды открываем соответствующее окно
  if (ok) {
    if (place === 'warehouse' && company.canUseWarehouse()) {
      showWarehouse.value = true
    } else if (place === 'atelier' && company.canUseAtelier()) {
      // Арендуем ателье через atelierStore
      await atelierStore.rentAtelier()
      await atelierStore.loadAtelierState()
      showAtelier.value = true
    } else if (place === 'market' && company.canUseMarket()) {
      showMarket.value = true
    }
    rentDialog.value = null
  } else {
    // Недостаточно средств — оставляем диалог открытым и показываем цену красным
    rentDialog.value = { ...rentDialog.value, visible: true }
    // TODO: заменить на тост/уведомление внутри UI
  }
}
function cancelRentDialog() { rentDialog.value = null }

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

// Позиция гуся на карте — синхронизируем с companyStore.location.currentPointId
const companyStore = useCompanyStore()
const characterStore = useCharacterStore()
const gooseMarker = ref(true)
const gooseStyle = computed(() => {
  const point = allGridIntersections.value.find(p => p.number === companyStore.state.location.currentPointId)
  if (!point) return { display: 'none' }
  return {
    left: (point.x + 5) + '%', // Сдвигаем вправо на 5% от центра здания
    top: (point.y + 8) + '%', // Сдвигаем вниз на 8% от центра здания
    transform: 'translate(-50%, -100%)', // Выравниваем по низу персонажа
  }
})

// Текущий арт гуся — берем из выбранного персонажа, иначе дефолтная иконка
const gooseImage = computed(() => {
  return characterStore.selectedCharacter?.image || '/main-menu/герой.svg'
})



// Теперь используем SVG файлы из папки /maps/

// Время и дата
const currentTime = ref('')
const currentDate = ref('')
let timeInterval: NodeJS.Timeout | null = null

// Телефон
const showPhone = ref(false)
const unreadMessages = ref(0)



const messages = ref([] as any[])

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
const openBank = () => {}

const openGovernment = () => {}

const openMall = () => {}

const openWorkshop = () => {}

const openWarehouse = () => {
  if (!company.canUseWarehouse()) {
    rentDialog.value = {
      place: 'warehouse',
      title: 'Аренда склада',
      description: 'Базовая емкость 20 мест. Можно апгрейдить позже.',
      price: company.state.rent.rentCosts.warehouse,
      visible: true,
    }
    return
  }
  showWarehouse.value = true
}

const openOffice = () => {}

const openAtelier = async () => {
  if (!company.canUseAtelier()) {
    // Показываем диалог аренды
    rentDialog.value = {
      place: 'atelier',
      title: 'Аренда ателье',
      description: 'Доступ к профессиональному пошиву и очередям заказов.',
      price: company.state.rent.rentCosts.atelier,
      visible: true,
    }
    return
  }
  
  // Загружаем данные ателье
  await atelierStore.loadAtelierState()
  showAtelier.value = true
}

const openMarket = () => {
  if (!company.canUseMarket()) {
    rentDialog.value = {
      place: 'market',
      title: 'Аренда места на рынке',
      description: 'Открывает продажи и аналитику спроса.',
      price: company.state.rent.rentCosts.market,
      visible: true,
    }
    return
  }
  showMarket.value = true
}

const openHouse = () => {
  showHome.value = true
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

const openShop = () => {
  showShop.value = true
}

const closeShop = () => {
  showShop.value = false
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
  background: linear-gradient(135deg, #F5E6D3 0%, #E6D3B7 50%, #D4C4A8 100%);
  overflow: hidden;
  font-family: 'Orbitron', sans-serif;
}

/* Мини-HUD - красивые карточки как в GameStats */
.mini-hud {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  flex-direction: row;
  gap: 15px;
  z-index: 1002;
  font-family: 'Orbitron', sans-serif;
}

.hud-card {
  background: var(--color-bg-menu, #F4E6D1);
  border-radius: clamp(8px, 1.2vw, 15px);
  padding: clamp(10px, 1.5vw, 15px) clamp(15px, 2vw, 20px);
  border: clamp(2px, 0.3vw, 3px) solid var(--color-text, #5D4037);
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(8px, 1.6vw, 16px) var(--shadow-medium, rgba(0,0,0,0.2));
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  min-width: clamp(120px, 15vw, 180px);
  backdrop-filter: blur(5px);
}

.hud-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 clamp(6px, 1.2vw, 12px) clamp(10px, 2vw, 20px) var(--shadow-dark, rgba(0,0,0,0.3));
}

.hud-header {
  display: flex;
  align-items: center;
  gap: clamp(8px, 1.2vw, 12px);
  font-weight: 700;
  color: var(--color-text, #5D4037);
}

.hud-icon {
  font-size: clamp(1.5rem, 3vw, 2rem);
  filter: drop-shadow(0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-medium, rgba(0,0,0,0.2)));
}

.hud-value {
  font-size: clamp(1rem, 2vw, 1.4rem);
  font-weight: 900;
  margin-left: auto;
  text-shadow: 1px 1px 0px var(--shadow-light, rgba(255,255,255,0.5));
  color: var(--color-text, #5D4037);
}

.hud-progress {
  margin-top: clamp(6px, 1vw, 10px);
  height: clamp(8px, 1.2vw, 12px);
  background: var(--color-bg-menu-light, #e7d7bd);
  border: clamp(1px, 0.2vw, 2px) solid var(--color-text, #5D4037);
  border-radius: clamp(6px, 1vw, 10px);
  overflow: hidden;
}

.hud-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #C85A54, #D4824A);
  transition: width 0.3s ease;
}

/* Детальные панели */
.hud-details {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-bg-menu, #F4E6D1);
  border-radius: clamp(8px, 1.2vw, 15px);
  border: clamp(2px, 0.3vw, 3px) solid var(--color-text, #5D4037);
  box-shadow: 0 clamp(8px, 1.6vw, 16px) clamp(16px, 3.2vw, 32px) var(--shadow-dark, rgba(0,0,0,0.3));
  z-index: 1003;
  margin-top: 0;
  min-width: clamp(250px, 30vw, 350px);
  max-width: clamp(300px, 40vw, 400px);
  max-height: 60vh;
  overflow-y: auto;
}

.details-header {
  background: var(--gradient-accents, linear-gradient(135deg, #C85A54 0%, #D4824A 100%));
  color: white;
  padding: clamp(12px, 2vw, 20px);
  border-radius: clamp(8px, 1.2vw, 12px) clamp(8px, 1.2vw, 12px) 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
}

.details-header h3 {
  margin: 0;
  font-size: clamp(1rem, 1.8vw, 1.4rem);
  text-shadow: 1px 1px 0px var(--shadow-dark, rgba(0,0,0,0.3));
  font-family: 'Orbitron', sans-serif;
}

.close-details {
  background: none;
  border: none;
  color: white;
  font-size: clamp(1.2rem, 2vw, 1.8rem);
  cursor: pointer;
  padding: 0;
  width: clamp(25px, 4vw, 35px);
  height: clamp(25px, 4vw, 35px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  font-family: 'Orbitron', sans-serif;
}

.close-details:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.details-content {
  padding: clamp(15px, 2vw, 25px);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: clamp(8px, 1.2vw, 12px);
  font-size: clamp(0.8rem, 1.4vw, 1.1rem);
  font-family: 'Orbitron', sans-serif;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.stats-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 2px solid #e0e0e0;
}

.stats-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
  font-weight: 600;
}

.summary-label {
  font-weight: 600;
  color: var(--color-text, #5D4037);
  text-shadow: 1px 1px 0px var(--shadow-light, rgba(255,255,255,0.5));
}

.summary-value {
  font-weight: 700;
  font-size: clamp(0.9rem, 1.6vw, 1.2rem);
  text-shadow: 1px 1px 0px var(--shadow-light, rgba(255,255,255,0.5));
}

.summary-value.positive {
  color: #2E7D32;
}

.summary-value.negative {
  color: #C62828;
}

/* Компактная полоска управления временем */
.time-controls-strip {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1001;
  max-width: 800px;
  width: auto;
}

/* Кастомная модалка аренды */
.rent-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.rent-modal { width: 520px; background: var(--color-bg-menu-light); border: 2px solid var(--color-buttons); border-radius: 14px; box-shadow: 0 8px 16px var(--shadow-medium); overflow: hidden; }
.rent-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--color-bg-menu); border-bottom: 2px solid var(--color-buttons); }
.rent-body { padding: 16px; color: var(--color-text); }
.price { margin-top: 8px; font-weight: 700; color: var(--color-highlights); }
.rent-actions { display: flex; gap: 10px; justify-content: flex-end; padding: 12px 16px; border-top: 2px solid var(--color-buttons); background: var(--color-bg-menu); }
.btn { background: var(--color-bg-menu-light); border: 2px solid var(--color-buttons); color: var(--color-text); padding: 8px 12px; border-radius: 10px; }
.btn.primary { background: var(--color-accents); border-color: var(--color-highlights); color: #fff; }
.rent-header .close { background: var(--color-buttons); color: #fff; border: none; border-radius: 8px; padding: 6px 10px; }


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
  background: transparent;
}

.goose-marker {
  position: absolute;
  width: 140px; /* Значительно увеличиваем размер с 90px до 140px */
  height: auto;
  z-index: 45; /* Увеличиваем z-index для перекрытия здания */
  pointer-events: none;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,.25));
  animation: gentleFloat 4s ease-in-out infinite;
}

@keyframes gentleFloat {
  0%, 100% { transform: translate(-50%, -100%) }
  50% { transform: translate(-50%, -105%) }
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
  background: #7e8f47; /* Травяной зеленый цвет - нижний слой */
  z-index: 0;
  overflow: hidden;
}

/* Слой 1: Фоновые куски */
.background-pieces {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.bg-piece {
  position: absolute;
  opacity: 0.8;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.2));
}

.bg-1 {
  top: 10%;
  left: 5%;
  width: 1000px;
  height: 750px;
  transform: rotate(-5deg);
}

.bg-2 {
  top: 30%;
  right: 10%;
  width: 900px;
  height: 600px;
  transform: rotate(3deg);
}

.bg-3 {
  bottom: 20%;
  left: 15%;
  width: 800px;
  height: 700px;
  transform: rotate(-2deg);
}

.bg-4 {
  top: 60%;
  right: 20%;
  width: 950px;
  height: 650px;
  transform: rotate(4deg);
}

.bg-5 {
  top: 45%;
  left: 50%;
  width: 850px;
  height: 550px;
  transform: rotate(-3deg);
}

.bg-6 {
  bottom: 10%;
  right: 5%;
  width: 750px;
  height: 800px;
  transform: rotate(2deg);
}

.bg-7 {
  top: 15%;
  left: 25%;
  width: 900px;
  height: 700px;
  transform: rotate(-4deg);
}

.bg-8 {
  top: 55%;
  right: 35%;
  width: 800px;
  height: 600px;
  transform: rotate(3deg);
}

.bg-9 {
  bottom: 35%;
  left: 8%;
  width: 950px;
  height: 750px;
  transform: rotate(-1deg);
}

.bg-10 {
  top: 75%;
  right: 15%;
  width: 850px;
  height: 650px;
  transform: rotate(2deg);
}

.bg-11 {
  top: 40%;
  left: 35%;
  width: 700px;
  height: 550px;
  transform: rotate(-3deg);
}

.bg-12 {
  bottom: 5%;
  left: 30%;
  width: 1000px;
  height: 850px;
  transform: rotate(1deg);
}

.bg-13 {
  top: 5%;
  right: 30%;
  width: 800px;
  height: 625px;
  transform: rotate(-2deg);
}

.bg-14 {
  top: 65%;
  left: 40%;
  width: 750px;
  height: 700px;
  transform: rotate(4deg);
}

.bg-15 {
  bottom: 25%;
  right: 40%;
  width: 900px;
  height: 675px;
  transform: rotate(-1deg);
}

.bg-16 {
  top: 25%;
  left: 60%;
  width: 650px;
  height: 500px;
  transform: rotate(2deg);
}

/* Слой 2: Деревья */
.trees-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.tree {
  position: absolute;
  filter: drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.3));
}

.tree-1 {
  top: 8%;
  left: 8%;
  width: 80px;
  height: 100px;
  transform: rotate(-2deg);
}

.tree-2 {
  top: 25%;
  right: 12%;
  width: 60px;
  height: 80px;
  transform: rotate(3deg);
}

.tree-3 {
  bottom: 25%;
  left: 12%;
  width: 70px;
  height: 90px;
  transform: rotate(-1deg);
}

.tree-4 {
  top: 50%;
  right: 8%;
  width: 65px;
  height: 85px;
  transform: rotate(2deg);
}

.tree-5 {
  bottom: 15%;
  right: 25%;
  width: 55px;
  height: 70px;
  transform: rotate(-3deg);
}

.tree-6 {
  top: 35%;
  left: 25%;
  width: 75px;
  height: 95px;
  transform: rotate(1deg);
}

.tree-7 {
  top: 70%;
  left: 5%;
  width: 85px;
  height: 105px;
  transform: rotate(-2deg);
}

.tree-8 {
  top: 15%;
  left: 60%;
  width: 60px;
  height: 75px;
  transform: rotate(4deg);
}

.tree-9 {
  bottom: 40%;
  right: 15%;
  width: 70px;
  height: 90px;
  transform: rotate(-1deg);
}

.tree-10 {
  top: 80%;
  right: 30%;
  width: 80px;
  height: 100px;
  transform: rotate(2deg);
}

.tree-11 {
  top: 12%;
  left: 45%;
  width: 70px;
  height: 90px;
  transform: rotate(-1deg);
}

.tree-12 {
  top: 35%;
  right: 45%;
  width: 65px;
  height: 85px;
  transform: rotate(3deg);
}

.tree-13 {
  bottom: 35%;
  left: 35%;
  width: 75px;
  height: 95px;
  transform: rotate(-2deg);
}

.tree-14 {
  top: 60%;
  right: 25%;
  width: 60px;
  height: 80px;
  transform: rotate(1deg);
}

.tree-15 {
  bottom: 5%;
  left: 55%;
  width: 55px;
  height: 70px;
  transform: rotate(-3deg);
}

.tree-16 {
  top: 45%;
  left: 15%;
  width: 80px;
  height: 100px;
  transform: rotate(2deg);
}

.tree-17 {
  top: 85%;
  left: 25%;
  width: 70px;
  height: 90px;
  transform: rotate(-1deg);
}

.tree-18 {
  top: 20%;
  left: 80%;
  width: 60px;
  height: 75px;
  transform: rotate(4deg);
}

.tree-19 {
  bottom: 45%;
  right: 5%;
  width: 75px;
  height: 95px;
  transform: rotate(-2deg);
}

.tree-20 {
  top: 70%;
  right: 50%;
  width: 85px;
  height: 105px;
  transform: rotate(1deg);
}

.tree-21 {
  top: 5%;
  left: 35%;
  width: 65px;
  height: 85px;
  transform: rotate(-2deg);
}

.tree-22 {
  top: 50%;
  left: 5%;
  width: 70px;
  height: 90px;
  transform: rotate(3deg);
}

.tree-23 {
  bottom: 15%;
  left: 70%;
  width: 60px;
  height: 80px;
  transform: rotate(-1deg);
}

.tree-24 {
  top: 75%;
  right: 5%;
  width: 75px;
  height: 95px;
  transform: rotate(2deg);
}

.tree-25 {
  bottom: 50%;
  right: 60%;
  width: 55px;
  height: 70px;
  transform: rotate(-3deg);
}

.tree-26 {
  top: 30%;
  left: 70%;
  width: 80px;
  height: 100px;
  transform: rotate(1deg);
}

/* Деревья по краям карты */
.tree-27 {
  top: 2%;
  left: 2%;
  width: 70px;
  height: 90px;
  transform: rotate(-2deg);
}

.tree-28 {
  top: 2%;
  left: 8%;
  width: 60px;
  height: 80px;
  transform: rotate(3deg);
}

.tree-29 {
  top: 2%;
  left: 15%;
  width: 65px;
  height: 85px;
  transform: rotate(-1deg);
}

.tree-30 {
  top: 2%;
  left: 22%;
  width: 55px;
  height: 75px;
  transform: rotate(2deg);
}

.tree-31 {
  top: 2%;
  left: 28%;
  width: 75px;
  height: 95px;
  transform: rotate(-3deg);
}

.tree-32 {
  top: 2%;
  right: 2%;
  width: 70px;
  height: 90px;
  transform: rotate(2deg);
}

.tree-33 {
  top: 2%;
  right: 8%;
  width: 60px;
  height: 80px;
  transform: rotate(-2deg);
}

.tree-34 {
  top: 2%;
  right: 15%;
  width: 65px;
  height: 85px;
  transform: rotate(1deg);
}

.tree-35 {
  top: 2%;
  right: 22%;
  width: 55px;
  height: 75px;
  transform: rotate(-1deg);
}

.tree-36 {
  top: 2%;
  right: 28%;
  width: 75px;
  height: 95px;
  transform: rotate(3deg);
}

.tree-37 {
  bottom: 2%;
  left: 2%;
  width: 70px;
  height: 90px;
  transform: rotate(-2deg);
}

.tree-38 {
  bottom: 2%;
  left: 8%;
  width: 60px;
  height: 80px;
  transform: rotate(3deg);
}

.tree-39 {
  bottom: 2%;
  left: 15%;
  width: 65px;
  height: 85px;
  transform: rotate(-1deg);
}

.tree-40 {
  bottom: 2%;
  left: 22%;
  width: 55px;
  height: 75px;
  transform: rotate(2deg);
}

.tree-41 {
  bottom: 2%;
  left: 28%;
  width: 75px;
  height: 95px;
  transform: rotate(-3deg);
}

.tree-42 {
  bottom: 2%;
  right: 2%;
  width: 70px;
  height: 90px;
  transform: rotate(2deg);
}

.tree-43 {
  bottom: 2%;
  right: 8%;
  width: 60px;
  height: 80px;
  transform: rotate(-2deg);
}

.tree-44 {
  bottom: 2%;
  right: 15%;
  width: 65px;
  height: 85px;
  transform: rotate(1deg);
}

.tree-45 {
  bottom: 2%;
  right: 22%;
  width: 55px;
  height: 75px;
  transform: rotate(-1deg);
}

.tree-46 {
  bottom: 2%;
  right: 28%;
  width: 75px;
  height: 95px;
  transform: rotate(3deg);
}

/* Слой 3: Кусты */
.bushes-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 3;
  pointer-events: none;
}

.bush {
  position: absolute;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.2));
}

.bush-1 {
  top: 20%;
  left: 15%;
  width: 40px;
  height: 35px;
  transform: rotate(-1deg);
}

.bush-2 {
  top: 40%;
  right: 20%;
  width: 25px;
  height: 20px;
  transform: rotate(2deg);
}

.bush-3 {
  bottom: 30%;
  left: 20%;
  width: 35px;
  height: 30px;
  transform: rotate(-2deg);
}

.bush-4 {
  top: 65%;
  right: 10%;
  width: 50px;
  height: 40px;
  transform: rotate(1deg);
}

.bush-5 {
  top: 10%;
  left: 70%;
  width: 30px;
  height: 25px;
  transform: rotate(3deg);
}

.bush-6 {
  bottom: 50%;
  right: 35%;
  width: 25px;
  height: 20px;
  transform: rotate(-1deg);
}

.bush-7 {
  top: 55%;
  left: 8%;
  width: 40px;
  height: 35px;
  transform: rotate(2deg);
}

.bush-8 {
  bottom: 10%;
  left: 40%;
  width: 45px;
  height: 38px;
  transform: rotate(-2deg);
}

.bush-9 {
  top: 30%;
  left: 45%;
  width: 35px;
  height: 30px;
  transform: rotate(1deg);
}

.bush-10 {
  bottom: 60%;
  right: 5%;
  width: 30px;
  height: 25px;
  transform: rotate(-1deg);
}

.bush-11 {
  top: 25%;
  left: 25%;
  width: 35px;
  height: 30px;
  transform: rotate(2deg);
}

.bush-12 {
  top: 45%;
  right: 30%;
  width: 25px;
  height: 20px;
  transform: rotate(-1deg);
}

.bush-13 {
  bottom: 25%;
  left: 30%;
  width: 40px;
  height: 35px;
  transform: rotate(1deg);
}

.bush-14 {
  top: 70%;
  right: 20%;
  width: 45px;
  height: 38px;
  transform: rotate(-2deg);
}

.bush-15 {
  top: 15%;
  left: 75%;
  width: 30px;
  height: 25px;
  transform: rotate(3deg);
}

.bush-16 {
  bottom: 45%;
  right: 40%;
  width: 25px;
  height: 20px;
  transform: rotate(-1deg);
}

.bush-17 {
  top: 60%;
  left: 12%;
  width: 35px;
  height: 30px;
  transform: rotate(2deg);
}

.bush-18 {
  bottom: 5%;
  left: 50%;
  width: 40px;
  height: 35px;
  transform: rotate(-2deg);
}

.bush-19 {
  top: 35%;
  left: 50%;
  width: 30px;
  height: 25px;
  transform: rotate(1deg);
}

.bush-20 {
  bottom: 55%;
  right: 10%;
  width: 35px;
  height: 30px;
  transform: rotate(-1deg);
}

.bush-21 {
  top: 80%;
  left: 35%;
  width: 40px;
  height: 35px;
  transform: rotate(2deg);
}

.bush-22 {
  top: 5%;
  left: 85%;
  width: 25px;
  height: 20px;
  transform: rotate(-1deg);
}

.bush-23 {
  bottom: 20%;
  left: 60%;
  width: 30px;
  height: 25px;
  transform: rotate(1deg);
}

.bush-24 {
  top: 85%;
  right: 15%;
  width: 45px;
  height: 38px;
  transform: rotate(-2deg);
}

.bush-25 {
  top: 12%;
  left: 18%;
  width: 35px;
  height: 30px;
  transform: rotate(2deg);
}

.bush-26 {
  top: 38%;
  right: 25%;
  width: 25px;
  height: 20px;
  transform: rotate(-1deg);
}

.bush-27 {
  bottom: 18%;
  left: 25%;
  width: 40px;
  height: 35px;
  transform: rotate(1deg);
}

.bush-28 {
  top: 72%;
  right: 18%;
  width: 45px;
  height: 38px;
  transform: rotate(-2deg);
}

.bush-29 {
  top: 8%;
  left: 68%;
  width: 30px;
  height: 25px;
  transform: rotate(3deg);
}

.bush-30 {
  bottom: 38%;
  right: 35%;
  width: 25px;
  height: 20px;
  transform: rotate(-1deg);
}

.bush-31 {
  top: 58%;
  left: 15%;
  width: 35px;
  height: 30px;
  transform: rotate(2deg);
}

.bush-32 {
  bottom: 8%;
  left: 45%;
  width: 40px;
  height: 35px;
  transform: rotate(-2deg);
}

.bush-33 {
  top: 28%;
  left: 48%;
  width: 30px;
  height: 25px;
  transform: rotate(1deg);
}

.bush-34 {
  bottom: 52%;
  right: 12%;
  width: 35px;
  height: 30px;
  transform: rotate(-1deg);
}

.bush-35 {
  top: 82%;
  left: 38%;
  width: 25px;
  height: 20px;
  transform: rotate(2deg);
}

.bush-36 {
  top: 88%;
  right: 22%;
  width: 45px;
  height: 38px;
  transform: rotate(-2deg);
}

.bush-37 {
  top: 42%;
  left: 8%;
  width: 40px;
  height: 35px;
  transform: rotate(1deg);
}

.bush-38 {
  bottom: 22%;
  left: 65%;
  width: 30px;
  height: 25px;
  transform: rotate(-1deg);
}

/* Слой 4: Цветы */
.flowers-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 4;
  pointer-events: none;
}

.flower {
  position: absolute;
  opacity: 0.8;
  animation: float 6s ease-in-out infinite;
  filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.1));
}

.flower-1 {
  top: 15%;
  left: 10%;
  width: 30px;
  height: 30px;
  animation-delay: 0s;
}

.flower-2 {
  top: 25%;
  right: 15%;
  width: 35px;
  height: 35px;
  animation-delay: 2s;
}

.flower-3 {
  bottom: 30%;
  left: 20%;
  width: 25px;
  height: 25px;
  animation-delay: 4s;
}

.flower-4 {
  bottom: 20%;
  right: 25%;
  width: 30px;
  height: 30px;
  animation-delay: 1s;
}

.flower-5 {
  top: 45%;
  left: 5%;
  width: 28px;
  height: 28px;
  animation-delay: 3s;
}

.flower-6 {
  top: 65%;
  right: 8%;
  width: 32px;
  height: 32px;
  animation-delay: 5s;
}

.flower-7 {
  top: 35%;
  left: 60%;
  width: 26px;
  height: 26px;
  animation-delay: 1.5s;
}

.flower-8 {
  bottom: 45%;
  right: 40%;
  width: 29px;
  height: 29px;
  animation-delay: 3.5s;
}

.flower-9 {
  top: 20%;
  left: 30%;
  width: 27px;
  height: 27px;
  animation-delay: 2.5s;
}

.flower-10 {
  top: 55%;
  right: 25%;
  width: 31px;
  height: 31px;
  animation-delay: 4.5s;
}

.flower-11 {
  bottom: 40%;
  left: 10%;
  width: 26px;
  height: 26px;
  animation-delay: 1.2s;
}

.flower-12 {
  top: 80%;
  right: 35%;
  width: 28px;
  height: 28px;
  animation-delay: 3.8s;
}

.flower-13 {
  top: 10%;
  left: 60%;
  width: 30px;
  height: 30px;
  animation-delay: 2.8s;
}

.flower-14 {
  bottom: 30%;
  right: 15%;
  width: 25px;
  height: 25px;
  animation-delay: 4.2s;
}

.flower-15 {
  top: 40%;
  left: 40%;
  width: 32px;
  height: 32px;
  animation-delay: 1.8s;
}

.flower-16 {
  bottom: 10%;
  left: 45%;
  width: 27px;
  height: 27px;
  animation-delay: 3.2s;
}

.flower-17 {
  top: 65%;
  left: 20%;
  width: 29px;
  height: 29px;
  animation-delay: 2.2s;
}

.flower-18 {
  bottom: 60%;
  right: 45%;
  width: 26px;
  height: 26px;
  animation-delay: 4.8s;
}

.flower-19 {
  top: 30%;
  right: 5%;
  width: 31px;
  height: 31px;
  animation-delay: 1.5s;
}

.flower-20 {
  bottom: 5%;
  right: 30%;
  width: 28px;
  height: 28px;
  animation-delay: 3.5s;
}

.flower-21 {
  top: 18%;
  left: 35%;
  width: 26px;
  height: 26px;
  animation-delay: 2.3s;
}

.flower-22 {
  top: 48%;
  right: 28%;
  width: 30px;
  height: 30px;
  animation-delay: 4.3s;
}

.flower-23 {
  bottom: 38%;
  left: 12%;
  width: 25px;
  height: 25px;
  animation-delay: 1.7s;
}

.flower-24 {
  top: 78%;
  right: 18%;
  width: 27px;
  height: 27px;
  animation-delay: 3.7s;
}

.flower-25 {
  top: 6%;
  left: 65%;
  width: 29px;
  height: 29px;
  animation-delay: 2.9s;
}

.flower-26 {
  bottom: 32%;
  right: 38%;
  width: 24px;
  height: 24px;
  animation-delay: 4.1s;
}

.flower-27 {
  top: 62%;
  left: 18%;
  width: 28px;
  height: 28px;
  animation-delay: 1.9s;
}

.flower-28 {
  bottom: 12%;
  left: 48%;
  width: 31px;
  height: 31px;
  animation-delay: 3.3s;
}

.flower-29 {
  top: 32%;
  left: 52%;
  width: 26px;
  height: 26px;
  animation-delay: 2.1s;
}

.flower-30 {
  bottom: 48%;
  right: 15%;
  width: 29px;
  height: 29px;
  animation-delay: 4.5s;
}

.flower-31 {
  top: 85%;
  left: 42%;
  width: 25px;
  height: 25px;
  animation-delay: 2.7s;
}

.flower-32 {
  top: 92%;
  right: 25%;
  width: 30px;
  height: 30px;
  animation-delay: 3.9s;
}

.flower-33 {
  top: 38%;
  left: 12%;
  width: 27px;
  height: 27px;
  animation-delay: 1.3s;
}

.flower-34 {
  bottom: 18%;
  left: 68%;
  width: 26px;
  height: 26px;
  animation-delay: 3.1s;
}

.flower-35 {
  top: 52%;
  left: 25%;
  width: 28px;
  height: 28px;
  animation-delay: 2.5s;
}

.flower-36 {
  bottom: 8%;
  right: 35%;
  width: 29px;
  height: 29px;
  animation-delay: 4.7s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-8px) rotate(3deg);
  }
}

/* Система дорог */
.roads-network {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 3;
  pointer-events: none;
}

.road {
  position: absolute;
  background: linear-gradient(135deg, #E6D3B7 0%, #D2B48C 25%, #DEB887 50%, #F4A460 75%, #D2B48C 100%);
  border: none;
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.3),
    inset 0 -2px 4px rgba(0, 0, 0, 0.2);
  border-radius: 0px;
}

/* Основная замкнутая дорога */
.road-2-to-3 {
  /* От точки 2 (33.33%, 20%) до точки 3 (50%, 20%) */
  top: 20%;
  left: 33.33%;
  width: 16.67%;
  height: 24px;
  transform: translateY(-12px);
}

.road-3-to-4 {
  /* От точки 3 (50%, 20%) до точки 4 (66.66%, 20%) */
  top: 20%;
  left: 50%;
  width: 16.66%;
  height: 24px;
  transform: translateY(-12px);
}

.road-4-to-9 {
  /* От точки 4 (66.66%, 20%) до точки 9 (66.66%, 40%) */
  top: 20%;
  left: 66.66%;
  width: 24px;
  height: 20%;
  transform: translateX(-12px);
}

.road-9-to-14 {
  /* От точки 9 (66.66%, 40%) до точки 14 (66.66%, 60%) */
  top: 40%;
  left: 66.66%;
  width: 24px;
  height: 20%;
  transform: translateX(-12px);
}

.road-14-to-13 {
  /* От точки 14 (66.66%, 60%) до точки 13 (50%, 60%) */
  top: 60%;
  left: 50%;
  width: 16.66%;
  height: 24px;
  transform: translateY(-12px);
}

.road-13-to-18 {
  /* От точки 13 (50%, 60%) до точки 18 (50%, 80%) */
  top: 60%;
  left: 50%;
  width: 24px;
  height: 20%;
  transform: translateX(-12px);
}

.road-18-to-17 {
  /* От точки 18 (50%, 80%) до точки 17 (33.33%, 80%) */
  top: 80%;
  left: 33.33%;
  width: 16.67%;
  height: 24px;
  transform: translateY(-12px);
}

.road-17-to-16 {
  /* От точки 17 (33.33%, 80%) до точки 16 (16.66%, 80%) */
  top: 80%;
  left: 16.66%;
  width: 16.67%;
  height: 24px;
  transform: translateY(-12px);
}

.road-16-to-11 {
  /* От точки 16 (16.66%, 80%) до точки 11 (16.66%, 60%) */
  top: 60%;
  left: 16.66%;
  width: 24px;
  height: 20%;
  transform: translateX(-12px);
}

.road-11-to-12 {
  /* От точки 11 (16.66%, 60%) до точки 12 (33.33%, 60%) */
  top: 60%;
  left: 16.66%;
  width: 16.67%;
  height: 24px;
  transform: translateY(-12px);
}

.road-12-to-7 {
  /* От точки 12 (33.33%, 60%) до точки 7 (33.33%, 40%) */
  top: 40%;
  left: 33.33%;
  width: 24px;
  height: 20%;
  transform: translateX(-12px);
}

.road-7-to-2 {
  /* От точки 7 (33.33%, 40%) до точки 2 (33.33%, 20%) */
  top: 20%;
  left: 33.33%;
  width: 24px;
  height: 20%;
  transform: translateX(-12px);
}

/* Дороги за пределы карты */
.road-7-to-6 {
  /* От точки 7 (33.33%, 40%) до точки 6 (16.66%, 40%) */
  top: 40%;
  left: 16.66%;
  width: 16.67%;
  height: 24px;
  transform: translateY(-12px);
}

.road-6-exit {
  /* От точки 6 (16.66%, 40%) за левый край экрана */
  top: 40%;
  left: 0%;
  width: 16.66%;
  height: 24px;
  transform: translateY(-12px);
}

.road-3-exit {
  /* От точки 3 (50%, 20%) за верхний край экрана */
  top: 0%;
  left: 50%;
  width: 24px;
  height: 20%;
  transform: translateX(-12px);
}

.road-9-to-10 {
  /* От точки 9 (66.66%, 40%) до точки 10 (83.33%, 40%) */
  top: 40%;
  left: 66.66%;
  width: 16.67%;
  height: 24px;
  transform: translateY(-12px);
}

.road-10-exit {
  /* От точки 10 (83.33%, 40%) за правый край экрана */
  top: 40%;
  left: 83.33%;
  width: 16.67%;
  height: 24px;
  transform: translateY(-12px);
}

.road-14-to-19 {
  /* От точки 14 (66.66%, 60%) до точки 19 (83.33%, 80%) */
  top: 60%;
  left: 66.66%;
  width: 24px;
  height: 20%;
  transform: translateX(-12px);
}

.road-19-to-20 {
  /* От точки 19 (66.66%, 80%) до точки 20 (83.33%, 80%) - горизонтальная дорога */
  top: 80%;
  left: 66.66%;
  width: 16.67%;
  height: 24px;
  transform: translateY(-12px);
}

/* Соединительные элементы для плавных стыков дорог */
.road-junction {
  position: absolute;
  background: linear-gradient(135deg, #E6D3B7 0%, #D2B48C 25%, #DEB887 50%, #F4A460 75%, #D2B48C 100%);
  border: none;
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.3),
    inset 0 -2px 4px rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  z-index: 4;
  pointer-events: none;
}

/* Соединительные элементы на точках пересечения */
.junction-2 {
  top: 20%;
  left: 33.33%;
  width: 24px;
  height: 24px;
  transform: translate(-50%, -50%);
}

.junction-3 {
  top: 20%;
  left: 50%;
  width: 24px;
  height: 24px;
  transform: translate(-50%, -50%);
}

.junction-4 {
  top: 20%;
  left: 66.66%;
  width: 24px;
  height: 24px;
  transform: translate(-50%, -50%);
}

.junction-7 {
  top: 40%;
  left: 33.33%;
  width: 24px;
  height: 24px;
  transform: translate(-50%, -50%);
}

.junction-9 {
  top: 40%;
  left: 66.66%;
  width: 24px;
  height: 24px;
  transform: translate(-50%, -50%);
}

.junction-11 {
  top: 60%;
  left: 16.66%;
  width: 24px;
  height: 24px;
  transform: translate(-50%, -50%);
}

.junction-12 {
  top: 60%;
  left: 33.33%;
  width: 24px;
  height: 24px;
  transform: translate(-50%, -50%);
}

.junction-13 {
  top: 60%;
  left: 50%;
  width: 24px;
  height: 24px;
  transform: translate(-50%, -50%);
}

.junction-14 {
  top: 60%;
  left: 66.66%;
  width: 24px;
  height: 24px;
  transform: translate(-50%, -50%);
}

.junction-16 {
  top: 80%;
  left: 16.66%;
  width: 24px;
  height: 24px;
  transform: translate(-50%, -50%);
}

.junction-17 {
  top: 80%;
  left: 33.33%;
  width: 24px;
  height: 24px;
  transform: translate(-50%, -50%);
}

.junction-18 {
  top: 80%;
  left: 50%;
  width: 24px;
  height: 24px;
  transform: translate(-50%, -50%);
}

.junction-19 {
  top: 80%;
  left: 66.66%;
  width: 24px;
  height: 24px;
  transform: translate(-50%, -50%);
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
  display: flex;
  flex-direction: column;
  align-items: center;
}

.building:hover {
  transform: translate(-50%, -50%) scale(1.1);
  z-index: 20;
  filter: brightness(1.2) drop-shadow(0 0 15px rgba(100, 200, 255, 0.6));
  transition: all 0.2s ease-out;
}

.building:hover::before {
  content: '';
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  background: radial-gradient(circle, rgba(100, 200, 255, 0.2) 0%, transparent 60%);
  border-radius: 50%;
  animation: particleFloat 2s ease-in-out infinite;
  pointer-events: none;
  z-index: -1;
}

.building:hover::after {
  content: '';
  position: absolute;
  top: -15px;
  left: -15px;
  right: -15px;
  bottom: -15px;
  background: 
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.8) 1px, transparent 1px),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.6) 1px, transparent 1px),
    radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.7) 1px, transparent 1px),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.5) 1px, transparent 1px),
    radial-gradient(circle at 50% 10%, rgba(100, 200, 255, 0.6) 1px, transparent 1px),
    radial-gradient(circle at 10% 50%, rgba(100, 200, 255, 0.5) 1px, transparent 1px),
    radial-gradient(circle at 90% 50%, rgba(100, 200, 255, 0.4) 1px, transparent 1px),
    radial-gradient(circle at 50% 90%, rgba(100, 200, 255, 0.7) 1px, transparent 1px);
  animation: particleFloat 2s ease-in-out infinite;
  pointer-events: none;
  z-index: -1;
}

@keyframes particleFloat {
  0%, 100% {
    transform: scale(1) rotate(0deg);
    opacity: 0.4;
  }
  50% {
    transform: scale(1.1) rotate(180deg);
    opacity: 0.8;
  }
}

/* Подписи зданий */
.building-label {
  position: absolute;
  bottom: -35px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  color: #8B4513;
  padding: 4px 12px;
  border-radius: 15px;
  font-family: 'Segoe Print', cursive, sans-serif;
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 2px solid #8B4513;
  z-index: 15;
  pointer-events: none;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
  letter-spacing: 0.5px;
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

/* Здания на новых позициях - красиво отмасштабированы */

/* Крупные административные здания */
.bank {
  width: 160px;
  height: 140px;
  position: absolute;
  top: 80%;
  left: 33.33%;
  transform: translate(-50%, -50%);
}

.government {
  width: 150px;
  height: 180px;
  position: absolute;
  top: 20%;
  left: 66.66%;
  transform: translate(-50%, -50%);
}

/* Торговые здания */
.mall {
  width: 180px;
  height: 160px;
  position: absolute;
  top: 40%;
  left: 16.66%;
  transform: translate(-50%, -50%);
}

/* Жилые дома - красивые пропорции */
.house-1 {
  width: 120px;
  height: 100px; /* 2-этажный дом */
  position: absolute;
  top: 40%;
  left: 33.33%;
  transform: translate(-50%, -50%);
}

.house-2 {
  width: 130px;
  height: 150px; /* 4-этажный дом */
  position: absolute;
  top: 60%;
  left: 33.33%;
  transform: translate(-50%, -50%);
}

.house-3 {
  width: 100px;
  height: 80px; /* 1-этажный дом */
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Промышленные здания */
.workshop {
  width: 140px;
  height: 120px;
  position: absolute;
  top: 80%;
  left: 16.66%;
  transform: translate(-50%, -50%);
}

.office {
  width: 140px;
  height: 160px;
  position: absolute;
  top: 60%;
  left: 66.66%;
  transform: translate(-50%, -50%);
}

.warehouse {
  width: 160px;
  height: 100px;
  position: absolute;
  top: 80%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Мелкие торговые здания */
.shop {
  width: 90px;
  height: 70px;
  position: absolute;
  top: 20%;
  left: 33.33%;
  transform: translate(-50%, -50%);
}

.market {
  width: 150px;
  height: 90px; /* Широкий рынок */
  position: absolute;
  top: 40%;
  left: 66.66%;
  transform: translate(-50%, -50%);
}

.atelier {
  width: 110px;
  height: 90px;
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
  filter: drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.4));
  transition: all 0.3s ease;
}

.building-image:hover {
  transform: scale(1.08);
  filter: drop-shadow(5px 5px 10px rgba(0, 0, 0, 0.5));
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
  
  .time-controls-strip {
    top: auto;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    max-width: calc(100vw - 20px);
  }
}
</style>
