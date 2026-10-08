window.SECTIONS = window.SECTIONS || [];
window.SECTIONS.push(  {
    id:'microservices', title:'Microservices', icon:'🔗', iconBg:'#E8FEF0',
    topics:[
      {
        name:'Microservices Patterns', tag:'micro', tagLabel:'Micro',
        summary:'Saga for distributed transactions, Circuit Breaker for fault tolerance, API Gateway for routing, Service Discovery for dynamic addressing.',
        short:'Key microservices patterns: Saga (distributed transactions via compensating actions), Circuit Breaker (fail fast when downstream is down), API Gateway (single entry point, routing, auth), Service Discovery (dynamic service registration/lookup), Database per Service (each service owns its data), Strangler Fig (incremental migration from monolith).',
        medium:{
          theory:'Saga: choreography (events between services) or orchestration (central coordinator). Circuit Breaker (Resilience4j): closed → open → half-open states. API Gateway: routing, rate limiting, authentication, request transformation. Service Discovery: client-side (Eureka + Ribbon) or server-side (Kubernetes Service, Consul). Communication: synchronous (REST/gRPC) for queries, asynchronous (Kafka/RabbitMQ) for events and commands. Database per Service: prevents coupling, but makes cross-service queries harder (use CQRS or API composition).',
          tradeoffs:'Microservices: independent deployment and scaling, but operational complexity (monitoring, tracing, deployments). Saga: eventual consistency, not ACID. Circuit Breaker: prevents cascading failures but requires fallback logic. Monolith-first: start with a modular monolith, extract services when needed.',
          code:`// Circuit Breaker with Resilience4j
@CircuitBreaker(name = "paymentService", fallbackMethod = "paymentFallback")
@Retry(name = "paymentService")
@TimeLimiter(name = "paymentService")
CompletableFuture<PaymentResult> processPayment(Order order) {
    return CompletableFuture.supplyAsync(() -> paymentClient.charge(order));
}

PaymentResult paymentFallback(Order order, Exception e) {
    log.warn("Payment service unavailable, queuing for retry", e);
    return PaymentResult.pending(order.getId());
}

// API Gateway (Spring Cloud Gateway)
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/users/**

// Strangler Fig: incremental migration
// 1. Deploy new service alongside monolith
// 2. Route specific endpoints to new service via API Gateway
// 3. Gradually migrate more endpoints
// 4. Decommission monolith when fully migrated`
        },
        links:[
          {label:'Microservices Patterns', url:'https://microservices.io/patterns/microservices.html'},
          {label:'Resilience4j', url:'https://resilience4j.readme.io/'}
        ],
        questions:['When to use choreography vs orchestration?','How does Circuit Breaker prevent cascading failures?','What is the Strangler Fig pattern?']
      },
      {
        name:'Kafka Fundamentals', tag:'micro', tagLabel:'Kafka',
        summary:'Distributed event streaming: topics partitioned for parallelism, consumer groups for scaling, exactly-once semantics for reliability.',
        short:'Apache Kafka is a distributed event streaming platform. Topics are split into partitions for parallelism. Consumer groups allow multiple consumers to process partitions in parallel. Messages are key-value pairs; the key determines the partition. Delivery guarantees: at-most-once, at-least-once, exactly-once.',
        medium:{
          theory:'Topic: ordered log of messages. Partition: ordered, immutable sequence within a topic — enables parallel consumption. Key: determines partition (hash(key) % numPartitions) — same key always goes to same partition (ordering guarantee). Consumer Group: each partition assigned to one consumer in the group. Offset: position in the partition — committed to track progress. Rebalancing: when consumers join/leave, partitions are reassigned. Replication: leader/follower replicas for fault tolerance. ISR (In-Sync Replicas): replicas that are caught up with the leader.',
          tradeoffs:'More partitions = more parallelism but more overhead. Consumer group: scale consumers up to partition count (extra consumers are idle). At-least-once is the practical default — ensure idempotent processing. Exactly-once requires idempotent producer + transactional consumer.',
          code:`# Kafka producer (acks=all for durability)
producer:
  acks: all
  enable.idempotence: true
  retries: 3

# Consumer group configuration
consumer:
  group.id: order-service
  auto.offset.reset: earliest
  enable.auto.commit: false  # manual commit for at-least-once

// Kafka producer (Spring Kafka)
kafkaTemplate.send("orders", order.getId(), order);

// Kafka consumer
@KafkaListener(topics = "orders", groupId = "order-service")
void processOrder(@Payload Order order,
                  @Header(KafkaHeaders.RECEIVED_KEY) String key) {
    orderService.process(order);
    // manual ack after processing
}

// Exactly-once: idempotent producer + transactional consumer
producer:
  enable.idempotence: true
  transactional.id: order-producer`
        },
        links:[
          {label:'Kafka Documentation', url:'https://kafka.apache.org/documentation/'},
          {label:'Kafka Consumer Groups', url:'https://kafka.apache.org/documentation/#intro_consumers'}
        ],
        questions:['How does Kafka ensure ordering within a partition?','What happens during consumer rebalancing?','How to achieve exactly-once semantics?']
      },
      {
        name:'Reactive Programming', tag:'micro', tagLabel:'Reactive',
        summary:'Non-blocking, event-driven programming with backpressure. Project Reactor (Mono/Flux) and RxJava for reactive streams.',
        short:'Reactive programming processes data streams asynchronously with backpressure (consumers signal demand). Project Reactor provides Mono (0-1 element) and Flux (0-N elements). Spring WebFlux uses reactive streams for non-blocking HTTP. Virtual threads (Java 21+) offer a simpler alternative for I/O-bound workloads.',
        medium:{
          theory:'Reactive Streams specification: Publisher → Subscriber with backpressure. Project Reactor: Mono (single async value), Flux (async sequence). Operators: map, flatMap, filter, zip, merge. Spring WebFlux: reactive alternative to Spring MVC, runs on Netty. Backpressure: consumer controls the rate of data flow, preventing overload. Use cases: high-concurrency I/O, streaming data, real-time updates. Virtual threads provide similar scalability with simpler blocking code.',
          tradeoffs:'Reactive: excellent for high-concurrency I/O and streaming, but steep learning curve, complex debugging, and callback hell. Virtual threads: simpler alternative for most I/O-bound applications. Choose reactive for streaming/real-time; virtual threads for traditional request-response.',
          code:`// Mono — single async value
Mono<User> user = Mono.fromCallable(() -> userService.findById(id))
    .subscribeOn(Schedulers.boundedElastic())
    .onErrorResume(e -> Mono.empty());

// Flux — async stream
Flux<Order> orders = Flux.fromIterable(orderIds)
    .flatMap(id -> orderService.findById(id))  // parallel fetches
    .filter(order -> order.getStatus() == "ACTIVE")
    .sort(Comparator.comparing(Order::getCreatedAt));

// Spring WebFlux controller
@GetMapping(value = "/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
Flux<Event> streamEvents() {
    return eventService.eventStream()
        .delayElements(Duration.ofSeconds(1));
}

// Combining multiple async sources
Mono<Dashboard> dashboard = Mono.zip(
    userService.getCurrentUser(),
    orderService.getRecentOrders(),
    notificationService.getUnreadCount()
).map(tuple -> new Dashboard(tuple.getT1(), tuple.getT2(), tuple.getT3()));`
        },
        links:[
          {label:'Project Reactor', url:'https://projectreactor.io/'},
          {label:'Spring WebFlux', url:'https://docs.spring.io/spring-framework/reference/web-reactive.html'}
        ],
        questions:['What is backpressure?','When to use reactive vs virtual threads?','What is the difference between Mono and Flux?']
      },
      {
        name:'Microservices Communication and Data Consistency', tag:'micro', tagLabel:'Micro',
        summary:'Sync (REST/gRPC) for queries, async (Kafka/events) for commands. CQRS and event sourcing for eventual consistency across services.',
        short:'Microservices communicate synchronously (REST, gRPC) for real-time queries and asynchronously (message queues, event buses) for commands and events. Data consistency across services uses eventual consistency, CQRS (Command Query Responsibility Segregation), and event sourcing patterns.',
        medium:{
          theory:'Sync communication: REST (simple, widely supported), gRPC (binary, fast, streaming). Async: Kafka/RabbitMQ for durable event streaming, Redis Pub/Sub for ephemeral messaging. CQRS: separate read and write models — write commands to event store, project into read-optimized views. Event sourcing: store state changes as events, derive current state by replaying events. Saga compensating transactions: undo effects of previous steps (credit instead of rollback). Idempotent consumers: process duplicate messages safely.',
          tradeoffs:'REST: simple but tight coupling. gRPC: fast but requires proto files. Async: decoupled but eventual consistency. CQRS: powerful for complex domains but adds complexity. Event sourcing: full audit trail but steep learning curve.',
          code:`// CQRS with event sourcing (conceptual)
// Command side:
class CreateOrderCommand {
    void execute(OrderDto dto) {
        Order order = Order.create(dto);
        eventStore.append(new OrderCreatedEvent(order));
    }
}

// Event handler: projects events into read model
@KafkaListener(topics = "order-events")
void onOrderCreated(OrderCreatedEvent event) {
    orderViewRepo.save(new OrderView(event.getId(), event.getStatus()));
}

// gRPC service definition
syntax = "proto3";
service UserService {
    rpc GetUser (GetUserRequest) returns (UserResponse);
    rpc StreamOrders (StreamRequest) returns (stream Order);  // streaming
}

// Idempotent consumer
@KafkaListener(topics = "payments")
void processPayment(PaymentEvent event) {
    if (paymentRepo.existsById(event.getId())) return;  // skip duplicates
    paymentRepo.save(new Payment(event));
}`
        },
        links:[
          {label:'CQRS — Martin Fowler', url:'https://martinfowler.com/bliki/CQRS.html'},
          {label:'gRPC', url:'https://grpc.io/'}
        ],
        questions:['When to use sync vs async communication?','What is CQRS?','How to make consumers idempotent?']
      },
      {
        name:'Kafka Advanced: DLQ, Monitoring, and Retention', tag:'micro', tagLabel:'Kafka',
        summary:'Dead Letter Queue handles failed messages. Monitor consumer lag for processing delays. Retention policies manage storage.',
        short:'Dead Letter Queue (DLQ): failed messages after retries go to a DLQ topic for manual inspection. Consumer lag: difference between latest offset and committed offset — monitor to detect processing delays. Retention policies: time-based (delete after N days) or size-based (delete oldest when partition exceeds size limit).',
        medium:{
          theory:'DLQ pattern: consumer catches exceptions, retries with backoff, and on final failure sends to a DLQ topic. Consumer lag monitoring: Kafka provides metrics via JMX and consumer group lag can be queried via admin API. Tools: Burrow, Kafka Lag Exporter. Retention: log.retention.hours (default 168 hours = 7 days), log.retention.bytes. Compacted topics: keep only the latest value per key (useful for config/state topics). Exactly-once: enable.idempotence=true on producer + isolation.level=read_committed on consumer.',
          tradeoffs:'DLQ: essential for not losing messages but requires monitoring and manual processing. Consumer lag: key metric for health — rising lag means consumers can\'t keep up. Retention: longer retention = more storage. Compacted topics: great for key-value state but not for event logs.',
          code:`// DLQ pattern with Spring Kafka
@KafkaListener(topics = "orders", groupId = "order-service")
void processOrder(ConsumerRecord<String, Order> record) {
    try {
        orderService.process(record.value());
    } catch (Exception e) {
        if (retryCount < 3) {
            throw e;  // retry
        } else {
            kafkaTemplate.send("orders-dlq", record.key(), record.value());
        }
    }
}

// Monitor consumer lag
kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
    --describe --group order-service
# GROUP     TOPIC   PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG

// Compacted topic (keep latest per key)
# topic config:
# cleanup.policy=compact
# Useful for: user profiles, configuration, materialized views

// Exactly-once consumer
consumer:
  isolation.level: read_committed  # ignore uncommitted transactional messages`
        },
        links:[
          {label:'Kafka Consumer Groups', url:'https://kafka.apache.org/documentation/#consumerconfigs'},
          {label:'Kafka DLQ Pattern', url:'https://www.confluent.io/blog/error-handling-patterns-in-kafka/'}
        ],
        questions:['What is a Dead Letter Queue?','How to monitor consumer lag?','What is a compacted topic?']
      },
      {
        name:'Reactive vs Virtual Threads and Caching', tag:'micro', tagLabel:'Reactive',
        summary:'Reactive for streaming/backpressure; virtual threads for simpler blocking I/O. Distributed caching with Redis/Caffeine for read-heavy services.',
        short:'Choose reactive (WebFlux/Reactor) for streaming data, backpressure needs, and high-concurrency I/O with complex pipelines. Choose virtual threads (Java 21+) for simpler blocking code with similar scalability. Distributed caching (Redis) + local caching (Caffeine) for read-heavy microservices.',
        medium:{
          theory:'Reactive advantages: backpressure control, streaming (SSE, WebSocket), efficient resource usage. Virtual threads advantages: simpler code, familiar debugging, no callback hell. Both scale well for I/O. Caching strategy: L1 (local Caffeine, fast, stale), L2 (Redis, shared, consistent), cache-aside pattern (check cache → miss → load from DB → cache). Cache invalidation: TTL, event-driven invalidation via Kafka events. Read-through vs write-through vs cache-aside patterns.',
          tradeoffs:'Reactive: steep learning curve, complex debugging. Virtual threads: simpler but no backpressure. Caching: reduces DB load but risks stale data. Use multi-level caching with appropriate TTLs. Event-driven cache invalidation for near-real-time consistency.',
          code:`// Caffeine local cache
Cache<String, User> localCache = Caffeine.newBuilder()
    .maximumSize(10_000)
    .expireAfterWrite(Duration.ofMinutes(5))
    .build();

// Multi-level cache: local → Redis → DB
User getUser(String id) {
    User user = localCache.getIfPresent(id);  // L1
    if (user != null) return user;
    
    user = redisTemplate.opsForValue().get(id);  // L2
    if (user != null) {
        localCache.put(id, user);
        return user;
    }
    
    user = userRepo.findById(id).orElseThrow();  // DB
    redisTemplate.opsForValue().set(id, user, Duration.ofHours(1));
    localCache.put(id, user);
    return user;
}

// Event-driven cache invalidation
@KafkaListener(topics = "user-events")
void onUserUpdated(UserUpdatedEvent event) {
    localCache.invalidate(event.getUserId());
    redisTemplate.delete(event.getUserId());
}

// Virtual threads for simple I/O
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    List<User> users = userIds.stream()
        .map(id -> executor.submit(() -> userService.get(id)))
        .map(Future::get)
        .toList();
}`
        },
        links:[
          {label:'Caffeine Cache', url:'https://github.com/ben-manes/caffeine'},
          {label:'Spring Cache', url:'https://docs.spring.io/spring-boot/reference/io/caching.html'}
        ],
        questions:['When to use reactive vs virtual threads?','What is cache-aside pattern?','How to handle cache invalidation in microservices?']
      }
    ]
  },);
