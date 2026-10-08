window.SECTIONS = window.SECTIONS || [];
window.SECTIONS.push(  {
    id: 'processing', title: 'Архитектуры обработки', icon: '⚡',
    iconBg: '#EEF3FE', desc: 'Как организовать потоки данных в масштабе',
    topics: [
      {
        name: 'Lambda Architecture',
        tag: 'arch', tagLabel: 'Архитектура',
        summary: 'Обрабатывает данные двумя путями параллельно: batch (точность) + speed (скорость). Serving layer объединяет результаты.',
        short: 'Три слоя: Batch Layer (полные исторические данные, высокая точность), Speed Layer (real-time, низкая задержка), Serving Layer (объединяет batch и speed views для запросов).',
        medium: {
          theory: 'Предложена Nathan Marz (2011). Batch layer перерабатывает все исторические данные с высокой точностью (Hadoop, Spark). Speed layer обрабатывает только свежие данные с малой задержкой (Flink, Storm). Serving layer хранит precomputed batch views + incremental real-time views.',
          tradeoffs: 'Плюс: отказоустойчивость, точность batch при наличии real-time. Минус: дублирование логики в двух слоях (batch и speed), высокая операционная сложность, задержка batch-обновлений (часы).',
          code: `Batch Layer:   [Raw Data Store] → [Spark/Hadoop batch job] → [Batch Views]
                     ↑                                                        ↓
Speed Layer:   [Kafka] → [Flink/Storm streaming] → [Speed Views]           [Serving Layer]
                                                         ↓                    ↑
                                              объединяет batch + speed views для запросов`
        },
        tools: ['Apache Hadoop', 'Apache Spark', 'Apache Flink', 'Apache Storm', 'Apache Kafka', 'HBase', 'Cassandra'],
        links: [
          { label: 'How to beat the CAP theorem — Nathan Marz', url: 'http://nathanmarz.com/blog/how-to-beat-the-cap-theorem.html' },
          { label: 'Lambda — Microsoft', url: 'https://learn.microsoft.com/en-us/azure/architecture/databases/guide/big-data-architectures' }
        ],
        questions: ['Почему логику нужно писать дважды в Lambda?', 'Как Kappa устраняет главный недостаток Lambda?', 'Когда Lambda оправдана несмотря на сложность?']
      },
      {
        name: 'Kappa Architecture',
        tag: 'arch', tagLabel: 'Архитектура',
        summary: 'Упрощение Lambda: только один путь — стриминг. Batch заменяется replay событий из immutable лога.',
        short: 'Один стриминговый слой обрабатывает и real-time, и исторические данные. Replay Kafka с начала = "переработать" исторические данные. Нет дублирования логики.',
        medium: {
          theory: 'Предложена Jay Kreps (LinkedIn, 2014). Ключевая идея: если система стриминга достаточно быстрая, batch не нужен. Пересчёт истории = запустить новый consumer group с offset=0 в Kafka. Весь лог событий хранится в Kafka (retention может быть бесконечным).',
          tradeoffs: 'Плюс: одна кодовая база, проще поддерживать, меньше инфраструктуры. Минус: Kafka должен хранить полную историю (дорого), replay занимает время, сложные batch-агрегации неудобны в стриминге.',
          code: `[Event Sources] → [Kafka (immutable log, retention=∞)] → [Flink/Spark Streaming]
                                          ↑                                        ↓
                               replay с offset=0                         [Serving DB / Data Store]
                               для пересчёта истории                              ↓
                                                                         [Query API / Dashboard]`
        },
        tools: ['Apache Kafka', 'Apache Flink', 'Spark Structured Streaming', 'Apache Samza', 'ksqlDB'],
        links: [
          { label: 'Kappa Architecture — Jay Kreps', url: 'https://www.oreilly.com/radar/questioning-the-lambda-architecture/' },
          { label: 'Kappa — Microsoft', url: 'https://learn.microsoft.com/en-us/azure/architecture/databases/guide/big-data-architectures' }
        ],
        questions: ['Как сделать replay в Kappa без остановки системы?', 'Почему стоимость хранения Kafka — ключевой trade-off?', 'Когда Lambda предпочтительнее Kappa?']
      },
      {
        name: 'Medallion Architecture (Bronze → Silver → Gold)',
        tag: 'arch', tagLabel: 'Архитектура',
        summary: 'Многослойная организация данных в Lakehouse: сырые данные → очищенные → готовые для аналитики.',
        short: 'Bronze: сырые данные как есть (landing zone). Silver: очищенные, дедуплицированные, обогащённые. Gold: агрегированные, бизнес-готовые для дашбордов и ML.',
        medium: {
          theory: 'Паттерн Databricks/Delta Lake. Bronze — append-only, полная история изменений, данные не изменяются. Silver — применены бизнес-правила, типизация, joins между источниками. Gold — денормализованные витрины данных под конкретные use cases (finance_summary, user_cohorts).',
          tradeoffs: 'Плюс: чёткое разделение ответственности, возможность переработать любой слой, audit trail. Минус: хранение данных в 3 копиях, задержка между слоями, нужна оркестрация пайплайнов.',
          code: `Bronze (Raw):   orders_raw      ← CSV, JSON, CDC as-is, никогда не меняется
                   users_raw
                   events_raw

Silver (Cleaned): orders_clean   ← типизация, дедупликация, базовые joins
                   users_clean    ← валидация email, нормализация имён
                   events_parsed  ← парсинг JSON-полей, фильтрация мусора

Gold (Business):  sales_daily    ← агрегаты по дням/регионам
                   user_cohorts   ← аналитика поведения
                   revenue_report ← для дашборда CFO`
        },
        tools: ['Delta Lake', 'Apache Iceberg', 'Apache Hudi', 'Databricks', 'Apache Spark', 'dbt'],
        links: [
          { label: 'Medallion Architecture — Databricks', url: 'https://www.databricks.com/glossary/medallion-architecture' },
          { label: 'Delta Lake docs', url: 'https://docs.delta.io/latest/index.html' }
        ],
        questions: ['Можно ли обновлять Bronze данные?', 'Как организовать переработку Silver при изменении бизнес-правил?', 'Чем Gold отличается от Data Mart?']
      }
    ]
  },);
