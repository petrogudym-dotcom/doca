window.SECTIONS = window.SECTIONS || [];
window.SECTIONS.push(  {
    id:'patterns', title:'Design Patterns', icon:'🏛️', iconBg:'#FEF3E8',
    topics:[
      {
        name:'Singleton Pattern', tag:'patterns', tagLabel:'Creational',
        summary:'Ensures a class has only one instance with a global access point. Use enum or double-checked locking for thread safety.',
        short:'Singleton restricts a class to a single instance. Thread-safe implementations: enum (best), static holder class, or double-checked locking with volatile. Avoid Serializable singletons without readResolve().',
        medium:{
          theory:'Enum singleton: Joshua Bloch\'s recommendation — inherently thread-safe, serialization-safe, reflection-safe. Double-checked locking: volatile field + synchronized block inside null check. Static holder: lazy initialization via class loading mechanism (inner static class loaded on first access). Problems with Singleton: global state, testing difficulty, hidden dependencies, serialization issues. Modern alternative: DI frameworks inject single instances without the pattern.',
          tradeoffs:'Singleton: simple, globally accessible, but global state is hard to test and reason about. Prefer dependency injection over singletons. If you must use Singleton, prefer enum implementation. Avoid lazy initialization unless startup time matters.',
          code:`// Best: enum singleton (Bloch)
public enum DatabasePool {
    INSTANCE;
    private final ConnectionPool pool = new ConnectionPool();
    public Connection getConnection() { return pool.acquire(); }
}

// Double-checked locking
public class Singleton {
    private static volatile Singleton instance;  // volatile required!
    private Singleton() {}
    
    public static Singleton getInstance() {
        if (instance == null) {                    // first check (no lock)
            synchronized (Singleton.class) {
                if (instance == null) {             // second check (locked)
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}

// Static holder (lazy, thread-safe)
public class Singleton {
    private Singleton() {}
    private static class Holder {
        static final Singleton INSTANCE = new Singleton();
    }
    public static Singleton getInstance() { return Holder.INSTANCE; }
}`
        },
        links:[
          {label:'Effective Java Item 3', url:'https://www.oreilly.com/library/view/effective-java/9780134686097/'}
        ],
        questions:['Why is enum the best singleton?','What is double-checked locking?','Why volatile in double-checked locking?']
      },
      {
        name:'Factory and Builder Patterns', tag:'patterns', tagLabel:'Creational',
        summary:'Factory Method creates objects without specifying exact class. Builder constructs complex objects step by step. Prototype clones existing objects.',
        short:'Factory Method defines an interface for creating objects, letting subclasses decide which class to instantiate. Abstract Factory creates families of related objects. Builder constructs complex objects step by step. Prototype creates objects by cloning a prototype instance.',
        medium:{
          theory:'Factory Method: replaces new with a factory method, enabling subclasses to change the type created. Abstract Factory: provides an interface for creating families of related objects (e.g., UI toolkit: WindowsButton + WindowsDialog). Builder: separates construction from representation, ideal for objects with many optional parameters. Prototype: implements Cloneable, useful when object creation is expensive. Modern Java: records + sealed classes reduce the need for some creational patterns.',
          tradeoffs:'Factory: decouples creation from usage, enables testing with mocks. Builder: clearer than telescoping constructors. Prototype: rarely used in Java (clone() has pitfalls). Consider static factory methods over constructors for named creation and caching.',
          code:`// Factory Method
interface Notification { void send(String msg); }
class EmailNotification implements Notification { /* ... */ }
class SmsNotification implements Notification { /* ... */ }

class NotificationFactory {
    static Notification create(String type) {
        return switch (type) {
            case "email" -> new EmailNotification();
            case "sms" -> new SmsNotification();
            default -> throw new IllegalArgumentException(type);
        };
    }
}

// Abstract Factory
interface UIFactory {
    Button createButton();
    Dialog createDialog();
}
class WindowsUIFactory implements UIFactory { /* creates Windows widgets */ }
class MacUIFactory implements UIFactory { /* creates Mac widgets */ }

// Prototype
class Document implements Cloneable {
    private String content;
    Document deepCopy() {
        try { return (Document) super.clone(); }
        catch (CloneNotSupportedException e) { throw new AssertionError(e); }
    }
}`
        },
        links:[
          {label:'Design Patterns — GoF', url:'https://en.wikipedia.org/wiki/Design_Patterns'}
        ],
        questions:['When to use Factory Method vs Abstract Factory?','Why avoid clone()?','What are static factory methods?']
      },
      {
        name:'Decorator, Proxy, and Iterator', tag:'patterns', tagLabel:'Structural',
        summary:'Decorator adds behavior dynamically. Proxy controls access. Iterator traverses collections without exposing internals.',
        short:'Decorator wraps an object to add new behavior without modifying the original class (alternative to inheritance). Proxy controls access to an object (lazy initialization, access control, remote calls). Iterator provides sequential access to collection elements without exposing the underlying structure.',
        medium:{
          theory:'Decorator: wraps the same interface, delegates calls, adds behavior before/after. Java I/O uses decorators extensively (BufferedInputStream wraps FileInputStream). Proxy types: virtual (lazy loading), protection (access control), remote (network calls), caching. Spring AOP uses dynamic proxies (JDK proxy for interfaces, CGLIB for classes). Iterator: Java\'s Iterator interface with hasNext()/next()/remove(). The for-each loop uses Iterator under the hood.',
          tradeoffs:'Decorator: flexible alternative to subclassing but creates many small wrapper classes. Proxy: enables cross-cutting concerns (logging, transactions) transparently. Iterator: standard traversal, but Java streams often replace manual iteration.',
          code:`// Decorator — Java I/O
InputStream in = new BufferedInputStream(     // adds buffering
    new GZIPInputStream(                       // adds decompression
        new FileInputStream("data.gz")));       // reads file

// Custom decorator
interface Coffee { double cost(); String description(); }
class SimpleCoffee implements Coffee {
    public double cost() { return 2.0; }
    public String description() { return "Simple coffee"; }
}
class MilkDecorator implements Coffee {
    private final Coffee wrapped;
    MilkDecorator(Coffee c) { this.wrapped = c; }
    public double cost() { return wrapped.cost() + 0.5; }
    public String description() { return wrapped.description() + ", milk"; }
}

// Proxy (Spring AOP style)
@Transactional  // Spring creates proxy around this method
public void transferMoney(Account from, Account to, BigDecimal amount) { /* ... */ }`
        },
        links:[
          {label:'Decorator Pattern', url:'https://refactoring.guru/design-patterns/decorator'},
          {label:'Proxy Pattern', url:'https://refactoring.guru/design-patterns/proxy'}
        ],
        questions:['How does Java I/O use Decorator?','What types of Proxy exist?','How does Spring AOP use proxies?']
      },
      {
        name:'Strategy, Observer, and State', tag:'patterns', tagLabel:'Behavioral',
        summary:'Strategy swaps algorithms at runtime. Observer notifies dependents of changes. State changes behavior based on internal state.',
        short:'Strategy defines a family of algorithms, encapsulates each one, and makes them interchangeable at runtime. Observer defines a one-to-many dependency so that when one object changes state, all dependents are notified. State allows an object to change behavior when its internal state changes.',
        medium:{
          theory:'Strategy: replace if-else/switch with polymorphism — each strategy is a class. Java lambdas make simple strategies trivial. Observer: java.util.Observer is deprecated; use Flow API (Java 9+) or event publishers (Spring ApplicationEventPublisher). State: similar to Strategy but state transitions are managed internally. The object appears to change its class. Common in workflow engines, order processing.',
          tradeoffs:'Strategy: flexible but can create many small classes for simple variations — use lambdas. Observer: decouples publisher from subscribers but can cause cascading updates. State: clean state management but can create many state classes.',
          code:`// Strategy with lambdas (Java 8+)
interface SortStrategy { void sort(int[] arr); }
class Context {
    SortStrategy strategy;
    void sort(int[] arr) { strategy.sort(arr); }
}
// Simple strategies as lambdas
ctx.strategy = Arrays::sort;  // built-in
ctx.strategy = arr -> Arrays.parallelSort(arr);  // parallel

// Observer — Spring events
@Service
class OrderService {
    void placeOrder(Order order) {
        orderRepo.save(order);
        eventPublisher.publishEvent(new OrderPlacedEvent(order));
    }
}
@Component
class InventoryListener {
    @EventListener
    void onOrderPlaced(OrderPlacedEvent event) {
        inventoryService.reserve(event.getOrder());
    }
}

// State pattern
interface PaymentState { void process(PaymentContext ctx); }
class PendingState implements PaymentState {
    public void process(PaymentContext ctx) {
        ctx.charge();
        ctx.setState(new CompletedState());
    }
}`
        },
        links:[
          {label:'Strategy Pattern', url:'https://refactoring.guru/design-patterns/strategy'},
          {label:'Observer Pattern', url:'https://refactoring.guru/design-patterns/observer'}
        ],
        questions:['How do lambdas simplify Strategy?','Why is java.util.Observer deprecated?','What is the difference between State and Strategy?']
      },
      {
        name:'Anti-Patterns and Pattern Selection', tag:'patterns', tagLabel:'Patterns',
        summary:'Common anti-patterns: God Object, Service Locator, Golden Hammer. Choose patterns based on the problem, not the solution.',
        short:'Anti-patterns are commonly used solutions that are ineffective or counterproductive. Key anti-patterns: God Object (one class does everything), Service Locator (hides dependencies), Golden Hammer (one tool for all problems), Big Ball of Mud (no architecture). Choose patterns based on the specific problem and context.',
        medium:{
          theory:'Anti-patterns appear as good solutions but create long-term problems. God Object violates SRP. Service Locator hides dependencies making testing hard (prefer DI). Golden Hammer: using the same pattern everywhere regardless of fit. Big Ball of Mud: no discernible structure. Pattern selection process: 1) Identify the problem (coupling, flexibility, duplication), 2) Match to pattern intent, 3) Evaluate trade-offs for your context, 4) Adapt the pattern — do not force-fit.',
          tradeoffs:'Patterns are tools, not rules. Over-applying patterns creates unnecessary complexity (Factory for a single class, Strategy for one algorithm). Start simple, refactor to patterns when the need arises. YAGNI applies to patterns too.',
          code:`// Anti-pattern: Service Locator (hides dependencies)
class OrderService {
    void process() {
        // Dependencies hidden — hard to test and understand
        PaymentGateway pg = ServiceLocator.get(PaymentGateway.class);
        pg.charge(order);
    }
}

// Better: explicit dependency injection
class OrderService {
    private final PaymentGateway pg;
    OrderService(PaymentGateway pg) { this.pg = pg; }  // explicit
    void process() { pg.charge(order); }
}

// Anti-pattern: God Object
class ApplicationManager {  // does everything
    void processOrder() { /* 500 lines */ }
    void sendEmail() { /* 300 lines */ }
    void generateReport() { /* 400 lines */ }
}

// When NOT to use a pattern:
// Single implementation? No need for Factory.
// One algorithm? No need for Strategy.
// Simple object? No need for Builder.`
        },
        links:[
          {label:'Anti-Patterns', url:'https://en.wikipedia.org/wiki/Anti-pattern'},
          {label:'Refactoring Guru', url:'https://refactoring.guru/design-patterns'}
        ],
        questions:['What is the Golden Hammer anti-pattern?','Why is Service Locator an anti-pattern?','When should you NOT use a pattern?']
      },
      {
        name:'Template Method and Command', tag:'patterns', tagLabel:'Behavioral',
        summary:'Template Method defines algorithm skeleton with customizable steps. Command encapsulates requests as objects for queuing, logging, and undo.',
        short:'Template Method defines the skeleton of an algorithm in a base class, letting subclasses override specific steps without changing the structure. Command encapsulates a request as an object, enabling parameterization, queuing, logging, and undo operations.',
        medium:{
          theory:'Template Method: abstract base class defines the algorithm flow, abstract/hook methods let subclasses customize steps. Used in Spring (JdbcTemplate, RestTemplate), JUnit (setUp/test/tearDown). Command: encapsulates action + parameters as an object. Supports undo (store previous state), queuing (task queues), logging (command history). In Java, Runnable/Callable are simple Command implementations. Lambdas work as simple commands.',
          tradeoffs:'Template Method: clear algorithm structure but uses inheritance (rigid). Consider Strategy (composition) for more flexibility. Command: enables undo/redo and scheduling but adds a class per action. Use lambdas for simple commands.',
          code:`// Template Method
abstract class DataProcessor {
    final void process() {          // template method (final!)
        readData();
        parseData();
        validateData();             // hook: override if needed
        saveData();
    }
    abstract void readData();
    abstract void parseData();
    void validateData() {}          // hook: optional override
    abstract void saveData();
}

class CsvProcessor extends DataProcessor {
    void readData() { /* read CSV */ }
    void parseData() { /* parse CSV */ }
    void saveData() { /* save to DB */ }
}

// Command pattern
interface Command { void execute(); void undo(); }
class AddItemCommand implements Command {
    private final Cart cart;
    private final Item item;
    public void execute() { cart.add(item); }
    public void undo() { cart.remove(item); }
}

// Command as lambda (simple cases)
Runnable command = () -> service.process(order);
executor.submit(command);  // queued command`
        },
        links:[
          {label:'Template Method', url:'https://refactoring.guru/design-patterns/template-method'},
          {label:'Command Pattern', url:'https://refactoring.guru/design-patterns/command'}
        ],
        questions:['How does JdbcTemplate use Template Method?','How to implement undo with Command?','When to use Strategy over Template Method?']
      }
    ]
  });
