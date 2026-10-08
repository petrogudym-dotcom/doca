window.SECTIONS = window.SECTIONS || [];
window.SECTIONS.push(  {
    id: 'scd', title: 'Slowly Changing Dimensions', icon: '🕐',
    iconBg: '#FFF3E0', desc: 'Как хранить историю изменений атрибутов в DWH',
    topics: [
      {
        name: 'SCD — Обзор и выбор типа',
        tag: 'scd', tagLabel: 'SCD',
        summary: 'Slowly Changing Dimension (SCD) — методы обработки изменений в dimension таблицах. Ralph Kimball выделил типы 0–6.',
        short: 'SCD решает вопрос: что делать когда клиент переехал, сотрудник сменил должность, или товар изменил категорию? Тип определяет: перезаписать, добавить строку, или добавить колонку.',
        medium: {
          theory: 'Dimension данные меняются медленно (не как транзакции). Примеры: адрес клиента, должность сотрудника, категория товара. Выбор типа зависит от: нужна ли история, частота изменений, объём данных.',
          tradeoffs: 'Type 1 — проще, нет истории. Type 2 — полная история, растёт объём. Type 3 — только одна предыдущая версия. Гибридные (Type 6) — всё сразу, но самые сложные.',
          code: `-- Быстрый выбор типа SCD:
┌─────────────────────────────────────────────────────┐
│ Нужна история изменений?                            │
│   НЕТ  → Type 1 (перезапись)                        │
│   ДА   → Нужны все версии?                          │
│     ДА    → Type 2 (новая строка)                   │
│     ТОЛЬКО ПРЕДЫДУЩАЯ → Type 3 (новая колонка)      │
│     ВСЁ СРАЗУ → Type 6 (гибрид 1+2+3)              │
│                                                     │
│ Данные никогда не меняются?  → Type 0              │
│ История в отдельной таблице? → Type 4              │
└─────────────────────────────────────────────────────┘`
        },
        tools: ['dbt', 'Fivetran', 'Debezium', 'Azure Data Factory', 'AWS Glue'],
        links: [
          { label: 'SCD — Ralph Kimball', url: 'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/slowly-changing-dimension/' },
          { label: 'SCD Types — Wikipedia', url: 'https://en.wikipedia.org/wiki/Slowly_changing_dimension' }
        ],
        questions: ['Какой тип SCD самый популярный на практике?', 'Как CDC помогает реализовать SCD?', 'Как dbt реализует SCD Type 2?']
      },
      {
        name: 'SCD Type 0 и Type 1',
        tag: 'scd', tagLabel: 'SCD',
        summary: 'Type 0: данные никогда не меняются. Type 1: перезапись без сохранения истории. Самые простые подходы.',
        short: 'Type 0 — статичные данные (дата рождения, SSN). Type 1 — UPDATE строки при изменении, старое значение теряется. "Исправление ошибок" — типичный кейс Type 1.',
        medium: {
          theory: 'Type 0: атрибут определён один раз и неизменен (birth_date, national_id). Type 1: когда история не важна или изменение — исправление ошибки (опечатка в имени). Прост в реализации, не требует surrogate key логики.',
          tradeoffs: 'Type 1 плюс: простота, маленький объём. Минус: полная потеря истории — нельзя узнать "в каком городе жил клиент в момент покупки 2 года назад". Использовать только когда история действительно не нужна.',
          code: `-- Type 0: атрибут никогда не обновляется
-- birth_date в dim_customer — только INSERT, никогда UPDATE

-- Type 1: простой UPDATE (история теряется)
-- До: customer_id=1, city='Kyiv'
-- Клиент переехал в Lviv:
UPDATE dim_customer
SET city = 'Lviv'            -- 'Kyiv' навсегда потеряно!
WHERE customer_id = 1;

-- Теперь ВСЕ исторические продажи
-- будут показывать city='Lviv'
-- даже если продажа была когда клиент жил в Kyiv`
        },
        tools: ['SQL', 'dbt', 'Spark'],
        links: [{ label: 'SCD Types explained — Airbyte', url: 'https://airbyte.com/data-engineering-resources/scd-types-in-data-warehouse' }],
        questions: ['Когда Type 1 допустим несмотря на потерю истории?', 'Как Type 0 реализовать технически?', 'Что делать если нужно исправить ошибку в Type 2?']
      },
      {
        name: 'SCD Type 2',
        tag: 'scd', tagLabel: 'SCD',
        summary: 'Новая строка при каждом изменении. Полная история. Самый популярный тип. Требует surrogate key и флаги активности.',
        short: 'При изменении атрибута — старая строка закрывается (is_current=false, end_date=now), добавляется новая строка. Surrogate key уникален для каждой версии.',
        medium: {
          theory: 'Type 2 даёт полную историю: "в момент покупки клиент жил в Kyiv". Ключевые поля: surrogate_key (уникален per version), natural_key (customer_id — одинаков для всех версий), start_date, end_date (NULL = текущая), is_current (boolean). Запросы на текущее состояние: WHERE is_current = true.',
          tradeoffs: 'Плюс: полная история, point-in-time анализ. Минус: таблица растёт со временем, запросы сложнее (нужно фильтровать по is_current или date), JOIN по surrogate_key а не natural_key.',
          code: `-- dim_customer с SCD Type 2:
customer_sk | customer_id | name  | city   | start_date | end_date   | is_current
------------|-------------|-------|--------|------------|------------|----------
1           | C001        | Alice | Kyiv   | 2022-01-01 | 2023-06-14 | false
2           | C001        | Alice | Lviv   | 2023-06-15 | 2024-03-01 | false
3           | C001        | Alice | Berlin | 2024-03-02 | NULL       | true  ← текущая

-- fact_sales ссылается на customer_sk=1 для покупок 2022 года
-- fact_sales ссылается на customer_sk=3 для текущих покупок

-- Текущие клиенты:
SELECT * FROM dim_customer WHERE is_current = true;
-- Клиент на дату:
SELECT * FROM dim_customer
WHERE customer_id = 'C001'
  AND '2023-01-01' BETWEEN start_date AND COALESCE(end_date, '9999-12-31');`
        },
        tools: ['dbt (snapshot)', 'Fivetran', 'Azure Data Factory', 'Spark', 'Debezium'],
        links: [
          { label: 'dbt snapshots (SCD2)', url: 'https://docs.getdbt.com/docs/build/snapshots' },
          { label: 'SCD Type 2 — Microsoft Fabric', url: 'https://learn.microsoft.com/en-us/fabric/data-factory/slowly-changing-dimension-type-two' }
        ],
        questions: ['Зачем нужен surrogate key при SCD Type 2?', 'Как реализовать SCD Type 2 в dbt?', 'Что такое point-in-time join и как его построить?']
      },
      {
        name: 'SCD Type 3, 4 и 6',
        tag: 'scd', tagLabel: 'SCD',
        summary: 'Type 3: новая колонка для предыдущего значения. Type 4: история в отдельной таблице. Type 6: гибрид 1+2+3.',
        short: 'Type 3 хранит только одну предыдущую версию (current_city + previous_city). Type 4 выносит историю в mini-dimension. Type 6 = Type 1+2+3 одновременно.',
        medium: {
          theory: 'Type 3: добавляем колонку previous_X. Просто, но хранит только один шаг назад. Type 4: быстро меняющиеся атрибуты в отдельной "mini-dimension" (например, age_band, income_level). Type 6: каждая строка содержит текущее значение (Type 1), историческое значение (Type 3) И является отдельной строкой (Type 2). 1+2+3=6.',
          tradeoffs: 'Type 3 — прост, но ограничен одним шагом. Type 4 — отличен для quickly-changing dimensions (статус, оценка риска). Type 6 — максимум функциональности, но сложность реализации и обслуживания.',
          code: `-- Type 3: добавляем current_ и previous_ колонку
customer_id | current_city | previous_city | changed_at
------------|--------------|---------------|----------
C001        | Berlin       | Lviv          | 2024-03-02
-- История до Lviv потеряна!

-- Type 4: mini-dimension для быстро меняющихся атрибутов
dim_customer_profile (profile_key, age_band, income_level, risk_score)
fact_sales → dim_customer (стабильные данные)
           → dim_customer_profile (быстро меняющиеся)

-- Type 6: комбинация — строка как в Type 2, но с current_ колонкой
cust_sk | cust_id | city   | current_city | start      | end        | is_current
--------|---------|--------|--------------|------------|------------|----------
1       | C001    | Kyiv   | Berlin       | 2022-01-01 | 2023-06-14 | false
2       | C001    | Lviv   | Berlin       | 2023-06-15 | 2024-03-01 | false
3       | C001    | Berlin | Berlin       | 2024-03-02 | NULL       | true`
        },
        tools: ['SQL', 'dbt', 'Spark'],
        links: [{ label: 'SCD Type 6 — Wikipedia', url: 'https://en.wikipedia.org/wiki/Slowly_changing_dimension#Type_6' }],
        questions: ['Когда Type 3 достаточен?', 'Что такое rapidly changing dimension и как с ней работать?', 'Почему Type 6 = 1+2+3?']
      }
    ]
  },);
