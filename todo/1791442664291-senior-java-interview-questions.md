# Senior Java Developer Interview Questions - Organized by Subject

## todo:
1. do in loop by subjects (example: ### Language Basics )
    for each subject 
        - create independent commit, message is subject name
        - language English
    for each question in subject:
        - find answer ()
        - prepare  short/middle description/link to the full description
        - put answer in  [index.html](../java/index.html)   
    



## Sources Used (10 Web Pages)
1. GitHub - ViacheslavChernyshov/java-interview-questions-and-answers (500+ questions)
2. Medium - Top 50 Java Interview Questions and Answers (2026 Edition)
3. Indeed UK - 61 Java senior developer interview questions
4. Glassdoor - Senior Java Developer Interview Questions
5. Betterteam - Senior Java Developer Interview Questions
6. DataCamp - Top Java Interview Questions & Answers For All Levels 2026
7. Indeed UK - Interview questions and answers for a senior java developer
8. KORE1 - Java Developer Interview Questions 2026
9. Toptal/YouTeam - Top 10 Interview Questions to Ask When Hiring Senior Java Developers
10. CRS Info Solutions - Java Senior developer interview Questions

---

## Core Java Fundamentals

### Language Basics
- What is Java, and what are some of its key features?
- How do you compile and run a Java program?
- What is the difference between JDK, JRE, and JVM?
- Describe Java in a single sentence
- Why is the Java platform independent?
- What are the differences between primitive data types and objects in Java?
- What is the purpose of the static keyword in Java?
- What is the purpose of the final keyword when used with a variable?
- Explain the difference between public, private, and protected access modifiers
- What is the purpose of the this keyword in Java?
- How do you convert a string to an integer in Java?
- What is the difference between && and & operators?
- How do you define and use an enum in Java?
- What is autoboxing and unboxing in Java?
- Explain the difference between break and continue statements
- What is method overloading in Java?
- How do you read user input from the console in Java?
- What is the difference between ArrayList and array?
- How do you iterate through a collection in Java?
- Can you differentiate an object from a class in Java?
- What is a package in Java?

### String Handling
- What is the difference between String, StringBuilder, and StringBuffer?
- How does String Pool work?
- What is the difference between creating a String via literal and via new?
- When should you use intern()?
- Why is String immutable?
- When to use StringBuilder vs StringBuffer?
- Why is StringBuffer slower than StringBuilder?
- What happens when concatenating strings via the + operator?
- How does the Java compiler optimize string concatenation?
- Can you use == to compare Strings?
- What is the difference between == and .equals() when comparing strings?
- Where is the String Pool stored (in which memory area)?
- Can String Pool cause OutOfMemoryError?
- What does the substring() method do and how did it work before Java 7?
- Why was the substring() implementation changed in Java 7?
- How does the split() method work?
- What is the difference between replace() vs replaceAll()?
- What is String encoding?
- How to properly convert a String to byte[] and back?
- What are compact strings in Java 9+?
- How to find out how much memory a String occupies?
- Can you change the content of a String via reflection?
- What is String deduplication in G1 GC?
- Why does String implement Comparable and CharSequence?
- What new methods were introduced in Java 11 for working with Strings?

### Object-Oriented Programming (OOP)
- What is inheritance in Java?
- What is polymorphism in Java?
- Define an interface in Java
- What is the difference between an abstract class and an interface in Java?
- Explain the concept of inheritance in Java through examples
- What are the principles of object-oriented programming (OOP) and how they are applied in Java?
- Inheritance is a key concept in OOP. Could you discuss situations where you would prefer composition over inheritance in Java?
- How does Java support polymorphism, and can you provide an example of its use in a real-world Java project?
- Explain the concept of method overloading and method overriding. How do they relate to polymorphism?
- What is the Single Responsibility Principle and how to apply it?
- Give an example of Single Responsibility Principle violation
- What is the Open/Closed Principle?
- How to refactor code that violates Open/Closed Principle?
- What is the Liskov Substitution Principle?
- Give an example of Liskov Substitution Principle violation
- What is the Interface Segregation Principle?
- What is the Dependency Inversion Principle?
- Why do we need SOLID principles at all?
- What are composition and inheritance?
- When is it better to use composition instead of inheritance?
- What is delegation in OOP?
- How is Single Responsibility Principle related to cohesion?
- What happens if a class has multiple reasons to change?
- How does SOLID help with code testing?
- How is Dependency Inversion related to Dependency Injection?
- What is Law of Demeter (principle of least knowledge)?
- How to refactor a God Object?
- How do SOLID principles help with feature extension?
- Can you follow all SOLID principles simultaneously?
- How to determine that a class has a single responsibility?
- What anti-patterns contradict SOLID principles?

### Exceptions
- How do you handle exceptions in Java?
- What is the difference between checked and unchecked exceptions in Java?
- Distinguish between a checked and unchecked exception in Java
- What is at the top of the exception hierarchy?
- What is Throwable?
- What is the difference between Error and Exception?
- Is the finally block guaranteed to execute?
- What is try-with-resources?
- What are the requirements for resources in try-with-resources?
- What is the AutoCloseable interface?
- What is the difference between AutoCloseable and Closeable?
- Can you create custom exceptions?
- When should you create your own exceptions?
- Which is better: extending Exception or RuntimeException?
- What is a stack trace?
- What does the printStackTrace() method do?
- How to properly log exceptions?
- What is exception wrapping?
- Why shouldn't you swallow exceptions (empty catch)?
- What does the throws keyword do?
- Can you throw a checked exception from a method without throws?
- What happens if an exception also occurs in the finally block?
- What are suppressed exceptions?
- Can you have multiple catch blocks for a single try?
- What is multi-catch?
- In what order should you arrange catch blocks?
- Can you re-throw an exception?
- What is exception chaining?
- How do you handle and log exceptions in a Java application, and what are the best practices for effective error handling and debugging?

### Arrays and Collections
- How do you create and use an array in Java? How do arrays in Java differ from arrays in other languages?
- What are the main interfaces of the Collection Framework?
- What is the difference between List, Set and Queue?
- What is the difference between ArrayList and LinkedList?
- When to use ArrayList vs LinkedList?
- What is the time complexity of operations in ArrayList?
- What is the time complexity of operations in LinkedList?
- What is Vector and how does it differ from ArrayList?
- What is Stack?
- What is Queue and what implementations exist?
- What is Deque?
- What is the difference between HashSet, LinkedHashSet and TreeSet?
- How does HashSet work internally?
- What is TreeSet and how does it work?
- What is Map and what implementations exist?
- What is the difference between HashMap, LinkedHashMap and TreeMap?
- When to use TreeMap?
- What is WeakHashMap?
- What is ConcurrentHashMap?
- How does ConcurrentHashMap ensure thread-safety?
- What is CopyOnWriteArrayList?
- When to use synchronized collections?
- How to get a synchronized collection?
- What is Collections.unmodifiableList() and how does it work?
- What is the difference between Iterator and ListIterator?
- What are fail-fast and fail-safe iterators?
- What is ConcurrentModificationException?
- How to properly remove elements during iteration?
- What are Comparable and Comparator?
- What is the difference between Comparable and Comparator?
- What operations does the Collection interface support?
- Explain the differences between ArrayList and LinkedList? When would you choose one over the other?
- Describe the differences between HashMap, LinkedHashMap, and TreeMap
- Explain the differences between Comparable and Comparator interfaces? When would you use each?
- Explain the difference between synchronized collections and concurrent collections in Java

### HashMap / equals / hashCode
- How is HashMap structured internally?
- What is a bucket in HashMap?
- How does HashMap determine which bucket to put an element in?
- What is a collision in HashMap?
- How does HashMap handle collisions?
- What happens when 8 elements are reached in one bucket?
- What is the equals() and hashCode() contract?
- If two objects are equal by equals(), what can you say about their hashCode()?
- If two objects have the same hashCode(), are they necessarily equal by equals()?
- What happens if you override equals() but not hashCode()?
- What happens if you override hashCode() but not equals()?
- Can you use a mutable object as a key in HashMap?
- What happens if you change a key after adding it to HashMap?
- What are the requirements for a HashMap key?
- Why is String often used as a key in HashMap?
- What is load factor in HashMap?
- What is capacity in HashMap?
- When does rehashing occur in HashMap?
- What happens during rehashing?
- What is the time complexity of get() and put() operations in HashMap?
- When can the time complexity become O(n)?
- How does HashMap work in a multi-threaded environment?
- What is ConcurrentHashMap and how does it differ from HashMap?
- Can you store a null key in HashMap?
- Can you store a null value in HashMap?
- What is the difference between HashMap and Hashtable?
- How to properly choose initial capacity for HashMap?
- Which is better: ArrayList or HashMap for storing key-value pairs?
- How does the hashCode() method relate to the equals() method? What are the implications of overriding one but not the other?
- Explain the difference between HashMap and ConcurrentHashMap
- How Hashmap internally works and how to fix race condition and what is rehashing

---

## Advanced Java Concepts

### Generics and Records
- What is Record in Java and since which version is it available?
- What are the main differences between Record and a regular class?
- Can you inherit from Record or extend Record from another class?
- Can you add additional methods to Record?
- Which methods are automatically generated for Record?
- Can you override the constructor in Record?
- What is a compact constructor in Record?
- Can you declare static fields and methods in Record?
- Are Record fields final?
- Can you use Record as a key in HashMap?
- What are Generics in Java?
- What are the advantages of using generics?
- What is type erasure?
- Can you create an array of generic type?
- What are bounded type parameters?
- What is the difference between <? extends T> and <? super T>?
- What is PECS (Producer Extends Consumer Super)?
- Can you use primitive types as generic parameters?
- What are raw types and why should you avoid them?
- What happens when you try to create an instance of generic type via new T()?
- What is the difference between List<?> and List<Object>?
- Can you overload methods differing only by generic parameters?
- What is recursive type bound?
- How do generics work with inheritance (is List<String> a subtype of List<Object>)?
- What are bridge methods and why are they needed?
- Can you use multiple bounds for a single type parameter?
- How to implement Singleton pattern using Record?
- Explain the concept of generics in Java
- What are the key differences between Records in Java 16 and traditional classes?

### Immutability
- What is an immutable (unchangeable) object?
- What advantages do immutable objects provide?
- How to create an immutable class in Java?
- Why is the String class immutable?
- What are the consequences of String immutability?
- Why are immutable objects thread-safe?
- What is the final keyword and how does it help create immutable classes?
- Is making all fields final sufficient for immutability?
- What to do if a class field references a mutable object?
- What is a defensive copy?
- When do you need to make a defensive copy?
- How to protect a collection from modifications?
- What is Collections.unmodifiableList() and how does it work?
- What is the difference between shallow copy and deep copy?
- Can you inherit from an immutable class?
- Why must an immutable class be final?
- What happens if you override a getter in a subclass of an immutable class?
- How does String pool work and how is it related to immutability?
- Can you change a String value via reflection?
- What is Record and how does it help create immutable classes?
- Why are LocalDate and LocalDateTime immutable?
- What are the advantages of immutable objects for caching?
- How does immutability affect performance?
- What are persistent data structures?
- Are there any disadvantages to immutable objects?
- How to implement Builder pattern for an immutable class?
- Can you use immutable objects as keys in HashMap?
- What happens if you change a mutable key in HashMap?
- How to properly work with collections in immutable classes?

### Reflection and Annotations
- Explain the concept of reflection in Java
- How do you use Java annotations, and can you highlight some use cases?
- How do you implement serialisation and deserialisation in Java?
- What is the purpose of the transient keyword in Java?
- Explain the purpose of transient and static keywords in Java
- How do inner and nested classes in Java differ?
- How would you design and implement a custom annotation processor in Java?

### Modern Java Features (Java 8-21)
- What are lambda expressions in Java, and how do you use them?
- How do you use Java's Stream API, and can you outline some use cases?
- What is the Stream API in Java 8, and how does it differ from traditional collections?
- How does lambda expressions improve code readability in Java 8?
- Explain the differences between map(), flatMap(), filter(), and reduce() in Java Streams
- What is method reference in Java 8, and how is it used?
- Explain the purpose and usage of the default and static methods in interfaces introduced in Java 8
- What are functional interfaces in Java 8, and how are they different from regular interfaces?
- Describe the use of Optional in Java 8. How can it help with handling nulls?
- What is the Collectors utility in Java 8, and how do you use it with Stream?
- What features of Java 8 have you used in your projects?
- What are the differences between abstract classes and interfaces in Java 8 and later?
- What is the purpose of the default methods in interfaces introduced in Java 8?
- Describe the var keyword introduced in Java 10 and its improvements in Java 11
- Explain the HttpClient API introduced in Java 11. How does it differ from HttpURLConnection?
- What is the ZGC (Z Garbage Collector) introduced in Java 11, and when should it be used?
- Explain pattern matching for instanceof introduced in Java 16. How does it simplify code?
- What are sealed classes in Java 17, and how do they improve type safety?
- What are records in Java? (Java 16+)
- What are sealed classes? (Java 17+)
- What is pattern matching for switch? (Java 21+)
- What are virtual threads? (Java 21+)

---

## Concurrency and Multithreading

### Basic Concurrency
- What is multithreading in Java?
- How do you create a thread in Java?
- What is synchronisation in Java?
- Define a deadlock in Java and outline steps to prevent this
- What is the difference between Thread and Runnable?
- What are Callable and Future?
- Explain the difference between Runnable and Callable interfaces in Java concurrency
- What is the purpose of the volatile keyword in Java? How does it relate to the happens-before relationship?
- How can Volatile Keywords affect thread performance?
- Explain the concept of multithreading in Java and discuss the advantages and disadvantages of using it for concurrent programming
- How do you handle synchronization in a multithreaded Java application to prevent race conditions and ensure data integrity?
- Can you discuss the Java Memory Model (JMM) and its role in multithreaded applications?
- How do you handle multithreading in Java? Describe the difference between synchronized methods and blocks
- Explain the basics of multithreading in Java
- Can you explain "Volatility" in Java?

### Advanced Concurrency
- What is the difference between synchronized and volatile?
- What is happens-before relationship?
- What is the visibility problem?
- What is a monitor in Java?
- How does synchronized work at the monitor level?
- What is the difference between a synchronized method and a synchronized block?
- What is a reentrant lock?
- What are Atomic classes?
- What is CAS (Compare-And-Swap)?
- How do AtomicInteger and AtomicLong work?
- What are the advantages of Atomic classes over synchronized?
- What is a Thread Pool?
- What types of Thread Pool exist in Java?
- What does ExecutorService do?
- What is the difference between Executors.newFixedThreadPool() and newCachedThreadPool()?
- What is ForkJoinPool?
- What is a deadlock?
- What conditions are necessary for a deadlock to occur?
- How to prevent deadlock?
- What is a race condition?
- How to avoid race conditions?
- What are Virtual Threads in Java 21?
- What are the advantages of Virtual Threads over regular threads?
- When should you use Virtual Threads?
- What is structured concurrency?
- Explain the concept of lock-free programming in Java. What are its advantages and challenges?
- How does the Java Memory Model relate to the happens-before relationship? Provide examples of how this impacts concurrent programming
- Describe the internals of the ConcurrentHashMap class. How does it achieve its high level of concurrency?
- What is the purpose of the Fork/Join framework in Java?
- What is the purpose of the java.util.concurrent package? Provide examples of classes from this package and their use cases
- How do you use Java's concurrency utilities? Give examples
- How do you synchronise five threads to start simultaneously?

### CompletableFuture & Asynchrony
- What is CompletableFuture and how does it differ from Future?
- What are the main advantages of CompletableFuture over Future?
- How to create a CompletableFuture that is already completed with a result?
- What is the difference between thenApply() and thenCompose()?
- What do methods thenAccept() and thenRun() do?
- How to handle exceptions in a CompletableFuture chain?
- What is the difference between handle(), exceptionally() and whenComplete()?
- How to combine results of multiple CompletableFutures?
- What does allOf() method do and when to use it?
- What does anyOf() method do and in which cases is it useful?
- What is the difference between thenApply() and thenApplyAsync()?
- What thread pool is used by default for async methods?
- How to specify your own Executor for CompletableFuture?
- What is blocking code and how to distinguish it from non-blocking?
- Why is it important to avoid blocking operations in CompletableFuture?
- How to properly execute multiple parallel requests to microservices?
- What does supplyAsync() method do and when to use it?
- How to cancel CompletableFuture execution?
- What happens if an exception occurs in a CompletableFuture chain?
- Can you reuse the same CompletableFuture in multiple chains?
- How to implement timeout for CompletableFuture?
- What does orTimeout() method do in Java 9+?
- What is the difference between thenCombine() and thenCompose()?
- How to test code with CompletableFuture?
- When is it better to use CompletableFuture vs reactive programming?
- What does join() method do and how does it differ from get()?
- Can you manually complete a CompletableFuture with a result?
- How to implement retry logic with CompletableFuture?
- How do you use Java's CompletableFuture API to write asynchronous code?
- How does the CompletableFuture class improve asynchronous programming in Java?

---

## JVM and Memory Management

### Memory Model
- What is the difference between Heap and Stack?
- What is stored in Heap?
- What is stored in Stack?
- What is the difference between the heap and the stack in Java?
- Describe the Java memory model. What is the difference between heap and stack memory?
- Explain how Java's memory model works
- What is the Java Memory Model and how it relates to multi-threading?

### Garbage Collection
- What is Garbage Collection?
- When does an object become a candidate for GC removal?
- What is a memory leak in Java?
- How can a memory leak occur in Java?
- What are generations in GC (young, old, metaspace)?
- What is Young Generation?
- What is Old Generation (Tenured)?
- What is Metaspace (or PermGen)?
- What GC algorithms exist?
- What is G1 GC?
- What is ZGC?
- What is Shenandoah GC?
- What is stop-the-world?
- Which GCs minimize stop-the-world pauses?
- What are the -Xms and -Xmx parameters?
- What happens on OutOfMemoryError?
- What types of OutOfMemoryError exist?
- What is a memory leak and how to detect it?
- What tools help analyze memory?
- What is a heap dump?
- How to get a heap dump?
- What are GC roots?
- What is reachability in the context of GC?
- Can you manually invoke GC?
- Why shouldn't you call System.gc()?
- How does garbage collection work in Java, and what are the different types of garbage collectors?
- How do you implement garbage collection in Java?
- Describe the Garbage Collection process in Java. How would you tune GC for a high-throughput, low-latency application?
- What is Java's garbage collection, and how does it work?
- How can you optimize garbage collection performance in a Java application, especially for large-scale systems?
- Discuss the difference between garbage collection in Java and manual memory management in languages like C++. What are the advantages and disadvantages of each approach?
- What is the ZGC (Z Garbage Collector) introduced in Java 11, and when should it be used?

### Performance and Optimization
- Name some useful tips for writing efficient and maintainable Java code
- How do you ensure good application performance?
- How do profiling tools help diagnose performance issues in Java applications?
- Explain how to optimise the performance of a Java application
- How do you optimize a Java application's performance?
- What is the Just-In-Time (JIT) compiler?
- How do Java SE and Java EE relate?
- Explain the concept of Java agents and how they can be used for application monitoring and profiling
- Describe the process of class loading in Java. How can you implement a custom class loader, and what are some use cases for doing so?
- What is a ClassLoader, and how does it work in Java?
- What is the difference between weak references and soft references in Java?

---

## Design Patterns

### Creational Patterns
- What are design patterns?
- What categories of patterns exist?
- What is Singleton?
- How to implement a thread-safe Singleton?
- What is double-checked locking?
- What are the problems with Singleton?
- What is the difference between Factory Method and Abstract Factory?
- When to use Builder?
- What is the Prototype pattern?
- Describe the Singleton pattern and provide an example of a thread-safe implementation in Java
- How would you implement a thread-safe singleton in Java? Discuss the trade-offs of different approaches

### Structural Patterns
- What is the advantage of Decorator over inheritance?
- What types of Proxy exist?
- What is the Iterator pattern?

### Behavioral Patterns
- When to use Strategy?
- How is Observer implemented in Java?
- What is the difference between State and Strategy?
- Describe the Observer pattern and how it can be implemented using Java's built-in classes
- What Java design patterns do you know, and how do you use them?
- Explain the concept of design patterns in Java and provide an example
- Which design patterns are you most familiar with?
- What anti-patterns do you know?

---

## Spring Framework and Spring Boot

### Core Spring
- What is Dependency Injection?
- What is the difference between constructor, setter and field injection?
- Which injection type is recommended and why?
- What is a Bean in Spring?
- How to create a Bean in Spring?
- What is Bean Lifecycle?
- What are the stages of Bean lifecycle?
- What is BeanPostProcessor?
- What do methods with @PostConstruct and @PreDestroy annotations do?
- What is Bean scope?
- What scopes exist in Spring?
- What is the difference between singleton and prototype scope?
- What is a proxy in Spring?
- When does Spring create a proxy?
- What is AOP (Aspect-Oriented Programming)?
- What are aspect, advice, pointcut, join point?
- What does the @Transactional annotation do?
- Why doesn't @Transactional work with self-invocation?
- How to solve the self-invocation problem?
- What does the @Autowired annotation do?
- What to do if there are multiple beans of the same type?
- What is @Qualifier?
- What are profiles in Spring?
- Explain the concept of dependency injection and how it's implemented in the Spring Framework
- What are the different types of dependency injection in Spring, and when would you use each type?
- How familiar are you with the Spring framework?
- Describe your experience with Java frameworks and libraries. Have you worked with Spring, Hibernate, or other popular Java frameworks?
- Can you discuss a challenging problem you encountered while using Spring and how you resolved it?

### Spring Boot
- What is auto-configuration in Spring Boot?
- How does @SpringBootApplication work?
- What is a starter in Spring Boot?
- What does the @ComponentScan annotation do?
- What is a @Configuration class?
- What is the difference between @Component, @Service, @Repository, @Controller?
- How does Spring Boot differ from the traditional Spring Framework, and in what scenarios would you choose one over the other?
- In a Spring Boot application, how do you configure external properties, and why is this important for application flexibility?
- About springboot starter Resttemplate Rdbms

### Spring Security
- How do you handle security in Java applications, especially in web-based systems?
- Have you worked with Spring Security, and can you describe how it's used to secure a web-based Java application?
- Can you explain the concept of OWASP Top Ten and how it applies to Java web application security?

---

## Database and ORM

### SQL and Databases
- Why are indexes needed?
- How does a B-tree index work?
- What is a composite index?
- When should you create an index?
- What are the disadvantages of indexes?
- What is index cardinality?
- What types of JOIN exist?
- What is the difference between INNER JOIN and LEFT JOIN?
- Which is better: JOIN or subquery?
- What is a correlated subquery?
- What is the difference between WHERE and HAVING?
- What does GROUP BY do?
- When to use HAVING?
- What are window functions?
- What does ROW_NUMBER() do?
- What do RANK() and DENSE_RANK() do?
- How does MVCC work in PostgreSQL?
- What is VACUUM in PostgreSQL?
- Why is ANALYZE needed?
- What is explain plan?
- How to optimize slow queries?
- Can you tell us about JDBC connection process?
- Have you used Java with databases? Which ones, and what were the benefits?
- How do you use Java with JSON and XML data?

### Hibernate / JPA
- What is the N+1 problem and how to solve it?
- What is the difference between Lazy and Eager loading?
- When to use Lazy vs Eager loading?
- What is LazyInitializationException and how to avoid it?
- What fetch strategies exist in Hibernate?
- What does @BatchSize annotation do?
- Describe the Entity lifecycle in Hibernate
- What are states: transient, persistent, detached, removed?
- What is the first-level cache in Hibernate?
- What is the second-level cache and when to use it?
- How to configure the second-level cache?
- What is dirty checking in Hibernate?
- How does the flush mechanism work in Hibernate?
- What is the difference between persist() and merge()?
- What does the refresh() method do?
- What is EntityManager and how does it differ from Session?
- How to implement optimistic locking in JPA?
- How to implement pessimistic locking in JPA?
- What is @Version and why is it needed?
- How do cascade operations (Cascade) work?
- What types of Cascade exist?
- What is orphan removal?
- How to properly use @OneToMany and @ManyToOne?
- What are the peculiarities of bidirectional relationships?
- How to avoid infinite recursion during Entity serialization?
- What is JPQL and how does it differ from SQL?
- What is Criteria API and when to use it?
- How to use JOIN FETCH to solve the N+1 problem?
- What is projection in JPA?
- What types of inheritance does JPA support?
- Why should we use JPA or Hibernate?
- Explain how to use Java's JPA API to interact with databases
- Can you discuss your experience with database management and ORM (Object-Relational Mapping) in Java applications?
- How do you optimize database queries and ensure efficient data retrieval in a Java application, especially when dealing with large datasets?
- Can you explain the advantages and disadvantages of using an ORM like Hibernate in Java applications, and in what scenarios would you choose to use plain SQL instead?
- Save vs persist method

### Transactions
- Decode each letter of ACID
- What transaction isolation levels exist?
- What is Read Uncommitted?
- What is Read Committed?
- What is Repeatable Read?
- What is Serializable?
- What is a dirty read?
- What is a non-repeatable read?
- What is a phantom read?
- What is a lost update?
- What is the default isolation level in PostgreSQL?
- What is the default isolation level in MySQL?
- What is Propagation in Spring?
- What does Propagation.NESTED do?
- What is the difference between REQUIRED and REQUIRES_NEW?
- What is the @Transactional annotation?
- At which level can you use @Transactional?
- What is rollback in transactions?
- Which exceptions trigger rollback by default?
- How to configure rollback for checked exceptions?
- What is a readonly transaction?
- What happens when you call a @Transactional method from another method of the same class?

---

## REST API and Web Services

### REST / HTTP
- What is REST?
- What does Stateless mean in the context of REST?
- What are the main HTTP methods used in REST?
- What is the difference between PUT and PATCH?
- What is idempotency?
- Which HTTP methods are idempotent?
- Why are GET and DELETE idempotent?
- Is POST idempotent?
- What HTTP status codes do you know?
- What is the difference between 401 and 403?
- What is RESTful API design?
- How to properly name REST endpoints?
- Should you use verbs in URLs?
- What is HATEOAS?
- How to organize REST API versioning?
- What is the Content-Type header?
- What is the Accept header?
- Http status codes, http methods in springboot
- Could you describe your experience with RESTful API development in Java?
- Can you explain the differences between REST and SOAP, and why RESTful APIs are commonly preferred in modern web development?
- How do you handle authentication and authorization in a RESTful Java API, and what are the best practices for securing endpoints?

### Web Development
- How does a Java servlet help in web development?
- How do Java's NIO APIs help build high-performance network applications?

---

## Microservices and Distributed Systems

### Microservices Architecture
- What is the Saga pattern and when to use it?
- What is the difference between choreography and orchestration in Saga?
- How to implement distributed transactions in microservices?
- What are compensating transactions?
- What is the Circuit Breaker pattern?
- How does Circuit Breaker work and what states does it have?
- What is Service Discovery and why is it needed?
- What is the difference between client-side and server-side discovery?
- What is API Gateway and what tasks does it solve?
- What is sharding?
- What is the difference between sharding and partitioning?
- How to implement horizontal scaling of microservices?
- What is the Database per Service pattern?
- What problems arise when using a shared database?
- How to organize communication between microservices?
- What is the difference between synchronous and asynchronous communication?
- How to ensure fault tolerance of microservices?
- What is the Bulkhead pattern?
- What is the Retry pattern and how to use it properly?
- What is exponential backoff?
- How to monitor a distributed microservice system?
- What is distributed tracing?
- How to implement authentication and authorization in microservices?
- What is the Strangler Fig pattern?
- How to test microservices?
- What tools are used for microservice orchestration?
- Discuss the difference between a monolithic application and microservices architecture in Java. What are the benefits and drawbacks of each approach?
- Have you worked on distributed systems or microservices architecture in Java? Can you discuss the challenges you faced and how you addressed them?
- What tools or libraries have you used for building and managing microservices in Java, and what were the advantages of using them?
- Can you discuss strategies you've employed to ensure data consistency and reliability in a microservices architecture?
- Explain your experience with containers and microservices

### Kafka
- What is a topic in Kafka?
- What is a partition and why is it needed?
- How is data distributed across partitions?
- What is a message key and how does it affect partitioning?
- What is a Consumer Group?
- How does consumer load balancing work within a group?
- Can you have more consumers than partitions?
- What happens when a new consumer is added to a group?
- What delivery guarantees does Kafka provide?
- What is the difference between at-most-once, at-least-once and exactly-once?
- How to configure exactly-once semantics?
- What is an offset in Kafka?
- How does commit offset work?
- What is the difference between auto commit and manual commit?
- What is rebalancing and when does it happen?
- What is replication in Kafka?
- What are leader and follower replicas?
- What is ISR (In-Sync Replicas)?
- How does Kafka ensure fault tolerance?
- What is producer acknowledgment and what modes exist (acks=0,1,all)?
- What is a batch in Kafka producer?
- How does message compression work?
- What is an idempotent producer?
- How to handle errors when reading messages?
- What is DLQ (Dead Letter Queue)?
- How to monitor consumer lag?
- What is a retention policy?
- How are old messages deleted from a topic?
- Can you read messages from a specific partition?
- How to implement message filtering on the consumer side?
- Why Kafka? Consumer Group concepts. How many consumers receive a message in one consumer group?
- What happens when there are multiple consumer groups? What happens if message processing fails? What is DLQ? What happens after a message reaches the DLQ? What is a Message Key? Why do we use a Message Key?
- Have you worked on message queues in Java? If so, how did you use them?

### Reactive Programming
- Explain the concept of reactive programming in Java. How does it differ from traditional imperative programming?
- How would you design a highly scalable, distributed caching system using Java?

---

## DevOps and Infrastructure

### Docker / Kubernetes
- What is containerization and why is it needed?
- What is the difference between a container and a virtual machine?
- What is a Dockerfile?
- What are the main instructions used in a Dockerfile?
- What is the difference between CMD and ENTRYPOINT?
- What is multi-stage build?
- What is Docker Compose?
- What is Kubernetes and why is it needed?
- What is a Pod in Kubernetes?
- What is a Node in Kubernetes?
- What is a Service in Kubernetes?
- What types of Service exist (ClusterIP, NodePort, LoadBalancer)?
- What is a ReplicaSet?
- How does scaling work in Kubernetes?
- What is HorizontalPodAutoscaler?
- What is the difference between ConfigMap and Secret?
- What is a liveness probe?
- What is a readiness probe?
- Why are health checks needed?
- What is Ingress in Kubernetes?
- What is a namespace?
- How to organize a rolling update in Kubernetes?
- What is a StatefulSet and when to use it?
- How to monitor applications in Kubernetes?

### CI/CD and Testing
- Can you differentiate between continuous deployment, continuous integration and continuous delivery?
- What is the testing pyramid? Explain its layers
- What approach do you use for testing?
- How do you ensure the quality and reliability of Java code?
- How do you manage and mitigate technical debt in Java projects?
- How do you ensure code quality?

---

## System Design

### Architecture
- How would you design a highly scalable, distributed caching system using Java?
- Design a high-throughput order processing system handling 10,000 requests per second
- Design a notification service that delivers emails, SMS, and push notifications reliably at scale
- Design a rate-limiting layer for a public-facing API
- Design a caching strategy for a read-heavy Java backend service
- Java Steams, Mutli-Theading, ConcurrentHashMap, Spring, SQL, and Azure

---

## Soft Skills and Experience

### General Experience
- How long have you been using Java?
- What types of projects have you completed with Java?
- Describe a complex Java project you have fulfilled
- Have you worked with a Java framework? If so, which one and how did you use it?
- Have you worked with a Java application server? Which one, and what did you use it for?
- How do you ensure the quality and reliability of Java code?
- How do you manage and mitigate technical debt in Java projects?
- Have you integrated Java with other software or tools? If so, describe how you achieved this
- How do you debug and troubleshoot Java code?
- How do you ensure the security and scalability of Java applications?
- What methods do you use to keep up to date with Java technologies and trends?
- Have you mentored or coached other developers? What approach did you use, and what were the results?
- Have you contributed to an open-source Java project? If so, how did you do this?
- How do you work with other developers and partners on Java projects?
- Can you tell us about a project you're particularly proud of?
- What's a sneaky design or coding shortcut that you've discovered over the years?
- What skill would you learn first, if you could go back to when you started out using Java?
- What are some of the tools you've been using lately in your dev work to improve your coding?
- What feature from another programming language do you wish Java had?

### Team and Leadership
- What is the role of a senior Java developer in a team?
- How do you resolve conflicts in a team?
- How do you handle deadlines and pressure?
- Have you ever had to handle a difficult situation with a team member? If yes, how did you handle it?

### Problem Solving
- How do you debug a Java application?
- DSA question on DFS for finding given word in grid n x m
- Print first non repeating character from a given string
- The front plante car trop de données reçus du back, comment gérer ça (pageable)

---

## Other / Miscellaneous

- How do Java SE and Java EE relate?
- What is the difference between Java Virtual Machine (JVM) and Java Development Kit (JDK)?
- Explain the concept of Java agents and how they can be used for application monitoring and profiling
- How do you use Java's JMX API to manage and monitor Java applications?
- In a distributed microservices environment, how do you ensure consistent error handling and logging across multiple services? Can you discuss any strategies or patterns you've used for centralized error tracking?
- Can you discuss your experience with tools or libraries like Log4j or SLF4J for logging in Java applications, and why are they important?
