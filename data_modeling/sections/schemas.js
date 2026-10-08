window.SECTIONS = window.SECTIONS || [];
window.SECTIONS.push(  {
    id: 'schemas', title: 'Схемы хранилищ', icon: '⭐',
    iconBg: '#E8F5E9', desc: 'Как организовать таблицы в хранилище',
    topics: [
      {
        name: 'Star Schema',
        tag: 'schema', tagLabel: 'Схема',
        summary: 'Центральная Fact таблица окружена Dimension таблицами. Простота, скорость, читаемость. Стандарт для Gold-слоя и BI.',
        short: 'Fact в центре, Dimensions по краям. Dimensions денормализованы (всё в одной таблице). Минимум JOIN-ов → максимум скорости. Kimball-стандарт.',
        medium: {
          theory: 'Fact таблица содержит измеримые события (продажа, клик, платёж) + FK на все dimensions. Dimension денормализована: dim_product содержит и category_name, и brand_name без отдельных таблиц. Это даёт скорость за счёт избыточности.',
          tradeoffs: 'Плюс: быстрые запросы (мало JOIN), понятно аналитикам и BI-инструментам, простота. Минус: дублирование данных в dimensions, обновление dimension = UPDATE многих строк (решается SCD).',
          code: `-- Star Schema: продажи
         dim_date          dim_store
            ↑                  ↑
dim_customer ← fact_sales → dim_product
                              ↓
                          (всё в одной dim)
                    product_name, category,
                    brand, supplier — всё тут

SELECT
  d.month, p.category, SUM(f.amount) AS revenue
FROM fact_sales f
JOIN dim_date    d ON f.date_key    = d.date_key
JOIN dim_product p ON f.product_key = p.product_key
GROUP BY 1, 2;  -- всего 2 JOIN!`
        },
        tools: ['dbt', 'Snowflake', 'BigQuery', 'Redshift', 'Power BI', 'Tableau'],
        links: [
          { label: 'Star Schema — Kimball', url: 'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/' }
        ],
        questions: ['Почему Star Schema быстрее Snowflake Schema?', 'Как обновлять dimensions в Star Schema (SCD)?', 'Чем fact отличается от dimension?']
      },
      {
        name: 'Snowflake Schema',
        tag: 'schema', tagLabel: 'Схема',
        summary: 'Расширение Star Schema: Dimension таблицы нормализованы и разбиты на несколько связанных таблиц. Меньше дублей, больше JOIN.',
        short: 'Как Star Schema, но Dimensions нормализованы. dim_product → dim_category → dim_department. Меньше избыточности данных, сложнее запросы.',
        medium: {
          theory: 'Snowflake устраняет избыточность в Dimensions за счёт нормализации. Например, dim_product не хранит category_name — вместо этого есть FK на dim_category. Визуально схема напоминает снежинку из-за ветвления.',
          tradeoffs: 'Плюс: меньше избыточности, проще поддерживать dimensions. Минус: больше JOIN-ов → медленнее на больших данных, сложнее для аналитиков. Большинство практиков предпочитают Star Schema для Gold-слоя.',
          code: `-- Snowflake: нормализованные dimensions
fact_sales
  → dim_product (product_id, product_name, category_id)
      → dim_category (category_id, category_name, dept_id)
          → dim_department (dept_id, dept_name)

-- Запрос: 4 JOIN вместо 1
SELECT dept_name, SUM(f.amount)
FROM fact_sales f
JOIN dim_product    p  ON f.product_key = p.product_id
JOIN dim_category   c  ON p.category_id = c.category_id
JOIN dim_department d  ON c.dept_id     = d.dept_id
GROUP BY 1;`
        },
        tools: ['dbt', 'Snowflake', 'BigQuery', 'Redshift'],
        links: [
          { label: 'Snowflake vs Star — Matillion', url: 'https://www.matillion.com/blog/star-schema-vs-snowflake' }
        ],
        questions: ['Когда Snowflake Schema оправдана?', 'Почему современные cloud DWH делают Snowflake Schema менее актуальной?', 'Чем Snowflake Schema похожа на Inmon 3NF?']
      },
      {
        name: 'Galaxy Schema (Constellation)',
        tag: 'schema', tagLabel: 'Схема',
        summary: 'Несколько Fact таблиц, разделяющих общие Conformed Dimensions. Для сложных корпоративных DWH.',
        short: 'Несколько Fact таблиц (продажи, возвраты, доставка) используют одни и те же Dimensions (dim_date, dim_customer). Conformed Dimensions — ключ.',
        medium: {
          theory: 'Galaxy Schema = несколько Star Schema с общими Dimensions. fact_sales и fact_returns оба ссылаются на dim_customer и dim_date. Это позволяет анализировать разные бизнес-процессы в одном запросе через общие dimensions.',
          tradeoffs: 'Плюс: единая аналитика по нескольким процессам, Conformed Dimensions обеспечивают согласованность. Минус: сложность поддержки Conformed Dimensions, сложные запросы между Fact таблицами.',
          code: `-- Galaxy: два процесса, общие Dimensions
                dim_date        dim_customer
                   ↑   ↑        ↑    ↑
          fact_sales   fact_returns   fact_shipments
               ↓                          ↓
          dim_product               dim_carrier

-- Анализ: продажи vs возвраты по клиентам
SELECT c.segment,
  SUM(s.amount)   AS revenue,
  SUM(r.amount)   AS refunds,
  SUM(s.amount) - SUM(r.amount) AS net
FROM dim_customer c
JOIN fact_sales   s ON c.customer_key = s.customer_key
JOIN fact_returns r ON c.customer_key = r.customer_key
GROUP BY 1;`
        },
        tools: ['dbt', 'Snowflake', 'BigQuery', 'Tableau'],
        links: [{ label: 'Galaxy Schema — Exasol', url: 'https://www.exasol.com/hub/data-warehouse/schemas/' }],
        questions: ['Что такое Conformed Dimension?', 'Как Galaxy Schema соотносится с Kimball методологией?', 'Сколько Fact таблиц допустимо в Galaxy Schema?']
      },
      {
        name: 'One Big Table (OBT)',
        tag: 'schema', tagLabel: 'Схема',
        summary: 'Все данные в одной широкой денормализованной таблице. Максимальная скорость запросов, минимум JOIN. Популярен для ML feature stores.',
        short: 'Вместо Fact + Dimensions — одна таблица с сотнями колонок. Нет JOIN, нет сложности. Columnar storage делает это практичным. Подход "скаляем хранилище, не запросы".',
        medium: {
          theory: 'OBT — анти-нормализация в крайней форме. Вся аналитическая таблица содержит все нужные колонки: customer_name, product_name, category, region — всё в одной строке. Работает благодаря columnar compression: неиспользуемые колонки не читаются.',
          tradeoffs: 'Плюс: максимально быстрые запросы, простота для аналитиков, нет JOIN overhead. Минус: огромная избыточность данных, UPDATE одного атрибута = перезапись, сложно поддерживать при изменении схемы. Подходит для конечного слоя (Gold/Reporting).',
          code: `-- OBT: всё в одной строке продажи
CREATE TABLE obt_sales AS
SELECT
  o.order_id,
  o.created_at,
  c.customer_name,
  c.customer_segment,
  c.customer_city,
  p.product_name,
  p.product_category,
  p.product_brand,
  s.store_name,
  s.store_region,
  o.quantity,
  o.amount,
  o.discount_pct
FROM orders o
JOIN customers c USING(customer_id)
JOIN products  p USING(product_id)
JOIN stores    s USING(store_id);
-- Дальше аналитики просто: SELECT * FROM obt_sales WHERE ...`
        },
        tools: ['dbt', 'BigQuery', 'Snowflake', 'DuckDB', 'ClickHouse'],
        links: [{ label: 'OBT vs Star Schema', url: 'https://www.blockmill.co.uk/post/how-to-choose-the-right-data-modelling-technique-for-your-project' }],
        questions: ['Почему OBT работает в columnar storage?', 'Когда OBT предпочтительнее Star Schema?', 'Как OBT связан с ML Feature Store?']
      }
    ]
  },);
