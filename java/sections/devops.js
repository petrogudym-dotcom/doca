window.SECTIONS = window.SECTIONS || [];
window.SECTIONS.push(  {
    id:'devops', title:'DevOps & Testing', icon:'🚀', iconBg:'#F5E8FE',
    topics:[
      {
        name:'Docker and Kubernetes', tag:'devops', tagLabel:'DevOps',
        summary:'Docker containers package apps with dependencies. Kubernetes orchestrates containers with auto-scaling, self-healing, and service discovery.',
        short:'Docker packages applications and dependencies into portable containers (Dockerfile → image → container). Multi-stage builds minimize image size. Kubernetes orchestrates containers: Pods (smallest unit), Services (networking), Deployments (rollouts), ConfigMaps/Secrets (configuration), HPA (auto-scaling).',
        medium:{
          theory:'Dockerfile: FROM (base image), COPY/ADD (files), RUN (commands), CMD/ENTRYPOINT (startup), EXPOSE (ports). Multi-stage: build in one stage, copy only artifacts to a slim runtime stage. Kubernetes: Pod (one or more containers), Service (ClusterIP/NodePort/LoadBalancer), Deployment (rolling updates), StatefulSet (stateful apps), ConfigMap (non-sensitive config), Secret (sensitive data), HPA (scale based on CPU/memory/custom metrics). Health probes: liveness (restart if unhealthy), readiness (remove from service if not ready).',
          tradeoffs:'Docker: consistent environments, fast startup, isolation. But: adds complexity, requires container orchestration at scale. Kubernetes: powerful but complex — use managed services (EKS, GKE, AKS) in production. For small teams, consider PaaS (Heroku, Railway) or simpler orchestrators (Docker Compose, Nomad).',
          code:`# Multi-stage Dockerfile for Java
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app
COPY . .
RUN ./gradlew bootJar --no-daemon

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

# Kubernetes Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1
  template:
    spec:
      containers:
        - name: app
          image: user-service:1.2.3
          livenessProbe:
            httpGet:
              path: /actuator/health/liveness
              port: 8080
          readinessProbe:
            httpGet:
              path: /actuator/health/readiness
              port: 8080
          resources:
            requests: { memory: "512Mi", cpu: "500m" }
            limits: { memory: "1Gi", cpu: "1000m" }`
        },
        links:[
          {label:'Docker Documentation', url:'https://docs.docker.com/'},
          {label:'Kubernetes Documentation', url:'https://kubernetes.io/docs/'}
        ],
        questions:['What is a multi-stage build?','What is the difference between liveness and readiness probes?','How does rolling update work?']
      },
      {
        name:'CI/CD and Testing Strategy', tag:'devops', tagLabel:'DevOps',
        summary:'CI: build and test on every commit. CD: deploy automatically. Testing pyramid: many unit tests, fewer integration tests, minimal E2E tests.',
        short:'Continuous Integration: automated build and test on every commit. Continuous Delivery: every passing build is deployable. Continuous Deployment: automatically deploy to production. Testing pyramid: unit tests (fast, many) → integration tests (slower, fewer) → E2E tests (slowest, minimal). Code quality: static analysis (SonarQube), code coverage (JaCoCo), code reviews.',
        medium:{
          theory:'CI pipeline: compile → unit tests → static analysis → build artifact → integration tests → security scan. CD pipeline: deploy to staging → smoke tests → deploy to production (canary/blue-green). Testing tools: JUnit 5, Mockito, Testcontainers (real databases in Docker), Spring Boot Test (@SpringBootTest, @WebMvcTest, @DataJpaTest). Testcontainers: spin up real PostgreSQL, Redis, Kafka in Docker for integration tests. ArchUnit: enforce architecture rules in tests.',
          tradeoffs:'Testing pyramid: unit tests give fastest feedback but miss integration issues. E2E tests catch real problems but are slow and brittle. Testcontainers: realistic integration tests without mocks, but slower than unit tests. Aim for 80% unit, 15% integration, 5% E2E.',
          code:`// JUnit 5 + Mockito
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {
    @Mock OrderRepository repo;
    @Mock PaymentGateway payment;
    @InjectMocks OrderService service;
    
    @Test
    void shouldCreateOrderAndCharge() {
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(payment.charge(any())).thenReturn(PaymentResult.success());
        
        Order result = service.createOrder(orderDto);
        
        verify(repo).save(result);
        verify(payment).charge(result);
        assertThat(result.getStatus()).isEqualTo("PAID");
    }
}

// Testcontainers — real database
@Testcontainers
@SpringBootTest
@DataJpaTest
class OrderRepositoryTest {
    @Container
    static PostgreSQLContainer<?> pg = new PostgreSQLContainer<>("postgres:16");
    
    @Test
    void shouldFindByStatus() {
        // uses real PostgreSQL in Docker
    }
}

// ArchUnit — enforce architecture
@ArchTest
static final ArchRule servicesShouldNotAccessRepositories =
    noClasses().that().resideInAPackage("..controller..")
        .should().accessClassesThat().resideInAPackage("..repository..");`
        },
        links:[
          {label:'Testcontainers', url:'https://www.testcontainers.org/'},
          {label:'Testing Pyramid — Martin Fowler', url:'https://martinfowler.com/bliki/TestPyramid.html'}
        ],
        questions:['What is the testing pyramid?','How do Testcontainers work?','What is the difference between CI, CD delivery, and CD deployment?']
      },
      {
        name:'Kubernetes Scaling and StatefulSets', tag:'devops', tagLabel:'DevOps',
        summary:'HPA auto-scales based on CPU/memory/custom metrics. StatefulSets for ordered deployment and persistent storage. Namespaces for isolation.',
        short:'HorizontalPodAutoscaler (HPA) scales pods based on CPU, memory, or custom metrics. StatefulSets provide ordered deployment/termination and stable network identities with persistent volumes. Namespaces isolate resources. Rolling updates ensure zero-downtime deployments.',
        medium:{
          theory:'HPA: monitors metrics via Metrics Server and adjusts replica count within min/max bounds. KEDA extends HPA with external metrics (Kafka lag, queue depth). StatefulSet: ordered pod creation (0, 1, 2...), stable pod names, persistent volume per pod. Used for databases, Kafka, ZooKeeper. Rolling update: maxUnavailable=0, maxSurge=1 for zero-downtime. Namespaces: logical isolation, resource quotas, RBAC. ConfigMap/Secret: inject configuration as environment variables or mounted files.',
          tradeoffs:'HPA: reactive (scales after load increases) — consider predictive scaling. StatefulSet: for stateful apps but harder to manage than stateless Deployments. Namespaces: essential for multi-team clusters. Always set resource requests/limits to prevent noisy neighbor problems.',
          code:`# HPA — auto-scale based on CPU
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: user-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: user-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70

# StatefulSet — for databases/Kafka
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  replicas: 3
  serviceName: postgres-headless
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 10Gi`
        },
        links:[
          {label:'Kubernetes HPA', url:'https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/'},
          {label:'StatefulSets', url:'https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/'}
        ],
        questions:['How does HPA decide when to scale?','What is a StatefulSet used for?','How to set resource limits?']
      },
      {
        name:'Code Quality and Technical Debt', tag:'devops', tagLabel:'DevOps',
        summary:'Static analysis (SonarQube), code coverage (JaCoCo), and systematic technical debt management ensure long-term code health.',
        short:'Code quality tools: SonarQube (bugs, vulnerabilities, code smells), JaCoCo (code coverage), Checkstyle/SpotBugs (style and bug patterns). Technical debt management: track in backlog, allocate 15-20% sprint capacity, prioritize by impact. The Boy Scout Rule: leave code cleaner than you found it.',
        medium:{
          theory:'Quality gates: block merges if coverage < 80%, new bugs > 0, or duplicated code > 3%. Mutation testing (PIT) validates test quality by introducing bugs and checking if tests catch them. Code review best practices: review for design and correctness first, style second (let linters handle style). Technical debt quadrant: deliberate vs inadvertent, prudent vs reckless. Track debt items with estimated cost of fix vs cost of not fixing.',
          tradeoffs:'Coverage targets: 80% is a good baseline but 100% is not always worth it (diminishing returns). Static analysis: catches common bugs but produces false positives. Technical debt: must be actively managed or it compounds. The "code is not done until it\'s tested" mindset prevents debt accumulation.',
          code:`# Gradle: JaCoCo coverage
jacoco {
    toolVersion = "0.8.11"
}
jacocoTestReport {
    reports { xml.required = true; html.required = true }
}
jacocoTestCoverageVerification {
    violationRules {
        rule { limit { minimum = 0.80 } }  // 80% minimum
    }
}

# SonarQube configuration
sonarqube {
    properties {
        property "sonar.projectKey", "myapp"
        property "sonar.host.url", "https://sonar.example.com"
        property "sonar.coverage.jacoco.xmlReportPaths", "build/reports/jacoco/test/jacocoTestReport.xml"
    }
}

// Technical debt tracking in code
// TODO(TEAM-123): Replace with batch insert for performance
// FIXME(TEAM-456): Handle edge case for empty list`
        },
        links:[
          {label:'SonarQube', url:'https://www.sonarsource.com/products/sonarqube/'},
          {label:'PIT Mutation Testing', url:'https://pitest.org/'}
        ],
        questions:['What is a quality gate?','How does mutation testing work?','How to manage technical debt?']
      }
    ]
  },);
