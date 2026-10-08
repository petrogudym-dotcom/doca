window.SECTIONS = window.SECTIONS || [];
window.SECTIONS.push(  {
    id:'rest', title:'REST & Web', icon:'🌐', iconBg:'#FEF8E8',
    topics:[
      {
        name:'REST API Design Principles', tag:'rest', tagLabel:'REST',
        summary:'REST: stateless, resource-oriented, using HTTP methods and status codes correctly. Idempotent methods (GET, PUT, DELETE) are safe to retry.',
        short:'REST (Representational State Transfer) uses HTTP methods semantically: GET (read), POST (create), PUT (replace), PATCH (partial update), DELETE (remove). Resources are identified by URIs (nouns, not verbs). Idempotent methods produce the same result regardless of retries. Statelessness means each request carries all information needed.',
        medium:{
          theory:'REST principles: 1) Client-server separation, 2) Stateless (no server session), 3) Cacheable responses, 4) Uniform interface (HTTP methods + status codes), 5) Layered system, 6) Code on demand (optional). Idempotent: GET, PUT, DELETE — retrying has no additional effect. POST is NOT idempotent (creates new resources). Status codes: 2xx success, 3xx redirection, 4xx client error, 5xx server error. HATEOAS: responses include links to related resources. Versioning: URL path (/v1/), header, or query param.',
          tradeoffs:'REST: simple, widely understood, cacheable. But: over-fetching/under-fetching (GraphQL alternative), no built-in real-time (WebSocket alternative), statelessness requires JWT/session tokens. URL naming: use nouns (/users, /orders), not verbs (/createUser).',
          code:`// Good REST API design
GET    /api/v1/users              // list users
GET    /api/v1/users/{id}         // get one user
POST   /api/v1/users              // create user → 201 Created
PUT    /api/v1/users/{id}         // replace user → 200 OK
PATCH  /api/v1/users/{id}         // partial update → 200 OK
DELETE /api/v1/users/{id}         // delete → 204 No Content

// Idempotency key for POST (prevent duplicate creation)
POST /api/v1/orders
Idempotency-Key: abc-123

// Versioning approaches
// URL path: /api/v1/users (most common)
// Header: Accept: application/vnd.myapi.v1+json
// Query param: /api/users?version=1

// Error response format
{
    "timestamp": "2024-01-15T10:30:00Z",
    "status": 404,
    "error": "Not Found",
    "message": "User 42 not found",
    "path": "/api/v1/users/42"
}`
        },
        links:[
          {label:'REST API Design', url:'https://restfulapi.net/'},
          {label:'HTTP Status Codes', url:'https://httpstatuses.com/'}
        ],
        questions:['Which HTTP methods are idempotent?','Why should REST be stateless?','What is HATEOAS?']
      },
      {
        name:'Servlets, NIO, and Web Performance', tag:'rest', tagLabel:'Web',
        summary:'Servlets handle HTTP requests in Java EE. NIO enables non-blocking I/O for high-performance network applications.',
        short:'Java Servlets are the foundation of Java web applications — each request is handled by a servlet (Spring MVC\'s DispatcherServlet). NIO (New I/O) provides non-blocking channels, selectors, and buffers for high-throughput network applications (Netty, Undertow).',
        medium:{
          theory:'Servlet lifecycle: init() → service() (doGet/doPost) → destroy(). Thread-per-request model: each request runs in a separate thread. Spring MVC: DispatcherServlet routes to @Controller methods. NIO: Selector multiplexes many channels on one thread, Channel for non-blocking I/O, Buffer for efficient data transfer. Netty: event-driven NIO framework used by Spring WebFlux. Servlet 3.0+ supports async processing for long-running requests.',
          tradeoffs:'Servlet (thread-per-request): simple but limited by thread pool size. NIO (event-driven): scales to millions of connections but more complex. Virtual threads (Java 21+): get the scalability of NIO with the simplicity of blocking code.',
          code:`// Spring MVC controller (built on DispatcherServlet)
@RestController
@RequestMapping("/api/users")
class UserController {
    @GetMapping("/{id}")
    CompletableFuture<User> getUser(@PathVariable long id) {
        return userService.findById(id);  // async response
    }
}

// NIO: non-blocking server (conceptual)
Selector selector = Selector.open();
ServerSocketChannel serverChannel = ServerSocketChannel.open();
serverChannel.bind(new InetSocketAddress(8080));
serverChannel.configureBlocking(false);
serverChannel.register(selector, SelectionKey.OP_ACCEPT);

while (true) {
    selector.select();  // blocks until events
    for (SelectionKey key : selector.selectedKeys()) {
        if (key.isAcceptable()) { /* accept connection */ }
        if (key.isReadable()) { /* read data non-blocking */ }
    }
}

// Servlet 3.0+ async
@WebServlet(asyncSupported = true)
class AsyncServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
        AsyncContext ctx = req.startAsync();
        ctx.start(() -> {
            // long-running task
            ctx.getResponse().getWriter().write("done");
            ctx.complete();
        });
    }
}`
        },
        links:[
          {label:'Java NIO', url:'https://docs.oracle.com/javase/tutorial/essential/io/nio.html'},
          {label:'Servlet Specification', url:'https://jakarta.ee/specifications/servlet/'}
        ],
        questions:['What is the servlet lifecycle?','How does NIO differ from traditional I/O?','What is async servlet processing?']
      }
    ]
  },);
