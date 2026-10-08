window.SECTIONS = window.SECTIONS || [];
window.SECTIONS.push(  {
    id:'advanced', title:'Advanced Java', icon:'🔬', iconBg:'#F0E8FE',
    topics:[
      {
        name:'Generics Fundamentals', tag:'advanced', tagLabel:'Advanced',
        summary:'Type-safe parameterized classes and methods with compile-time checking and type erasure at runtime.',
        short:'Generics allow classes, interfaces, and methods to operate on types specified by the caller. They provide compile-time type safety and eliminate casts. At runtime, type parameters are erased (type erasure) — List<String> becomes List.',
        medium:{
          theory:'Generics were introduced in Java 5 to eliminate unchecked casts and ClassCastExceptions. Type erasure: the compiler removes type parameters and replaces them with their bounds (or Object). Bridge methods are generated to preserve polymorphism. Wildcards (? extends T, ? super T) enable flexible subtyping. Raw types (List without parameters) bypass generics — avoid them as they defeat type safety.',
          tradeoffs:'Pros: compile-time type safety, no casts, self-documenting APIs. Cons: type erasure limits runtime operations (no instanceof List<String>, no new T[], no primitive types as parameters). Raw types exist for backward compatibility but generate warnings.',
          code:`// Generic class
class Box<T> {
    private T value;
    void set(T value) { this.value = value; }
    T get() { return value; }
}
Box<String> stringBox = new Box<>();
stringBox.set("hello");  // compile-time type check
String s = stringBox.get();  // no cast needed

// Generic method
<T extends Comparable<T>> T max(T a, T b) {
    return a.compareTo(b) >= 0 ? a : b;
}

// Type erasure at runtime
List<String> strings = new ArrayList<>();
// strings instanceof List<String>  // ERROR: cannot check parameterized type
strings instanceof List  // OK: raw type check

// Cannot create generic arrays
// T[] arr = new T[10];  // ERROR
// T instance = new T();  // ERROR

// Raw type — avoid!
List raw = new ArrayList();  // unchecked warning
raw.add(42);
raw.add("string");  // compiles but breaks type safety`
        },
        links:[
          {label:'Generics — Oracle Tutorial', url:'https://docs.oracle.com/javase/tutorial/java/generics/'},
          {label:'Type Erasure — Oracle', url:'https://docs.oracle.com/javase/tutorial/java/generics/erasure.html'}
        ],
        questions:['What is type erasure?','Why can you not create generic arrays?','What are bridge methods?']
      },
      {
        name:'Wildcards: PECS and Bounds', tag:'advanced', tagLabel:'Advanced',
        summary:'? extends T (producer/upper bound), ? super T (consumer/lower bound). PECS: Producer Extends, Consumer Super.',
        short:'Upper bounded wildcard (? extends Number) accepts Number and its subtypes — for reading (producing). Lower bounded wildcard (? super Integer) accepts Integer and its supertypes — for writing (consuming). PECS helps choose the right bound.',
        medium:{
          theory:'List<? extends Number> can hold List<Integer> or List<Double> — you can read Number but cannot add (unknown subtype). List<? super Integer> can hold List<Integer>, List<Number>, or List<Object> — you can add Integer but reads return Object. Unbounded wildcard (?) is equivalent to ? extends Object. List<?> and List<Object> differ: List<?> accepts any List, List<Object> only accepts List<Object> (generics are invariant).',
          tradeoffs:'Use PECS for method parameters: producers use extends, consumers use super. For fields and return types, use exact types. Wildcards increase API flexibility but add complexity.',
          code:`// Producer Extends — reading from source
double sumAll(List<? extends Number> numbers) {
    double sum = 0;
    for (Number n : numbers) sum += n.doubleValue();
    // numbers.add(42);  // ERROR: cannot add (unknown subtype)
    return sum;
}

// Consumer Super — writing to destination
void addIntegers(List<? super Integer> dest) {
    dest.add(1);
    dest.add(2);
    // Integer n = dest.get(0);  // returns Object, not Integer
}

// PECS in action: Collections.copy
// static <T> void copy(List<? super T> dest, List<? extends T> src)
// dest is consumer (super), src is producer (extends)

// List<?> vs List<Object>
List<?> anyList = new ArrayList<String>();  // OK
// List<Object> objList = new ArrayList<String>();  // ERROR: generics invariant

// Multiple bounds
<T extends Comparable<T> & Serializable>
void sort(List<T> list) { /* ... */ }`
        },
        links:[
          {label:'Wildcards — Oracle', url:'https://docs.oracle.com/javase/tutorial/java/generics/wildcards.html'}
        ],
        questions:['What is PECS?','Why is List<?> not the same as List<Object>?','Can you use multiple bounds?']
      },
      {
        name:'Java Records (Java 16+)', tag:'advanced', tagLabel:'Advanced',
        summary:'Compact syntax for immutable data carriers — auto-generates constructor, equals, hashCode, toString, and accessors.',
        short:'Records (Java 16, preview in 14-15) are a concise way to create immutable data classes. The compiler generates: private final fields, canonical constructor, accessor methods (not getX but x()), equals(), hashCode(), and toString().',
        medium:{
          theory:'Records are implicitly final classes that extend java.lang.Record. Fields are implicitly private final. The canonical constructor must assign all components. Compact constructors allow validation without explicit field assignment. Records can have additional methods, static fields, and implement interfaces, but cannot extend other classes. They are ideal for DTOs, value objects, and multi-value returns.',
          tradeoffs:'Pros: eliminates boilerplate, immutable by default, transparent data carriers. Cons: cannot extend classes, no mutable state, accessor names differ from getX convention (may need @JsonProperty). Not suitable for entities with mutable state or JPA entities.',
          code:`// Record declaration
record Point(double x, double y) {}

// Auto-generated:
// private final double x, y
// public Point(double x, double y) { this.x = x; this.y = y; }
// public double x() { return x; }  // not getX()!
// public double y() { return y; }
// public boolean equals(Object o) { /* by fields */ }
// public int hashCode() { /* by fields */ }
// public String toString() { /* Point[x=1.0, y=2.0] */ }

// Compact constructor with validation
record Email(String value) {
    Email {  // compact: no parameter re-declaration
        if (!value.contains("@"))
            throw new IllegalArgumentException("Invalid email: " + value);
    }
}

// Record with additional methods
record Rectangle(double width, double height) {
    double area() { return width * height; }
    boolean isSquare() { return width == height; }
    static Rectangle square(double side) { return new Rectangle(side, side); }
}

// Record as HashMap key (equals/hashCode auto-generated)
Map<Point, String> grid = new HashMap<>();
grid.put(new Point(0, 0), "origin");`
        },
        links:[
          {label:'JEP 395: Records', url:'https://openjdk.org/jeps/395'}
        ],
        questions:['Can records extend classes?','What is a compact constructor?','How do records work as HashMap keys?']
      },
      {
        name:'Generics and Inheritance', tag:'advanced', tagLabel:'Advanced',
        summary:'Generics are invariant: List<String> is NOT a subtype of List<Object>. Wildcards enable flexible subtyping.',
        short:'Unlike arrays (String[] is Object[]), generic types are invariant: List<String> is not a subtype of List<Object>. This prevents type-unsafe operations at compile time. Use wildcards (? extends, ? super) when subtyping flexibility is needed.',
        medium:{
          theory:'Invariance prevents: List<Object> list = new ArrayList<String>(); list.add(42); String s = list.get(0); // ClassCastException. Arrays allow this but fail at runtime (ArrayStoreException). Generics catch it at compile time. Wildcards provide controlled flexibility: List<? extends Number> accepts List<Integer>. Recursive type bounds (T extends Comparable<T>) are common in sorting and builder patterns.',
          tradeoffs:'Invariance is safer than covariance but requires wildcards for flexible APIs. Understanding variance is essential for writing generic libraries. Use wildcards at API boundaries, exact types in implementations.',
          code:`// Invariance: List<String> is NOT a List<Object>
List<String> strings = new ArrayList<>();
// List<Object> objects = strings;  // ERROR: compile-time safety

// Array covariance: allowed but unsafe at runtime
String[] strArr = new String[5];
Object[] objArr = strArr;  // OK at compile time
// objArr[0] = 42;  // ArrayStoreException at runtime!

// Wildcards enable flexible subtyping
void processNumbers(List<? extends Number> nums) {
    // accepts List<Integer>, List<Double>, etc.
}
processNumbers(new ArrayList<Integer>());  // OK

// Recursive type bound — common in sorting/builders
class Builder<T extends Builder<T>> {
    T self() { return (T) this; }
    T setName(String name) { /* ... */ return self(); }
}

// Overloading by generic parameter — NOT possible (erasure)
// void process(List<String> list) {}
// void process(List<Integer> list) {}  // ERROR: same erasure`
        },
        links:[
          {label:'Generics and Inheritance — Oracle', url:'https://docs.oracle.com/javase/tutorial/java/generics/inheritance.html'}
        ],
        questions:['Why are generics invariant?','What is a recursive type bound?','Can you overload by generic parameter?']
      },
      {
        name:'Immutable Objects', tag:'advanced', tagLabel:'Immutability',
        summary:'Objects whose state cannot change after creation — thread-safe, shareable, and safe as HashMap keys.',
        short:'An immutable object\'s state cannot be modified after construction. Any "modification" returns a new object. Benefits: inherently thread-safe (no locks needed), safe as HashMap keys, cacheable, and simple to reason about.',
        medium:{
          theory:'Rules for immutability: 1) Class is final (or private constructor) to prevent subclass modification. 2) All fields are private final. 3) No setter methods. 4) Defensive copies of mutable fields in constructor and getters. 5) Do not expose mutable internals via getters. String, Integer, LocalDate, URI are immutable. Collections.unmodifiableList() creates immutable views. Records (Java 16+) are immutable by default.',
          tradeoffs:'Pros: thread-safety without synchronization, safe sharing, stable hashCode, simple testing. Cons: object creation for every change (GC pressure), not suitable for large mutable state. Use Builder pattern for complex immutable objects. Persistent data structures (Clojure-style) share structure between versions.',
          code:`// Immutable class
public final class Money {
    private final BigDecimal amount;
    private final Currency currency;
    
    public Money(BigDecimal amount, Currency currency) {
        this.amount = Objects.requireNonNull(amount);
        this.currency = Objects.requireNonNull(currency);
    }
    
    public BigDecimal getAmount() { return amount; }  // BigDecimal is immutable
    public Currency getCurrency() { return currency; }
    
    // "Modification" returns new object
    public Money add(Money other) {
        if (!currency.equals(other.currency))
            throw new IllegalArgumentException("Currency mismatch");
        return new Money(amount.add(other.amount), currency);
    }
}

// Defensive copy for mutable fields
public final class Period {
    private final LocalDate start;
    private final LocalDate end;
    
    public Period(LocalDate start, LocalDate end) {
        this.start = start;  // LocalDate is immutable — safe
        this.end = end;
    }
    
    // If using Date (mutable), defensive copy needed:
    // this.start = new Date(date.getTime());
    // public Date getStart() { return new Date(start.getTime()); }
}`
        },
        links:[
          {label:'Immutable Objects — Oracle', url:'https://docs.oracle.com/javase/tutorial/essential/concurrency/immutable.html'},
          {label:'Effective Java Item 17', url:'https://www.oreilly.com/library/view/effective-java/9780134686097/'}
        ],
        questions:['Why must immutable classes be final?','What is a defensive copy?','How do Records help immutability?']
      },
      {
        name:'Defensive Copies and Unmodifiable Collections', tag:'advanced', tagLabel:'Immutability',
        summary:'Protect immutable class internals by copying mutable arguments and returning unmodifiable views.',
        short:'When an immutable class holds mutable fields (Date, List, array), copy them in the constructor (defensive copy) and return copies or unmodifiable views from getters. This prevents external code from modifying internal state.',
        medium:{
          theory:'Without defensive copies, a caller can modify the internals of an "immutable" object by holding a reference to a mutable field. Collections.unmodifiableList() wraps a list — modifications throw UnsupportedOperationException, but the original list is still modifiable if the caller keeps a reference. List.of() / Map.of() (Java 9+) create truly immutable collections. Shallow copy shares references; deep copy duplicates the entire object graph.',
          tradeoffs:'Defensive copies add allocation cost but are essential for correctness. Use immutable types for fields when possible (LocalDate instead of Date, String instead of char[]). List.copyOf() (Java 10+) creates an immutable copy efficiently.',
          code:`// WITHOUT defensive copy — BUG
class Period {
    private final Date start;  // Date is mutable!
    Period(Date start) {
        this.start = start;  // caller can modify via their reference
    }
    Date getStart() { return start; }  // caller can modify!
}
Date d = new Date();
Period p = new Period(d);
d.setYear(2000);  // modifies p's internals!

// WITH defensive copy — correct
class Period {
    private final Date start;
    Period(Date start) {
        this.start = new Date(start.getTime());  // defensive copy
    }
    Date getStart() { return new Date(start.getTime()); }  // defensive copy
}

// Unmodifiable collections
List<String> list = new ArrayList<>(List.of("a", "b"));
List<String> view = Collections.unmodifiableList(list);
// view.add("c");  // UnsupportedOperationException
list.add("c");  // view sees the change! (it is a wrapper, not a copy)

// Truly immutable collections (Java 9+)
List<String> immutable = List.of("a", "b");  // cannot modify ever
List<String> copy = List.copyOf(list);  // immutable copy

// Deep copy vs shallow copy
// Shallow: new object, same field references
// Deep: new object, recursively copied fields`
        },
        links:[
          {label:'Collections.unmodifiableList — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Collections.html#unmodifiableList(java.util.List)'}
        ],
        questions:['What is the difference between unmodifiable and immutable?','When is deep copy needed?','How does List.of() differ from unmodifiableList?']
      },
      {
        name:'Builder Pattern for Immutable Classes', tag:'advanced', tagLabel:'Immutability',
        summary:'Builder constructs immutable objects step-by-step, ideal for classes with many optional parameters.',
        short:'The Builder pattern creates immutable objects through a mutable builder that accumulates state and produces the final object via build(). This avoids telescoping constructors and is ideal for objects with many optional fields.',
        medium:{
          theory:'Builder holds mutable state, validates in build(), and returns an immutable object. The builder can be generated by Lombok (@Builder), AutoValue, or IDE tools. The builder itself is not thread-safe — use it from a single thread. The resulting object is immutable and shareable. Records can also have builder-style static factory methods.',
          tradeoffs:'Builder adds a class and more code but greatly improves readability for complex objects. For 1-3 parameters, use constructors or static factories. For 4+ parameters (especially with optionals), use Builder. Lombok @Builder generates the boilerplate.',
          code:`// Builder pattern
public final class HttpRequest {
    private final String url;
    private final String method;
    private final Map<String, String> headers;
    private final String body;
    
    private HttpRequest(Builder builder) {
        this.url = Objects.requireNonNull(builder.url);
        this.method = builder.method != null ? builder.method : "GET";
        this.headers = Map.copyOf(builder.headers);  // immutable copy
        this.body = builder.body;
    }
    
    public static Builder builder(String url) { return new Builder(url); }
    
    public static class Builder {
        private final String url;
        private String method;
        private Map<String, String> headers = new HashMap<>();
        private String body;
        
        Builder(String url) { this.url = url; }
        Builder method(String method) { this.method = method; return this; }
        Builder header(String key, String value) { headers.put(key, value); return this; }
        Builder body(String body) { this.body = body; return this; }
        HttpRequest build() { return new HttpRequest(this); }
    }
}

// Usage
HttpRequest req = HttpRequest.builder("https://api.example.com")
    .method("POST")
    .header("Content-Type", "application/json")
    .body("{\\"key\\": \\"value\\"}")
    .build();`
        },
        links:[
          {label:'Builder Pattern — Effective Java', url:'https://www.oreilly.com/library/view/effective-java/9780134686097/'}
        ],
        questions:['When to use Builder over constructors?','How does Lombok @Builder work?','Is the Builder itself thread-safe?']
      },
      {
        name:'Reflection and Annotations', tag:'advanced', tagLabel:'Advanced',
        summary:'Reflection inspects classes at runtime; annotations attach metadata processed at compile-time or runtime.',
        short:'Reflection (java.lang.reflect) allows inspecting and modifying classes, methods, and fields at runtime — bypassing access control. Annotations (@interface) attach metadata to code elements, processed by compilers, frameworks, or custom annotation processors.',
        medium:{
          theory:'Reflection: Class.getMethods(), getDeclaredFields(), setAccessible(true) to bypass access control. Used by frameworks (Spring DI, Jackson serialization, JPA). Performance: reflection is 10-50x slower than direct calls; cache reflection objects. Annotations: @Retention (SOURCE, CLASS, RUNTIME), @Target (TYPE, METHOD, FIELD). Runtime annotations are read via reflection. Annotation processors (javax.annotation.processing) generate code at compile time (e.g., Lombok, MapStruct).',
          tradeoffs:'Reflection enables powerful frameworks but is slow, fragile (breaks on refactoring), and bypasses type safety. Use only in framework code, not business logic. Annotations are the preferred way to attach metadata — processed by frameworks without runtime reflection overhead.',
          code:`// Reflection: inspect and invoke methods
Class<?> cls = Class.forName("com.example.UserService");
Method method = cls.getDeclaredMethod("findById", long.class);
method.setAccessible(true);  // bypass private
Object result = method.invoke(serviceInstance, 42L);

// Custom annotation
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Auditable {
    String value() default "default";
    Level level() default Level.INFO;
}

// Reading annotations at runtime
for (Method m : cls.getDeclaredMethods()) {
    Auditable aud = m.getAnnotation(Auditable.class);
    if (aud != null) {
        log.log(aud.level(), "Auditing: " + aud.value());
    }
}

// transient keyword — skip during serialization
class User implements Serializable {
    String name;
    transient String password;  // not serialized
}`
        },
        links:[
          {label:'Reflection API — Oracle', url:'https://docs.oracle.com/javase/tutorial/reflect/'},
          {label:'Annotations — Oracle', url:'https://docs.oracle.com/javase/tutorial/java/annotations/'}
        ],
        questions:['Why is reflection slow?','What are annotation retention policies?','How does setAccessible work with modules?']
      },
      {
        name:'Lambdas and Stream API (Java 8+)', tag:'advanced', tagLabel:'Advanced',
        summary:'Lambdas enable functional-style code; Streams provide declarative data processing pipelines with parallel support.',
        short:'Lambda expressions (Java 8) are anonymous functions that implement functional interfaces. The Stream API processes collections declaratively via filter/map/reduce pipelines. Streams are lazy, composable, and optionally parallel.',
        medium:{
          theory:'Lambdas compile to invokedynamic calls (not anonymous classes) — lightweight. Functional interfaces: Predicate, Function, Consumer, Supplier, UnaryOperator, BinaryOperator. Stream operations: intermediate (filter, map, flatMap, sorted — lazy) and terminal (collect, forEach, reduce, count — eager). Parallel streams use ForkJoinPool. Method references (ClassName::method) are shorthand for simple lambdas.',
          tradeoffs:'Streams: readable pipelines but overhead for small collections (use loops). Parallel streams: beneficial for CPU-bound work on large datasets, harmful for I/O or small data. Lambdas: cleaner code but harder to debug stack traces.',
          code:`// Lambda expressions
Predicate<String> isLong = s -> s.length() > 5;
Function<String, Integer> toLength = String::length;
Consumer<String> printer = System.out::println;

// Stream pipeline
List<String> result = users.stream()
    .filter(u -> u.age() > 18)
    .sorted(Comparator.comparing(User::name))
    .map(User::name)
    .distinct()
    .limit(10)
    .collect(Collectors.toList());

// Reduce
int sum = numbers.stream()
    .reduce(0, Integer::sum);

// flatMap — flatten nested structures
List<String> allWords = sentences.stream()
    .flatMap(s -> Arrays.stream(s.split(" ")))
    .distinct()
    .toList();

// Parallel stream
long count = bigList.parallelStream()
    .filter(item -> item.matches(criteria))
    .count();`
        },
        links:[
          {label:'Stream API — Oracle', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/stream/Stream.html'},
          {label:'Lambda Expressions — Oracle', url:'https://docs.oracle.com/javase/tutorial/java/javaOO/lambdaexpressions.html'}
        ],
        questions:['What is a functional interface?','When to use parallel streams?','What is the difference between map and flatMap?']
      },
      {
        name:'Modern Java Features (Java 9-21)', tag:'advanced', tagLabel:'Advanced',
        summary:'Key features: var (10), HttpClient (11), text blocks (15), sealed classes (17), pattern matching (16/21), virtual threads (21).',
        short:'Modern Java adds: var type inference (10), HttpClient API (11), ZGC (11), text blocks (15), pattern matching instanceof (16), sealed classes (17), record patterns (19), pattern matching switch (21), and virtual threads (21).',
        medium:{
          theory:'var: local variable type inference — compiler infers type from initializer. HttpClient: async/non-blocking HTTP with WebSocket support, replacing HttpURLConnection. Pattern matching instanceof: combines type check and cast in one step. Sealed classes: restrict which classes can extend/implement — enables exhaustive switch. Pattern matching switch: type patterns, guards, and exhaustive matching in switch expressions. Virtual threads: lightweight threads managed by JVM for massive I/O concurrency.',
          tradeoffs:'var: reduces verbosity but can hurt readability for complex types. HttpClient: modern and async but newer ecosystem. Sealed classes: better domain modeling but requires Java 17+. Virtual threads: game-changer for I/O apps but not for CPU-bound work.',
          code:`// var — type inference (Java 10+)
var list = new ArrayList<String>();  // ArrayList<String>
var map = Map.of("a", 1, "b", 2);   // Map<String, Integer>

// Pattern matching instanceof (Java 16+)
if (obj instanceof String s && s.length() > 5) {
    System.out.println(s.toUpperCase());  // no cast needed
}

// Sealed classes (Java 17)
sealed interface Shape permits Circle, Rectangle, Triangle {}
record Circle(double radius) implements Shape {}
record Rectangle(double w, double h) implements Shape {}
final class Triangle implements Shape { /* ... */ }

// Pattern matching switch (Java 21)
double area = switch (shape) {
    case Circle c -> Math.PI * c.radius() * c.radius();
    case Rectangle r -> r.w() * r.h();
    case Triangle t -> calculateTriangleArea(t);
};  // exhaustive — compiler knows all subtypes

// Virtual threads (Java 21)
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    executor.submit(() -> fetchFromAPI(url));  // lightweight thread
}`
        },
        links:[
          {label:'JEP 394: Pattern Matching instanceof', url:'https://openjdk.org/jeps/394'},
          {label:'JEP 441: Pattern Matching switch', url:'https://openjdk.org/jeps/441'},
          {label:'JEP 444: Virtual Threads', url:'https://openjdk.org/jeps/444'}
        ],
        questions:['What does var infer?','How do sealed classes improve switch?','When to use virtual threads vs platform threads?']
      },
      {
        name:'Optional and Functional Interfaces', tag:'advanced', tagLabel:'Advanced',
        summary:'Optional represents nullable values safely; standard functional interfaces (Predicate, Function, Consumer, Supplier) power the Stream API.',
        short:'Optional<T> is a container that may or may not hold a value — it forces callers to handle absence explicitly. Standard functional interfaces (Predicate, Function, Consumer, Supplier) are the building blocks for lambdas and streams.',
        medium:{
          theory:'Optional: of(value), ofNullable(value), empty(). Methods: isPresent(), ifPresent(consumer), map(), flatMap(), filter(), orElse(default), orElseThrow(). Never use Optional for fields, parameters, or collections — only as return values. Functional interfaces: Predicate<T> (T→boolean), Function<T,R> (T→R), Consumer<T> (T→void), Supplier<T> (→T), BiFunction<T,U,R>, UnaryOperator<T>, BinaryOperator<T>.',
          tradeoffs:'Optional: eliminates null checks in chains but has allocation overhead. Use for method returns only — not fields or parameters. Functional interfaces: composable via andThen/compose, but deep chains can be hard to debug.',
          code:`// Optional — safe null handling
Optional<User> user = findById(42);
String name = user
    .map(User::getName)
    .map(String::toUpperCase)
    .orElse("UNKNOWN");

user.ifPresent(u -> log.info("Found: " + u));
User u = user.orElseThrow(() -> new NotFoundException("User 42"));

// Optional chaining vs null checks
// Before:
if (user != null && user.getAddress() != null) {
    String city = user.getAddress().getCity();
}
// After:
Optional.ofNullable(user)
    .map(User::getAddress)
    .map(Address::getCity)
    .ifPresent(city -> log.info("City: " + city));

// Functional interfaces
Predicate<String> isEmail = s -> s.contains("@");
Function<String, Integer> length = String::length;
Consumer<String> print = System.out::println;
Supplier<LocalDate> now = LocalDate::now;

// Composition
Function<String, String> process = length.andThen(Object::toString);`
        },
        links:[
          {label:'Optional — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Optional.html'}
        ],
        questions:['Should Optional be used for fields?','What is the difference between map and flatMap on Optional?','What are the core functional interfaces?']
      },
      {
        name:'Default Methods and Collectors', tag:'advanced', tagLabel:'Advanced',
        summary:'Default methods enable interface evolution; Collectors provide terminal stream operations for grouping, partitioning, and aggregation.',
        short:'Default methods (Java 8) add concrete implementations to interfaces without breaking existing implementations. Static methods in interfaces provide utility factories. Collectors (toList, groupingBy, joining, toMap) are terminal stream operations that accumulate results.',
        medium:{
          theory:'Default methods enable adding new methods to interfaces without breaking implementors — critical for API evolution (e.g., Collection.stream(), List.sort()). When two interfaces provide conflicting defaults, the implementing class must override and choose. Static interface methods serve as factories (List.of(), Comparator.comparing()). Collectors: toList(), toSet(), toMap(), groupingBy(), partitioningBy(), joining(), collectingAndThen(), reducing(). Java 16+ adds toList() directly on Stream.',
          tradeoffs:'Default methods: enables API evolution but can create diamond conflicts. Prefer over abstract methods for non-breaking additions. Collectors: powerful but complex API — use the simple ones (toList, toMap) most often. groupingBy and partitioningBy are essential for data analysis.',
          code:`// Default method in interface
interface Logger {
    void log(String msg);
    default void info(String msg) { log("[INFO] " + msg); }
    default void error(String msg, Throwable t) {
        log("[ERROR] " + msg + ": " + t.getMessage());
    }
    static Logger noop() { return msg -> {}; }  // static factory
}

// Collectors
List<String> names = users.stream()
    .collect(Collectors.toList());  // or .toList() since Java 16

Map<String, List<User>> byCity = users.stream()
    .collect(Collectors.groupingBy(User::getCity));

Map<Boolean, List<User>> adults = users.stream()
    .collect(Collectors.partitioningBy(u -> u.age() >= 18));

String joined = users.stream()
    .map(User::name)
    .collect(Collectors.joining(", ", "[", "]"));

Map<String, Integer> nameToAge = users.stream()
    .collect(Collectors.toMap(User::name, User::age));

// collectingAndThen — post-processing
int count = users.stream()
    .collect(Collectors.collectingAndThen(
        Collectors.toList(), List::size));`
        },
        links:[
          {label:'Default Methods — Oracle', url:'https://docs.oracle.com/javase/tutorial/java/IandI/defaultmethods.html'},
          {label:'Collectors — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/stream/Collectors.html'}
        ],
        questions:['Can interfaces have static methods?','What happens with conflicting defaults?','How does groupingBy differ from partitioningBy?']
      }
    ]
  },);
