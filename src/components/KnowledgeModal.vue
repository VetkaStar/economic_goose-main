<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal knowledge-modal tablet" @click.stop>
      <!-- Экран планшета -->
      <div class="tablet-screen">
        <!-- Заголовок планшета -->
        <div class="tablet-header">
          <div class="tablet-camera"></div>
          <h2>📚 База знаний Fashion Goose</h2>
          <button class="close-btn" @click="closeModal">✕</button>
        </div>
        
        <!-- Навигация по разделам -->
        <div class="tablet-nav">
          <button 
            v-for="section in sections" 
            :key="section.id"
            class="nav-btn"
            :class="{ active: activeSection === section.id }"
            @click="setActiveSection(section.id)"
          >
            <span class="nav-icon">{{ section.icon }}</span>
            <span class="nav-text">{{ section.name }}</span>
          </button>
        </div>
        
        <!-- Контент раздела -->
        <div class="tablet-content">
          <!-- Экономика -->
          <div v-if="activeSection === 'economy'" class="section-content">
            <h3>💰 Основы экономики</h3>
            
            <div class="knowledge-card">
              <h4>📈 Спрос и предложение</h4>
              <p>Спрос - это количество товара, которое покупатели готовы купить по определенной цене. Предложение - это количество товара, которое продавцы готовы продать.</p>
              <div class="formula">
                <strong>Цена ↑ → Спрос ↓</strong><br>
                <strong>Цена ↓ → Спрос ↑</strong>
              </div>
            </div>
            
            <div class="knowledge-card">
              <h4>💹 Инфляция</h4>
              <p>Инфляция - это общий рост цен на товары и услуги в экономике. Она снижает покупательную способность денег.</p>
              <div class="tip">
                💡 <strong>Совет:</strong> Инвестируйте в активы, которые растут быстрее инфляции!
              </div>
            </div>
            
            <div class="knowledge-card">
              <h4>🏪 Маркетинг</h4>
              <p>Маркетинг - это процесс создания, продвижения и продажи товаров или услуг. Включает в себя изучение потребностей клиентов и создание ценности.</p>
              <ul class="marketing-list">
                <li>Исследование рынка</li>
                <li>Разработка продукта</li>
                <li>Ценообразование</li>
                <li>Продвижение</li>
                <li>Продажи</li>
              </ul>
            </div>
          </div>
          
          <!-- Мода и дизайн -->
          <div v-if="activeSection === 'fashion'" class="section-content">
            <h3>👗 Мир моды</h3>
            
            <div class="knowledge-card">
              <h4>🎨 Принципы дизайна</h4>
              <p>Хороший дизайн основывается на нескольких ключевых принципах:</p>
              <div class="principles-grid">
                <div class="principle">
                  <span class="principle-icon">⚖️</span>
                  <span class="principle-name">Баланс</span>
                </div>
                <div class="principle">
                  <span class="principle-icon">🔄</span>
                  <span class="principle-name">Ритм</span>
                </div>
                <div class="principle">
                  <span class="principle-icon">🎯</span>
                  <span class="principle-name">Акцент</span>
                </div>
                <div class="principle">
                  <span class="principle-icon">📏</span>
                  <span class="principle-name">Пропорции</span>
                </div>
              </div>
            </div>
            
            <div class="knowledge-card">
              <h4>🌈 Цветовая теория</h4>
              <p>Цвета влияют на эмоции и восприятие. Правильный выбор цветов может сделать ваш продукт более привлекательным.</p>
              <div class="color-wheel">
                <div class="color-primary">Основные цвета</div>
                <div class="color-secondary">Дополнительные</div>
                <div class="color-tertiary">Третичные</div>
              </div>
            </div>
            
            <div class="knowledge-card">
              <h4>📏 Размеры и посадка</h4>
              <p>Правильная посадка одежды - залог успеха. Учитывайте особенности фигуры и предпочтения клиентов.</p>
            </div>
          </div>
          
          <!-- Бизнес -->
          <div v-if="activeSection === 'business'" class="section-content">
            <h3>🏢 Управление бизнесом</h3>
            
            <div class="knowledge-card">
              <h4>📊 Финансовое планирование</h4>
              <p>Планирование доходов и расходов помогает контролировать финансовое состояние бизнеса.</p>
              <div class="financial-formula">
                <strong>Прибыль = Доходы - Расходы</strong>
              </div>
            </div>
            
            <div class="knowledge-card">
              <h4>👥 Управление персоналом</h4>
              <p>Сотрудники - основа успешного бизнеса. Правильная мотивация и обучение повышают эффективность.</p>
              <div class="employee-tips">
                <div class="tip-item">💪 Мотивация</div>
                <div class="tip-item">📚 Обучение</div>
                <div class="tip-item">🤝 Командная работа</div>
                <div class="tip-item">📈 Развитие</div>
              </div>
            </div>
            
            <div class="knowledge-card">
              <h4>📈 Анализ рынка</h4>
              <p>Изучение конкурентов и трендов помогает принимать правильные бизнес-решения.</p>
            </div>
          </div>
          
          <!-- Мини-игры -->
          <div v-if="activeSection === 'minigames'" class="section-content">
            <h3>🎮 Мини-игры</h3>
            
            <div class="knowledge-card">
              <h4>🎯 Типы мини-игр</h4>
              <div class="minigame-types">
                <div class="minigame-type">
                  <span class="type-icon">🏭</span>
                  <span class="type-name">Производство</span>
                  <span class="type-desc">Управление фабрикой</span>
                </div>
                <div class="minigame-type">
                  <span class="type-icon">🛍️</span>
                  <span class="type-name">Продажи</span>
                  <span class="type-desc">Обслуживание клиентов</span>
                </div>
                <div class="minigame-type">
                  <span class="type-icon">🎨</span>
                  <span class="type-name">Дизайн</span>
                  <span class="type-desc">Создание одежды</span>
                </div>
                <div class="minigame-type">
                  <span class="type-icon">🤝</span>
                  <span class="type-name">Кооператив</span>
                  <span class="type-desc">Совместная игра</span>
                </div>
              </div>
            </div>
            
            <div class="knowledge-card">
              <h4>🏆 Награды</h4>
              <p>За участие в мини-играх вы получаете различные награды:</p>
              <ul>
                <li>💰 Монеты</li>
                <li>⭐ Опыт</li>
                <li>🎁 Предметы</li>
                <li>🏆 Достижения</li>
              </ul>
            </div>
          </div>
          
          <!-- Советы -->
          <div v-if="activeSection === 'tips'" class="section-content">
            <h3>💡 Полезные советы</h3>
            
            <div class="tips-grid">
              <div class="tip-card">
                <span class="tip-icon">💰</span>
                <h4>Экономия</h4>
                <p>Покупайте материалы оптом - это дешевле!</p>
              </div>
              
              <div class="tip-card">
                <span class="tip-icon">⏰</span>
                <h4>Время</h4>
                <p>Планируйте производство заранее</p>
              </div>
              
              <div class="tip-card">
                <span class="tip-icon">👥</span>
                <h4>Клиенты</h4>
                <p>Изучайте предпочтения покупателей</p>
              </div>
              
              <div class="tip-card">
                <span class="tip-icon">📊</span>
                <h4>Анализ</h4>
                <p>Отслеживайте прибыльность товаров</p>
              </div>
              
              <div class="tip-card">
                <span class="tip-icon">🎨</span>
                <h4>Креатив</h4>
                <p>Экспериментируйте с новыми стилями</p>
              </div>
              
              <div class="tip-card">
                <span class="tip-icon">🤝</span>
                <h4>Сотрудничество</h4>
                <p>Играйте с друзьями для больших наград</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Подвал планшета -->
        <div class="tablet-footer">
          <div class="battery">🔋 85%</div>
          <div class="time">{{ currentTime }}</div>
          <div class="wifi">📶</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Эмиты
const emit = defineEmits<{
  close: []
}>()

// Состояние
const activeSection = ref('economy')
const currentTime = ref('')

// Разделы знаний
const sections = ref([
  { id: 'economy', name: 'Экономика', icon: '💰' },
  { id: 'fashion', name: 'Мода', icon: '👗' },
  { id: 'business', name: 'Бизнес', icon: '🏢' },
  { id: 'minigames', name: 'Мини-игры', icon: '🎮' },
  { id: 'tips', name: 'Советы', icon: '💡' }
])

// Таймер для времени
let timeInterval: NodeJS.Timeout

// Установка активного раздела
const setActiveSection = (sectionId: string) => {
  activeSection.value = sectionId
}

// Обновление времени
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('ru-RU', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// Загрузка при монтировании
onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

// Очистка при размонтировании
onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})

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

.knowledge-modal {
  background: #2c3e50;
  border-radius: 30px;
  max-width: 900px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  position: relative;
}

.tablet {
  position: relative;
}

.tablet-screen {
  background: #ecf0f1;
  border-radius: 25px;
  margin: 10px;
  height: calc(100% - 20px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tablet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: #34495e;
  color: white;
  position: relative;
}

.tablet-camera {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  background: #2c3e50;
  border-radius: 50%;
}

.tablet-header h2 {
  margin: 0;
  font-size: 1.3rem;
  flex: 1;
  text-align: center;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: white;
  padding: 5px;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.tablet-nav {
  display: flex;
  background: #34495e;
  padding: 10px;
  gap: 5px;
  overflow-x: auto;
}

.nav-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 10px 15px;
  background: transparent;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #bdc3c7;
  min-width: 80px;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-btn.active {
  background: #3498db;
  color: white;
}

.nav-icon {
  font-size: 1.2rem;
}

.nav-text {
  font-size: 0.8rem;
  font-weight: 600;
}

.tablet-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #ecf0f1;
}

.section-content h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.5rem;
  text-align: center;
}

.knowledge-card {
  background: white;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #3498db;
}

.knowledge-card h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.knowledge-card p {
  margin: 0 0 15px 0;
  line-height: 1.6;
  color: #34495e;
}

.formula {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  font-family: monospace;
  text-align: center;
  margin: 15px 0;
  border: 2px solid #e9ecef;
}

.tip {
  background: #d4edda;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #28a745;
  margin: 15px 0;
}

.marketing-list {
  list-style: none;
  padding: 0;
  margin: 15px 0;
}

.marketing-list li {
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
  position: relative;
  padding-left: 20px;
}

.marketing-list li:before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #28a745;
  font-weight: bold;
}

.principles-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin: 15px 0;
}

.principle {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
}

.principle-icon {
  font-size: 1.5rem;
}

.principle-name {
  font-weight: 600;
  color: #2c3e50;
}

.color-wheel {
  display: flex;
  justify-content: space-around;
  margin: 15px 0;
}

.color-primary, .color-secondary, .color-tertiary {
  padding: 10px 15px;
  border-radius: 20px;
  color: white;
  font-weight: bold;
  text-align: center;
}

.color-primary {
  background: #e74c3c;
}

.color-secondary {
  background: #3498db;
}

.color-tertiary {
  background: #f39c12;
}

.financial-formula {
  background: #e8f5e8;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  font-size: 1.1rem;
  font-weight: bold;
  color: #27ae60;
  margin: 15px 0;
}

.employee-tips {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin: 15px 0;
}

.tip-item {
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  color: #2c3e50;
}

.minigame-types {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin: 15px 0;
}

.minigame-type {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  text-align: center;
}

.type-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.type-name {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.type-desc {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.tip-card {
  background: white;
  padding: 20px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.tip-card:hover {
  transform: translateY(-5px);
}

.tip-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 10px;
}

.tip-card h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.tip-card p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.tablet-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: #34495e;
  color: white;
  font-size: 0.9rem;
}

.battery, .time, .wifi {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* Адаптивность */
@media (max-width: 768px) {
  .knowledge-modal {
    width: 95%;
    margin: 10px;
  }
  
  .principles-grid,
  .employee-tips,
  .minigame-types,
  .tips-grid {
    grid-template-columns: 1fr;
  }
  
  .tablet-nav {
    flex-wrap: wrap;
  }
  
  .nav-btn {
    min-width: 60px;
  }
  
  .nav-text {
    font-size: 0.7rem;
  }
}
</style>
