window.SECTIONS = window.SECTIONS || [];
window.SECTIONS.push(  {
    id:'styles', title:'Архитектурные стили', icon:'🏛️', iconBg:'#E8F5E9',
    topics:[
      {
        name:'Monolith', tag:'style', tagLabel:'Стиль',
        summary:'Всё приложение — один деплоймент. Простота разработки, сложность масштабирования.',
        short:'Единый деплойный артефакт. UI, бизнес-логика и БД в одном приложении. Отличный старт для большинства проектов.',
        medium:{
          theory:'Monolith — все компоненты работают в одном процессе. Легко разрабатывать, отлаживать, тестировать. Становится проблемой при росте команды и необходимости независимого масштабирования частей.',
          tradeoffs:'Плюс: простота, нет сетевых задержек, ACID-транзакции. Минус: всё масштабируется вместе, технологический lock-in, сложный CI при большой команде.',
          code:`// Структура Modular Monolith — лучший вариант монолита:
src/
  modules/
    orders/     ← изолированный модуль (свои entity, service, repo)
    users/      ← изолированный модуль
    payments/   ← изолированный модуль
  shared/       ← общие утилиты, интерфейсы
  main.ts`
        },
        links:[
          {label:'Monolith First — Fowler', url:'https://martinfowler.com/bliki/MonolithFirst.html'},
          {label:'Modular Monolith', url:'https://www.milanjovanovic.tech/blog/what-is-a-modular-monolith'}
        ],
        questions:['Когда монолит лучше микросервисов?','Что такое Modular Monolith?','Как правильно декомпозировать монолит на сервисы?']
      },
      {
        name:'Microservices', tag:'style', tagLabel:'Стиль',
        summary:'Приложение — набор маленьких независимых сервисов, каждый со своей БД.',
        short:'Независимые сервисы по бизнес-доменам (bounded contexts). Каждый деплоится, масштабируется и разрабатывается отдельно.',
        medium:{
          theory:'Принципы: single responsibility на уровне сервиса, loose coupling, high cohesion. Database per Service — у каждого своя БД. Взаимодействие через API (sync) или события (async).',
          tradeoffs:'Плюс: независимый деплой, масштабирование, технологическая свобода. Минус: сетевые задержки, распределённые транзакции, операционная сложность.',
          code:`// Каждый сервис — отдельный процесс и БД:
Order Service   → POST /orders    → orders-db (Postgres)
Payment Service → POST /payments  → payments-db (Postgres)
User Service    → GET  /users/:id → users-db (MongoDB)

// Async взаимодействие через события:
order-created → [Kafka] → payment-service
                        → notification-service`
        },
        links:[
          {label:'Microservices — Fowler', url:'https://martinfowler.com/articles/microservices.html'},
          {label:'Microservices Patterns', url:'https://microservices.io/patterns/'}
        ],
        questions:['Как определить границы сервиса (bounded context)?','Как решать распределённые транзакции?','Что такое strangler fig pattern?']
      },
      {
        name:'Event-Driven', tag:'style', tagLabel:'Стиль',
        summary:'Компоненты общаются через события асинхронно. Слабая связанность, высокая масштабируемость.',
        short:'Продюсеры публикуют события, консьюмеры подписываются. Никто не знает о существовании других напрямую.',
        medium:{
          theory:'Паттерны: Event Notification (уведомление), Event-Carried State Transfer (событие несёт данные), Event Sourcing (события как источник истины). Брокеры: Kafka, RabbitMQ, NATS.',
          tradeoffs:'Плюс: слабая связность, масштабируемость, отказоустойчивость. Минус: eventual consistency, сложность отладки, гарантии порядка событий.',
          code:`// Producer (Order Service):
eventBus.publish('order.created', {
  orderId: '123',
  userId: 'u456',
  amount: 500,
  items: [...]
})

// Consumer (Payment Service):
eventBus.subscribe('order.created', async (event) => {
  await processPayment(event.orderId, event.amount)
})`
        },
        links:[
          {label:'Event-Driven — Fowler', url:'https://martinfowler.com/articles/201701-event-driven.html'},
          {label:'Apache Kafka docs', url:'https://kafka.apache.org/documentation/'}
        ],
        questions:['В чём разница между Event Notification и Event Sourcing?','Как обеспечить порядок обработки событий?','Что такое consumer group?']
      },
      {
        name:'Layered / Clean Architecture', tag:'style', tagLabel:'Стиль',
        summary:'Приложение делится на слои: Presentation → Application → Domain → Infrastructure.',
        short:'Классическая N-tier. В Clean Architecture зависимости направлены только внутрь — к Domain.',
        medium:{
          theory:'Слои: Presentation (UI/API), Application (use cases), Domain (бизнес-логика, entities), Infrastructure (БД, внешние API). Главное правило Clean Architecture: Domain не знает ни о чём внешнем.',
          tradeoffs:'Плюс: понятность, хорошая структура, тестируемость Domain без БД. Минус: много файлов, изменение сквозной функции затрагивает все слои.',
          code:`// Правило зависимостей — стрелки только внутрь:
Presentation → Application → Domain ← (нет зависимостей)
Infrastructure → Application → Domain

src/
  domain/         // entities, value objects, interfaces
  application/    // use cases (OrderService, CreateOrderUseCase)
  infrastructure/ // OrderRepository, EmailService (реализации)
  presentation/   // controllers, DTOs`
        },
        links:[{label:'Clean Architecture — Uncle Bob', url:'https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html'}],
        questions:['Чем Clean Architecture отличается от обычной layered?','Что такое Anti-Corruption Layer?','Зачем использовать интерфейсы в Domain?']
      }
    ]
  },);
