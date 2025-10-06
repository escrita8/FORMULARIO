(function(){
  const steps = Array.from(document.querySelectorAll('.step'));
  const progressBar = document.getElementById('progressBar');
  const footerPrev = document.querySelector('.footer-controls [data-action="prev"]');
  const footerNext = document.querySelector('.footer-controls [data-action="next"]');
  const adminBar = document.getElementById('adminBar');
  const exportCsvBtn = document.getElementById('exportCsvBtn');

  const answers = { R1:null,R2:null,R3:null,Q1:null,Q2:null,Q3:null,Q4:null,Q5:null };
  const answerMeta = { R1:null,R2:null,R3:null,Q1:null,Q2:null,Q3:null,Q4:null,Q5:null };
  let current = 0;
  const URL_PARAMS = new URLSearchParams(window.location.search);
  const DEBUG = URL_PARAMS.get('debug') === '1';
  let submissionSent = false;

  const weights = { R1:0.10,R2:0.10,R3:0.10,Q1:0.10,Q2:0.10,Q3:0.10,Q4:0.10,Q5:0.10 };

  const questionTitles = {
    R1: 'Ramo de atividade',
    R2: 'Número de funcionários',
    R3: 'Faturamento anual',
    Q1: 'Regime tributário atual',
    Q2: 'Regime dos fornecedores',
    Q3: 'Perfil de clientes',
    Q4: 'Conhecimento fiscal do cadastro',
    Q5: 'Organização financeira'
  };

  const levelStyles = {
    alto: { icon:'🔥', label:'Alto impacto' },
    medio: { icon:'⚠️', label:'Impacto moderado' },
    baixo: { icon:'ℹ️', label:'Impacto baixo' }
  };

  const ACTION_PRIORITY_TAGS = {
    cadastro:{ alto:'Prioridade máxima', medio:'Prioridade', baixo:'Checklist contínuo' },
    equipe:{ alto:'Treinar agora', medio:'Alinhar processos', baixo:'Reciclagem' },
    financeiro:{ alto:'Organizar caixa', medio:'Afinar controles', baixo:'Saúde constante' },
    contabil:{ alto:'Blindar compliance', medio:'Fortalecer compliance', baixo:'Manter compliance' }
  };

  const ACTION_PLAN_TEMPLATES = [
    {
      category:'cadastro',
      icon:'🗂️',
      title:'Recadastrar todos os itens com as regras da reforma',
      subtitle:'A 3C organiza o mutirão de saneamento fiscal e confere item a item.',
      description:'Atualize NCM, CST, CFOP, IVA e regras de destino para não perder créditos nem sofrer autuações.'
    },
    {
      category:'equipe',
      icon:'🎓',
      title:'Treinar a equipe para a transição CBS/IBS',
      subtitle:'Mentorias práticas, simulados e playbooks conduzidos pela 3C.',
      description:'Garanta que fiscal, compras, vendas e TI saibam operar as novas notas e entender créditos.'
    },
    {
      category:'financeiro',
      icon:'💰',
      title:'Fortalecer o financeiro para jogar o jogo dos créditos',
      subtitle:'Implementamos controles, dashboards e rotinas de conferência diária.',
      description:'Separe contas, projete fluxo de caixa e acompanhe créditos CBS/IBS antes de precificar.'
    },
    {
      category:'contabil',
      icon:'📚',
      title:'Garantir contabilidade estratégica para evitar impostos indevidos',
      subtitle:'Time 3C valida obrigações, acompanha legislações e ajusta o planejamento tributário.',
      description:'Cruze escrituração com cadastros e notas para recolher só o necessário e evitar autuações.'
    }
  ];


  function generateActionPlans(level){
    return ACTION_PLAN_TEMPLATES.map(item=>({
      icon:item.icon,
      title:item.title,
      subtitle:item.subtitle,
      description:item.description,
      category:item.category,
      tag:ACTION_PRIORITY_TAGS[item.category]?.[level] || ACTION_PRIORITY_TAGS[item.category]?.medio || 'Prioridade'
    }));
  }

  const actionPlans = {
    alto: generateActionPlans('alto'),
    medio: generateActionPlans('medio'),
    baixo: generateActionPlans('baixo')
  };

  const serviceOffers = {
    alto:[
      {
        icon:'🤝',
        title:'Escritório fiscal dedicado 3C',
        subtitle:'Exemplo: squad temporário com 2 analistas e revisões semanais',
        description:'Assumimos o recadastro completo, entregamos cronograma de implantação CBS/IBS e acompanhamos o go-live.',
        category:'consultoria',
        tag:'Implantação 360°'
      },
      {
        icon:'🧭',
        title:'Projeto de governança financeira',
        subtitle:'Exemplo: modelo de fluxo de caixa com visão de créditos CBS/IBS',
        description:'Criamos dashboards, rotinas de conciliação e simulações para dar fôlego ao caixa durante a transição.',
        category:'bpo',
        tag:'BPO Financeiro'
      },
      {
        icon:'🛡️',
        title:'Compliance tributário contínuo',
        subtitle:'Exemplo: revisão mensal + reporte executivo para diretoria',
        description:'Monitoramos legislações, cruzamos obrigações acessórias e evitamos recolhimentos indevidos.',
        category:'compliance',
        tag:'Controle total'
      }
    ],
    medio:[
      {
        icon:'🧰',
        title:'Kit de transição CBS/IBS',
        subtitle:'Exemplo: checklist + planilhas de simulação já configuradas',
        description:'Guiamos ajustes de cadastro, sugerimos priorização por margem e apontamos ganhos rápidos.',
        category:'consultoria',
        tag:'Plano guiado'
      },
      {
        icon:'📊',
        title:'Painéis financeiros em tempo real',
        subtitle:'Exemplo: indicadores de créditos, margem e ruptura por fornecedor',
        description:'Integramos ERP e bancos de dados para que o financeiro acompanhe a reforma no dia a dia.',
        category:'bpo',
        tag:'Dados na mão'
      },
      {
        icon:'🎯',
        title:'Workshops setoriais',
        subtitle:'Exemplo: trilha para fiscais, compradores e vendedores',
        description:'Capacitamos a equipe com casos práticos e materiais exclusivos para reduzir erros na virada.',
        category:'treinamento',
        tag:'Capacitação'
      }
    ],
    baixo:[
      {
        icon:'🧭',
        title:'Mentoria de acompanhamento trimestral',
        subtitle:'Exemplo: revisão dos indicadores e ajustes pontuais',
        description:'Mantemos seu plano em dia, atualizamos cadastros e sinalizamos riscos antes que cresçam.',
        category:'consultoria',
        tag:'Supervisão 3C'
      },
      {
        icon:'🔎',
        title:'Auditoria preventiva de cadastros',
        subtitle:'Exemplo: varredura por amostragem e relatório com prioridade de correção',
        description:'Garantimos que a base continue limpa e aderente às mudanças da reforma.',
        category:'compliance',
        tag:'Checklist contínuo'
      },
      {
        icon:'💡',
        title:'Conteúdos e alertas exclusivos',
        subtitle:'Exemplo: boletins sobre normas CBS/IBS e oportunidades de crédito',
        description:'Receba atualizações rápidas e saiba quando agir para proteger margens e fluxo de caixa.',
        category:'treinamento',
        tag:'Atualização'
      }
    ]
  };

  function classifyImpactLevel(value){
    if(value >= 80) return 'alto';
    if(value >= 50) return 'medio';
    return 'baixo';
  }

  function formatMetaLabel(meta){
    if(Array.isArray(meta)){
      return meta.map(item=>item?.label || '').filter(Boolean).join(', ');
    }
    return meta?.label || '';
  }

  function buildInsightFor(key, value){
    const level = classifyImpactLevel(value);
    const meta = answerMeta[key];
    const labelText = formatMetaLabel(meta) || 'opção selecionada';
    const regimeMeta = answerMeta.Q1;
    const perfilMeta = answerMeta.Q3;
    const funcionariosMeta = answerMeta.R2;
    const fornecedoresMeta = answerMeta.Q2;
    let message = '';

    switch(key){
      case 'R1':{
        if(level === 'alto'){
          message = `O ramo ${labelText} é um dos mais pressionados pela CBS/IBS, exigindo revisão profunda de créditos e tributações.`;
        } else if(level === 'medio'){
          message = `O ramo ${labelText} terá ajustes importantes, mas manejáveis, à medida que a reforma avança.`;
        } else {
          message = `O ramo ${labelText} tende a sentir menos a reforma e ajudou a conter seu índice final.`;
        }
        break;
      }
      case 'R2':{
        const regimeLabel = regimeMeta?.label || 'seu regime atual';
        const perfilLabel = perfilMeta?.label || 'seu perfil de clientes';
        if(level === 'alto'){
          message = `Manter ${labelText} colaboradores combinado com ${regimeLabel} e ${perfilLabel} exige reorganizar processos e elevou o impacto.`;
        } else if(level === 'medio'){
          message = `O porte de equipe (${labelText}) demanda adaptações moderadas para acompanhar as novas regras.`;
        } else {
          message = `Uma equipe ${labelText} reduz o esforço de transição e suavizou o resultado.`;
        }
        break;
      }
      case 'R3':{
        if(level === 'alto'){
          message = `O faturamento ${labelText} posiciona sua empresa entre as que mais sentirão os novos cálculos e obrigações.`;
        } else if(level === 'medio'){
          message = `O faturamento ${labelText} requer atenção ao planejamento tributário, mas com impacto moderado.`;
        } else {
          message = `O faturamento ${labelText} mantém o impacto sob controle, contribuindo para um índice menor.`;
        }
        break;
      }
      case 'Q1':{
        const regimeKey = regimeMeta?.key;
        if(regimeKey === 'simples' && perfilMeta?.key === 'b2b' && level === 'alto'){
          message = 'Estar no Simples Nacional atendendo clientes B2B amplia perdas de crédito e aumentou o seu índice.';
        } else if(regimeKey === 'lucro_presumido' && level !== 'baixo'){
          message = 'O Lucro Presumido sofrerá com o fim do PIS/Cofins e deve considerar uma migração; isso pesou no impacto.';
        } else if(regimeKey === 'lucro_real' && level === 'alto'){
          message = 'O Lucro Real exige revisão detalhada de créditos e sistemas, elevando seu resultado final.';
        } else if(level === 'medio'){
          message = `${labelText} traz mudanças significativas, mas ainda dentro de um cenário moderado.`;
        } else {
          message = `${labelText} é menos afetado diretamente, ajudando a equilibrar o índice.`;
        }
        break;
      }
      case 'Q2':{
        const fornecedoresKey = fornecedoresMeta?.key;
        if(['simples_mei','pessoa_fisica','sem_nota'].includes(fornecedoresKey) && level !== 'baixo'){
          message = `Comprar de ${labelText} reduz créditos disponíveis e aumentou o impacto projetado.`;
        } else if(fornecedoresKey === 'regime_normal' && level === 'baixo'){
          message = 'Comprar de fornecedores com regime normal garante créditos melhores e ajudou a segurar o índice.';
        } else {
          message = `${labelText} exige monitorar créditos e contratos para não perder competitividade.`;
        }
        break;
      }
      case 'Q3':{
        const perfilKey = perfilMeta?.key;
        if(perfilKey === 'b2b' && level === 'alto'){
          message = 'Atender principalmente empresas (B2B) aumenta a disputa por créditos e elevou o impacto.';
        } else if(perfilKey === 'misto' && level !== 'baixo'){
          message = 'Ter um mix de clientes CNPJ e CPF exige estratégias distintas e sustentou um impacto moderado.';
        } else if(perfilKey === 'b2c' && level === 'baixo'){
          message = 'Focar no consumidor final (B2C) reduz a disputa por créditos e amenizou o índice.';
        } else {
          message = `${labelText} precisa de atenção especial para não perder benefícios durante a transição.`;
        }
        break;
      }
      case 'Q4':{
        const conhecimentoKey = Array.isArray(meta) ? null : meta?.key;
        if(conhecimentoKey === 'nao_entende'){
          message = 'Informar que o time não domina CST/CFOP/NCM/CEST indica alto risco de erros fiscais, elevando o impacto.';
        } else if(conhecimentoKey === 'razoavel'){
          message = 'Com conhecimento razoável, ainda há ajustes a fazer nos cadastros para evitar impactos maiores.';
        } else if(conhecimentoKey === 'domina'){
          message = 'Ter domínio completo dos cadastros ajudou a reduzir o impacto estimado.';
        } else {
          message = `${labelText} evidencia a necessidade de reforçar treinamento antes da virada dos tributos.`;
        }
        break;
      }
      case 'Q5':{
        const metaArray = Array.isArray(meta) ? meta : [];
        const hasBasico = metaArray.some(item=>item.key === 'financeiro_basico');
        const controles = metaArray.filter(item=>item.key !== 'financeiro_basico');
        if(hasBasico){
          message = 'Você marcou que o financeiro ainda é básico, o que aumenta o risco de perder créditos e elevou o índice.';
        } else if(controles.length >= 2 && level === 'baixo'){
          message = `Práticas como ${controles.map(item=>item.label).join(', ')} ajudam a preservar créditos e suavizaram o impacto.`;
        } else if(controles.length){
          message = `Os controles (${controles.map(item=>item.label).join(', ')}) ajudam, mas ainda há espaço para fortalecer o financeiro.`;
        } else {
          message = 'Poucos controles financeiros informados aumentam a chance de perder créditos da reforma.';
        }
        break;
      }
      default:
        break;
    }

    if(!message){
      message = `A resposta "${labelText}" apareceu como um fator de ${levelStyles[level].label.toLowerCase()} no cálculo final.`;
    }

    return {
      key,
      title: questionTitles[key] || 'Fator',
      level,
      label: labelText,
      message
    };
  }

  function buildInsights(details){
  const sorted = [...details].sort((a,b)=>b.contrib - a.contrib);
  let relevant = sorted.filter(item=>item.value > 0);
    if(!relevant.length) relevant = sorted.slice(0,3);
    return relevant.slice(0,4).map(detail=>buildInsightFor(detail.key, detail.value));
  }

  function renderInsights(details){
    const activeStep = steps[current];
    if(!activeStep) return;
    const container = activeStep.querySelector('[data-role="insights"]');
    if(!container) return;
    container.innerHTML = '';
    const insights = buildInsights(details);
    if(!insights.length){
      const empty = document.createElement('p');
      empty.className = 'result-insights__empty';
      empty.textContent = 'Complete o diagnóstico para ver os principais fatores de impacto.';
      container.appendChild(empty);
      return;
    }

    insights.forEach(info=>{
      const item = document.createElement('div');
      item.className = `result-insights__item result-insights__item--${info.level}`;

      const badge = document.createElement('span');
      badge.className = 'result-insights__badge';
      badge.textContent = levelStyles[info.level].icon;

      const content = document.createElement('div');
      content.className = 'result-insights__content';

      const heading = document.createElement('span');
      heading.className = 'result-insights__heading';
      heading.textContent = info.title;

      const label = document.createElement('span');
      label.className = 'result-insights__label';
      label.textContent = `Resposta: ${info.label}`;

      const text = document.createElement('p');
      text.className = 'result-insights__text';
      text.textContent = info.message;

      content.appendChild(heading);
      content.appendChild(label);
      content.appendChild(text);

      const tag = document.createElement('span');
      tag.className = 'result-insights__tag';
      tag.textContent = levelStyles[info.level].label;

      item.appendChild(badge);
      item.appendChild(content);
      item.appendChild(tag);

      container.appendChild(item);
    });
  }

  function renderActions(resultClass){
    const activeStep = steps[current];
    if(!activeStep) return;
    const container = activeStep.querySelector('[data-role="actions"]');
    if(!container) return;
    container.innerHTML = '';
  const plans = actionPlans[resultClass] || [];
    if(!plans.length){
      const empty = document.createElement('p');
      empty.className = 'result-actions__empty';
      empty.textContent = 'Breve adicionaremos planos de ação personalizados aqui.';
      container.appendChild(empty);
      return;
    }

    plans.forEach(plan=>{
      const item = document.createElement('div');
      item.className = `result-actions__item result-actions__item--${plan.category}`;

      const badge = document.createElement('span');
      badge.className = `result-actions__badge result-actions__badge--${plan.category}`;
      badge.textContent = plan.icon;

      const content = document.createElement('div');
      content.className = 'result-actions__content';

      const heading = document.createElement('span');
      heading.className = 'result-actions__heading';
      heading.textContent = plan.title;

      const label = document.createElement('span');
      label.className = 'result-actions__label';
      if(plan.subtitle){
        label.textContent = plan.subtitle;
      }

      const text = document.createElement('p');
      text.className = 'result-actions__text';
      text.textContent = plan.description;

      content.appendChild(heading);
      if(plan.subtitle) content.appendChild(label);
      content.appendChild(text);

      item.appendChild(badge);
      item.appendChild(content);
      if(plan.tag){
        const tag = document.createElement('span');
        tag.className = `result-actions__tag result-actions__tag--${plan.category}`;
        tag.textContent = plan.tag;
        item.appendChild(tag);
      }

      container.appendChild(item);
    });

  }

  function renderServices(resultClass){
    const activeStep = steps[current];
    if(!activeStep) return;
    const container = activeStep.querySelector('[data-role="services"]');
    if(!container) return;
    container.innerHTML = '';
  const offers = serviceOffers[resultClass] || [];
    if(!offers.length){
      const empty = document.createElement('p');
      empty.className = 'result-services__empty';
      empty.textContent = 'Em breve, adicionaremos exemplos de como a 3C pode apoiar sua empresa.';
      container.appendChild(empty);
      return;
    }

    offers.forEach(offer=>{
      const item = document.createElement('div');
      item.className = `result-services__item result-services__item--${offer.category}`;

      const badge = document.createElement('span');
      badge.className = `result-services__badge result-services__badge--${offer.category}`;
      badge.textContent = offer.icon;

      const content = document.createElement('div');
      content.className = 'result-services__content';

      const heading = document.createElement('span');
      heading.className = 'result-services__heading';
      heading.textContent = offer.title;

      const label = document.createElement('span');
      label.className = 'result-services__label';
      if(offer.subtitle){
        label.textContent = offer.subtitle;
      }

      const text = document.createElement('p');
      text.className = 'result-services__text';
      text.textContent = offer.description;

      content.appendChild(heading);
      if(offer.subtitle) content.appendChild(label);
      content.appendChild(text);

      item.appendChild(badge);
      item.appendChild(content);

      if(offer.tag){
        const tag = document.createElement('span');
        tag.className = `result-services__tag result-services__tag--${offer.category}`;
        tag.textContent = offer.tag;
        item.appendChild(tag);
      }

      container.appendChild(item);
    });

  }

  const multiEvaluators = {
    Q5(selected){
      const keys = selected.map(btn=>btn.dataset.optionKey);
      const informative = keys.filter(k=>k && k !== 'financeiro_basico');
      const hasFragile = keys.includes('financeiro_basico');
      let impact = hasFragile ? 95 : 60;
      impact -= informative.length * 10;
      if(hasFragile && informative.length <= 1){
        impact = Math.max(impact, 98);
      } else if(hasFragile){
        impact = Math.max(impact, 85);
      } else if(!informative.length){
        impact = Math.max(impact, 75);
      }
      impact = Math.min(100, Math.max(15, Math.round(impact)));
      return impact;
    }
  };

  function getContactIndex(){
    const idx = steps.findIndex(s=>s.querySelector('#contactForm'));
    return idx === -1 ? steps.length - 1 : idx;
  }

  function setStep(idx){
    steps.forEach(step=>step.classList.remove('active'));
    const step = steps[idx];
    if(step){
      step.classList.add('active');
      current = idx;
      updateProgress();
      updateFooterControls();
    }
  }

  function updateProgress(){
    const contactIdx = getContactIndex();
    const percent = Math.min((current / contactIdx) * 100, 100);
    if(progressBar) progressBar.style.width = `${percent}%`;
  }

  function updateFooterControls(){
    const footer = document.querySelector('.footer-controls');
    if(!footer) return;
    const isResult = steps[current]?.dataset.result;
    footer.style.display = current === 0 || isResult ? 'none' : 'flex';

    if(footerPrev) footerPrev.style.display = current>0 ? 'inline-flex' : 'none';

    const contactIdx = getContactIndex();
    if(footerNext){
      if(current===0) footerNext.textContent = 'Começar';
      else if(current===contactIdx) footerNext.textContent = 'Ver resultado';
      else footerNext.textContent = 'Próximo';
    }

    const active = steps[current];
    const container = active?.querySelector('.options');
    if(footerNext){
      if(container){
        const qk = container.dataset.question;
        footerNext.disabled = (answers[qk]==null);
      } else {
        footerNext.disabled = false;
      }
    }

    if(current === contactIdx){
      const nome = (document.querySelector('input[name="nome"]').value||'').trim();
      const whatsapp = (document.querySelector('input[name="whatsapp"]').value||'').trim();
      const missing = !(nome && whatsapp);
      if(footerNext) footerNext.disabled = missing;
      const inStepNext = active?.querySelector('[data-action="next"]');
      if(inStepNext) inStepNext.disabled = missing;
    }
  }

  function selectOption(btn){
    const container = btn.parentElement;
    const question = container.dataset.question;
    const isMulti = container.dataset.multi === 'true';

    if(isMulti){
      btn.classList.toggle('selected');
      const selected = Array.from(container.querySelectorAll('.option.selected'));
      if(!selected.length){
        answers[question] = null;
        answerMeta[question] = null;
      } else {
        const evaluator = multiEvaluators[question];
        const value = evaluator ? evaluator(selected) : Math.round(selected.reduce((acc,item)=>acc+Number(item.dataset.value||0),0) / selected.length || 0);
        answers[question] = value;
        answerMeta[question] = selected.map(item=>({
          key: item.dataset.optionKey || null,
          label: item.textContent.trim()
        }));
      }
      updateFooterControls();
      return;
    }

    Array.from(container.querySelectorAll('.option')).forEach(option=>option.classList.remove('selected'));
    btn.classList.add('selected');
    answers[question] = Number(btn.dataset.value || 0);
    answerMeta[question] = {
      key: btn.dataset.optionKey || null,
      label: btn.textContent.trim()
    };
    updateFooterControls();
    setTimeout(()=>nextStep(), 150);
  }

  function nextStep(){
    const contactIdx = getContactIndex();
    if(current < contactIdx){
      setStep(current + 1);
      return;
    }
    if(current === contactIdx){
      if(!validateContact()){
        const firstErr = document.querySelector('.form input.error');
        if(firstErr){
          firstErr.focus({ preventScroll:false });
          firstErr.scrollIntoView({ behavior:'smooth', block:'center' });
        }
        return;
      }
      const score = computeScore();
      showResult(score);
    }
  }

  function prevStep(){
    if(current>0){
      setStep(current-1);
    }
  }

  function buildAdjustedAnswers(){
    const values = { ...answers };
    const largeTeam = ['50-80','80+'];
  const regime = answerMeta.Q1?.key;
  const perfil = answerMeta.Q3?.key;
  const ramo = answerMeta.R1?.key;
  const funcionarios = answerMeta.R2?.key;
  const fornecedores = answerMeta.Q2?.key;
  const faturamento = answerMeta.R3?.key;
  const conhecimento = answerMeta.Q4?.key;

    if(regime === 'simples'){
      if(perfil === 'b2c'){
        values.Q1 = 0;
        values.R2 = 30;
      } else if(perfil === 'b2b'){
        const base = largeTeam.includes(funcionarios) ? 95 : 90;
        values.Q1 = Math.max(values.Q1 ?? 0, base);
        if(ramo === 'servico'){
          values.R2 = 100;
        } else if(ramo === 'venda' || ramo === 'venda_servico'){
          values.R2 = Math.max(values.R2 ?? 0, 90);
        } else {
          values.R2 = Math.max(values.R2 ?? 0, 85);
        }
      } else if(perfil === 'misto'){
        values.Q1 = Math.max(values.Q1 ?? 0, 80);
        values.R2 = Math.max(values.R2 ?? 0, largeTeam.includes(funcionarios) ? 85 : 70);
      }
    }

    if(regime === 'lucro_presumido' || regime === 'lucro_real'){
      const base = regime === 'lucro_presumido' ? 90 : 75;
      values.Q1 = Math.max(values.Q1 ?? 0, base);
      if((ramo === 'servico' || ramo === 'venda_servico') && largeTeam.includes(funcionarios)){
        values.Q1 = Math.max(values.Q1, 96);
      }
      values.R2 = Math.max(values.R2 ?? 0, 90);
    }

    if(['lucro_presumido','lucro_real'].includes(regime) && ['simples_mei','pessoa_fisica','sem_nota'].includes(fornecedores)){
      values.Q2 = Math.max(values.Q2 ?? 0, 95);
    }
    if(regime === 'simples' && perfil === 'b2b' && ['simples_mei','pessoa_fisica'].includes(fornecedores)){
      values.Q2 = Math.max(values.Q2 ?? 0, 92);
    }
    if(fornecedores === 'sem_nota'){
      values.Q2 = Math.max(values.Q2 ?? 0, 95);
    }

    if(perfil === 'export'){
      values.Q3 = Math.min(values.Q3 ?? 0, 30);
    }
    if(perfil === 'nao_sei'){
      values.Q3 = Math.max(values.Q3 ?? 0, 70);
    }
    if(regime === 'simples' && perfil === 'b2c'){
      values.Q3 = Math.max(Math.min(values.Q3 ?? 0, 35), 0);
    }
    if(['lucro_presumido','lucro_real'].includes(regime)){
      const basePerfil = perfil === 'b2c' ? 70 : 90;
      values.Q3 = Math.max(values.Q3 ?? 0, basePerfil);
    }

    if(regime === 'simples' && perfil === 'b2b' && largeTeam.includes(funcionarios) && conhecimento === 'nao_entende'){
      values.Q4 = 100;
    } else if(conhecimento === 'nao_entende'){
      values.Q4 = Math.max(values.Q4 ?? 0, 90);
    } else if(conhecimento === 'nao_sabe'){
      values.Q4 = Math.max(values.Q4 ?? 0, 85);
    }

    if(faturamento === 'acima_2m' && largeTeam.includes(funcionarios)){
      values.R3 = Math.max(values.R3 ?? 0, 90);
    }
    if(regime === 'lucro_presumido' && ['500k_1m','1m_2m','acima_2m'].includes(faturamento)){
      values.R3 = Math.max(values.R3 ?? 0, 85);
    }

    Object.keys(values).forEach(key=>{
      const raw = values[key];
      values[key] = raw==null || Number.isNaN(raw) ? 0 : Math.max(0, Math.min(100, Math.round(raw)));
    });

    return values;
  }

  function computeScore(){
    const adjusted = buildAdjustedAnswers();
    const details = [];
    const weightSum = Object.values(weights).reduce((acc,weight)=>acc + weight, 0);
    const total = Object.entries(weights).reduce((acc,[key,weight])=>{
      const value = Number(adjusted[key] ?? 0);
      const contrib = value * weight;
      details.push({ key, value, weight, contrib: Math.round(contrib * 100) / 100 });
      return acc + contrib;
    }, 0);
    const normalized = weightSum > 0 ? total / weightSum : 0;
    const score = Math.round(normalized * 100) / 100;
    return { score, details };
  }

  function easeOutCubic(t){
    return 1 - Math.pow(1 - t, 3);
  }

  function animateNumber(el, target){
    if(!el) return;
    if(el.__raf) cancelAnimationFrame(el.__raf);
    const duration = 1300;
    const start = performance.now();
    el.textContent = '0';
    function frame(now){
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.round(easeOutCubic(progress) * target);
      el.textContent = value;
      if(progress < 1){
        el.__raf = requestAnimationFrame(frame);
      }
    }
    el.__raf = requestAnimationFrame(frame);
  }

  function animateBar(el, target){
    if(!el) return;
    el.style.transition = 'none';
    el.style.width = '0%';
    void el.offsetWidth;
    el.style.transition = '';
    requestAnimationFrame(()=>{ el.style.width = `${target}%`; });
  }

  function getLevelByScore(score){
    if(score>=65) return 'alto';
    if(score>=40) return 'medio';
    return 'baixo';
  }

  function updateImpactMeters(score, resultClass){
    const level = getLevelByScore(score);
    ['Alto','Medio','Baixo'].forEach(key=>{
      const valueEl = document.getElementById(`impactValue${key}`);
      const barEl = document.getElementById(`impactBar${key}`);
      const meterEl = valueEl?.closest('.impact-meter');
      if(meterEl) meterEl.dataset.level = level;
      if(!valueEl) return;
      if(key.toLowerCase() === resultClass){
        animateNumber(valueEl, score);
        animateBar(barEl, score);
      } else {
        valueEl.textContent = score;
        if(barEl) barEl.style.width = `${score}%`;
      }
    });
  }

  function showResult(scoreOrObj){
    const { score, details } = typeof scoreOrObj === 'number' ? { score: scoreOrObj, details: [] } : scoreOrObj;
    const scoreInt = Math.round(score);

    const nome = (document.querySelector('input[name="nome"]').value||'').trim();
    const prefix = nome ? `Olá, sou ${encodeURIComponent(nome)}. ` : 'Olá, ';

  const whatsPhone = '5567996987023';
  document.getElementById('whatsAlto').href = `https://wa.me/${whatsPhone}?text=${prefix}vi meu resultado no diagnóstico (alto impacto) e quero um plano de ação.`;
  document.getElementById('whatsMedio').href = `https://wa.me/${whatsPhone}?text=${prefix}preciso de um diagnóstico detalhado sobre meu Índice de Impacto (médio).`;
  document.getElementById('whatsBaixo').href = `https://wa.me/${whatsPhone}?text=${prefix}tenho dúvidas rápidas sobre meu resultado (baixo impacto).`;

    const mailtoLink = document.getElementById('mailtoMedio');
    if(mailtoLink){
      const email = (document.querySelector('input[name="email"]').value||'').trim();
      const subject = encodeURIComponent('Checklist Reforma Tributária – 3C CONTABILIDADE');
      const body = encodeURIComponent(`Olá,\n\nPoderia me enviar o checklist por e-mail?\n\nScore: ${scoreInt}/100\nNome: ${nome||'-'}\nE-mail: ${email||'-'}\n\nObrigado(a).`);
      mailtoLink.href = `mailto:luis@3ccontabilidade.com.br?subject=${subject}&body=${body}`;
    }

    let targetStepIndex = null;
    let resultClass = 'baixo';
    if(score>=65){
      resultClass = 'alto';
      targetStepIndex = steps.findIndex(s=>s.dataset.result==='alto');
    } else if(score>=40){
      resultClass = 'medio';
      targetStepIndex = steps.findIndex(s=>s.dataset.result==='medio');
    } else {
      targetStepIndex = steps.findIndex(s=>s.dataset.result==='baixo');
    }

    setStep(targetStepIndex);
    requestAnimationFrame(()=>{
      updateImpactMeters(scoreInt, resultClass);
      renderInsights(details);
      renderActions(resultClass);
      renderServices(resultClass);
    });

    applyUTMs();
    persistSubmission({ score: scoreInt, details, resultClass });
  }

  function applyUTMs(){
    const params = new URLSearchParams(window.location.search);
    const utms = ['utm_source','utm_medium','utm_campaign'];
    document.querySelectorAll('a[href^="https://wa.me/"]').forEach(link=>{
      const url = new URL(link.href);
      utms.forEach(utm=>{
        const value = params.get(utm);
        if(value) url.searchParams.set(utm, value);
      });
      link.href = url.toString();
    });
  }

  function persistSubmission({ score, details, resultClass }){
    if(submissionSent){
      if(DEBUG) console.log('[ENVIO] Ignorado: submissão já enviada');
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const utm = {
      utm_source: params.get('utm_source')||'',
      utm_medium: params.get('utm_medium')||'',
      utm_campaign: params.get('utm_campaign')||''
    };
    const contact = {
      nome: (document.querySelector('input[name="nome"]').value||'').trim(),
      empresa: (document.querySelector('input[name="empresa"]').value||'').trim(),
      whatsapp: (document.querySelector('input[name="whatsapp"]').value||'').trim(),
      email: (document.querySelector('input[name="email"]').value||'').trim()
    };
    const payload = {
      ts: new Date().toISOString(),
      score,
      answers: { ...answers },
      details: details || [],
      contact,
      utm
    };
    const endpointPayload = {
      ts: payload.ts,
      score: payload.score,
      result: resultClass,
      contact,
      utm
    };
    try{
      const key = 'reforma_submissions_v1';
      const list = JSON.parse(localStorage.getItem(key)||'[]');
      list.push(payload);
      localStorage.setItem(key, JSON.stringify(list));
      postToEndpoint(endpointPayload);
      submissionSent = true;
    }catch(err){
      console.warn('Falha ao salvar localmente', err);
    }
  }

  function toCsv(items){
    const headers = [
      'ts','score','R1','R2','R3','Q1','Q2','Q3','Q4','Q5','nome','empresa','whatsapp','email','utm_source','utm_medium','utm_campaign'
    ];
    const esc = v => '"'+String(v??'').replace(/"/g,'""')+'"';
    const rows = items.map(item => [
      item.ts,
      item.score,
  item.answers.R1,
  item.answers.R2,
  item.answers.R3,
  item.answers.Q1,
  item.answers.Q2,
  item.answers.Q3,
  item.answers.Q4,
  item.answers.Q5,
      item.contact.nome,
      item.contact.empresa,
      item.contact.whatsapp,
      item.contact.email,
      item.utm.utm_source,
      item.utm.utm_medium,
      item.utm.utm_campaign
    ].map(esc).join(','));
    return headers.map(esc).join(',') + '\n' + rows.join('\n');
  }

  function download(filename, text){
    const blob = new Blob([text], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function setupAdmin(){
    const params = new URLSearchParams(window.location.search);
    if(params.get('admin')==='1' && adminBar){
      adminBar.style.display = 'flex';
      exportCsvBtn?.addEventListener('click', ()=>{
        const key = 'reforma_submissions_v1';
        const list = JSON.parse(localStorage.getItem(key)||'[]');
        if(!list.length){
          alert('Nenhum resultado salvo neste navegador.');
          return;
        }
        const csv = toCsv(list);
        download('resultados-reforma.csv', csv);
      });
    }
  }

  async function postToEndpoint(payload){
    try{
      const url = window.RESPONDER_ENDPOINT;
      if(!url) return;
      const body = JSON.stringify(payload);
      if(DEBUG){
        console.log('[ENVIO] Endpoint:', url);
        console.log('[ENVIO] Payload mínimo:', payload);
      }
      const doFetch = () => fetch(url, {
        method:'POST',
        mode:'no-cors',
        headers:{ 'Content-Type':'text/plain;charset=utf-8' },
        body
      });
      await doFetch();
      if(DEBUG) console.log('[ENVIO] Disparado com fetch no-cors');
    }catch(err){
      console.warn('Falha ao enviar ao endpoint (fetch)', err);
      try{
        if(navigator.sendBeacon && window.RESPONDER_ENDPOINT){
          const blob = new Blob([JSON.stringify(payload)], { type:'text/plain;charset=utf-8' });
          const ok = navigator.sendBeacon(window.RESPONDER_ENDPOINT, blob);
          if(DEBUG) console.log('[ENVIO] Fallback sendBeacon result:', ok);
        }
      }catch(beaconErr){
        if(DEBUG) console.warn('[ENVIO] sendBeacon falhou', beaconErr);
      }
    }
  }

  function validateContact(){
    const nomeEl = document.querySelector('input[name="nome"]');
    const whatsEl = document.querySelector('input[name="whatsapp"]');
    const nome = (nomeEl?.value||'').trim();
    const whatsapp = (whatsEl?.value||'').trim();
    let ok = true;
    if(!nome){ nomeEl?.classList.add('error'); ok = false; }
    if(!whatsapp){ whatsEl?.classListadd('error'); ok = false; }
    return ok;
  }

  document.querySelectorAll('.option').forEach(btn=>{
    btn.addEventListener('click', () => selectOption(btn));
  });

  document.querySelectorAll('[data-action="next"]').forEach(btn=>{
    btn.addEventListener('click', nextStep);
  });
  document.querySelectorAll('[data-action="prev"]').forEach(btn=>{
    btn.addEventListener('click', prevStep);
  });

  ['nome','whatsapp','email'].forEach(name=>{
    const input = document.querySelector(`input[name="${name}"]`);
    if(!input) return;
    input.addEventListener('input', ()=>{
      input.classList.remove('error');
      updateFooterControls();
    });
  });

  setStep(0);
  setupAdmin();
})();
