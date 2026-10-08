// Shared doca renderer. Reads window.SECTIONS (populated by sections/*.js)
// and window.DOCA_CONFIG (set inline in each subject's index.html).

(function () {
  const DATA = window.SECTIONS || [];
  const CFG = window.DOCA_CONFIG || {};
  const pluralWords = CFG.plural || ['тема', 'темы', 'тем'];
  const noResultsMsg = CFG.noResults || 'Ничего не найдено. Попробуй другой запрос.';
  const tagClsMap = Object.assign(
    {
      jvm: 'tag-jvm', threads: 'tag-threads', spring: 'tag-spring', design: 'tag-design',
      basics: 'tag-basics', oop: 'tag-oop', advanced: 'tag-advanced', patterns: 'tag-patterns',
      database: 'tag-database', rest: 'tag-rest', micro: 'tag-micro', devops: 'tag-devops', soft: 'tag-soft',
      pattern: 'tag-pattern', style: 'tag-style', principle: 'tag-principle',
      infra: 'tag-infra', security: 'tag-security', scale: 'tag-scale',
      method: 'tag-method', schema: 'tag-schema', scd: 'tag-scd', fact: 'tag-fact', concept: 'tag-concept',
      arch: 'tag-arch', process: 'tag-process', storage: 'tag-storage', pipeline: 'tag-pipeline'
    },
    CFG.tagMap || {}
  );
  const defaultTag = CFG.defaultTag || 'tag-jvm';
  const codeBlockClass = CFG.codeBlockClass || 'code-block';

  let activeSection = 'all';
  let expandedCard = null;

  function escHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function plural(n, f1, f2, f5) {
    const v = Math.abs(n) % 100;
    if (v >= 11 && v <= 19) return f5;
    const v2 = v % 10;
    if (v2 === 1) return f1;
    if (v2 >= 2 && v2 <= 4) return f2;
    return f5;
  }

  function buildSidebar() {
    const nav = document.getElementById('sidebarNav');
    const total = DATA.reduce((s, d) => s + d.topics.length, 0);

    const allBtn = document.createElement('button');
    allBtn.className = 'nav-item active';
    allBtn.dataset.section = 'all';
    allBtn.innerHTML = `<span class="icon">📚</span> ${CFG.allLabel} <span class="nav-badge">${total}</span>`;
    allBtn.onclick = () => setSection('all');
    nav.appendChild(allBtn);

    DATA.forEach(sec => {
      const btn = document.createElement('button');
      btn.className = 'nav-item';
      btn.dataset.section = sec.id;
      btn.innerHTML = `<span class="icon">${sec.icon}</span> ${sec.title} <span class="nav-badge">${sec.topics.length}</span>`;
      btn.onclick = () => setSection(sec.id);
      nav.appendChild(btn);
    });
  }

  function setSection(id) {
    activeSection = id;
    expandedCard = null;
    document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.section === id));
    render();
  }

  function matches(t, q) {
    if (!q) return true;
    if (t.name.toLowerCase().includes(q)) return true;
    if (t.summary.toLowerCase().includes(q)) return true;
    if (t.short.toLowerCase().includes(q)) return true;
    if (t.medium && t.medium.theory && t.medium.theory.toLowerCase().includes(q)) return true;
    if (t.tools && t.tools.some(tool => tool.toLowerCase().includes(q))) return true;
    return false;
  }

  function sectionHeaderHtml(sec, count) {
    if (sec.desc) {
      return `
        <div class="section-icon" style="background:${sec.iconBg}">${sec.icon}</div>
        <div class="section-meta">
          <div class="section-title">${sec.title}</div>
          <div class="section-desc">${sec.desc}</div>
        </div>
        <span class="section-count">${count} ${plural(count, ...pluralWords)}</span>
      `;
    }
    return `
      <div class="section-icon" style="background:${sec.iconBg}">${sec.icon}</div>
      <span class="section-title">${sec.title}</span>
      <span class="section-count">${count} ${plural(count, ...pluralWords)}</span>
    `;
  }

  function render() {
    const q = document.getElementById('search').value.toLowerCase().trim();
    const main = document.getElementById('mainContent');
    main.innerHTML = '';
    let total = 0;

    DATA.forEach(sec => {
      if (activeSection !== 'all' && sec.id !== activeSection) return;
      const filtered = sec.topics.filter(t => matches(t, q));
      if (!filtered.length) return;
      total += filtered.length;

      const block = document.createElement('div');
      block.className = 'section-block';
      block.id = 'sec-' + sec.id;
      block.innerHTML = `
        <div class="section-header">${sectionHeaderHtml(sec, filtered.length)}</div>
        <div class="topics-grid"></div>
      `;
      const grid = block.querySelector('.topics-grid');
      filtered.forEach(t => grid.appendChild(buildCard(t)));
      main.appendChild(block);
    });

    if (!total) {
      main.innerHTML = `<div class="no-results">${noResultsMsg}</div>`;
    }
  }

  function toolsRowHtml(topic) {
    if (!topic.tools || !topic.tools.length) return '';
    return `<div class="tools-row">${topic.tools.map(t => `<span class="tool-chip">${t}</span>`).join('')}</div>`;
  }

  function buildCard(topic) {
    const card = document.createElement('div');
    card.className = 'topic-card' + (expandedCard === topic.name ? ' expanded' : '');

    const tagCls = tagClsMap[topic.tag] || defaultTag;

    card.innerHTML = `
      <div class="card-top">
        <span class="card-name">${topic.name}</span>
        <span class="card-tag ${tagCls}">${topic.tagLabel}</span>
      </div>
      <div class="card-summary">${topic.summary}</div>
      <div class="card-details">
        <div class="levels">
          <button class="level-btn ${expandedCard === topic.name ? 'lv1' : ''}" data-lv="1">🟡 Кратко</button>
          <button class="level-btn" data-lv="2">🟠 Подробнее</button>
          <button class="level-btn" data-lv="3">🔴 Глубоко</button>
        </div>
        <div class="level-content" data-panel="1">${topic.short}</div>
        <div class="level-content" data-panel="2" style="display:none">
          <p>${topic.medium.theory}</p>
          <div class="tradeoffs">
            <div class="tradeoffs-label">Trade-offs</div>
            ${topic.medium.tradeoffs}
          </div>
          <pre class="${codeBlockClass}">${escHtml(topic.medium.code)}</pre>
          ${toolsRowHtml(topic)}
        </div>
        <div class="level-content" data-panel="3" style="display:none">
          <div class="questions">
            <div class="questions-label">Вопросы для самопроверки</div>
            ${topic.questions.map(q => `<div class="q-item"><span class="q-arrow">→</span>${q}</div>`).join('')}
          </div>
          <div class="links-row">
            ${topic.links.map(l => `<a class="ext-link" href="${l.url}" target="_blank" rel="noopener">↗ ${l.label}</a>`).join('')}
          </div>
        </div>
      </div>
    `;

    card.addEventListener('click', e => {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') return;
      expandedCard = expandedCard === topic.name ? null : topic.name;
      render();
    });

    card.querySelectorAll('.level-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const lv = btn.dataset.lv;
        card.querySelectorAll('.level-btn').forEach(b => b.className = 'level-btn');
        btn.classList.add('lv' + lv);
        card.querySelectorAll('[data-panel]').forEach(p => {
          p.style.display = p.dataset.panel === lv ? 'block' : 'none';
        });
      });
    });

    return card;
  }

  buildSidebar();
  render();

  document.getElementById('search').addEventListener('input', () => {
    expandedCard = null;
    render();
  });
})();
