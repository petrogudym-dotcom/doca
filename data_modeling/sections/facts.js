window.SECTIONS = window.SECTIONS || [];
window.SECTIONS.push(  {
    id: 'facts', title: 'Типы Fact таблиц', icon: '📊',
    iconBg: '#F3E8FF', desc: 'Паттерны Kimball для хранения измеримых событий',
    topics: [
      {
        name: 'Transaction Fact Table',
        tag: 'fact', tagLabel: 'Fact таблица',
        summary: 'Одна строка = одно событие/транзакция. Самый детализированный и самый распространённый тип. Быстро растёт.',
        short: 'Каждая строка — отдельная транзакция: продажа, клик, платёж, вызов API. Максимальная гранулярность. Additive measures: SUM по любым dimensions.',
        medium: {
          theory: 'Transaction Fact — основа большинства DWH. Grain = одна строка на транзакцию. Additive facts (amount, quantity) можно суммировать по любым dimensions. Semi-additive (balance) — только по некоторым. Non-additive (ratio, %) — нельзя суммировать.',
          tradeoffs: 'Плюс: максимальная гибкость анализа, любой срез данных. Минус: очень быстро растёт (миллиарды строк), запросы на агрегаты медленнее чем по Snapshot таблицам.',
          code: `-- Grain: одна строка = одна позиция в заказе
CREATE TABLE fact_order_lines (
  order_line_id   BIGINT,     -- суррогатный ключ
  order_id        INT,
  date_key        INT,        -- FK → dim_date
  customer_key    INT,        -- FK → dim_customer
  product_key     INT,        -- FK → dim_product
  store_key       INT,        -- FK → dim_store
  -- MEASURES (факты):
  quantity        INT,        -- additive
  unit_price      DECIMAL,    -- additive
  discount_amount DECIMAL,    -- additive
  line_total      DECIMAL,    -- additive = quantity * unit_price - discount
  margin_pct      DECIMAL     -- non-additive! хранить осторожно
);`
        },
        tools: ['dbt', 'Snowflake', 'BigQuery', 'Redshift', 'ClickHouse'],
        links: [{ label: 'Fact Table Types — Kimball', url: 'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/fact-table-structure/' }],
        questions: ['Чем additive отличается от semi-additive measure?', 'Как хранить non-additive факты правильно?', 'Что такое grain и как его определить?']
      },
      {
        name: 'Periodic Snapshot Fact Table',
        tag: 'fact', tagLabel: 'Fact таблица',
        summary: 'Одна строка = состояние за период (день, неделя, месяц). Для трендов и KPI. Включает строки даже при отсутствии активности.',
        short: 'Снимок состояния за период: остатки на складе, баланс счёта, количество активных пользователей. Строка добавляется каждый период, даже если событий не было.',
        medium: {
          theory: 'Periodic Snapshot отвечает на вопрос "каково состояние на конец периода?". Например: остаток товара каждый день. Если склад не двигался — всё равно вставляем строку с текущим остатком. Semi-additive measures (balance, inventory) суммируются по product, но не по дате.',
          tradeoffs: 'Плюс: быстрые запросы на тренды, не нужно агрегировать транзакции. Минус: строки вставляются даже без активности (может быть много NULL), объём растёт линейно со временем.',
          code: `-- Grain: одна строка = один продукт в один день
CREATE TABLE fact_inventory_snapshot (
  snapshot_date_key  INT,     -- FK → dim_date
  product_key        INT,     -- FK → dim_product
  warehouse_key      INT,     -- FK → dim_warehouse
  -- Semi-additive: можно SUM по product/warehouse,
  -- НО НЕ по дате (остаток на 3 дня ≠ сумма остатков):
  quantity_on_hand   INT,
  quantity_on_order  INT,
  reorder_point      INT
);

-- Тренд запасов по неделям:
SELECT d.week, p.product_name, AVG(f.quantity_on_hand) AS avg_stock
FROM fact_inventory_snapshot f
JOIN dim_date d    ON f.snapshot_date_key = d.date_key
JOIN dim_product p ON f.product_key = p.product_key
GROUP BY 1, 2;`
        },
        tools: ['dbt', 'Snowflake', 'BigQuery', 'Spark'],
        links: [{ label: 'Three Types of Fact Tables', url: 'https://www.holistics.io/blog/the-three-types-of-fact-tables/' }],
        questions: ['Чем Periodic Snapshot отличается от Transaction Fact?', 'Почему balance нельзя суммировать по дате?', 'Когда Periodic Snapshot заменяет Transaction Fact?']
      },
      {
        name: 'Accumulating Snapshot Fact Table',
        tag: 'fact', tagLabel: 'Fact таблица',
        summary: 'Одна строка = весь жизненный цикл процесса. Строка обновляется при каждом milestone. Для pipeline и workflow аналитики.',
        short: 'Один заказ = одна строка, которая обновляется: order_date → ship_date → deliver_date. Несколько FK на dim_date (по одному на каждый milestone). Измеряет lag между этапами.',
        medium: {
          theory: 'Accumulating Snapshot для процессов с определённым началом, концом и milestone шагами: обработка заказа, страховое требование, найм сотрудника. Строка загружается при первом событии и обновляется (UPDATE) при каждом milestone. Lag between milestones = ключевая метрика.',
          tradeoffs: 'Плюс: полная картина жизненного цикла в одной строке, простой анализ bottleneck. Минус: UPDATE строк нарушает append-only принципы, сложность при нестандартных путях процесса, редко используется.',
          code: `-- Grain: одна строка = один заказ (полный цикл)
CREATE TABLE fact_order_fulfillment (
  order_key          INT,
  -- Несколько FK на dim_date (один на milestone):
  order_date_key     INT,  -- заказ создан
  payment_date_key   INT,  -- оплата получена (NULL пока не оплачен)
  ship_date_key      INT,  -- отгружен (NULL пока не отгружен)
  deliver_date_key   INT,  -- доставлен (NULL пока не доставлен)
  close_date_key     INT,  -- закрыт/завершён
  -- Lag metrics (в днях):
  days_to_payment    INT,
  days_to_shipment   INT,
  days_to_delivery   INT,
  order_total        DECIMAL
);
-- Строка UPDATE-ится при каждом новом milestone`
        },
        tools: ['dbt', 'SQL', 'Spark', 'Snowflake'],
        links: [{ label: 'Accumulating Snapshot — Microsoft', url: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/dimensional-modeling-fact-tables' }],
        questions: ['Почему Accumulating Snapshot нарушает append-only принцип?', 'Как анализировать bottleneck с помощью этой таблицы?', 'Какие процессы подходят для Accumulating Snapshot?']
      },
      {
        name: 'Factless Fact Table',
        tag: 'fact', tagLabel: 'Fact таблица',
        summary: 'Fact таблица без числовых мер. Только FK на Dimensions. Фиксирует факт события или наличие связи между сущностями.',
        short: 'Нет measures — только FK. Используется для: записи событий (студент посетил лекцию), анализа покрытия (какие товары НЕ были проданы), many-to-many связей.',
        medium: {
          theory: 'Два вида: Event Factless (студент зачислен на курс — событие без чисел, мера = COUNT строк) и Coverage Factless (какие комбинации product+store+date возможны — для анализа "что не произошло"). Мера достигается COUNT(*) или OUTER JOIN.',
          tradeoffs: 'Плюс: единственный способ моделировать некоторые события, позволяет "negative analysis". Минус: непривычно для аналитиков, легко перепутать с ошибкой моделирования.',
          code: `-- Event Factless: зачисление студента на курс
CREATE TABLE fact_enrollment (
  date_key       INT,  -- FK → dim_date
  student_key    INT,  -- FK → dim_student
  course_key     INT,  -- FK → dim_course
  teacher_key    INT   -- FK → dim_teacher
  -- НЕТ числовых мер!
);

-- Запрос: сколько студентов на каждом курсе?
SELECT c.course_name, COUNT(*) AS students
FROM fact_enrollment f
JOIN dim_course c ON f.course_key = c.course_key
GROUP BY 1;

-- Coverage Factless: какие товары НЕ продавались?
SELECT p.product_name
FROM dim_product p
LEFT JOIN fact_sales s ON p.product_key = s.product_key
WHERE s.product_key IS NULL;  -- товары без продаж`
        },
        tools: ['SQL', 'dbt', 'BigQuery', 'Snowflake'],
        links: [{ label: 'Factless Fact Table — Microsoft', url: 'https://learn.microsoft.com/en-us/fabric/data-warehouse/dimensional-modeling-fact-tables' }],
        questions: ['Как получить метрику из Factless Fact таблицы?', 'Что такое "coverage analysis" и зачем нужна Factless таблица?', 'Как отличить Factless Fact от ошибки моделирования?']
      },
      {
        name: 'Aggregate Fact Table',
        tag: 'fact', tagLabel: 'Fact таблица',
        summary: 'Предварительно агрегированная версия Transaction Fact таблицы. Ускоряет часто используемые запросы в 10-100x.',
        short: 'Rollup базовой Fact таблицы до более высокой гранулярности: из daily transaction → monthly summary. BI-инструменты могут автоматически роутить запросы к агрегату.',
        medium: {
          theory: 'Aggregate Fact таблица = Materialized View над Transaction Fact. Например: fact_sales (строка на транзакцию) → fact_sales_monthly (строка на месяц+продукт+регион). Используется transparent aggregation: BI-инструмент автоматически выбирает нужный уровень.',
          tradeoffs: 'Плюс: ускорение типичных запросов без изменения базовой таблицы. Минус: хранение дополнительных данных, нужно обновлять при изменении базовой таблицы, сложность transparent routing.',
          code: `-- Base: fact_sales (миллиарды строк, daily grain)
-- Aggregate: fact_sales_monthly (миллионы строк, monthly grain)
CREATE TABLE fact_sales_monthly AS
SELECT
  -- понижаем гранулярность: day → month
  DATE_TRUNC('month', d.date)  AS month,
  f.product_key,
  f.store_key,
  f.customer_segment_key,
  -- агрегируем меры:
  SUM(f.amount)       AS total_amount,
  SUM(f.quantity)     AS total_quantity,
  COUNT(DISTINCT f.customer_key) AS unique_customers,
  COUNT(*)            AS transaction_count
FROM fact_sales f
JOIN dim_date d ON f.date_key = d.date_key
GROUP BY 1, 2, 3, 4;

-- Запрос на годовой отчёт → автоматически к fact_sales_monthly`
        },
        tools: ['dbt', 'Snowflake', 'BigQuery', 'Redshift', 'Power BI Aggregations'],
        links: [{ label: 'Aggregate Fact Tables — Kimball', url: 'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/aggregates/' }],
        questions: ['Чем Aggregate Fact отличается от Materialized View?', 'Что такое transparent aggregation?', 'Как поддерживать Aggregate Fact при изменении Transaction Fact?']
      }
    ]
  });
