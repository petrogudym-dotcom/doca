window.SECTIONS = window.SECTIONS || [];
window.SECTIONS.push(  {
    id:'infra', title:'Инфраструктура', icon:'🐳', iconBg:'#EDE7F6',
    topics:[
      {
        name:'Docker и контейнеры', tag:'infra', tagLabel:'Инфра',
        summary:'Контейнеры изолируют приложение с зависимостями. Docker — стандарт контейнеризации.',
        short:'Image — неизменяемый шаблон. Container — запущенный инстанс. Registry — хранилище образов. Orchestration — Kubernetes.',
        medium:{
          theory:'Docker image строится из слоёв (каждая инструкция Dockerfile = слой). Multi-stage builds уменьшают финальный размер образа. docker-compose для локальной разработки. Kubernetes для продакшена.',
          tradeoffs:'Плюс: воспроизводимость окружения, изоляция, портабельность. Минус: overhead на I/O для stateful приложений, сложность сети, управление секретами.',
          code:`# Multi-stage Dockerfile (уменьшает размер образа):
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Финальный образ — только нужное:
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
USER node
CMD ["node", "dist/main.js"]`
        },
        links:[
          {label:'Docker docs', url:'https://docs.docker.com'},
          {label:'Kubernetes docs', url:'https://kubernetes.io/docs/home/'}
        ],
        questions:['Почему важен multi-stage build?','Как хранить секреты в контейнере?','Чем Pod отличается от Container в K8s?']
      },
      {
        name:'Observability: Logs, Metrics, Traces', tag:'infra', tagLabel:'Инфра',
        summary:'Три столпа наблюдаемости системы. Без observability — лететь вслепую.',
        short:'Logs: что произошло. Metrics: сколько/насколько быстро (RED). Traces: путь запроса через сервисы.',
        medium:{
          theory:'Structured logging (JSON) вместо plain text. RED metrics: Rate (запросов/сек), Errors (%), Duration (latency). OpenTelemetry — стандарт трассировки. Distributed tracing: один trace через несколько сервисов.',
          tradeoffs:'Много логов = дорого хранить, сложно искать. Traces добавляют ~1-5% overhead. Алерты по симптомам (latency/errors) эффективнее, чем по ресурсам (CPU/RAM).',
          code:`// Structured logging (JSON — легко парсить):
logger.info('order.created', {
  orderId: '123', userId: 'u456',
  amount: 500, durationMs: 45,
  traceId: req.headers['x-trace-id'] // ← связь с trace
})

// RED metrics для Prometheus:
// Rate:     http_requests_total{method="POST",route="/orders"} 1523
// Errors:   http_requests_total{status="5xx"} 12
// Duration: http_request_duration_seconds{p99} 0.45`
        },
        links:[
          {label:'OpenTelemetry', url:'https://opentelemetry.io/docs/'},
          {label:'Google SRE Book (бесплатно)', url:'https://sre.google/sre-book/table-of-contents/'}
        ],
        questions:['Что такое cardinality и почему это проблема в метриках?','Как передавать trace context между сервисами?','Чем SLO отличается от SLA?']
      },
      {
        name:'Sidecar', tag:'infra', tagLabel:'Паттерн',
        summary:'Вспомогательный контейнер рядом с основным — берёт на себя cross-cutting concerns без изменения кода сервиса.',
        short:'Sidecar запускается в том же Pod (K8s) что и основной сервис. Отвечает за: логирование, TLS, service mesh, health checks, конфигурацию.',
        medium:{
          theory:'Паттерн популярен в Service Mesh (Istio, Linkerd) — sidecar-proxy (Envoy) перехватывает весь сетевой трафик сервиса. Преимущество: сервис не знает о сетевой политике, mTLS, ретраях.',
          tradeoffs:'Плюс: разделение ответственности, сервис фокусируется на бизнес-логике, переиспользование. Минус: накладные расходы на дополнительный процесс, сложность отладки сетевого трафика.',
          code:`# Kubernetes Pod с sidecar (Envoy proxy):
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: order-service        # Основной сервис
    image: order-service:1.0
    ports:
    - containerPort: 3000

  - name: envoy-proxy          # Sidecar
    image: envoyproxy/envoy:v1.28
    ports:
    - containerPort: 9901      # Admin
    volumeMounts:
    - name: envoy-config
      mountPath: /etc/envoy
  # Envoy перехватывает трафик: mTLS, retry, трассировка`
        },
        links:[
          {label:'Sidecar — Microsoft', url:'https://learn.microsoft.com/en-us/azure/architecture/patterns/sidecar'},
          {label:'Istio Service Mesh', url:'https://istio.io/latest/docs/concepts/what-is-istio/'}
        ],
        questions:['Чем Sidecar отличается от Ambassador паттерна?','Как Istio использует Sidecar?','Когда Sidecar избыточен?']
      },
      {
        name:'Health Endpoint Monitoring', tag:'infra', tagLabel:'Паттерн',
        summary:'Специальные эндпоинты для проверки здоровья сервиса — используются оркестраторами и мониторингом.',
        short:'/health/live — живой ли процесс. /health/ready — готов ли принимать трафик. /health/startup — завершилась ли инициализация.',
        medium:{
          theory:'Kubernetes использует три типа probes: Liveness (перезапустить если упал), Readiness (убрать из балансировки если не готов), Startup (ждать инициализации). Health check должен проверять зависимости (БД, кэш).',
          tradeoffs:'Плюс: автоматическое восстановление, корректный rolling deploy, видимость состояния. Минус: слишком агрессивные проверки могут убить сервис в процессе инициализации.',
          code:`// NestJS / Express health endpoints:
app.get('/health/live', (req, res) => {
  // Только: жив ли процесс
  res.json({ status: 'ok' })
})

app.get('/health/ready', async (req, res) => {
  // Проверяем зависимости:
  const checks = await Promise.allSettled([
    db.query('SELECT 1'),
    redis.ping()
  ])
  const healthy = checks.every(c => c.status === 'fulfilled')
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ready' : 'not ready',
    checks: { db: checks[0].status, redis: checks[1].status }
  })
})`
        },
        links:[
          {label:'Health Endpoint — Microsoft', url:'https://learn.microsoft.com/en-us/azure/architecture/patterns/health-endpoint-monitoring'},
          {label:'K8s Probes docs', url:'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/'}
        ],
        questions:['Чем liveness отличается от readiness probe?','Что проверять в health check?','Как избежать каскадного отказа из-за health check?']
      }
    ]
  });
