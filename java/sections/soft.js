window.SECTIONS = window.SECTIONS || [];
window.SECTIONS.push(  {
    id:'soft', title:'Soft Skills', icon:'🤝', iconBg:'#F0F0F0',
    topics:[
      {
        name:'Senior Developer Responsibilities', tag:'soft', tagLabel:'Soft Skills',
        summary:'Senior developers mentor juniors, make architectural decisions, manage technical debt, and drive engineering culture improvements.',
        short:'A senior Java developer goes beyond coding: mentors team members, makes informed architectural decisions, identifies and manages technical debt, drives code quality practices, communicates with stakeholders, and proactively identifies improvements in processes and systems.',
        medium:{
          theory:'Key responsibilities: 1) Technical leadership: design reviews, architecture decisions, technology selection. 2) Mentoring: pair programming, code reviews with teaching intent, guiding career growth. 3) Communication: translate technical concepts for stakeholders, write design documents, present trade-offs clearly. 4) Quality: enforce testing standards, manage technical debt (track, prioritize, allocate sprint capacity). 5) Process improvement: identify bottlenecks, introduce better tools/practices, lead retrospectives. 6) Staying current: follow Java releases, read engineering blogs, experiment with new approaches.',
          tradeoffs:'Senior developers must balance coding with leadership. Too much coding = not enough impact. Too much management = lose technical edge. Aim for 60-70% coding, 30-40% leadership. Technical debt: track in backlog, allocate 15-20% of sprint capacity for debt reduction.',
          code:`// Technical debt management approach:
// 1. Track: maintain tech debt backlog with impact estimates
// 2. Prioritize: focus on high-impact, low-effort items first
// 3. Allocate: dedicate 15-20% of sprint capacity to debt reduction
// 4. Prevent: enforce code review standards, write ADRs (Architecture Decision Records)
// 5. Measure: track code quality metrics (coverage, complexity, duplication)

// Architecture Decision Record (ADR) template:
// # ADR-001: Use Event Sourcing for Order Service
// ## Context: Need audit trail, complex state transitions
// ## Decision: Implement event sourcing with CQRS
// ## Consequences:
//   - Positive: full audit trail, temporal queries, easy debugging
//   - Negative: increased complexity, eventual consistency, learning curve
// ## Status: Accepted`
        },
        links:[
          {label:'Staff Engineer — Will Larson', url:'https://staffeng.com/'},
          {label:'ADR GitHub', url:'https://adr.github.io/'}
        ],
        questions:['How to balance coding and leadership?','How to manage technical debt?','What makes a good code review?']
      },
      {
        name:'Debugging and Problem Solving', tag:'soft', tagLabel:'Problem Solving',
        summary:'Systematic debugging: reproduce, isolate, hypothesize, verify. Use logging, profiling, and distributed tracing for complex issues.',
        short:'Effective debugging follows a systematic process: 1) Reproduce the issue, 2) Gather evidence (logs, metrics, traces), 3) Form hypotheses, 4) Test hypotheses, 5) Fix and verify. For distributed systems: use correlation IDs, distributed tracing (Jaeger, Zipkin), and centralized logging (ELK stack).',
        medium:{
          theory:'Debugging tools: JVM tools (jstack for thread dumps, jmap for heap dumps, jconsole for monitoring), log analysis (grep, structured logging with MDC), distributed tracing (OpenTelemetry, Jaeger). Common Java issues: memory leaks (heap dump analysis), thread deadlocks (thread dump analysis), performance bottlenecks (profiling with async-profiler). Algorithm problems: DFS/BFS for graph traversal, two-pointer for arrays, sliding window for subarrays.',
          tradeoffs:'Reproduce first: without reproduction, fixes are guesses. Binary search isolation: narrow down which component/commit caused the issue. Structured logging with MDC (correlation IDs) enables tracing requests across services.',
          code:`// MDC for request tracing
MDC.put("requestId", UUID.randomUUID().toString());
MDC.put("userId", user.getId());
log.info("Processing order");  // [requestId=abc, userId=42] Processing order

// Thread dump analysis
jstack <pid> > thread_dump.txt
// Look for BLOCKED threads, monitor locks, deadlocks

// Heap dump analysis
jmap -dump:live,format=b,file=heap.hprof <pid>
// Analyze with Eclipse MAT: dominator tree, leak suspects

// DFS example: find word in grid
boolean findWord(char[][] grid, String word) {
    for (int i = 0; i < grid.length; i++)
        for (int j = 0; j < grid[0].length; j++)
            if (dfs(grid, i, j, word, 0)) return true;
    return false;
}

// First non-repeating character
char firstNonRepeating(String s) {
    int[] freq = new int[256];
    for (char c : s.toCharArray()) freq[c]++;
    for (char c : s.toCharArray()) if (freq[c] == 1) return c;
    return ' ';
}`
        },
        links:[
          {label:'Debugging Guide', url:'https://docs.oracle.com/en/java/javase/21/troubleshoot/general-java-troubleshooting.html'},
          {label:'OpenTelemetry', url:'https://opentelemetry.io/'}
        ],
        questions:['What is MDC?','How to analyze a thread dump?','What tools help with distributed debugging?']
      },
      {
        name:'Team Leadership and Communication', tag:'soft', tagLabel:'Leadership',
        summary:'Effective communication, conflict resolution, mentoring, and driving technical decisions across teams.',
        short:'Senior developers lead through influence, not authority. Key skills: clear technical communication (design docs, ADRs), constructive code reviews, conflict resolution (focus on problems not people), mentoring through pair programming and guided learning, and facilitating technical decisions through RFCs and consensus building.',
        medium:{
          theory:'Code review best practices: review for design and correctness first, be constructive ("consider..." not "you should..."), ask questions instead of making demands. Conflict resolution: separate people from problems, focus on interests not positions, generate options for mutual gain. Mentoring: ask guiding questions, share context (why, not just what), provide safe spaces for failure. Technical decision making: write RFCs, gather input, document decisions in ADRs, commit and move forward even without full consensus.',
          tradeoffs:'Consensus-driven decisions: higher buy-in but slower. "Disagree and commit": faster but requires psychological safety. Code reviews: educational opportunity, not gatekeeping. Mentoring: invest time now for team growth later.',
          code:`// RFC template for technical decisions:
// # RFC: Migrate to Event-Driven Architecture
// ## Summary: Replace synchronous REST with Kafka events
// ## Motivation: Reduce coupling, improve resilience
// ## Detailed Design:
//   - Producer services publish domain events
//   - Consumer services subscribe and project state
//   - Saga pattern for distributed transactions
// ## Drawbacks: Eventual consistency, operational complexity
// ## Alternatives Considered: REST with circuit breakers
// ## Timeline: 3 months, phased rollout
// ## Open Questions: Monitoring strategy, DLQ handling

// Code review feedback (constructive):
// BAD: "This is wrong, use a Map instead"
// GOOD: "Consider using a Map here — it would simplify
//       the lookup and avoid the O(n) scan on each request"

// ADR: Architecture Decision Record
// Title, Status, Context, Decision, Consequences`
        },
        links:[
          {label:'Google Engineering Practices', url:'https://google.github.io/eng-practices/review/'},
          {label:'RFC Process', url:'https://github.com/rust-lang/rfcs'}
        ],
        questions:['How to give constructive code review feedback?','What is the "disagree and commit" principle?','How to write effective RFCs?']
      },
      {
        name:'Professional Growth and Experience', tag:'soft', tagLabel:'Experience',
        summary:'Continuous learning, contributing to open source, staying current with Java releases, and building a T-shaped skill profile.',
        short:'Senior developers maintain a growth mindset: follow Java releases (JEPs, new language features), read engineering blogs (Netflix, Uber, LinkedIn), contribute to open source, attend conferences, and develop T-shaped skills (deep in Java, broad in infrastructure, databases, frontend, DevOps).',
        medium:{
          theory:'Staying current: follow OpenJDK JEPs, read release notes for each Java version, experiment with preview features. Open source: contributes to understanding of large codebases, code review culture, and community. Mentorship: both being mentored (accelerates growth) and mentoring others (deepens understanding). Conference talks and blog posts: share knowledge and build reputation. Side projects: explore new technologies without production constraints.',
          tradeoffs:'Depth vs breadth: specialize in Java/backend but understand enough frontend, DevOps, and databases to be effective. Learning time: allocate dedicated time (e.g., 10% of work week) for learning and experimentation. Open source: time-consuming but invaluable for career growth.',
          code:`// Java version tracking:
// Java 8: Lambdas, Streams, Optional
// Java 11: var, HttpClient, ZGC
// Java 17 (LTS): Sealed classes, pattern matching instanceof
// Java 21 (LTS): Virtual threads, pattern matching switch, records
// Java 23 (preview): String templates, scoped values

// T-shaped skills:
// Deep: Java, Spring, JVM internals, SQL
// Broad: Docker, Kubernetes, Kafka, system design,
//        frontend basics, security, monitoring`
        },
        links:[
          {label:'OpenJDK JEPs', url:'https://openjdk.org/jeps/0'},
          {label:'Java Roadmap', url:'https://www.oracle.com/java/technologies/java-se-support-roadmap.html'}
        ],
        questions:['How to stay current with Java releases?','What are T-shaped skills?','How to contribute to open source?']
      },
      {
        name:'Handling Pressure and Conflict', tag:'soft', tagLabel:'Leadership',
        summary:'Manage deadlines with realistic estimates and scope negotiation. Resolve conflicts by focusing on shared goals and data-driven decisions.',
        short:'Under pressure: negotiate scope rather than quality, communicate early about risks, break work into smaller deliverables. Conflict resolution: separate people from problems, use data over opinions, find shared goals, and "disagree and commit" when consensus is impossible.',
        medium:{
          theory:'Estimation: use historical data, break into small tasks, add buffer for unknowns. When deadlines are tight: cut scope, not quality or testing. Communication: over-communicate risks early — surprises destroy trust. Conflict types: technical (use data/benchmarks), priority (align on business goals), interpersonal (address privately, assume good intent). Difficult conversations: prepare facts, use "I" statements, listen actively, propose solutions.',
          tradeoffs:'Quality vs speed: cutting quality creates technical debt that compounds. "Move fast and break things" works for prototypes, not production systems. Invest in quality upfront — it pays off in reduced debugging and rework time.',
          code:`// Realistic estimation approach:
// 1. Break task into sub-tasks (each < 2 days)
// 2. Estimate each sub-task independently
// 3. Add 20-30% buffer for unknowns
// 4. Track actual vs estimated to improve over time

// Scope negotiation when deadline is tight:
// "We can deliver the core flow by Friday.
//  The admin dashboard and export features
//  can follow in the next sprint.
//  Cutting testing is not an option."

// Conflict resolution framework:
// 1. State the problem objectively (facts, not blame)
// 2. Listen to the other perspective
// 3. Find shared goals
// 4. Propose data-driven solutions
// 5. If no consensus: "disagree and commit"`
        },
        links:[
          {label:'Crucial Conversations', url:'https://cruciallearning.com/'},
          {label:'Estimation — Martin Fowler', url:'https://martinfowler.com/bliki/Fluctuation.html'}
        ],
        questions:['How to handle unrealistic deadlines?','What is "disagree and commit"?','How to estimate tasks accurately?']
      },
      {
        name:'Algorithmic Problem Solving', tag:'soft', tagLabel:'Problem Solving',
        summary:'Common interview patterns: DFS/BFS for graphs, two-pointer for arrays, sliding window for subarrays, dynamic programming for optimization.',
        short:'Key algorithmic patterns for interviews and real problems: DFS/BFS for tree/graph traversal, two-pointer for sorted arrays, sliding window for subarray problems, dynamic programming for overlapping subproblems, binary search for sorted data.',
        medium:{
          theory:'DFS: explore depth-first using recursion or stack. BFS: explore level-by-level using queue. Two-pointer: left and right pointers converging. Sliding window: maintain a window of elements. Dynamic programming: memoization (top-down) or tabulation (bottom-up). Binary search: O(log n) on sorted data. Common interview problems: word search in grid (DFS), first non-repeating character (frequency map), pagination for large datasets (offset/limit or cursor-based).',
          tradeoffs:'Algorithm skills matter for interviews and performance-critical code. In daily work, choose the simplest correct solution first — optimize only when profiling shows a bottleneck. Standard library methods (Collections.sort, Stream API) are usually sufficient.',
          code:`// DFS: word search in N×M grid
boolean exist(char[][] grid, String word) {
    for (int i = 0; i < grid.length; i++)
        for (int j = 0; j < grid[0].length; j++)
            if (dfs(grid, i, j, word, 0)) return true;
    return false;
}
boolean dfs(char[][] g, int i, int j, String w, int k) {
    if (k == w.length()) return true;
    if (i < 0 || j < 0 || i >= g.length || j >= g[0].length) return false;
    if (g[i][j] != w.charAt(k)) return false;
    char temp = g[i][j]; g[i][j] = '#';  // mark visited
    boolean found = dfs(g, i+1, j, w, k+1) || dfs(g, i-1, j, w, k+1)
                 || dfs(g, i, j+1, w, k+1) || dfs(g, i, j-1, w, k+1);
    g[i][j] = temp;  // backtrack
    return found;
}

// First non-repeating character
char firstNonRepeating(String s) {
    LinkedHashMap<Character, Integer> freq = new LinkedHashMap<>();
    for (char c : s.toCharArray()) freq.merge(c, 1, Integer::sum);
    return freq.entrySet().stream()
        .filter(e -> e.getValue() == 1)
        .map(Map.Entry::getKey)
        .findFirst().orElse(' ');
}

// Pagination (cursor-based for large datasets)
SELECT * FROM users WHERE id > :lastId ORDER BY id LIMIT 20;`
        },
        links:[
          {label:'LeetCode', url:'https://leetcode.com/'},
          {label:'Algorithm Patterns', url:'https://www.educative.io/courses/grokking-coding-interview-patterns'}
        ],
        questions:['When to use DFS vs BFS?','What is the sliding window pattern?','How does cursor-based pagination work?']
      }
    ]
  },);
