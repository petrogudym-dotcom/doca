window.SECTIONS = window.SECTIONS || [];
window.SECTIONS.push(  {
    id: 'storage', title: 'Хранилища и платформы', icon: '🗄️',
    iconBg: '#FFF8E1', desc: 'Где и как хранить большие данные',
    topics: [
      {
        name: 'Data Lakehouse',
        tag: 'storage', tagLabel: 'Платформа',
        summary: 'Data Lake + свойства Data Warehouse: ACID-транзакции, схема, производительность запросов — на дешёвом объектном хранилище.',
        short: 'Хранит сырые данные в открытых форматах (Parquet/ORC) на S3/ADLS. Поверх — транзакционный слой (Delta Lake, Iceberg, Hudi). Поддерживает SQL, ML, стриминг с одной платформы.',
        medium: {
          theory: 'Традиционно: Data Lake (дёшево, гибко, но нет ACID и производительности) vs Data Warehouse (быстро, структурированно, но дорого и жёстко). Lakehouse объединяет оба подхода через metadata layer поверх object storage: ACID-транзакции, schema enforcement, time travel, upserts/deletes.',
          tradeoffs: 'Плюс: один источник истины для BI и ML, дёшево хранить, open formats (нет vendor lock-in). Минус: сложнее настроить чем готовый DWH, query performance хуже чем у специализированных DWH (Snowflake, BigQuery) на сложных аналитических запросах.',
          code: `┌─────────────────────────────────────────────┐
│              Query Engine                    │
│  (Spark, Trino, Presto, Flink, DuckDB)      │
├─────────────────────────────────────────────┤
│         Table Format / Metadata Layer        │
│  (Delta Lake / Apache Iceberg / Apache Hudi) │
│  • ACID transactions  • Time travel          │
│  • Schema evolution   • Upserts/Deletes      │
├─────────────────────────────────────────────┤
│            Object Storage                    │
│  (AWS S3 / Azure ADLS / GCS)                │
│  Parquet / ORC / Avro files                  │
└─────────────────────────────────────────────┘`
        },
        tools: ['Delta Lake', 'Apache Iceberg', 'Apache Hudi', 'Databricks', 'Apache Spark', 'Trino', 'AWS S3', 'Azure ADLS'],
        links: [
          { label: 'Lakehouse paper (Databricks)', url: 'https://www.cidrdb.org/cidr2021/papers/cidr2021_paper17.pdf' },
          { label: 'Lakehouse — Microsoft', url: 'https://learn.microsoft.com/en-us/azure/architecture/databases/guide/big-data-architectures' },
          { label: 'Apache Iceberg docs', url: 'https://iceberg.apache.org/docs/latest/' }
        ],
        questions: ['Чем Delta Lake отличается от Apache Iceberg?', 'Что такое time travel в контексте Lakehouse?', 'Когда Data Warehouse лучше Lakehouse?']
      },
      {
        name: 'ELT vs ETL',
        tag: 'pipeline', tagLabel: 'Паттерн',
        summary: 'ETL: трансформируй до загрузки. ELT: загружай сырым, трансформируй внутри хранилища. Современный cloud DWH сделал ELT стандартом.',
        short: 'ETL (Extract → Transform → Load): трансформация в отдельном слое до загрузки. ELT (Extract → Load → Transform): сырые данные в DWH/Lakehouse, трансформации через SQL внутри.',
        medium: {
          theory: 'ETL исторически нужен был из-за дорогих хранилищ (нельзя хранить сырьё). Cloud DWH (Snowflake, BigQuery, Redshift) и Lakehouse сделали хранение дешёвым. ELT: загружаем всё, трансформируем SQL (dbt). Преимущество: сырые данные всегда доступны для переработки.',
          tradeoffs: 'ETL плюс: меньше данных в хранилище, приватность (PII можно удалить до загрузки). ELT плюс: проще pipeline, сырые данные сохранены, трансформации версионируются через Git (dbt). ELT минус: сырые данные могут содержать PII, нужен доступ к мощному DWH.',
          code: `# ETL (старый подход):
source_data → [Python/Spark трансформация] → [cleaned data] → DWH
# Минус: сырые данные теряются, сложно переработать

# ELT с dbt (современный подход):
source_data → [Fivetran/Airbyte загрузка] → DWH (raw schema)
                                               ↓
                                          [dbt SQL модели]
                                               ↓
                                        DWH (staging → marts)

# dbt модель (SQL + Jinja):
-- models/staging/stg_orders.sql
SELECT
  id AS order_id,
  user_id,
  created_at::DATE AS order_date,
  amount / 100.0  AS amount_usd  -- cents → dollars
FROM {{ source('raw', 'orders') }}`
        },
        tools: ['dbt', 'Fivetran', 'Airbyte', 'Apache Spark', 'AWS Glue', 'Azure Data Factory', 'Snowflake', 'BigQuery'],
        links: [
          { label: 'dbt docs', url: 'https://docs.getdbt.com/' },
          { label: 'ETL vs ELT — Fivetran', url: 'https://www.fivetran.com/blog/etl-vs-elt' }
        ],
        questions: ['Почему ELT стал стандартом с Cloud DWH?', 'Как dbt вписывается в ELT?', 'Когда ETL по-прежнему нужен?']
      }
    ]
  },);
