window.SECTIONS = window.SECTIONS || [];
window.SECTIONS.push(  {
    id:'integration', title:'Паттерны интеграции', icon:'🔗', iconBg:'#E3F2FD',
    topics:[
      {
        name:'API Gateway', tag:'pattern', tagLabel:'Паттерн',
        summary:'Единая точка входа для клиентов. Маршрутизация, аутентификация, rate limiting.',
        short:'Gateway принимает все запросы клиентов и направляет к нужным сервисам. Снимает cross-cutting concerns с сервисов.',
        medium:{
          theory:'Gateway отвечает за: routing, auth, rate limiting, SSL termination, request aggregation, logging. BFF (Backend For Frontend) — вариант Gateway, адаптированный под конкретный тип клиента.',
          tradeoffs:'Плюс: единое место для сквозной логики, упрощение клиентов. Минус: Single Point of Failure, дополнительная задержка, риск God Gateway.',
          code:`# NGINX как простой API Gateway:
location /api/orders {
    proxy_pass http://order-service:3001;
    proxy_set_header Authorization $http_authorization;
}
location /api/users {
    proxy_pass http://user-service:3002;
}
location /api/payments {
    proxy_pass http://payment-service:3003;
}`
        },
        links:[
          {label:'API Gateway pattern', url:'https://microservices.io/patterns/apigateway.html'},
          {label:'BFF pattern', url:'https://samnewman.io/patterns/architectural/bff/'}
        ],
        questions:['Чем API Gateway отличается от Load Balancer?','Когда нужен BFF вместо единого Gateway?','Как избежать God Gateway?']
      },
      {
        name:'CQRS', tag:'pattern', tagLabel:'Паттерн',
        summary:'Command Query Responsibility Segregation — разделение операций чтения и записи.',
        short:'Команды (запись) и запросы (чтение) — разные модели. Позволяет оптимизировать каждую сторону независимо.',
        medium:{
          theory:'Command изменяет состояние, не возвращает данные. Query возвращает данные, не изменяет состояние. Read model оптимизирована для запросов (денормализована). Часто сочетается с Event Sourcing.',
          tradeoffs:'Плюс: масштабирование чтения отдельно, оптимизация каждой стороны, ясность кода. Минус: сложность, eventual consistency между write и read model.',
          code:`// Write side (команда):
class CreateOrderCommand {
  constructor(public userId: string, public items: Item[]) {}
}
class OrderCommandHandler {
  handle(cmd: CreateOrderCommand) {
    const order = Order.create(cmd.userId, cmd.items)
    this.repo.save(order)
    this.eventBus.publish(new OrderCreatedEvent(order))
  }
}

// Read side (денормализованная проекция):
interface OrderReadModel {
  id: string
  userName: string    // ← из User таблицы, денормализовано
  totalAmount: number // ← вычислено заранее
  itemCount: number
}`
        },
        links:[{label:'CQRS — Fowler', url:'https://martinfowler.com/bliki/CQRS.html'}],
        questions:['Всегда ли нужен CQRS с Event Sourcing?','Как синхронизировать read и write модели?','Когда CQRS избыточен?']
      },
      {
        name:'Saga', tag:'pattern', tagLabel:'Паттерн',
        summary:'Управление распределёнными транзакциями через цепочку локальных транзакций.',
        short:'Вместо распределённой транзакции — серия локальных с компенсирующими действиями при сбое.',
        medium:{
          theory:'Два подхода: Choreography (сервисы слушают события друг друга, нет центрального координатора) и Orchestration (оркестратор управляет шагами Saga). Каждый шаг имеет компенсирующую транзакцию.',
          tradeoffs:'Плюс: нет распределённых блокировок, отказоустойчивость. Минус: eventual consistency, сложность компенсационной логики, дебаг.',
          code:`// Orchestration Saga:
class OrderSaga {
  async execute(orderId: string) {
    try {
      await paymentService.charge(orderId)       // шаг 1
      await inventoryService.reserve(orderId)    // шаг 2
      await shippingService.schedule(orderId)    // шаг 3
    } catch(e) {
      // Компенсирующие транзакции (откат):
      if (e.failedStep >= 2) await paymentService.refund(orderId)
      if (e.failedStep >= 3) await inventoryService.release(orderId)
    }
  }
}`
        },
        links:[{label:'Saga pattern', url:'https://microservices.io/patterns/data/saga.html'}],
        questions:['Choreography vs Orchestration — что выбрать?','Как обеспечить идемпотентность компенсаций?','Что такое semantic lock?']
      },
      {
        name:'Event Sourcing', tag:'pattern', tagLabel:'Паттерн',
        summary:'Состояние системы хранится как последовательность событий, а не как текущие данные.',
        short:'Вместо UPDATE хранить все события: AccountCreated, MoneyDeposited, MoneyWithdrawn. Состояние = replay событий.',
        medium:{
          theory:'Event Store — неизменяемый лог событий. Текущее состояние воссоздаётся replay-ем. Snapshots ускоряют восстановление при большом количестве событий. Позволяет temporal queries.',
          tradeoffs:'Плюс: полная история, audit log, temporal queries, отличная debuggability. Минус: сложность запросов, необходимость versioning событий при изменении схемы.',
          code:`// Aggregate восстанавливается из событий:
class BankAccount {
  balance = 0; version = 0

  apply(event: DomainEvent) {
    if (event instanceof MoneyDeposited)
      this.balance += event.amount
    if (event instanceof MoneyWithdrawn)
      this.balance -= event.amount
    this.version++
  }

  static restore(events: DomainEvent[]): BankAccount {
    const acc = new BankAccount()
    events.forEach(e => acc.apply(e))
    return acc
  }
}`
        },
        links:[{label:'Event Sourcing — Fowler', url:'https://martinfowler.com/eaaDev/EventSourcing.html'}],
        questions:['Как изменить схему события после релиза?','Когда снапшоты необходимы?','Как Event Sourcing связан с CQRS?']
      },
      {
        name:'Outbox Pattern', tag:'pattern', tagLabel:'Паттерн',
        summary:'Гарантированная публикация событий: сначала сохранить событие в БД, потом отправить в брокер.',
        short:'Транзакционно записываем событие в таблицу outbox вместе с бизнес-данными. Отдельный процесс читает outbox и публикует в Kafka/RabbitMQ.',
        medium:{
          theory:'Решает проблему двойной записи: нельзя атомарно записать в БД и опубликовать событие. Outbox таблица — часть той же транзакции. CDC (Change Data Capture) или polling-процесс читает и публикует.',
          tradeoffs:'Плюс: гарантия "at least once" доставки, нет потери событий при падении. Минус: дополнительная таблица, задержка публикации, нужна идемпотентность у консьюмеров.',
          code:`// 1. Атомарно: сохраняем заказ + событие в одной транзакции
await db.transaction(async (trx) => {
  const order = await trx('orders').insert(orderData)
  await trx('outbox').insert({
    id: uuid(), aggregateId: order.id,
    type: 'order.created',
    payload: JSON.stringify(orderData),
    createdAt: new Date(), published: false
  })
})

// 2. Отдельный процесс (relay) публикует из outbox:
const events = await db('outbox').where({ published: false })
for (const event of events) {
  await kafka.publish(event.type, event.payload)
  await db('outbox').where({ id: event.id }).update({ published: true })
}`
        },
        links:[
          {label:'Transactional Outbox', url:'https://microservices.io/patterns/data/transactional-outbox.html'},
          {label:'Azure — Outbox pattern', url:'https://learn.microsoft.com/en-us/azure/architecture/best-practices/transactional-outbox-cosmos'}
        ],
        questions:['Как Outbox решает проблему двойной записи?','Polling vs CDC — когда что выбрать?','Как обеспечить идемпотентность у консьюмера?']
      },
      {
        name:'Anti-Corruption Layer', tag:'pattern', tagLabel:'Паттерн',
        summary:'Фасад или адаптер между современным приложением и легаси-системой. Защищает от "заражения" чужой моделью.',
        short:'Слой-переводчик между двумя bounded contexts с разными моделями. Не позволяет легаси-концепциям просочиться в новый код.',
        medium:{
          theory:'При интеграции с легаси или сторонней системой их модель данных не должна загрязнять твою доменную модель. ACL переводит внешние концепции во внутренние. Часто реализуется как Adapter + Facade + Translator.',
          tradeoffs:'Плюс: чистота доменной модели, независимость от внешних изменений, упрощение миграции. Минус: дополнительный слой кода, потенциальная задержка, нужно поддерживать маппинг.',
          code:`// Легаси-система возвращает свою модель:
interface LegacyCustomer {
  cust_id: number; cust_nm: string; cust_addr1: string
}

// Наша доменная модель:
interface Customer {
  id: string; name: string; address: { street: string }
}

// ACL — переводчик:
class CustomerACL {
  translate(legacy: LegacyCustomer): Customer {
    return {
      id: String(legacy.cust_id),
      name: legacy.cust_nm,
      address: { street: legacy.cust_addr1 }
    }
  }
}`
        },
        links:[
          {label:'ACL — Microsoft', url:'https://learn.microsoft.com/en-us/azure/architecture/patterns/anti-corruption-layer'},
          {label:'ACL — DDD patterns', url:'https://martinfowler.com/bliki/BoundedContext.html'}
        ],
        questions:['Чем ACL отличается от обычного Adapter?','Когда ACL нужен, а когда достаточно Adapter?','Как ACL помогает при Strangler Fig миграции?']
      },
      {
        name:'Claim Check', tag:'pattern', tagLabel:'Паттерн',
        summary:'Большие сообщения не отправлять через брокер — хранить payload отдельно, передавать только ссылку.',
        short:'Вместо большого сообщения в Kafka/RabbitMQ — сохрани payload в blob storage и передай только claim check (ключ для получения).',
        medium:{
          theory:'Брокеры сообщений имеют лимиты на размер (Kafka — 1MB по умолчанию). Большие payload замедляют шину и потребляют пропускную способность. Claim Check отделяет метаданные от данных.',
          tradeoffs:'Плюс: брокер не перегружается, сообщения малые, payload можно хранить независимо. Минус: дополнительная зависимость (blob storage), консьюмер делает дополнительный запрос.',
          code:`// Producer: сохраняем payload, отправляем только ключ
const blobKey = \`orders/\${orderId}/payload.json\`
await blobStorage.upload(blobKey, JSON.stringify(largePayload))

await kafka.publish('order.processing', {
  orderId,
  claimCheckKey: blobKey,  // ← только ссылка
  timestamp: Date.now()
})

// Consumer: получает ключ → скачивает payload
eventBus.subscribe('order.processing', async (msg) => {
  const payload = await blobStorage.download(msg.claimCheckKey)
  await processOrder(JSON.parse(payload))
})`
        },
        links:[{label:'Claim Check — Microsoft', url:'https://learn.microsoft.com/en-us/azure/architecture/patterns/claim-check'}],
        questions:['Когда Claim Check необходим?','Как долго хранить payload в blob storage?','Кто отвечает за удаление payload?']
      }
    ]
  },);
