window.SECTIONS = window.SECTIONS || [];
window.SECTIONS.push(  {
    id:'basics', title:'Core Java Fundamentals', icon:'📝', iconBg:'#E8F0FE',
    topics:[
      {
        name:'Java Key Features', tag:'basics', tagLabel:'Basics',
        summary:'Object-oriented, platform-independent, strongly typed language with automatic memory management and rich standard library.',
        short:'Java is a general-purpose, OOP language compiled to bytecode running on the JVM. Key features: write once run anywhere (WORA), garbage collection, multithreading, extensive APIs, and backward compatibility.',
        medium:{
          theory:'Java source compiles to platform-independent bytecode executed by the JVM. The JVM provides memory management (GC), security sandboxing, and JIT compilation for performance. Java enforces strong typing, supports generics, and has a massive ecosystem (Spring, Hibernate, etc.).',
          tradeoffs:'Pros: portability, mature ecosystem, strong backward compatibility, large talent pool. Cons: verbosity compared to Kotlin/Scala, slower startup than native languages, higher memory footprint.',
          code:`// Hello World in Java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}

// Compile and run:
// javac Main.java
// java Main`
        },
        links:[
          {label:'Java Documentation', url:'https://docs.oracle.com/en/java/'},
          {label:'JVM Specification', url:'https://docs.oracle.com/javase/specs/jvms/se21/html/'}
        ],
        questions:['What is WORA?','How does JIT compilation work?','What are the main Java editions (SE, EE)?']
      },
      {
        name:'Compile and Run Java', tag:'basics', tagLabel:'Basics',
        summary:'javac compiles .java to .class bytecode; java executes the bytecode on the JVM.',
        short:'Use javac to compile source to bytecode (.class files), then java to run the class containing main(). Since Java 11, java can compile and run a single-file program directly.',
        medium:{
          theory:'javac Main.java produces Main.class containing bytecode. java Main loads the class, finds the public static void main(String[]) method, and executes it. The JVM handles class loading, linking, and initialization. Java 11+ supports single-file source-code programs: java Main.java.',
          tradeoffs:'javac is fast for small projects; build tools (Maven, Gradle) handle dependencies and compilation for larger projects. Single-file execution is great for scripts and learning but not for production.',
          code:`// Traditional compilation
javac MyApp.java
java MyApp

// Java 11+ single-file execution
java MyApp.java

// With classpath
java -cp lib/dependency.jar:classes MyApp

// Java 21+ unnamed classes (JEP 445)
void main() {
    System.out.println("Hello!");
}`
        },
        links:[
          {label:'JEP 330: Launch Single-File Programs', url:'https://openjdk.org/jeps/330'},
          {label:'javac Reference', url:'https://docs.oracle.com/en/java/javase/21/docs/specs/man/javac.html'}
        ],
        questions:['What is the difference between classpath and module path?','How does java -jar work?','What is the role of the bootstrap class loader?']
      },
      {
        name:'JDK vs JRE vs JVM', tag:'basics', tagLabel:'Basics',
        summary:'JVM executes bytecode, JRE = JVM + libraries, JDK = JRE + development tools (javac, jdb).',
        short:'JVM is the runtime engine that executes bytecode. JRE bundles JVM + core libraries needed to run Java apps. JDK includes JRE plus development tools like javac, jar, jdb, and jconsole.',
        medium:{
          theory:'JVM (Java Virtual Machine) is the abstract machine that loads, verifies, and executes bytecode. JRE (Java Runtime Environment) = JVM + java.* and javax.* class libraries. JDK (Java Development Kit) = JRE + development tools (javac compiler, jar archiver, javadoc generator, jdb debugger). Since Java 9, the modular system (JPMS) replaced the monolithic JRE with configurable runtime images via jlink.',
          tradeoffs:'For production deployment, use jlink to create minimal custom runtime images containing only required modules. JDK is needed for development; JRE (or custom runtime) suffices for running applications.',
          code:`// Check installed JDK version
java -version
javac -version

// Create custom runtime with jlink (Java 9+)
jlink --module-path $JAVA_HOME/jmods \\
      --add-modules java.base,java.logging \\
      --output custom-jre

// Run app with custom JRE
custom-jre/bin/java -jar app.jar`
        },
        links:[
          {label:'JEP 220: Modular Run-Time Images', url:'https://openjdk.org/jeps/220'},
          {label:'JDK vs JRE vs JVM', url:'https://docs.oracle.com/en/java/javase/21/install/'}
        ],
        questions:['What modules does java.base contain?','How does jlink reduce deployment size?','What replaced rt.jar in Java 9+?']
      },
      {
        name:'Platform Independence', tag:'basics', tagLabel:'Basics',
        summary:'Java compiles to platform-neutral bytecode that runs on any OS with a compatible JVM.',
        short:'Java achieves platform independence through bytecode: javac compiles source to .class files containing bytecode, which the JVM on any platform interprets or JIT-compiles to native code.',
        medium:{
          theory:'The "Write Once, Run Anywhere" promise works because the JVM abstracts OS differences. Bytecode is a set of instructions for the JVM, not for any specific CPU/OS. Each platform provides its own JVM implementation that translates bytecode to native instructions. Caveats: JNI native code, platform-specific file paths, and GUI toolkits can break portability.',
          tradeoffs:'True portability for pure Java code; but native libraries, system properties, and file separators require platform-aware coding. Performance is near-native thanks to JIT, but startup is slower than compiled languages.',
          code:`// Platform-independent file path
Path path = Path.of("data", "config.json");  // handles OS separator

// Platform-dependent (avoid)
Path bad = Path.of("data\\\\config.json");  // Windows-only

// Check platform at runtime
String os = System.getProperty("os.name");
String sep = File.separator;  // or use Path API`
        },
        links:[
          {label:'Java Architecture', url:'https://docs.oracle.com/en/java/javase/21/docs/api/'}
        ],
        questions:['What breaks platform independence?','How does JNI affect portability?','What is the role of the class file format?']
      },
      {
        name:'Primitive Types vs Objects', tag:'basics', tagLabel:'Basics',
        summary:'Primitives are value types stored on stack; objects are reference types on heap with overhead.',
        short:'Java has 8 primitives (byte, short, int, long, float, double, char, boolean) that hold raw values directly. Objects are reference types — variables hold references to heap-allocated instances with metadata overhead.',
        medium:{
          theory:'Primitives are stored directly in stack frames (local variables) or as fields within objects. They have no methods, no identity, and default values (0, false). Objects live on the heap, have identity (==), can be null, and carry object header overhead (~16 bytes). Autoboxing bridges the two: int ↔ Integer, but creates heap objects.',
          tradeoffs:'Primitives: faster, less memory, no null safety. Objects: polymorphism, methods, collections support. Use primitives for performance-critical code; Objects for APIs, collections, and null semantics.',
          code:`// Primitives — stored directly
int x = 42;          // 4 bytes on stack
double pi = 3.14;    // 8 bytes

// Objects — references to heap
Integer boxed = 42;  // reference + ~16 bytes object overhead
String s = "hello";  // reference + object on heap

// Autoboxing (convenient but allocates)
List<Integer> list = new ArrayList<>();
list.add(42);  // autoboxing: int → Integer

// Performance: primitive array vs boxed
int[] primes = new int[1_000_000];      // ~4 MB
Integer[] boxed = new Integer[1_000_000]; // ~16 MB+ (refs + objects)`
        },
        links:[
          {label:'Primitive Types — Oracle', url:'https://docs.oracle.com/javase/tutorial/java/nutsandbolts/datatypes.html'}
        ],
        questions:['What is the size of boolean in JVM?','What is the default value of a reference type?','How does autoboxing caching work for Integer?']
      },
      {
        name:'static Keyword', tag:'basics', tagLabel:'Basics',
        summary:'static members belong to the class, not instances — shared across all objects of that class.',
        short:'The static keyword makes a member belong to the class itself rather than any instance. Static fields are shared across all instances; static methods can be called without creating an object.',
        medium:{
          theory:'Static fields exist once per classloader. Static methods cannot access instance fields or this. Static blocks execute once when the class is loaded. Static nested classes have no reference to the enclosing instance. Static imports reduce verbosity for constants and utility methods.',
          tradeoffs:'Static state is global state — hard to test and thread-safe. Use for constants, utility methods, factories. Avoid mutable static fields in concurrent code; prefer dependency injection.',
          code:`public class Config {
    // Static field — shared across all instances
    static final String APP_NAME = "MyApp";
    
    // Static initializer — runs once at class loading
    static {
        System.out.println("Config loaded");
    }
    
    // Static method — no instance needed
    static Config fromEnv() {
        return new Config(System.getenv("APP_ENV"));
    }
    
    // Static nested class — no outer reference
    static class Builder { /* ... */ }
}

// Static import
import static java.lang.Math.PI;
double area = PI * r * r;`
        },
        links:[
          {label:'Class Members — Oracle', url:'https://docs.oracle.com/javase/tutorial/java/javaOO/classvars.html'}
        ],
        questions:['When are static fields initialized?','Can you override static methods?','What is a static import?']
      },
      {
        name:'final Keyword', tag:'basics', tagLabel:'Basics',
        summary:'final prevents modification: variables cannot be reassigned, methods cannot be overridden, classes cannot be extended.',
        short:'A final variable cannot be reassigned after initialization (but mutable objects can still change internally). A final method cannot be overridden. A final class cannot be subclassed (e.g., String, Integer).',
        medium:{
          theory:'For primitives, final means the value is constant. For references, final means the reference cannot point to a different object, but the object\'s state can still change. Effectively final variables (not reassigned after initialization) can be used in lambdas. The JIT compiler can inline final fields for optimization.',
          tradeoffs:'Use final for constants, immutable classes, and method parameters to prevent accidental reassignment. Overuse can reduce readability without adding safety. Blank final fields must be assigned in every constructor.',
          code:`// final variable — cannot reassign
final int MAX = 100;
final List<String> list = new ArrayList<>();
list.add("ok");    // mutating object is allowed
// list = new ArrayList<>();  // ERROR: cannot reassign

// final method — cannot override
class Base {
    final void critical() { /* ... */ }
}

// final class — cannot extend
final class Singleton {
    static final Singleton INSTANCE = new Singleton();
    private Singleton() {}
}

// Effectively final in lambda
String name = "Alice";
Runnable r = () -> System.out.println(name);  // OK`
        },
        links:[
          {label:'final — Oracle Tutorial', url:'https://docs.oracle.com/javase/tutorial/java/javaOO/final.html'}
        ],
        questions:['Can a final field change value?','What is effectively final?','Why is String final?']
      },
      {
        name:'Access Modifiers', tag:'basics', tagLabel:'Basics',
        summary:'public (everywhere), protected (subclass + package), default/package-private (package), private (class only).',
        short:'Java has four access levels: public (accessible everywhere), protected (same package + subclasses), default/package-private (same package only, no keyword), and private (same class only).',
        medium:{
          theory:'Access control operates at class, package, and module levels. Top-level classes can only be public or package-private. Members can use all four levels. Inheritance: protected members are accessible in subclasses even from different packages. Reflection can bypass access control with setAccessible(true), but modules (Java 9+) restrict this.',
          tradeoffs:'Default (package-private) is good for internal classes within a package. Private enforces encapsulation. Protected enables extension but couples subclasses. Public creates API surface — minimize it. Prefer the most restrictive access that works.',
          code:`package com.example;

public class MyClass {          // public: visible everywhere
    private int secret;          // private: this class only
    String name;                 // default: this package only
    protected void helper() {}   // protected: package + subclasses
}

// Module-level access (Java 9+)
module myapp {
    exports com.example.api;     // only this package is public
    // com.example.internal is not exported
}`
        },
        links:[
          {label:'Access Control — Oracle', url:'https://docs.oracle.com/javase/tutorial/java/javaOO/accesscontrol.html'}
        ],
        questions:['What is package-private access?','Can you narrow access when overriding?','How do modules affect access?']
      },
      {
        name:'this Keyword', tag:'basics', tagLabel:'Basics',
        summary:'this refers to the current object instance — used to resolve naming conflicts and pass the current object.',
        short:'this is a reference to the current object. It disambiguates instance fields from parameters, calls other constructors (this()), and passes the current object to methods.',
        medium:{
          theory:'Every non-static method receives an implicit this reference. Common uses: resolving shadowed fields (this.name = name), constructor chaining (this(args)), and passing the current instance to callbacks. In inner classes, OuterClass.this accesses the enclosing instance.',
          tradeoffs:'Explicit this. for all field access is a style choice (some teams mandate it). Overuse of passing this to other objects creates tight coupling. Constructor chaining with this() must be the first statement.',
          code:`public class User {
    private String name;
    
    // this resolves shadowing
    public User(String name) {
        this.name = name;
    }
    
    // Constructor chaining
    public User() {
        this("Anonymous");
    }
    
    // Passing this to other objects
    public void register(Registry registry) {
        registry.add(this);
    }
    
    // Inner class accessing outer this
    class Inner {
        void show() {
            System.out.println(User.this.name);
        }
    }
}`
        },
        links:[
          {label:'this Keyword — Oracle', url:'https://docs.oracle.com/javase/tutorial/java/javaOO/thiskey.html'}
        ],
        questions:['Can this be null?','How does this work in inner classes?','What is constructor chaining?']
      },
      {
        name:'String to Integer Conversion', tag:'basics', tagLabel:'Basics',
        summary:'Integer.parseInt() for primitives, Integer.valueOf() for boxed Integer, with NumberFormatException on invalid input.',
        short:'Use Integer.parseInt(str) to get a primitive int, or Integer.valueOf(str) to get an Integer object. Both throw NumberFormatException if the string is not a valid integer.',
        medium:{
          theory:'parseInt() returns a primitive int; valueOf() returns an Integer (cached for -128 to 127). For different bases, pass radix: parseInt("FF", 16) → 255. Since Java 8, parseUnsignedInt() handles unsigned values. For safe parsing, wrap in try-catch or use Optional patterns.',
          tradeoffs:'valueOf() reuses cached Integer objects for small values, saving memory. parseInt() avoids boxing overhead. For user input, always validate and handle NumberFormatException. Consider using Scanner or libraries like Apache Commons for more robust parsing.',
          code:`// Basic conversion
int n = Integer.parseInt("42");        // 42
Integer boxed = Integer.valueOf("42"); // cached Integer

// With radix
int hex = Integer.parseInt("FF", 16);  // 255
int bin = Integer.parseInt("1010", 2); // 10

// Safe parsing
static Optional<Integer> safeParse(String s) {
    try {
        return Optional.of(Integer.parseInt(s));
    } catch (NumberFormatException e) {
        return Optional.empty();
    }
}

// Unsigned (Java 8+)
int unsigned = Integer.parseUnsignedInt("4294967295");`
        },
        links:[
          {label:'Integer.parseInt — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Integer.html#parseInt(java.lang.String)'}
        ],
        questions:['What does valueOf cache?','How to handle NumberFormatException?','What is the difference between parseInt and decode?']
      },
      {
        name:'&& vs & Operators', tag:'basics', tagLabel:'Basics',
        summary:'&& is short-circuit logical AND (skips right operand if left is false); & is bitwise AND or non-short-circuit logical AND.',
        short:'&& evaluates the right operand only if the left is true (short-circuit). & always evaluates both operands. For booleans, & is a non-short-circuit AND; for integers, & performs bitwise AND.',
        medium:{
          theory:'Short-circuit evaluation with && prevents unnecessary work and null pointer exceptions: if (obj != null && obj.isValid()). The & operator on booleans evaluates both sides regardless, which is rarely desired. On integers, & performs bitwise AND: 5 & 3 = 1 (binary 101 & 011 = 001). Same pattern for || vs |.',
          tradeoffs:'Use && for boolean logic (safer, faster). Use & only when both sides must execute (rare) or for bitwise operations. Short-circuit can hide bugs if the right side has important side effects.',
          code:`// Short-circuit — safe null check
String s = null;
if (s != null && s.length() > 0) {  // s.length() not called
    // ...
}

// Bitwise AND
int a = 0b1100;  // 12
int b = 0b1010;  // 10
int c = a & b;   // 0b1000 = 8

// Non-short-circuit (rare, both sides evaluated)
boolean x = true;
boolean y = false;
boolean r = x & methodThatHasSideEffect();  // always calls method

// Common bitwise patterns
int flags = READ | WRITE;     // set bits
boolean hasRead = (flags & READ) != 0;  // check bit
flags &= ~WRITE;              // clear bit`
        },
        links:[
          {label:'Operators — Oracle', url:'https://docs.oracle.com/javase/tutorial/java/nutsandbolts/operators.html'}
        ],
        questions:['When does short-circuit prevent NPE?','What is bitwise AND used for?','How does || differ from |?']
      },
      {
        name:'Enums in Java', tag:'basics', tagLabel:'Basics',
        summary:'Enums are type-safe constants that are full classes with fields, methods, constructors, and can implement interfaces.',
        short:'An enum defines a fixed set of constants as instances of the enum class. Enums can have fields, methods, constructors, and implement interfaces. They are implicitly final and extend java.lang.Enum.',
        medium:{
          theory:'Each enum constant is a singleton instance of the enum class. Enums provide compile-time type safety, ordinal/name methods, values()/valueOf() static methods, and can be used in switch statements. Since Java 5, enums support abstract methods per constant. EnumSet and EnumMap provide optimized collections for enum types.',
          tradeoffs:'Enums are ideal for fixed sets of constants (days, states, roles). They cannot be extended or cloned. For extensible sets, use sealed classes or constants with interfaces. Enum singletons are the preferred Singleton implementation (Joshua Bloch).',
          code:`public enum Planet {
    MERCURY(3.302e+23, 2.439e6),
    VENUS(4.869e+24, 6.052e6),
    EARTH(5.975e+24, 6.378e6);

    private final double mass;
    private final double radius;

    Planet(double mass, double radius) {
        this.mass = mass;
        this.radius = radius;
    }

    double surfaceGravity() {
        return 6.67300E-11 * mass / (radius * radius);
    }
}

// Enum with abstract method
enum Operation {
    PLUS { double apply(double x, double y) { return x + y; } },
    MINUS { double apply(double x, double y) { return x - y; } };
    abstract double apply(double x, double y);
}

// Usage
Planet p = Planet.EARTH;
switch (p) { case EARTH -> System.out.println("Home"); }`
        },
        links:[
          {label:'Enum Types — Oracle', url:'https://docs.oracle.com/javase/tutorial/java/javaOO/enum.html'},
          {label:'Effective Java — Enums', url:'https://www.oreilly.com/library/view/effective-java/9780134686097/'}
        ],
        questions:['Can enums implement interfaces?','How does EnumMap differ from HashMap?','Why are enums thread-safe singletons?']
      },
      {
        name:'Autoboxing and Unboxing', tag:'basics', tagLabel:'Basics',
        summary:'Automatic conversion between primitives and their wrapper classes (int ↔ Integer) with caching for small values.',
        short:'Autoboxing converts primitives to wrapper objects automatically (int → Integer). Unboxing converts wrappers back to primitives (Integer → int). The JVM handles these conversions transparently.',
        medium:{
          theory:'The compiler inserts boxing/unboxing calls at compile time. Integer.valueOf() caches values from -128 to 127 (configurable via -XX:AutoBoxCacheMax). This means Integer.valueOf(127) == Integer.valueOf(127) is true, but Integer.valueOf(128) == Integer.valueOf(128) is false. Unboxing null throws NullPointerException.',
          tradeoffs:'Convenient but can cause subtle bugs: == compares references for boxed types, not values. Autoboxing in loops creates many objects, impacting GC. Always use .equals() for boxed comparisons. Prefer primitives in performance-critical code.',
          code:`// Autoboxing
int x = 42;
Integer boxed = x;      // Integer.valueOf(42)
int unboxed = boxed;    // boxed.intValue()

// Caching trap
Integer a = 127, b = 127;
System.out.println(a == b);    // true (cached)

Integer c = 128, d = 128;
System.out.println(c == d);    // false (new objects)
System.out.println(c.equals(d)); // true (correct way)

// NPE on unboxing
Integer nullable = null;
// int val = nullable;  // NullPointerException!

// Performance in loops
long sum = 0;
for (Integer i = 0; i < 1_000_000; i++)  // slow: boxes each iteration
    sum += i;
for (int i = 0; i < 1_000_000; i++)       // fast: primitive
    sum += i;`
        },
        links:[
          {label:'Autoboxing — Oracle', url:'https://docs.oracle.com/javase/tutorial/java/data/autoboxing.html'}
        ],
        questions:['What range does Integer cache?','Why does == fail for boxed types?','When does unboxing cause NPE?']
      },
      {
        name:'break vs continue', tag:'basics', tagLabel:'Basics',
        summary:'break exits the loop entirely; continue skips to the next iteration. Both support labeled forms for nested loops.',
        short:'break terminates the innermost loop (or labeled loop) immediately. continue skips the rest of the current iteration and proceeds to the next iteration of the innermost (or labeled) loop.',
        medium:{
          theory:'break jumps past the loop body entirely. continue jumps to the loop condition check (or increment in for loops). Labeled break/continue target outer loops in nested structures. break also exits switch statements. These are similar to goto in spirit but structured.',
          tradeoffs:'Excessive use of break/continue reduces readability. Labeled breaks are necessary for nested loops but indicate the loop may be too complex — consider extracting to a method with early returns instead.',
          code:`// break — exit loop when found
for (int i = 0; i < arr.length; i++) {
    if (arr[i] == target) {
        found = i;
        break;  // exit loop
    }
}

// continue — skip even numbers
for (int i = 0; i < 10; i++) {
    if (i % 2 == 0) continue;  // skip to next iteration
    System.out.println(i);     // prints 1,3,5,7,9
}

// Labeled break — exit outer loop
outer:
for (int i = 0; i < rows; i++) {
    for (int j = 0; j < cols; j++) {
        if (grid[i][j] == target) {
            break outer;  // exits both loops
        }
    }
}`
        },
        links:[
          {label:'Branching Statements — Oracle', url:'https://docs.oracle.com/javase/tutorial/java/nutsandbolts/branch.html'}
        ],
        questions:['Can break exit a switch?','How do labeled breaks work?','What is the alternative to labeled continue?']
      },
      {
        name:'Method Overloading', tag:'basics', tagLabel:'Basics',
        summary:'Multiple methods with the same name but different parameter types/counts — resolved at compile time.',
        short:'Method overloading allows defining multiple methods with the same name in a class, differentiated by parameter types or count. The compiler selects the correct method at compile time based on argument types.',
        medium:{
          theory:'Overloading is compile-time polymorphism. Resolution follows specificity rules: exact match > widening > boxing > varargs. Return type alone does not distinguish overloads. Overloading across inheritance: the most specific method in the class hierarchy is chosen. Generic erasure can cause overload conflicts (List<String> and List<Integer> have the same erasure).',
          tradeoffs:'Overloading improves API readability but can cause ambiguity with autoboxing and generics. Static dispatch means the compiler, not runtime, chooses the method. Prefer overloading for related operations (println, valueOf).',
          code:`public class Printer {
    // Overloaded methods
    void print(int n) { System.out.println(n); }
    void print(String s) { System.out.println(s); }
    void print(String s, int times) {
        for (int i = 0; i < times; i++) print(s);
    }
    void print(int... numbers) {  // varargs
        Arrays.stream(numbers).forEach(System.out::println);
    }
}

// Resolution: exact > widening > boxing > varargs
Printer p = new Printer();
p.print(42);        // print(int) — exact match
p.print(42L);       // print(int) via narrowing? NO — compile error
p.print("hello");   // print(String) — exact match
p.print("hi", 3);   // print(String, int) — exact match`
        },
        links:[
          {label:'Method Overloading — Oracle', url:'https://docs.oracle.com/javase/tutorial/java/javaOO/methods.html'}
        ],
        questions:['Can overloads differ only by return type?','How does varargs affect overload resolution?','What is the specificity rule?']
      },
      {
        name:'Console Input', tag:'basics', tagLabel:'Basics',
        summary:'Scanner for simple input, BufferedReader for performance, Console for passwords.',
        short:'Use Scanner for simple console input parsing, BufferedReader + InputStreamReader for fast line-based reading, or System.console() for secure password input.',
        medium:{
          theory:'Scanner (java.util) tokenizes input with configurable delimiters and provides nextInt(), nextLine(), etc. BufferedReader reads lines efficiently. System.console() provides readPassword() that echoes nothing and returns char[] (clearable from memory). In IDEs, System.console() may return null — use Scanner instead.',
          tradeoffs:'Scanner: convenient but slow for large input. BufferedReader: fast but requires manual parsing. Console: secure for passwords but unavailable in some environments. For competitive programming, use BufferedReader + StringTokenizer.',
          code:`// Scanner — simple but slow
Scanner sc = new Scanner(System.in);
String name = sc.nextLine();
int age = sc.nextInt();

// BufferedReader — fast
BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
String line = br.readLine();
int num = Integer.parseInt(line.trim());

// Console — secure password input
Console console = System.console();
if (console != null) {
    char[] pass = console.readPassword("Password: ");
    // use password, then clear
    Arrays.fill(pass, ' ');
}

// Fast I/O for competitive programming
BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
StringTokenizer st = new StringTokenizer(br.readLine());
int a = Integer.parseInt(st.nextToken());`
        },
        links:[
          {label:'Scanner — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Scanner.html'}
        ],
        questions:['Why is Scanner slow?','How to read password securely?','What is the fastest way to read console input?']
      },
      {
        name:'ArrayList vs Array', tag:'basics', tagLabel:'Basics',
        summary:'Arrays are fixed-size, type-safe, and fast; ArrayList is resizable, supports generics, and provides rich API.',
        short:'Arrays have fixed size determined at creation, support primitives, and offer O(1) access. ArrayList dynamically resizes (backed by an array), only stores objects (primitives autoboxed), and provides add/remove/contains methods.',
        medium:{
          theory:'Arrays: contiguous memory, fixed size, covariance (String[] is Object[]), no generics support. ArrayList: wraps an internal Object[] that grows by 50% when full, supports generics for type safety, implements List interface. ArrayList has ~1.5x memory overhead due to capacity > size and object references.',
          tradeoffs:'Use arrays for performance-critical code, primitives, and known sizes. Use ArrayList for dynamic sizing, collections API integration, and generic type safety. Converting: Arrays.asList(array) creates a fixed-size list; list.toArray() converts back.',
          code:`// Array — fixed size, primitive support
int[] arr = new int[100];
arr[0] = 42;
int len = arr.length;  // property, not method

// ArrayList — dynamic, object-only
List<Integer> list = new ArrayList<>();  // Integer, not int
list.add(42);
list.add(99);
list.remove(0);
int size = list.size();  // method

// Array covariance trap
Object[] objects = new String[5];
// objects[0] = 42;  // ArrayStoreException at runtime!

// Conversion
String[] arr2 = {"a", "b", "c"};
List<String> list2 = Arrays.asList(arr2);  // fixed-size!
List<String> mutable = new ArrayList<>(Arrays.asList(arr2));`
        },
        links:[
          {label:'ArrayList — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/ArrayList.html'}
        ],
        questions:['How does ArrayList resize?','Why can ArrayList not store primitives?','What is array covariance?']
      },
      {
        name:'Iterating Collections', tag:'basics', tagLabel:'Basics',
        summary:'for-each loop, Iterator, ListIterator, Stream API, and forEach() — each with different capabilities.',
        short:'Java provides multiple ways to iterate: enhanced for loop (for-each), Iterator with hasNext()/next(), ListIterator for bidirectional traversal, Stream API for functional operations, and forEach() method with lambdas.',
        medium:{
          theory:'Enhanced for (for-each) uses Iterator under the hood. Iterator supports safe removal via remove(). ListIterator adds previous(), set(), and add() for Lists. Stream API enables filter/map/reduce pipelines. Collection.forEach() (Java 8+) accepts a Consumer lambda. For maps, use entrySet(), keySet(), or forEach((k,v) -> ...).',
          tradeoffs:'For-each: cleanest for read-only traversal. Iterator: needed for safe removal during iteration. Streams: best for complex transformations but has overhead. forEach: concise but cannot throw checked exceptions easily.',
          code:`List<String> items = List.of("a", "b", "c");

// Enhanced for
for (String item : items) {
    System.out.println(item);
}

// Iterator with safe removal
Iterator<String> it = items.iterator();
while (it.hasNext()) {
    if (it.next().equals("b")) it.remove();
}

// Stream API
items.stream()
    .filter(s -> !s.equals("b"))
    .map(String::toUpperCase)
    .forEach(System.out::println);

// forEach with lambda (Java 8+)
items.forEach(System.out::println);

// Map iteration
Map<String, Integer> map = Map.of("a", 1, "b", 2);
map.forEach((k, v) -> System.out.println(k + "=" + v));`
        },
        links:[
          {label:'Collections — Oracle', url:'https://docs.oracle.com/javase/tutorial/collections/interfaces/collection.html'}
        ],
        questions:['How to remove elements during iteration?','What is the difference between for-each and Iterator?','When to use streams over for-each?']
      },
      {
        name:'Class vs Object', tag:'basics', tagLabel:'Basics',
        summary:'A class is a blueprint/template defining structure and behavior; an object is a runtime instance of a class.',
        short:'A class defines fields (state) and methods (behavior) as a template. An object is a concrete instance created from a class using the new keyword, with its own state stored in heap memory.',
        medium:{
          theory:'A class is loaded once by the classloader and represented by java.lang.Class. Objects are created at runtime via new, reflection, deserialization, or clone(). Each object has a unique identity (==), a class reference, and its own field values. The Class object provides reflection APIs for runtime introspection.',
          tradeoffs:'Classes define the type system; objects hold runtime data. Static members belong to the class, not instances. Understanding this distinction is fundamental to OOP and memory management.',
          code:`// Class — the blueprint
public class Car {
    String model;     // field (state)
    int year;
    
    void drive() {    // method (behavior)
        System.out.println(model + " is driving");
    }
}

// Objects — instances of the class
Car car1 = new Car();
car1.model = "Tesla";
car1.year = 2024;

Car car2 = new Car();
car2.model = "BMW";

// car1 and car2 are different objects
System.out.println(car1 == car2);  // false

// Class object (reflection)
Class<?> cls = car1.getClass();
System.out.println(cls.getName());  // "Car"`
        },
        links:[
          {label:'Classes and Objects — Oracle', url:'https://docs.oracle.com/javase/tutorial/java/javaOO/classes.html'}
        ],
        questions:['What is the Class object?','How is an object created besides new?','What is object identity vs equality?']
      },
      {
        name:'Packages in Java', tag:'basics', tagLabel:'Basics',
        summary:'Packages organize classes into namespaces, control access, and prevent naming conflicts.',
        short:'A package is a namespace that organizes related classes and interfaces. Declared with the package statement at the top of a source file. Packages correspond to directory structure and control visibility via access modifiers.',
        medium:{
          theory:'Packages provide namespace management (com.example.util vs com.other.util), access control (package-private visibility), and map to the filesystem (com/example/MyClass.java). Java 9+ modules (JPMS) add a layer above packages with explicit exports/requires. Common convention: reverse domain name (com.company.project.module).',
          tradeoffs:'Packages are essential for organizing large codebases. Deep package hierarchies can be over-engineered. Java 9 modules enforce stronger encapsulation but add complexity. Use packages for logical grouping and access control.',
          code:`// Package declaration (must be first line)
package com.example.service;

import com.example.model.User;
import java.util.List;

public class UserService {
    // package-private — accessible within com.example.service
    static final String DEFAULT_ROLE = "user";
    
    public List<User> findAll() { /* ... */ }
}

// Module declaration (Java 9+)
// module-info.java
module com.example.app {
    requires java.sql;
    exports com.example.service;  // public API
    // com.example.internal is NOT exported
}`
        },
        links:[
          {label:'Packages — Oracle', url:'https://docs.oracle.com/javase/tutorial/java/package/packages.html'},
          {label:'Java Platform Module System', url:'https://openjdk.org/projects/jigsaw/'}
        ],
        questions:['How do packages relate to directories?','What is package-private access?','How do Java 9 modules extend packages?']
      },
      {
        name:'String vs StringBuilder vs StringBuffer', tag:'basics', tagLabel:'Strings',
        summary:'String is immutable; StringBuilder is mutable and fast (not thread-safe); StringBuffer is mutable and thread-safe (synchronized).',
        short:'String objects are immutable — any modification creates a new object. StringBuilder provides mutable strings with no synchronization overhead. StringBuffer is the thread-safe variant with synchronized methods.',
        medium:{
          theory:'String: backed by final byte[] (compact strings since Java 9), every operation like concat/replace creates a new String. StringBuilder: internal char[] that grows as needed, methods return this for chaining. StringBuffer: identical API but every method is synchronized. Use StringBuilder in single-threaded code for ~10x speedup over String concatenation in loops.',
          tradeoffs:'String: safe for sharing, HashMap keys, string pool. StringBuilder: fastest for building strings in loops. StringBuffer: thread-safe but slower due to synchronization overhead; rarely needed since StringBuilder + local variables are the norm.',
          code:`// String — immutable, new object per operation
String s = "hello";
s = s + " world";  // creates new String object

// StringBuilder — mutable, fast
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 1000; i++) {
    sb.append("item").append(i).append("\\n");
}
String result = sb.toString();

// StringBuffer — thread-safe (synchronized)
StringBuffer buf = new StringBuffer();
// Multiple threads can safely append
// But slower than StringBuilder`
        },
        links:[
          {label:'StringBuilder — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/StringBuilder.html'}
        ],
        questions:['When does the compiler use StringBuilder automatically?','What is the default capacity of StringBuilder?','Can StringBuilder be shared across threads?']
      },
      {
        name:'String Pool', tag:'basics', tagLabel:'Strings',
        summary:'A special heap area where string literals are interned — identical literals share the same reference.',
        short:'The String Pool stores unique String instances. String literals and interned strings share references: "abc" == "abc" is true. Strings created with new String("abc") bypass the pool.',
        medium:{
          theory:'At compile time, the compiler places string literals in the constant pool. At runtime, the JVM interns these strings in the String Pool (part of the heap since Java 7). String.intern() adds a string to the pool if not present and returns the pooled reference. This saves memory when many identical strings exist.',
          tradeoffs:'Pooling saves memory for repeated strings but intern() is a native method call with overhead. The pool is garbage collected (since Java 7). Avoid interning short-lived or unique strings — the lookup cost exceeds the memory savings.',
          code:`// String pool behavior
String a = "hello";           // from string pool
String b = "hello";           // same pool reference
String c = new String("hello"); // new object on heap
String d = c.intern();        // pool reference

System.out.println(a == b);   // true (same pool ref)
System.out.println(a == c);   // false (pool vs heap)
System.out.println(a == d);   // true (intern returns pool ref)

// Compile-time concatenation is interned
String e = "hel" + "lo";     // compile-time constant
System.out.println(a == e);   // true

// Runtime concatenation is NOT interned
String part = "hel";
String f = part + "lo";      // runtime operation
System.out.println(a == f);   // false`
        },
        links:[
          {label:'String.intern — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html#intern()'}
        ],
        questions:['Where is the String Pool stored?','When is intern() useful?','Can the String Pool cause OOM?']
      },
      {
        name:'String Literal vs new String()', tag:'basics', tagLabel:'Strings',
        summary:'Literals are pooled and reused; new String() always creates a distinct heap object.',
        short:'String literals ("abc") are interned in the String Pool — identical literals share the same reference. new String("abc") always creates a new object on the heap, even if an identical string exists in the pool.',
        medium:{
          theory:'The compiler adds string literals to the class constant pool. At class loading, the JVM resolves them to String Pool entries. new String() bypasses this and allocates a fresh object. Since Java 7, the pool lives in the main heap, so pooled strings are garbage collected when unreachable.',
          tradeoffs:'Always prefer literals over new String() for constants. Use new String() only when you explicitly need a distinct object (extremely rare). new String(literal) creates both a pool entry and a heap copy — wasteful.',
          code:`String lit1 = "test";
String lit2 = "test";
String obj = new String("test");

System.out.println(lit1 == lit2);       // true (same pool ref)
System.out.println(lit1 == obj);        // false (different objects)
System.out.println(lit1.equals(obj));   // true (same content)

// Avoid this pattern — wasteful
String bad = new String("constant");  // creates unnecessary object

// intern() to force pool usage
String dynamic = "te" + new String("st");
System.out.println(dynamic == "test");  // false
System.out.println(dynamic.intern() == "test");  // true`
        },
        links:[
          {label:'String — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html'}
        ],
        questions:['Why does new String create extra objects?','What happens at class loading with literals?','When should you call intern()?']
      },
      {
        name:'String Immutability', tag:'basics', tagLabel:'Strings',
        summary:'String is final with final byte[] — content cannot change after creation, enabling thread safety and pooling.',
        short:'String objects cannot be modified after creation. Any operation (concat, replace, substring) returns a new String. This enables safe sharing across threads, string pooling, and use as HashMap keys.',
        medium:{
          theory:'String stores characters in a private final byte[] (compact strings since Java 9). The class is final, preventing subclass modification. Immutability enables: string pool sharing, thread safety without synchronization, secure use as Map keys (hash code never changes), and class loader/security permission checks.',
          tradeoffs:'Pros: thread-safe, poolable, safe as keys. Cons: every modification creates a new object (memory/GC pressure for string-heavy code). Use StringBuilder for building strings, or char[] for sensitive data like passwords.',
          code:`String s = "hello";
s.toUpperCase();          // returns new String, s unchanged
System.out.println(s);    // still "hello"

// Reflection can break immutability (discouraged)
// Since Java 12+, even reflection access to String internals is restricted

// Thread-safe without synchronization
String shared = "constant";
// Safe to share across threads — no locks needed

// Safe as HashMap key
Map<String, Object> map = new HashMap<>();
map.put("key", value);  // hash code stable forever`
        },
        links:[
          {label:'String — Oracle', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html'}
        ],
        questions:['Why is String final?','How does immutability enable pooling?','Can reflection modify a String?']
      },
      {
        name:'StringBuilder vs StringBuffer', tag:'basics', tagLabel:'Strings',
        summary:'Both are mutable string builders; StringBuilder is faster (no sync), StringBuffer is thread-safe (synchronized).',
        short:'StringBuilder and StringBuffer have identical APIs for building mutable strings. StringBuilder (Java 5+) is unsynchronized and faster. StringBuffer synchronizes every method for thread safety.',
        medium:{
          theory:'Both extend AbstractStringBuilder with a resizable char[] buffer. StringBuilder methods have no synchronization. StringBuffer methods are synchronized, adding ~10-20% overhead per call. Since string building is typically local to a method (single thread), StringBuilder is the standard choice.',
          tradeoffs:'Use StringBuilder in 99% of cases. StringBuffer is only needed when a shared buffer is modified by multiple threads — but sharing mutable state is itself an anti-pattern. Prefer thread confinement with StringBuilder.',
          code:`// StringBuilder — fast, not thread-safe
StringBuilder sb = new StringBuilder(256);  // initial capacity
sb.append("Hello").append(" ").append("World");
sb.insert(5, ",");
sb.delete(0, 6);
String result = sb.toString();

// StringBuffer — synchronized, slower
StringBuffer buf = new StringBuffer();
// Safe for multi-threaded use, but slower

// Performance comparison (single thread)
// StringBuilder: ~100ms for 1M appends
// StringBuffer:  ~130ms for 1M appends
// String +=:     ~50000ms for 1M appends`
        },
        links:[
          {label:'StringBuffer — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/StringBuffer.html'}
        ],
        questions:['Why is StringBuffer slower?','When would you use StringBuffer?','What is the default capacity?']
      },
      {
        name:'String Concatenation with +', tag:'basics', tagLabel:'Strings',
        summary:'Compiler converts + to StringBuilder for non-constant expressions; constant expressions are folded at compile time.',
        short:'The + operator on strings creates new String objects at runtime. The compiler optimizes simple concatenation to use StringBuilder. Constant expressions ("a" + "b") are folded at compile time into a single literal.',
        medium:{
          theory:'For s1 + s2, the compiler generates: new StringBuilder().append(s1).append(s2).toString(). But in loops, each iteration creates a new StringBuilder — use explicit StringBuilder instead. Since Java 9 (JEP 280), invokedynamic is used for string concatenation, allowing the JVM to choose the optimal strategy at runtime.',
          tradeoffs:'+ is fine for simple expressions and readability. Explicit StringBuilder is essential in loops and hot paths. Java 9+ invokedynamic concatenation is often faster than manual StringBuilder for simple cases.',
          code:`// Simple concatenation — compiler uses StringBuilder
String greet = "Hello, " + name + "!";
// Compiled to: StringBuilder.append("Hello, ").append(name).append("!")

// Constant folding at compile time
String s = "a" + "b" + "c";  // compiled as "abc"

// BAD: + in a loop (creates new StringBuilder each iteration)
String result = "";
for (String s : items) {
    result += s;  // slow! O(n²) total
}

// GOOD: explicit StringBuilder
StringBuilder sb = new StringBuilder();
for (String s : items) {
    sb.append(s);
}
String result = sb.toString();`
        },
        links:[
          {label:'JEP 280: Indify String Concatenation', url:'https://openjdk.org/jeps/280'}
        ],
        questions:['How does Java 9+ optimize string concat?','Why is + slow in loops?','What is constant folding?']
      },
      {
        name:'String == vs equals()', tag:'basics', tagLabel:'Strings',
        summary:'== compares references (identity); .equals() compares character content (equality). Always use equals() for String comparison.',
        short:'The == operator checks if two references point to the same object in memory. String.equals() compares the actual character content. Always use equals() for string comparison — == only works reliably for pooled strings.',
        medium:{
          theory:'String overrides equals() to compare character arrays. == compares reference addresses, which is only true for interned/pooled strings. Common trap: == works for literals but fails for strings created with new, concat, or runtime operations. Objects.equals() handles null safely.',
          tradeoffs:'Always use equals() for String comparison. Use == only when you specifically need identity comparison (rare for strings). Objects.equals() is null-safe: Objects.equals(a, b) returns true if both are null or a.equals(b).',
          code:`String a = "hello";
String b = "hello";
String c = new String("hello");

a == b;        // true (both from pool)
a == c;        // false (pool vs heap object)
a.equals(c);   // true (same content)

// Null-safe comparison
Objects.equals(a, null);    // false, no NPE
Objects.equals(null, null); // true

// Constant vs runtime
String d = "hel" + "lo";     // compile-time: pooled
System.out.println(a == d);  // true

String part = "hel";
String e = part + "lo";      // runtime: new String
System.out.println(a == e);  // false`
        },
        links:[
          {label:'String.equals — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html#equals(java.lang.Object)'}
        ],
        questions:['Why does == sometimes work for strings?','What is Objects.equals?','When is .equals() not enough?']
      },
      {
        name:'substring() Evolution', tag:'basics', tagLabel:'Strings',
        summary:'Pre-Java 7u6: shared internal char[] (O(1), memory leak risk). Post-Java 7u6: copies characters (O(n), no leak).',
        short:'Before Java 7u6, substring() shared the original String\'s char[] — O(1) but could keep large strings alive. Since Java 7u6, substring() copies the relevant characters into a new array — O(n) but no memory leaks.',
        medium:{
          theory:'The old implementation stored offset and count into the parent\'s char[]. A substring of a 1MB string kept the entire 1MB alive. This was changed to copy characters, trading O(1) creation for memory safety. The change also affected String itself: Java 9 compact strings use byte[] with Latin-1/UTF-16 encoding.',
          tradeoffs:'Old: fast but dangerous for large strings. New: safer but slightly slower for large substrings. If you need the old behavior (sharing char[]), use custom wrappers — but this is rarely needed.',
          code:`String original = "Hello, World!";

// substring creates a new String with copied content
String sub = original.substring(7);  // "World!"

// Pre-Java 7u6 behavior (no longer available):
// sub shared original's char[] — 1 char[] for both

// If you need old behavior for performance:
// Use CharBuffer or custom offset/length tracking
CharBuffer buf = CharBuffer.wrap(original, 7, 13);`
        },
        links:[
          {label:'String.substring — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html#substring(int)'}
        ],
        questions:['Why was substring changed?','What was the memory leak?','How do compact strings affect substring?']
      },
      {
        name:'split(), replace() vs replaceAll()', tag:'basics', tagLabel:'Strings',
        summary:'split() uses regex; replace() is literal; replaceAll() uses regex. Use Pattern.compile() for repeated operations.',
        short:'String.split(regex) splits by regex pattern. replace(CharSequence, CharSequence) replaces literal text. replaceAll(regex, replacement) uses regex. For repeated operations, pre-compile the Pattern.',
        medium:{
          theory:'split() compiles the regex each call — cache the Pattern for hot paths. replace() does not use regex, making it faster for literal replacements. replaceAll() compiles regex and supports backreferences ($1). replaceFirst() replaces only the first match. Since Java 11, String.isBlank(), strip(), lines() improve whitespace handling.',
          tradeoffs:'replace() for literal text (faster, no regex). replaceAll() for pattern matching. Pre-compile Pattern for repeated operations. split() with limit parameter controls result array size.',
          code:`String csv = "a,b,c,d";
String[] parts = csv.split(",");           // ["a","b","c","d"]
String[] limited = csv.split(",", 2);      // ["a","b,c,d"]

// replace — literal, no regex
"hello world".replace("world", "Java");    // "hello Java"

// replaceAll — regex
"abc123".replaceAll("[0-9]+", "#");        // "abc#"

// replaceFirst — regex, first match only
"abc123def456".replaceFirst("[0-9]+", "#"); // "abc#def456"

// Pre-compile for repeated use
static final Pattern COMMA = Pattern.compile(",");
String[] fast = COMMA.split(input);  // no re-compilation`
        },
        links:[
          {label:'String Methods — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html'}
        ],
        questions:['Why pre-compile Pattern?','What does split limit do?','How does replace differ from replaceAll?']
      },
      {
        name:'String Encoding', tag:'basics', tagLabel:'Strings',
        summary:'Strings are UTF-16 internally; convert to/from bytes with explicit charset to avoid platform-dependent bugs.',
        short:'Java Strings store text as UTF-16 internally. When converting to byte[] or reading external data, always specify the charset explicitly (StandardCharsets.UTF_8) to avoid platform-dependent default encoding issues.',
        medium:{
          theory:'String internally uses byte[] with Latin-1 or UTF-16 encoding (compact strings since Java 9). Converting to bytes: getBytes(Charset) — always specify charset. Converting from bytes: new String(bytes, Charset). Common encodings: UTF-8 (web standard), ISO-8859-1 (Latin-1), UTF-16 (Java internal). Platform default charset varies by OS — never rely on it.',
          tradeoffs:'Always use explicit charsets. UTF-8 is the universal standard for external data. Using platform default causes bugs when deploying across OS environments. StandardCharsets provides type-safe charset constants.',
          code:`// Always specify charset explicitly
byte[] bytes = "héllo".getBytes(StandardCharsets.UTF_8);
String restored = new String(bytes, StandardCharsets.UTF_8);

// WRONG — platform-dependent
byte[] bad = "héllo".getBytes();  // uses default charset

// Common charsets
StandardCharsets.UTF_8;      // web, files, APIs
StandardCharsets.ISO_8859_1; // Latin-1, legacy systems
StandardCharsets.US_ASCII;   // 7-bit ASCII
StandardCharsets.UTF_16;     // Java internal format

// Java 17+ Charset.forName with error handling
Charset charset = Charset.forName("windows-1252",
    Charset.defaultCharset()::name);  // fallback`
        },
        links:[
          {label:'StandardCharsets — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/charset/StandardCharsets.html'}
        ],
        questions:['Why always specify charset?','What is compact strings encoding?','How does UTF-8 differ from UTF-16?']
      },
      {
        name:'Compact Strings (Java 9+)', tag:'basics', tagLabel:'Strings',
        summary:'Java 9 stores Latin-1 strings in byte[] (1 byte/char) instead of char[] (2 bytes/char), cutting memory ~40%.',
        short:'Since Java 9 (JEP 254), String uses byte[] instead of char[]. Latin-1 characters use 1 byte each; characters outside Latin-1 fall back to UTF-16 (2 bytes). A coder byte flags the encoding used.',
        medium:{
          theory:'Most strings in typical applications are Latin-1 (ASCII + Western European). The old char[] always used 2 bytes per character. Compact strings use 1 byte for Latin-1 and 2 bytes for UTF-16, with a byte flag indicating which. This saves ~40% heap for string-heavy applications. The optimization is transparent to application code.',
          tradeoffs:'Huge memory savings for Latin-1 heavy workloads. Slightly slower for UTF-16 operations due to encoding check. The optimization is automatic — no code changes needed.',
          code:`// Latin-1 string: 1 byte per char + object header
String latin = "Hello";  // 5 bytes + header

// Non-Latin-1: falls back to UTF-16 (2 bytes per char)
String unicode = "日本語";  // 6 bytes + header (UTF-16)

// Transparent to application code
String mixed = "Hello 日本語";  // UTF-16 for entire string

// Check encoding (internal, not public API)
// String uses @Stable byte[] value + byte coder`
        },
        links:[
          {label:'JEP 254: Compact Strings', url:'https://openjdk.org/jeps/254'}
        ],
        questions:['How much memory do compact strings save?','When does String use UTF-16?','Is the optimization transparent?']
      },
      {
        name:'Java 11+ String Methods', tag:'basics', tagLabel:'Strings',
        summary:'isBlank(), strip(), stripLeading/Trailing(), lines(), repeat() — modern convenience methods for String.',
        short:'Java 11 added: isBlank() (true if empty or whitespace), strip()/stripLeading()/stripTrailing() (Unicode-aware trimming), lines() (Stream of lines), and repeat(int) (string repetition).',
        medium:{
          theory:'strip() uses Character.isWhitespace() (Unicode-aware), unlike trim() which only handles ASCII <= 0x20. lines() returns a Stream<String> splitting on \\n, \\r, or \\r\\n. repeat(n) creates n copies efficiently. Java 12 added indent() and transform(). Java 15 added text blocks ("""). Java 21 added StringTemplates (preview).',
          tradeoffs:'Use strip() over trim() for correct Unicode handling. lines() is memory-efficient (lazy Stream). repeat() is cleaner than StringBuilder loops. Text blocks (Java 15+) are ideal for multi-line strings.',
          code:`// isBlank — empty or whitespace only
"  ".isBlank();    // true
"".isBlank();      // true
" x ".isBlank();   // false

// strip — Unicode-aware trimming
" hello ".strip();          // "hello"
" hello ".stripLeading();   // "hello "
" hello ".stripTrailing();  // " hello"

// lines — Stream of lines
"line1\\nline2\\nline3".lines()
    .forEach(System.out::println);

// repeat
"ha".repeat(3);  // "hahaha"

// Text blocks (Java 15+)
String json = """
    {
        "name": "Java",
        "version": 21
    }
    """;`
        },
        links:[
          {label:'JEP 355: Text Blocks', url:'https://openjdk.org/jeps/355'},
          {label:'String — Java 11+ Methods', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html'}
        ],
        questions:['How does strip() differ from trim()?','What does lines() return?','How do text blocks handle indentation?']
      },
      {
        name:'String in HashMap and Comparable', tag:'basics', tagLabel:'Strings',
        summary:'String implements Comparable (lexicographic ordering) and caches hashCode, making it an ideal HashMap key.',
        short:'String implements Comparable<String> for natural ordering (lexicographic by Unicode value) and CharSequence for character sequence access. Its hashCode is cached after first computation, making it an efficient HashMap key.',
        medium:{
          theory:'Comparable: compareTo() compares character by character using Unicode values. "Apple" < "banana" because \'A\' (65) < \'b\' (98) — case-sensitive. Use String.CASE_INSENSITIVE_ORDER for case-insensitive sorting. CharSequence: provides charAt(), length(), subSequence() for uniform access to character data (String, StringBuilder, CharBuffer all implement it).',
          tradeoffs:'String as HashMap key: immutable hashCode, efficient lookup. Case-sensitive compareTo can be surprising — use Collator for locale-aware sorting. CharSequence interface enables polymorphic string handling.',
          code:`// Comparable — natural ordering
List<String> list = List.of("banana", "Apple", "cherry");
List<String> sorted = list.stream().sorted().toList();
// ["Apple", "banana", "cherry"] — uppercase first!

// Case-insensitive sorting
list.stream()
    .sorted(String.CASE_INSENSITIVE_ORDER)
    .toList();
// ["Apple", "banana", "cherry"]

// CharSequence — common interface
void printLength(CharSequence cs) {
    System.out.println(cs.length());  // works for String, StringBuilder, etc.
}

// String as HashMap key — ideal
Map<String, Integer> scores = new HashMap<>();
scores.put("Alice", 100);  // hashCode cached, never changes`
        },
        links:[
          {label:'Comparable — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Comparable.html'}
        ],
        questions:['Is String compareTo case-sensitive?','Why is String a good HashMap key?','What is CharSequence?']
      },
      {
        name:'String Deduplication in G1 GC', tag:'basics', tagLabel:'Strings',
        summary:'G1 GC can deduplicate identical String objects across the heap, saving memory in string-heavy applications.',
        short:'String deduplication (Java 8u20+) is a G1 GC feature that identifies duplicate String objects during GC cycles and redirects references to a single copy, reducing heap usage.',
        medium:{
          theory:'During a GC cycle, G1 identifies String objects with identical content and makes duplicates point to the same underlying byte[]. This is transparent to application code. Enabled with -XX:+UseStringDeduplication (G1 only). Most effective when the application has many similar strings (e.g., parsed JSON/XML with repeated field names).',
          tradeoffs:'Saves 10-30% heap in string-heavy workloads. Small CPU overhead during GC cycles. Only works with G1 GC. Not needed with compact strings (Java 9+) for Latin-1 strings, but still helps for longer strings.',
          code:`# Enable string deduplication with G1 GC
java -XX:+UseG1GC -XX:+UseStringDeduplication -jar app.jar

# Monitor deduplication
java -XX:+UseG1GC -XX:+UseStringDeduplication \\
     -Xlog:gc+stringdedup=debug -jar app.jar

# Typical savings: 10-30% heap for string-heavy apps
# Most effective with many repeated strings from parsing`
        },
        links:[
          {label:'JEP 192: String Deduplication', url:'https://openjdk.org/jeps/192'}
        ],
        questions:['Which GC supports deduplication?','When is deduplication most effective?','How does it interact with compact strings?']
      },
      {
        name:'Inheritance in Java', tag:'oop', tagLabel:'OOP',
        summary:'Mechanism where a subclass acquires fields and methods of a parent class, enabling code reuse and type hierarchies.',
        short:'Inheritance allows a class (subclass) to extend another class (superclass), inheriting its non-private members. Java supports single class inheritance (extends) and multiple interface implementation (implements).',
        medium:{
          theory:'The subclass inherits accessible fields and methods from the superclass. Protected members are accessible in subclasses. Constructors are not inherited but can be invoked via super(). The Object class is the root of all class hierarchies. Java deliberately chose single inheritance to avoid the diamond problem — interfaces with default methods provide a safe alternative.',
          tradeoffs:'Inheritance models "is-a" relationships but creates tight coupling between parent and child. Fragile base class problem: changes to the parent can break subclasses. Prefer composition over inheritance when there is no true "is-a" relationship.',
          code:`class Animal {
    String name;
    void speak() { System.out.println("..."); }
}

class Dog extends Animal {
    @Override
    void speak() { System.out.println("Woof!"); }
}

class GuideDog extends Dog {
    String owner;
    void guide() { System.out.println(name + " guides " + owner); }
}

// Single inheritance only
// class Cat extends Dog, Animal {}  // ERROR

// Interface for multiple types
interface Swimmable { void swim(); }
class Duck extends Animal implements Swimmable {
    public void swim() { /* ... */ }
}`
        },
        links:[
          {label:'Inheritance — Oracle', url:'https://docs.oracle.com/javase/tutorial/java/IandI/subclasses.html'}
        ],
        questions:['What is the fragile base class problem?','Why no multiple inheritance in Java?','How does super() work?']
      },
      {
        name:'Polymorphism', tag:'oop', tagLabel:'OOP',
        summary:'One interface, multiple implementations — compile-time (overloading) and runtime (overriding) polymorphism.',
        short:'Polymorphism lets you treat objects of different types uniformly through a common supertype. Compile-time polymorphism is method overloading; runtime polymorphism is method overriding via dynamic dispatch.',
        medium:{
          theory:'Runtime polymorphism: a superclass reference can hold any subclass object, and the JVM dispatches to the actual object\'s method at runtime (dynamic binding). This enables open/closed design — add new subclasses without modifying existing code. Method overloading (same name, different params) is resolved at compile time. Method overriding (same signature in subclass) is resolved at runtime.',
          tradeoffs:'Polymorphism enables flexible, extensible code but adds indirection. Virtual method calls are slightly slower than direct calls (though JIT optimizes monomorphic call sites). Overloading can cause ambiguity with autoboxing and generics.',
          code:`// Runtime polymorphism
Animal animal = new Dog();
animal.speak();  // "Woof!" — JVM dispatches to Dog.speak()

// Polymorphic collection
List<Animal> zoo = List.of(new Dog(), new Cat(), new Bird());
zoo.forEach(Animal::speak);  // each speaks differently

// Compile-time polymorphism (overloading)
class Calculator {
    int add(int a, int b) { return a + b; }
    double add(double a, double b) { return a + b; }
}

// Strategy pattern via polymorphism
interface SortStrategy { void sort(int[] arr); }
class QuickSort implements SortStrategy { /* ... */ }
class MergeSort implements SortStrategy { /* ... */ }`
        },
        links:[
          {label:'Polymorphism — Oracle', url:'https://docs.oracle.com/javase/tutorial/java/IandI/polymorphism.html'}
        ],
        questions:['What is dynamic method dispatch?','Can you override static methods?','How does polymorphism relate to SOLID?']
      },
      {
        name:'Abstract Class vs Interface', tag:'oop', tagLabel:'OOP',
        summary:'Abstract classes share state and code; interfaces define contracts. Since Java 8, interfaces can have default methods.',
        short:'Abstract classes can have state (fields), constructors, and concrete methods — use for "is-a" with shared code. Interfaces define contracts (what, not how) — use for "can-do" capabilities. Since Java 8, interfaces support default and static methods.',
        medium:{
          theory:'A class extends one abstract class but implements multiple interfaces. Abstract classes control visibility of members; interface fields are implicitly public static final. Default methods in interfaces enable API evolution without breaking implementations. Since Java 9, interfaces can have private methods. Choose abstract class for shared state/code; interface for capability contracts.',
          tradeoffs:'Abstract class: shared state, constructors, single inheritance limit. Interface: multiple implementation, no state (only constants), API evolution via defaults. Modern Java favors interfaces with defaults for flexibility.',
          code:`// Abstract class — shared state and code
abstract class Shape {
    protected String color;           // state
    Shape(String color) { this.color = color; }
    abstract double area();           // must implement
    void display() {                  // shared code
        System.out.println(color + " shape, area=" + area());
    }
}

// Interface — capability contract
interface Serializable { }            // marker interface
interface Comparable<T> {
    int compareTo(T o);              // must implement
}

// Interface with default method (Java 8+)
interface Logger {
    void log(String msg);
    default void info(String msg) { log("[INFO] " + msg); }
    static Logger noop() { return msg -> {}; }
}

// Class: extends one, implements many
class Circle extends Shape implements Comparable<Circle>, Logger {
    double radius;
    Circle(String c, double r) { super(c); radius = r; }
    double area() { return Math.PI * radius * radius; }
    public int compareTo(Circle o) { return Double.compare(radius, o.radius); }
    public void log(String msg) { System.out.println(msg); }
}`
        },
        links:[
          {label:'Abstract Classes — Oracle', url:'https://docs.oracle.com/javase/tutorial/java/IandI/abstract.html'},
          {label:'Interfaces — Oracle', url:'https://docs.oracle.com/javase/tutorial/java/IandI/createinterface.html'}
        ],
        questions:['Can interfaces have constructors?','What are default methods for?','When to use abstract class over interface?']
      },
      {
        name:'Composition over Inheritance', tag:'oop', tagLabel:'OOP',
        summary:'Favor "has-a" relationships (composition) over "is-a" (inheritance) for flexible, loosely-coupled designs.',
        short:'Composition means an object contains other objects and delegates behavior to them, rather than inheriting. This avoids tight coupling, fragile base classes, and the single-inheritance limitation.',
        medium:{
          theory:'Composition: the outer object owns inner objects and delegates work to them. Changing behavior means swapping components at runtime. Inheritance: subclasses are permanently bound to the parent\'s implementation. The Gang of Four\'s first principle: "Program to an interface, not an implementation" — favor composition through interfaces.',
          tradeoffs:'Composition: flexible, runtime-swappable, testable (mock components). Inheritance: simpler for true "is-a" relationships, enables polymorphism without delegation boilerplate. Use inheritance only when there is genuine type hierarchy; use composition everywhere else.',
          code:`// BAD: Inheritance — rigid, tight coupling
class InstrumentedHashSet<E> extends HashSet<E> {
    private int count = 0;
    @Override public boolean add(E e) { count++; return super.add(e); }
    @Override public boolean addAll(Collection<? extends E> c) {
        count += c.size();  // BUG: addAll calls add internally, double-counting!
        return super.addAll(c);
    }
}

// GOOD: Composition — flexible, correct
class InstrumentedSet<E> implements Set<E> {
    private final Set<E> delegate;  // composition
    private int count = 0;
    
    InstrumentedSet(Set<E> delegate) { this.delegate = delegate; }
    
    @Override public boolean add(E e) { count++; return delegate.add(e); }
    @Override public boolean addAll(Collection<? extends E> c) {
        count += c.size();
        return delegate.addAll(c);  // no double-counting
    }
    public int getCount() { return count; }
    // ... delegate all other Set methods
}`
        },
        links:[
          {label:'Effective Java Item 18', url:'https://www.oreilly.com/library/view/effective-java/9780134686097/'}
        ],
        questions:['What is the fragile base class problem?','When is inheritance still appropriate?','What is delegation?']
      },
      {
        name:'SOLID: Single Responsibility', tag:'oop', tagLabel:'SOLID',
        summary:'A class should have one, and only one, reason to change — each class handles exactly one concern.',
        short:'SRP states that a class should have a single responsibility. A "reason to change" maps to a stakeholder or concern. Classes with multiple responsibilities change more often and are harder to test and reuse.',
        medium:{
          theory:'SRP is about cohesion: a class with one responsibility has high cohesion. Violations manifest as "God Objects" that handle persistence, validation, business logic, and formatting. Refactoring: extract separate classes for each concern. SRP is closely related to separation of concerns and the Unix philosophy ("do one thing well").',
          tradeoffs:'Too few responsibilities → class explosion and over-abstraction. Too many → brittle, untestable monoliths. Aim for classes that are cohesive and independently changeable. A class with one reason to change is easy to understand, test, and replace.',
          code:`// VIOLATION: one class, multiple responsibilities
class Employee {
    String name;
    double salary;
    
    double calculatePay() { /* business logic */ }
    void saveToDatabase() { /* persistence */ }    // WRONG
    String toHtml() { /* formatting */ }            // WRONG
}

// SRP: each class has one responsibility
class Employee {
    String name;
    double salary;
    double calculatePay() { /* business logic only */ }
}

class EmployeeRepository {
    void save(Employee emp) { /* persistence only */ }
}

class EmployeeReport {
    String toHtml(Employee emp) { /* formatting only */ }
}`
        },
        links:[
          {label:'SRP — Robert C. Martin', url:'https://blog.cleancoder.com/uncle-bob/2014/05/08/SingleReponsibilityPrinciple.html'}
        ],
        questions:['What is a "reason to change"?','How is SRP related to cohesion?','When is a class too small?']
      },
      {
        name:'SOLID: Open/Closed Principle', tag:'oop', tagLabel:'SOLID',
        summary:'Software entities should be open for extension but closed for modification.',
        short:'OCP means you can add new behavior without changing existing code. Achieved through abstraction: define interfaces/abstract classes and add new implementations for new requirements.',
        medium:{
          theory:'Violations: switch/if-else chains that grow with each new type. Fix: replace conditionals with polymorphism — strategy pattern, template method, or plugin architecture. New behavior = new class implementing an interface. Existing code stays untouched and untested.',
          tradeoffs:'Over-application leads to excessive abstractions for simple cases. Use OCP where extension points are known or likely. Not every class needs to be extensible — YAGNI applies.',
          code:`// VIOLATION: modifying for each new discount type
class PriceCalculator {
    double calculate(Order order) {
        if (order.type == REGULAR) return order.total;
        if (order.type == CHRISTMAS) return order.total * 0.9;
        if (order.type == BLACK_FRIDAY) return order.total * 0.7;
        // new type = modify this class!
    }
}

// OCP: extend via new implementations
interface Discount { double apply(double total); }
class NoDiscount implements Discount { public double apply(double t) { return t; } }
class ChristmasDiscount implements Discount { public double apply(double t) { return t * 0.9; } }

class PriceCalculator {
    double calculate(Order order, Discount discount) {
        return discount.apply(order.total);
    }
}
// New discount? Add a new class. No modification needed.`
        },
        links:[
          {label:'OCP — Martin Fowler', url:'https://martinfowler.com/bliki/DesignPrinciples.html'}
        ],
        questions:['How does Strategy pattern enforce OCP?','When is OCP overkill?','How to refactor switch to polymorphism?']
      },
      {
        name:'SOLID: Liskov Substitution', tag:'oop', tagLabel:'SOLID',
        summary:'Subtypes must be substitutable for their base types without altering program correctness.',
        short:'LSP states that if S is a subtype of T, then objects of type T can be replaced with objects of type S without breaking the program. Subclasses must honor the contract (preconditions, postconditions, invariants) of their parent.',
        medium:{
          theory:'Violations: subclass throws UnsupportedOperationException for inherited methods, weakens preconditions, strengthens postconditions, or changes invariants. Classic example: Square extends Rectangle — setWidth() on a Square also changes height, breaking Rectangle\'s contract. Fix: model them as separate types or use immutable shapes.',
          tradeoffs:'LSP forces careful contract design. Overly strict interpretation can limit useful subclassing. The key test: can a client use the subclass through the parent\'s interface without surprises?',
          code:`// VIOLATION: Square extends Rectangle
class Rectangle {
    int width, height;
    void setWidth(int w) { width = w; }
    void setHeight(int h) { height = h; }
    int area() { return width * height; }
}

class Square extends Rectangle {
    @Override void setWidth(int w) { width = w; height = w; }   // breaks Rectangle contract
    @Override void setHeight(int h) { height = h; width = h; }  // breaks Rectangle contract
}

// Client expects Rectangle behavior:
void testArea(Rectangle r) {
    r.setWidth(5);
    r.setHeight(4);
    assert r.area() == 20;  // FAILS for Square (area=16)
}

// FIX: separate types
interface Shape { int area(); }
class Rectangle implements Shape { /* width, height */ }
class Square implements Shape { /* side */ }`
        },
        links:[
          {label:'LSP — Barbara Liskov', url:'https://en.wikipedia.org/wiki/Liskov_substitution_principle'}
        ],
        questions:['What are pre/postconditions?','Why does Square violate LSP?','How to test for LSP compliance?']
      },
      {
        name:'SOLID: Interface Segregation & Dependency Inversion', tag:'oop', tagLabel:'SOLID',
        summary:'ISP: small, focused interfaces. DIP: depend on abstractions, not concrete implementations.',
        short:'ISP says clients should not depend on methods they do not use — split fat interfaces into smaller ones. DIP says high-level modules should depend on abstractions, not low-level details.',
        medium:{
          theory:'ISP violation: a class implements a large interface but only uses part of it, throwing UnsupportedOperationException for unused methods. Fix: split into focused interfaces. DIP violation: business logic directly instantiates database or HTTP classes. Fix: depend on interfaces and inject implementations (DI frameworks like Spring automate this).',
          tradeoffs:'ISP: too many tiny interfaces create navigation overhead. Find the right granularity based on client needs. DIP: every abstraction has a cost — avoid for stable, unlikely-to-change dependencies (e.g., String, List).',
          code:`// ISP VIOLATION: fat interface
interface Worker {
    void work();
    void eat();
}
class Robot implements Worker {
    public void work() { /* ... */ }
    public void eat() { throw new UnsupportedOperationException(); }  // ISP violation
}

// ISP FIX: split interfaces
interface Workable { void work(); }
interface Feedable { void eat(); }
class Human implements Workable, Feedable { /* ... */ }
class Robot implements Workable { /* ... */ }

// DIP VIOLATION: high-level depends on low-level
class OrderService {
    private final MySQLDatabase db = new MySQLDatabase();  // concrete dependency
}

// DIP FIX: depend on abstraction
interface Database { void save(Order o); }
class OrderService {
    private final Database db;  // abstraction
    OrderService(Database db) { this.db = db; }  // injected
}`
        },
        links:[
          {label:'SOLID Principles', url:'https://en.wikipedia.org/wiki/SOLID'}
        ],
        questions:['How does ISP relate to SRP?','What is the difference between DIP and DI?','When is DIP overkill?']
      },
      {
        name:'SOLID Principles Overview', tag:'oop', tagLabel:'SOLID',
        summary:'Five principles for maintainable OOP: SRP, OCP, LSP, ISP, DIP — together they reduce coupling and increase cohesion.',
        short:'SOLID principles guide object-oriented design toward maintainability and flexibility. They reduce coupling between modules, make code easier to test, extend, and refactor. They work best together but require judgment to avoid over-engineering.',
        medium:{
          theory:'SRP: single reason to change. OCP: extend without modifying. LSP: subtypes honor parent contracts. ISP: no forced dependencies on unused methods. DIP: program to abstractions. Together they produce systems where adding features means adding new classes, not modifying existing ones. Anti-patterns that contradict SOLID: God Object, Feature Envy, Shotgun Surgery, Magic Numbers.',
          tradeoffs:'Following all SOLID simultaneously is ideal but costly for small projects. Over-application creates abstraction layers without benefit. Apply SOLID where code changes frequently or teams are large. For prototypes and scripts, KISS may trump SOLID.',
          code:`// SOLID checklist for a class:
// SRP: Does this class have ONE reason to change?
// OCP: Can I add new behavior without modifying it?
// LSP: Can subclasses replace it without surprises?
// ISP: Are all interface methods used by all clients?
// DIP: Does it depend on abstractions, not concretes?

// SOLID helps testing:
// SRP → small classes → focused unit tests
// DIP → mock interfaces → isolated tests
// OCP → add test cases without modifying test infrastructure`
        },
        links:[
          {label:'SOLID — Robert C. Martin', url:'https://blog.cleancoder.com/uncle-bob/2020/10/18/Solid-Relevance.html'},
          {label:'Clean Architecture', url:'https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html'}
        ],
        questions:['Can you apply all SOLID at once?','What anti-patterns violate SOLID?','How does SOLID help with testing?']
      },
      {
        name:'Law of Demeter', tag:'oop', tagLabel:'OOP',
        summary:'Principle of least knowledge: only talk to immediate friends — avoid chaining method calls through strangers.',
        short:'The Law of Demeter says an object should only call methods on: itself, its parameters, objects it creates, and its direct fields. Avoid a.getB().getC().doSomething() — it couples to the internal structure of B.',
        medium:{
          theory:'Violations create tight coupling across the object graph: changes to B\'s structure ripple through all callers. Fix: add delegate methods so A calls a.doSomething() and A internally delegates to B. Trade-off: can create many pass-through methods ("middleman" pattern). Use judgment — some chains are natural (builder patterns, Stream API).',
          tradeoffs:'Strict LoD reduces coupling but may create wrapper methods. Modern languages provide null-safe navigation (?.) which makes chains safer but doesn\'t solve the coupling problem. Builder patterns and fluent APIs intentionally violate LoD for readability.',
          code:`// VIOLATION: reaching through objects
double price = order.getCustomer()
                    .getAddress()
                    .getCountry()
                    .getTaxRate() * order.getTotal();

// LoD FIX: delegate
class Order {
    double calculateTax() {
        return customer.getTaxRate() * total;
    }
}
class Customer {
    double getTaxRate() {
        return address.getCountry().getTaxRate();
    }
}

double price = order.calculateTax();  // one dot

// Acceptable violation: builder/fluent API
StringBuilder sb = new StringBuilder().append("a").append("b");`
        },
        links:[
          {label:'Law of Demeter', url:'https://en.wikipedia.org/wiki/Law_of_Demeter'}
        ],
        questions:['What counts as an "immediate friend"?','When is LoD too strict?','How does LoD relate to encapsulation?']
      },
      {
        name:'Delegation and God Object Refactoring', tag:'oop', tagLabel:'OOP',
        summary:'Delegation forwards work to helper objects. God Objects violate SRP — refactor by extracting responsibilities into focused classes.',
        short:'Delegation is when an object passes work to a helper rather than doing it itself (composition in action). A God Object handles too many responsibilities — refactor by extracting each concern into its own class with delegation.',
        medium:{
          theory:'Delegation pattern: the outer object exposes a method but forwards the call to a delegate. This enables runtime behavior swapping. God Object refactoring steps: 1) Identify distinct responsibilities, 2) Extract each into a separate class, 3) Replace inline code with delegation calls, 4) Consider introducing interfaces for testability.',
          tradeoffs:'Delegation adds a layer of indirection but enables flexibility and testing. God Object refactoring can be risky for large legacy systems — use the Strangler Fig pattern for incremental replacement.',
          code:`// Delegation pattern
class Printer {
    private final Formatter formatter;
    Printer(Formatter formatter) { this.formatter = formatter; }
    void print(Document doc) {
        String formatted = formatter.format(doc);  // delegate
        System.out.println(formatted);
    }
}

// God Object refactoring
// BEFORE: one class does everything
class UserManager {
    void validate(User u) { /* 200 lines */ }
    void saveToDb(User u) { /* 200 lines */ }
    void sendEmail(User u) { /* 200 lines */ }
    void generateReport() { /* 200 lines */ }
}

// AFTER: each responsibility in its own class
class UserValidator { void validate(User u) { /* ... */ } }
class UserRepository { void save(User u) { /* ... */ } }
class EmailService { void sendWelcome(User u) { /* ... */ } }
class ReportGenerator { String generate() { /* ... */ } }`
        },
        links:[
          {label:'Delegation Pattern', url:'https://en.wikipedia.org/wiki/Delegation_pattern'},
          {label:'God Object — Refactoring Guru', url:'https://refactoring.guru/smells/large-class'}
        ],
        questions:['What is the Strangler Fig pattern?','How does delegation differ from inheritance?','What are signs of a God Object?']
      },
      {
        name:'Exception Hierarchy and Types', tag:'basics', tagLabel:'Exceptions',
        summary:'Throwable → Error (system failures) and Exception (app-level). Exception splits into checked (compile-time) and unchecked (RuntimeException).',
        short:'Java exceptions form a hierarchy rooted at Throwable. Error represents JVM-level failures (OutOfMemoryError, StackOverflowError) that applications should not catch. Exception represents application-level problems. RuntimeException and its subclasses are unchecked; all others are checked.',
        medium:{
          theory:'Checked exceptions (IOException, SQLException) must be declared in throws or caught — the compiler enforces this. Unchecked exceptions (NullPointerException, IllegalArgumentException) indicate programming errors and are not enforced. The hierarchy: Throwable → Error | Exception → RuntimeException. Since Java 7, multi-catch allows catching multiple exception types in one block.',
          tradeoffs:'Checked exceptions force callers to handle errors but clutter APIs and are controversial. Modern Java libraries and frameworks favor unchecked exceptions. Use checked exceptions for recoverable conditions callers should handle; unchecked for programming errors.',
          code:`// Exception hierarchy
// Throwable
// ├── Error (don't catch)
// │   ├── OutOfMemoryError
// │   ├── StackOverflowError
// │   └── LinkageError
// └── Exception
//     ├── IOException (checked)
//     ├── SQLException (checked)
//     └── RuntimeException (unchecked)
//         ├── NullPointerException
//         ├── IllegalArgumentException
//         └── IndexOutOfBoundsException

// Checked — must handle or declare
void readFile() throws IOException {
    Files.readString(Path.of("data.txt"));
}

// Unchecked — no enforcement
void validate(int age) {
    if (age < 0) throw new IllegalArgumentException("negative age");
}`
        },
        links:[
          {label:'Exception Hierarchy — Oracle', url:'https://docs.oracle.com/javase/tutorial/essential/exceptions/catchOrDeclare.html'}
        ],
        questions:['What is at the top of the hierarchy?','Why are some exceptions checked?','When should you catch Error?']
      },
      {
        name:'Checked vs Unchecked Exceptions', tag:'basics', tagLabel:'Exceptions',
        summary:'Checked: compiler-enforced handling (IOException). Unchecked: runtime errors from programming mistakes (NullPointerException).',
        short:'Checked exceptions extend Exception (not RuntimeException) and must be caught or declared with throws. Unchecked exceptions extend RuntimeException and represent bugs — no compiler enforcement.',
        medium:{
          theory:'Checked exceptions signal recoverable conditions the caller should handle (file not found, network timeout). Unchecked exceptions signal programming errors (null reference, bad argument, illegal state). The debate: checked exceptions ensure error handling but make APIs rigid and interact poorly with lambdas (which cannot throw checked exceptions). Modern consensus leans toward unchecked exceptions for most cases.',
          tradeoffs:'Checked: explicit contracts, forced handling, but verbose and lambda-unfriendly. Unchecked: clean APIs, lambda-compatible, but callers might forget to handle. Best practice: use checked for truly recoverable errors at API boundaries; unchecked for everything else.',
          code:`// Checked exception — must handle
try {
    connection = DriverManager.getConnection(url);
} catch (SQLException e) {
    logger.error("DB connection failed", e);
    throw new ServiceException("Cannot connect", e);
}

// Unchecked — no handling required
public User findById(long id) {
    if (id <= 0) throw new IllegalArgumentException("id must be positive");
    return repository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("User", id));
}

// Checked exceptions in lambdas — awkward
list.stream()
    .map(url -> {
        try { return new URL(url); }
        catch (MalformedURLException e) { throw new RuntimeException(e); }  // wrapper needed
    });`
        },
        links:[
          {label:'Unchecked Exceptions — Oracle', url:'https://docs.oracle.com/javase/tutorial/essential/exceptions/runtime.html'}
        ],
        questions:['Why do lambdas struggle with checked exceptions?','Should new exceptions be checked or unchecked?','What is the controversy around checked exceptions?']
      },
      {
        name:'try-with-resources', tag:'basics', tagLabel:'Exceptions',
        summary:'Automatic resource management — resources implementing AutoCloseable are closed automatically, even on exceptions.',
        short:'try-with-resources (Java 7+) automatically closes resources declared in the try parentheses. Resources must implement AutoCloseable. This replaces verbose try-finally patterns and prevents resource leaks.',
        medium:{
          theory:'Resources are closed in reverse order of declaration. If both the try block and close() throw, the close() exception is added as a suppressed exception to the primary one. AutoCloseable (Java 7) is the base interface; Closeable extends it with IOException-only close(). Since Java 9, effectively final variables can be used in try-with-resources without re-declaration.',
          tradeoffs:'Always prefer try-with-resources over manual try-finally for closeable resources. It is shorter, safer, and handles suppressed exceptions correctly. Limitation: resources must be declared at the try statement (or effectively final since Java 9).',
          code:`// try-with-resources — automatic close
try (var reader = Files.newBufferedReader(path);
     var writer = Files.newBufferedWriter(outPath)) {
    writer.write(reader.readLine());
} // reader and writer auto-closed, even on exception

// Java 9: effectively final resources
BufferedReader reader = Files.newBufferedReader(path);
try (reader) {  // no re-declaration needed
    reader.readLine();
}

// Suppressed exceptions
try (var resource = new MyResource()) {
    resource.doWork();   // throws WorkException
} // resource.close() throws CloseException
  // CloseException is suppressed, accessible via:
  // workException.getSuppressed()

// vs old try-finally (error-prone)
BufferedReader r = null;
try {
    r = new BufferedReader(new FileReader("f.txt"));
    // use r
} finally {
    if (r != null) r.close();  // can throw, masking original exception
}`
        },
        links:[
          {label:'try-with-resources — Oracle', url:'https://docs.oracle.com/javase/tutorial/essential/exceptions/tryResourceClose.html'}
        ],
        questions:['What is AutoCloseable?','How are suppressed exceptions handled?','Can you use existing variables in try-with-resources?']
      },
      {
        name:'Custom Exceptions', tag:'basics', tagLabel:'Exceptions',
        summary:'Create custom exceptions when standard ones do not convey the domain-specific error — extend RuntimeException for most cases.',
        short:'Custom exceptions improve error semantics for your domain. Extend RuntimeException for programming/API errors; extend Exception only if callers must handle it. Always provide meaningful messages and preserve the cause chain.',
        medium:{
          theory:'When to create: when no standard exception fits the semantics (e.g., OrderAlreadyShippedException), when you need additional context fields, or when you want a specific catch target. Always pass the cause to the super constructor for stack trace continuity. Include domain-specific fields (entity ID, error code) for programmatic handling.',
          tradeoffs:'Too many custom exceptions create a parallel hierarchy that is hard to maintain. Start with a base exception per module and add specific ones only when callers need distinct handling. Extend RuntimeException unless checked behavior is explicitly required.',
          code:`// Custom exception with context
public class EntityNotFoundException extends RuntimeException {
    private final String entityType;
    private final Object entityId;
    
    public EntityNotFoundException(String type, Object id) {
        super(type + " not found: " + id);
        this.entityType = type;
        this.entityId = id;
    }
    
    public EntityNotFoundException(String type, Object id, Throwable cause) {
        super(type + " not found: " + id, cause);  // preserve cause chain
        this.entityType = type;
        this.entityId = id;
    }
    
    public String getEntityType() { return entityType; }
    public Object getEntityId() { return entityId; }
}

// Usage
User user = repo.findById(id)
    .orElseThrow(() -> new EntityNotFoundException("User", id));`
        },
        links:[
          {label:'Creating Exception Classes — Oracle', url:'https://docs.oracle.com/javase/tutorial/essential/exceptions/creating.html'}
        ],
        questions:['When to extend RuntimeException vs Exception?','What fields should custom exceptions have?','How to preserve the cause chain?']
      },
      {
        name:'Exception Handling Best Practices', tag:'basics', tagLabel:'Exceptions',
        summary:'Never swallow exceptions, use proper logging, preserve cause chains, catch specific types, and use multi-catch.',
        short:'Best practices: never use empty catch blocks (swallows errors silently), always log with the full stack trace, preserve exception chaining with cause constructors, catch the most specific exception first, and use multi-catch (Java 7+) to reduce duplication.',
        medium:{
          theory:'Swallowed exceptions hide bugs — at minimum log them. Stack traces show the call chain leading to the error — essential for debugging. printStackTrace() goes to stderr and is not structured; use a logging framework (SLF4J/Logback). Exception wrapping: convert checked to unchecked with context. Catch ordering: most specific first, compiler enforces this. Multi-catch: catch (IOException | SQLException e) reduces duplicate handling code.',
          tradeoffs:'Logging every exception at ERROR level creates noise — use appropriate levels (WARN for recoverable, ERROR for critical). Rethrowing with added context preserves debuggability while abstracting implementation details.',
          code:`// BAD: swallowed exception
try { process(data); }
catch (Exception e) {}  // BUG: error silently ignored

// BAD: printStackTrace (unstructured, stderr)
catch (Exception e) { e.printStackTrace(); }

// GOOD: proper logging with cause
catch (SQLException e) {
    log.error("Failed to save order {}: {}", order.getId(), e.getMessage(), e);
    throw new ServiceException("Order save failed", e);  // wrap and rethrow
}

// Multi-catch (Java 7+)
try {
    processFile(path);
} catch (IOException | ParseException e) {
    log.warn("Processing failed: {}", e.getMessage(), e);
}

// Catch ordering: most specific first
try {
    riskyOperation();
} catch (FileNotFoundException e) {     // specific first
    handleMissing(e);
} catch (IOException e) {               // broader second
    handleIO(e);
} catch (Exception e) {                 // catch-all last
    handleUnexpected(e);
}`
        },
        links:[
          {label:'Exception Best Practices', url:'https://docs.oracle.com/javase/tutorial/essential/exceptions/'}
        ],
        questions:['Why never swallow exceptions?','What is exception wrapping?','How does multi-catch reduce code?']
      },
      {
        name:'throws, Re-throwing, and Suppressed Exceptions', tag:'basics', tagLabel:'Exceptions',
        summary:'throws declares checked exceptions; re-throwing propagates errors; suppressed exceptions preserve secondary failures.',
        short:'The throws keyword declares which checked exceptions a method may throw. Re-throwing (throw e) propagates an exception after partial handling. Suppressed exceptions (Java 7+) capture secondary exceptions that occur during cleanup (e.g., close() in try-with-resources).',
        medium:{
          theory:'throws is part of the method signature — callers must handle or further declare checked exceptions. You can throw a checked exception from a method only if it is declared in throws (or use sneaky throws via generics — discouraged). Re-throwing: catch, log/wrap, then throw. Suppressed exceptions: when try block and close() both throw, close() exception is attached to the primary via addSuppressed().',
          tradeoffs:'Over-declaring throws creates ripple effects through the call chain. Under-declaring (catching and ignoring) hides errors. Suppressed exceptions are critical for diagnosing resource cleanup failures — always check getSuppressed().',
          code:`// throws declaration
void loadConfig(String path) throws IOException, ConfigException {
    String content = Files.readString(Path.of(path));
    if (content.isEmpty()) throw new ConfigException("empty config");
}

// Re-throwing with context
try {
    service.process(order);
} catch (ValidationException e) {
    log.warn("Validation failed for order {}", order.getId(), e);
    throw e;  // re-throw same exception
}

// Wrapping checked as unchecked
try {
    Files.readAllBytes(path);
} catch (IOException e) {
    throw new UncheckedIOException(e);  // standard wrapper
}

// Suppressed exceptions
try (var resource = new MyResource()) {
    resource.process();     // throws PrimaryException
} // resource.close() throws CleanupException
  // Catch PrimaryException, check getSuppressed() for CleanupException`
        },
        links:[
          {label:'Throwable.getSuppressed — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Throwable.html#getSuppressed()'}
        ],
        questions:['Can you throw checked without throws?','What are suppressed exceptions?','How to properly re-throw?']
      },
      {
        name:'Arrays in Java', tag:'basics', tagLabel:'Collections',
        summary:'Fixed-size, type-safe, contiguous memory — the most efficient data structure for indexed access.',
        short:'Arrays store a fixed number of elements of the same type in contiguous memory. Access is O(1) by index. Java arrays are objects (have .length property), are covariant (String[] is Object[]), and support primitives natively.',
        medium:{
          theory:'Arrays are created with new Type[size] and cannot be resized. They are covariant: assigning String[] to Object[] compiles but causes ArrayStoreException at runtime on incompatible writes. Arrays.sort() uses dual-pivot quicksort for primitives and TimSort for objects. Arrays.asList() creates a fixed-size list backed by the array. For dynamic sizing, use ArrayList.',
          tradeoffs:'Pros: fastest indexed access, minimal memory overhead, primitive support. Cons: fixed size, no built-in add/remove, covariance is a type-safety trap. Use arrays for performance-critical code with known sizes; use collections for flexibility.',
          code:`// Creation and access
int[] nums = new int[10];
nums[0] = 42;
int len = nums.length;  // property, not method

// Array initializer
String[] names = {"Alice", "Bob", "Charlie"};

// Multidimensional (array of arrays)
int[][] matrix = new int[3][3];
matrix[0][1] = 5;

// Covariance trap
Object[] objects = new String[5];
// objects[0] = 42;  // ArrayStoreException at runtime!

// Utility methods
Arrays.sort(nums);
Arrays.binarySearch(nums, 42);
int[] copy = Arrays.copyOf(nums, 20);  // resize by copy
List<Integer> list = Arrays.asList(1, 2, 3);  // fixed-size!

// Parallel sort for large arrays
Arrays.parallelSort(bigArray);`
        },
        links:[
          {label:'Arrays — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Arrays.html'}
        ],
        questions:['What is array covariance?','How to resize an array?','What sorting algorithm does Arrays.sort use?']
      },
      {
        name:'Collection Framework Overview', tag:'basics', tagLabel:'Collections',
        summary:'Collection (List, Set, Queue) and Map interfaces form the core of Java\'s data structure library.',
        short:'The Collection Framework provides interfaces and implementations for storing groups of objects. Main interfaces: List (ordered, allows duplicates), Set (unique elements), Queue (FIFO/priority), Map (key-value pairs, not a Collection).',
        medium:{
          theory:'Hierarchy: Iterable → Collection → List | Set | Queue. Map is separate (key-value). List: ArrayList, LinkedList, Vector. Set: HashSet, LinkedHashSet, TreeSet. Queue: PriorityQueue, ArrayDeque, LinkedList. Map: HashMap, LinkedHashMap, TreeMap, ConcurrentHashMap. Collections utility class provides sorting, searching, synchronization, and unmodifiable wrappers.',
          tradeoffs:'Choose by access pattern: random access → ArrayList, frequent insert/remove at ends → LinkedList/ArrayDeque, uniqueness → Set, key-value lookup → Map, ordering → TreeSet/TreeMap, thread-safety → concurrent collections.',
          code:`// List — ordered, allows duplicates
List<String> list = new ArrayList<>(List.of("a", "b", "a"));

// Set — unique elements
Set<String> set = new HashSet<>(Set.of("a", "b"));  // "a" appears once

// Queue — FIFO
Queue<String> queue = new ArrayDeque<>();
queue.add("first");
String head = queue.poll();  // "first"

// Map — key-value pairs
Map<String, Integer> map = new HashMap<>();
map.put("Alice", 100);
int score = map.getOrDefault("Bob", 0);

// Collection operations
list.addAll(set);          // add all elements
list.removeAll(set);       // remove all
list.retainAll(set);       // intersection
Collections.sort(list);    // sorting
Collections.unmodifiableList(list);  // read-only view`
        },
        links:[
          {label:'Collections Framework — Oracle', url:'https://docs.oracle.com/javase/tutorial/collections/'}
        ],
        questions:['What interfaces extend Collection?','Why is Map not a Collection?','What is the Collections utility class?']
      },
      {
        name:'ArrayList vs LinkedList', tag:'basics', tagLabel:'Collections',
        summary:'ArrayList: O(1) random access, O(n) middle insert. LinkedList: O(n) random access, O(1) head/tail insert. ArrayList wins in most scenarios.',
        short:'ArrayList wraps a resizable array — fast random access (O(1) get), O(n) insert/remove in middle. LinkedList is a doubly-linked list — O(n) random access but O(1) add/remove at head/tail. ArrayList has better cache locality and is preferred in almost all cases.',
        medium:{
          theory:'ArrayList: internal Object[] grows by 50% when full (amortized O(1) add at end). get(i) is O(1). Insert at index i: O(n) due to arraycopy. LinkedList: each element is a Node with prev/next pointers. get(i): O(n) traversal. addFirst/addLast: O(1). Cache performance: ArrayList is contiguous in memory (CPU cache-friendly); LinkedList nodes are scattered.',
          tradeoffs:'ArrayList wins for virtually all use cases due to cache locality. LinkedList only makes sense for queue/deque operations (use ArrayDeque instead) or when you need O(1) remove during iteration with ListIterator. The common advice: never use LinkedList.',
          code:`// ArrayList — fast random access
List<String> arrayList = new ArrayList<>();
arrayList.add("a");           // amortized O(1)
arrayList.get(100);           // O(1)
arrayList.add(50, "x");       // O(n) — shifts elements

// LinkedList — slow random access
List<String> linkedList = new LinkedList<>();
linkedList.add("a");          // O(1) at end
linkedList.get(100);          // O(n) — traverses nodes!
linkedList.addFirst("x");     // O(1)

// Use ArrayDeque instead of LinkedList for queue/stack
Deque<String> deque = new ArrayDeque<>();
deque.addFirst("a");          // O(1)
deque.pollLast();             // O(1)

// Benchmark: iterating 1M elements
// ArrayList: ~2ms (cache-friendly)
// LinkedList: ~20ms (pointer chasing)`
        },
        links:[
          {label:'ArrayList — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/ArrayList.html'}
        ],
        questions:['Why is ArrayList faster in practice?','When would you use LinkedList?','How does ArrayList resize?']
      },
      {
        name:'Set Implementations', tag:'basics', tagLabel:'Collections',
        summary:'HashSet: O(1) unordered. LinkedHashSet: O(1) insertion-ordered. TreeSet: O(log n) sorted.',
        short:'HashSet uses HashMap internally — O(1) add/remove/contains, no ordering. LinkedHashSet maintains insertion order via a linked list. TreeSet uses TreeMap (red-black tree) — O(log n) operations, elements are sorted by natural order or Comparator.',
        medium:{
          theory:'HashSet: delegates to HashMap with a dummy value. Elements must implement equals/hashCode. LinkedHashSet: extends HashSet, adds a doubly-linked list for insertion order. TreeSet: NavigableSet backed by TreeMap, supports headSet/tailSet/subSet range views. For enums, use EnumSet (bit-vector, fastest Set implementation).',
          tradeoffs:'HashSet: fastest general-purpose Set. LinkedHashSet: when insertion order matters (e.g., dedup preserving order). TreeSet: when sorted order is needed. EnumSet: always prefer for enum types (bitmask performance).',
          code:`// HashSet — unordered, O(1)
Set<String> hashSet = new HashSet<>();
hashSet.add("b"); hashSet.add("a"); hashSet.add("c");
// iteration order: unpredictable

// LinkedHashSet — insertion order
Set<String> linkedSet = new LinkedHashSet<>();
linkedSet.add("b"); linkedSet.add("a"); linkedSet.add("c");
// iteration order: b, a, c

// TreeSet — sorted order
Set<String> treeSet = new TreeSet<>();
treeSet.add("b"); treeSet.add("a"); treeSet.add("c");
// iteration order: a, b, c
treeSet.headSet("b");  // ["a"]
treeSet.tailSet("b");  // ["b", "c"]

// EnumSet — fastest for enums
enum Day { MON, TUE, WED, THU, FRI, SAT, SUN }
Set<Day> workdays = EnumSet.range(Day.MON, Day.FRI);`
        },
        links:[
          {label:'Set Interface — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Set.html'}
        ],
        questions:['How does HashSet work internally?','When to use EnumSet?','What is a NavigableSet?']
      },
      {
        name:'Map Implementations', tag:'basics', tagLabel:'Collections',
        summary:'HashMap: O(1) unordered. LinkedHashMap: insertion/access order. TreeMap: O(log n) sorted keys. ConcurrentHashMap: thread-safe.',
        short:'HashMap provides O(1) get/put with no ordering. LinkedHashMap maintains insertion order (or access order for LRU caches). TreeMap stores entries sorted by key (O(log n)). ConcurrentHashMap provides thread-safe O(1) operations without locking the entire map.',
        medium:{
          theory:'HashMap: array of buckets, hash-based indexing, handles collisions with linked lists → trees (Java 8+). LinkedHashMap: adds doubly-linked list for ordering — accessOrder=true enables LRU cache. TreeMap: red-black tree, supports subMap/headMap/tailMap range queries. WeakHashMap: keys are weak references — entries removed when keys are no longer strongly reachable (useful for caches). EnumMap: fastest Map for enum keys.',
          tradeoffs:'HashMap: general-purpose, fastest for unordered key-value. LinkedHashMap: ordering needed, LRU caches. TreeMap: sorted keys, range queries. ConcurrentHashMap: multi-threaded access. WeakHashMap: auto-evicting caches. EnumMap: enum keys.',
          code:`// HashMap — O(1), unordered
Map<String, Integer> map = new HashMap<>();
map.put("alice", 100);
map.getOrDefault("bob", 0);  // 0

// LinkedHashMap — insertion order (or access order for LRU)
Map<String, Integer> lruCache = new LinkedHashMap<>(16, 0.75f, true);
// accessOrder=true: recently accessed entries move to end

// TreeMap — sorted by key
Map<String, Integer> sorted = new TreeMap<>();
sorted.put("b", 2); sorted.put("a", 1); sorted.put("c", 3);
sorted.firstKey();    // "a"
sorted.subMap("a", "c");  // {a=1, b=2}

// ConcurrentHashMap — thread-safe
Map<String, Integer> concurrent = new ConcurrentHashMap<>();
concurrent.computeIfAbsent("key", k -> expensiveComputation(k));

// WeakHashMap — auto-evicting cache
Map<Key, Value> cache = new WeakHashMap<>();`
        },
        links:[
          {label:'Map Interface — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Map.html'}
        ],
        questions:['How to implement an LRU cache?','When to use TreeMap?','What is WeakHashMap for?']
      },
      {
        name:'Concurrent Collections', tag:'basics', tagLabel:'Collections',
        summary:'ConcurrentHashMap, CopyOnWriteArrayList, and synchronized wrappers — thread-safe collections for different use cases.',
        short:'ConcurrentHashMap: lock-striping for high-concurrency reads/writes. CopyOnWriteArrayList: all writes create a new array copy — ideal for read-heavy, rarely-modified lists. Collections.synchronizedList(): synchronized wrapper, but iteration requires external synchronization.',
        medium:{
          theory:'ConcurrentHashMap (Java 8+): uses CAS and synchronized on individual buckets (not the whole map). Reads are lock-free. Atomic operations: computeIfAbsent, merge, putIfAbsent. CopyOnWriteArrayList: every mutation (add, set, remove) creates a fresh copy of the underlying array. Iterators are snapshot-based (never throw ConcurrentModificationException). synchronized collections: wrappers that synchronize individual methods but not compound operations (check-then-act is not atomic).',
          tradeoffs:'ConcurrentHashMap: best for concurrent maps. CopyOnWriteArrayList: best for read-heavy listener lists. synchronized wrappers: legacy approach, use concurrent collections instead. Never use Hashtable in new code.',
          code:`// ConcurrentHashMap — high-concurrency map
ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
map.putIfAbsent("key", 42);
map.computeIfAbsent("key", k -> calculate(k));
map.merge("counter", 1, Integer::sum);  // atomic increment

// CopyOnWriteArrayList — read-heavy, rarely-modified
List<Listener> listeners = new CopyOnWriteArrayList<>();
listeners.add(new Listener());  // copies entire array
// Iteration is snapshot — safe without synchronization
for (Listener l : listeners) {
    l.onEvent();  // ConcurrentModificationException impossible
}

// synchronized wrapper (legacy)
List<String> syncList = Collections.synchronizedList(new ArrayList<>());
// Must synchronize for compound operations:
synchronized (syncList) {
    if (!syncList.isEmpty()) syncList.remove(0);
}`
        },
        links:[
          {label:'ConcurrentHashMap — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html'}
        ],
        questions:['How does ConcurrentHashMap achieve thread-safety?','When to use CopyOnWriteArrayList?','Why avoid synchronized wrappers?']
      },
      {
        name:'Iterators and ConcurrentModificationException', tag:'basics', tagLabel:'Collections',
        summary:'Fail-fast iterators detect structural changes and throw ConcurrentModificationException. Fail-safe iterators use snapshots.',
        short:'Most collection iterators are fail-fast: they throw ConcurrentModificationException if the collection is structurally modified during iteration (except via the iterator itself). Concurrent collection iterators are weakly consistent (fail-safe) — they reflect the state at some point during iteration.',
        medium:{
          theory:'Fail-fast: ArrayList, HashMap iterators track a modCount. If the collection changes (add/remove) outside the iterator, next() throws CME. Fail-safe: ConcurrentHashMap, CopyOnWriteArrayList iterators work on snapshots — no CME but may miss concurrent changes. ListIterator: bidirectional traversal with add/set/remove. To remove during iteration, always use iterator.remove(), never collection.remove().',
          tradeoffs:'Fail-fast iterators catch bugs early but cannot be used for concurrent modification. Use iterator.remove() for safe removal during iteration. For concurrent access, use concurrent collections with weakly-consistent iterators.',
          code:`List<String> list = new ArrayList<>(List.of("a", "b", "c", "d"));

// WRONG: modifying during iteration
for (String s : list) {
    if (s.equals("b")) list.remove(s);  // ConcurrentModificationException!
}

// CORRECT: use Iterator.remove()
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    if (it.next().equals("b")) it.remove();  // safe
}

// CORRECT: removeIf (Java 8+)
list.removeIf(s -> s.equals("b"));

// ListIterator — bidirectional, supports add/set
ListIterator<String> lit = list.listIterator();
lit.next();       // "a"
lit.previous();   // "a" (back to start)
lit.add("x");     // insert before current position

// Fail-safe: ConcurrentHashMap iterator
ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
for (var entry : map.entrySet()) {
    // safe even if another thread modifies map
    // but may or may not see concurrent changes
}`
        },
        links:[
          {label:'Iterator — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Iterator.html'}
        ],
        questions:['What triggers ConcurrentModificationException?','How to safely remove during iteration?','What are weakly-consistent iterators?']
      },
      {
        name:'Comparable vs Comparator', tag:'basics', tagLabel:'Collections',
        summary:'Comparable: natural ordering via compareTo(). Comparator: external/custom ordering via compare(). Use Comparator for flexibility.',
        short:'Comparable is implemented by the class itself (natural ordering, single sort). Comparator is external to the class (custom ordering, multiple sorts). Collections.sort(list) uses Comparable; Collections.sort(list, comparator) uses Comparator.',
        medium:{
          theory:'Comparable<T>.compareTo(T o) returns negative/zero/positive. Must be consistent with equals for sorted collections. Comparator<T>.compare(T a, T b) provides external ordering. Java 8+: Comparator.comparing(), thenComparing(), reversed() for fluent composition. Use Comparator when: you don\'t control the class, need multiple sort orders, or want null-safe comparisons.',
          tradeoffs:'Comparable: simple, defines natural order, but only one per class. Comparator: flexible, multiple orderings, composable. For sorted collections (TreeSet, TreeMap), inconsistent Comparable/equals causes subtle bugs.',
          code:`// Comparable — natural ordering
class User implements Comparable<User> {
    String name;
    int age;
    @Override
    public int compareTo(User o) {
        return this.name.compareTo(o.name);  // sort by name
    }
}

// Comparator — custom ordering
Comparator<User> byAge = Comparator.comparingInt(u -> u.age);
Comparator<User> byAgeDesc = byAge.reversed();
Comparator<User> byNameThenAge = Comparator.comparing((User u) -> u.name)
    .thenComparingInt(u -> u.age);

// Usage
List<User> users = getUsers();
Collections.sort(users);                          // natural order (Comparable)
Collections.sort(users, byAge);                   // custom (Comparator)
users.sort(Comparator.comparing(User::getAge));    // Java 8+

// Stream with Comparator
users.stream()
    .sorted(Comparator.comparing(User::getName).thenComparing(User::getAge))
    .toList();`
        },
        links:[
          {label:'Comparator — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Comparator.html'}
        ],
        questions:['What is natural ordering?','Can a class have multiple Comparators?','Why must compareTo be consistent with equals?']
      },
      {
        name:'HashMap Internals', tag:'basics', tagLabel:'HashMap',
        summary:'Array of buckets with hash-based indexing; collisions handled by linked lists that convert to trees at 8 elements.',
        short:'HashMap stores entries in an array of Node buckets. The key\'s hashCode() determines the bucket index (hash & (capacity-1)). Collisions create linked lists in a bucket. Since Java 8, lists with 8+ elements convert to balanced trees (O(log n) vs O(n) lookup).',
        medium:{
          theory:'Structure: Node[] table of size 2^n (default 16). put(key, value): compute hash, find bucket index, check for existing key (equals), add/update node. If bucket has 8+ nodes and table size >= 64, convert list to red-black tree. Load factor 0.75 triggers rehash when size > capacity * loadFactor. Rehashing doubles capacity and redistributes all entries. Time complexity: O(1) average get/put, O(log n) worst case with trees, O(n) with bad hashCode.',
          tradeoffs:'HashMap is the fastest general-purpose Map. Ensure good hashCode distribution to avoid clustering. Set initial capacity to expected_size / load_factor + 1 to avoid rehashing. Thread-safe alternative: ConcurrentHashMap.',
          code:`// HashMap structure visualization:
// table[0]  → Node(k1,v1) → Node(k2,v2) → null  (linked list)
// table[1]  → TreeNode(k3,v3) → ...  (tree, 8+ elements)
// table[2]  → null  (empty bucket)
// ...
// table[15] → Node(k4,v4) → null

// Bucket index calculation
int hash = key.hashCode();
int index = hash & (capacity - 1);  // capacity must be power of 2

// Initial capacity to avoid rehashing
int expectedSize = 1000;
int capacity = (int)(expectedSize / 0.75f) + 1;
Map<String, Object> map = new HashMap<>(capacity);`
        },
        links:[
          {label:'HashMap Source — OpenJDK', url:'https://github.com/openjdk/jdk/blob/master/src/java.base/share/classes/java/util/HashMap.java'}
        ],
        questions:['What triggers treeification?','How is bucket index calculated?','What is the default load factor?']
      },
      {
        name:'equals() and hashCode() Contract', tag:'basics', tagLabel:'HashMap',
        summary:'If a.equals(b) then a.hashCode() == b.hashCode(). Violating this contract breaks HashMap, HashSet, and all hash-based collections.',
        short:'The contract: equal objects must have equal hash codes. Unequal objects may have equal hash codes (collisions). Override both methods together or neither. Use immutable fields for hashCode to ensure stability when used as HashMap keys.',
        medium:{
          theory:'equals() requirements: reflexive (x.equals(x)), symmetric, transitive, consistent, and x.equals(null) == false. hashCode() requirements: consistent across invocations (if fields unchanged), equal objects produce equal hash codes. If you override equals without hashCode, HashMap cannot find the entry (different buckets). If you override hashCode without equals, HashMap finds the bucket but equals fails to match.',
          tradeoffs:'Always override both together. Use IDE-generated or record implementations. Use Objects.hash() for convenience but avoid in hot paths (varargs allocation). Use immutable fields for keys to prevent HashMap corruption after insertion.',
          code:`class User {
    private final String name;
    private final int age;
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return age == user.age && Objects.equals(name, user.name);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(name, age);  // delegates to Arrays.hashCode
    }
}

// VIOLATION: equals without hashCode
User u1 = new User("Alice", 30);
User u2 = new User("Alice", 30);
u1.equals(u2);        // true
u1.hashCode() == u2.hashCode();  // FALSE! (default Object.hashCode)
Map<User, String> map = new HashMap<>();
map.put(u1, "value");
map.get(u2);  // null! Different buckets due to different hashCodes

// Java Records: auto-generate equals and hashCode
record User(String name, int age) {}  // contract fulfilled automatically`
        },
        links:[
          {label:'Object.hashCode — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Object.html#hashCode()'}
        ],
        questions:['What happens if you override only equals?','Can two unequal objects have the same hashCode?','Why should hashCode fields be immutable?']
      },
      {
        name:'HashMap Keys and Collisions', tag:'basics', tagLabel:'HashMap',
        summary:'Good keys are immutable, have proper equals/hashCode. Mutable keys corrupt HashMap lookups. String is the ideal key.',
        short:'HashMap keys should be immutable — changing a key\'s hashCode after insertion makes the entry unreachable. String is the most common key because it is immutable, caches hashCode, and has good hash distribution. Collisions are handled by linked lists that convert to trees at 8 elements.',
        medium:{
          theory:'If a key\'s hashCode changes after put(), the entry stays in the old bucket but get() looks in the new bucket — entry becomes unreachable (memory leak). String is ideal: immutable, cached hashCode, good distribution. null keys are allowed (stored in bucket 0). HashMap allows null values. Hashtable does not allow null keys or values.',
          tradeoffs:'Immutable keys prevent HashMap corruption. Using mutable objects as keys is a common source of bugs. When collisions occur, treeification (Java 8+) limits worst-case from O(n) to O(log n), but good hashCode prevents collisions entirely.',
          code:`// Mutable key — DANGER
class MutableKey {
    String value;
    public int hashCode() { return Objects.hash(value); }
    public boolean equals(Object o) { /* ... */ }
}

MutableKey key = new MutableKey("original");
map.put(key, "data");
key.value = "changed";    // hashCode changes!
map.get(key);             // null — entry unreachable!

// null key handling
Map<String, Integer> map = new HashMap<>();
map.put(null, 42);       // null stored in bucket 0
map.get(null);           // 42

// String as key — ideal
Map<String, Config> configs = new HashMap<>();
configs.put("db.url", config);  // String: immutable, cached hash

// Collision handling: linked list → tree at 8 elements
// Bucket with 7 elements: linked list (O(n) lookup)
// Bucket with 8+ elements: red-black tree (O(log n) lookup)
// Requires table size >= 64 for treeification`
        },
        links:[
          {label:'HashMap — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html'}
        ],
        questions:['What happens with mutable keys?','Why is String a good key?','How does HashMap handle null keys?']
      },
      {
        name:'HashMap vs ConcurrentHashMap', tag:'basics', tagLabel:'HashMap',
        summary:'HashMap: not thread-safe, allows null key/value. ConcurrentHashMap: thread-safe via CAS, no null keys/values, lock-free reads.',
        short:'HashMap is not safe for concurrent access — can cause infinite loops (pre-Java 8) or data corruption. ConcurrentHashMap provides thread-safe operations using CAS and bucket-level synchronization. Reads are lock-free. Null keys and values are not allowed in ConcurrentHashMap.',
        medium:{
          theory:'ConcurrentHashMap (Java 8+): uses CAS for insert into empty bucket, synchronized on the first node for non-empty buckets. Reads (get) are lock-free using volatile reads. Atomic operations: computeIfAbsent, merge, putIfAbsent. Does not allow null keys or values (ambiguous in concurrent context: does null mean absent or stored?). HashMap: synchronized externally with Collections.synchronizedMap() or external locking.',
          tradeoffs:'HashMap: fastest single-threaded. ConcurrentHashMap: best for concurrent access but no null support. Collections.synchronizedMap: legacy approach, locks entire map. Never share HashMap across threads without synchronization.',
          code:`// HashMap — NOT thread-safe
Map<String, Integer> unsafe = new HashMap<>();
// Two threads calling put simultaneously:
// - data corruption
// - infinite loop (pre-Java 8 rehash)
// - lost updates

// ConcurrentHashMap — thread-safe
Map<String, Integer> safe = new ConcurrentHashMap<>();
safe.putIfAbsent("key", 42);
safe.computeIfAbsent("key", k -> calculate(k));
safe.merge("counter", 1, Integer::sum);  // atomic increment

// Atomic check-then-act
safe.compute("balance", (k, v) -> {
    int current = (v == null) ? 0 : v;
    return current + 100;
});

// null not allowed in ConcurrentHashMap
// safe.put(null, 42);  // NullPointerException!
// safe.put("key", null);  // NullPointerException!

// External synchronization (avoid — locks entire map)
Map<String, Integer> syncMap = Collections.synchronizedMap(new HashMap<>());`
        },
        links:[
          {label:'ConcurrentHashMap — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html'}
        ],
        questions:['Why no null in ConcurrentHashMap?','How does ConcurrentHashMap avoid locking reads?','What is a race condition in HashMap?']
      },
      {
        name:'Rehashing and Capacity', tag:'basics', tagLabel:'HashMap',
        summary:'Rehashing doubles capacity and redistributes entries when size exceeds capacity * loadFactor. Expensive — set initial capacity to avoid it.',
        short:'When the number of entries exceeds capacity * loadFactor (default 0.75), HashMap doubles its capacity (e.g., 16 → 32 → 64) and redistributes all entries into new buckets. This is O(n) and should be avoided by setting appropriate initial capacity.',
        medium:{
          theory:'Rehashing: new table of double size, each entry\'s new index is hash & (newCapacity - 1). In Java 8+, an optimization keeps entries in the same relative position or moves them to old_index + old_capacity, avoiding full rehash. Initial capacity should be expected_entries / loadFactor + 1. Maximum capacity is 2^30. Each rehash allocates a new Node[] array.',
          tradeoffs:'Setting capacity too low causes multiple rehashes during population. Setting too high wastes memory. Default load factor 0.75 balances time and space. For read-heavy workloads, lower load factor reduces collisions at the cost of more memory.',
          code:`// Default: capacity=16, loadFactor=0.75
// Rehash at: 16 * 0.75 = 12 entries
// Then: capacity=32, rehash at 24
// Then: capacity=64, rehash at 48...

// Optimal initial capacity
int expectedEntries = 1000;
float loadFactor = 0.75f;
int initialCapacity = (int)(expectedEntries / loadFactor) + 1;
Map<String, Object> map = new HashMap<>(initialCapacity);
// No rehashing during population

// Java 8+ rehash optimization:
// Entry at bucket[i] either stays at bucket[i]
// or moves to bucket[i + oldCapacity]
// Determined by: (hash & oldCapacity) == 0 ? stay : move`
        },
        links:[
          {label:'HashMap — Javadoc', url:'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html'}
        ],
        questions:['What triggers rehashing?','How to calculate optimal initial capacity?','What is the Java 8 rehash optimization?']
      }
    ]
  },);
