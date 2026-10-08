window.SECTIONS = window.SECTIONS || [];
window.SECTIONS.push(  {
    id: 'methodologies', title: 'Методологии', icon: '🏗️',
    iconBg: '#EDF3FF', desc: 'Философии построения DWH — Kimball, Inmon, Data Vault',
    topics: [
      {
        name: 'Kimball (Dimensional Modeling)',
        tag: 'method', tagLabel: 'Методология',
        summary: 'Bottom-up подход: сначала Data Marts под конкретные бизнес-процессы, из которых складывается DWH. Star/Snowflake схемы. Самый популярный подход.',
        short: 'Строим от конкретного бизнес-процесса вверх. Каждый Data Mart — Star Schema с Fact + Dimension таблицами. DWH = набор согласованных (conformed) Data Marts.',
        medium: {
          theory: 'Ralph Kimball (1996). 4 шага: 1) выбрать бизнес-процесс (продажи, доставка), 2) определить grain (уровень детализации строки), 3) определить dimensions, 4) определить facts. Conformed Dimensions — одна dim_date, dim_customer для всех Marts.',
          tradeoffs: 'Плюс: быстро доставляет ценность, понятно бизнесу, отличная производительность запросов. Минус: Conformed Dimensions сложно поддерживать при росте, Data Marts могут расходиться без строгой дисциплины.',
          code: `-- Grain: одна строка = одна продажа
-- Fact Table:
CREATE TABLE fact_sales (
  sale_id       INT,
  date_key      INT  REFERENCES dim_date,      -- Conformed
  customer_key  INT  REFERENCES dim_customer,  -- Conformed
  product_key   INT  REFERENCES dim_product,
  store_key     INT  REFERENCES dim_store,
  quantity      INT,
  amount        DECIMAL(10,2),
  discount      DECIMAL(5,2)
);`
        },
        tools: ['dbt', 'Snowflake', 'BigQuery', 'Redshift', 'Looker'],
        links: [
          { label: 'The Data Warehouse Toolkit (Kimball)', url: 'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/books/data-warehouse-dw-toolkit/' },
          { label: 'Kimball Group', url: 'https://www.kimballgroup.com/' }
        ],
        questions: ['Что такое grain и почему его важно объявить первым?', 'Что такое Conformed Dimension и почему это сложно?', 'Чем Kimball отличается от Inmon на практике?']
      },
      {
        name: 'Inmon (3NF / Enterprise DWH)',
        tag: 'method', tagLabel: 'Методология',
        summary: 'Top-down подход: сначала единый нормализованный (3NF) корпоративный DWH, потом Data Marts как представления поверх него.',
        short: 'Bill Inmon: DWH = subject-oriented, integrated, non-volatile, time-variant. Центральный DWH в 3NF — единый источник истины. Data Marts строятся сверху как витрины.',
        medium: {
          theory: 'Inmon (1990). Центральный DWH хранит данные в Third Normal Form (3NF) — минимальная избыточность, максимальная целостность. Data Marts — агрегированные, денормализованные представления для конкретных отделов (finance, marketing).',
          tradeoffs: 'Плюс: единый источник истины, высокая целостность данных, устойчив к изменениям бизнеса. Минус: долго до первой ценности, сложные запросы из-за множества JOIN, требует сильной data-команды.',
          code: `-- 3NF: нормализованные таблицы без избыточности
-- Клиент и адрес — раздельно:
CREATE TABLE customer (customer_id INT PRIMARY KEY, name VARCHAR);
CREATE TABLE address  (address_id INT PRIMARY KEY, customer_id INT, street VARCHAR, city VARCHAR);
CREATE TABLE order    (order_id INT PRIMARY KEY, customer_id INT, date DATE, total DECIMAL);

-- Data Mart поверх — денормализованный для аналитики:
CREATE VIEW sales_mart AS
  SELECT o.order_id, c.name, a.city, o.total, o.date
  FROM order o JOIN customer c USING(customer_id)
               JOIN address  a USING(customer_id);`
        },
        tools: ['Oracle', 'Teradata', 'IBM Db2', 'SQL Server'],
        links: [
          { label: 'Building the Data Warehouse (Inmon)', url: 'https://www.amazon.com/Building-Data-Warehouse-W-Inmon/dp/0764599445' },
          { label: 'Inmon vs Kimball', url: 'https://www.zentut.com/data-warehouse/kimball-and-inmon-data-warehouse-architectures/' }
        ],
        questions: ['В чём главное отличие Inmon от Kimball?', 'Почему Inmon медленнее доставляет ценность?', 'Когда Inmon предпочтительнее?']
      },
      {
        name: 'Data Vault 2.0',
        tag: 'method', tagLabel: 'Методология',
        summary: 'Hub-and-Spoke методология: Hubs (бизнес-ключи) + Links (связи) + Satellites (атрибуты). Заточена под аудит, историзацию и гибкость.',
        short: 'Hub — уникальный бизнес-ключ (customer_id). Link — связь между Hubs (заказ клиента). Satellite — атрибуты и история изменений Hub или Link. Все данные append-only.',
        medium: {
          theory: 'Dan Linstedt (2000). Три типа таблиц: Hub (бизнес-ключ + hash + load_date + record_source), Link (FK на Hubs + hash + load_date), Satellite (FK на Hub/Link + все атрибуты + load_date + end_date). Весь Data Vault — append-only, никаких UPDATE.',
          tradeoffs: 'Плюс: полный audit trail, легко добавлять новые источники без переработки, параллельная загрузка. Минус: очень много таблиц, сложные запросы, нужен опытный архитектор, производительность без Gold-слоя плохая.',
          code: `-- Hub: только бизнес-ключ
CREATE TABLE hub_customer (
  hub_customer_hk  CHAR(32) PRIMARY KEY, -- MD5(customer_id)
  customer_id      VARCHAR NOT NULL,      -- бизнес-ключ
  load_date        TIMESTAMP,
  record_source    VARCHAR                -- 'CRM', 'SHOPIFY' и т.д.
);

-- Satellite: все атрибуты с историей
CREATE TABLE sat_customer_details (
  hub_customer_hk  CHAR(32),
  load_date        TIMESTAMP,
  end_date         TIMESTAMP,            -- NULL = текущая запись
  name             VARCHAR,
  email            VARCHAR,
  city             VARCHAR,
  PRIMARY KEY (hub_customer_hk, load_date)
);`
        },
        tools: ['dbt', 'AutomateDV', 'dbtvault', 'Snowflake', 'Azure Synapse'],
        links: [
          { label: 'Data Vault Alliance', url: 'https://datavaultalliance.com/' },
          { label: 'dbtvault docs', url: 'https://automate-dv.readthedocs.io/' }
        ],
        questions: ['Чем Hub отличается от Dimension таблицы?', 'Почему Data Vault append-only?', 'Зачем нужен Gold/Mart слой поверх Data Vault?']
      }
    ]
  },);
