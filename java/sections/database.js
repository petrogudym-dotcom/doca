window.SECTIONS = window.SECTIONS || [];
window.SECTIONS.push(  {
    id:'database', title:'Database & ORM', icon:'🗄️', iconBg:'#E1F0F5',
    topics:[
      {
        name:'SQL Indexes and Query Optimization', tag:'database', tagLabel:'SQL',
        summary:'B-tree indexes speed up lookups. Use EXPLAIN to analyze queries. Composite indexes for multi-column filters.',
        short:'Indexes (B-tree by default) speed up SELECT at the cost of slower INSERT/UPDATE. Composite indexes cover multiple columns — column order matters (most selective first). Use EXPLAIN ANALYZE to see actual execution plans. Avoid SELECT * and use covering indexes when possible.',
        medium:{
          theory:'B-tree index: balanced tree, O(log n) lookup. Composite index (a, b, c) supports queries on (a), (a,b), (a,b,c) but NOT (b) or (c). Index cardinality: high cardinality (unique) columns benefit most. Index-only scans when all queried columns are in the index. Window functions: ROW_NUMBER(), RANK(), DENSE_RANK() for ranking within partitions. MVCC (PostgreSQL): readers don\'t block writers, writers don\'t block readers. VACUUM reclaims dead tuples.',
          tradeoffs:'Indexes: faster reads, slower writes, more storage. Create indexes on frequently filtered/joined columns. Avoid over-indexing. Composite index column order: most selective first, or match the query pattern. Use partial indexes (PostgreSQL: WHERE clause) for selective subsets.',
          code:`-- B-tree index
CREATE INDEX idx_users_email ON users(email);

-- Composite index (left-to-right rule)
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
-- Supports: WHERE user_id = ? AND status = ?
-- Supports: WHERE user_id = ?
-- Does NOT support: WHERE status = ?

-- EXPLAIN ANALYZE
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 42 AND status = 'PENDING';

-- Window functions
SELECT name, salary,
    ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) as rank
FROM employees;

-- PostgreSQL MVCC and VACUUM
-- Readers see consistent snapshot, don't block writers
-- VACUUM reclaims space from deleted/updated rows
VACUUM ANALYZE users;  -- reclaim + update statistics`
        },
        links:[
          {label:'PostgreSQL EXPLAIN', url:'https://www.postgresql.org/docs/current/using-explain.html'},
          {label:'Use The Index, Luke', url:'https://use-the-index-luke.com/'}
        ],
        questions:['What is a composite index?','How does EXPLAIN help?','What is MVCC?']
      },
      {
        name:'JOIN Types and Subqueries', tag:'database', tagLabel:'SQL',
        summary:'INNER JOIN returns matching rows. LEFT/RIGHT JOIN preserves one side. Correlated subqueries execute per row — often slower than JOINs.',
        short:'INNER JOIN: only matching rows from both tables. LEFT JOIN: all rows from left + matching from right (NULL for non-matches). Subqueries in WHERE can often be rewritten as JOINs for better performance. Correlated subqueries execute once per outer row — potentially expensive.',
        medium:{
          theory:'JOIN types: INNER (intersection), LEFT OUTER (all left + matched right), RIGHT OUTER (all right + matched left), FULL OUTER (all from both), CROSS (cartesian product). Subqueries: scalar (returns one value), EXISTS (boolean check), correlated (references outer query). JOINs are generally optimized better by the query planner. HAVING filters after GROUP BY; WHERE filters before.',
          tradeoffs:'JOINs: usually faster, more readable for relationships. Subqueries: more intuitive for existence checks (EXISTS). Correlated subqueries: can be rewritten as JOINs for performance. Use EXPLAIN to compare.',
          code:`-- INNER JOIN: only matching rows
SELECT u.name, o.total
FROM users u INNER JOIN orders o ON u.id = o.user_id;

-- LEFT JOIN: all users, even without orders
SELECT u.name, o.total
FROM users u LEFT JOIN orders o ON u.id = o.user_id;

-- WHERE vs HAVING
SELECT dept, COUNT(*) as cnt
FROM employees
WHERE active = true        -- filter BEFORE grouping
GROUP BY dept
HAVING COUNT(*) > 5;      -- filter AFTER grouping

-- Correlated subquery (expensive)
SELECT * FROM users u
WHERE (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) > 10;

-- Equivalent JOIN (usually faster)
SELECT u.* FROM users u
JOIN (SELECT user_id, COUNT(*) as cnt FROM orders GROUP BY user_id HAVING COUNT(*) > 10) o
ON u.id = o.user_id;`
        },
        links:[
          {label:'SQL JOINs', url:'https://www.w3schools.com/sql/sql_join.asp'}
        ],
        questions:['What is a correlated subquery?','When to use LEFT JOIN vs INNER JOIN?','What is the difference between WHERE and HAVING?']
      },
      {
        name:'Hibernate N+1 and Fetch Strategies', tag:'database', tagLabel:'JPA',
        summary:'N+1 problem: 1 query for parent + N queries for children. Fix with JOIN FETCH, @BatchSize, or EntityGraph.',
        short:'The N+1 problem occurs when Hibernate loads a collection lazily — 1 query for the parent list + N queries for each child collection. Solutions: JOIN FETCH in JPQL, @BatchSize annotation, @EntityGraph, or DTO projections.',
        medium:{
          theory:'N+1 scenario: SELECT all orders, then for each order SELECT its items. Fix: JPQL JOIN FETCH loads parent + children in one query. @BatchSize(N) loads children in batches of N. EntityGraph specifies eager fetch paths. Lazy loading: collection loaded on first access (may throw LazyInitializationException outside transaction). Eager loading: always loaded but can over-fetch. Default: LAZY for collections, EAGER for single-valued associations.',
          tradeoffs:'JOIN FETCH: single query but cartesian product for multiple collections. @BatchSize: reduces N+1 to N/batchSize queries. EntityGraph: flexible per-query fetch plan. DTO projections: no entity management overhead, best for read-only queries.',
          code:`// N+1 PROBLEM
List<Order> orders = em.createQuery("SELECT o FROM Order o", Order.class)
    .getResultList();  // 1 query: SELECT * FROM orders
for (Order o : orders) {
    o.getItems().size();  // N queries: SELECT * FROM items WHERE order_id = ?
}

// FIX 1: JOIN FETCH
List<Order> orders = em.createQuery(
    "SELECT o FROM Order o JOIN FETCH o.items", Order.class)
    .getResultList();  // 1 query with JOIN

// FIX 2: @BatchSize
@Entity
class Order {
    @OneToMany(mappedBy = "order")
    @BatchSize(size = 25)  // loads in batches of 25
    List<Item> items;
}

// FIX 3: EntityGraph (per-query)
@EntityGraph(attributePaths = {"items", "items.product"})
@Query("SELECT o FROM Order o")
List<Order> findAllWithItems();

// FIX 4: DTO projection (best for read-only)
@Query("SELECT new com.example.OrderDto(o.id, o.total, i.name) " +
       "FROM Order o JOIN o.items i")
List<OrderDto> findOrderDtos();`
        },
        links:[
          {label:'Hibernate Fetching', url:'https://docs.jboss.org/hibernate/orm/6.4/userguide/html_single/Hibernate_User_Guide.html#fetching'},
          {label:'N+1 Problem', url:'https://vladmihalcea.com/n-plus-1-query-problem/'}
        ],
        questions:['What causes the N+1 problem?','How does @BatchSize help?','When to use DTO projections?']
      },
      {
        name:'JPA Entity Lifecycle and Caching', tag:'database', tagLabel:'JPA',
        summary:'Entity states: transient, managed, detached, removed. First-level cache (Session) is automatic; second-level cache is optional and shared.',
        short:'JPA entities have four states: transient (new, not managed), managed (attached to persistence context), detached (was managed, session closed), removed (marked for deletion). First-level cache (per Session/EntityManager) is automatic. Second-level cache (shared across sessions) requires configuration (EhCache, Redis).',
        medium:{
          theory:'Lifecycle: persist() makes transient → managed. merge() copies detached → managed. remove() marks managed → removed. flush() synchronizes persistence context to DB (dirty checking detects changes). refresh() reloads from DB. detach() removes from persistence context. First-level cache: automatic, per-session, prevents duplicate loads within a transaction. Second-level cache: shared across sessions, configured per-entity with @Cacheable, reduces DB queries for read-heavy entities.',
          tradeoffs:'First-level cache: automatic and safe. Second-level cache: reduces DB load but adds complexity (invalidation, stale reads). Use second-level cache for reference data (countries, categories), not for frequently modified entities. Flush mode AUTO (before queries) vs COMMIT (at transaction end).',
          code:`// Entity lifecycle
User user = new User();          // transient
em.persist(user);                // managed
em.getTransaction().commit();    // managed → detached (if session closes)

User detached = em.find(User.class, 1L);
em.detach(detached);             // detached
detached.setName("New Name");    // not tracked!
User merged = em.merge(detached); // copy state to managed entity

// Dirty checking — auto-detects changes
User u = em.find(User.class, 1L);
u.setEmail("new@email.com");    // no save() needed!
// On flush/commit: UPDATE users SET email = ? WHERE id = 1

// Second-level cache
@Entity
@Cacheable
@org.hibernate.annotations.Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
class Country {
    @Id long id;
    String name;
}

// Flush modes
em.setFlushMode(FlushModeType.COMMIT);  // flush only at commit
em.flush();  // manual flush`
        },
        links:[
          {label:'JPA Entity Lifecycle', url:'https://docs.jboss.org/hibernate/orm/6.4/userguide/html_single/Hibernate_User_Guide.html#pc'},
          {label:'Second-Level Cache', url:'https://docs.jboss.org/hibernate/orm/6.4/userguide/html_single/Hibernate_User_Guide.html#caching'}
        ],
        questions:['What are the four entity states?','How does dirty checking work?','When to use second-level cache?']
      },
      {
        name:'JPA Relationships and Locking', tag:'database', tagLabel:'JPA',
        summary:'Bidirectional relationships require owning side setup. Optimistic locking (@Version) prevents lost updates; pessimistic locking blocks concurrent access.',
        short:'Bidirectional @OneToMany/@ManyToOne requires setting both sides and using mappedBy on the inverse side. Optimistic locking uses a @Version column — throws OptimisticLockException on conflict. Pessimistic locking locks the row in the database until the transaction ends.',
        medium:{
          theory:'Bidirectional: owning side (no mappedBy) controls the foreign key. Inverse side (mappedBy) is read-only. Always set both sides for consistency. Cascade: PERSIST, MERGE, REMOVE, REFRESH, DETACH, ALL. orphanRemoval=true deletes children removed from the collection. Optimistic locking: @Version field incremented on update, throws exception if version changed by another transaction. Pessimistic: SELECT ... FOR UPDATE locks the row.',
          tradeoffs:'Optimistic: better for low-conflict scenarios (no DB locks, retries needed). Pessimistic: better for high-conflict scenarios (blocks, but no retries). Bidirectional relationships: easy to create infinite recursion in serialization — use @JsonIgnore or DTOs.',
          code:`// Bidirectional relationship
@Entity
class Order {
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    List<OrderItem> items = new ArrayList<>();
    
    void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);  // set both sides!
    }
}

@Entity
class OrderItem {
    @ManyToOne
    @JoinColumn(name = "order_id")
    Order order;
}

// Optimistic locking
@Entity
class Account {
    @Id long id;
    BigDecimal balance;
    @Version int version;  // auto-incremented, checked on update
}
// If two transactions update same account:
// Transaction A: UPDATE accounts SET balance=100, version=2 WHERE id=1 AND version=1
// Transaction B: UPDATE accounts SET balance=200, version=2 WHERE id=1 AND version=1
// → OptimisticLockException (one succeeds, one fails)

// Pessimistic locking
Account acc = em.find(Account.class, 1L, LockModeType.PESSIMISTIC_WRITE);
// SELECT ... FOR UPDATE — row locked until transaction ends`
        },
        links:[
          {label:'JPA Relationships', url:'https://docs.jboss.org/hibernate/orm/6.4/userguide/html_single/Hibernate_User_Guide.html#associations'},
          {label:'JPA Locking', url:'https://docs.jboss.org/hibernate/orm/6.4/userguide/html_single/Hibernate_User_Guide.html#locking'}
        ],
        questions:['What is the owning side in a bidirectional relationship?','How does @Version work?','When to use pessimistic vs optimistic locking?']
      },
      {
        name:'ACID and Transaction Isolation', tag:'database', tagLabel:'Transactions',
        summary:'ACID: Atomicity, Consistency, Isolation, Durability. Isolation levels: Read Uncommitted → Serializable. Higher isolation = less concurrency.',
        short:'ACID properties: Atomicity (all or nothing), Consistency (valid state), Isolation (concurrent transactions don\'t interfere), Durability (committed data survives crashes). Isolation levels from lowest to highest: Read Uncommitted (dirty reads), Read Committed (default in PostgreSQL), Repeatable Read (default in MySQL), Serializable (no anomalies).',
        medium:{
          theory:'Dirty read: reading uncommitted data from another transaction. Non-repeatable read: same query returns different results within a transaction. Phantom read: new rows appear in a range query. Lost update: two transactions overwrite each other. Spring @Transactional: propagation (REQUIRED, REQUIRES_NEW, NESTED, etc.), rollbackFor, readOnly. Self-invocation bypasses the proxy — @Transactional won\'t work. Checked exceptions don\'t trigger rollback by default.',
          tradeoffs:'Higher isolation: fewer anomalies but more locking/contention. Read Committed: good default, allows non-repeatable reads. Repeatable Read: prevents non-repeatable reads but allows phantoms (in MySQL). Serializable: strongest but can cause serialization failures. Use the lowest isolation level that meets your consistency requirements.',
          code:`// Spring @Transactional
@Transactional(
    propagation = Propagation.REQUIRED,  // default: join or create
    rollbackFor = Exception.class,        // rollback on checked too
    isolation = Isolation.REPEATABLE_READ,
    readOnly = false
)
public void transferMoney(long from, long to, BigDecimal amount) { /* ... */ }

// REQUIRES_NEW: always creates a new independent transaction
@Transactional(propagation = Propagation.REQUIRES_NEW)
public void auditLog(String action) { /* committed even if outer rolls back */ }

// Isolation level anomalies:
// Read Uncommitted: dirty reads possible
// Read Committed: no dirty reads, non-repeatable reads possible
// Repeatable Read: no non-repeatable reads, phantoms possible
// Serializable: no anomalies, but serialization failures

// Self-invocation problem:
@Service
class OrderService {
    void process() { saveOrder(); }  // calls save() internally
    @Transactional
    void saveOrder() { /* NOT transactional — self-invocation bypasses proxy! */ }
}`
        },
        links:[
          {label:'Spring Transactions', url:'https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative.html'},
          {label:'PostgreSQL Isolation Levels', url:'https://www.postgresql.org/docs/current/transaction-iso.html'}
        ],
        questions:['What is a phantom read?','What is the default isolation level in PostgreSQL?','Why does self-invocation break @Transactional?']
      },
      {
        name:'JPQL, Criteria API, and Projections', tag:'database', tagLabel:'JPA',
        summary:'JPQL is object-oriented SQL. Criteria API builds type-safe queries programmatically. Projections return DTOs instead of full entities.',
        short:'JPQL queries use entity names and fields instead of table names. Criteria API builds queries programmatically with type safety (metamodel). Projections (SELECT new Dto(...)) return lightweight DTOs instead of managed entities — ideal for read-only queries.',
        medium:{
          theory:'JPQL: "SELECT o FROM Order o WHERE o.status = :status" — uses entity/field names. Criteria API: JPA 2.0 metamodel (Order_.status) for type-safe queries — compile-time checking. Projections: SELECT new com.example.OrderSummary(o.id, o.total) returns POJOs without entity management overhead. Specification pattern (Spring Data JPA) composes Criteria predicates. Native SQL: @Query(value="...", nativeQuery=true) for database-specific features.',
          tradeoffs:'JPQL: readable, portable, but runtime errors for typos. Criteria API: type-safe, composable, but verbose. Projections: best performance for read-only (no dirty checking, no first-level cache). Native SQL: database-specific, use when JPQL is insufficient.',
          code:`// JPQL
@Query("SELECT o FROM Order o JOIN o.items i WHERE i.product.name = :name")
List<Order> findByProductName(@Param("name") String name);

// Criteria API (type-safe)
CriteriaBuilder cb = em.getCriteriaBuilder();
CriteriaQuery<Order> cq = cb.createQuery(Order.class);
Root<Order> root = cq.from(Order.class);
Join<Order, Item> items = root.join("items");
cq.where(cb.equal(items.get("status"), "ACTIVE"));
List<Order> result = em.createQuery(cq).getResultList();

// DTO Projection (no entity overhead)
@Query("SELECT new com.example.OrderSummary(o.id, o.total, o.createdAt) " +
       "FROM Order o WHERE o.status = :status")
List<OrderSummary> findSummaries(@Param("status") String status);

// Spring Data JPA Specification (composable)
Specification<Order> hasStatus(String status) {
    return (root, query, cb) -> cb.equal(root.get("status"), status);
}
Specification<Order> aboveTotal(BigDecimal min) {
    return (root, query, cb) -> cb.greaterThan(root.get("total"), min);
}
repo.findAll(hasStatus("ACTIVE").and(aboveTotal(BigDecimal.valueOf(100))));`
        },
        links:[
          {label:'JPQL Reference', url:'https://docs.jboss.org/hibernate/orm/6.4/userguide/html_single/Hibernate_User_Guide.html#hql'},
          {label:'Spring Data Specifications', url:'https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#specifications'}
        ],
        questions:['When to use Criteria API over JPQL?','What is a JPA metamodel?','Why use DTO projections?']
      },
      {
        name:'Transaction Propagation and Best Practices', tag:'database', tagLabel:'Transactions',
        summary:'Propagation controls transaction boundaries: REQUIRED joins or creates, REQUIRES_NEW always creates new, NESTED uses savepoints. Keep transactions short.',
        short:'Spring transaction propagation: REQUIRED (default: join existing or create new), REQUIRES_NEW (suspend current, create new independent), NESTED (savepoint within current), SUPPORTS (join if exists, run non-transactional otherwise). Keep transactions as short as possible to minimize lock holding time.',
        medium:{
          theory:'REQUIRED: most common — method joins the caller\'s transaction or creates one. REQUIRES_NEW: independent transaction — commits/rolls back independently of the outer transaction. NESTED: creates a savepoint — rolls back to savepoint on failure, not the entire outer transaction. SUPPORTS: participates if a transaction exists. Best practices: keep transactions short, avoid calling external services within transactions, use readOnly=true for read-only transactions, handle OptimisticLockException with retries.',
          tradeoffs:'REQUIRES_NEW: useful for audit logs (should persist even if outer fails) but can cause deadlocks. NESTED: savepoints are not supported by all databases. readOnly=true: allows database optimizations (no dirty checking, read-only hints to the driver).',
          code:`// REQUIRED (default): joins or creates
@Transactional
void processOrder(Order order) {
    saveOrder(order);     // same transaction
    chargePayment(order); // same transaction — both roll back on failure
}

// REQUIRES_NEW: independent transaction
@Service
class AuditService {
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    void logAction(String action) {
        // This commits even if the outer transaction rolls back
        auditRepo.save(new AuditLog(action, Instant.now()));
    }
}

// NESTED: savepoint
@Transactional
void processOrder(Order order) {
    saveOrder(order);
    try {
        sendNotification(order);  // NESTED transaction
    } catch (Exception e) {
        // rolls back to savepoint — order is still saved
        log.warn("Notification failed, order still saved");
    }
}

// Best practices
@Transactional(readOnly = true)  // read-only optimization
List<Order> findAll() { return repo.findAll(); }

// Retry on optimistic lock
@Retryable(retryFor = OptimisticLockException.class, maxAttempts = 3)
@Transactional
void updateBalance(long accountId, BigDecimal amount) { /* ... */ }`
        },
        links:[
          {label:'Transaction Propagation — Spring Docs', url:'https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-propagation.html'}
        ],
        questions:['What is the difference between REQUIRED and REQUIRES_NEW?','When to use NESTED propagation?','Why use readOnly=true?']
      }
    ]
  },);
