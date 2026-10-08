window.SECTIONS = window.SECTIONS || [];
window.SECTIONS.push(  {
    id:'patterns', title:'Паттерны GoF', icon:'🧩', iconBg:'#EDE7F6',
    topics:[
      {
        name:'Creational: Factory, Builder, Singleton', tag:'pattern', tagLabel:'Паттерн',
        summary:'Паттерны создания объектов — управляют процессом инстанцирования.',
        short:'Factory — создаёт объекты без указания точного класса. Builder — строит сложный объект пошагово. Singleton — единственный экземпляр (осторожно — антипаттерн).',
        medium:{
          theory:'Abstract Factory — семья связанных объектов. Builder отделяет конструирование от представления. Singleton — удобно, но создаёт скрытую глобальную зависимость, что плохо для тестирования.',
          tradeoffs:'Singleton — глобальное состояние усложняет тесты и параллелизм. Builder — многословен, но делает создание сложного объекта читаемым. Factory Method — хорошая замена new.',
          code:`// Builder:
const query = new QueryBuilder()
  .select('id', 'name')
  .from('users')
  .where('active = true')
  .orderBy('created_at', 'desc')
  .limit(10)
  .build()

// Factory Method:
class NotificationFactory {
  create(type: string): INotification {
    if (type === 'email') return new EmailNotification()
    if (type === 'sms')   return new SmsNotification()
    if (type === 'push')  return new PushNotification()
  }
}`
        },
        links:[{label:'Refactoring.guru — Creational', url:'https://refactoring.guru/ru/design-patterns/creational-patterns'}],
        questions:['Почему Singleton считается антипаттерном?','Чем Factory Method отличается от Abstract Factory?','Когда Builder необходим?']
      },
      {
        name:'Structural: Adapter, Decorator, Facade', tag:'pattern', tagLabel:'Паттерн',
        summary:'Паттерны структуры — как составить объекты в более крупные структуры.',
        short:'Adapter — несовместимые интерфейсы. Decorator — добавляет поведение без наследования. Facade — упрощённый интерфейс к подсистеме.',
        medium:{
          theory:'Adapter (Wrapper) — переходник между интерфейсами (например, сторонняя библиотека). Decorator — оборачивает объект, добавляя новое поведение. Facade — скрывает сложность подсистемы за простым API.',
          tradeoffs:'Decorator vs наследование: декоратор компонуется в рантайме, гибче, но сложнее отлаживать. Facade упрощает использование, но может скрыть нужную функциональность.',
          code:`// Decorator: добавляем логирование без изменения класса
class LoggingOrderService implements IOrderService {
  constructor(private inner: IOrderService) {}

  async createOrder(dto: CreateOrderDto) {
    console.log('Creating order', dto)
    const result = await this.inner.createOrder(dto)
    console.log('Order created:', result.id)
    return result
  }
}

// Использование: декоратор прозрачен для клиента
const service = new LoggingOrderService(new OrderService())`
        },
        links:[{label:'Refactoring.guru — Structural', url:'https://refactoring.guru/ru/design-patterns/structural-patterns'}],
        questions:['Когда использовать Decorator вместо наследования?','Как Adapter связан с Anti-Corruption Layer?','Чем Facade отличается от Gateway?']
      },
      {
        name:'Behavioral: Observer, Strategy, Command', tag:'pattern', tagLabel:'Паттерн',
        summary:'Паттерны поведения — алгоритмы и взаимодействие объектов.',
        short:'Observer — подписка на события. Strategy — взаимозаменяемые алгоритмы. Command — инкапсуляция запроса как объекта (undo/redo).',
        medium:{
          theory:'Observer — основа EventEmitter, Rx. Strategy — выбор алгоритма в рантайме. Command — undo/redo, очереди. Chain of Responsibility — цепочка обработчиков (middleware в Express).',
          tradeoffs:'Observer создаёт неявные зависимости. Strategy требует знания доступных стратегий. Command — мощно, но много шаблонного кода.',
          code:`// Strategy: разные алгоритмы расчёта скидки
interface DiscountStrategy {
  calculate(price: number): number
}
class BlackFridayDiscount implements DiscountStrategy {
  calculate(p) { return p * 0.5 }
}
class VIPDiscount implements DiscountStrategy {
  calculate(p) { return p * 0.8 }
}

// Контекст выбирает стратегию в рантайме:
class PriceCalculator {
  constructor(private strategy: DiscountStrategy) {}
  getPrice(basePrice: number) {
    return this.strategy.calculate(basePrice)
  }
}`
        },
        links:[{label:'Refactoring.guru — Behavioral', url:'https://refactoring.guru/ru/design-patterns/behavioral-patterns'}],
        questions:['Чем Observer отличается от Event-Driven Architecture?','Когда Command паттерн особенно полезен?','Как работает Chain of Responsibility в middleware?']
      }
    ]
  },);
