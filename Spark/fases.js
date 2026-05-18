/* ════════════════════════════════════════════════════════════
   SPARK — Frontend  (com i18n PT / EN)
════════════════════════════════════════════════════════════ */

/* ── 1. Estado global ────────────────────────────────────── */
const CONFIG = { volume: 0.7 };
let fases          = [];
let faseAtual      = 0;
let fasesCompletas = [];
let playerChar     = '🤖';
let playerName     = 'Astronauta';

/* ── 2. Áudio ────────────────────────────────────────────── */
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}
function playSound(type) {
  if (CONFIG.volume <= 0) return;
  try {
    const ctx = getAudioCtx();
    const master = ctx.createGain();
    master.gain.value = CONFIG.volume * 0.14;
    const lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass'; lpf.frequency.value = 900; lpf.Q.value = 0.5;
    master.connect(lpf); lpf.connect(ctx.destination);
    const note = (freq, tStart, dur) => {
      const osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = freq;
      g.gain.setValueAtTime(0, ctx.currentTime + tStart);
      g.gain.linearRampToValueAtTime(0.9, ctx.currentTime + tStart + 0.04);
      g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + tStart + dur);
      osc.connect(g); g.connect(master);
      osc.start(ctx.currentTime + tStart); osc.stop(ctx.currentTime + tStart + dur + 0.06);
    };
    if      (type === 'collect') { note(261,0,0.18); note(392,0.16,0.28); }
    else if (type === 'victory') { [261,330,392,523].forEach((f,i)=>note(f,i*0.16,0.40)); }
    else if (type === 'click')   { note(220,0,0.10); }
  } catch(e) {}
}

/* ── 3. Confetti ─────────────────────────────────────────── */
function launchConfetti() {
  const colors=['#FF6B6B','#4ECDC4','#45B7D1','#FFA07A','#FFD700','#C3A3FF','#9FE1CB'];
  for (let i=0;i<90;i++) {
    setTimeout(()=>{
      const el=document.createElement('div'), sz=6+Math.random()*9, circle=Math.random()>0.4;
      el.style.cssText=['position:fixed',`top:${-20-Math.random()*30}px`,`left:${Math.random()*100}%`,
        `width:${sz}px`,`height:${sz*(circle?1:0.5+Math.random())}px`,
        `background:${colors[Math.floor(Math.random()*colors.length)]}`,
        `border-radius:${circle?'50%':'2px'}`,
        `animation:confettiFall ${1.4+Math.random()*1.6}s ease-in forwards`,
        'z-index:9999','pointer-events:none'].join(';');
      document.body.appendChild(el);
      el.addEventListener('animationend',()=>el.remove());
    }, i*18+Math.random()*50);
  }
}

/* ── 4. LocalStorage ─────────────────────────────────────── */
const SAVE_KEY = 'spark_v1';
function salvarProgresso() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({faseAtual,fasesCompletas,volume:CONFIG.volume})); } catch(e){}
}
function carregarProgresso() {
  try {
    const raw=localStorage.getItem(SAVE_KEY); if(!raw) return;
    const d=JSON.parse(raw);
    if(d.faseAtual!=null)  faseAtual=d.faseAtual;
    if(d.fasesCompletas)   fasesCompletas=d.fasesCompletas;
    if(d.volume!=null)     CONFIG.volume=d.volume;
  } catch(e){}
}
function temProgresso() { return fasesCompletas.length>0||faseAtual>0; }

/* ── 5. Estrelas de fundo ─────────────────────────────────── */
function gerarEstrelas(containerId, count=100) {
  const c=document.getElementById(containerId); if(!c) return;
  for(let i=0;i<count;i++){
    const s=document.createElement('div'); s.className='star';
    const sz=Math.random()*2.5+0.5, dur=(Math.random()*3+1.5).toFixed(1);
    s.style.cssText=`width:${sz}px;height:${sz}px;top:${Math.random()*100}%;left:${Math.random()*100}%;--dur:${dur}s;animation-delay:${(Math.random()*4).toFixed(1)}s;`;
    c.appendChild(s);
  }
}

/* ── Transição de tela ───────────────────────────────────── */
function transitionFrom(elementId, callback) {
  const el=document.getElementById(elementId);
  el.classList.add('fade-out');
  el.addEventListener('animationend',()=>{
    el.classList.add('hidden'); el.classList.remove('fade-out'); callback();
  },{once:true});
}

/* ── i18n: aplica todos os textos ───────────────────────── */
function applyTranslations() {
  const T=t();

  // Splash
  document.getElementById('splash-title-1').textContent=T.splashTitle1;
  document.getElementById('splash-title-2').textContent=T.splashTitle2;
  document.querySelector('label[for="player-name"]').textContent=T.splashNameLabel;
  document.getElementById('player-name').placeholder=T.splashNamePlaceholder;
  document.querySelector('.char-label').textContent=T.splashCharLabel;
  document.getElementById('btn-start').textContent=T.splashStart;
  document.getElementById('btn-continue').textContent=T.splashContinue;
  document.querySelector('.splash-hint').textContent=T.splashHint;

  // Tutorial
  document.getElementById('btn-tut-back').textContent=T.tutBack;
  document.getElementById('btn-tut-skip').textContent=T.tutSkip;
  const demoHintEl=document.querySelector('.tut-demo-hint');
  if(demoHintEl) demoHintEl.textContent=T.tutDemoHint;
  const demoBlock=document.getElementById('demo-block');
  if(demoBlock && !demoBlock.querySelector('.dragging')) demoBlock.textContent=T.tutDemoBlock;

  // Phase select
  document.querySelector('.phase-screen-title').textContent=T.phaseSelectTitle;
  document.getElementById('btn-phase-home').textContent=T.phaseHome;

  // Jogo — blocos do painel lateral
  document.querySelector('.panel-title').textContent=T.blocksTitle;
  document.querySelectorAll('.block').forEach(btn=>{
    const cmd=btn.dataset.cmd;
    btn.textContent=`${ICONS[cmd]} ${T.blockLabels[cmd]}`;
  });
  document.getElementById('hint').textContent=T.dropHint;
  document.getElementById('run-btn').textContent=T.btnRun;
  document.getElementById('clear-btn').textContent=T.btnClear;
  document.getElementById('btn-back-to-phases').textContent=T.backToPhases;
  document.querySelector('.score-label').textContent=T.scoreLabel;

  // Modais - Settings
  const allTitles=document.querySelectorAll('.modal-title');
  if(allTitles[0]) allTitles[0].textContent=T.settingsTitle;
  document.querySelector('.setting-label').textContent=T.settingsVolume;
  document.getElementById('btn-settings-close').textContent=T.settingsClose;

  // Modais - Vitória
  if(allTitles[1]) allTitles[1].textContent=T.victoryTitle;
  document.querySelector('.victory-sub').textContent=T.victorySub;
  document.getElementById('btn-next-phase').textContent=T.victoryNext;
  document.getElementById('btn-see-phases').textContent=T.victorySeePhases;

  // Modais - Confirmar saída
  if(allTitles[2]) allTitles[2].textContent=T.confirmTitle;
  document.querySelector('.confirm-text').textContent=T.confirmText;
  document.getElementById('btn-confirm-cancel').textContent=T.confirmCancel;
  document.getElementById('btn-confirm-ok').textContent=T.confirmOk;

  // Atualiza blocos já na drop zone
  document.querySelectorAll('.prog-block').forEach(div=>{
    const cmd=div.dataset.cmd;
    div.innerHTML=`${ICONS[cmd]} ${T.blockLabels[cmd]}<button class="remove-btn" title="Remove">✕</button>`;
    div.querySelector('.remove-btn').addEventListener('click',()=>{div.remove();updateHint();});
  });

  // Botão de idioma
  document.getElementById('lang-btn').textContent=currentLang==='pt'?'🌐 EN':'🌐 PT';
}

/* ── Troca de idioma ─────────────────────────────────────── */
function toggleLang() {
  setLang(currentLang==='pt'?'en':'pt');
  applyTranslations();
  if(!document.getElementById('phase-select').classList.contains('hidden')) renderPhaseCards();
  if(!document.getElementById('app').classList.contains('hidden')) {
    const fase=fases[faseAtual];
    if(fase) {
      const nomeFase=t().phases[faseAtual]?.nome||fase.nome;
      document.getElementById('game-title').textContent=`${playerChar} ${nomeFase}`;
      document.getElementById('phase-indicator').textContent=
        `${currentLang==='pt'?'Fase':'Level'} ${faseAtual+1} / ${fases.length}`;
    }
  }
}

/* ── 6. Splash ───────────────────────────────────────────── */
gerarEstrelas('stars-splash',120);
document.querySelectorAll('.char-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.char-btn').forEach(b=>b.classList.remove('selected'));
    btn.classList.add('selected'); playerChar=btn.dataset.char; playSound('click');
  });
});

function showSplash() {
  ['tutorial','phase-select'].forEach(id=>{
    const el=document.getElementById(id); el.classList.remove('fade-out'); el.classList.add('hidden');
  });
  document.getElementById('app').classList.add('hidden');
  const s=document.getElementById('splash');
  s.classList.remove('hidden','fade-out'); s.style.cssText='';
  document.getElementById('btn-continue').classList.toggle('hidden',!temProgresso());
}

document.getElementById('btn-start').addEventListener('click',()=>{
  const def=currentLang==='pt'?'Astronauta':'Astronaut';
  playerName=document.getElementById('player-name').value.trim()||def;
  playSound('click'); transitionFrom('splash',startTutorial);
});

document.getElementById('btn-continue').addEventListener('click',()=>{
  const def=currentLang==='pt'?'Astronauta':'Astronaut';
  playerName=document.getElementById('player-name').value.trim()||playerName||def;
  playSound('click'); transitionFrom('splash',showPhaseSelect);
});

/* ── 7. Tutorial ─────────────────────────────────────────── */
gerarEstrelas('stars-tutorial',80);
let tutStep=0;

function startTutorial() {
  document.getElementById('tutorial').classList.remove('hidden');
  renderTutStep(0); setupTutorialDrag();
}

function renderTutStep(step) {
  tutStep=step;
  const T=t(), s=T.tutSteps[step];
  document.querySelectorAll('.tut-dot').forEach((dot,i)=>{
    dot.classList.toggle('active',i===step); dot.classList.toggle('done',i<step);
  });
  document.getElementById('tut-emoji').textContent=s.emoji;
  document.getElementById('tut-title').textContent=s.titulo;
  document.getElementById('tut-text').innerHTML=s.texto.replace(/\n/g,'<br>');
  const demo=document.getElementById('tut-demo');
  demo.classList.toggle('hidden',!s.demo);
  if(s.demo) resetTutorialDemo();
  const nextBtn=document.getElementById('btn-tut-next');
  const isLast=step===T.tutSteps.length-1;
  nextBtn.textContent=isLast?T.tutStart:T.tutNext;
  nextBtn.onclick=()=>{ playSound('click'); if(!isLast) renderTutStep(step+1); else transitionFrom('tutorial',showPhaseSelect); };
}

function resetTutorialDemo() {
  const drop=document.getElementById('demo-drop'), block=document.getElementById('demo-block');
  drop.classList.remove('drag-over','success');
  drop.innerHTML=`<span class="tut-demo-hint">${t().tutDemoHint}</span>`;
  block.textContent=t().tutDemoBlock; block.style.display='';
}

function setupTutorialDrag() {
  const block=document.getElementById('demo-block'), drop=document.getElementById('demo-drop');
  block.addEventListener('dragstart',()=>block.classList.add('dragging'));
  block.addEventListener('dragend',()=>block.classList.remove('dragging'));
  drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('drag-over');});
  drop.addEventListener('dragleave',()=>drop.classList.remove('drag-over'));
  drop.addEventListener('drop',e=>{
    e.preventDefault(); drop.classList.remove('drag-over'); drop.classList.add('success');
    drop.innerHTML='<span style="font-size:20px">✅</span>'; block.style.display='none'; playSound('collect');
  });
}

document.getElementById('btn-tut-back').addEventListener('click',()=>{
  playSound('click'); if(tutStep>0) renderTutStep(tutStep-1); else transitionFrom('tutorial',showSplash);
});
document.getElementById('btn-tut-skip').addEventListener('click',()=>{
  playSound('click'); transitionFrom('tutorial',showPhaseSelect);
});

/* ── 8. Seleção de fases ─────────────────────────────────── */
gerarEstrelas('stars-phases',90);

function showPhaseSelect() {
  document.getElementById('app').classList.add('hidden');
  document.getElementById('phase-select').classList.remove('hidden');
  renderPhaseCards();
}

function renderPhaseCards() {
  const T=t(), grid=document.getElementById('phase-grid');
  grid.innerHTML='';
  fases.forEach((fase,i)=>{
    const completa=fasesCompletas.includes(i);
    const desbloqueada=i===0||fasesCompletas.includes(i-1);
    const nomeFase=T.phases[i]?.nome||fase.nome;
    const card=document.createElement('div');
    card.className=`phase-card ${completa?'completa':''} ${!desbloqueada?'bloqueada':''}`;
    const dif='★'.repeat(fase.dificuldade)+'☆'.repeat(3-fase.dificuldade);
    const statusHtml=completa
      ?`<div class="phase-status ok">${T.phaseCompleted}</div>`
      :!desbloqueada?`<div class="phase-status lock">${T.phaseLocked}</div>`:'';
    card.innerHTML=`<span class="phase-emoji">${fase.emoji}</span><div class="phase-nome">${nomeFase}</div><div class="phase-dif">${dif}</div>${statusHtml}`;
    if(desbloqueada) card.addEventListener('click',()=>{ playSound('click'); transitionFrom('phase-select',()=>iniciarFase(i)); });
    grid.appendChild(card);
  });
}

document.getElementById('btn-phase-home').addEventListener('click',()=>{
  playSound('click'); transitionFrom('phase-select',showSplash);
});

/* ── 9. Configurações ────────────────────────────────────── */
function openSettings() {
  document.getElementById('settings-modal').classList.remove('hidden');
  document.getElementById('vol-slider').value=CONFIG.volume;
  document.getElementById('vol-val').textContent=Math.round(CONFIG.volume*100)+'%';
}
function closeSettings() {
  document.getElementById('settings-modal').classList.add('hidden'); salvarProgresso();
}
['btn-settings-splash','btn-settings-phases','btn-settings-game'].forEach(id=>{
  document.getElementById(id).addEventListener('click',openSettings);
});
document.getElementById('btn-settings-close').addEventListener('click',()=>{playSound('click');closeSettings();});
document.getElementById('btn-settings-credits').addEventListener('click',()=>{playSound('click');closeSettings();showCredits();});
document.getElementById('settings-modal').addEventListener('click',e=>{
  if(e.target===document.getElementById('settings-modal')) closeSettings();
});
document.getElementById('vol-slider').addEventListener('input',e=>{
  CONFIG.volume=parseFloat(e.target.value);
  document.getElementById('vol-val').textContent=Math.round(CONFIG.volume*100)+'%';
});
document.getElementById('vol-slider').addEventListener('change',()=>playSound('click'));

/* ── Confirmar saída ─────────────────────────────────────── */
function abrirConfirmSaida(callback) {
  const modal=document.getElementById('confirm-modal');
  modal.classList.remove('hidden');
  document.getElementById('btn-confirm-ok').onclick=()=>{ modal.classList.add('hidden'); playSound('click'); callback(); };
  document.getElementById('btn-confirm-cancel').onclick=()=>{ modal.classList.add('hidden'); playSound('click'); };
}

/* ── 10. Jogo ────────────────────────────────────────────── */
const COLORS={right:'#B5D4F4',left:'#C0DD97',up:'#FAC775',down:'#F4C0D1',spin:'#CECBF6',collect:'#9FE1CB'};
const TEXT_COLORS={right:'#0C447C',left:'#27500A',up:'#633806',down:'#72243E',spin:'#3C3489',collect:'#085041'};
const ICONS={right:'➡️',left:'⬅️',up:'⬆️',down:'⬇️',spin:'🔄',collect:'⭐'};

const canvas=document.getElementById('world');
const ctx2d=canvas.getContext('2d');
const dropZone=document.getElementById('drop-zone');
const hint=document.getElementById('hint');
const msg=document.getElementById('msg');
const scoreNum=document.getElementById('score-num');
let estadoAtual={robo:{x:0,y:3},estrelas:[]};

function _iniciarFaseReal(index) {
  faseAtual=index; salvarProgresso();
  const fase=fases[faseAtual], nomeFase=t().phases[faseAtual]?.nome||fase.nome;
  estadoAtual={robo:{...fase.roboInicial},estrelas:fase.estrelas.map(s=>({...s}))};
  document.getElementById('game-title').textContent=`${playerChar} ${nomeFase}`;
  document.getElementById('phase-indicator').textContent=`${currentLang==='pt'?'Fase':'Level'} ${faseAtual+1} / ${fases.length}`;
  dropZone.querySelectorAll('.prog-block').forEach(n=>n.remove());
  updateHint(); msg.textContent=''; scoreNum.textContent='0';
  document.getElementById('app').classList.remove('hidden'); draw();
}

function iniciarFase(index) {
  showStoryModal(index, () => _iniciarFaseReal(index));
}

function draw(estado) {
  if(estado) estadoAtual=estado;
  const fase=fases[faseAtual]; if(!fase) return;
  const cols=fase.mapa[0].length, rows=fase.mapa.length;
  canvas.width=window.innerWidth; canvas.height=window.innerHeight;
  calcularCell(canvas,cols,rows);
  const mapW=cols*CELL, mapH=rows*CELL;
  window._offsetX=Math.floor((canvas.width-mapW)/2);
  window._offsetY=Math.floor(((canvas.height-52-110)-mapH)/2)+52;
  render(ctx2d,canvas,estadoAtual,fase.mapa,playerChar,window._offsetX,window._offsetY);
}

function getPrograma() {
  return Array.from(dropZone.querySelectorAll('.prog-block')).map(n=>n.dataset.cmd);
}

function updateHint() {
  hint.style.display=dropZone.querySelectorAll('.prog-block').length===0?'':'none';
  hint.textContent=t().dropHint;
}

function addBlock(cmd) {
  const T=t(), div=document.createElement('div');
  div.className='prog-block'; div.dataset.cmd=cmd;
  div.style.background=COLORS[cmd]; div.style.color=TEXT_COLORS[cmd];
  div.innerHTML=`${ICONS[cmd]} ${T.blockLabels[cmd]}<button class="remove-btn" title="Remove">✕</button>`;
  div.querySelector('.remove-btn').addEventListener('click',()=>{div.remove();updateHint();});
  dropZone.appendChild(div); updateHint();
}

document.querySelectorAll('.block').forEach(btn=>{
  btn.addEventListener('dragstart',e=>e.dataTransfer.setData('text/plain',btn.dataset.cmd));
  btn.addEventListener('click',()=>{addBlock(btn.dataset.cmd);playSound('click');});
});

dropZone.addEventListener('dragover',e=>{e.preventDefault();dropZone.classList.add('drag-over');});
dropZone.addEventListener('dragleave',()=>dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop',e=>{
  e.preventDefault(); dropZone.classList.remove('drag-over');
  const cmd=e.dataTransfer.getData('text/plain'); if(COLORS[cmd]) addBlock(cmd);
});

document.getElementById('clear-btn').addEventListener('click',()=>{
  dropZone.querySelectorAll('.prog-block').forEach(n=>n.remove());
  updateHint(); msg.textContent=''; scoreNum.textContent='0';
  const fase=fases[faseAtual];
  estadoAtual={robo:{...fase.roboInicial},estrelas:fase.estrelas.map(s=>({...s}))};
  draw();
});

document.getElementById('btn-back-to-phases').addEventListener('click',()=>{
  abrirConfirmSaida(()=>{ document.getElementById('app').classList.add('hidden'); showPhaseSelect(); });
});

document.getElementById('run-btn').addEventListener('click', async ()=>{
  const T=t(), comandos=getPrograma();
  if(comandos.length===0){msg.textContent=T.msgNoBlocks;return;}
  msg.textContent=T.msgSending;
  const runBtn=document.getElementById('run-btn'); runBtn.disabled=true;
  try {
    let resultado;
    try {
      const resposta=await fetch('/api/executar',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({comandos,faseId:faseAtual})
      });
      if(!resposta.ok){const erro=await resposta.json();msg.textContent=`Erro: ${erro.erro}`;runBtn.disabled=false;return;}
      resultado=await resposta.json();
    } catch(_fetchErr) {
      // Fallback: executa a lógica localmente no browser
      resultado = executarComandosLocal(comandos, faseAtual);
    }
    const{passos,coletadas,totalEstrelas,vitoria}=resultado;
    const fase=fases[faseAtual], blocks=dropZone.querySelectorAll('.prog-block');
    msg.textContent='';
    const offsetX=window._offsetX??0, offsetY=window._offsetY??0;
    executarAnimacao(ctx2d,canvas,passos,fase.mapa,playerChar,offsetX,offsetY,
      (index)=>{ blocks.forEach(b=>b.style.outline=''); if(blocks[index]) blocks[index].style.outline='3px solid #D85A30'; },
      (total)=>{ scoreNum.textContent=total; playSound('collect'); },
      ()=>{
        blocks.forEach(b=>b.style.outline=''); runBtn.disabled=false;
        if(vitoria){ msg.innerHTML=t().msgVictory; setTimeout(showVictory,700); }
        else if(coletadas>0){ msg.textContent=t().msgPartial(coletadas,totalEstrelas); }
        else{ msg.textContent=t().msgTryAgain; }
      }
    );
  } catch(err){ msg.textContent=t().msgConnError; runBtn.disabled=false; console.error(err); }
});

/* ── 11. Vitória ─────────────────────────────────────────── */
function showVictory() {
  if(!fasesCompletas.includes(faseAtual)){fasesCompletas.push(faseAtual);salvarProgresso();}
  launchConfetti(); playSound('victory');
  const T=t(), modal=document.getElementById('victory-modal');
  const btnNext=document.getElementById('btn-next-phase');
  const temProxima=faseAtual<fases.length-1;
  btnNext.style.display=temProxima?'':'none';
  btnNext.onclick=()=>{ modal.classList.add('hidden'); playSound('click'); iniciarFase(faseAtual+1); };
  document.getElementById('btn-see-phases').onclick=()=>{
    modal.classList.add('hidden'); playSound('click');
    if(!temProxima){ document.getElementById('app').classList.add('hidden'); showCredits(); }
    else { document.getElementById('app').classList.add('hidden'); showPhaseSelect(); }
  };
  if(!temProxima){
    const verFases=document.getElementById('btn-see-phases');
    verFases.textContent='🏆 Ver Créditos';
  }
  modal.classList.remove('hidden');
}

/* ── Créditos ────────────────────────────────────────────── */
function showCredits() {
  const screen = document.getElementById('credits-screen');
  screen.classList.remove('hidden');
  gerarEstrelas('stars-credits');

  const seqs = [
    { id:'cg-0', delay:0.3 },
    { id:'cd-0', delay:0.8 },
    { id:'cg-1', delay:1.1 },
    { id:'cg-2', delay:1.5 },
    { id:'cd-1', delay:1.9 },
    { id:'cg-3', delay:2.1 },
    { id:'cg-4', delay:2.5 },
    { id:'cg-5', delay:2.9 },
    { id:'cd-2', delay:3.3 },
    { id:'cg-6', delay:3.5 },
    { id:'cd-3', delay:4.1 },
    { id:'cg-7', delay:4.3 },
    { id:'btn-credits-home', delay:4.8 },
  ];

  seqs.forEach(({id, delay}) => {
    const el = document.getElementById(id);
    if(!el) return;
    el.style.opacity = '0';
    el.style.animation = 'none';
    void el.offsetHeight;
    el.style.animation = `creditsFadeUp 0.7s ease ${delay}s forwards`;
  });

  document.getElementById('btn-credits-home').onclick = () => {
    playSound('click');
    screen.classList.add('hidden');
    document.getElementById('splash').classList.remove('hidden');
  };
}


/* ── Execução local (fallback sem servidor) ──────────────── */
function executarComandosLocal(comandos, faseIndex) {
  const fase = fases[faseIndex];
  const mapa = fase.mapa;
  const COLS = mapa[0].length, ROWS = mapa.length;
  let robo = { ...fase.roboInicial };
  let estrelas = fase.estrelas.map(s => ({ ...s }));
  let coletadas = 0;
  const totalEstrelas = estrelas.length;
  const passos = [{ passo:0, cmd:'inicio', robo:{...robo}, estrelas:estrelas.map(s=>({...s})), coletadas }];
  for (let i = 0; i < comandos.length; i++) {
    const cmd = comandos[i];
    switch(cmd) {
      case 'right':   if(robo.x < COLS-1) robo.x++; break;
      case 'left':    if(robo.x > 0)      robo.x--; break;
      case 'up':      if(robo.y > 0)      robo.y--; break;
      case 'down':    if(robo.y < ROWS-1) robo.y++; break;
      case 'spin':    break;
      case 'collect': {
        const idx = estrelas.findIndex(s => s.x===robo.x && s.y===robo.y);
        if(idx >= 0){ estrelas.splice(idx,1); coletadas++; }
        break;
      }
    }
    passos.push({ passo:i+1, cmd, robo:{...robo}, estrelas:estrelas.map(s=>({...s})), coletadas });
  }
  return { passos, coletadas, totalEstrelas, vitoria: coletadas === totalEstrelas };
}

/* ── 12. Init ────────────────────────────────────────────── */
(async function init() {
  carregarProgresso();
  document.getElementById('vol-slider').value=CONFIG.volume;
  document.getElementById('vol-val').textContent=Math.round(CONFIG.volume*100)+'%';
  document.getElementById('btn-continue').classList.toggle('hidden',!temProgresso());
  try {
    const res = await fetch('/api/fases');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    fases = await res.json();
  } catch(e) {
    console.warn('API indisponível, usando fases locais:', e.message);
    fases = window.FASES_DATA || [];
  }
  applyTranslations();
  document.getElementById('lang-btn').addEventListener('click',()=>{ playSound('click'); toggleLang(); });
  if(fases.length>0) {
    estadoAtual={robo:{...fases[0].roboInicial},estrelas:fases[0].estrelas.map(s=>({...s}))};
    draw();
  }
})();

/* ══════════════════════════════════════════════════════════
   NARRATIVA — ZYRON
══════════════════════════════════════════════════════════ */

/* Gera estrelinhas decorativas dentro do modal */
(function gerarStoryStars() {
  const container = document.getElementById('story-stars');
  if (!container) return;
  for (let i = 0; i < 40; i++) {
    const s = document.createElement('div');
    s.className = 'story-star-dot';
    const sz = Math.random() * 2.5 + 0.8;
    s.style.cssText = [
      `width:${sz}px`, `height:${sz}px`,
      `top:${Math.random()*100}%`, `left:${Math.random()*100}%`,
      `--dur:${(Math.random()*3+2).toFixed(1)}s`,
      `--delay:${(Math.random()*4).toFixed(1)}s`
    ].join(';');
    container.appendChild(s);
  }
})();

let _storyCallback = null;
let _storyFalas    = [];
let _storyIndex    = 0;
let _typeInterval  = null;

function _renderStoryDots(total, current) {
  const prog = document.getElementById('story-progress');
  prog.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const d = document.createElement('div');
    d.className = 'story-dot' + (i === current ? ' active' : i < current ? ' done' : '');
    prog.appendChild(d);
  }
}

function _typeWrite(text, onDone) {
  clearInterval(_typeInterval);
  const el     = document.getElementById('story-text');
  const cursor = document.querySelector('.story-cursor');
  el.textContent = '';
  if (cursor) cursor.style.display = 'inline';
  let i = 0;
  _typeInterval = setInterval(() => {
    el.textContent += text[i];
    i++;
    if (i >= text.length) {
      clearInterval(_typeInterval);
      _typeInterval = null;
      if (onDone) onDone();
    }
  }, 28);
}

function _showFala(index) {
  const T     = t();
  const falas = _storyFalas;
  _storyIndex = index;

  _renderStoryDots(falas.length, index);

  const nextBtn = document.getElementById('btn-story-next');
  const isLast  = index === falas.length - 1;

  // Atualiza label do botão conforme idioma e posição
  nextBtn.textContent = isLast
    ? T.storyBtn
    : '▶';

  _typeWrite(falas[index], () => {
    // quando termina de digitar, clique avança automaticamente se não for a última
  });
}

function _skipTyping() {
  if (_typeInterval) {
    clearInterval(_typeInterval);
    _typeInterval = null;
    const el = document.getElementById('story-text');
    el.textContent = _storyFalas[_storyIndex];
  }
}

function showStoryModal(faseIndex, callback) {
  const T     = t();
  const story = T.story[faseIndex];
  if (!story) { callback(); return; }

  _storyFalas    = story.falas;
  _storyIndex    = 0;
  _storyCallback = callback;

  // Atualiza nome do narrador
  document.getElementById('story-name').textContent = T.storyNarrator;

  // Atualiza texto do botão pular
  document.getElementById('btn-story-skip').textContent =
    currentLang === 'pt' ? 'Pular' : 'Skip';

  document.getElementById('story-modal').classList.remove('hidden');
  _showFala(0);
}

function _closeStoryModal() {
  document.getElementById('story-modal').classList.add('hidden');
  clearInterval(_typeInterval);
  _typeInterval = null;
  if (_storyCallback) { _storyCallback(); _storyCallback = null; }
}

// Botão avançar / confirmar
document.getElementById('btn-story-next').addEventListener('click', () => {
  playSound('click');
  // Se ainda está digitando, pula a digitação
  if (_typeInterval) { _skipTyping(); return; }
  // Avança para próxima fala ou fecha
  if (_storyIndex < _storyFalas.length - 1) {
    _showFala(_storyIndex + 1);
  } else {
    _closeStoryModal();
  }
});

// Botão pular tudo
document.getElementById('btn-story-skip').addEventListener('click', () => {
  playSound('click');
  _closeStoryModal();
});

/* ── Créditos ────────────────────────────────────────────── */
function showCredits() {
  const screen = document.getElementById('credits-screen');
  ['splash','tutorial','phase-select','app'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById('settings-modal').classList.add('hidden');
  screen.classList.remove('hidden');
  gerarEstrelas('stars-credits');

  const seqs = [
    {id:'cg-0',delay:0.3},{id:'cd-0',delay:0.8},
    {id:'cg-1',delay:1.1},{id:'cg-2',delay:1.5},
    {id:'cd-1',delay:1.9},{id:'cg-3',delay:2.1},
    {id:'cg-4',delay:2.5},{id:'cg-5',delay:2.9},
    {id:'cd-2',delay:3.3},{id:'cg-6',delay:3.5},
    {id:'cd-3',delay:4.1},{id:'cg-7',delay:4.3},
    {id:'btn-credits-home',delay:4.8},
  ];
  seqs.forEach(({id, delay}) => {
    const el = document.getElementById(id);
    if(!el) return;
    el.style.opacity = '0';
    el.style.animation = 'none';
    void el.offsetHeight;
    el.style.animation = `creditsFadeUp 0.7s ease ${delay}s forwards`;
  });

  document.getElementById('btn-credits-home').onclick = () => {
    playSound('click');
    screen.classList.add('hidden');
    document.getElementById('splash').classList.remove('hidden');
  };
}
