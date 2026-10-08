window.SECTIONS = window.SECTIONS || [];
window.SECTIONS.push(  {
    id:'security', title:'Безопасность', icon:'🔐', iconBg:'#FBE9E7',
    topics:[
      {
        name:'AuthN vs AuthZ', tag:'security', tagLabel:'Безопасность',
        summary:'Аутентификация (кто ты?) и авторизация (что тебе можно?) — два разных процесса.',
        short:'AuthN: проверка идентичности (JWT, OAuth2, сессии). AuthZ: проверка прав (RBAC, ABAC, ACL).',
        medium:{
          theory:'JWT: stateless, подписан секретом, содержит claims. OAuth2: делегированный доступ. OIDC — расширение OAuth2 с identity layer. RBAC: роли → разрешения. ABAC: политики на основе атрибутов.',
          tradeoffs:'JWT stateless — не нужна БД при проверке, но нельзя отозвать без blacklist. Session-based — можно отозвать, но требует централизованное хранилище.',
          code:`// JWT payload:
{
  "sub": "user-123",      // subject (ID пользователя)
  "roles": ["admin"],     // для RBAC
  "iat": 1716000000,      // issued at
  "exp": 1716003600       // expires через 1 час
}

// RBAC middleware:
function requireRole(role: string) {
  return (req, res, next) => {
    if (!req.user.roles.includes(role))
      return res.status(403).json({ error: 'Forbidden' })
    next()
  }
}
// Использование:
router.delete('/users/:id', requireRole('admin'), deleteUser)`
        },
        links:[
          {label:'JWT.io', url:'https://jwt.io'},
          {label:'OAuth 2.0 explained', url:'https://oauth.net/2/'}
        ],
        questions:['Как безопасно хранить JWT на клиенте?','Чем RBAC отличается от ABAC?','Как реализовать refresh token rotation?']
      },
      {
        name:'OWASP Top 10', tag:'security', tagLabel:'Безопасность',
        summary:'10 наиболее критических рисков веб-приложений. Обязательный минимум для любого разработчика.',
        short:'Injection, Broken Auth, XSS, IDOR, Security Misconfiguration — знать наизусть. Каждый разработчик должен понимать эти риски.',
        medium:{
          theory:'A01: Broken Access Control. A02: Cryptographic Failures. A03: Injection (SQL, XSS). A04: Insecure Design. A05: Security Misconfiguration. A06: Vulnerable Components. A07: Auth Failures. A08: Integrity Failures. A09: Logging Failures. A10: SSRF.',
          tradeoffs:'SSRF особенно опасен в облачных средах (доступ к metadata endpoint). IDOR часто пропускается при code review. Mass assignment — типичная уязвимость в ORM.',
          code:`// SQL Injection — ПЛОХО:
db.query(\`SELECT * FROM users WHERE id=\${req.params.id}\`)

// Параметризованный запрос — ХОРОШО:
db.query('SELECT * FROM users WHERE id=$1', [req.params.id])

// XSS — React экранирует автоматически:
<div>{userInput}</div>                              // safe
<div dangerouslySetInnerHTML={{__html: input}}/>    // ОПАСНО!

// IDOR — всегда проверяй владельца:
const order = await Order.findById(id)
if (order.userId !== req.user.id) return 403`
        },
        links:[{label:'OWASP Top 10', url:'https://owasp.org/www-project-top-ten/'}],
        questions:['Как защититься от SSRF?','Чем CSRF отличается от XSS?','Что такое mass assignment?','Как тестировать на IDOR?']
      }
    ]
  },);
