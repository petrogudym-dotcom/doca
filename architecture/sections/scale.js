window.SECTIONS = window.SECTIONS || [];
window.SECTIONS.push(  {
    id:'scale', title:'Масштабирование', icon:'⚡', iconBg:'#E8F5E9',
    topics:[
      {
        name:'CAP теорема', tag:'scale', tagLabel:'Теория',
        summary:'Распределённая система может гарантировать только 2 из 3: Consistency, Availability, Partition Tolerance.',
        short:'CP: согласованность + устойчивость к разделению (MongoDB). AP: доступность + устойчивость (Cassandra). CA — невозможно в реальной сети.',
        medium:{
          theory:'Partition Tolerance обязателен в реальных распределённых системах (сеть ненадёжна). Поэтому выбор между CP и AP. BASE (Basically Available, Soft state, Eventual consistency) — альтернатива ACID для AP систем.',
          tradeoffs:'CP системы недоступны при разделении сети. AP системы могут возвращать устаревшие данные. Eventual Consistency — компромисс AP систем.',
          code:`// Eventual consistency: записи распространяются асинхронно
// Write → node1 (немедленно) → node2, node3 (через ~ms)
// Read node2 сразу после write node1 → может вернуть старые данные

// Решение: version vectors / read-your-writes
const result = await db.read({ 
  consistencyLevel: 'LOCAL_QUORUM' // требует большинства реплик
})`
        },
        links:[{label:'CAP Theorem — инфографика', url:'https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/'}],
        questions:['Почему CA-система невозможна в реальных условиях?','Чем BASE отличается от ACID?','Что такое PACELC?']
      },
      {
        name:'Circuit Breaker', tag:'scale', tagLabel:'Паттерн',
        summary:'Защита от каскадных отказов — автоматически прекращает запросы к упавшему сервису.',
        short:'3 состояния: Closed (работает), Open (отказы — блокируем), Half-Open (тестируем). Аналог электрического предохранителя.',
        medium:{
          theory:'Порог открытия: N ошибок за период → Open. Timeout → Half-Open → один тестовый запрос. Успех → Closed. Важно: при Open возвращать fallback, не просто ошибку.',
          tradeoffs:'Плюс: изоляция отказов, быстрый fail вместо ожидания таймаута, время на восстановление. Минус: сложность настройки порогов, ложные срабатывания.',
          code:`// Концептуально (Resilience4j / Polly / opossum):
const cb = new CircuitBreaker(orderService.getOrder, {
  failureThreshold: 5,     // 5 ошибок за период → Open
  successThreshold: 2,     // 2 успеха из Half-Open → Closed
  timeout: 10000,          // 10 сек в состоянии Open
  fallback: (id) => ({     // Ответ при Open состоянии
    id, status: 'UNKNOWN', cached: true
  })
})`
        },
        links:[
          {label:'Circuit Breaker — Fowler', url:'https://martinfowler.com/bliki/CircuitBreaker.html'},
          {label:'Resilience4j', url:'https://resilience4j.readme.io/docs/circuitbreaker'}
        ],
        questions:['Как выбрать порог для открытия breaker?','Что возвращать клиенту когда breaker Open?','Чем Circuit Breaker отличается от Retry?']
      },
      {
        name:'Стратегии кэширования', tag:'scale', tagLabel:'Паттерн',
        summary:'Cache-Aside, Write-Through, Write-Behind, Read-Through — разные подходы к кэшированию.',
        short:'Cache-Aside (Lazy Loading) — самый распространённый: приложение управляет кэшем явно, при промахе читает из БД.',
        medium:{
          theory:'Cache-Aside: app управляет кэшем явно. Write-Through: запись одновременно в кэш и БД (согласованность). Write-Behind: запись в кэш, асинхронно в БД (скорость). Read-Through: кэш сам загружает данные.',
          tradeoffs:'Cache-Aside: риск stale data, cache stampede при высокой нагрузке. Write-Through: медленная запись, но согласованность. TTL — всегда баланс между актуальностью и нагрузкой на БД.',
          code:`// Cache-Aside pattern:
async function getUser(id: string): Promise<User> {
  // 1. Проверяем кэш
  const cached = await redis.get(\`user:\${id}\`)
  if (cached) return JSON.parse(cached)

  // 2. Cache miss — читаем из БД
  const user = await db.users.findById(id)
  if (!user) throw new NotFoundError()

  // 3. Кладём в кэш на 1 час
  await redis.setex(\`user:\${id}\`, 3600, JSON.stringify(user))
  return user
}`
        },
        links:[{label:'Caching Strategies', url:'https://codeahoy.com/2017/08/11/caching-strategies-and-how-to-choose-the-right-one/'}],
        questions:['Как избежать cache stampede?','Как инвалидировать кэш при обновлении данных?','Что такое cache warming?']
      },
      {
        name:'Retry', tag:'scale', tagLabel:'Паттерн',
        summary:'Автоматически повторяет провалившиеся операции при временных сбоях сети или сервиса.',
        short:'Transient failures (временные сбои) — норма в распределённых системах. Retry с exponential backoff + jitter решает большинство из них.',
        medium:{
          theory:'Стратегии: Fixed delay (постоянная пауза), Exponential Backoff (пауза удваивается), Exponential Backoff + Jitter (случайный разброс, чтобы не перегружать сервис синхронно). Важно: не все ошибки retriable (400 Bad Request — не надо ретраить).',
          tradeoffs:'Плюс: прозрачная обработка временных сбоев. Минус: увеличение latency, риск thundering herd (все ретраят одновременно). Jitter обязателен в production.',
          code:`// Exponential Backoff + Jitter:
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 100
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (attempt === maxAttempts) throw err
      if (err.status === 400) throw err // не ретраим клиентские ошибки
      const jitter = Math.random() * baseDelayMs
      const delay = baseDelayMs * Math.pow(2, attempt - 1) + jitter
      await sleep(delay) // 100ms, 200ms, 400ms + случайный сдвиг
    }
  }
}`
        },
        links:[
          {label:'Retry — Microsoft', url:'https://learn.microsoft.com/en-us/azure/architecture/patterns/retry'},
          {label:'Exponential Backoff + Jitter — AWS', url:'https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/'}
        ],
        questions:['Почему нужен jitter в exponential backoff?','Какие ошибки не стоит ретраить?','Как Retry сочетается с Circuit Breaker?']
      },
      {
        name:'Bulkhead', tag:'scale', tagLabel:'Паттерн',
        summary:'Изолирует компоненты в пулы, чтобы отказ одного не обрушил всё приложение.',
        short:'Как водонепроницаемые переборки на корабле — повреждение одного отсека не топит всё судно. Разные пулы потоков/соединений для разных операций.',
        medium:{
          theory:'Два вида: Thread Pool Isolation (отдельный пул потоков для каждой зависимости), Connection Pool Isolation (отдельный пул соединений). Если один сервис тормозит, его пул заполняется, но остальные пулы продолжают работать.',
          tradeoffs:'Плюс: изоляция отказов, предсказуемое поведение под нагрузкой. Минус: неэффективное использование ресурсов (пустые пулы), сложность конфигурации размеров пулов.',
          code:`// Hystrix / Resilience4j Thread Pool Isolation:
const paymentsBulkhead = Bulkhead.of('payments', {
  maxConcurrentCalls: 10,  // максимум 10 одновременных вызовов
  maxWaitDuration: 100     // ожидать не более 100ms
})

const inventoryBulkhead = Bulkhead.of('inventory', {
  maxConcurrentCalls: 25,  // у inventory больше capacity
  maxWaitDuration: 50
})

// Если payments перегружен — inventory не страдает
const result = await paymentsBulkhead.executeAsync(
  () => paymentService.charge(orderId)
)`
        },
        links:[{label:'Bulkhead — Microsoft', url:'https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead'}],
        questions:['Чем Bulkhead отличается от Circuit Breaker?','Как определить размер пула для bulkhead?','Thread pool vs semaphore isolation — когда что?']
      },
      {
        name:'Throttling & Rate Limiting', tag:'scale', tagLabel:'Паттерн',
        summary:'Ограничивает потребление ресурсов — защищает от перегрузки и обеспечивает fair use.',
        short:'Throttling — ограничение со стороны сервиса (защита себя). Rate Limiting — ограничение клиентов (fair use, защита от abuse). Token Bucket и Sliding Window — популярные алгоритмы.',
        medium:{
          theory:'Алгоритмы: Token Bucket (пополняется с постоянной скоростью, разрешает burst), Sliding Window (точный подсчёт за окно), Fixed Window (проще, но уязвим на границе окна), Leaky Bucket (выравнивает поток).',
          tradeoffs:'Плюс: стабильность под нагрузкой, защита от DDoS, предсказуемое поведение. Минус: легитимные пользователи могут получить 429, нужна стратегия retry у клиентов.',
          code:`// Token Bucket в Redis (sliding window):
async function rateLimit(userId: string, limit = 100, windowSec = 60) {
  const key = \`ratelimit:\${userId}\`
  const now = Date.now()
  const windowMs = windowSec * 1000

  // Удаляем устаревшие запросы
  await redis.zremrangebyscore(key, 0, now - windowMs)
  const count = await redis.zcard(key)

  if (count >= limit) {
    throw new TooManyRequestsError(\`Limit: \${limit}/\${windowSec}s\`)
  }
  await redis.zadd(key, now, \`\${now}-\${Math.random()}\`)
  await redis.expire(key, windowSec)
}`
        },
        links:[
          {label:'Throttling — Microsoft', url:'https://learn.microsoft.com/en-us/azure/architecture/patterns/throttling'},
          {label:'Rate Limiting — Microsoft', url:'https://learn.microsoft.com/en-us/azure/architecture/patterns/rate-limiting-pattern'}
        ],
        questions:['Token Bucket vs Sliding Window — что точнее?','Где хранить счётчики при нескольких инстансах?','Как отдавать клиенту информацию об ограничении (Retry-After)?']
      },
      {
        name:'Strangler Fig', tag:'scale', tagLabel:'Паттерн',
        summary:'Постепенная миграция легаси-системы: новый код постепенно заменяет старый без остановки системы.',
        short:'Как фикус-душитель обволакивает дерево — новая система растёт вокруг старой, постепенно перехватывая функциональность.',
        medium:{
          theory:'Шаги: 1) поставить Facade/Proxy перед легаси 2) по одной функции переписывать на новую систему 3) proxy переключает трафик 4) когда весь трафик идёт в новую — легаси выключить. Снижает риск большого bang-миграции.',
          tradeoffs:'Плюс: нет момента "всё останавливаем и переписываем", снижение риска, непрерывная доставка. Минус: долго, нужно поддерживать обе системы параллельно, сложный роутинг.',
          code:`// Proxy перехватывает трафик и роутит:
class MigrationProxy {
  async handleRequest(req: Request) {
    const feature = req.path

    // Шаг 1: всё идёт в легаси
    // Шаг 2: часть функций переключена на новую систему
    if (this.isMigrated(feature)) {
      return await this.newSystem.handle(req)
    }
    return await this.legacySystem.handle(req)
  }

  isMigrated(feature: string): boolean {
    // Конфиг или feature flags управляют миграцией
    return MIGRATED_FEATURES.includes(feature)
  }
}`
        },
        links:[
          {label:'Strangler Fig — Fowler', url:'https://martinfowler.com/bliki/StranglerFigApplication.html'},
          {label:'Strangler Fig — Microsoft', url:'https://learn.microsoft.com/en-us/azure/architecture/patterns/strangler-fig'}
        ],
        questions:['Как выбрать что мигрировать первым?','Как синхронизировать данные между старой и новой системой?','Когда использовать feature flags вместо proxy?']
      }
    ]
  },);
