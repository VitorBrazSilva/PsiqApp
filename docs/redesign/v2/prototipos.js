/* Protótipo local: dados sintéticos em memória, sem chamadas à API ou armazenamento. */
(() => {
  'use strict';
  const icons = {
    people: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18M8 15h2M14 15h2"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    arrow: '<path d="m9 5 7 7-7 7"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    spark: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z"/>',
    link: '<path d="M10 13a5 5 0 0 0 7 .2l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7-.2l-3 3a5 5 0 0 0 7 7l2-2"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    shield: '<path d="M12 3 3 7v5c0 5 9 9 9 9s9-4 9-9V7zM12 8v5M12 16h.01"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    trend: '<path d="m3 17 6-6 4 4 8-10M15 5h6v6"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.9-2M4 4v5h5M4 13a8 8 0 0 0 14.9 2M20 20v-5h-5"/>',
    eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  };
  const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.file}</svg>`;
  const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const demoPatientId = 'helena-demo';
  const patients = [{ id: demoPatientId, nome: 'Helena Duarte', cpf: '52998224725', dataNascimento: '1992-03-18', telefone: '(11) 90000-0000', email: 'helena.ficticia@example.test', queixaInicial: 'Dificuldade para dormir e mudanças na rotina.' }];
  const records = [
    { id: 'setembro', date: '2026-09-10T14:30', title: 'Parecer clínico', text: 'Relata sono mais regular nas últimas duas semanas e retomada de caminhadas pela manhã. Refere que manter uma rotina tem ajudado na organização do dia. Ainda percebe dificuldade para desacelerar após o trabalho.', mood: 'Tranquila durante a consulta', medication: 'Não informado', created: '10 set. 2026, 15:08', original: true },
    { id: 'agosto', date: '2026-08-13T14:30', title: 'Parecer clínico', text: 'Refere dificuldade para iniciar o sono em dias de maior demanda profissional. Conta que tem reservado pouco tempo para atividades de lazer. Mantém contato frequente com a irmã e descreve essa relação como fonte de apoio.', mood: 'Apreensiva com a rotina', medication: 'Não informado', created: '13 ago. 2026, 15:12', original: true },
    { id: 'julho', date: '2026-07-16T14:30', title: 'Parecer clínico', text: 'Primeiro registro de acompanhamento. Relata mudanças recentes na rotina de trabalho e horários de sono irregulares. Apresenta o contexto familiar e descreve as atividades que gostaria de retomar.', mood: 'Não informado', medication: 'Não informado', created: '16 jul. 2026, 15:05', original: true },
  ].map(record => ({ ...record, pacienteId: demoPatientId }));
  const appointments = [{ date: '2026-09-24T14:30', status: 'Agendada' }, { date: '2026-09-10T14:30', status: 'Realizada' }, { date: '2026-08-13T14:30', status: 'Realizada' }].map(item => ({ ...item, pacienteId: demoPatientId }));
  // Mesma relação do contrato real: seção[] → item → evidencias[].
  const evidence = (registroId, campo, citacao) => ({ apelidoRegistro: { julho: 'R1', agosto: 'R2', setembro: 'R3' }[registroId], registroId, campo, citacao });
  const analysis = {
    pacienteId: demoPatientId,
    modo: 'LONGITUDINAL',
    linhaDoTempo: [
      { texto: 'Em julho, foram registrados horários de sono irregulares e mudanças na rotina profissional.', natureza: 'RELATO', evidencias: [evidence('julho', 'TEXTO', 'Relata mudanças recentes na rotina de trabalho e horários de sono irregulares.')] },
      { texto: 'Em agosto, o relato associa dificuldade para iniciar o sono a dias de maior demanda no trabalho.', natureza: 'RELATO', evidencias: [evidence('agosto', 'TEXTO', 'Refere dificuldade para iniciar o sono em dias de maior demanda profissional.')] },
      { texto: 'Em setembro, relata sono mais regular e retomada das caminhadas pela manhã.', natureza: 'RELATO', evidencias: [evidence('setembro', 'TEXTO', 'Relata sono mais regular nas últimas duas semanas e retomada de caminhadas pela manhã.')] },
    ],
    padroes: [
      { texto: 'A rotina profissional aparece relacionada ao sono ou à dificuldade de desacelerar em mais de um relato.', natureza: 'INTERPRETACAO', evidencias: [evidence('agosto', 'TEXTO', 'Refere dificuldade para iniciar o sono em dias de maior demanda profissional.'), evidence('setembro', 'TEXTO', 'Ainda percebe dificuldade para desacelerar após o trabalho.')] },
      { texto: 'A retomada de atividades pessoais aparece como tema recorrente, com desejo registrado em julho e caminhadas relatadas em setembro.', natureza: 'INTERPRETACAO', evidencias: [evidence('julho', 'TEXTO', 'Apresenta o contexto familiar e descreve as atividades que gostaria de retomar.'), evidence('setembro', 'TEXTO', 'Relata sono mais regular nas últimas duas semanas e retomada de caminhadas pela manhã.')] },
    ],
    pontosDeAtencao: [
      { texto: 'Apesar do sono mais regular relatado em setembro, ainda há menção à dificuldade para desacelerar após o trabalho.', natureza: 'INTERPRETACAO', evidencias: [evidence('setembro', 'TEXTO', 'Ainda percebe dificuldade para desacelerar após o trabalho.')] },
      { texto: 'Em agosto, o estado/humor foi registrado como apreensivo em relação à rotina.', natureza: 'RELATO', evidencias: [evidence('agosto', 'HUMOR', 'Apreensiva com a rotina')] },
      { texto: 'O pouco tempo para lazer foi mencionado no relato de agosto.', natureza: 'RELATO', evidencias: [evidence('agosto', 'TEXTO', 'Conta que tem reservado pouco tempo para atividades de lazer.')] },
    ],
    limitacoes: ['Histórico de três consultas. Os relatos não permitem estabelecer relações de causa.', 'A análise apoia a leitura; a decisão clínica é do médico.'],
  };
  const analysisSections = [
    { key: 'linhaDoTempo', label: 'Linha do tempo resumida', description: 'Evolução relatada em cada consulta', icon: 'file' },
    { key: 'padroes', label: 'Padrões observados', description: 'Temas mencionados em mais de um momento', icon: 'trend' },
    { key: 'pontosDeAtencao', label: 'Pontos de atenção', description: 'Aspectos que pedem leitura atenta', icon: 'eye' },
  ];
  const evidenceFields = { TEXTO: 'Texto do parecer', HUMOR: 'Estado/humor', MEDICAMENTOS: 'Medicações em uso' };
  let patientId = demoPatientId;
  let patientSearch = '';
  let patientDraft = {};
  let direction = 'foco';
  let view = 'prontuario';
  let section = 'historico';
  let analysisGroup = analysisSections[0].key;
  let feedbackTimer;
  let priorFocus;
  let dirty = false;
  const drafts = new Map();
  const app = document.getElementById('app');
  const dialog = document.getElementById('dialog');
  const dateFormat = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeFormat = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const formatDate = value => dateFormat.format(new Date(value));
  const formatTime = value => timeFormat.format(new Date(value));
  const demo = `<span class="demo-badge">${icon('shield')} Somente dados fictícios</span>`;
  const currentPatient = () => patients.find(patient => patient.id === patientId);
  const patientRecords = () => records.filter(record => record.pacienteId === patientId);
  const currentAnalysis = () => analysis.pacienteId === patientId ? analysis : null;
  const originalCount = () => patientRecords().filter(record => record.original).length;
  const initials = name => name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toLocaleUpperCase('pt-BR');
  const age = birth => {
    const now = new Date();
    const born = new Date(`${birth}T12:00:00`);
    return now.getFullYear() - born.getFullYear() - (now.getMonth() < born.getMonth() || (now.getMonth() === born.getMonth() && now.getDate() < born.getDate()) ? 1 : 0);
  };
  const normalized = value => value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');

  function readUrl() {
    const query = new URLSearchParams(window.location.search);
    direction = query.get('direcao') === 'leitura' ? 'leitura' : 'foco';
    view = ['pacientes', 'agenda'].includes(query.get('tela')) ? query.get('tela') : 'prontuario';
    section = ['analise', 'historico', 'consultas', 'dados'].includes(query.get('secao')) ? query.get('secao') : 'analise';
    const requestedGroup = query.get('grupo');
    analysisGroup = analysisSections.some(group => group.key === requestedGroup) ? requestedGroup : analysisSections[0].key;
    const requestedPatient = query.get('paciente') || demoPatientId;
    patientId = patients.some(patient => patient.id === requestedPatient) ? requestedPatient : demoPatientId;
    if (requestedPatient !== patientId) view = 'pacientes';
  }
  function navigate(changes, push = true) {
    if (dialog.open) closeDialog();
    direction = changes.direction || direction;
    view = changes.view || view;
    section = changes.section || section;
    if (analysisSections.some(group => group.key === changes.analysisGroup)) analysisGroup = changes.analysisGroup;
    if (changes.patientId && patients.some(patient => patient.id === changes.patientId)) patientId = changes.patientId;
    if (push) {
      const url = new URL(window.location.href);
      url.searchParams.set('direcao', direction);
      url.searchParams.set('tela', view);
      url.searchParams.set('secao', section);
      url.searchParams.set('paciente', patientId);
      url.searchParams.set('grupo', analysisGroup);
      window.history.pushState({}, '', url);
    }
    render();
    const focusTarget = changes.analysisGroup ? document.getElementById('analysis-active-title') : document.getElementById('conteudo');
    focusTarget?.focus({ preventScroll: !changes.analysisGroup });
  }
  function render() {
    document.body.dataset.direction = direction;
    document.querySelectorAll('.direction-picker button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.direction === direction)));
    document.title = `PsiqApp — Redesign v2 / ${direction === 'foco' ? 'Foco clínico' : 'Leitura serena'}`;
    app.innerHTML = `<div class="app-shell">
      <aside class="sidebar">
        <div class="brand"><svg class="brand-mark" viewBox="0 0 36 40" aria-hidden="true"><path d="M18 34V9M18 23C5 23 5 7 5 7s13 0 13 16ZM18 29c13 0 13-18 13-18S18 11 18 29Z" stroke-width="2.2"/></svg>PsiqApp</div>
        <div class="workspace-label">Seu espaço de cuidado</div>
        <nav class="primary-nav" aria-label="Navegação principal">
          <button type="button" data-view="pacientes" class="${view !== 'agenda' ? 'active' : ''}" ${view !== 'agenda' ? 'aria-current="page"' : ''}>${icon('people')}Pacientes<span class="nav-count">${patients.length}</span></button>
          <button type="button" data-view="agenda" class="${view === 'agenda' ? 'active' : ''}" ${view === 'agenda' ? 'aria-current="page"' : ''}>${icon('calendar')}Agenda</button>
        </nav>
        <div class="sidebar-note"><strong>Ambiente de demonstração</strong>Explore com dados fictícios. As alterações duram apenas até recarregar a página.</div>
        <div class="account"><span class="account-avatar">MD</span><div><strong>Médico demonstrativo</strong><small>Consultório particular</small></div></div>
      </aside>
      <div class="app-body">
        <header class="topbar"><div class="breadcrumb">${view === 'agenda' ? '<span>Agenda</span>' : `<button type="button" data-view="pacientes">Pacientes</button>${icon('arrow')}<span>${view === 'prontuario' ? 'Prontuário' : 'Todos os pacientes'}</span>`}</div><div class="topbar-tools"><button type="button" class="search-button" data-action="search">${icon('search')}Encontrar paciente</button>${demo}</div></header>
        <main id="conteudo" tabindex="-1">${view === 'prontuario' ? patientPage() : view === 'pacientes' ? patientsPage() : agendaPage()}
          <footer class="page-footer"><span>Protótipo navegável. Nenhum dado é enviado ou salvo no servidor.</span><span>${direction === 'foco' ? 'A / Foco clínico' : 'B / Leitura serena'}</span></footer>
        </main>
      </div>
    </div>`;
  }
  function patientPage() {
    const patient = currentPatient();
    return `<div class="patient-heading">
      <div class="patient-avatar" aria-hidden="true">${escape(initials(patient.nome))}</div>
      <div class="patient-name"><h1>${escape(patient.nome)}</h1><p class="patient-subtitle"><span>${age(patient.dataNascimento)} anos</span><span>${originalCount()} pareceres originais</span><span>Paciente fictício</span></p></div>
      <div class="heading-actions"><button type="button" class="secondary" data-action="schedule">${icon('calendar')}Agendar consulta</button><button type="button" class="primary" data-action="new-note">${icon('plus')}Novo parecer</button></div>
    </div>
    <nav class="patient-tabs" aria-label="Seções do prontuário">
      <button type="button" data-section="historico" aria-pressed="${section === 'historico'}">Histórico clínico <span class="count">${patientRecords().length}</span></button>
      <button type="button" data-section="analise" aria-pressed="${section === 'analise'}">Análise de IA</button>
      <button type="button" data-section="consultas" aria-pressed="${section === 'consultas'}">Consultas</button>
      <button type="button" data-section="dados" aria-pressed="${section === 'dados'}">Dados pessoais</button>
    </nav>
    ${section === 'historico' ? historyPage() : section === 'analise' ? analysisPage() : section === 'consultas' ? consultationsPage() : personalPage()}`;
  }
  function nextAppointment() { return appointments.filter(item => item.pacienteId === patientId && item.status === 'Agendada').sort((a, b) => a.date.localeCompare(b.date))[0]; }
  function historyPage() {
    const next = nextAppointment();
    return `${next ? `<section class="appointment-strip" aria-label="Próxima consulta"><div class="calendar-tile" aria-hidden="true"><small>${new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(next.date))}</small><strong>${new Date(next.date).getDate()}</strong></div><div><h2>Próxima consulta</h2><p>${formatDate(next.date)} às ${formatTime(next.date)}</p></div><span class="status-badge">${icon('clock')}Agendada</span><button class="text-button" type="button" data-section="consultas">Ver consultas ${icon('arrow')}</button></section>` : ''}
    <div class="workspace">
      <aside class="reading-aside" aria-label="Contexto do paciente"><div class="reading-context"><h2>Em acompanhamento</h2><dl><div><dt>Registros clínicos</dt><dd>${originalCount()} pareceres originais</dd></div><div><dt>Queixa inicial</dt><dd>${escape(currentPatient().queixaInicial || 'Não informada')}</dd></div></dl>${next ? `<div class="reading-appointment"><h2>Próxima consulta</h2><strong>${formatDate(next.date)}</strong><p>Às ${formatTime(next.date)}</p><span class="status-badge">Agendada</span><br><button class="text-button" type="button" data-section="consultas">Ver consultas ${icon('arrow')}</button></div>` : ''}</div><div class="reading-ai">${icon('spark')}<h2>Um olhar sobre o histórico</h2><p>${currentAnalysis() ? 'Cada observação possui suas próprias evidências, vinculadas aos registros originais.' : 'Ainda não há análise disponível para este paciente.'}</p><button class="text-button" type="button" data-section="analise">Explorar análise ${icon('arrow')}</button></div></aside>
      <section class="records-area" aria-labelledby="history-title"><div class="records-heading"><h2 id="history-title">Histórico clínico</h2><span class="muted">Mais recentes primeiro</span></div>${patientRecords().length ? `<ol class="timeline">${patientRecords().map(recordCard).join('')}</ol>` : '<div class="clinical-empty"><h3>O acompanhamento começa aqui</h3><p>Este paciente ainda não tem registros clínicos. Use “Novo parecer” para registrar o primeiro atendimento.</p></div>'}</section>
      ${insights()}
    </div>`;
  }
  function recordCard(record) {
    return `<li class="timeline-item" id="registro-${escape(record.id)}"><time class="record-date" datetime="${escape(record.date)}">${formatDate(record.date)} <span aria-hidden="true">/</span> ${formatTime(record.date)}</time><article class="record-card"><div class="record-top"><h3>${icon('file')}${record.title}</h3><span class="record-type">${record.original ? 'Registro original' : 'Complemento'}</span></div><p class="record-body">${escape(record.text)}</p><div class="record-facts"><span>${icon('eye')}${escape(record.mood)}</span>${record.medication !== 'Não informado' ? `<span>Medicações: ${escape(record.medication)}</span>` : ''}</div>${record.parent ? `<p class="muted"><small>Complemento do parecer de ${formatDate(records.find(item => item.id === record.parent).date)}. Original preservado.</small></p>` : ''}<div class="record-bottom"><span class="record-author">Registrado em ${escape(record.created)}</span>${record.original ? `<button type="button" class="text-button" data-complement="${escape(record.id)}">Adicionar complemento ${icon('plus')}</button>` : ''}</div></article></li>`;
  }
  function insights() {
    const current = currentAnalysis();
    if (!current) return `<aside class="insights" aria-label="Análise de inteligência artificial"><div class="insight-title">${icon('spark')}<h2>Análise de IA</h2></div><p class="section-intro">Ainda não há análise para este paciente.</p><p class="muted">${originalCount() ? 'O protótipo não executa gerações de IA. No sistema, os registros salvos seguem disponíveis durante o processamento.' : 'Registre um parecer para começar. Sem um parecer original, não há conteúdo para análise.'}</p></aside>`;
    return `<aside class="insights" aria-label="Análise de inteligência artificial"><div class="insight-title">${icon('spark')}<h2>Análise longitudinal</h2><span class="ai-label">IA</span></div><p class="insight-meta">Gerada em 10 set. 2026, 15:10<br>Baseada em 3 pareceres originais${patientRecords().length > 3 ? '<br><strong>Há novos registros ainda não analisados.</strong>' : ''}</p>
      ${analysisSections.map(group => `<details class="analysis-group" data-analysis-group="${group.key}" ${section === 'analise' || group.key === 'padroes' ? 'open' : ''}><summary>${icon(group.icon)}<span>${group.label}</span><span class="analysis-count">${current[group.key].length}</span>${icon('arrow')}</summary><ul class="analysis-items">${current[group.key].map((item, index) => `<li class="analysis-observation" data-observation="${group.key}-${index}"><span class="observation-nature">${item.natureza === 'RELATO' ? 'Relato registrado' : 'Interpretação da IA'}</span><p>${escape(item.texto)}</p><button class="evidence-link" type="button" data-evidence-group="${group.key}" data-evidence-index="${index}" aria-label="Ver evidências: ${escape(item.texto)}">${icon('link')}${item.evidencias.length} ${item.evidencias.length === 1 ? 'evidência' : 'evidências'} desta observação ${icon('arrow')}</button></li>`).join('')}</ul></details>`).join('')}
      <div class="ai-disclaimer"><strong>Limites desta análise</strong>${current.limitacoes.map(limit => `<p>${escape(limit)}</p>`).join('')}</div>
      ${section !== 'analise' ? `<button class="text-button" type="button" data-section="analise">Abrir análise e histórico ${icon('arrow')}</button>` : `<button class="text-button" type="button" data-action="regenerate">Atualizar análise ${icon('arrow')}</button>`}
    </aside>`;
  }
  function analysisPage() {
    const current = currentAnalysis();
    if (!current) {
      return `<section class="analysis-empty" aria-labelledby="analysis-empty-title"><div class="analysis-heading-kicker">${icon('spark')}Análise de IA</div><h2 id="analysis-empty-title">Ainda não há análise para este paciente</h2><p>${originalCount() ? 'O protótipo não executa gerações de IA. No sistema, os registros salvos seguem disponíveis durante o processamento.' : 'Registre um parecer para começar. Sem um parecer original, não há conteúdo para análise.'}</p></section>`;
    }
    const activeGroup = analysisSections.find(group => group.key === analysisGroup) || analysisSections[0];
    const items = current[activeGroup.key] || [];
    const totalObservations = analysisSections.reduce((total, group) => total + current[group.key].length, 0);
    return `<section class="analysis-view" aria-labelledby="analysis-view-title">
      <header class="analysis-view-header">
        <div class="analysis-view-heading">
          <div class="analysis-heading-kicker">${icon('spark')}Análise de IA</div>
          <h2 id="analysis-view-title">Análise longitudinal</h2>
          <p>Observações organizadas por tema, com acesso aos registros que lhes dão origem.</p>
        </div>
        <div class="analysis-view-actions"><button type="button" class="secondary" data-action="ai-history">Histórico de análises</button><button type="button" class="primary" data-action="regenerate">${icon('refresh')}Atualizar análise</button></div>
      </header>
      <dl class="analysis-summary" aria-label="Resumo da análise">
        <div><dt>Pareceres considerados</dt><dd>3</dd></div>
        <div><dt>Observações</dt><dd>${totalObservations}</dd></div>
        <div><dt>Atualizada em</dt><dd>10 set. 2026, 15:10</dd></div>
      </dl>
      ${patientRecords().length > 3 ? `<p class="analysis-pending">${icon('clock')}Há novos registros ainda não analisados.</p>` : ''}
      <div class="analysis-browser">
        <nav class="analysis-rail" aria-label="Categorias da análise">
          <h3>Explorar por seção</h3>
          <div class="analysis-section-list">${analysisSections.map(group => `<button type="button" class="analysis-section-button" data-analysis-section="${group.key}" aria-pressed="${group.key === activeGroup.key}" aria-controls="analysis-results"><span class="analysis-section-icon">${icon(group.icon)}</span><span class="analysis-section-copy"><span class="analysis-section-label">${group.label}</span><span class="analysis-section-description">${group.description}</span></span><span class="analysis-count">${current[group.key].length}</span></button>`).join('')}</div>
          <p class="analysis-rail-help">Escolha uma seção para ler suas observações e consultar as fontes.</p>
        </nav>
        <section id="analysis-results" class="analysis-results" aria-labelledby="analysis-active-title">
          <header class="analysis-results-header"><div><h3 id="analysis-active-title" tabindex="-1">${activeGroup.label}</h3><p>${items.length} ${items.length === 1 ? 'observação nesta seção' : 'observações nesta seção'}</p></div><span class="analysis-results-icon">${icon(activeGroup.icon)}</span></header>
          ${items.length ? `<ol class="analysis-entry-list">${items.map((item, index) => `<li class="analysis-entry"><span class="observation-nature">${item.natureza === 'RELATO' ? 'Relato registrado' : 'Interpretação da IA'}</span><p>${escape(item.texto)}</p><button class="evidence-link" type="button" data-evidence-group="${activeGroup.key}" data-evidence-index="${index}" aria-label="Ver evidências: ${escape(item.texto)}">${icon('link')}${item.evidencias.length} ${item.evidencias.length === 1 ? 'evidência' : 'evidências'} desta observação ${icon('arrow')}</button></li>`).join('')}</ol>` : `<div class="analysis-category-empty"><h4>Esta seção está vazia</h4><p>Não há observações nesta categoria para a análise atual.</p></div>`}
        </section>
      </div>
      <aside class="analysis-limits" aria-label="Limites desta análise"><div class="analysis-limits-heading">${icon('shield')}<h3>Limites desta análise</h3></div><ul>${current.limitacoes.map(limit => `<li>${escape(limit)}</li>`).join('')}</ul></aside>
    </section>`;
  }
  function consultationsPage(global = false) {
    const rows = appointments.map((item, index) => ({ ...item, index })).filter(item => global || item.pacienteId === patientId);
    return `<section class="section-panel"><div class="records-heading"><h2>${global ? 'Agenda' : `Consultas de ${escape(currentPatient().nome.split(' ')[0])}`}</h2><button class="secondary" type="button" data-action="schedule">${icon('plus')}Agendar consulta</button></div><p class="section-intro">Agenda do acompanhamento. Horários de Brasília.</p>${rows.length ? rows.map(item => `<div class="consultation-row"><div class="calendar-tile" aria-hidden="true"><strong>${new Date(item.date).getDate()}</strong></div><div><h3>${formatDate(item.date)}</h3><p>${formatTime(item.date)}${global ? ` / ${escape(patients.find(patient => patient.id === item.pacienteId).nome)}` : ''}</p>${item.notes ? `<p>${escape(item.notes)}</p>` : ''}</div><span class="status-badge">${item.status === 'Realizada' ? icon('check') : icon('clock')}${item.status}</span>${item.status === 'Agendada' ? `<button class="text-button" type="button" data-status="${item.index}">Atualizar status ${icon('arrow')}</button>` : ''}</div>`).join('') : '<p class="empty">Nenhuma consulta agendada para este paciente.</p>'}</section>`;
  }
  function personalPage() {
    const patient = currentPatient();
    return `<section class="section-panel"><h2>Dados pessoais</h2><p class="section-intro">Paciente fictício para avaliação da interface.</p><dl class="details-grid"><div><dt>Nome completo</dt><dd>${escape(patient.nome)}</dd></div><div><dt>Nascimento</dt><dd>${formatDate(`${patient.dataNascimento}T12:00:00`)}</dd></div><div><dt>CPF</dt><dd>•••.•••.•••-${escape(patient.cpf.slice(-2))}</dd></div><div><dt>Telefone</dt><dd>${escape(patient.telefone)}</dd></div><div><dt>E-mail</dt><dd>${escape(patient.email)}</dd></div><div><dt>Queixa inicial</dt><dd>${escape(patient.queixaInicial || 'Não informada')}</dd></div></dl></section>`;
  }
  function patientsPage() {
    return `<section class="patients-page"><div class="page-heading"><div><h1>Pacientes</h1><p class="section-intro">Encontre um paciente ou inicie um novo acompanhamento.</p></div><button class="primary" type="button" data-action="new-patient">${icon('plus')}Novo paciente</button></div><div class="section-panel"><div class="list-toolbar"><label for="patient-search">Buscar por nome<input id="patient-search" name="busca" type="search" value="${escape(patientSearch)}" placeholder="Ex.: Helena…" autocomplete="off"></label><p class="muted"><small>${patients.length} ${patients.length === 1 ? 'paciente cadastrado' : 'pacientes cadastrados'}</small></p></div><div id="patient-results">${patientResults()}</div></div></section>`;
  }
  function patientResults() {
    const matches = patients.filter(patient => normalized(patient.nome).includes(normalized(patientSearch)));
    return matches.length ? matches.map(patient => `<button type="button" class="patient-result" data-view="prontuario" data-patient-id="${escape(patient.id)}"><span class="patient-avatar" aria-hidden="true">${escape(initials(patient.nome))}</span><span><strong>${escape(patient.nome)}</strong><small>${age(patient.dataNascimento)} anos / Paciente fictício</small></span><span class="patient-open">Abrir prontuário</span>${icon('arrow')}</button>`).join('') : '<p class="empty" role="status">Nenhum paciente encontrado. Tente outro nome ou cadastre um novo paciente.</p>';
  }
  function agendaPage() { return consultationsPage(true); }
  function showDialog(title, content) {
    if (!dialog.open) priorFocus = document.activeElement;
    dirty = false;
    dialog.innerHTML = `<div class="dialog-header"><h2 id="dialog-title">${title}</h2><button class="icon-button" type="button" data-action="close" aria-label="Fechar">${icon('close')}</button></div><div class="dialog-body">${content}</div>`;
    dialog.showModal();
    const input = dialog.querySelector('textarea, input:not([type=datetime-local]):not([type=hidden]), select');
    const focusTarget = input || document.getElementById('dialog-title');
    if (!input) focusTarget.setAttribute('tabindex', '-1');
    focusTarget.focus();
  }
  function closeDialog() {
    if (dirty && dialog.querySelector('[data-note-form]')) {
      const draft = Object.fromEntries(new FormData(dialog.querySelector('form')));
      drafts.set(`${draft.pacienteId}:${draft.parent}`, draft);
      announce('Rascunho mantido nesta página. Use “Novo parecer” ou “Adicionar complemento” para retomar.');
    } else if (dirty && dialog.querySelector('[data-patient-form]')) {
      patientDraft = Object.fromEntries(new FormData(dialog.querySelector('form')));
      announce('Cadastro em preenchimento mantido nesta página. Use “Novo paciente” para retomar.');
    }
    dirty = false;
    dialog.close();
    priorFocus?.focus({ preventScroll: true });
  }
  function noteForm(parent = '') {
    const saved = drafts.get(`${patientId}:${parent}`) || {};
    const original = patientRecords().find(item => item.id === parent && item.original);
    if (parent && !original) return;
    showDialog(parent ? 'Adicionar complemento' : 'Novo parecer', `<div class="demo-note">Simulação com dados fictícios. O conteúdo fica apenas nesta página.</div><form data-note-form novalidate><input type="hidden" name="parent" value="${escape(parent)}"><input type="hidden" name="pacienteId" value="${escape(patientId)}"><div class="form-context">${escape(currentPatient().nome)}${original ? `<br><span class="hint">Complemento do parecer de ${formatDate(original.date)}. O original será preservado.</span>` : ''}</div><label for="clinical-date">Data e hora clínica<input id="clinical-date" name="date" type="datetime-local" value="${escape(saved.date || '2026-09-22T14:30')}" aria-describedby="note-error" required><span class="hint">Pode corresponder a um atendimento anterior. Horário de Brasília.</span></label><label for="note-text">${parent ? 'Texto do complemento' : 'Texto do parecer'} <span class="hint">Obrigatório</span><textarea id="note-text" name="text" aria-describedby="note-error" required placeholder="Registre aqui o relato clínico fictício…">${escape(saved.text || '')}</textarea></label><p id="note-error" role="alert" class="validation-error" hidden></p><div class="form-grid"><label for="mood">Estado/humor <span class="hint">Opcional</span><input id="mood" name="mood" value="${escape(saved.mood || '')}"></label><label for="medication">Medicações em uso <span class="hint">Opcional</span><input id="medication" name="medication" value="${escape(saved.medication || '')}"></label></div><div class="form-actions"><button type="button" class="secondary" data-action="close">Voltar ao prontuário</button><button type="submit" class="primary">Simular salvamento</button></div></form>`);
  }
  function evidenceDialog(group, index) {
    const item = currentAnalysis()?.[group]?.[index];
    if (!item) return;
    const groupLabel = analysisSections.find(candidate => candidate.key === group).label;
    showDialog('Evidências desta observação', `<div class="observation-context"><span class="observation-nature">${groupLabel} / ${item.natureza === 'RELATO' ? 'Relato registrado' : 'Interpretação da IA'}</span><p>${escape(item.texto)}</p></div><p class="evidence-intro">${item.evidencias.length} ${item.evidencias.length === 1 ? 'trecho original vinculado' : 'trechos originais vinculados'} a esta observação.</p><ol class="evidence-list">${item.evidencias.map((entry, evidenceIndex) => {
      const record = patientRecords().find(record => record.id === entry.registroId);
      if (!record) return '';
      return `<li class="evidence-card" data-evidence-record="${escape(record.id)}"><div class="evidence-source-header"><h3>Parecer de ${formatDate(record.date)}</h3><span class="record-type">${record.original ? 'Original' : 'Complemento'}</span></div><span class="evidence-field">${evidenceFields[entry.campo]}</span><blockquote class="source-excerpt">${escape(entry.citacao)}</blockquote><button class="text-button" type="button" data-full-source="${escape(record.id)}" data-source-group="${group}" data-source-index="${index}" data-source-evidence="${evidenceIndex}">Abrir registro completo ${icon('arrow')}</button></li>`;
    }).join('')}</ol>`);
  }
  function sourceDialog(id, group, index, evidenceIndex) {
    const record = patientRecords().find(record => record.id === id);
    const item = currentAnalysis()?.[group]?.[index];
    const entry = item?.evidencias[evidenceIndex];
    if (!record || entry?.registroId !== id) return;
    const highlight = (value, field) => field === entry.campo ? escape(value).replace(escape(entry.citacao), `<mark>${escape(entry.citacao)}</mark>`) : escape(value);
    showDialog('Registro de origem', `<button class="text-button" type="button" data-evidence-group="${group}" data-evidence-index="${index}">Voltar às evidências desta observação</button><p class="section-intro">${escape(currentPatient().nome)} / Parecer de ${formatDate(record.date)}</p><h3>Texto original do médico</h3><p class="source-full-text">${highlight(record.text, 'TEXTO')}</p><dl class="details-grid"><div><dt>Estado/humor</dt><dd>${highlight(record.mood, 'HUMOR')}</dd></div><div><dt>Medicações em uso</dt><dd>${highlight(record.medication, 'MEDICAMENTOS')}</dd></div></dl><button class="text-button" type="button" data-goto="${escape(record.id)}">Abrir no histórico ${icon('arrow')}</button>`);
  }
  function scheduleForm() {
    showDialog('Agendar consulta', `<div class="demo-note">Agendamento simulado, sem envio ao servidor.</div><form data-schedule-form>${view === 'agenda' ? `<label for="schedule-patient">Paciente<select id="schedule-patient" name="pacienteId">${patients.map(patient => `<option value="${escape(patient.id)}" ${patient.id === patientId ? 'selected' : ''}>${escape(patient.nome)}</option>`).join('')}</select></label>` : `<input type="hidden" name="pacienteId" value="${escape(patientId)}"><div class="form-context">${escape(currentPatient().nome)} / Paciente fictício</div>`}<label for="schedule-date">Data e hora<input id="schedule-date" name="date" type="datetime-local" value="2026-10-22T14:30" required></label><label for="schedule-notes">Observações <span class="hint">Opcionais; não entram na análise de IA.</span><textarea id="schedule-notes" name="notes" style="min-height:100px"></textarea></label><div class="form-actions"><button class="secondary" type="button" data-action="close">Cancelar</button><button class="primary" type="submit">Simular agendamento</button></div></form>`);
  }
  function statusForm(index) {
    const appointment = appointments[index];
    if (!appointment || appointment.status !== 'Agendada') return;
    const patient = patients.find(item => item.id === appointment.pacienteId);
    showDialog('Atualizar consulta', `<form data-status-form data-index="${index}"><p>Consulta de ${escape(patient.nome)} em ${formatDate(appointment.date)}, às ${formatTime(appointment.date)}.</p><label for="appointment-status">Novo status<select id="appointment-status" name="status"><option>Realizada</option><option>Cancelada</option><option>Falta</option></select></label><div class="demo-note">No MVP, este status é definitivo. Nesta demonstração, a mudança existe apenas até recarregar a página.</div><div class="form-actions"><button type="button" class="secondary" data-action="close">Voltar</button><button type="submit" class="primary">Confirmar simulação</button></div></form>`);
  }
  function patientForm() {
    const field = (name, label, type = 'text', extra = '') => `<div class="registration-field"><label for="patient-${name}">${label}</label><input id="patient-${name}" name="${name}" type="${type}" value="${escape(patientDraft[name] || '')}" required aria-describedby="patient-${name}-error" ${extra}><p class="validation-error" id="patient-${name}-error" hidden></p></div>`;
    showDialog('Novo paciente', `<div class="demo-note">Use apenas dados fictícios. Este cadastro é uma simulação local.</div><div class="registration-intro"><p>Os dados abaixo identificam o paciente e seu prontuário.</p><button class="text-button" type="button" data-action="fill-demo-patient">Preencher exemplo fictício</button></div><form data-patient-form novalidate><div id="registration-errors" role="alert" tabindex="-1" class="validation-summary" hidden></div>${field('nome', 'Nome completo', 'text', 'autocomplete="name"')}<div class="form-grid">${field('cpf', 'CPF', 'text', 'inputmode="numeric" maxlength="14" autocomplete="off" placeholder="000.000.000-00"')}${field('dataNascimento', 'Data de nascimento', 'date', 'autocomplete="bday"')}</div><div class="form-grid">${field('telefone', 'Telefone com DDD', 'tel', 'autocomplete="tel" placeholder="(11) 90000-0000"')}${field('email', 'E-mail', 'email', 'autocomplete="email" spellcheck="false" placeholder="paciente@example.test"')}</div><label for="patient-queixaInicial">Queixa inicial <span class="hint">Opcional</span><textarea id="patient-queixaInicial" name="queixaInicial" class="short-textarea" placeholder="Descreva o motivo inicial do acompanhamento…">${escape(patientDraft.queixaInicial || '')}</textarea></label><p class="hint">Nome, CPF, nascimento, telefone e e-mail são obrigatórios.</p><div class="form-actions"><button type="button" class="secondary" data-action="close">Voltar à lista</button><button type="submit" class="primary">Cadastrar e abrir prontuário</button></div></form>`);
  }
  function validCpf(value) {
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
    const calculate = length => {
      const remainder = digits.slice(0, length).split('').reduce((total, digit, index) => total + Number(digit) * (length + 1 - index), 0) * 10 % 11;
      return remainder === 10 ? 0 : remainder;
    };
    return calculate(9) === Number(digits[9]) && calculate(10) === Number(digits[10]);
  }
  function fakeCpf() {
    let digits = Array.from(crypto.getRandomValues(new Uint8Array(9)), digit => digit % 10);
    for (const length of [9, 10]) {
      const remainder = digits.reduce((total, digit, index) => total + digit * (length + 1 - index), 0) * 10 % 11;
      digits.push(remainder === 10 ? 0 : remainder);
    }
    const value = digits.join('');
    return validCpf(value) && !patients.some(patient => patient.cpf === value) ? value : fakeCpf();
  }
  function savePatient(form, data) {
    const errors = {};
    if (!data.nome.trim()) errors.nome = 'Informe o nome do paciente.';
    const cpf = data.cpf.replace(/\D/g, '');
    if (!validCpf(cpf)) errors.cpf = 'Informe um CPF válido para a demonstração.';
    else if (patients.some(patient => patient.cpf === cpf)) errors.cpf = 'Já existe um paciente com este CPF.';
    const birth = new Date(`${data.dataNascimento}T00:00:00`);
    if (!data.dataNascimento || Number.isNaN(birth.getTime())) errors.dataNascimento = 'Informe a data de nascimento.';
    else if (birth > new Date()) errors.dataNascimento = 'A data de nascimento não pode estar no futuro.';
    let phone = data.telefone.replace(/\D/g, '');
    if (phone.startsWith('55') && phone.length > 11) phone = phone.slice(2);
    if (![10, 11].includes(phone.length)) errors.telefone = 'Informe um telefone com DDD.';
    if (!/^\S+@\S+\.\S+$/.test(data.email.trim())) errors.email = 'Informe um e-mail válido.';
    for (const name of ['nome', 'cpf', 'dataNascimento', 'telefone', 'email']) {
      const input = form.elements.namedItem(name);
      input.setAttribute('aria-invalid', String(Boolean(errors[name])));
      const error = document.getElementById(`patient-${name}-error`);
      error.textContent = errors[name] || '';
      error.hidden = !errors[name];
    }
    const summary = document.getElementById('registration-errors');
    if (Object.keys(errors).length) {
      summary.hidden = false;
      summary.innerHTML = `<strong>Revise os campos indicados.</strong><ul>${Object.entries(errors).map(([name, message]) => `<li><a href="#patient-${name}">${escape(message)}</a></li>`).join('')}</ul>`;
      summary.focus();
      return;
    }
    const patient = { id: `paciente-${crypto.randomUUID()}`, nome: data.nome.trim(), cpf, dataNascimento: data.dataNascimento, telefone: data.telefone.trim(), email: data.email.trim(), queixaInicial: data.queixaInicial.trim() || null };
    patients.push(patient);
    patientSearch = '';
    patientDraft = {};
    dirty = false;
    closeDialog();
    navigate({ view: 'prontuario', section: 'historico', patientId: patient.id });
    announce('Paciente cadastrado na demonstração. O prontuário está pronto para o primeiro parecer.');
  }
  function announce(message) {
    clearTimeout(feedbackTimer);
    document.getElementById('feedback').textContent = message;
    feedbackTimer = setTimeout(() => { document.getElementById('feedback').textContent = ''; }, 7000);
  }
  document.addEventListener('click', event => {
    const errorLink = event.target.closest('.validation-summary a');
    if (errorLink) {
      event.preventDefault();
      document.getElementById(errorLink.hash.slice(1))?.focus();
      return;
    }
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.direction) return navigate({ direction: button.dataset.direction });
    if (button.dataset.view) return navigate({ view: button.dataset.view, section: 'historico', patientId: button.dataset.patientId });
    if (button.dataset.section) return navigate({ section: button.dataset.section });
    if (button.dataset.analysisSection && button.dataset.analysisSection !== analysisGroup) return navigate({ analysisGroup: button.dataset.analysisSection });
    if (button.dataset.complement) return noteForm(button.dataset.complement);
    if (button.dataset.evidenceGroup) return evidenceDialog(button.dataset.evidenceGroup, Number(button.dataset.evidenceIndex));
    if (button.dataset.fullSource) return sourceDialog(button.dataset.fullSource, button.dataset.sourceGroup, Number(button.dataset.sourceIndex), Number(button.dataset.sourceEvidence));
    if (button.dataset.status !== undefined) return statusForm(Number(button.dataset.status));
    if (button.dataset.goto) {
      if (!patientRecords().some(record => record.id === button.dataset.goto)) return;
      closeDialog();
      navigate({ view: 'prontuario', section: 'historico' });
      const target = document.getElementById(`registro-${button.dataset.goto}`);
      target.setAttribute('tabindex', '-1');
      target.focus();
      target.scrollIntoView({ block: 'center' });
      return;
    }
    switch (button.dataset.action) {
      case 'new-patient': patientForm(); break;
      case 'fill-demo-patient': {
        const values = { nome: 'Marina Exemplo', cpf: fakeCpf(), dataNascimento: '1995-04-12', telefone: '(11) 90000-0000', email: 'marina.ficticia@example.test', queixaInicial: 'Exemplo fictício para avaliação do cadastro.' };
        for (const [name, value] of Object.entries(values)) dialog.querySelector('form').elements.namedItem(name).value = value;
        dirty = true;
        document.getElementById('patient-nome').focus();
        break;
      }
      case 'new-note': noteForm(); break;
      case 'close': closeDialog(); break;
      case 'schedule': scheduleForm(); break;
      case 'search': navigate({ view: 'pacientes' }); document.getElementById('patient-search').focus(); break;
      case 'ai-history': if (currentAnalysis()) showDialog('Histórico de análises', '<p class="muted">Versões preservadas para consulta.</p><div class="consultation-row"><div><h3>10 de setembro de 2026, 15:10</h3><p>3 pareceres originais / Análise longitudinal</p></div><span class="status-badge">Versão atual</span></div><div class="consultation-row"><div><h3>13 de agosto de 2026, 15:14</h3><p>2 pareceres originais / Análise longitudinal</p></div><span class="status-badge">Anterior</span></div><p class="hint">Conteúdo ilustrativo. Nenhuma geração foi executada.</p>'); break;
      case 'regenerate': announce('A geração de IA não é executada neste protótipo. A versão ilustrativa permanece disponível.'); break;
      case 'about': showDialog('Foco clínico — direção escolhida', '<p>A direção A foi escolhida para o redesign. A B permanece apenas como referência da exploração inicial.</p><ul><li><strong>Cadastro de pacientes.</strong> Em Pacientes, use “Novo paciente”. É possível preencher um exemplo fictício e abrir seu prontuário vazio.</li><li><strong>Análise por observação.</strong> Cada seção contém vários itens. Cada item abre somente suas próprias evidências, com citação, campo e registro original.</li><li><strong>Contexto preservado.</strong> Cadastros, pareceres, consultas e rascunhos ficam separados por paciente durante a demonstração.</li></ul><p class="demo-note" style="margin-top:18px;margin-bottom:0">Protótipo local com dados fictícios. As simulações não alteram o MVP e desaparecem ao recarregar a página.</p>'); break;
    }
  });
  document.addEventListener('input', event => {
    if (event.target.id === 'patient-search') {
      patientSearch = event.target.value;
      document.getElementById('patient-results').innerHTML = patientResults();
    }
    if (dialog.contains(event.target)) dirty = true;
  });
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeDialog(); });
  dialog.addEventListener('submit', event => {
    event.preventDefault();
    const form = event.target;
    const data = Object.fromEntries(new FormData(form));
    if (form.hasAttribute('data-patient-form')) {
      savePatient(form, data);
    } else if (form.hasAttribute('data-note-form')) {
      const error = document.getElementById('note-error');
      if (!data.text.trim() || !data.date) {
        error.textContent = !data.text.trim() ? 'Escreva o texto do registro antes de salvar.' : 'Informe a data e a hora clínica.';
        error.hidden = false;
        const invalid = document.getElementById(!data.text.trim() ? 'note-text' : 'clinical-date');
        invalid.setAttribute('aria-invalid', 'true');
        invalid.focus();
        return;
      }
      const parent = data.parent || null;
      if (data.pacienteId !== patientId || (parent && !patientRecords().some(record => record.id === parent && record.original))) return;
      records.unshift({ id: `demo-${crypto.randomUUID()}`, pacienteId: patientId, date: data.date, title: parent ? 'Complemento do parecer' : 'Parecer clínico', text: data.text.trim(), mood: data.mood.trim() || 'Estado/humor não informado', medication: data.medication.trim() || 'Não informado', parent, original: !parent, created: `${formatDate(new Date())}, ${formatTime(new Date())} (simulação)` });
      records.sort((a, b) => b.date.localeCompare(a.date));
      drafts.delete(`${patientId}:${data.parent}`);
      dirty = false;
      closeDialog();
      navigate({ view: 'prontuario', section: 'historico' });
      announce(`${parent ? 'Complemento' : 'Parecer'} adicionado à demonstração. ${parent ? 'O registro original foi preservado.' : 'Nenhum dado foi enviado ao servidor.'}`);
    } else if (form.hasAttribute('data-schedule-form')) {
      if (!patients.some(patient => patient.id === data.pacienteId)) return;
      appointments.push({ pacienteId: data.pacienteId, date: data.date, status: 'Agendada', notes: data.notes.trim() });
      appointments.sort((a, b) => b.date.localeCompare(a.date));
      dirty = false;
      closeDialog();
      navigate({ view: 'prontuario', section: 'consultas', patientId: data.pacienteId });
      announce('Consulta adicionada à agenda demonstrativa. Nenhum dado foi enviado ao servidor.');
    } else if (form.hasAttribute('data-status-form')) {
      appointments[Number(form.dataset.index)].status = data.status;
      dirty = false;
      closeDialog();
      render();
      document.getElementById('conteudo').focus({ preventScroll: true });
      announce('Status atualizado apenas nesta demonstração.');
    }
  });
  window.addEventListener('beforeunload', event => {
    if (dirty || drafts.size || Object.keys(patientDraft).length) { event.preventDefault(); event.returnValue = ''; }
  });
  window.addEventListener('popstate', () => { if (dialog.open) closeDialog(); readUrl(); render(); document.getElementById('conteudo').focus({ preventScroll: true }); });
  readUrl();
  render();
})();
