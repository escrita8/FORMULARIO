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

  // Removidos planos detalhados e ofertas de serviço para simplificar a área de resultado

  function classifyImpactLevel(value){
    if(value >= 60) return 'alto';
    if(value >= 30) return 'medio';
    return 'baixo';
  }

  function formatMetaLabel(meta){
    if(Array.isArray(meta)){
      return meta.map(item=>item?.label || '').filter(Boolean).join(', ');
    }
    return meta?.label || '';
  }

  // Empacota uma resposta (valor + rótulo legível) para envio/relatório
  function packAnswer(key){
    const label = formatMetaLabel(answerMeta[key]);
    const val = answers[key];
    const value = (val==null || Number.isNaN(Number(val))) ? '' : Number(val);
    return { key, value, label: label || '' };
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

  // Removidos renderizadores de insights, ações e serviços (conteúdo substituído por callout fixo no HTML)

  // multiEvaluators removido pois Q5 agora é escolha única

  function getContactIndex(){
    const idx = steps.findIndex(s=>s.querySelector('#contactForm'));
    return idx === -1 ? steps.length - 1 : idx;
  }

  function setStep(idx){
    // Pausa todos os vídeos quando trocar de etapa
    try{
      document.querySelectorAll('video.result-video__player').forEach(v=>{
        if(!v.paused){ v.pause(); }
      });
    }catch(e){}
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
    // Última pergunta = índice da etapa com Q5 (financeiro)
    const lastQuestionIdx = steps.findIndex(s=>s.querySelector('.options[data-question="Q5"]'));
    if(lastQuestionIdx <= 0){
      if(progressBar) progressBar.style.width = '0%';
      return;
    }
    const percent = Math.min((current / lastQuestionIdx) * 100, 100);
    if(progressBar) progressBar.style.width = `${percent}%`;
  }

  function updateFooterControls(){
    const footer = document.querySelector('.footer-controls');
    if(!footer) return;
    const isResult = steps[current]?.dataset.result;
    footer.style.display = 'none'; // permanecem ocultos no fluxo atual

    if(footerPrev) footerPrev.style.display = current>0 ? 'inline-flex' : 'none';

    if(footerNext){
      if(current===0) footerNext.textContent = 'Iniciar';
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

    if(current === 0){
      const nome = (document.querySelector('input[name="nome"]').value||'').trim();
      const whatsapp = (document.querySelector('input[name="whatsapp"]').value||'').trim();
      const missing = !(nome && whatsapp);
      const inStepNext = active?.querySelector('[data-action="next"]');
      if(inStepNext) inStepNext.disabled = missing;
    }
  }

  function selectOption(btn){
    const container = btn.parentElement;
    const question = container.dataset.question;


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
    const lastQuestionIdx = steps.findIndex(s=>s.querySelector('.options[data-question="Q5"]'));
    // Passo 0: valida contato antes de seguir
    if(current === 0){
      if(!validateContact()){
        const firstErr = document.querySelector('.form input.error');
        if(firstErr){
          firstErr.focus({ preventScroll:false });
          firstErr.scrollIntoView({ behavior:'smooth', block:'center' });
        }
        return;
      }
      setStep(current + 1);
      return;
    }
    // Avança perguntas até a última
    if(current < lastQuestionIdx){
      setStep(current + 1);
      return;
    }
    // Última pergunta respondida -> calcula resultado
    if(current === lastQuestionIdx){
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
  const waMsg = `${prefix}quero falar com um especialista para transformar a Reforma Tributária em lucro na minha empresa.`;
  document.getElementById('whatsAlto').href = `https://wa.me/${whatsPhone}?text=${waMsg}`;
  document.getElementById('whatsMedio').href = `https://wa.me/${whatsPhone}?text=${waMsg}`;
  document.getElementById('whatsBaixo').href = `https://wa.me/${whatsPhone}?text=${waMsg}`;

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
    // Mapeia as perguntas visíveis solicitadas:
    // Q2 (Funcionários) -> R2, Q3 (Faturamento) -> R3, Q4 (Regime) -> Q1, Q7 (Conhecimento cadastro) -> Q4
    const Q2p = packAnswer('R2');
    const Q3p = packAnswer('R3');
    const Q4p = packAnswer('Q1');
    const Q7p = packAnswer('Q4');

    const endpointPayload = {
      ts: payload.ts,
      score: payload.score,
      result: resultClass,
      contact,
      utm,
      // Campos diretos para facilitar a criação de colunas na planilha
      Q2_label: Q2p.label,
      Q2_value: Q2p.value,
      Q3_label: Q3p.label,
      Q3_value: Q3p.value,
      Q4_label: Q4p.label,
      Q4_value: Q4p.value,
      Q7_label: Q7p.label,
      Q7_value: Q7p.value
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
      'ts','score',
      'R1','R2','R3','Q1','Q2','Q3','Q4','Q5',
      // Labels legíveis para Q2, Q3, Q4 e Q7 (pedido do cliente)
      'Q2_resposta','Q3_resposta','Q4_resposta','Q7_resposta',
      'nome','empresa','whatsapp','email','utm_source','utm_medium','utm_campaign'
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
      // Labels: mapear conforme as chaves internas
      // Q2 (visível) -> R2
      (item.answerMeta && (Array.isArray(item.answerMeta.R2) ? item.answerMeta.R2.map(i=>i.label).join(', ') : (item.answerMeta.R2?.label||'')))
        || '',
      // Q3 (visível) -> R3
      (item.answerMeta && (Array.isArray(item.answerMeta.R3) ? item.answerMeta.R3.map(i=>i.label).join(', ') : (item.answerMeta.R3?.label||'')))
        || '',
      // Q4 (visível) -> Q1
      (item.answerMeta && (Array.isArray(item.answerMeta.Q1) ? item.answerMeta.Q1.map(i=>i.label).join(', ') : (item.answerMeta.Q1?.label||'')))
        || '',
      // Q7 (visível) -> Q4
      (item.answerMeta && (Array.isArray(item.answerMeta.Q4) ? item.answerMeta.Q4.map(i=>i.label).join(', ') : (item.answerMeta.Q4?.label||'')))
        || '',
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
    [nomeEl, whatsEl].forEach(el=>el?.classList.remove('error'));
    document.querySelectorAll('.field-error').forEach(el=>el.textContent='');
    let ok = true;
    if(!nome){
      nomeEl?.classList.add('error');
      document.querySelector('[data-error-for="nome"]').textContent = 'Informe seu nome';
      ok = false;
    }
    const onlyDigits = whatsapp.replace(/\D+/g,'');
    const validWhats = /^\d{10,12}$/.test(onlyDigits);
    if(!validWhats){
      whatsEl?.classList.add('error');
      document.querySelector('[data-error-for="whatsapp"]').textContent = 'Informe um WhatsApp válido. Ex.: 67 99999-9999';
      ok = false;
    }
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

  ['nome','whatsapp'].forEach(name=>{
    const input = document.querySelector(`input[name="${name}"]`);
    if(!input) return;
    input.addEventListener('input', ()=>{
      input.classList.remove('error');
      updateFooterControls();
      const err = document.querySelector(`[data-error-for="${name}"]`);
      if(err) err.textContent = '';
    });
  });

  setStep(0);
  setupAdmin();
  // Fallback se o vídeo local não carregar (ex.: arquivo ausente ou codec não suportado)
  (function setupVideoFallback(){
    const frames = document.querySelectorAll('.result-video__frame');
    frames.forEach(frame => {
      const video = frame.querySelector('video.result-video__player');
      if(!video) return;
      // Ajusta o aspect-ratio do container baseado nas dimensões reais do vídeo
      const setAspect = () => {
        if(video.videoWidth && video.videoHeight){
          const ratio = video.videoWidth / video.videoHeight;
          frame.style.aspectRatio = `${ratio}`;
        }
      };
      video.addEventListener('loadedmetadata', setAspect, { once:true });
      if(video.readyState >= 1) setAspect();
      const showFallback = () => {
        const fallback = document.createElement('div');
        fallback.className = 'result-video__fallback';
        const src = (video.querySelector('source')?.getAttribute('src')) || '';
        const link = src ? `<a href="${src}" download>baixar o vídeo</a>` : 'tentar novamente mais tarde';
        fallback.innerHTML = `Não foi possível carregar o vídeo agora.<br><small>Verifique se o arquivo existe e está em MP4 (H.264/AAC). Você pode ${link}.</small>`;
        frame.replaceChildren(fallback);
      };
      video.addEventListener('error', showFallback, { once:true });
      video.addEventListener('stalled', showFallback, { once:true });
      video.addEventListener('abort', showFallback, { once:true });
      // Se não houver fonte válida, o Chrome marca como NETWORK_NO_SOURCE
      setTimeout(() => {
        if(video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE){
          showFallback();
        }
      }, 400);
    });
  })();

  // Autoplay do vídeo quando entrar na tela (viewport)
  (function setupVideoAutoplay(){
    const videos = Array.from(document.querySelectorAll('video.result-video__player'));
    if(!('IntersectionObserver' in window) || !videos.length){
      return; // Sem suporte, não faz nada
    }
    const observer = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        const video = entry.target;
        if(!(video instanceof HTMLVideoElement)) return;
        if(entry.isIntersecting && entry.intersectionRatio > 0.5){
          // Para autoplay mobile/Chrome, manter muted + playsinline
          video.muted = true;
          const p = video.play();
          if(p && typeof p.catch === 'function'){
            p.catch(()=>{/* ignore bloqueio */});
          }
        } else {
          if(!video.paused){ video.pause(); }
        }
      });
    }, { threshold: [0, 0.5, 1] });
    videos.forEach(v=>observer.observe(v));
  })();
})();
