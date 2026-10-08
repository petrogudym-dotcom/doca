window.SECTIONS = window.SECTIONS || [];
window.SECTIONS.push(  {
    id:'concurrency', title:'Многопоточность', icon:'🧵', iconBg:'#E8F5E9',
    topics:[
      {
        name:'synchronized vs ReentrantLock', tag:'threads', tagLabel:'Потоки',
        summary:'Intrinsic lock от JVM против явного Lock из java.util.concurrent с расширенными возможностями.',
        short:'synchronized — ключевое слово, монитором управляет JVM, блокировка освобождается автоматически при выходе из блока или исключении. ReentrantLock — класс из java.util.concurrent.locks: явные lock/unlock, try-lock с таймаутом, прерываемые блокировки, fairness policy.',
        medium:{
          theory:'ReentrantLock поддерживает tryLock() (без ожидания), tryLock(timeout), lockInterruptibly(), несколько Condition-очередей на одну блокировку и fair-режим. Цена — обязанность освобождать в finally. synchronized проще и с JDK 6 почти не уступает по производительности (biased/thin locks, lock coarsening).',
          tradeoffs:'synchronized: меньше ошибок (автоматическое освобождение), но нет таймаутов и прерываний. ReentrantLock: контроль и гибкость, но забытый unlock в finally = deadlock. Правило: synchronized по умолчанию, ReentrantLock когда нужны tryLock/conditions/fairness.',
          code:`// synchronized — JVM освободит блокировку сама:
synchronized (monitor) {
    counter++;
} // unlock даже при исключении

// ReentrantLock — unlock обязателен в finally:
private final ReentrantLock lock = new ReentrantLock(true); // fair

if (lock.tryLock(100, TimeUnit.MILLISECONDS)) {
    try {
        counter++;
    } finally {
        lock.unlock();
    }
} else {
    // не дождались блокировки — альтернативный путь
}`
        },
        links:[
          {label:'ReentrantLock — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/locks/ReentrantLock.html'},
          {label:'Java Concurrency in Practice', url:'https://jcip.net/'}
        ],
        questions:['Что будет, если не вызвать unlock в finally?','Зачем нужен fair lock и чем он дороже?','Как Condition отличается от wait/notify?']
      },
      {
        name:'Virtual Threads (Project Loom)', tag:'threads', tagLabel:'Потоки',
        summary:'Лёгкие потоки под управлением JVM: миллионы одновременных задач при ничтожном потреблении памяти.',
        short:'Platform threads — обёртки 1:1 над потоками ОС, дорогие по памяти и контекст-переключениям. Virtual threads управляются самой JVM (M:N scheduling) — миллионы потоков на несколько carrier-потоков ОС.',
        medium:{
          theory:'Virtual thread монтируется на carrier thread (ForkJoinPool). При блокирующем вызове (I/O, sleep) JVM снимает поток с carrier и паркует его стек в heap — carrier продолжает обслуживать другие virtual threads. Идеальны для thread-per-request I/O-нагрузки. Ограничения: pinning в synchronized-блоках и native-вызовах (лечится ReentrantLock), не ускоряют CPU-bound задачи.',
          tradeoffs:'Плюс: огромная масштабируемость I/O без реактивного стека, код остаётся последовательным и простым. Минус: пулинг virtual threads — антипаттерн, ThreadLocal может съесть память при миллионах потоков (используй Scoped Values), нужна дисциплина с семафорами вместо пулов.',
          code:`// Один virtual thread на запрос — блокирующий код без проблем:
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 100_000).forEach(i ->
        executor.submit(() -> {
            Thread.sleep(Duration.ofSeconds(1)); // не блокирует OS-поток
            return fetchUrl(i);
        })
    );
}

// Простой запуск:
Thread.startVirtualThread(() -> handle(request));

// HTTP-клиент на virtual threads:
var client = HttpClient.newHttpClient();`
        },
        links:[
          {label:'JEP 444: Virtual Threads', url:'https://openjdk.org/jeps/444'},
          {label:'State of Loom', url:'https://cr.openjdk.org/~rpressler/loom/loom/sol1_part1.html'}
        ],
        questions:['Что такое pinning virtual thread и как его избежать?','Почему нельзя пулить virtual threads?','Чем virtual threads лучше reactive для I/O?']
      },
      {
        name:'Thread Creation and Lifecycle', tag:'threads', tagLabel:'Threads',
        summary:'Create threads via Thread subclass or Runnable/Callable; manage lifecycle with start(), join(), interrupt().',
        short:'Threads are created by extending Thread or implementing Runnable. Start with thread.start() (not run()). Thread lifecycle: NEW → RUNNABLE → BLOCKED/WAITING → TERMINATED. Callable returns a result via Future; Runnable returns void.',
        medium:{
          theory:'Thread extends java.lang.Thread and overrides run(). Runnable is a functional interface — preferred for composition. Callable<V> returns V and can throw checked exceptions. Executors factory methods create thread pools. Thread.join() waits for completion. interrupt() sets the interrupted flag — the thread must check and respond. Daemon threads run in the background and don\'t prevent JVM shutdown.',
          tradeoffs:'Prefer Runnable/Callable over extending Thread (Java has single inheritance). Use ExecutorService instead of raw threads for production code. Virtual threads (Java 21+) for massive I/O concurrency. Daemon threads for background tasks.',
          code:`// Extending Thread (rare)
class Worker extends Thread {
    @Override public void run() { /* work */ }
}
new Worker().start();

// Runnable — preferred
Runnable task = () -> System.out.println("Working...");
new Thread(task).start();

// Callable with Future
Callable<Integer> computation = () -> {
    Thread.sleep(1000);
    return 42;
};
Future<Integer> future = executor.submit(computation);
int result = future.get();  // blocks until result

// Daemon thread
Thread daemon = new Thread(() -> cleanup());
daemon.setDaemon(true);
daemon.start();

// Join — wait for thread to finish
Thread t = new Thread(task);
t.start();
t.join();  // blocks until t completes`
        },
        links:[
          {label:'Thread — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Thread.html'}
        ],
        questions:['What is the difference between start() and run()?','How does interrupt() work?','When to use daemon threads?']
      },
      {
        name:'synchronized, volatile, and JMM', tag:'threads', tagLabel:'Threads',
        summary:'synchronized provides mutual exclusion and visibility; volatile provides visibility only. Both establish happens-before relationships.',
        short:'synchronized ensures only one thread executes a block/method at a time (mutual exclusion) and makes changes visible to other threads. volatile ensures reads see the latest write (visibility) but does not provide atomicity. Both establish happens-before relationships in the Java Memory Model.',
        medium:{
          theory:'Java Memory Model (JMM): defines how threads interact through memory. Without synchronization, threads may see stale values due to CPU caches and compiler reordering. synchronized: acquires a monitor lock, provides mutual exclusion + visibility. volatile: no locking, but reads/writes go to main memory, preventing stale reads. volatile is not sufficient for compound operations (check-then-act, increment). Use AtomicInteger for atomic operations on single variables.',
          tradeoffs:'synchronized: simple, correct, but coarse-grained. volatile: lightweight for single-variable visibility, but no atomicity for compound operations. Use Atomic classes for lock-free single-variable operations. Use synchronized or ReentrantLock for multi-variable atomicity.',
          code:`// synchronized — mutual exclusion + visibility
class Counter {
    private int count = 0;
    synchronized void increment() { count++; }  // atomic
    synchronized int getCount() { return count; }
}

// synchronized block — finer granularity
synchronized (this) {
    sharedState.update();
}

// volatile — visibility only, no atomicity
class Flag {
    volatile boolean running = true;
    void stop() { running = false; }  // visible to all threads
    void work() {
        while (running) {  // sees latest value
            // do work
        }
    }
}

// WRONG: volatile does not make compound operations atomic
volatile int counter = 0;
counter++;  // NOT atomic! read-modify-write race condition

// CORRECT: AtomicInteger for atomic operations
AtomicInteger atomicCounter = new AtomicInteger(0);
atomicCounter.incrementAndGet();  // atomic`
        },
        links:[
          {label:'Java Memory Model — JSR 133', url:'https://www.cs.umd.edu/~pugh/java/memoryModel/jsr-133-java-memory-model.pdf'},
          {label:'Java Concurrency in Practice', url:'https://jcip.net/'}
        ],
        questions:['What is the happens-before relationship?','Why is volatile not enough for compound operations?','What does the JMM guarantee?']
      },
      {
        name:'Deadlocks and Race Conditions', tag:'threads', tagLabel:'Threads',
        summary:'Deadlock: threads waiting for each other forever. Race condition: timing-dependent incorrect results. Prevent with ordering, timeouts, and proper synchronization.',
        short:'A deadlock occurs when two or more threads each hold a lock and wait for the other\'s lock — all freeze forever. A race condition occurs when the result depends on the timing/ordering of thread execution, causing incorrect results.',
        medium:{
          theory:'Deadlock conditions (Coffman): 1) Mutual exclusion, 2) Hold and wait, 3) No preemption, 4) Circular wait. Prevention: acquire locks in consistent order, use tryLock with timeout, avoid holding multiple locks. Race conditions: check-then-act (if (!map.containsKey(k)) map.put(k,v)) and read-modify-write (count++) are not atomic. Fix: use synchronized, Atomic classes, or ConcurrentHashMap atomic operations.',
          tradeoffs:'Deadlock prevention via lock ordering is simple but requires discipline. tryLock with timeout adds complexity but enables recovery. Race conditions are often subtle — use thread-safe collections and Atomic classes rather than manual synchronization where possible.',
          code:`// Deadlock — threads waiting for each other
Object lockA = new Object(), lockB = new Object();
// Thread 1: lock A, then B
synchronized (lockA) { synchronized (lockB) { /* ... */ } }
// Thread 2: lock B, then A  — DEADLOCK!
synchronized (lockB) { synchronized (lockA) { /* ... */ } }

// Prevention: consistent lock ordering
// Both threads: always acquire lockA before lockB

// tryLock with timeout
ReentrantLock lock1 = new ReentrantLock();
ReentrantLock lock2 = new ReentrantLock();
if (lock1.tryLock(1, TimeUnit.SECONDS)) {
    try {
        if (lock2.tryLock(1, TimeUnit.SECONDS)) {
            try { /* work */ } finally { lock2.unlock(); }
        }
    } finally { lock1.unlock(); }
}

// Race condition — check-then-act
if (!map.containsKey(key)) {
    map.put(key, value);  // another thread may have inserted between check and put!
}
// Fix: ConcurrentHashMap.putIfAbsent(key, value)`
        },
        links:[
          {label:'Deadlocks — Oracle', url:'https://docs.oracle.com/javase/tutorial/essential/concurrency/deadlock.html'}
        ],
        questions:['What are the four conditions for deadlock?','How to detect deadlocks?','What is a check-then-act race condition?']
      },
      {
        name:'Synchronization Strategies', tag:'threads', tagLabel:'Threads',
        summary:'synchronized methods/blocks, Atomic classes, volatile, ReentrantLock, concurrent collections — choose based on granularity and performance needs.',
        short:'Multiple synchronization strategies exist: synchronized methods (coarse), synchronized blocks (finer), ReentrantLock (flexible with tryLock/conditions), Atomic classes (lock-free for single variables), volatile (visibility for single reads/writes), concurrent collections (thread-safe data structures).',
        medium:{
          theory:'synchronized methods lock on this (instance methods) or Class (static methods). Synchronized blocks allow locking on specific monitors. ReentrantLock supports tryLock, fairness, and multiple Conditions. Atomic classes use CAS for lock-free single-variable operations. Concurrent collections (ConcurrentHashMap, CopyOnWriteArrayList) provide thread-safe data access. Thread confinement: avoid sharing state entirely by keeping data thread-local.',
          tradeoffs:'Prefer thread confinement (no sharing) > immutable objects > Atomic classes > synchronized. Lock only what needs protection. Minimize critical section size. Use concurrent collections instead of synchronized wrappers.',
          code:`// Thread confinement — no sharing needed
void processRequest(Request req) {
    var localData = new HashMap<>();  // thread-local, no sync needed
    // work with localData
}

// Immutable — thread-safe by design
record Config(String url, int timeout) {}  // safely shared

// Atomic — lock-free single variable
AtomicLong counter = new AtomicLong(0);
counter.incrementAndGet();  // atomic, no lock
counter.compareAndSet(expected, newValue);  // CAS

// Synchronized block — protect only critical section
void addItem(Item item) {
    validate(item);  // no lock needed
    synchronized (items) {
        items.add(item);  // only this needs protection
    }
    notifyListeners();  // no lock needed
}

// Synchronizing 5 threads to start simultaneously
CountDownLatch startSignal = new CountDownLatch(1);
for (int i = 0; i < 5; i++) {
    new Thread(() -> {
        startSignal.await();  // all wait here
        doWork();
    }).start();
}
startSignal.countDown();  // release all 5 threads at once`
        },
        links:[
          {label:'Concurrency Utilities — Oracle', url:'https://docs.oracle.com/javase/tutorial/essential/concurrency/'}
        ],
        questions:['What is thread confinement?','How does CAS work?','How to synchronize thread startup?']
      },
      {
        name:'ExecutorService and Thread Pools', tag:'threads', tagLabel:'Threads',
        summary:'Thread pools reuse threads to avoid creation overhead. ExecutorService manages pool lifecycle and task submission.',
        short:'Thread pools manage a pool of worker threads that execute submitted tasks. ExecutorService provides submit(), shutdown(), and invokeAll(). Types: FixedThreadPool (constant size), CachedThreadPool (dynamic), SingleThreadExecutor (sequential), ScheduledThreadPool (periodic tasks).',
        medium:{
          theory:'Thread creation is expensive (~1ms, ~1MB stack). Thread pools amortize this cost. Core pool size: minimum threads kept alive. Maximum pool size: upper limit under load. Work queue: holds tasks when all core threads are busy. RejectedExecutionHandler: policy when queue is full and max threads reached. ForkJoinPool: work-stealing for divide-and-conquer tasks, default for parallel streams. Virtual thread executor (Java 21+): one virtual thread per task.',
          tradeoffs:'Fixed pool: predictable resources but can starve under load. Cached pool: elastic but can create too many threads. Always use bounded queues in production to prevent OOM. Shutdown gracefully with awaitTermination(). Never use Executors.newFixedThreadPool in production without a bounded queue.',
          code:`// Fixed thread pool
ExecutorService fixed = Executors.newFixedThreadPool(4);
fixed.submit(() -> processRequest(req));

// Production-ready: bounded queue + custom factory
ThreadPoolExecutor pool = new ThreadPoolExecutor(
    4, 8,                    // core, max threads
    60, TimeUnit.SECONDS,    // keep-alive for idle threads
    new LinkedBlockingQueue<>(1000),  // bounded queue!
    new ThreadFactoryBuilder().setNameFormat("worker-%d").build(),
    new ThreadPoolExecutor.CallerRunsPolicy()  // rejection policy
);

// Scheduled pool — periodic/delayed tasks
ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);
scheduler.scheduleAtFixedRate(() -> cleanup(), 0, 5, TimeUnit.MINUTES);

// ForkJoinPool — divide and conquer
ForkJoinPool fjPool = new ForkJoinPool();
long sum = fjPool.invoke(new SumTask(array, 0, array.length));

// Graceful shutdown
pool.shutdown();
if (!pool.awaitTermination(30, TimeUnit.SECONDS)) {
    pool.shutdownNow();
}`
        },
        links:[
          {label:'ExecutorService — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ExecutorService.html'},
          {label:'Java Concurrency in Practice Ch. 6', url:'https://jcip.net/'}
        ],
        questions:['What happens when the queue is full?','What is work-stealing in ForkJoinPool?','How to properly shut down a pool?']
      },
      {
        name:'Atomic Classes and Lock-Free Programming', tag:'threads', tagLabel:'Threads',
        summary:'AtomicInteger, AtomicLong, AtomicReference use CAS for lock-free thread-safe operations on single variables.',
        short:'Atomic classes provide thread-safe operations on single variables without locks, using Compare-And-Swap (CAS). CAS atomically updates a value only if it matches the expected value. AtomicInteger, AtomicLong, AtomicReference, and AtomicStampedReference are the main types.',
        medium:{
          theory:'CAS: compare memory value with expected, swap with new value only if match — hardware-level atomic operation. Atomic classes wrap Unsafe.compareAndSwapInt/Long/Object. Lock-free: no thread blocks another, progress guaranteed. Wait-free: every operation completes in bounded steps. ABA problem: value changes A→B→A between read and CAS, making CAS succeed incorrectly. AtomicStampedReference solves this with version stamps. VarHandle (Java 9+) provides lower-level CAS access.',
          tradeoffs:'Atomic classes: fastest for single-variable operations, no lock contention. CAS can spin under high contention (wasted CPU). ABA problem requires AtomicStampedReference. For multi-variable atomicity, use synchronized or ReentrantLock.',
          code:`// AtomicInteger — lock-free counter
AtomicInteger counter = new AtomicInteger(0);
counter.incrementAndGet();       // atomic ++counter
counter.decrementAndGet();       // atomic --counter
counter.addAndGet(10);           // atomic += 10
counter.compareAndSet(5, 10);    // if value == 5, set to 10

// AtomicReference — lock-free object reference
AtomicReference<Config> config = new AtomicReference<>(defaultConfig);
config.updateAndGet(current -> current.withNewTimeout(30));

// Lock-free stack using CAS
class ConcurrentStack<T> {
    private AtomicReference<Node<T>> top = new AtomicReference<>();
    
    void push(T item) {
        Node<T> newHead = new Node<>(item);
        Node<T> oldHead;
        do {
            oldHead = top.get();
            newHead.next = oldHead;
        } while (!top.compareAndSet(oldHead, newHead));
    }
}

// ABA problem — use AtomicStampedReference
AtomicStampedReference<Integer> ref = new AtomicStampedReference<>(1, 0);
ref.compareAndSet(1, 2, ref.getStamp(), ref.getStamp() + 1);`
        },
        links:[
          {label:'AtomicInteger — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/atomic/AtomicInteger.html'}
        ],
        questions:['What is CAS?','What is the ABA problem?','When is lock-free better than lock-based?']
      },
      {
        name:'ConcurrentHashMap Internals', tag:'threads', tagLabel:'Threads',
        summary:'Lock-free reads via volatile, bucket-level synchronization for writes, atomic compound operations — the gold standard concurrent map.',
        short:'ConcurrentHashMap (Java 8+) uses volatile reads (lock-free get) and synchronized on individual bucket heads for writes. Atomic compound operations (computeIfAbsent, merge) ensure correctness for check-then-act patterns. No null keys or values allowed.',
        medium:{
          theory:'Read operations: traverse nodes using volatile reads — no locking needed. Write operations: CAS to insert into empty bucket, synchronized on first node for non-empty bucket. Size counting: distributed counter cells (similar to LongAdder) avoid contention. computeIfAbsent/merge/forEachEntry provide atomic compound operations. Does not allow null keys/values because get(key) returning null is ambiguous in concurrent context (absent vs stored null).',
          tradeoffs:'Best concurrent Map implementation. Reads are lock-free and fast. Writes have fine-grained locking (per bucket). Cannot lock the entire map. For read-heavy workloads, excellent. For write-heavy with few keys, consider sharding into multiple maps.',
          code:`ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();

// Lock-free read
Integer value = map.get("key");  // no lock acquired

// Atomic compound operations
map.putIfAbsent("key", 42);
map.computeIfAbsent("key", k -> expensiveComputation(k));
map.merge("counter", 1, Integer::sum);  // atomic increment

// Atomic check-then-act
map.compute("balance", (k, v) -> {
    int current = (v == null) ? 0 : v;
    return current - amount;  // atomic read-modify-write
});

// Parallel processing (threshold-based)
map.forEach(10, (k, v) -> process(k, v));  // parallel if size > 10
long sum = map.reduceToLong(10, (k, v) -> v, 0L, Long::sum);

// Why no null?
// map.get("absent") returns null — is key absent or stored null?
// In concurrent context, this ambiguity is dangerous`
        },
        links:[
          {label:'ConcurrentHashMap — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html'}
        ],
        questions:['How are reads lock-free?','Why no null keys/values?','How does size counting work?']
      },
      {
        name:'Virtual Threads Deep Dive', tag:'threads', tagLabel:'Threads',
        summary:'JVM-managed lightweight threads: millions of concurrent I/O tasks with thread-per-request simplicity.',
        short:'Virtual threads (Java 21) are managed by the JVM, not the OS. Each virtual thread is multiplexed onto a small number of carrier (platform) threads. Blocking I/O unmounts the virtual thread, freeing the carrier for other virtual threads. Ideal for I/O-bound workloads.',
        medium:{
          theory:'Virtual threads are scheduled by a ForkJoinPool of carrier threads. When a virtual thread blocks (I/O, sleep, lock), the JVM unmounts it from the carrier, parks its stack in heap memory, and the carrier picks up another virtual thread. This enables millions of concurrent I/O tasks without reactive programming. Pinning: synchronized blocks and native calls pin the virtual thread to its carrier (use ReentrantLock instead). ThreadLocal at scale: use Scoped Values (JEP 446) instead. Pooling virtual threads is an anti-pattern — they are cheap to create.',
          tradeoffs:'Pros: massive I/O scalability, simple blocking code, no reactive overhead. Cons: not faster for CPU-bound work, pinning in synchronized blocks, ThreadLocal can consume too much memory. Structured concurrency (preview) simplifies error handling and cancellation across concurrent tasks.',
          code:`// Virtual thread executor — one thread per task
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    // 100,000 concurrent HTTP requests
    List<Future<String>> futures = urls.stream()
        .map(url -> executor.submit(() -> httpClient.get(url)))
        .toList();
    List<String> results = futures.stream()
        .map(Future::get)
        .toList();
}

// Direct creation
Thread vt = Thread.startVirtualThread(() -> handleRequest(req));

// Avoid pinning — use ReentrantLock
// BAD: synchronized blocks pin virtual thread to carrier
synchronized (lock) { blockingIO(); }

// GOOD: ReentrantLock does not pin
ReentrantLock lock = new ReentrantLock();
lock.lock();
try { blockingIO(); } finally { lock.unlock(); }

// Structured concurrency (preview, Java 21)
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    Subtask<User> user = scope.fork(() -> findUser(id));
    Subtask<Order> order = scope.fork(() -> fetchOrder(id));
    scope.join().throwIfFailed();
    return new Response(user.get(), order.get());
}`
        },
        links:[
          {label:'JEP 444: Virtual Threads', url:'https://openjdk.org/jeps/444'},
          {label:'JEP 453: Structured Concurrency', url:'https://openjdk.org/jeps/453'}
        ],
        questions:['What causes virtual thread pinning?','Why not pool virtual threads?','What is structured concurrency?']
      },
      {
        name:'CompletableFuture Basics', tag:'threads', tagLabel:'Async',
        summary:'Composable async programming: chain dependent computations, handle errors, combine results — all non-blocking.',
        short:'CompletableFuture (Java 8+) extends Future with a rich fluent API for composing asynchronous computations. Unlike Future, it supports chaining (thenApply, thenCompose), combining (thenCombine, allOf, anyOf), and error handling (exceptionally, handle).',
        medium:{
          theory:'CompletableFuture represents a value that will be available in the future. Create with: supplyAsync (returns value), runAsync (void), completedFuture (already done). Chain with: thenApply (map), thenCompose (flatMap), thenAccept (consume), thenRun (side effect). Error handling: exceptionally (recover), handle (always runs, gets result or exception), whenComplete (side effect on completion). The default executor is ForkJoinPool.commonPool() — provide a custom executor for I/O tasks.',
          tradeoffs:'CompletableFuture: powerful composition but verbose for complex flows. Reactive streams (Project Reactor, RxJava) offer richer operators. Virtual threads (Java 21+) can simplify async code to blocking style. Avoid blocking operations (.get(), .join()) inside chains — defeats the purpose.',
          code:`// Create and chain
CompletableFuture<String> future = CompletableFuture
    .supplyAsync(() -> fetchUser(id))           // async
    .thenApply(user -> user.getEmail())          // transform
    .thenCompose(email -> sendEmail(email))      // chain another async
    .exceptionally(ex -> {                       // error recovery
        log.error("Failed", ex);
        return "fallback@email.com";
    });

// thenApply vs thenCompose
// thenApply: T → U (sync transform)
// thenCompose: T → CompletableFuture<U> (async flatMap)

// Combine two futures
CompletableFuture<String> nameFuture = fetchName(id);
CompletableFuture<Integer> ageFuture = fetchAge(id);

CompletableFuture<String> combined = nameFuture
    .thenCombine(ageFuture, (name, age) -> name + " (" + age + ")");

// Manual completion
CompletableFuture<String> manual = new CompletableFuture<>();
manual.complete("result");  // or completeExceptionally(ex)`
        },
        links:[
          {label:'CompletableFuture — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/CompletableFuture.html'}
        ],
        questions:['What is the difference between thenApply and thenCompose?','What executor does supplyAsync use by default?','How to manually complete a future?']
      },
      {
        name:'CompletableFuture Combining and Error Handling', tag:'threads', tagLabel:'Async',
        summary:'allOf waits for all, anyOf returns first completed. handle/exceptionally/whenComplete for error recovery.',
        short:'allOf() creates a future that completes when all given futures complete. anyOf() returns the first completed future. handle() processes result or exception. exceptionally() recovers from exceptions. whenComplete() runs a side effect on completion.',
        medium:{
          theory:'allOf(CompletableFuture<?>... cfs) returns CompletableFuture<Void> — use join/get to wait, then extract individual results. anyOf() returns the result of the first to complete (success or failure). handle((result, exception) -> ...) always runs — return transformed result or recovered value. exceptionally(exception -> ...) only runs on failure. whenComplete((result, exception) -> ...) is for side effects (logging), does not transform the result.',
          tradeoffs:'allOf: use for parallel fan-out (e.g., call 3 microservices, aggregate). anyOf: use for fastest-wins (e.g., try multiple CDN endpoints). handle is the most flexible error handler. orTimeout() (Java 9+) prevents indefinite waiting.',
          code:`// Fan-out: parallel microservice calls
CompletableFuture<User> userFuture = supplyAsync(() -> userService.get(id));
CompletableFuture<List<Order>> ordersFuture = supplyAsync(() -> orderService.list(id));
CompletableFuture<Profile> profileFuture = supplyAsync(() -> profileService.get(id));

CompletableFuture<UserProfile> all = CompletableFuture.allOf(
    userFuture, ordersFuture, profileFuture
).thenApply(v -> new UserProfile(
    userFuture.join(),
    ordersFuture.join(),
    profileFuture.join()
));

// Timeout (Java 9+)
future.orTimeout(5, TimeUnit.SECONDS)
    .exceptionally(ex -> {
        if (ex instanceof TimeoutException) return fallback();
        throw new CompletionException(ex);
    });

// Retry pattern
CompletableFuture<Data> withRetry(Supplier<CompletableFuture<Data>> action, int retries) {
    return action.get().exceptionally(ex -> {
        if (retries <= 0) throw new CompletionException(ex);
        return withRetry(action, retries - 1).join();
    });
}

// handle vs exceptionally vs whenComplete
future.handle((result, ex) -> ex != null ? fallback() : result);  // transform
future.exceptionally(ex -> fallback());  // recover
future.whenComplete((result, ex) -> log(result, ex));  // side effect`
        },
        links:[
          {label:'CompletableFuture — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/CompletableFuture.html'}
        ],
        questions:['What does allOf return?','How does anyOf handle failures?','How to implement timeout?']
      },
      {
        name:'Async Patterns and Best Practices', tag:'threads', tagLabel:'Async',
        summary:'Use custom executors, avoid blocking in chains, handle exceptions, and prefer CompletableFuture for orchestration vs reactive for streaming.',
        short:'Best practices: always provide a custom Executor for async methods (avoid ForkJoinPool.commonPool for I/O), never block inside chains, handle exceptions at every stage, and use CompletableFuture for request-response orchestration while reactive streams are better for continuous data flows.',
        medium:{
          theory:'supplyAsync(fn, executor) lets you specify where async work runs. For I/O tasks, use a cached or virtual thread executor. Blocking calls (.get(), .join()) inside a chain block the ForkJoinPool thread — use thenCompose instead. join() throws CompletionException (unchecked), get() throws checked exceptions. CompletableFuture is ideal for orchestrating parallel service calls. Reactive programming (Reactor, RxJava) is better for backpressure, streaming, and complex event processing.',
          tradeoffs:'CompletableFuture: best for one-shot async pipelines (call 3 services, combine results). Reactive: best for continuous streams with backpressure. Virtual threads: simplify async by writing blocking code that scales. Choose based on the problem shape.',
          code:`// Custom executor for I/O
ExecutorService ioExecutor = Executors.newVirtualThreadPerTaskExecutor();

CompletableFuture<User> user = CompletableFuture
    .supplyAsync(() -> httpClient.get("/users/" + id), ioExecutor)
    .thenApply(response -> parseUser(response));

// Parallel service calls
var profile = supplyAsync(() -> profileService.get(id), ioExecutor);
var orders = supplyAsync(() -> orderService.list(id), ioExecutor);
var prefs = supplyAsync(() -> prefService.get(id), ioExecutor);

var dashboard = allOf(profile, orders, prefs)
    .thenApply(v -> new Dashboard(
        profile.join(), orders.join(), prefs.join()
    ));

// join vs get
dashboard.join();     // throws CompletionException (unchecked)
dashboard.get();      // throws ExecutionException (checked)
dashboard.get(5, SECONDS);  // with timeout

// Testing: use completedFuture for mocks
CompletableFuture.completedFuture(mockUser);`
        },
        links:[
          {label:'CompletableFuture Guide', url:'https://www.baeldung.com/java-completablefuture'}
        ],
        questions:['Why avoid ForkJoinPool.commonPool for I/O?','When to use reactive over CompletableFuture?','How to test async code?']
      }
    ]
  },);
