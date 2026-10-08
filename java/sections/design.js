window.SECTIONS = window.SECTIONS || [];
window.SECTIONS.push(  {
    id:'design', title:'System Design', icon:'🏗️', iconBg:'#EDE7F6',
    topics:[
      {
        name:'Zero-Downtime Deployment', tag:'design', tagLabel:'Дизайн',
        summary:'Blue-Green, Canary и Expand-Contract миграции БД — обновление продакшена без остановки сервиса.',
        short:'Blue-Green: два идентичных окружения, трафик переключается сразу. Canary: постепенная выкатка на маленький процент серверов. Миграции БД: backward-совместимость через multi-step схему (Expand and Contract).',
        medium:{
          theory:'Expand and Contract: 1) Expand — добавить новую колонку/таблицу, старая продолжает работать; 2) Migrate — двойная запись + бэкфилл данных; 3) Contract — переключить чтение на новую схему, удалить старую. Каждая фаза деплоится отдельно, поэтому старая и новая версии приложения совместимы с текущей схемой БД. Дополнение: graceful shutdown, health probes (readiness/liveness), feature flags.',
        tradeoffs:'Blue-Green: мгновенный откат, но двойная стоимость инфраструктуры и нужна миграция stateful-частей. Canary: минимальный радиус поражения, но требуется метрики и автоматический rollback. Contract-фазу нельзя пропускать — иначе накапливается мёртвая схема.',
        code:`-- Expand: старое приложение работает как ни в чём не бывало
ALTER TABLE users ADD COLUMN full_name VARCHAR(255);

-- Migrate: приложение пишет в обе колонки
UPDATE users SET full_name = first_name || ' ' || last_name;

-- Приложение новой версии читает full_name...

-- Contract: только когда старый код полностью выведен
ALTER TABLE users DROP COLUMN first_name;
ALTER TABLE users DROP COLUMN last_name;

# Rolling deploy в Kubernetes:
# spec.strategy.rollingUpdate.maxUnavailable: 0
# readinessProbe: /actuator/health/readiness`
        },
        links:[
          {label:'ParallelChange (Expand-Contract)', url:'https://martinfowler.com/bliki/ParallelChange.html'},
          {label:'BlueGreenDeployment — Fowler', url:'https://martinfowler.com/bliki/BlueGreenDeployment.html'},
          {label:'CanaryRelease — Fowler', url:'https://martinfowler.com/bliki/CanaryRelease.html'}
        ],
        questions:['Как деплоить удаление колонки без простоя?','Чем Blue-Green отличается от Rolling Update?','Как canary определить процент трафика и критерии отката?']
      }
    ]
  },);
