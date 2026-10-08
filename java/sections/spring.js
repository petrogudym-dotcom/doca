window.SECTIONS = window.SECTIONS || [];
window.SECTIONS.push(  {
    id:'spring', title:'Spring & Microservices', icon:'🍃', iconBg:'#E3F2FD',
    topics:[
      {
        name:'Циклические зависимости в Spring', tag:'spring', tagLabel:'Spring',
        summary:'Setter/field injection Spring решает через трёхуровневый кэш; constructor injection — только через @Lazy или рефакторинг.',
        short:'Spring разрешает циклы для setter и field injection с помощью three-level cache (singletonFactories, earlySingletonObjects, singletonObjects). Цикл на конструкторах автоматически не решается — нужен @Lazy или архитектурный рефакторинг.',
        medium:{
          theory:'При создании бина Spring кладёт ObjectFactory в singletonFactories до полной инициализации, поэтому второй бин может получить раннюю ссылку. Для конструкторов это невозможно — объект ещё не создан, Spring бросает BeanCurrentlyInCreationException. @Lazy на конструкторе внедряет прокси, который резолвит настоящий бин при первом обращении. С Spring Boot 2.6 циклы по умолчанию запрещены.',
          tradeoffs:'@Lazy лечит симптом, но скрывает проблему дизайна: цикл = высокая связанность. Лучшие решения — объединить бины, вынести общую логику в третий сервис, использовать setter injection осознанно или событийную модель (ApplicationEventPublisher).',
          code:`// BeanCurrentlyInCreationException — цикл на конструкторах:
@Service
class A { A(B b) { ... } }
@Service
class B { B(A a) { ... } }

// Обход через @Lazy — внедряется прокси:
@Service
class A {
    A(@Lazy B b) { this.b = b; }
}

// Правильное решение — разорвать цикл:
@Service
class A { void doWork(ApplicationEventPublisher pub) {
    pub.publishEvent(new WorkDone());   // B слушает событие
} }`
        },
        links:[
          {label:'Circular References — Spring Docs', url:'https://docs.spring.io/spring-framework/reference/core/beans/factory-collab.html'}
        ],
        questions:['Как работает three-level cache в Spring?','Почему prototype-бины не решают цикл?','Чем @Lazy отличается от ObjectProvider?']
      },
      {
        name:'Saga Pattern', tag:'spring', tagLabel:'Микросервисы',
        summary:'Распределённая транзакция как цепочка локальных транзакций с компенсирующими действиями при сбое.',
        short:'Saga разбивает распределённую транзакцию на последовательность локальных. Каждый шаг обновляет свою БД и публикует событие/сообщение, запускающее следующий. При сбое шага выполняются компенсирующие транзакции, откатывающие изменения.',
        medium:{
          theory:'Два стиля: Choreography (сервисы слушают события друг друга, координатора нет) и Orchestration (центральный оркестратор управляет шагами — например, Camunda, Temporal, Axon). Каждый шаг обязан иметь компенсацию; компенсации должны быть идемпотентны и retriable. Результат — eventual consistency между сервисами.',
          tradeoffs:'Choreography: простая для 2–4 шагов, но поток логики трудно отследить. Orchestration: явный state machine и наблюдаемость, но оркестратор — критический компонент. Минусы обоих: нет изоляции (dirty reads между шагами), нужны semantic locks и компенсирующая логика.',
          code:`// Orchestration (Spring Boot / Temporal-style):
public class CreateOrderSaga {
    public void execute(Order order) {
        try {
            paymentService.charge(order);        // шаг 1
            inventoryService.reserve(order);     // шаг 2
            shippingService.schedule(order);     // шаг 3
        } catch (InventoryException e) {
            paymentService.refund(order);        // компенсация шага 1
        } catch (ShippingException e) {
            inventoryService.release(order);     // компенсации...
            paymentService.refund(order);
        }
    }
}

// Choreography: order-created → Kafka → payment-service
//   payment-failed → Kafka → order-service (отмена заказа)`
        },
        links:[
          {label:'Saga — microservices.io', url:'https://microservices.io/patterns/data/saga.html'},
          {label:'Transactional Messaging — Chris Richardson', url:'https://www.manning.com/books/microservices-patterns'}
        ],
        questions:['Choreography vs Orchestration — когда что?','Как сделать компенсации идемпотентными?','Что такое semantic lock и countermeasures?']
      },
      {
        name:'Dependency Injection and Beans', tag:'spring', tagLabel:'Spring',
        summary:'DI injects dependencies from outside rather than creating them internally. Beans are Spring-managed objects with configurable scopes and lifecycle.',
        short:'Dependency Injection (DI) is the core of Spring: objects receive their dependencies from the container rather than creating them. Constructor injection is recommended (mandatory, immutable, testable). Beans are objects managed by the Spring IoC container with configurable lifecycle and scope.',
        medium:{
          theory:'Injection types: Constructor (recommended: mandatory deps, immutability, testability), Setter (optional deps, reconfiguration), Field (@Autowired — discouraged: hidden deps, reflection). Bean scopes: singleton (default, one per container), prototype (new instance per injection), request/session (web scopes). @Autowired resolves by type; @Qualifier or @Primary disambiguate when multiple beans of the same type exist. Bean lifecycle: instantiate → populate properties → BeanPostProcessor → init → use → destroy.',
          tradeoffs:'Constructor injection: clear dependencies, immutable, testable with mocks. Field injection: concise but hides dependencies and makes testing harder. Singleton scope: efficient but stateful singletons are dangerous. Prototype: for stateful beans but singleton beans cannot inject prototype (use ObjectProvider or @Lookup).',
          code:`// Constructor injection — recommended
@Service
public class OrderService {
    private final OrderRepository repo;
    private final PaymentGateway payment;
    
    public OrderService(OrderRepository repo, PaymentGateway payment) {
        this.repo = repo;
        this.payment = payment;
    }
}

// Multiple beans of same type — disambiguate
@Service @Primary
class PostgresUserRepo implements UserRepo { /* ... */ }

@Service
class UserService {
    UserService(@Qualifier("postgresUserRepo") UserRepo repo) { /* ... */ }
}

// Bean lifecycle annotations
@Component
class CacheManager {
    @PostConstruct
    void init() { loadCache(); }
    
    @PreDestroy
    void cleanup() { evictAll(); }
}

// Profiles — environment-specific beans
@Configuration
@Profile("dev")
class DevConfig {
    @Bean DataSource dataSource() { return new H2DataSource(); }
}`
        },
        links:[
          {label:'Spring DI — Docs', url:'https://docs.spring.io/spring-framework/reference/core/beans/dependencies.html'},
          {label:'Spring Bean Scopes', url:'https://docs.spring.io/spring-framework/reference/core/beans/factory-scopes.html'}
        ],
        questions:['Why prefer constructor injection?','What is the default bean scope?','How does @Primary work?']
      },
      {
        name:'AOP and @Transactional', tag:'spring', tagLabel:'Spring',
        summary:'AOP enables cross-cutting concerns (logging, transactions, security) via proxies. @Transactional manages database transactions declaratively.',
        short:'Spring AOP uses proxies (JDK dynamic proxy for interfaces, CGLIB for classes) to apply cross-cutting concerns (aspects) around method execution. @Transactional starts a transaction before the method and commits/rolls back after. Self-invocation bypasses the proxy — transactions won\'t work.',
        medium:{
          theory:'AOP concepts: Aspect (the cross-cutting module), Advice (before, after, around), Pointcut (which methods to intercept), Join Point (the method execution). @Transactional: Spring creates a proxy that opens a transaction, executes the method, and commits or rolls back. Self-invocation problem: calling another @Transactional method from the same class bypasses the proxy. Solutions: inject self, use AopContext, or restructure. Default rollback: RuntimeException only. Use rollbackFor for checked exceptions.',
          tradeoffs:'AOP: powerful for cross-cutting concerns but can be invisible (hard to debug). @Transactional: simple declarative transactions but self-invocation is a common pitfall. Always test transactional boundaries. Use propagation levels wisely (REQUIRED is default, REQUIRES_NEW for independent transactions).',
          code:`// AOP aspect
@Aspect @Component
class LoggingAspect {
    @Around("@annotation(Auditable)")
    Object audit(ProceedingJoinPoint pjp) throws Throwable {
        long start = System.currentTimeMillis();
        try {
            return pjp.proceed();
        } finally {
            log.info("{} took {}ms", pjp.getSignature(), System.currentTimeMillis() - start);
        }
    }
}

// @Transactional — declarative transactions
@Transactional(rollbackFor = Exception.class)
public void transferMoney(long fromId, long toId, BigDecimal amount) {
    accountRepo.debit(fromId, amount);
    accountRepo.credit(toId, amount);
    // rolls back on any Exception
}

// Self-invocation problem
@Service
class OrderService {
    @Transactional
    void processOrder(Order order) { /* ... */ }
    
    void internalCall(Order order) {
        this.processOrder(order);  // BYPASSES PROXY! No transaction!
    }
}

// Fix: inject self
@Service
class OrderService {
    private final OrderService self;
    void internalCall(Order order) {
        self.processOrder(order);  // goes through proxy
    }
}`
        },
        links:[
          {label:'Spring AOP — Docs', url:'https://docs.spring.io/spring-framework/reference/core/aop.html'},
          {label:'Spring Transactions', url:'https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative.html'}
        ],
        questions:['Why does self-invocation bypass @Transactional?','What is propagation REQUIRES_NEW?','How does Spring create proxies?']
      },
      {
        name:'Spring Boot Essentials', tag:'spring', tagLabel:'Spring',
        summary:'Auto-configuration, starters, and @SpringBootApplication — opinionated Spring setup with minimal configuration.',
        short:'Spring Boot provides auto-configuration (configures beans based on classpath), starters (curated dependency sets), and @SpringBootApplication (combines @Configuration, @EnableAutoConfiguration, @ComponentScan). Externalized properties via application.yml/properties with profile support.',
        medium:{
          theory:'@SpringBootApplication = @Configuration + @EnableAutoConfiguration + @ComponentScan. Auto-configuration: Spring Boot scans classpath and auto-configures beans (e.g., DataSource if JDBC on classpath). @Conditional annotations control when auto-config applies. Starters: spring-boot-starter-web (Tomcat + Spring MVC), spring-boot-starter-data-jpa (Hibernate + DataSource). Externalized config: application.yml, profiles (dev, prod), environment variables, command-line args. @ComponentScan finds @Component, @Service, @Repository, @Controller beans.',
          tradeoffs:'Auto-configuration: fast setup but can configure beans you don\'t expect. Use spring.autoconfigure.exclude to disable. Starters simplify dependency management but pull many transitive dependencies. Use spring-boot-dependencies BOM for dependency control without the parent POM.',
          code:`// @SpringBootApplication = 3 annotations in one
@SpringBootApplication
public class MyApp {
    public static void main(String[] args) {
        SpringApplication.run(MyApp.class, args);
    }
}

// Custom auto-configuration
@Configuration
@ConditionalOnClass(DataSource.class)
@ConditionalOnMissingBean(DataSource.class)
public class DataSourceAutoConfig {
    @Bean
    DataSource dataSource(@Value("\${db.url}") String url) {
        return DataSourceBuilder.create().url(url).build();
    }
}

// application.yml with profiles
# application.yml
spring:
  datasource:
    url: \${DB_URL:jdbc:h2:mem:testdb}
  profiles:
    active: \${SPRING_PROFILES_ACTIVE:dev}

// Stereotype annotations
@Component  // generic bean
@Service    // business logic (semantic)
@Repository // data access (exception translation)
@Controller // web MVC handler`
        },
        links:[
          {label:'Spring Boot Docs', url:'https://docs.spring.io/spring-boot/docs/current/reference/html/'},
          {label:'Spring Boot Auto-Configuration', url:'https://docs.spring.io/spring-boot/docs/current/reference/html/auto-configuration-classes.html'}
        ],
        questions:['What does @SpringBootApplication combine?','How does auto-configuration decide what to configure?','What are Spring Boot starters?']
      },
      {
        name:'Spring Security and REST Best Practices', tag:'spring', tagLabel:'Spring',
        summary:'Spring Security provides authentication and authorization via filter chains. REST best practices: proper status codes, idempotency, versioning, HATEOAS.',
        short:'Spring Security uses a filter chain to intercept requests — handles authentication (who are you?) and authorization (what can you do?). REST best practices: use nouns for resources, proper HTTP methods and status codes, idempotent operations, API versioning, and consistent error handling.',
        medium:{
          theory:'Spring Security: SecurityFilterChain bean defines the filter chain. Authentication: form login, OAuth2/OIDC, JWT tokens. Authorization: @PreAuthorize, @Secured, URL-based rules. OWASP Top 10: injection, broken auth, XSS, insecure deserialization, etc. REST: GET (read, idempotent), POST (create, not idempotent), PUT (replace, idempotent), PATCH (partial update), DELETE (remove, idempotent). Status codes: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error.',
          tradeoffs:'JWT: stateless, scalable, but cannot revoke tokens easily (use short expiry + refresh tokens). Session: revocable but requires sticky sessions or session store. REST: simple and widely understood. GraphQL: flexible queries but more complex caching and security.',
          code:`// Spring Security configuration (Spring Boot 3+)
@Configuration
@EnableWebSecurity
class SecurityConfig {
    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
            .build();
    }
}

// Method-level security
@PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
public User getUser(@PathVariable long userId) { /* ... */ }

// REST controller with proper status codes
@RestController
@RequestMapping("/api/v1/users")
class UserController {
    @GetMapping("/{id}")
    ResponseEntity<User> get(@PathVariable long id) { /* 200 or 404 */ }
    
    @PostMapping
    ResponseEntity<User> create(@Valid @RequestBody UserDto dto) { /* 201 */ }
    
    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(@PathVariable long id) { /* 204 */ }
}`
        },
        links:[
          {label:'Spring Security Docs', url:'https://docs.spring.io/spring-security/reference/'},
          {label:'REST API Design', url:'https://restfulapi.net/'}
        ],
        questions:['What is the difference between 401 and 403?','How does JWT authentication work?','Which HTTP methods are idempotent?']
      },
      {
        name:'Spring Boot Actuator and Configuration', tag:'spring', tagLabel:'Spring',
        summary:'Actuator provides production-ready endpoints (health, metrics, info). Externalized config supports profiles, environment variables, and config servers.',
        short:'Spring Boot Actuator exposes operational endpoints: /actuator/health (readiness/liveness probes), /actuator/metrics (Micrometer integration), /actuator/info, /actuator/env. Externalized configuration supports application.yml, profiles, environment variables, and Spring Cloud Config for distributed config.',
        medium:{
          theory:'Actuator endpoints: health (Kubernetes probes), metrics (Prometheus, Datadog), env (view properties), beans (view all beans), conditions (auto-config report). Security: expose only needed endpoints, protect with Spring Security. Configuration priority (highest to lowest): command-line args > environment variables > application-{profile}.yml > application.yml > defaults. @ConfigurationProperties binds YAML to type-safe Java objects.',
          tradeoffs:'Actuator: essential for production monitoring and Kubernetes integration. Expose selectively — /actuator/env can leak secrets. Externalized config: use profiles for environment-specific settings. Config Server for large microservice deployments.',
          code:`# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: when-authorized
      probes:
        enabled: true  # /actuator/health/readiness, /actuator/health/liveness

// Type-safe configuration
@ConfigurationProperties(prefix = "app")
record AppProperties(
    String name,
    int maxRetries,
    Duration timeout
) {}

// Kubernetes health probes
# readinessProbe:
#   httpGet:
#     path: /actuator/health/readiness
# livenessProbe:
#   httpGet:
#     path: /actuator/health/liveness`
        },
        links:[
          {label:'Spring Boot Actuator', url:'https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html'}
        ],
        questions:['What endpoints does Actuator expose?','How does configuration priority work?','What are readiness and liveness probes?']
      },
      {
        name:'Spring Security: OAuth2 and JWT', tag:'spring', tagLabel:'Spring',
        summary:'OAuth2 provides delegated authorization via authorization servers. JWT enables stateless token-based authentication for REST APIs.',
        short:'OAuth2/OIDC: delegate authentication to an external provider (Keycloak, Auth0, Google). JWT (JSON Web Token): self-contained token with claims, signed by the authorization server. Resource servers validate JWTs without calling the auth server on every request.',
        medium:{
          theory:'OAuth2 flow: client redirects to authorization server → user authenticates → auth server returns authorization code → client exchanges code for access token (JWT). JWT structure: header (algorithm), payload (claims: sub, roles, exp), signature. Resource server validates JWT signature using the auth server\'s public key (JWKS endpoint). Refresh tokens enable obtaining new access tokens without re-authentication. Spring Security OAuth2 Resource Server auto-configures JWT validation from the issuer URI.',
          tradeoffs:'JWT: stateless and scalable but tokens cannot be revoked before expiry (use short expiry 5-15 min + refresh tokens). OAuth2: standard, well-understood, but complex initial setup. Session tokens: revocable but require shared session store.',
          code:`// Spring Security OAuth2 Resource Server
@Bean
SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    return http
        .oauth2ResourceServer(oauth2 -> oauth2
            .jwt(jwt -> jwt
                .jwtAuthenticationConverter(jwtAuthenticationConverter())
            )
        )
        .build();
}

// Extract roles from JWT claims
JwtAuthenticationConverter jwtAuthenticationConverter() {
    var grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
    grantedAuthoritiesConverter.setAuthoritiesClaimName("roles");
    grantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");
    
    var converter = new JwtAuthenticationConverter();
    converter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
    return converter;
}

// Method-level security with JWT roles
@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/admin/users")
List<User> getAllUsers() { /* ... */ }

// Access current user from JWT
@AuthenticationPrincipal Jwt jwt
@GetMapping("/me")
User currentUser(@AuthenticationPrincipal Jwt jwt) {
    String email = jwt.getClaimAsString("email");
    return userService.findByEmail(email);
}`
        },
        links:[
          {label:'Spring Security OAuth2', url:'https://docs.spring.io/spring-security/reference/servlet/oauth2/index.html'},
          {label:'JWT.io', url:'https://jwt.io/'}
        ],
        questions:['How is a JWT validated without calling the auth server?','What are refresh tokens for?','How to handle JWT token expiry?']
      },
      {
        name:'CORS, CSRF, and OWASP Top 10', tag:'spring', tagLabel:'Security',
        summary:'CORS controls cross-origin requests. CSRF prevents forged requests from authenticated users. OWASP Top 10 lists the most critical web security risks.',
        short:'CORS (Cross-Origin Resource Sharing): browser-enforced policy controlling which origins can access your API. CSRF (Cross-Site Request Forgery): attacker tricks an authenticated user into sending forged requests. OWASP Top 10: injection, broken authentication, sensitive data exposure, XML external entities, broken access control, security misconfiguration, XSS, insecure deserialization, using components with vulnerabilities, insufficient logging.',
        medium:{
          theory:'CORS: configured on the server via Access-Control-Allow-Origin headers. Spring: @CrossOrigin annotation or CorsConfiguration. For stateless APIs (JWT), CORS is needed but CSRF is not (no cookies). CSRF: Spring Security enables CSRF protection by default (for session-based auth with cookies). Disable for stateless APIs. OWASP: the top 10 risks change periodically — stay current. Key mitigations: input validation, parameterized queries, output encoding, HTTPS, least privilege.',
          tradeoffs:'CORS: essential for SPAs calling APIs from different origins. Be specific about allowed origins (never *). CSRF: disable only for truly stateless APIs (JWT, no cookies). OWASP: follow as a security checklist for every application.',
          code:`// CORS configuration
@Configuration
class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("https://app.example.com")
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowCredentials(true);
    }
}

// CSRF: disable for stateless JWT APIs
http.csrf(csrf -> csrf.disable());

// CSRF: keep enabled for session-based apps (default)
// Spring generates CSRF tokens automatically

// SQL injection prevention
@Query("SELECT u FROM User u WHERE u.email = :email")  // parameterized
List<User> findByEmail(@Param("email") String email);
// NEVER: "SELECT * FROM users WHERE email = '" + email + "'"

// XSS prevention in Thymeleaf (auto-escapes by default)
// <span th:text="\${userInput}">  — safe`
        },
        links:[
          {label:'OWASP Top 10', url:'https://owasp.org/www-project-top-ten/'},
          {label:'Spring Security CSRF', url:'https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html'}
        ],
        questions:['When to disable CSRF?','How does CORS work?','What are the top OWASP risks?']
      }
    ]
  },);
