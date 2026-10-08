window.SECTIONS = window.SECTIONS || [];
window.SECTIONS.push(  {
    id:'basics', title:'Основы', icon:'📐', iconBg:'#FFF3E0',
    topics:[
      {
        name:'SOLID', tag:'principle', tagLabel:'Принцип',
        summary:'5 принципов ООП-дизайна, снижающих связность кода и упрощающих поддержку.',
        short:'Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion. Каждый класс — одна причина изменения.',
        medium:{
          theory:'SRP — один класс, одна ответственность. OCP — открыт для расширения, закрыт для изменения. LSP — наследники заменяют базовый класс без сюрпризов. ISP — интерфейсы дробить по смыслу. DIP — зависить от абстракций, не от конкретных реализаций.',
          tradeoffs:'Плюс: низкая связность, тестируемость, гибкость. Минус: больше классов и файлов, может быть overkill для маленьких проектов.',
          code:`// SRP: разделяем парсинг и сохранение
class OrderParser { parse(data) { ... } }
class OrderRepository { save(order) { ... } }

// DIP: зависим от интерфейса, не от реализации
class OrderService {
  constructor(private repo: IOrderRepository) {}
  create(data) { return this.repo.save(new Order(data)) }
}`
        },
        links:[
          {label:'Martin Fowler — Design', url:'https://martinfowler.com/tags/design.html'},
          {label:'Uncle Bob — SOLID', url:'https://blog.cleancoder.com'}
        ],
        questions:['Нарушает ли God Object принцип SRP?','Как DIP помогает при тестировании?','Чем отличается ISP от SRP?']
      },
      {
        name:'DRY, KISS, YAGNI', tag:'principle', tagLabel:'Принцип',
        summary:'Три ключевых принципа простого и поддерживаемого кода.',
        short:'DRY — не повторяй себя. KISS — делай просто. YAGNI — не пиши то, что не нужно прямо сейчас.',
        medium:{
          theory:'DRY (Don\'t Repeat Yourself) — каждое знание имеет одно авторитетное место в системе. KISS (Keep It Simple) — простое решение лучше умного. YAGNI (You Aren\'t Gonna Need It) — не добавляй функциональность "на будущее".',
          tradeoffs:'Конфликт DRY vs KISS: DRY требует абстракций, KISS — простоты. Преждевременная абстракция (DRY раньше времени) создаёт сложность без пользы.',
          code:`// Нарушение DRY:
function calcUserTax(u) { return u.income * 0.13 }
function calcCompanyTax(c) { return c.income * 0.13 }

// DRY:
function calcTax(entity, rate = 0.13) {
  return entity.income * rate
}`
        },
        links:[{label:'YAGNI — Martin Fowler', url:'https://martinfowler.com/bliki/Yagni.html'}],
        questions:['Когда DRY вреден?','Как YAGNI связан с итеративной разработкой?','Что такое "wrong DRY"?']
      },
      {
        name:'Coupling & Cohesion', tag:'principle', tagLabel:'Принцип',
        summary:'Связность (cohesion) и зацепление (coupling) — два фундаментальных качества дизайна.',
        short:'Высокая cohesion (один модуль — одна тема) + низкий coupling (модули не знают деталей друг друга) = хорошая архитектура.',
        medium:{
          theory:'Coupling: насколько сильно один модуль зависит от внутренностей другого. Cohesion: насколько элементы внутри модуля связаны по смыслу. Цель: High Cohesion, Low Coupling.',
          tradeoffs:'Слабое зацепление упрощает изменения и тестирование в изоляции. Но иногда tight coupling оправдан ради производительности.',
          code:`// Tight coupling (плохо — знает о деталях БД):
class Order {
  save() { db.query('INSERT INTO orders...') }
}

// Loose coupling (лучше — зависит от интерфейса):
class Order {
  save(repo: IRepository) { repo.save(this) }
}`
        },
        links:[{label:'Coupling vs Cohesion', url:'https://wiki.c2.com/?CouplingAndCohesion'}],
        questions:['Что хуже: высокий coupling или низкая cohesion?','Как DI снижает coupling?']
      }
    ]
  },);
