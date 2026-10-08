window.SECTIONS = window.SECTIONS || [];
window.SECTIONS.push(  {
    id: 'patterns', title: 'Паттерны данных', icon: '🔄',
    iconBg: '#F3E8FF', desc: 'Распространённые подходы к организации data pipelines',
    topics: [
      {
        name: 'Data Mesh',
        tag: 'arch', tagLabel: 'Архитектура',
        summary: 'Децентрализованный подход: команды доменов владеют своими данными как продуктами. Противоположность централизованного data lake.',
        short: '4 принципа: Domain Ownership (команда домена владеет данными), Data as a Product (данные — продукт с SLA), Self-Serve Platform (инфра не требует экспертизы), Federated Governance (общие стандарты без централизации).',
        medium: {
          theory: 'Предложена Zhamak Dehghani (ThoughtWorks, 2019). Проблема централизованных data lake: центральная data-команда становится bottleneck, данные теряют контекст при передаче. Data Mesh: команда orders сама отвечает за orders data product — качество, схему, SLA.',
          tradeoffs: 'Плюс: масштабируется с ростом организации, данные ближе к экспертам домена, устраняет central bottleneck. Минус: высокие требования к зрелости команд, сложнее обеспечить консистентность, нужна мощная self-serve платформа.',
          code: `Централизованный Data Lake (проблема):
  [Orders] ──→ │               │
  [Users]  ──→ │ Central Lake  │ ←── Central Data Team (bottleneck)
  [Payments]→  │               │

Data Mesh (решение):
  [Orders Domain] → orders_data_product (SLA: 99.9%, freshness: 1h)
       ↓                    ↓
  Domain Team        [Data Catalog / Discovery]
  owns quality              ↑
                   [Users Domain] → users_data_product
                   [Payments Domain] → payments_data_product`
        },
        tools: ['Dataplex (GCP)', 'Microsoft Purview', 'Apache Atlas', 'DataHub', 'Amundsen', 'dbt', 'Backstage'],
        links: [
          { label: 'Data Mesh — Zhamak Dehghani', url: 'https://martinfowler.com/articles/data-mesh-principles.html' },
          { label: 'datamesh-architecture.com', url: 'https://www.datamesh-architecture.com/' }
        ],
        questions: ['Что такое "data as a product" на практике?', 'Как Data Mesh связан с DDD Bounded Contexts?', 'Когда Data Mesh избыточен?']
      },
      {
        name: 'Change Data Capture (CDC)',
        tag: 'pipeline', tagLabel: 'Паттерн',
        summary: 'Захват изменений из БД в реальном времени — без polling и без нагрузки на source систему.',
        short: 'CDC читает transaction log (WAL в Postgres, binlog в MySQL) и публикует каждое INSERT/UPDATE/DELETE как событие в Kafka. Нулевая нагрузка на source БД.',
        medium: {
          theory: 'Подходы: Log-based CDC (Debezium читает WAL — рекомендуется), Query-based (SELECT WHERE updated_at > last_run — polling, нагружает БД), Trigger-based (trigg в БД — замедляет writes). Log-based: субмиллисекундная задержка, полная история, не влияет на производительность source.',
          tradeoffs: 'Плюс: низкая задержка, нет нагрузки на source, захватывает все изменения включая DELETE. Минус: зависимость от структуры transaction log (разный для каждой БД), schema changes требуют внимания, Debezium — дополнительный компонент.',
          code: `# Debezium connector config (Postgres WAL → Kafka):
{
  "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
  "database.hostname": "postgres",
  "database.dbname": "production",
  "table.include.list": "public.orders,public.users",
  "slot.name": "debezium_slot",
  "publication.name": "debezium_pub",
  "topic.prefix": "prod"
}

# Kafka topic: prod.public.orders
# Каждое сообщение содержит:
{
  "op": "u",          # u=update, c=create, d=delete, r=snapshot
  "before": { "id": 1, "status": "pending" },
  "after":  { "id": 1, "status": "shipped" },
  "ts_ms": 1716000000000
}`
        },
        tools: ['Debezium', 'Apache Kafka', 'AWS DMS', 'Airbyte CDC', 'Striim', 'Fivetran'],
        links: [
          { label: 'Debezium docs', url: 'https://debezium.io/documentation/reference/stable/' },
          { label: 'CDC patterns — Microsoft', url: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing' }
        ],
        questions: ['Чем log-based CDC лучше query-based?', 'Как CDC связан с Event Sourcing?', 'Что происходит при schema change в source таблице?']
      },
      {
        name: 'Materialized View',
        tag: 'pattern', tagLabel: 'Паттерн',
        summary: 'Предвычисленный результат сложного запроса, хранящийся как таблица. Быстрые чтения ценой задержки обновления.',
        short: 'Вместо того чтобы каждый раз выполнять тяжёлый JOIN/агрегат — результат вычислен заранее и хранится физически. Обновляется по расписанию или триггером.',
        medium: {
          theory: 'Разновидности: Standard Materialized View (полный refresh по расписанию), Incremental Materialized View (обновляет только изменившиеся строки), Streaming Materialized View (обновляется в реальном времени через Flink/ksqlDB). В DWH Gold-слой Medallion Architecture — фактически materialized views.',
          tradeoffs: 'Плюс: запросы к аналитике ускоряются в 100-1000x, снижает нагрузку на OLTP. Минус: данные могут быть устаревшими (staleness), хранение дополнительных данных, сложность инвалидации.',
          code: `-- Стандартная Materialized View (PostgreSQL):
CREATE MATERIALIZED VIEW daily_revenue AS
  SELECT
    DATE(created_at)      AS day,
    product_category,
    SUM(amount)           AS total_revenue,
    COUNT(*)              AS order_count
  FROM orders
  WHERE status = 'completed'
  GROUP BY 1, 2;

-- Полный refresh (по расписанию через pg_cron):
REFRESH MATERIALIZED VIEW CONCURRENTLY daily_revenue;

-- Incremental в dbt (только новые строки):
{{ config(materialized='incremental',
          unique_key='day',
          incremental_strategy='merge') }}
SELECT ...
{% if is_incremental() %}
  WHERE created_at >= (SELECT MAX(day) FROM {{ this }})
{% endif %}`
        },
        tools: ['PostgreSQL', 'dbt', 'Apache Flink', 'ksqlDB', 'Snowflake', 'BigQuery', 'Redshift'],
        links: [
          { label: 'Materialized View — Microsoft', url: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/materialized-view' },
          { label: 'dbt incremental models', url: 'https://docs.getdbt.com/docs/build/incremental-models' }
        ],
        questions: ['Как выбрать стратегию refresh: full vs incremental?', 'Что такое CONCURRENTLY refresh и зачем?', 'Как Streaming Materialized View отличается от обычной?']
      }
    ]
  });
