# Интеграция склада "Логистик+" с Supabase

## Обзор

Склад "Логистик+" успешно интегрирован с Supabase и готов к использованию в игре Fashion Goose. Система включает полную базу данных, управление состоянием через Pinia и современный Vue.js интерфейс.

## Структура базы данных

### Таблицы

1. **warehouse_materials** - Материалы на складе
   - id (UUID, PRIMARY KEY)
   - name (VARCHAR) - Название материала
   - icon (VARCHAR) - Эмодзи иконка
   - quantity (INTEGER) - Количество
   - price (DECIMAL) - Цена за единицу
   - category (VARCHAR) - Категория (fabric, accessory)
   - quality (INTEGER) - Качество (1-5)
   - created_at, updated_at (TIMESTAMP)

2. **warehouse_clothing** - Готовая одежда
   - id (UUID, PRIMARY KEY)
   - name (VARCHAR) - Название одежды
   - icon (VARCHAR) - Эмодзи иконка
   - quantity (INTEGER) - Количество
   - price (DECIMAL) - Цена за единицу
   - category (VARCHAR) - Категория (shirts, pants, dresses, outerwear)
   - quality (INTEGER) - Качество (1-5)
   - size (VARCHAR) - Размер
   - color (VARCHAR) - Цвет
   - brand (VARCHAR) - Бренд
   - created_at, updated_at (TIMESTAMP)

3. **warehouse_stats** - Статистика склада
   - id (UUID, PRIMARY KEY)
   - warehouse_name (VARCHAR) - Название склада
   - capacity_percent (INTEGER) - Загруженность в %
   - free_space (DECIMAL) - Свободное место в м²
   - monthly_rent (DECIMAL) - Ежемесячная аренда
   - temperature_min/max (INTEGER) - Диапазон температуры
   - humidity_min/max (INTEGER) - Диапазон влажности
   - security_level (VARCHAR) - Уровень охраны
   - tracking_system (VARCHAR) - Система учета
   - last_updated, created_at (TIMESTAMP)

4. **warehouse_transactions** - Транзакции склада
   - id (UUID, PRIMARY KEY)
   - transaction_type (VARCHAR) - Тип операции (in, out, transfer, adjustment)
   - item_type (VARCHAR) - Тип товара (material, clothing)
   - item_id (UUID) - ID товара
   - item_name (VARCHAR) - Название товара
   - quantity_change (INTEGER) - Изменение количества
   - price_per_unit (DECIMAL) - Цена за единицу
   - total_value (DECIMAL) - Общая стоимость
   - reason (VARCHAR) - Причина операции
   - performed_by (VARCHAR) - Кто выполнил
   - created_at (TIMESTAMP)

5. **warehouse_users** - Пользователи склада
   - id (UUID, PRIMARY KEY)
   - username (VARCHAR) - Имя пользователя
   - email (VARCHAR) - Email
   - full_name (VARCHAR) - Полное имя
   - role (VARCHAR) - Роль (admin, manager, operator, viewer)
   - permissions (JSONB) - Права доступа
   - last_login (TIMESTAMP) - Последний вход
   - is_active (BOOLEAN) - Активен ли пользователь
   - created_at, updated_at (TIMESTAMP)

## Безопасность

- Включен Row Level Security (RLS) для всех таблиц
- Настроены политики доступа для анонимных и аутентифицированных пользователей
- Анонимные пользователи имеют только права на чтение
- Аутентифицированные пользователи имеют полный доступ

## Функциональность

### Store (warehouseStore.ts)
- Управление состоянием материалов и одежды
- Вычисляемые свойства для статистики
- Методы для обновления количества товаров
- Запись транзакций
- Обработка ошибок и состояний загрузки

### Компонент (WarehouseModal.vue)
- Отображение инвентаря материалов и одежды
- Статистика склада в реальном времени
- Условия хранения
- Индикатор загрузки и обработка ошибок
- Адаптивный дизайн

### Типы (warehouse.ts)
- TypeScript интерфейсы для всех сущностей
- Типизированные запросы на обновление
- Сводная статистика

## Начальные данные

В базе данных уже добавлены:
- 6 видов материалов (хлопок, шелк, джинс, пуговицы, молнии, нитки)
- 5 видов одежды (футболка, джинсы, платье, куртка, рубашка)
- Статистика склада "Логистик+"
- Пользователь-менеджер

## Подключение к проекту

1. Убедитесь, что Supabase настроен в проекте
2. Используйте `useWarehouseStore()` в компонентах
3. Импортируйте типы из `@/types/warehouse`
4. Настройте конфигурацию в `@/config/supabase`

## API Endpoints

Все операции выполняются через Supabase клиент:
- Чтение: `supabase.from('table_name').select()`
- Вставка: `supabase.from('table_name').insert()`
- Обновление: `supabase.from('table_name').update()`
- Удаление: `supabase.from('table_name').delete()`

## Мониторинг

Для отслеживания производительности и ошибок рекомендуется:
- Использовать Supabase Dashboard для мониторинга запросов
- Настроить логирование транзакций
- Мониторить использование RLS политик

## Расширение функциональности

Возможные улучшения:
- Добавить систему уведомлений о низких запасах
- Интеграция с системой заказов
- Аналитика продаж и тенденций
- Автоматическое пополнение запасов
- Система резервирования товаров

Склад "Логистик+" готов к использованию и полностью интегрирован с игровой экономикой Fashion Goose!
