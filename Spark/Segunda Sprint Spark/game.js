/* ════════════════════════════════════════════════
   SPARK! — Lógica do Jogo (game.js)
   Física · Renderização · Áudio · UI · Progresso
════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════
   FÍSICA — simulação local (sem servidor)
════════════════════════════════════════════════ */
const WORLD = {
  width: 1600, height: 600,
  gravity: 0.5, jumpVel: -14,
  moveSpeed: 18, friction: 0.78,
  airFriction: 0.94, maxTicks: 800,
};
const TICKS_CMD = { right: 22, left: 22, down: 10, collect: 6 };
const ROBO_W = 36, ROBO_H = 40;

function getPlatformas(faseIndex) {
  const chao = { x: 0, y: 540, w: WORLD.width, h: 60 };
  const extras = [
    [
      { x:  80, y: 420, w: 120, h: 22 },
      { x: 260, y: 360, w: 120, h: 22 },
      { x: 450, y: 300, w: 120, h: 22 },
    ],
    [
      { x: 160, y: 430, w: 110, h: 22 },
      { x: 370, y: 360, w: 110, h: 22 },
      { x: 590, y: 290, w: 110, h: 22 },
      { x: 800, y: 370, w: 110, h: 22 },
    ],
    [
      { x: 120, y: 440, w: 100, h: 22 },
      { x: 310, y: 370, w:  90, h: 22 },
      { x: 490, y: 295, w:  90, h: 22 },
      { x: 670, y: 400, w:  90, h: 22 },
      { x: 850, y: 315, w: 100, h: 22 },
    ],
  ];
  return [chao, ...(extras[faseIndex] || extras[0])];
}

function getLayoutFase(faseIndex) {
  const layouts = [
    { roboInicial: { x: 30, y: 490 }, estrelas: [{ x: 135, y: 392 }, { x: 315, y: 332 }, { x: 505, y: 272 }] },
    { roboInicial: { x: 30, y: 490 }, estrelas: [{ x: 210, y: 402 }, { x: 420, y: 332 }, { x: 640, y: 262 }] },
    { roboInicial: { x: 30, y: 490 }, estrelas: [{ x: 165, y: 412 }, { x: 350, y: 342 }, { x: 530, y: 267 }] },
  ];
  return layouts[faseIndex] || layouts[0];
}

function simular(comandos, faseIndex) {
  const layout      = getLayoutFase(faseIndex);
  const plataformas = getPlatformas(faseIndex);
  const STAR_R      = 20;

  let rx = layout.roboInicial.x, ry = layout.roboInicial.y;
  let vx = 0, vy = 0, noChao = false;
  let estrelas  = layout.estrelas.map((s, i) => ({ ...s, id: i, coletada: false }));
  let coletadas = 0;
  const snapshots = [];
  let tick = 0;

  function colidePlataforma() {
    noChao = false;
    for (const p of plataformas) {
      const overlapX = (rx + ROBO_W) > p.x && rx < p.x + p.w;
      const overlapY = (ry + ROBO_H) > p.y && ry < p.y + p.h;
      if (overlapX && overlapY) {
        const fromBottom = (ry + ROBO_H) - p.y;
        const fromTop    = (p.y + p.h) - ry;
        const fromLeft   = (rx + ROBO_W) - p.x;
        const fromRight  = (p.x + p.w) - rx;
        const minPen = Math.min(fromBottom, fromTop, fromLeft, fromRight);
        if      (minPen === fromBottom && vy >= 0) { ry = p.y - ROBO_H; vy = 0; noChao = true; }
        else if (minPen === fromTop    && vy  < 0) { ry = p.y + p.h; vy = 0; }
        else if (minPen === fromLeft)               { rx = p.x - ROBO_W; vx = 0; }
        else if (minPen === fromRight)              { rx = p.x + p.w;    vx = 0; }
      }
    }
  }

  function coletarEstrelas() {
    const cx = rx + ROBO_W / 2, cy = ry + ROBO_H / 2;
    estrelas.forEach(s => {
      if (!s.coletada) {
        const dx = cx - s.x, dy = cy - s.y;
        if (Math.sqrt(dx*dx + dy*dy) < STAR_R + 18) { s.coletada = true; coletadas++; }
      }
    });
  }

  function snapshot(cmd) {
    snapshots.push({ cmd, tick, robo: { x: rx, y: ry, vx, vy, noChao }, estrelas: estrelas.map(s => ({ ...s })), coletadas });
  }

  snapshot('inicio');

  function physicsTick(cmd, localT) {
    if (tick >= WORLD.maxTicks) return;
    tick++;
    vy += WORLD.gravity;
    vx *= noChao ? WORLD.friction : WORLD.airFriction;
    vx = Math.max(-16, Math.min(16, vx));
    vy = Math.max(-18, Math.min(18, vy));
    rx += vx; ry += vy;
    if (rx < 0)                    { rx = 0; vx = 0; }
    if (rx + ROBO_W > WORLD.width) { rx = WORLD.width - ROBO_W; vx = 0; }
    if (ry + ROBO_H > WORLD.height){ ry = WORLD.height - ROBO_H; vy = 0; noChao = true; }
    colidePlataforma();
    coletarEstrelas();
    if (localT % 3 === 0) snapshot(cmd);
  }

  for (const cmd of comandos) {
    if (tick >= WORLD.maxTicks) break;
    if      (cmd === 'right')   { vx += WORLD.moveSpeed; }
    else if (cmd === 'left')    { vx -= WORLD.moveSpeed; }
    else if (cmd === 'up')      { if (noChao) vy = WORLD.jumpVel; }
    else if (cmd === 'spin')    { vx *= 0.3; vy = WORLD.jumpVel * 0.7; }
    else if (cmd === 'collect') { coletarEstrelas(); }

    if (cmd === 'up' || cmd === 'spin') {
      let t = 0;
      while (vy < 0 && tick < WORLD.maxTicks) physicsTick(cmd, t++);
      while (!noChao && tick < WORLD.maxTicks) physicsTick(cmd, t++);
    } else {
      const dur = TICKS_CMD[cmd] || 6;
      for (let t = 0; t < dur && tick < WORLD.maxTicks; t++) physicsTick(cmd, t);
      let safety = 0;
      while (!noChao && tick < WORLD.maxTicks && safety++ < 100) physicsTick(cmd, TICKS_CMD.right + safety);
    }
    snapshot(cmd + '_end');
  }

  return { snapshots, coletadas, totalEstrelas: estrelas.length, vitoria: coletadas === estrelas.length, plataformas, layoutFase: layout, mundo: { width: WORLD.width, height: WORLD.height } };
}

/* ════════════════════════════════════════════════
   CONFIGURAÇÃO GLOBAL
════════════════════════════════════════════════ */
const CONFIG       = { volume: 0.7, idioma: 'pt' };
let faseAtual      = 0;
let fasesCompletas = [];
let playerChar     = '🤖';
let playerName     = 'Astronauta';

const FASES = [
  { emoji: '🌙', dif: 1, nome: { pt: 'Primeiro Voo', en: 'First Flight' } },
  { emoji: '🪐', dif: 2, nome: { pt: 'Nebulosa',     en: 'Nebula'      } },
  { emoji: '☄️', dif: 3, nome: { pt: 'Buraco Negro', en: 'Black Hole'  } },
];

const TUT_STEPS = [
  { emoji:'🌟', titulo:{ pt:'Sua Missão!', en:'Your Mission!' }, texto:{ pt:'Olá, Astronauta! Neste jogo você vai <b>programar um robozinho</b> para coletar as estrelas ⭐ do espaço!\n\nO mundo tem <b>plataformas</b> — use <b>🦘 Pular!</b> para saltar entre elas!', en:'Hello, Astronaut! In this game you will <b>program a little robot</b> to collect stars ⭐ in space!\n\nThe world has <b>platforms</b> — use the <b>🦘 Jump!</b> block to leap!' }, type:'info' },
  { emoji:'🧩', titulo:{ pt:'Arrastar os Blocos!', en:'Drag the Blocks!' }, texto:{ pt:'Você usa <b>blocos coloridos</b> para dar ordens ao robô.\n\nClique no bloco abaixo para colocá-lo na caixa! ✨', en:'You use <b>colored blocks</b> to give orders to the robot.\n\nClick the block below to place it in the box! ✨' }, type:'drag' },
  { emoji:'⭐', titulo:{ pt:'Coletar Estrelas!', en:'Collect Stars!' }, texto:{ pt:'Quando o robô chegar perto de uma estrela, use o bloco <b>⭐ Coletar</b>!\n\nColoque o bloco Coletar na caixa para continuar!', en:'When the robot reaches a star, use the <b>⭐ Collect</b> block!\n\nPlace the Collect block in the box to continue!' }, type:'collect' },
  { emoji:'🏆', titulo:{ pt:'Ganhe Recompensas!', en:'Earn Rewards!' }, texto:{ pt:'Cada estrela coletada é uma <b>vitória</b>! ⭐\n\nSe pegar todas as 3 estrelas, você ganha uma recompensa especial! 🎉\n\nVamos começar!', en:"Each star collected is a <b>victory</b>! ⭐\n\nIf you get all 3 stars, you earn a special reward! 🎉\n\nLet's start!" }, type:'reward' },
];

/* ════════════════════════════════════════════════
   ÁUDIO — Web Audio API
════════════════════════════════════════════════ */
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playSound(type) {
  if (CONFIG.volume <= 0) return;
  try {
    const ctx    = getAudioCtx();
    const master = ctx.createGain(); master.gain.value = CONFIG.volume * 0.14;
    const lpf    = ctx.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = 900; lpf.Q.value = 0.5;
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
    else if (type === 'victory') { [261,330,392,523].forEach((f,i) => note(f, i*0.16, 0.40)); }
    else if (type === 'jump')    { note(330,0,0.12); note(440,0.10,0.18); }
    else if (type === 'click')   { note(220,0,0.10); }
  } catch(e) {}
}

/* ════════════════════════════════════════════════
   CONFETTI
════════════════════════════════════════════════ */
function launchConfetti() {
  const colors = ['#FF6B6B','#4ECDC4','#45B7D1','#FFA07A','#FFD700','#C3A3FF','#9FE1CB','#FF9FF3'];
  for (let i = 0; i < 90; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      const sz = 6 + Math.random() * 9, isCircle = Math.random() > 0.4;
      el.style.cssText = [
        'position:fixed',
        `top:${-20 - Math.random()*30}px`,
        `left:${Math.random()*100}%`,
        `width:${sz}px`,
        `height:${sz*(isCircle?1:0.5+Math.random())}px`,
        `background:${colors[Math.floor(Math.random()*colors.length)]}`,
        `border-radius:${isCircle?'50%':'2px'}`,
        `animation:confettiFall ${1.4+Math.random()*1.6}s ease-in forwards`,
        'z-index:9999','pointer-events:none'
      ].join(';');
      document.body.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    }, i * 18 + Math.random() * 50);
  }
}

/* ════════════════════════════════════════════════
   LOCALSTORAGE — Progresso
════════════════════════════════════════════════ */
const SAVE_KEY = 'spark_v3';

function salvarProgresso() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ faseAtual, fasesCompletas, volume: CONFIG.volume, idioma: CONFIG.idioma })); } catch(e) {}
}

function carregarProgresso() {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!d) return;
    if (d.faseAtual != null)  faseAtual      = d.faseAtual;
    if (d.fasesCompletas)     fasesCompletas  = d.fasesCompletas;
    if (d.volume != null)     CONFIG.volume   = d.volume;
    if (d.idioma)             CONFIG.idioma   = d.idioma;
  } catch(e) {}
}

function temProgresso() { return fasesCompletas.length > 0 || faseAtual > 0; }

/* ════════════════════════════════════════════════
   ESTRELAS DE FUNDO (menus)
════════════════════════════════════════════════ */
function gerarEstrelas(containerId, count = 100) {
  const c = document.getElementById(containerId); if (!c) return;
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div'); s.className = 'star';
    const sz = Math.random() * 2.5 + 0.5, dur = (Math.random() * 3 + 1.5).toFixed(1);
    s.style.cssText = `width:${sz}px;height:${sz}px;top:${Math.random()*100}%;left:${Math.random()*100}%;--dur:${dur}s;animation-delay:${(Math.random()*4).toFixed(1)}s;`;
    c.appendChild(s);
  }
}

/* ════════════════════════════════════════════════
   SPLASH
════════════════════════════════════════════════ */
gerarEstrelas('stars-splash', 120);

document.querySelectorAll('.char-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.char-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected'); playerChar = btn.dataset.char; playSound('click');
  });
});

function showSplash() {
  ['tutorial','phase-select'].forEach(id => {
    const el = document.getElementById(id);
    el.classList.remove('fade-out'); el.classList.add('hidden');
  });
  document.getElementById('app').classList.remove('visible');
  const s = document.getElementById('splash');
  s.classList.remove('hidden','fade-out');
  document.getElementById('btn-continue').classList.toggle('hidden', !temProgresso());
}

function transitionFrom(elementId, callback) {
  const el = document.getElementById(elementId);
  el.classList.add('fade-out');
  el.addEventListener('animationend', () => { el.classList.add('hidden'); el.classList.remove('fade-out'); callback(); }, { once: true });
}

document.getElementById('btn-start').addEventListener('click', () => {
  playerName = document.getElementById('player-name').value.trim() || 'Astronauta';
  playSound('click'); transitionFrom('splash', startTutorial);
});
document.getElementById('btn-continue').addEventListener('click', () => {
  playerName = document.getElementById('player-name').value.trim() || playerName;
  playSound('click'); transitionFrom('splash', showPhaseSelect);
});
document.getElementById('btn-settings-splash').addEventListener('click', openSettings);

/* ════════════════════════════════════════════════
   TUTORIAL
════════════════════════════════════════════════ */
gerarEstrelas('stars-tutorial', 80);
let tutStep = 0;

function startTutorial() { document.getElementById('tutorial').classList.remove('hidden'); renderTutStep(0); }
function finishTutorial() { transitionFrom('tutorial', showPhaseSelect); }

function renderTutStep(step) {
  tutStep = step;
  const s = TUT_STEPS[step];
  document.querySelectorAll('.tut-dot').forEach((dot, i) => { dot.classList.toggle('active', i === step); dot.classList.toggle('done', i < step); });
  document.getElementById('tut-emoji').textContent  = s.emoji;
  document.getElementById('tut-title').textContent  = s.titulo[CONFIG.idioma];
  document.getElementById('tut-text').innerHTML     = s.texto[CONFIG.idioma].replace(/\n/g,'<br>');
  document.getElementById('tut-feedback').textContent = '';
  document.getElementById('tut-reward').classList.remove('show');
  const interactive = document.getElementById('tut-interactive');
  interactive.innerHTML = ''; interactive.classList.remove('hidden');
  const nextBtn = document.getElementById('btn-tut-next');
  nextBtn.textContent = step < TUT_STEPS.length - 1 ? 'Próximo ➜' : '🚀 Iniciar Missão!';
  nextBtn.onclick = () => { playSound('click'); if (step < TUT_STEPS.length - 1) renderTutStep(step + 1); else finishTutorial(); };
  if (s.type === 'info') { interactive.classList.add('hidden'); nextBtn.disabled = false; return; }
  if (s.type === 'drag' || s.type === 'collect') {
    nextBtn.disabled = true;
    const blockClass = s.type === 'drag' ? 'right' : 'collect';
    const blockText  = s.type === 'drag' ? '➡️ Direita' : '⭐ Coletar';
    const bloco = document.createElement('button'); bloco.className = `tut-block ${blockClass}`; bloco.innerHTML = blockText; bloco.draggable = true;
    const dz = document.createElement('div'); dz.className = 'tut-dropzone'; dz.textContent = 'Arraste ou clique aqui 👆';
    let done = false;
    const markDone = () => {
      if (done) return; done = true; playSound('collect');
      dz.innerHTML = ''; const placed = document.createElement('button'); placed.className = `tut-block ${blockClass}`; placed.innerHTML = blockText; dz.appendChild(placed);
      document.getElementById('tut-feedback').textContent = s.type === 'drag' ? '🎉 Ótimo! Você colocou o bloco!' : '⭐ Incrível! Você aprendeu a coletar!';
      const reward = document.getElementById('tut-reward'); reward.textContent = '⭐ Muito bem!'; reward.classList.add('show'); nextBtn.disabled = false;
    };
    bloco.addEventListener('click', markDone);
    bloco.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', blockClass));
    dz.addEventListener('dragover',  e => { e.preventDefault(); dz.classList.add('drag-over'); });
    dz.addEventListener('dragleave', () => dz.classList.remove('drag-over'));
    dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('drag-over'); markDone(); });
    const row = document.createElement('div'); row.style.cssText = 'display:flex;gap:12px;align-items:center;flex-wrap:wrap;justify-content:center;';
    const arrow = document.createElement('span'); arrow.textContent = '→'; arrow.style.cssText = 'color:rgba(255,255,255,0.5);font-size:20px;';
    row.appendChild(bloco); row.appendChild(arrow); row.appendChild(dz); interactive.appendChild(row); return;
  }
  if (s.type === 'reward') {
    interactive.innerHTML = `<div style="display:flex;gap:16px;font-size:36px;animation:rocketBounce 1.5s ease-in-out infinite;">⭐ ⭐ ⭐</div><div style="color:#7FFFD4;font-size:13px;margin-top:6px;">3 ⭐ = 🎁</div>`;
    nextBtn.disabled = false;
  }
}

document.getElementById('btn-tut-back').addEventListener('click', () => {
  playSound('click'); if (tutStep > 0) renderTutStep(tutStep - 1); else transitionFrom('tutorial', showSplash);
});

/* ════════════════════════════════════════════════
   SELEÇÃO DE FASES
════════════════════════════════════════════════ */
gerarEstrelas('stars-phases', 90);

function showPhaseSelect() {
  document.getElementById('app').classList.remove('visible');
  document.getElementById('phase-select').classList.remove('hidden');
  renderPhaseCards();
}

function renderPhaseCards() {
  const grid = document.getElementById('phase-grid'); grid.innerHTML = '';
  FASES.forEach((fase, i) => {
    const completa = fasesCompletas.includes(i), desbloqueada = i === 0 || fasesCompletas.includes(i - 1);
    const card = document.createElement('div');
    card.className = `phase-card ${completa ? 'completa' : ''} ${!desbloqueada ? 'bloqueada' : ''}`;
    const dif = '★'.repeat(fase.dif) + '☆'.repeat(3 - fase.dif);
    let statusHtml = '';
    if (completa)           statusHtml = `<div class="phase-status ok">✓ Concluída</div>`;
    else if (!desbloqueada) statusHtml = `<div class="phase-status lock">🔒 Bloqueada</div>`;
    card.innerHTML = `<span class="phase-emoji">${fase.emoji}</span><div class="phase-nome">${fase.nome[CONFIG.idioma]}</div><div class="phase-dif">${dif}</div>${statusHtml}`;
    if (desbloqueada) card.addEventListener('click', () => { playSound('click'); transitionFrom('phase-select', () => iniciarFase(i)); });
    grid.appendChild(card);
  });
}

document.getElementById('btn-phase-home').addEventListener('click', () => { playSound('click'); transitionFrom('phase-select', showSplash); });
document.getElementById('btn-settings-phases').addEventListener('click', openSettings);

/* ════════════════════════════════════════════════
   SETTINGS
════════════════════════════════════════════════ */
function openSettings() {
  document.getElementById('settings-modal').classList.remove('hidden');
  document.getElementById('vol-slider').value = CONFIG.volume;
  document.getElementById('vol-val').textContent = Math.round(CONFIG.volume * 100) + '%';
}
function closeSettings() { document.getElementById('settings-modal').classList.add('hidden'); salvarProgresso(); }

document.getElementById('btn-settings-close').addEventListener('click', () => { playSound('click'); closeSettings(); });
document.getElementById('btn-settings-game').addEventListener('click', openSettings);
document.getElementById('settings-modal').addEventListener('click', e => { if (e.target === document.getElementById('settings-modal')) closeSettings(); });
document.getElementById('vol-slider').addEventListener('input', e => { CONFIG.volume = parseFloat(e.target.value); document.getElementById('vol-val').textContent = Math.round(CONFIG.volume * 100) + '%'; });
document.getElementById('vol-slider').addEventListener('change', () => playSound('click'));
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => { CONFIG.idioma = btn.dataset.lang; playSound('click'); salvarProgresso(); document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === CONFIG.idioma)); });
});

/* ════════════════════════════════════════════════
   CANVAS — RENDERIZAÇÃO 2D
════════════════════════════════════════════════ */
const canvas  = document.getElementById('mundo');
const ctx     = canvas.getContext('2d');
const WORLD_W = 1600;
const WORLD_H = 600;
const ROBO_W_CLIENT = 36, ROBO_H_CLIENT = 40;

function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function getScale()       { return (canvas.height * 0.82) / WORLD_H; }
function getWorldOffsetY(){ return (canvas.height - WORLD_H * getScale()) / 2; }

let mundoLayout = null;
let renderState = { roboX: 30, roboY: 490, vx: 0, vy: 0, estrelas: [], coletadas: 0, cameraX: 0 };
let particulas  = [], spinAngle = 0, isSpinning = false, spinTimer = 0, bgStars = [], drawTick = 0;

function calcCameraX(roboX) {
  const CW_world = canvas.width / getScale();
  return Math.max(0, Math.min(WORLD_W - CW_world, roboX - CW_world * 0.30));
}

function wx(worldX) { return (worldX - renderState.cameraX) * getScale(); }
function wy(worldY) { return getWorldOffsetY() + worldY * getScale(); }
function ws(size)   { return size * getScale(); }

function spawnParticulas(worldX, worldY) {
  for (let i = 0; i < 14; i++) {
    const angle = (Math.PI * 2 / 14) * i;
    particulas.push({ x: worldX, y: worldY, vx: Math.cos(angle)*(2+Math.random()*2.5), vy: Math.sin(angle)*(2+Math.random()*2.5)-1.5, life: 1, color: ['#FFD700','#FFF176','#FFCA28','#FF8C00'][Math.floor(Math.random()*4)], size: 3+Math.random()*5 });
  }
}
function atualizarParticulas() {
  particulas = particulas.filter(p => p.life > 0);
  particulas.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.14; p.life -= 0.04; });
}

function gerarBgStars(mundoWidth) {
  bgStars = [];
  for (let i = 0; i < 220; i++) bgStars.push({ x: Math.random()*mundoWidth, y: Math.random()*WORLD_H*0.85, r: Math.random()*1.6+0.3, alpha: Math.random()*0.6+0.2, speed: Math.random()*0.3+0.05 });
}

function drawBackground() {
  const cw = canvas.width, ch = canvas.height;
  const grad = ctx.createLinearGradient(0,0,0,ch);
  grad.addColorStop(0, '#020609'); grad.addColorStop(0.5, '#050C1F'); grad.addColorStop(1, '#090F2A');
  ctx.fillStyle = grad; ctx.fillRect(0,0,cw,ch);
  if (!mundoLayout) return;
  bgStars.forEach(s => {
    const rawX = (s.x - renderState.cameraX * s.speed);
    const sx = ((rawX % WORLD_W) + WORLD_W) % WORLD_W * getScale();
    if (sx < -2 || sx > cw + 2) return;
    const sy = getWorldOffsetY() * 0.3 + s.y * getScale() * 0.45;
    ctx.beginPath(); ctx.arc(sx, sy, s.r, 0, Math.PI*2);
    ctx.fillStyle = `rgba(255,255,255,${s.alpha})`; ctx.fill();
  });
  const neb = ctx.createRadialGradient(cw*0.65, ch*0.30, 10, cw*0.65, ch*0.30, cw*0.28);
  neb.addColorStop(0, 'rgba(80,40,180,0.05)'); neb.addColorStop(1, 'rgba(80,40,180,0)');
  ctx.fillStyle = neb; ctx.fillRect(0,0,cw,ch);
}

function drawPlataformas(plataformas) {
  plataformas.forEach(p => {
    const sx = wx(p.x), sy = wy(p.y), sw = ws(p.w), sh = ws(p.h);
    if (sx + sw < 0 || sx > canvas.width) return;
    const isChao = p.y >= 500;
    if (isChao) {
      const grad = ctx.createLinearGradient(sx,sy,sx,sy+sh);
      grad.addColorStop(0,'#1A3A6E'); grad.addColorStop(0.3,'#0F2347'); grad.addColorStop(1,'#080E1A');
      ctx.fillStyle = grad; ctx.fillRect(sx,sy,sw,sh);
      ctx.fillStyle = 'rgba(100,180,255,0.35)'; ctx.fillRect(sx,sy,sw,ws(2.5));
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      for (let cx = sx + ws(20); cx < sx + sw - ws(20); cx += ws(48)) {
        ctx.beginPath(); ctx.arc(cx, sy+ws(14), ws(8), 0, Math.PI); ctx.fill();
      }
    } else {
      const grad = ctx.createLinearGradient(sx,sy,sx,sy+sh);
      grad.addColorStop(0,'#2A6ED4'); grad.addColorStop(1,'#0F3A80');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.roundRect(sx,sy,sw,sh,ws(5)); ctx.fill();
      ctx.fillStyle = 'rgba(120,200,255,0.55)';
      ctx.beginPath(); ctx.roundRect(sx+ws(5),sy+ws(1.5),sw-ws(10),ws(3.5),ws(2)); ctx.fill();
      ctx.shadowColor = 'rgba(80,160,255,0.55)'; ctx.shadowBlur = ws(8);
      ctx.strokeStyle = 'rgba(100,180,255,0.5)'; ctx.lineWidth = ws(1);
      ctx.beginPath(); ctx.roundRect(sx,sy,sw,sh,ws(5)); ctx.stroke();
      ctx.shadowBlur = 0;
    }
  });
}

function drawEstrelas(estrelas) {
  estrelas.forEach(s => {
    if (s.coletada) return;
    const sx = wx(s.x), sy = wy(s.y);
    if (sx < -30 || sx > canvas.width + 30) return;
    const pulseFactor = 1 + Math.sin(drawTick * 0.06 + s.id * 1.2) * 0.12;
    const glow = ctx.createRadialGradient(sx,sy,0,sx,sy,ws(24));
    glow.addColorStop(0,'rgba(255,220,50,0.4)'); glow.addColorStop(1,'rgba(255,180,0,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(sx,sy,ws(24),0,Math.PI*2); ctx.fill();
    ctx.font = `${ws(22)}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.save(); ctx.translate(sx,sy); ctx.scale(pulseFactor,pulseFactor); ctx.fillText('⭐',0,0); ctx.restore();
  });
}

function drawRobo(roboX, roboY) {
  const sx = wx(roboX + ROBO_W_CLIENT/2), sy = wy(roboY + ROBO_H_CLIENT/2);
  const hoverY = isSpinning ? 0 : Math.sin(drawTick * 0.08) * ws(2);
  ctx.save(); ctx.translate(sx,sy);
  if (isSpinning) ctx.rotate(spinAngle);
  ctx.fillStyle = 'rgba(0,0,80,0.30)';
  ctx.beginPath(); ctx.ellipse(0, ws(20)+hoverY+ws(5), ws(13), ws(5), 0, 0, Math.PI*2); ctx.fill();
  if (renderState.vy < -1.5) {
    const flameGrad = ctx.createRadialGradient(0, ws(20)+hoverY, 0, 0, ws(22)+hoverY, ws(13));
    flameGrad.addColorStop(0,'rgba(255,180,50,0.9)'); flameGrad.addColorStop(1,'rgba(255,80,0,0)');
    ctx.fillStyle = flameGrad; ctx.beginPath(); ctx.arc(0, ws(22)+hoverY, ws(13), 0, Math.PI*2); ctx.fill();
  }
  ctx.font = `${ws(30)}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(playerChar, 0, hoverY); ctx.restore();
}

function drawParticulas() {
  particulas.forEach(p => {
    ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(wx(p.x), wy(p.y), p.size * p.life, 0, Math.PI*2); ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawHUD(coletadas, total) {
  const x = 12, y = canvas.height - 34;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath(); ctx.roundRect(x,y,88,26,8); ctx.fill();
  ctx.font = `bold 14px "Comic Sans MS", cursive`; ctx.fillStyle = '#FFD700';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(`⭐ ${coletadas}/${total}`, x+8, y+13);
}

function drawMundo() {
  drawTick++;
  if (isSpinning) { spinAngle += 0.18; spinTimer--; if (spinTimer <= 0) { isSpinning = false; spinAngle = 0; } }
  atualizarParticulas();
  drawBackground();
  if (!mundoLayout) {
    ctx.font = `16px "Comic Sans MS", cursive`; ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Carregando...', canvas.width/2, canvas.height/2);
    return;
  }
  drawPlataformas(mundoLayout.plataformas);
  drawEstrelas(renderState.estrelas);
  drawRobo(renderState.roboX, renderState.roboY);
  drawParticulas();
  const totalEstrelas = mundoLayout.layout ? mundoLayout.layout.estrelas.length : 3;
  drawHUD(renderState.coletadas, totalEstrelas);
}

/* ── Minimap ── */
function updateMinimap(roboX, estrelas) {
  document.getElementById('minimap-robo').style.left = (roboX / WORLD_W * 100) + '%';
  const bar = document.getElementById('minimap-bar');
  bar.querySelectorAll('.minimap-star').forEach(e => e.remove());
  estrelas.forEach(s => {
    if (s.coletada) return;
    const el = document.createElement('div'); el.className = 'minimap-star'; el.style.left = (s.x / WORLD_W * 100) + '%'; bar.appendChild(el);
  });
}

/* ════════════════════════════════════════════════
   BLOCOS & DRAG DROP
════════════════════════════════════════════════ */
const COLORS      = { right:'#B5D4F4', left:'#C0DD97', up:'#FAC775', spin:'#CECBF6', collect:'#9FE1CB' };
const TEXT_COLORS = { right:'#0C447C', left:'#27500A', up:'#633806', spin:'#3C3489', collect:'#085041' };
const ICONS       = { right:'➡️', left:'⬅️', up:'🦘', spin:'🔄', collect:'⭐' };
const LABELS      = { right:'Direita', left:'Esquerda', up:'Pular!', spin:'Girar', collect:'Coletar' };
const MAX_BLOCKS_POR_FASE = [9, 11, 13];

const dropZone = document.getElementById('drop-zone');
const hint     = document.getElementById('hint');
const msg      = document.getElementById('msg');

function updateHint() {
  const n = dropZone.querySelectorAll('.prog-block').length;
  hint.style.display = n === 0 ? 'block' : 'none';
  const max = MAX_BLOCKS_POR_FASE[faseAtual] || 9;
  const counter = document.getElementById('block-counter');
  if (counter) { counter.textContent = `${n}/${max} blocos`; counter.style.color = n >= max ? 'rgba(255,150,100,0.8)' : 'rgba(168,200,255,0.5)'; }
}

function addBlock(cmd) {
  const maxBlocos = MAX_BLOCKS_POR_FASE[faseAtual] || 9;
  if (dropZone.querySelectorAll('.prog-block').length >= maxBlocos) {
    msg.textContent = `Máximo de ${maxBlocos} blocos! 😊`;
    setTimeout(() => { if (msg.textContent.startsWith('Máximo')) msg.textContent = ''; }, 2000);
    return;
  }
  const div = document.createElement('div'); div.className = 'prog-block'; div.dataset.cmd = cmd;
  div.style.background = COLORS[cmd]; div.style.color = TEXT_COLORS[cmd];
  div.innerHTML = `${ICONS[cmd]} ${LABELS[cmd]}<button class="remove-btn" title="Remover">✕</button>`;
  div.querySelector('.remove-btn').addEventListener('click', () => { div.remove(); updateHint(); });
  dropZone.appendChild(div); updateHint();
}

document.querySelectorAll('.block').forEach(btn => {
  btn.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', btn.dataset.cmd));
  btn.addEventListener('click', () => { addBlock(btn.dataset.cmd); playSound('click'); });
});
dropZone.addEventListener('dragover',  e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => { e.preventDefault(); dropZone.classList.remove('drag-over'); const cmd = e.dataTransfer.getData('text/plain'); if (COLORS[cmd]) addBlock(cmd); });
document.getElementById('clear-btn').addEventListener('click', () => {
  dropZone.querySelectorAll('.prog-block').forEach(n => n.remove()); updateHint(); msg.textContent = ''; resetRenderState(); document.getElementById('hud-score').textContent = '⭐ 0'; particulas = [];
});
document.getElementById('btn-back-to-phases').addEventListener('click', () => { document.getElementById('app').classList.remove('visible'); showPhaseSelect(); });

/* ════════════════════════════════════════════════
   JOGO — INICIAR FASE E EXECUTAR
════════════════════════════════════════════════ */
function resetRenderState() {
  if (!mundoLayout) return;
  const layout = mundoLayout.layout;
  renderState.roboX     = layout.roboInicial.x;
  renderState.roboY     = layout.roboInicial.y;
  renderState.vx        = 0; renderState.vy = 0;
  renderState.estrelas  = layout.estrelas.map((s, i) => ({ ...s, id: i, coletada: false }));
  renderState.coletadas = 0;
  renderState.cameraX   = calcCameraX(layout.roboInicial.x);
  updateMinimap(renderState.roboX, renderState.estrelas);
}

function iniciarFase(index) {
  faseAtual = index; salvarProgresso();
  const fase = FASES[faseAtual];
  document.getElementById('game-title').textContent = `${playerChar} ${fase.nome[CONFIG.idioma]}`;
  document.getElementById('phase-indicator').textContent = `Fase ${faseAtual + 1}/${FASES.length}`;
  dropZone.querySelectorAll('.prog-block').forEach(n => n.remove()); updateHint(); msg.textContent = '';
  document.getElementById('hud-score').textContent = '⭐ 0'; particulas = [];
  document.getElementById('app').classList.add('visible');

  mundoLayout = {
    layout:      getLayoutFase(index),
    plataformas: getPlatformas(index),
    mundo:       { width: WORLD_W, height: WORLD_H },
  };
  gerarBgStars(WORLD_W);
  resetRenderState();
}

/* ── Executar programa ── */
const wait = ms => new Promise(r => setTimeout(r, ms));

async function animarSnapshot(snap, prev, durMs) {
  if (!snap) return;
  const isFirstOfCmd = !prev || prev.cmd !== snap.cmd;
  if (isFirstOfCmd && (snap.cmd === 'up' || snap.cmd === 'spin')) { playSound('jump'); isSpinning = (snap.cmd === 'spin'); spinTimer = 28; }
  const novaColeta = snap.coletadas > (prev ? prev.coletadas : 0);
  if (novaColeta) {
    playSound('collect');
    if (prev) prev.estrelas.forEach((ps, i) => { if (!ps.coletada && snap.estrelas[i] && snap.estrelas[i].coletada) spawnParticulas(ps.x, ps.y); });
  }
  renderState.roboX     = snap.robo.x;
  renderState.roboY     = snap.robo.y;
  renderState.vx        = snap.robo.vx;
  renderState.vy        = snap.robo.vy;
  renderState.cameraX   = calcCameraX(snap.robo.x);
  renderState.estrelas  = snap.estrelas;
  renderState.coletadas = snap.coletadas;
  document.getElementById('hud-score').textContent = `⭐ ${snap.coletadas}`;
  updateMinimap(renderState.roboX, renderState.estrelas);
  await wait(durMs);
}

document.getElementById('run-btn').addEventListener('click', async () => {
  const comandos = Array.from(dropZone.querySelectorAll('.prog-block')).map(n => n.dataset.cmd);
  if (comandos.length === 0) { msg.textContent = 'Adicione blocos primeiro! 😊'; return; }
  msg.textContent = '⏳ Simulando...';
  const runBtn = document.getElementById('run-btn'); runBtn.disabled = true;
  try {
    const { snapshots, coletadas, totalEstrelas, vitoria, plataformas } = simular(comandos, faseAtual);
    if (plataformas) mundoLayout.plataformas = plataformas;
    msg.textContent = '';
    const blocks = dropZone.querySelectorAll('.prog-block');
    let prevSnap = null, cmdIdx = 0;
    for (let i = 0; i < snapshots.length; i++) {
      const snap = snapshots[i];
      if (snap.cmd.endsWith('_end')) { if (blocks[cmdIdx]) blocks[cmdIdx].style.outline = ''; cmdIdx++; }
      else if (!snap.cmd.includes('inicio')) { const activeIdx = Math.max(0,cmdIdx); if (blocks[activeIdx]) blocks[activeIdx].style.outline = '3px solid #64B4FF'; }
      await animarSnapshot(snap, prevSnap, snap.cmd === 'inicio' ? 0 : 26);
      prevSnap = snap;
    }
    if (blocks[cmdIdx]) blocks[cmdIdx].style.outline = '';
    if (vitoria) {
      msg.innerHTML = `<span class="star-anim">⭐</span> Parabéns! Coletou tudo!`;
      setTimeout(() => showVictory(), 700);
    } else if (coletadas > 0) {
      msg.textContent = `Ótimo! Coletou ${coletadas} estrela(s)! Tente pegar todas!`;
    } else {
      msg.textContent = 'Tente chegar nas estrelas! 💪';
    }
  } catch(err) {
    msg.textContent = '❌ Erro na simulação.'; console.error(err);
  } finally {
    runBtn.disabled = false;
  }
});

/* ════════════════════════════════════════════════
   VITÓRIA
════════════════════════════════════════════════ */
function showVictory() {
  if (!fasesCompletas.includes(faseAtual)) { fasesCompletas.push(faseAtual); salvarProgresso(); }
  launchConfetti(); playSound('victory');
  const modal   = document.getElementById('victory-modal');
  const btnNext = document.getElementById('btn-next-phase');
  const temProxima = faseAtual < FASES.length - 1;
  btnNext.style.display = temProxima ? '' : 'none';
  btnNext.onclick = () => { modal.classList.add('hidden'); playSound('click'); faseAtual++; salvarProgresso(); iniciarFase(faseAtual); };
  document.getElementById('btn-see-phases').onclick = () => { modal.classList.add('hidden'); playSound('click'); document.getElementById('app').classList.remove('visible'); showPhaseSelect(); };
  modal.classList.remove('hidden');
}

/* ════════════════════════════════════════════════
   LOOP DE RENDERIZAÇÃO
════════════════════════════════════════════════ */
function renderLoop() { drawMundo(); requestAnimationFrame(renderLoop); }
renderLoop();

/* ════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════ */
(function init() {
  carregarProgresso();
  document.getElementById('vol-slider').value = CONFIG.volume;
  document.getElementById('vol-val').textContent = Math.round(CONFIG.volume * 100) + '%';
  document.getElementById('btn-continue').classList.toggle('hidden', !temProgresso());
  hint.style.display = 'block';
})();
