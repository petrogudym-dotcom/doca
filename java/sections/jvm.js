window.SECTIONS = window.SECTIONS || [];
window.SECTIONS.push(  {
    id:'jvm', title:'JVM и память', icon:'🧠', iconBg:'#FFF3E0',
    topics:[
      {
        name:'G1GC vs ZGC', tag:'jvm', tagLabel:'JVM',
        summary:'Два современных сборщика мусора: G1 — баланс throughput и пауз, ZGC — субмиллисекундные паузы.',
        short:'G1GC делит кучу на равные регионы и собирает их параллельно и инкрементально, целясь в заданный pause time. ZGC — low-latency коллектор для куч от мегабайт до терабайт с паузами стабильно ниже 1 мс (colored pointers + load barriers).',
        medium:{
          theory:'G1 разбивает heap на регионы (Eden/Survivor/Old), собирает их по приоритету "garbage-first" и ориентируется на -XX:MaxGCPauseMillis. ZGC использует colored pointers (метаданные в указателе) и load barriers, позволяя потокам приложения работать одновременно со сборкой — почти вся работа GC конкурентна.',
          tradeoffs:'G1: предсказуемый throughput, хорош до ~десятков ГБ. ZGC: минимальные паузы независимо от размера кучи, но чуть ниже throughput и больше памяти на overhead (forwarding tables). Для больших heap с жёсткими требованиями к latency — ZGC или Generational ZGC (JDK 21+).',
          code:`# G1 — цели по паузам:
java -XX:+UseG1GC -XX:MaxGCPauseMillis=100 -Xms4g -Xmx4g -jar app.jar

# ZGC — субмиллисекундные паузы:
java -XX:+UseZGC -XX:+ZGenerational -Xmx16g -jar app.jar

# Диагностика пауз:
java -XX:+UseZGC -Xlog:gc*:file=gc.log:time,uptime -jar app.jar`
        },
        links:[
          {label:'ZGC — OpenJDK', url:'https://openjdk.org/jeps/333'},
          {label:'G1 Garbage-First', url:'https://www.oracle.com/technical-resources/articles/java/g1gc.html'}
        ],
        questions:['Как работает colored pointers в ZGC?','Что такое remembered set в G1?','Когда выбирать Parallel GC вместо G1?','Что изменил Generational ZGC?']
      },
      {
        name:'Metaspace vs PermGen', tag:'jvm', tagLabel:'JVM',
        summary:'PermGen был частью heap с фиксированным лимитом; Metaspace живёт в native memory и растёт динамически.',
        short:'PermGen (до Java 7) — часть Java Heap фиксированного размера, источник OutOfMemoryError: PermGen space. Metaspace (Java 8+) находится в нативной памяти и расширяется динамически, если не ограничен -XX:MaxMetaspaceSize.',
        medium:{
          theory:'Metaspace хранит метаданные классов, методы, constant pool. Память выделяется из native heap; при выгрузке классов метаданные освобождаются. String table и static-поля переехали в обычный heap. Ограничение: -XX:MaxMetaspaceSize, иначе metaspace может расти до исчерпания памяти машины.',
          tradeoffs:'Плюс Metaspace: нет жёсткого лимита по умолчанию, меньше OOM при динамической генерации классов (CGLIB, Groovy, hot reload). Минус: утечки классов (classloader leaks) незаметно съедают нативную память — нужен мониторинг и лимит в production.',
          code:`# Ограничение Metaspace в production:
java -XX:MetaspaceSize=256m -XX:MaxMetaspaceSize=512m -jar app.jar

# Типичная причина утечки — повторяющаяся генерация классов:
for (int i = 0; i < 100_000; i++) {
    Enhancer enhancer = new Enhancer();      // CGLIB
    enhancer.setSuperclass(Foo.class);
    enhancer.setUseCache(false);             // ← кэш выключен,
    enhancer.create();                       //    каждый вызов = новый класс
}
// java.lang.OutOfMemoryError: Metaspace`
        },
        links:[
          {label:'JEP 122: Remove Permanent Generation', url:'https://openjdk.org/jeps/122'},
          {label:'Metaspace in Java 8', url:'https://www.infoq.com/articles/Java-PermGen-Where-Art-Thou/'}
        ],
        questions:['Что хранится в Metaspace?','Почему утечка classloader приводит к OOM: Metaspace?','Как диагностировать рост Metaspace?']
      },
      {
        name:'Heap vs Stack Memory', tag:'jvm', tagLabel:'JVM',
        summary:'Heap stores objects (shared, GC-managed); Stack stores method frames with local variables (per-thread, auto-freed).',
        short:'The Heap is shared among all threads and stores objects and arrays — managed by the garbage collector. The Stack is per-thread, stores method call frames with local primitives and object references — automatically freed when methods return.',
        medium:{
          theory:'Heap: divided into Young Generation (Eden + Survivor) and Old Generation. Objects start in Eden, survive GC to move to Survivor, then Old. Stack: each thread has its own stack (~512KB-1MB default, configurable with -Xss). Stack frames contain local variables, method arguments, return address. StackOverflowError when recursion is too deep. Escape analysis (JIT) can allocate non-escaping objects on the stack for performance.',
          tradeoffs:'Heap: large, shared, GC overhead. Stack: fast allocation/deallocation, limited size. Understanding the distinction is essential for memory tuning and avoiding StackOverflowError or excessive GC pauses.',
          code:`// Stack: local variables and references
void method() {
    int x = 42;            // primitive on stack
    String s = "hello";    // reference on stack, object on heap
    int[] arr = new int[10]; // reference on stack, array on heap
} // stack frame freed when method returns

// Heap: all objects
Object obj = new Object();  // obj reference on stack, object on heap
List<String> list = new ArrayList<>();  // list on heap, elements on heap

// Stack overflow
void infinite() { infinite(); }  // StackOverflowError

// -Xss to change stack size
// java -Xss2m MyApp

// Escape analysis optimization (JIT)
Point createPoint(int x, int y) {
    Point p = new Point(x, y);  // may be allocated on stack if doesn't escape
    return p.getX();            // JIT may eliminate allocation entirely
}`
        },
        links:[
          {label:'JVM Memory Structure', url:'https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html#jvms-2.5'}
        ],
        questions:['What causes StackOverflowError?','Can objects be allocated on the stack?','What is escape analysis?']
      },
      {
        name:'Garbage Collection Algorithms', tag:'jvm', tagLabel:'JVM',
        summary:'GC algorithms: Serial (single-thread), Parallel (throughput), G1 (balanced), ZGC/Shenandoah (low-latency). Choose based on pause time requirements.',
        short:'Java provides multiple GC algorithms: Serial (single-thread, small heaps), Parallel/Throughput (max throughput, longer pauses), G1 (balanced pauses, default since Java 9), ZGC and Shenandoah (sub-millisecond pauses for any heap size).',
        medium:{
          theory:'Serial GC: single-thread mark-compact, best for small heaps (<100MB). Parallel GC: multi-thread mark-compact, maximizes throughput at the cost of pauses. G1 GC: divides heap into equal regions, collects "garbage-first" regions, targets -XX:MaxGCPauseMillis. ZGC: concurrent mark-relocate with colored pointers and load barriers — pauses <1ms regardless of heap size. Shenandoah: concurrent compacting GC with Brooks pointers — similar goals to ZGC. Generational ZGC (Java 21+): adds young/old generation separation for better throughput.',
          tradeoffs:'G1: good default for most apps up to ~tens of GB. ZGC/Shenandoah: essential for low-latency apps with large heaps. Parallel: best for batch processing where pauses don\'t matter. Serial: containers with tiny heaps.',
          code:`# G1 GC — default, balanced pauses
java -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -Xmx4g -jar app.jar

# ZGC — sub-millisecond pauses
java -XX:+UseZGC -Xmx16g -jar app.jar

# Generational ZGC (Java 21+)
java -XX:+UseZGC -XX:+ZGenerational -Xmx16g -jar app.jar

# Shenandoah — concurrent compacting
java -XX:+UseShenandoahGC -Xmx8g -jar app.jar

# Parallel — max throughput
java -XX:+UseParallelGC -Xmx4g -jar app.jar

# GC logging
java -Xlog:gc*:file=gc.log:time,uptime,level,tags -jar app.jar`
        },
        links:[
          {label:'Garbage Collection — Oracle', url:'https://docs.oracle.com/en/java/javase/21/gct/introduction-garbage-collection.html'},
          {label:'ZGC', url:'https://openjdk.org/jeps/333'}
        ],
        questions:['What is stop-the-world?','Which GC minimizes pauses?','What are GC roots?']
      },
      {
        name:'Memory Leaks and Tuning', tag:'jvm', tagLabel:'JVM',
        summary:'Memory leaks in Java: unreachable references held by static fields, caches, listeners. Detect with heap dumps and profilers.',
        short:'Java memory leaks occur when objects are no longer needed but remain reachable (e.g., static collections, unremoved listeners, unclosed resources). Detect via heap dumps (jmap, VisualVM), monitor GC behavior, and tune with -Xms/-Xmx.',
        medium:{
          theory:'Common leak sources: static collections that grow unbounded, listener/callback references not removed, ThreadLocal not cleared in thread pools, classloader leaks in web containers, unclosed resources. Detection: 1) Monitor heap usage over time (if it grows without returning, leak likely). 2) Take heap dump: jmap -dump:live,format=b,file=heap.hprof. 3) Analyze with Eclipse MAT or VisualVM — find dominator tree, GC roots. 4) Fix by removing strong references or using WeakReference.',
          tradeoffs:'-Xms and -Xmx should be equal in production to avoid heap resizing pauses. OutOfMemoryError types: heap space, metaspace, GC overhead limit exceeded, unable to create new native thread. Use weak references for caches, remove listeners on cleanup, close resources in try-with-resources.',
          code:`# Set heap bounds (production)
java -Xms4g -Xmx4g -jar app.jar

# Take heap dump
jmap -dump:live,format=b,file=heap.hprof <pid>

# Heap dump on OOM (always enable in production!)
java -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp/ -jar app.jar

# Common leak: static collection
static final List<Object> CACHE = new ArrayList<>();  // grows forever!
// Fix: use bounded cache or WeakHashMap

# Common leak: ThreadLocal in thread pool
ThreadLocal<UserContext> context = new ThreadLocal<>();
// Must call context.remove() after each request

# WeakReference for cache
Map<Key, Value> cache = new WeakHashMap<>();  // entries evicted when key is GC'd`
        },
        links:[
          {label:'Memory Leak Detection', url:'https://www.baeldung.com/java-memory-leaks'},
          {label:'Eclipse Memory Analyzer', url:'https://www.eclipse.org/mat/'}
        ],
        questions:['What are common Java memory leak sources?','How to analyze a heap dump?','What types of OOM exist?']
      },
      {
        name:'JIT Compiler and ClassLoading', tag:'jvm', tagLabel:'JVM',
        summary:'JIT compiles hot methods to optimized native code. ClassLoaders use parent delegation to load classes hierarchically.',
        short:'The JIT (Just-In-Time) compiler translates frequently executed bytecode into optimized native machine code at runtime. ClassLoaders follow parent delegation: bootstrap → platform → application. Custom ClassLoaders enable hot-reloading, plugin systems, and OSGi.',
        medium:{
          theory:'JIT: C1 (client) compiler for quick compilation, C2 (server) compiler for maximum optimization. Methods become "hot" after ~10,000 invocations (-XX:CompileThreshold). Optimizations: method inlining, escape analysis, loop unrolling, dead code elimination. ClassLoaders: bootstrap (java.*), platform (ext/*), application (classpath). Custom ClassLoaders: override findClass(), use for hot deployment, plugin isolation, or encrypted class files.',
          tradeoffs:'JIT: massive performance gains for long-running apps, but startup is slow (use GraalVM native-image for instant start). ClassLoaders: powerful for isolation but can cause ClassCastException across loaders and classloader leaks.',
          code:`# View JIT compilation
java -XX:+PrintCompilation -jar app.jar

# JIT tiers (default since Java 11)
# Tier 1: C1, no profiling
# Tier 2: C1, light profiling
# Tier 3: C1, full profiling
# Tier 4: C2, full optimization

# Custom ClassLoader
class EncryptedClassLoader extends ClassLoader {
    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        byte[] encrypted = loadEncryptedClass(name);
        byte[] decrypted = decrypt(encrypted);
        return defineClass(name, decrypted, 0, decrypted.length);
    }
}

# Weak/Soft references for caching
WeakReference<Object> weak = new WeakReference<>(obj);  // cleared eagerly
SoftReference<Object> soft = new SoftReference<>(obj);  // cleared under memory pressure`
        },
        links:[
          {label:'JIT Compilation — Oracle', url:'https://docs.oracle.com/en/java/javase/21/vm/compiler-reference.html'},
          {label:'ClassLoader — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/ClassLoader.html'}
        ],
        questions:['What are JIT compilation tiers?','What is parent delegation in ClassLoaders?','How do weak references differ from soft references?']
      },
      {
        name:'GC Tuning and Generations', tag:'jvm', tagLabel:'GC',
        summary:'Young gen collects short-lived objects quickly; old gen collects long-lived objects less frequently. Tune generation sizes for your allocation pattern.',
        short:'The heap is divided into Young Generation (Eden + 2 Survivor spaces) and Old Generation. Most objects die young (weak generational hypothesis). Minor GC collects young gen (fast); Major/Full GC collects old gen (slow). Tune -XX:NewRatio and -XX:SurvivorRatio for your allocation pattern.',
        medium:{
          theory:'Object lifecycle in GC: 1) Allocated in Eden. 2) If survives minor GC, moved to Survivor (S0/S1). 3) After several survivals (-XX:MaxTenuringThreshold), promoted to Old. Minor GC: copies live objects from Eden to Survivor, fast (only young gen). Major GC: compacts old gen, slower. Full GC: collects everything, longest pause. -Xmn sets young gen size. -XX:NewRatio=2 means old:young = 2:1. G1 GC manages regions dynamically, reducing the need for manual tuning.',
          tradeoffs:'Large young gen: fewer minor GCs but more objects promoted to old. Small young gen: frequent minor GCs. Production rule: set -Xms = -Xmx to avoid resizing pauses. Let G1/ZGC handle generation sizing automatically unless profiling shows issues.',
          code:`# Monitor GC behavior
java -Xlog:gc*:file=gc.log:time,uptime,level,tags -jar app.jar

# Key GC metrics to monitor:
# - Pause time (target: < MaxGCPauseMillis)
# - GC frequency (should be infrequent for old gen)
# - Heap usage trend (should return to baseline after GC)

# Young gen sizing
java -Xms4g -Xmx4g -Xmn1g -XX:+UseG1GC -jar app.jar

# G1 GC specific tuning
java -XX:+UseG1GC \\
     -XX:MaxGCPauseMillis=100 \\
     -XX:G1HeapRegionSize=4m \\
     -XX:InitiatingHeapOccupancyPercent=45 \\
     -jar app.jar

# Tools for GC analysis:
# - GCViewer: visualize GC logs
# - GCeasy.io: online GC log analyzer
# - JFR (Java Flight Recorder): low-overhead profiling`
        },
        links:[
          {label:'GC Tuning — Oracle', url:'https://docs.oracle.com/en/java/javase/21/gct/garbage-collector-implementation.html'},
          {label:'GC Log Analysis', url:'https://gceasy.io/'}
        ],
        questions:['What is the weak generational hypothesis?','When does promotion to old gen occur?','How to interpret GC logs?']
      },
      {
        name:'Performance Profiling and Optimization', tag:'jvm', tagLabel:'Performance',
        summary:'Profile before optimizing: JFR for production, async-profiler for CPU, allocation profiling for memory. Avoid premature optimization.',
        short:'Always profile before optimizing — guesses about bottlenecks are usually wrong. Use Java Flight Recorder (JFR) for production monitoring, async-profiler for CPU/flame graphs, and allocation profiling for memory issues. Optimize algorithms and data structures before micro-optimizations.',
        medium:{
          theory:'Profiling tools: JFR (built-in, <1% overhead), async-profiler (low-overhead sampling, flame graphs), JMH (microbenchmarking). Common optimizations: reduce object allocation (use primitives, avoid autoboxing in hot loops), choose right data structures (HashMap vs TreeMap), minimize synchronization, use batch operations, pre-allocate collections. Avoid: premature optimization, micro-benchmarks without warmup, optimizing code that isn\'t the bottleneck.',
          tradeoffs:'JFR: production-safe, comprehensive data. async-profiler: best for CPU profiling with flame graphs. JMH: essential for microbenchmarks but easy to misuse. Always measure, don\'t guess.',
          code:`# Enable JFR in production (low overhead)
java -XX:StartFlightRecording=duration=60s,filename=recording.jfr -jar app.jar

# async-profiler for CPU profiling
./asprof -d 30 -f flamegraph.html <pid>

# JMH microbenchmark
@Benchmark
@BenchmarkMode(Mode.AverageTime)
@OutputTimeUnit(TimeUnit.NANOSECONDS)
public String stringConcat() {
    return "Hello" + name + "!";
}

# Run JMH
java -jar benchmarks.jar -wi 5 -i 5 -f 1

# Common performance wins:
# 1. Pre-size collections: new ArrayList<>(expectedSize)
# 2. Use StringBuilder for string building in loops
# 3. Use EnumSet/EnumMap for enum keys
# 4. Avoid autoboxing in hot paths
# 5. Use primitive specializations (IntStream, etc.)`
        },
        links:[
          {label:'Java Flight Recorder', url:'https://docs.oracle.com/en/java/javase/21/jfrec/index.html'},
          {label:'JMH — OpenJDK', url:'https://openjdk.org/projects/code-tools/jmh/'}
        ],
        questions:['Why profile before optimizing?','What is JFR?','How to write a correct microbenchmark?']
      },
      {
        name:'Writing Efficient Java Code', tag:'jvm', tagLabel:'Performance',
        summary:'Pre-size collections, avoid autoboxing in loops, use primitive streams, prefer composition, and minimize object allocation in hot paths.',
        short:'Key efficiency tips: pre-size collections to avoid rehashing/resizing, use primitive types and streams instead of boxed types in hot paths, minimize object allocation, use StringBuilder for string building, prefer EnumSet/EnumMap for enums, and batch I/O operations.',
        medium:{
          theory:'Object allocation is cheap in modern JVMs (~10ns) but GC pressure from short-lived objects causes pauses. Key optimizations: 1) Pre-size HashMap/ArrayList (new HashMap<>(expectedSize * 4/3 + 1)). 2) Use IntStream/LongStream instead of Stream<Integer>. 3) Avoid autoboxing in loops (int not Integer). 4) Use try-with-resources to prevent resource leaks. 5) Batch database operations with JDBC batching. 6) Use connection pooling (HikariCP). 7) Cache expensive computations (Caffeine, Guava Cache).',
          tradeoffs:'Premature optimization is the root of all evil — profile first. Micro-optimizations rarely matter for I/O-bound services. Focus on algorithmic improvements (O(n²) → O(n log n)) before micro-optimizations. Use JMH for microbenchmarks, not System.currentTimeMillis().',
          code:`// Pre-size collections
int expectedSize = 10000;
Map<String, Object> map = new HashMap<>((int)(expectedSize / 0.75f) + 1);
List<String> list = new ArrayList<>(expectedSize);

// Primitive streams — avoid autoboxing
int sum = IntStream.range(0, 1_000_000).sum();  // fast
// Stream<Integer>.reduce(0, Integer::sum);  // slow (boxes each int)

// Efficient string building
StringBuilder sb = new StringBuilder(expectedLength);
for (String s : items) sb.append(s).append(',');

// Batch JDBC operations
try (PreparedStatement ps = conn.prepareStatement("INSERT INTO t VALUES (?)")) {
    for (Item item : items) {
        ps.setString(1, item.getName());
        ps.addBatch();
    }
    ps.executeBatch();  // single round-trip
}

// Caching with Caffeine
Cache<Key, Value> cache = Caffeine.newBuilder()
    .maximumSize(10_000)
    .expireAfterWrite(Duration.ofMinutes(10))
    .build();`
        },
        links:[
          {label:'Java Performance — Scott Oaks', url:'https://www.oreilly.com/library/view/java-performance/9781492056102/'}
        ],
        questions:['How to pre-size a HashMap?','Why avoid autoboxing in loops?','What is the cost of object allocation in JVM?']
      }
    ]
  },);
