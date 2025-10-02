(function(){
  const steps = Array.from(document.querySelectorAll('.step'));
  const progressBar = document.getElementById('progressBar');
  const footerPrev = document.querySelector('.footer-controls [data-action="prev"]');
  const footerNext = document.querySelector('.footer-controls [data-action="next"]');
  const adminBar = document.getElementById('adminBar');
  const exportCsvBtn = document.getElementById('exportCsvBtn');

  const answers = { R1:null,R2:null,Q1:null,Q2:null,Q3:null,Q4:null,Q5:null,Q6:null,Q7:null };
  const answerLabels = { R1:null,R2:null,Q1:null,Q2:null,Q3:null,Q4:null,Q5:null,Q6:null,Q7:null };
  let current = 0; // step index
  const URL_PARAMS = new URLSearchParams(window.location.search);
  const DEBUG = URL_PARAMS.get('debug') === '1';
  let submissionSent = false; // evita envios duplicados por submissão

  // Pesos calibrados (soma = 1) com duas novas perguntas iniciais:
  // R1 Ramo (5%), R2 Funcionários (5%), demais reduzidos em ~10% para manter soma 1:
  // Q1 Regime (18%), Q2 Setor (18%), Q3 Créditos (13.5%), Q4 Destino (13.5%),
  // Q5 Benefícios (13.5%), Q6 Perfil clientes (9%), Q7 Maturidade (4.5%)
  const weights = { R1:0.05,R2:0.05,Q1:0.18,Q2:0.18,Q3:0.135,Q4:0.135,Q5:0.135,Q6:0.09,Q7:0.045 };

  function getContactIndex(){
    const idx = steps.findIndex(s=>s.querySelector('#contactForm'));
    return idx === -1 ? 8 : idx; // fallback
  }

  function setStep(idx){
    steps.forEach(s=>s.classList.remove('active'));
    const step = steps[idx];
    if(step){ step.classList.add('active'); current = idx; updateProgress(); updateFooterControls(); }
  }

  function updateProgress(){
    const contactIdx = getContactIndex();
    const percent = Math.min(((current)/(contactIdx))*100,100);
    progressBar.style.width = percent+'%';
  }

  function updateFooterControls(){
    // Hide footer on results
    const isResult = steps[current]?.dataset.result;
    const footer = document.querySelector('.footer-controls');
    const hideFooter = (current === 0) || Boolean(isResult);
    footer.style.display = hideFooter ? 'none' : 'flex';
    // Prev visible after cover
    footerPrev.style.display = current>0 ? 'inline-flex':'none';

    // Next label
    const contactIdx = getContactIndex();
    if(current===0) footerNext.textContent = 'Começar';
    else if(current===contactIdx) footerNext.textContent = 'Ver resultado';
    else footerNext.textContent = 'Próximo';

    // Disable next if current question not answered
    const active = steps[current];
    const container = active?.querySelector('.options');
    if(container){
      const qk = container.dataset.question;
      footerNext.disabled = (answers[qk]==null);
    } else {
      footerNext.disabled = false;
    }

    // Se estamos no passo de contato, exigir nome/whatsapp/email
    if(current === contactIdx){
      const nome = (document.querySelector('input[name="nome"]').value||'').trim();
      const whatsapp = (document.querySelector('input[name="whatsapp"]').value||'').trim();
      const missing = !(nome && whatsapp);
      footerNext.disabled = missing;
      // Também desabilitar o botão "Ver resultado" dentro do passo
      const inStepNext = active?.querySelector('[data-action="next"]');
      if(inStepNext){ inStepNext.disabled = missing; }
    }
  }

  function selectOption(btn){
    const container = btn.parentElement; // .options
    const question = container.dataset.question; // Q1..Q7
    Array.from(container.querySelectorAll('.option')).forEach(o=>o.classList.remove('selected'));
    btn.classList.add('selected');
    const value = Number(btn.dataset.value);
    answers[question] = value;
    answerLabels[question] = (btn.textContent||'').trim();
    updateFooterControls();
    // auto-next after short delay for better UX
    setTimeout(()=>nextStep(), 150);
  }

  function nextStep(){
    const contactIdx = getContactIndex();
    if(current<contactIdx){
      setStep(current+1);
      return;
    }
    if(current===contactIdx){
      // valida contato obrigatório
      if(!validateContact()){
        const firstErr = document.querySelector('.form input.error');
        if(firstErr){ firstErr.focus({ preventScroll:false }); firstErr.scrollIntoView({ behavior:'smooth', block:'center' }); }
        return;
      }
      // compute score and show result
      const score = computeScore();
      showResult(score);
      return;
    }
    // results: nothing
  }

  function prevStep(){
    if(current>0){ setStep(current-1); }
  }

  function computeScore(){
    const details = [];
    const total = Object.entries(weights).reduce((acc,[k,w])=>{
      const v = Number(answers[k] ?? 0); // cada v já na escala 0-100
      const contrib = v * w; // contribuição parcial (0-100 * peso)
      details.push({ key:k, value:v, weight:w, contrib: Math.round(contrib*100)/100 });
      return acc + contrib;
    },0);
    const score = Math.round(total*100)/100;
    return { score, details };
  }

  function showResult(scoreOrObj){
    const { score, details } = typeof scoreOrObj === 'number' ? { score: scoreOrObj, details: [] } : scoreOrObj;
    // Fill scores
    const scoreInt = Math.round(score);
    document.getElementById('scoreAlto').textContent = scoreInt;
    document.getElementById('scoreMedio').textContent = scoreInt;
    document.getElementById('scoreBaixo').textContent = scoreInt;

    // Render breakdown se disponível
    // Render breakdown em duas colunas:
    // Coluna esquerda: respostas marcadas de cada pergunta
    // Coluna direita: apenas o score "X/100"
    const labels = {
      R1:'Ramo da empresa', R2:'Número de funcionários',
      Q1:'Regime tributário', Q2:'Setor (CNAE macro)', Q3:'% com crédito', Q4:'Vendas fora do estado',
      Q5:'Benefícios/regimes especiais', Q6:'Perfil de clientes', Q7:'Maturidade fiscal/sistemas'
    };
    const order = ['R1','R2','Q1','Q2','Q3','Q4','Q5','Q6','Q7'];
    const detailsMap = Object.fromEntries((details||[]).map(d=>[d.key, d]));
    const leftList = '<ul class="breakdown__list breakdown__list--3col">' + order.map(k=>{
      const ans = answerLabels[k] || '-';
      const v = detailsMap[k]?.value;
      const imp = (typeof v === 'number') ? Math.round(v) : null;
      const levelCls = imp!=null ? 'impact-high' : '';
      const impText = imp!=null ? `${imp}/100` : '-';
      return `<li><span>${labels[k]}</span><span>${ans}</span><span class="impact-val ${levelCls}">${impText}</span></li>`;
    }).join('') + '</ul>';
      const grid = `<div class="breakdown--grid"><div class="breakdown__col">${leftList}</div></div>`;
    ['breakdownAlto','breakdownMedio','breakdownBaixo'].forEach(id=>{
      const el = document.getElementById(id);
      if(el) el.innerHTML = grid;
    });

    // Setup CTAs with prefilled text
    const nome = (document.querySelector('input[name="nome"]').value||'').trim();
    const prefix = nome? `Olá, sou ${encodeURIComponent(nome)}. `: 'Olá, ';

    const waAlto = `https://wa.me/5567992769991?text=${prefix}vi meu resultado no diagnóstico (alto impacto) e quero um plano de ação.`;
    const waMedio = `https://wa.me/5567992769991?text=${prefix}preciso de um diagnóstico detalhado sobre meu Índice de Impacto (médio).`;
    const waBaixo = `https://wa.me/5567992769991?text=${prefix}tenho dúvidas rápidas sobre meu resultado (baixo impacto).`;

    document.getElementById('whatsAlto').href = waAlto;
    document.getElementById('whatsMedio').href = waMedio;
    document.getElementById('whatsBaixo').href = waBaixo;

    // mailto for médio
    const email = (document.querySelector('input[name="email"]').value||'').trim();
    const subject = encodeURIComponent('Checklist Reforma Tributária – 3C CONTABILIDADE');
    const body = encodeURIComponent(`Olá,\n\nPoderia me enviar o checklist por e-mail?\n\nScore: ${scoreInt}/100\nNome: ${nome||'-'}\nE-mail: ${email||'-'}\n\nObrigado(a).`);
    const mailto = `mailto:luis@3ccontabilidade.com.br?subject=${subject}&body=${body}`;
    document.getElementById('mailtoMedio').href = mailto;

    // Decide class
  let targetStepIndex = null;
  let resultClass = 'baixo';
  if(score>=65){ resultClass = 'alto'; targetStepIndex = steps.findIndex(s=>s.dataset.result==='alto'); }
  else if(score>=40){ resultClass = 'medio'; targetStepIndex = steps.findIndex(s=>s.dataset.result==='medio'); }
  else { resultClass = 'baixo'; targetStepIndex = steps.findIndex(s=>s.dataset.result==='baixo'); }

    setStep(targetStepIndex);

    // Push state UTM if present
    applyUTMs();

    // Persist submission localmente e enviar apenas payload mínimo ao endpoint
    persistSubmission({ score: scoreInt, details, resultClass });
  }

  function applyUTMs(){
    const params = new URLSearchParams(window.location.search);
    const utms = ['utm_source','utm_medium','utm_campaign'];
    const links = Array.from(document.querySelectorAll('a[href^="https://wa.me/"]'));
    links.forEach(a=>{
      const url = new URL(a.href);
      utms.forEach(u=>{ const v = params.get(u); if(v) url.searchParams.set(u, v); });
      a.href = url.toString();
    });
  }

  // Persistência de submissões
  function persistSubmission({ score, details, resultClass }){
    if (submissionSent) { if(DEBUG){ console.log('[ENVIO] Ignorado: submissão já enviada'); } return; }
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
      // Envio opcional para endpoint externo
      postToEndpoint(endpointPayload);
      submissionSent = true;
    }catch(e){
      console.warn('Falha ao salvar localmente', e);
    }
  }

  function toCsv(items){
    const headers = [
      'ts','score','R1','R2','Q1','Q2','Q3','Q4','Q5','Q6','Q7','nome','empresa','whatsapp','email','utm_source','utm_medium','utm_campaign'
    ];
    const esc = v => '"'+String(v??'').replace(/"/g,'""')+'"';
    const rows = items.map(it=>[
      it.ts,
      it.score,
      it.answers.R1,
      it.answers.R2,
      it.answers.Q1,
      it.answers.Q2,
      it.answers.Q3,
      it.answers.Q4,
      it.answers.Q5,
      it.answers.Q6,
      it.answers.Q7,
      it.contact.nome,
  it.contact.empresa,
  it.contact.whatsapp,
      it.contact.email,
      it.utm.utm_source,
      it.utm.utm_medium,
      it.utm.utm_campaign
    ].map(esc).join(','));
    return headers.map(esc).join(',') + '\n' + rows.join('\n');
  }

  function download(filename, text){
    const blob = new Blob([text], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  }

  function setupAdmin(){
    const params = new URLSearchParams(window.location.search);
    if(params.get('admin')==='1' && adminBar){
      adminBar.style.display = 'flex';
      exportCsvBtn?.addEventListener('click', ()=>{
        const key = 'reforma_submissions_v1';
        const list = JSON.parse(localStorage.getItem(key)||'[]');
        if(!list.length){ alert('Nenhum resultado salvo neste navegador.'); return; }
        const csv = toCsv(list);
        download('resultados-reforma.csv', csv);
      });
    }
  }

  // Configuração para envio externo (opcional): defina window.RESPONDER_ENDPOINT = 'https://...'
  async function postToEndpoint(payload){
    try{
      const url = window.RESPONDER_ENDPOINT;
      if(!url) return; // não configurado
      // Para reduzir preflight em Apps Script, usar no-cors + text/plain
      const body = JSON.stringify(payload);
      if(DEBUG){
        console.log('[ENVIO] Endpoint:', url);
        console.log('[ENVIO] Payload mínimo:', payload);
      }
      const doFetch = () => fetch(url, { method:'POST', mode:'no-cors', headers:{ 'Content-Type':'text/plain;charset=utf-8' }, body });
      await doFetch();
      if(DEBUG){ console.log('[ENVIO] Disparado com fetch no-cors'); }
    }catch(e){
      console.warn('Falha ao enviar ao endpoint (fetch)', e);
      // Fallback opcional com sendBeacon somente se fetch falhar
      try{
        if(navigator.sendBeacon && window.RESPONDER_ENDPOINT){
          const blob = new Blob([JSON.stringify(payload)], { type: 'text/plain;charset=utf-8' });
          const ok = navigator.sendBeacon(window.RESPONDER_ENDPOINT, blob);
          if(DEBUG){ console.log('[ENVIO] Fallback sendBeacon result:', ok); }
        }
      }catch(err){ if(DEBUG){ console.warn('[ENVIO] sendBeacon falhou', err); } }
    }
  }

  // Wire options
  document.querySelectorAll('.option').forEach(btn=>{
    btn.addEventListener('click',()=>selectOption(btn));
  });

  // Footer buttons: não adicionar listeners duplicados; usaremos apenas os genéricos abaixo

  // In-step "next" buttons
  document.querySelectorAll('[data-action="next"]').forEach(b=>{
    b.addEventListener('click', nextStep);
  });
  document.querySelectorAll('[data-action="prev"]').forEach(b=>{
    b.addEventListener('click', prevStep);
  });

  // Contato: listeners para remover estado de erro e reavaliar botões
  const contactInputs = ['nome','whatsapp','email'].map(n=>document.querySelector(`input[name="${n}"]`)).filter(Boolean);
  contactInputs.forEach(inp=>{
    inp.addEventListener('input', ()=>{
      inp.classList.remove('error');
      updateFooterControls();
    });
  });

  function validateContact(){
    const nomeEl = document.querySelector('input[name="nome"]');
    const whatsEl = document.querySelector('input[name="whatsapp"]');
    const emailEl = document.querySelector('input[name="email"]');
    const nome = (nomeEl?.value||'').trim();
    const whatsapp = (whatsEl?.value||'').trim();
    const email = (emailEl?.value||'').trim();
    let ok = true;
    if(!nome){ nomeEl?.classList.add('error'); ok = false; }
    if(!whatsapp){ whatsEl?.classList.add('error'); ok = false; }
    // email opcional: não marcar erro se vazio
    return ok;
  }

  // Start
  setStep(0);
  setupAdmin();
})();
