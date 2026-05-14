/* =============================================
   DESENHA MUNDO — FASE 4
   "O Rio das Travessias"

   7 ILHAS separadas por gaps de água.
   • Ilhas 1–2: só desenha a ponte
   • Ilhas 3–7: chuva começa ao chegar —
     precisa desenhar abrigo ANTES da ponte

   Personagem: carregado do localStorage
   (traços sem fundo — PNG transparente).
   Fallback: Pingo em canvas.

   Princípios neurodivergentes:
   • Qualquer coisa desenhada é aceita (≥3%)
   • Sem limite de tempo, sem pressão
   • Feedback positivo sempre
   • Abrigo aparece flutuando sobre o sprite
   • Fala do Pingo varia a cada ilha de chuva
============================================= */

/* ════════════════════════════════════════════
   CANVAS + CONTEXTO
════════════════════════════════════════════ */
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

function redimensionar() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
redimensionar();
window.addEventListener('resize', () => { redimensionar(); });

/* ════════════════════════════════════════════
   CONSTANTES DO MUNDO
════════════════════════════════════════════ */
const TOTAL_ILHAS  = 7;
const ILHA_W_BASE  = 180;
const ILHA_H       = 72;
const ILHA_CHUVA   = 2;          // a partir do índice 2 (3ª ilha) há chuva
const VELOCIDADE   = 3.6;
const GRAVIDADE    = 0.55;
const PULO         = -13;
const SPRITE_W     = 64;
const SPRITE_H     = 64;
const TRIGGER_DIST = 260;        // distância para mostrar botão de ponte

/* Espaçamento entre ilhas */
function larguraGap(i) { return 100 + i * 20; }

/* ════════════════════════════════════════════
   CONSTRUÇÃO DO LAYOUT DAS ILHAS
════════════════════════════════════════════ */
const ilhas = [];
let curX = 60;

for (let i = 0; i < TOTAL_ILHAS; i++) {
  const w = ILHA_W_BASE + (i === 0 || i === TOTAL_ILHAS - 1 ? 50 : 0);
  ilhas.push({ x: curX, w, h: ILHA_H, index: i });
  curX += w;
  if (i < TOTAL_ILHAS - 1) curX += larguraGap(i);
}

const MUNDO_W = curX + 80;

/* Gaps entre ilhas */
const gaps = [];
for (let g = 0; g < TOTAL_ILHAS - 1; g++) {
  const il = ilhas[g], ir = ilhas[g + 1];
  gaps.push({
    index:    g,
    x:        il.x + il.w,
    w:        larguraGap(g),
    ponteImg: null,      // ImageBitmap com o desenho da ponte
    cruzado:  false,
  });
}

/* ════════════════════════════════════════════
   ESTADO DO JOGO
════════════════════════════════════════════ */
const estado = {
  personagemImg: null,
  abrigoImg:     null,   // ImageBitmap do desenho de abrigo atual
  px: 0, py: 0,
  vx: 0, vy: 0,
  noChao:         true,
  viradoDireita:  true,
  animFrame:      0,
  animTimer:      0,
  camera:         0,
  teclas:         {},
  correndo:       false,
  mundoLargura:   MUNDO_W,
  ilhaAtual:      0,
  quedas:         0,
  pontos:         0,
  chuvaAtiva:     false,
  temAbrigo:      false,
  modalAberto:    false,
  vitoria:        false,
};

/* ════════════════════════════════════════════
   ELEMENTOS DA TELA
════════════════════════════════════════════ */
const telaCarregando     = document.getElementById('telaCarregando');
const loadBarra          = document.getElementById('loadBarra');
const avisoSemPersonagem = document.getElementById('avisoSemPersonagem');
const dicaBalao          = document.getElementById('dicaBalao');
const btnAbrirPonte      = document.getElementById('btnAbrirPonte');
const btnAbrirAbrigo     = document.getElementById('btnAbrirAbrigo');
const modalPonte         = document.getElementById('modalPonte');
const modalAbrigo        = document.getElementById('modalAbrigo');
const canvasPonte        = document.getElementById('canvasPonte');
const canvasAbrigo       = document.getElementById('canvasAbrigo');

/* ════════════════════════════════════════════
   CARREGAR PERSONAGEM DO LOCALSTORAGE
════════════════════════════════════════════ */
function simularBarra(cb) {
  let p = 0;
  const iv = setInterval(() => {
    p += Math.random() * 18 + 8;
    if (p >= 100) { p = 100; clearInterval(iv); setTimeout(cb, 300); }
    loadBarra.style.width = p + '%';
  }, 120);
}

function carregarPersonagem() {
  const dadosStr = localStorage.getItem('personagem_desenho');
  if (!dadosStr) {
    fetch('personagem_desenho.json')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => processarDados(d))
      .catch(() => mostrarAviso());
    return;
  }
  try { processarDados(JSON.parse(dadosStr)); }
  catch(e) { mostrarAviso(); }
}

function processarDados(dados) {
  const oc = document.createElement('canvas');
  oc.width  = dados.canvas.largura;
  oc.height = dados.canvas.altura;
  const octx = oc.getContext('2d');
  octx.lineCap = 'round'; octx.lineJoin = 'round';
  dados.tracos.forEach(t => {
    if (!t.pontos || t.pontos.length < 2) return;
    octx.beginPath();
    octx.strokeStyle = t.cor;
    octx.lineWidth   = t.espessura;
    octx.moveTo(t.pontos[0].x, t.pontos[0].y);
    for (let i = 1; i < t.pontos.length; i++)
      octx.lineTo(t.pontos[i].x, t.pontos[i].y);
    octx.stroke();
  });
  if (oc.width < 1)  oc.width  = 1;
  if (oc.height < 1) oc.height = 1;
  createImageBitmap(oc)
    .then(bmp => { estado.personagemImg = bmp; simularBarra(iniciarJogo); })
    .catch(()  => simularBarra(iniciarJogo));
}

function mostrarAviso() {
  telaCarregando.style.display = 'none';
  avisoSemPersonagem.classList.add('visivel');
}

/* ════════════════════════════════════════════
   CENÁRIO — ELEMENTOS DECORATIVOS
════════════════════════════════════════════ */

/* Nuvens do céu claro */
const nuvens = Array.from({ length: 6 }, () => ({
  x:     Math.random() * MUNDO_W,
  y:     20 + Math.random() * 80,
  vel:   0.06 + Math.random() * 0.08,
  emoji: Math.random() > 0.5 ? '☁️' : '⛅',
  size:  38 + Math.random() * 22,
}));

/* Pássaros decorativos */
const passaros = Array.from({ length: 4 }, () => ({
  x:    Math.random() * MUNDO_W,
  y:    30 + Math.random() * 60,
  vel:  0.4 + Math.random() * 0.3,
}));

/* Peixes na água */
const peixes = Array.from({ length: 8 }, () => ({
  x:    Math.random() * MUNDO_W,
  velY: 0,
  emoji: ['🐠','🐟','🐡'][Math.floor(Math.random() * 3)],
  size: 18 + Math.random() * 10,
}));

/* Flores e árvores por ilha */
const decorIlhas = ilhas.map(ilha => ({
  arvores: Array.from({ length: 1 + (ilha.index === 0 || ilha.index === TOTAL_ILHAS - 1 ? 1 : 0) }, (_, i) => ({
    relX: 0.2 + i * 0.45 + Math.random() * 0.1,
    emoji: ['🌴','🌳','🌲','🎋'][Math.floor(Math.random() * 4)],
  })),
  flores: Array.from({ length: 3 }, () => ({
    relX: 0.1 + Math.random() * 0.8,
    emoji: ['🌸','🌼','🌻','🌺','💐'][Math.floor(Math.random() * 5)],
    off:  Math.random() * Math.PI * 2,
  })),
}));

/* ════════════════════════════════════════════
   CHUVA — DOM Elements injetados no body
════════════════════════════════════════════ */
const camadaChuva = document.createElement('div');
camadaChuva.id = 'camadaChuva';
document.body.appendChild(camadaChuva);

const NUM_GOTAS = 90;
for (let i = 0; i < NUM_GOTAS; i++) {
  const g = document.createElement('div');
  g.className = 'gota-chuva';
  const h   = 8 + Math.random() * 18;
  const dur = 0.45 + Math.random() * 0.55;
  g.style.cssText = `left:${Math.random()*100}%;height:${h}px;animation-duration:${dur}s;animation-delay:${-Math.random()*dur}s;opacity:${0.4+Math.random()*0.5}`;
  camadaChuva.appendChild(g);
}

/* Nuvens escuras da chuva */
const nuvensChuva = [];
for (let c = 0; c < 5; c++) {
  const n = document.createElement('div');
  n.className = 'nuvem-chuva-f4';
  n.textContent = '🌧️';
  const dur = 14 + Math.random() * 10;
  n.style.top  = (3 + c * 7) + '%';
  n.style.left = (Math.random() * 70) + '%';
  n.style.animationDuration = dur + 's';
  n.style.animationDelay    = (-Math.random() * dur) + 's';
  document.body.appendChild(n);
  nuvensChuva.push(n);
}

function iniciarChuva() {
  estado.chuvaAtiva = true;
  camadaChuva.classList.add('ativa');
  nuvensChuva.forEach(n => n.classList.add('ativa'));
  mostrarDica('🌧️ Está chovendo! Desenhe um abrigo antes de continuar!', 4500);
  btnAbrirAbrigo.classList.add('visivel');
  btnAbrirAbrigo.setAttribute('aria-hidden', 'false');
}

function ativarAbrigo(bitmap) {
  estado.temAbrigo  = true;
  estado.abrigoImg  = bitmap;
  camadaChuva.classList.remove('ativa');
  camadaChuva.classList.add('protegida');
  btnAbrirAbrigo.classList.remove('visivel');
  btnAbrirAbrigo.setAttribute('aria-hidden', 'true');
  mostrarDica('🛡️ Ótimo! Agora você pode desenhar a ponte!', 3000);
  estado.pontos += 30;
}

function encerrarChuva() {
  estado.chuvaAtiva = false;
  estado.temAbrigo  = false;
  estado.abrigoImg  = null;
  camadaChuva.classList.remove('ativa', 'protegida');
  nuvensChuva.forEach(n => n.classList.remove('ativa'));
}

/* ════════════════════════════════════════════
   POSIÇÃO INICIAL DO PERSONAGEM
════════════════════════════════════════════ */
function chaoIlha(idx) {
  return canvas.height * 0.56 - ilhas[idx].h;
}

function setPosInicial() {
  const il = ilhas[0];
  estado.px = il.x + 40;
  estado.py = chaoIlha(0) - SPRITE_H;
  estado.vy = 0;
  estado.noChao = true;
}

/* ════════════════════════════════════════════
   CONTROLES
════════════════════════════════════════════ */
document.addEventListener('keydown', e => {
  estado.teclas[e.key] = true;
  if ((e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') && estado.noChao) {
    estado.vy = PULO;
    estado.noChao = false;
  }
});
document.addEventListener('keyup',  e => { estado.teclas[e.key] = false; });

const btnEsq = document.getElementById('btnEsquerda');
const btnDir = document.getElementById('btnDireita');
btnEsq.addEventListener('pointerdown', () => { estado.teclas['ArrowLeft']  = true;  });
btnEsq.addEventListener('pointerup',   () => { estado.teclas['ArrowLeft']  = false; });
btnDir.addEventListener('pointerdown', () => { estado.teclas['ArrowRight'] = true;  });
btnDir.addEventListener('pointerup',   () => { estado.teclas['ArrowRight'] = false; });

/* ════════════════════════════════════════════
   DICA (balão flutuante)
════════════════════════════════════════════ */
let dicaTimer = null;
function mostrarDica(msg, ms = 3000) {
  dicaBalao.textContent = msg;
  dicaBalao.classList.remove('oculto');
  clearTimeout(dicaTimer);
  dicaTimer = setTimeout(() => dicaBalao.classList.add('oculto'), ms);
}

/* ════════════════════════════════════════════
   SISTEMA DE MODAIS (ponte + abrigo)
════════════════════════════════════════════ */
let corAtual  = '#4E342E';
let espAtual  = 9;
let desenhando = false;
let ultX = 0, ultY = 0;
let ctxPonte  = null;
let ctxAbrigo = null;

function inicCanvasModal(cv) {
  const c = cv.getContext('2d');
  c.fillStyle = '#ffffff';
  c.fillRect(0, 0, cv.width, cv.height);
  /* Guia tracejada */
  c.setLineDash([6, 4]);
  c.strokeStyle = 'rgba(41,198,216,0.25)';
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(0, cv.height / 2);
  c.lineTo(cv.width, cv.height / 2);
  c.stroke();
  c.setLineDash([]);
  return c;
}

function getPosMouse(e, cv) {
  const r = cv.getBoundingClientRect();
  const src = e.touches ? e.touches[0] : e;
  return { x: (src.clientX - r.left) * (cv.width / r.width),
           y: (src.clientY - r.top)  * (cv.height / r.height) };
}

function bindDesenho(cv, getCtx) {
  function ini(e) {
    e.preventDefault();
    const c = getCtx(); if (!c) return;
    desenhando = true;
    const p = getPosMouse(e, cv); ultX = p.x; ultY = p.y;
    c.beginPath(); c.arc(p.x, p.y, espAtual / 2, 0, Math.PI * 2);
    c.fillStyle = corAtual; c.fill();
    /* Esconde o placeholder de dica */
    cv.closest('.modal-canvas-wrap').querySelector('.modal-canvas-dica').style.opacity = '0';
  }
  function mov(e) {
    if (!desenhando) return; e.preventDefault();
    const c = getCtx(); if (!c) return;
    const p = getPosMouse(e, cv);
    c.beginPath(); c.moveTo(ultX, ultY); c.lineTo(p.x, p.y);
    c.strokeStyle = corAtual; c.lineWidth = espAtual;
    c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke();
    ultX = p.x; ultY = p.y;
  }
  function fim() { desenhando = false; }
  cv.addEventListener('mousedown',  ini);
  cv.addEventListener('mousemove',  mov);
  cv.addEventListener('mouseup',    fim);
  cv.addEventListener('mouseleave', fim);
  cv.addEventListener('touchstart', ini, { passive: false });
  cv.addEventListener('touchmove',  mov, { passive: false });
  cv.addEventListener('touchend',   fim);
}

bindDesenho(canvasPonte,  () => ctxPonte);
bindDesenho(canvasAbrigo, () => ctxAbrigo);

/* Cores e espessuras — modal ponte */
modalPonte.querySelectorAll('.modal-cor').forEach(btn => {
  btn.addEventListener('click', function() {
    modalPonte.querySelectorAll('.modal-cor').forEach(b => b.classList.remove('ativo'));
    this.classList.add('ativo'); corAtual = this.dataset.cor;
  });
});
modalPonte.querySelectorAll('.modal-esp').forEach(btn => {
  btn.addEventListener('click', function() {
    modalPonte.querySelectorAll('.modal-esp').forEach(b => b.classList.remove('ativo'));
    this.classList.add('ativo'); espAtual = parseInt(this.dataset.esp);
  });
});

/* Cores e espessuras — modal abrigo */
modalAbrigo.querySelectorAll('.modal-cor').forEach(btn => {
  btn.addEventListener('click', function() {
    modalAbrigo.querySelectorAll('.modal-cor').forEach(b => b.classList.remove('ativo'));
    this.classList.add('ativo'); corAtual = this.dataset.cor;
  });
});
modalAbrigo.querySelectorAll('.modal-esp').forEach(btn => {
  btn.addEventListener('click', function() {
    modalAbrigo.querySelectorAll('.modal-esp').forEach(b => b.classList.remove('ativo'));
    this.classList.add('ativo'); espAtual = parseInt(this.dataset.esp);
  });
});

/* Limpar */
document.getElementById('btnLimparPonte').addEventListener('click', () => {
  ctxPonte  = inicCanvasModal(canvasPonte);
  canvasPonte.closest('.modal-canvas-wrap').querySelector('.modal-canvas-dica').style.opacity = '1';
});
document.getElementById('btnLimparAbrigo').addEventListener('click', () => {
  ctxAbrigo = inicCanvasModal(canvasAbrigo);
  canvasAbrigo.closest('.modal-canvas-wrap').querySelector('.modal-canvas-dica').style.opacity = '1';
});

/* Fechar com Escape ou cancelar */
document.getElementById('btnCancelarPonte').addEventListener('click',  fecharModalPonte);
document.getElementById('btnCancelarAbrigo').addEventListener('click', fecharModalAbrigo);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (modalPonte.classList.contains('visivel'))  fecharModalPonte();
    if (modalAbrigo.classList.contains('visivel')) fecharModalAbrigo();
  }
});

function fecharModalPonte() {
  modalPonte.classList.remove('visivel');
  modalPonte.setAttribute('aria-hidden', 'true');
  estado.modalAberto = false;
  dicaBalao.classList.remove('oculto');
}
function fecharModalAbrigo() {
  modalAbrigo.classList.remove('visivel');
  modalAbrigo.setAttribute('aria-hidden', 'true');
  estado.modalAberto = false;
}

/* ── Abrir modal PONTE ── */
let gapAlvo = -1;
btnAbrirPonte.addEventListener('click', () => abrirModalPonte(gapAlvo));
document.getElementById('btnDesenharPonte').addEventListener('click', () => abrirModalPonte(gapAlvo));

function abrirModalPonte(gIdx) {
  if (gIdx < 0 || gaps[gIdx].cruzado) return;
  /* Na zona de chuva precisa de abrigo primeiro */
  if (estado.ilhaAtual >= ILHA_CHUVA && !estado.temAbrigo) {
    mostrarDica('☔ Desenhe um abrigo primeiro!', 2500);
    return;
  }
  gapAlvo = gIdx;
  estado.modalAberto = true;
  corAtual  = '#4E342E';
  espAtual  = 9;
  /* Reset toolbar */
  modalPonte.querySelectorAll('.modal-cor').forEach((b,i) => b.classList.toggle('ativo', i===0));
  modalPonte.querySelectorAll('.modal-esp').forEach((b,i) => b.classList.toggle('ativo', i===1));
  ctxPonte = inicCanvasModal(canvasPonte);
  canvasPonte.closest('.modal-canvas-wrap').querySelector('.modal-canvas-dica').style.opacity = '1';
  /* Fala variada do Pingo */
  const falas = [
    'Tem um rio na frente! 🌊<br>Desenhe uma <strong>ponte</strong> para atravessar!',
    'Mais um gap! 💪<br>Desenhe sua <strong>ponte</strong> e continue!',
    'A chuva parou! 🌈<br>Agora desenhe a <strong>ponte</strong>!',
    'Quase lá! ⭐<br>Mais uma <strong>ponte</strong> e a gente cruza!',
    'Penúltima! 🎉<br>Capricha na <strong>ponte</strong>!',
    'A última ponte! 🏁<br>Você consegue!',
  ];
  document.getElementById('falaModalPonte').innerHTML = falas[Math.min(gIdx, falas.length-1)];
  modalPonte.classList.add('visivel');
  modalPonte.setAttribute('aria-hidden', 'false');
  btnAbrirPonte.classList.remove('visivel');
  btnAbrirPonte.setAttribute('aria-hidden', 'true');
}

/* Confirmar ponte */
document.getElementById('btnConfirmarPonte').addEventListener('click', () => {
  const cobertura = calcCobertura(canvasPonte);
  fecharModalPonte();
  setTimeout(() => cruzarGap(gapAlvo, cobertura), 350);
});

/* ── Abrir modal ABRIGO ── */
document.getElementById('btnDesenharAbrigo').addEventListener('click', abrirModalAbrigo);

function abrirModalAbrigo() {
  estado.modalAberto = true;
  corAtual = '#3A3530';
  espAtual = 9;
  modalAbrigo.querySelectorAll('.modal-cor').forEach((b,i) => b.classList.toggle('ativo', i===0));
  modalAbrigo.querySelectorAll('.modal-esp').forEach((b,i) => b.classList.toggle('ativo', i===1));
  ctxAbrigo = inicCanvasModal(canvasAbrigo);
  canvasAbrigo.closest('.modal-canvas-wrap').querySelector('.modal-canvas-dica').style.opacity = '1';
  const falas = [
    'Está <strong>chovendo</strong>! ☔<br>Desenhe um <strong>guarda-chuva</strong> para me proteger!',
    'Chuva de novo! 😮<br>Que tal um guarda-chuva <strong>diferente</strong> desta vez?',
    'Mais chuva! ⚡<br>Pode ser <strong>o que você quiser</strong> — desde que proteja!',
    'Tá chovendo demais! 🌧️<br><strong>Você decide</strong> o que desenhar pra proteger!',
    'A última chuva! 🌈<br>Desenhe a melhor proteção que souber!',
  ];
  const idx = Math.max(0, Math.min(estado.ilhaAtual - ILHA_CHUVA, falas.length - 1));
  document.getElementById('falaModalAbrigo').innerHTML = falas[idx];
  modalAbrigo.classList.add('visivel');
  modalAbrigo.setAttribute('aria-hidden', 'false');
  btnAbrirAbrigo.classList.remove('visivel');
  btnAbrirAbrigo.setAttribute('aria-hidden', 'true');
}

/* Confirmar abrigo */
document.getElementById('btnConfirmarAbrigo').addEventListener('click', () => {
  if (calcCobertura(canvasAbrigo) < 0.03) {
    const btn = document.getElementById('btnConfirmarAbrigo');
    btn.style.transition = 'none';
    btn.style.transform = 'translateX(-6px)';
    setTimeout(() => { btn.style.transform = 'translateX(6px)'; }, 80);
    setTimeout(() => { btn.style.transform = '';                 }, 160);
    mostrarDica('✏️ Desenhe um pouquinho mais!', 2000);
    return;
  }
  /* Converte para bitmap transparente (branco → alfa 0) */
  canvasParaBitmap(canvasAbrigo).then(bmp => {
    fecharModalAbrigo();
    setTimeout(() => ativarAbrigo(bmp), 300);
  });
});

/* ════════════════════════════════════════════
   FUNÇÕES AUXILIARES DE CANVAS
════════════════════════════════════════════ */
function calcCobertura(cv) {
  const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
  let col = 0;
  for (let i = 0; i < d.length; i += 4)
    if (d[i] < 240 || d[i+1] < 240 || d[i+2] < 240) col++;
  return col / (cv.width * cv.height);
}

function canvasParaBitmap(cv) {
  const oc   = document.createElement('canvas');
  oc.width   = cv.width;
  oc.height  = cv.height;
  const octx = oc.getContext('2d');
  const src  = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height);
  const out  = octx.createImageData(cv.width, cv.height);
  for (let i = 0; i < src.data.length; i += 4) {
    const branco = src.data[i] > 240 && src.data[i+1] > 240 && src.data[i+2] > 240;
    out.data[i]   = src.data[i];
    out.data[i+1] = src.data[i+1];
    out.data[i+2] = src.data[i+2];
    out.data[i+3] = branco ? 0 : src.data[i+3];
  }
  octx.putImageData(out, 0, 0);
  return createImageBitmap(oc);
}

/* ════════════════════════════════════════════
   CRUZAR O GAP
════════════════════════════════════════════ */
function cruzarGap(gIdx, cobertura) {
  const gap      = gaps[gIdx];
  const proxIlha = ilhas[gIdx + 1];
  if (cobertura >= 0.04) {
    /* Salva o desenho como ponte */
    canvasParaBitmap(canvasPonte).then(bmp => { gap.ponteImg = bmp; });
    gap.cruzado = true;
    estado.ilhaAtual = gIdx + 1;
    estado.pontos   += 20;
    mostrarDica(`🌉 Ponte construída! Ilha ${estado.ilhaAtual + 1} de ${TOTAL_ILHAS}! 🏝️`, 2800);
    /* Ajusta posição para a nova ilha */
    setTimeout(() => {
      const il = ilhas[estado.ilhaAtual];
      estado.px = il.x + 30;
      estado.py = chaoIlha(estado.ilhaAtual) - SPRITE_H;
      estado.vy = 0; estado.noChao = true;
      /* Chega na última ilha → vitória */
      if (estado.ilhaAtual === TOTAL_ILHAS - 1) {
        setTimeout(mostrarVitoria, 700);
      } else if (estado.ilhaAtual >= ILHA_CHUVA) {
        encerrarChuva();
        setTimeout(iniciarChuva, 900);
      }
    }, 500);
  } else {
    /* Desenho fraco → cai na água */
    estado.quedas++;
    mostrarDica('💦 A ponte era fraca! Desenhe um pouco mais!', 2500);
    spawnSplash(gap.x + gap.w / 2, canvas.height * 0.56);
    /* Reseta na beira da ilha atual */
    setTimeout(() => {
      const il = ilhas[estado.ilhaAtual];
      estado.px = il.x + il.w - 36;
      estado.py = chaoIlha(estado.ilhaAtual) - SPRITE_H;
      estado.vy = 0; estado.noChao = true;
      mostrarDica('😊 Tente de novo! Você consegue!', 2200);
    }, 800);
  }
}

/* ════════════════════════════════════════════
   EFEITO SPLASH NA ÁGUA
════════════════════════════════════════════ */
function spawnSplash(wx, wy) {
  const sx = wx - estado.camera;
  const el = document.createElement('div');
  el.className = 'splash-agua';
  el.textContent = '💦';
  el.style.left = (sx - 18) + 'px';
  el.style.top  = (wy - 20) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
  for (let r = 0; r < 3; r++) {
    const rip = document.createElement('div');
    rip.className = 'ripple-agua';
    rip.style.left = sx + 'px';
    rip.style.top  = wy + 'px';
    rip.style.animationDelay = (r * 0.18) + 's';
    document.body.appendChild(rip);
    setTimeout(() => rip.remove(), 1100);
  }
}

/* ════════════════════════════════════════════
   FÍSICA E ATUALIZAÇÃO DO PERSONAGEM
════════════════════════════════════════════ */
function atualizarPersonagem() {
  if (estado.modalAberto || estado.vitoria) return;

  const tecs = estado.teclas;
  let movendo = false;

  if (tecs['ArrowRight'] || tecs['d']) {
    estado.vx = VELOCIDADE;
    estado.viradoDireita = true;
    movendo = true;
  } else if (tecs['ArrowLeft'] || tecs['a']) {
    estado.vx = -VELOCIDADE;
    estado.viradoDireita = false;
    movendo = true;
  } else {
    estado.vx = 0;
  }

  estado.correndo = movendo;
  estado.animTimer++;
  if (estado.animTimer >= 8) { estado.animTimer = 0; estado.animFrame = (estado.animFrame + 1) % 2; }

  /* Gravidade */
  estado.vy += GRAVIDADE;
  estado.py += estado.vy;
  estado.px += estado.vx;

  /* Colisão com ilhas */
  estado.noChao = false;
  const agua_y = canvas.height * 0.56;

  for (const ilha of ilhas) {
    const chao = agua_y - ilha.h;
    if (estado.px + SPRITE_W > ilha.x &&
        estado.px < ilha.x + ilha.w &&
        estado.py + SPRITE_H >= chao &&
        estado.py + SPRITE_H <= chao + 20 &&
        estado.vy >= 0) {
      estado.py    = chao - SPRITE_H;
      estado.vy    = 0;
      estado.noChao = true;

      /* Clampa horizontalmente dentro da ilha */
      if (estado.px < ilha.x)             estado.px = ilha.x;
      if (estado.px + SPRITE_W > ilha.x + ilha.w)
        estado.px = ilha.x + ilha.w - SPRITE_W;
    }
  }

  /* Colisão com pontes */
  for (const gap of gaps) {
    if (!gap.cruzado) continue;
    const chao = agua_y;
    if (estado.px + SPRITE_W > gap.x &&
        estado.px < gap.x + gap.w &&
        estado.py + SPRITE_H >= chao - 8 &&
        estado.py + SPRITE_H <= chao + 16 &&
        estado.vy >= 0) {
      estado.py    = chao - SPRITE_H - 8;
      estado.vy    = 0;
      estado.noChao = true;
    }
  }

  /* Caiu na água */
  if (estado.py + SPRITE_H > agua_y + 60 && !estado.noChao) {
    const il = ilhas[estado.ilhaAtual];
    estado.px = il.x + 30;
    estado.py = agua_y - il.h - SPRITE_H;
    estado.vy = 0; estado.noChao = true;
    estado.quedas++;
    mostrarDica('💦 Cuidado com o rio! 🌊', 2000);
  }

  /* Câmera */
  const alvo = Math.max(0, Math.min(estado.px - canvas.width * 0.4, MUNDO_W - canvas.width));
  estado.camera += (alvo - estado.camera) * 0.12;

  /* Detecta proximidade ao próximo gap */
  verificarProximidadePonte();
}

function verificarProximidadePonte() {
  const gIdx = estado.ilhaAtual;
  if (gIdx >= gaps.length) return;
  const gap = gaps[gIdx];
  if (gap.cruzado) return;
  const dist = (gap.x) - (estado.px + SPRITE_W);
  if (dist < TRIGGER_DIST && dist > -30) {
    if (!btnAbrirPonte.classList.contains('visivel') && !estado.modalAberto) {
      gapAlvo = gIdx;
      btnAbrirPonte.classList.add('visivel');
      btnAbrirPonte.setAttribute('aria-hidden', 'false');
    }
  } else {
    if (btnAbrirPonte.classList.contains('visivel')) {
      btnAbrirPonte.classList.remove('visivel');
      btnAbrirPonte.setAttribute('aria-hidden', 'true');
    }
  }
}

/* ════════════════════════════════════════════
   DESENHO DO CENÁRIO (canvas 2D)
════════════════════════════════════════════ */
function desenharCenario(t) {
  const cam = estado.camera;
  const W   = canvas.width;
  const H   = canvas.height;
  const agua_y = H * 0.56;

  ctx.clearRect(0, 0, W, H);

  /* Céu gradiente */
  const gradCeu = ctx.createLinearGradient(0, 0, 0, agua_y);
  if (estado.chuvaAtiva && !estado.temAbrigo) {
    gradCeu.addColorStop(0, '#3A5E7A');
    gradCeu.addColorStop(1, '#6A9AB8');
  } else {
    gradCeu.addColorStop(0, '#A8E6FF');
    gradCeu.addColorStop(1, '#D4F5FF');
  }
  ctx.fillStyle = gradCeu;
  ctx.fillRect(0, 0, W, agua_y);

  /* Nuvens claras (em scroll) */
  if (!estado.chuvaAtiva) {
    nuvens.forEach(n => {
      n.x += n.vel;
      if (n.x - cam > W + 80) n.x -= MUNDO_W + 160;
      ctx.font = n.size + 'px serif';
      ctx.globalAlpha = 0.75;
      ctx.fillText(n.emoji, n.x - cam, n.y);
      ctx.globalAlpha = 1;
    });
  }

  /* Pássaros */
  passaros.forEach(p => {
    p.x += p.vel;
    if (p.x - cam > W + 40) p.x -= MUNDO_W + 80;
    ctx.font = '20px serif';
    ctx.globalAlpha = 0.8;
    ctx.fillText('🐦', p.x - cam, p.y);
    ctx.globalAlpha = 1;
  });

  /* ── Água ── */
  const gradAgua = ctx.createLinearGradient(0, agua_y, 0, H);
  gradAgua.addColorStop(0, '#29C6D8');
  gradAgua.addColorStop(0.5, '#1AA8C0');
  gradAgua.addColorStop(1, '#0E8FA8');
  ctx.fillStyle = gradAgua;
  ctx.fillRect(0, agua_y, W, H - agua_y);

  /* Ondas */
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  for (let w = 0; w < 3; w++) {
    const offX = ((t * (0.8 + w * 0.3)) % (W + 200)) - 100;
    ctx.beginPath();
    for (let x = -20; x < W + 20; x += 8) {
      const y = agua_y + 8 + w * 10 + Math.sin((x + offX) * 0.04) * 5;
      x === -20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();

  /* Peixes */
  peixes.forEach(p => {
    p.x += 0.5 + Math.random() * 0.1;
    if (p.x - cam > W + 40) p.x -= MUNDO_W + 80;
    ctx.font = p.size + 'px serif';
    ctx.globalAlpha = 0.65;
    ctx.fillText(p.emoji, p.x - cam, agua_y + 30 + Math.sin(t * 0.03 + p.x * 0.01) * 8);
    ctx.globalAlpha = 1;
  });

  /* ── Ilhas ── */
  ilhas.forEach((ilha, idx) => {
    const ix = ilha.x - cam;
    const iy = agua_y - ilha.h;

    /* Sombra da ilha na água */
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.18)';
    ctx.shadowBlur  = 14;
    ctx.shadowOffsetY = 6;

    /* Corpo */
    const gradIlha = ctx.createLinearGradient(ix, iy, ix, agua_y);
    gradIlha.addColorStop(0, '#8FD492');
    gradIlha.addColorStop(1, '#5BA05E');
    ctx.fillStyle = gradIlha;
    ctx.beginPath();
    ctx.ellipse(ix + ilha.w / 2, iy + ilha.h * 0.6, ilha.w / 2, ilha.h * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    /* Areia na base */
    ctx.fillStyle = 'rgba(245,230,200,0.55)';
    ctx.beginPath();
    ctx.ellipse(ix + ilha.w / 2, agua_y - 6, ilha.w * 0.4, 7, 0, 0, Math.PI);
    ctx.fill();

    /* Decoração: árvores e flores */
    const deco = decorIlhas[idx];
    deco.arvores.forEach(arv => {
      const ax = ix + ilha.w * arv.relX;
      const ay = iy - 10;
      ctx.save();
      ctx.translate(ax, ay);
      ctx.rotate(Math.sin(t * 0.02 + idx) * 0.06);
      ctx.font = '32px serif';
      ctx.textAlign = 'center';
      ctx.fillText(arv.emoji, 0, 0);
      ctx.restore();
    });
    deco.flores.forEach(fl => {
      const fx = ix + ilha.w * fl.relX;
      const fy = iy + ilha.h * 0.3 + Math.sin(t * 0.04 + fl.off) * 3;
      ctx.font = '16px serif';
      ctx.textAlign = 'center';
      ctx.fillText(fl.emoji, fx, fy);
    });

    /* Flag na última ilha */
    if (idx === TOTAL_ILHAS - 1) {
      ctx.font = '36px serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏁', ix + ilha.w / 2, iy - 42 + Math.sin(t * 0.04) * 4);
    }

    /* Número da ilha */
    ctx.font = '900 13px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(26,90,60,0.55)';
    ctx.fillText(`${idx + 1}`, ix + ilha.w / 2, iy + ilha.h * 0.7);
  });

  /* ── Pontes construídas ── */
  gaps.forEach(gap => {
    if (!gap.ponteImg) return;
    const gx = gap.x - cam;
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.drawImage(gap.ponteImg, gx, agua_y - 18, gap.w, 24);
    ctx.restore();
    /* Borda de reforço */
    ctx.strokeStyle = 'rgba(100,60,20,0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(gx, agua_y - 18, gap.w, 24);
  });

  /* ── Pranchetas nos gaps (quando não cruzados) ── */
  gaps.forEach((gap, gIdx) => {
    if (gap.cruzado) return;
    const gx   = gap.x - cam + gap.w / 2;
    const gy   = agua_y - 54;
    const bloq = estado.ilhaAtual >= ILHA_CHUVA && !estado.temAbrigo && gIdx === estado.ilhaAtual;
    ctx.save();
    ctx.globalAlpha = bloq ? 0.35 : 1;
    /* Pulsação */
    const scale = 1 + Math.sin(t * 0.06) * 0.04;
    ctx.translate(gx, gy);
    ctx.scale(scale, scale);
    ctx.font = '28px serif';
    ctx.textAlign = 'center';
    ctx.fillText('📋', 0, 0);
    ctx.font = '900 10px Nunito, sans-serif';
    ctx.fillStyle = bloq ? '#aaa' : '#8B6914';
    ctx.fillText('PONTE', 0, 16);
    ctx.restore();
  });

  ctx.textAlign = 'left';
}

/* ════════════════════════════════════════════
   DESENHO DO PERSONAGEM
════════════════════════════════════════════ */
function desenharPersonagem(t) {
  const sx = estado.px - estado.camera;
  const sy = estado.py;

  ctx.save();
  ctx.translate(sx + SPRITE_W / 2, sy + SPRITE_H / 2);
  if (!estado.viradoDireita) ctx.scale(-1, 1);

  if (estado.personagemImg) {
    /* Sprite do personagem desenhado pela criança */
    const bmp  = estado.personagemImg;
    const ratio = Math.min((SPRITE_W - 4) / bmp.width, (SPRITE_H - 4) / bmp.height);
    const dw   = bmp.width  * ratio;
    const dh   = bmp.height * ratio;
    if (estado.correndo && estado.noChao) {
      /* Leve balanço ao correr */
      ctx.rotate(Math.sin(t * 0.35) * 0.08);
    }
    ctx.drawImage(bmp, -dw / 2, -dh / 2, dw, dh);
  } else {
    /* Fallback: Pingo */
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.fillStyle = '#FF8C6B';
    ctx.fill();
    ctx.strokeStyle = '#E07050'; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.arc(-8,  -4, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc( 8,  -4, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-8, 8); ctx.quadraticCurveTo(0, 15, 8, 8);
    ctx.strokeStyle = '#333'; ctx.lineWidth = 2; ctx.stroke();
  }

  ctx.restore();

  /* Abrigo flutuando sobre o personagem */
  if (estado.abrigoImg && estado.temAbrigo) {
    const aw = 72, ah = 54;
    const ax = sx + SPRITE_W / 2 - aw / 2;
    const ay = sy - ah - 6 + Math.sin(t * 0.04) * 3;
    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.drawImage(estado.abrigoImg, ax, ay, aw, ah);
    ctx.restore();
  }
}

/* ════════════════════════════════════════════
   HUD NO CANVAS (barra de progresso)
════════════════════════════════════════════ */
function desenharHUD() {
  /* Indicadores de ilha — pontos coloridos no centro superior */
  const total = TOTAL_ILHAS;
  const dotW  = 20, gap = 8;
  const totalW = total * dotW + (total - 1) * gap;
  const startX = (canvas.width - totalW) / 2;
  const y = 54;
  for (let i = 0; i < total; i++) {
    const x = startX + i * (dotW + gap) + dotW / 2;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    if (i < estado.ilhaAtual) {
      ctx.fillStyle = '#69F0AE';
    } else if (i === estado.ilhaAtual) {
      ctx.fillStyle = '#FFD54F';
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
    }
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

/* ════════════════════════════════════════════
   VITÓRIA
════════════════════════════════════════════ */
function mostrarVitoria() {
  estado.vitoria = true;
  const tv = document.getElementById('telaVitoria');
  const vp = document.getElementById('vitoriaPontos');
  const vm = document.getElementById('vitoriaMensagem');
  const estrelas = estado.quedas === 0 ? 3 : estado.quedas <= 2 ? 2 : 1;
  const msgs = [
    'Você atravessou o rio! 🌊',
    'Parabéns! Muito bem! 🏝️',
    'INCRÍVEL! Sem cair uma vez! 🏅',
  ];
  vp.textContent = '⭐ ' + estado.pontos + ' pontos';
  vm.textContent = msgs[estrelas - 1];
  tv.classList.add('visivel');
  for (let i = 1; i <= 3; i++) {
    const el = document.getElementById('estrelaV' + i);
    if (i <= estrelas) { setTimeout(() => el.classList.add('acesa'), i * 350); }
    else { el.style.filter = 'grayscale(1) opacity(.25)'; el.style.opacity = '.3'; }
  }
  lancarConfete();
}

function lancarConfete() {
  const cores = ['#FF7043','#FFD54F','#69F0AE','#29C6D8','#CE93D8','#FF80AB'];
  for (let i = 0; i < 80; i++) {
    const el = document.createElement('div');
    el.className = 'confete-item';
    el.style.left       = Math.random() * 100 + 'vw';
    el.style.background = cores[Math.floor(Math.random() * cores.length)];
    el.style.animationDuration = (1.8 + Math.random() * 2) + 's';
    el.style.animationDelay    = (Math.random() * 1.2) + 's';
    el.style.width  = (6 + Math.random() * 8) + 'px';
    el.style.height = (10 + Math.random() * 10) + 'px';
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 5000);
  }
}

/* ════════════════════════════════════════════
   LOOP PRINCIPAL
════════════════════════════════════════════ */
let tick = 0;
let pausado = false;
function loop() {
  if (pausado) return;
  tick++;
  atualizarPersonagem();
  desenharCenario(tick);
  desenharPersonagem(tick);
  desenharHUD();
  requestAnimationFrame(loop);
}

/* ════════════════════════════════════════════
   PAUSE
════════════════════════════════════════════ */
const btnPause     = document.getElementById('btnPause');
const menuPause    = document.getElementById('menuPause');
const btnContinuar = document.getElementById('btnContinuar');
const volumeJogo   = document.getElementById('volumeJogo');

function abrirPause() {
  if (estado.vitoria || estado.modalAberto) return;
  pausado = true;
  menuPause.classList.add('visivel');
}

function fecharPause() {
  pausado = false;
  menuPause.classList.remove('visivel');
  requestAnimationFrame(loop);
}

btnPause.addEventListener('click', () => {
  if (pausado) fecharPause();
  else abrirPause();
});

btnContinuar.addEventListener('click', fecharPause);

document.addEventListener('keydown', e => {
  if (e.code === 'Escape') {
    if (estado.modalAberto) return;
    if (pausado) fecharPause();
    else abrirPause();
  }
});

volumeJogo.addEventListener('input', () => {
  const volume = volumeJogo.value / 100;
  localStorage.setItem('volume_jogo', volume);
});

const volumeSalvo = localStorage.getItem('volume_jogo');
if (volumeSalvo !== null) volumeJogo.value = volumeSalvo * 100;

/* ════════════════════════════════════════════
   INICIAR JOGO
════════════════════════════════════════════ */
function iniciarJogo() {
  setPosInicial();
  telaCarregando.classList.add('saindo');
  setTimeout(() => { telaCarregando.style.display = 'none'; }, 700);
  setTimeout(() => mostrarDica('🖊️ Clique em 📋 ou no botão para desenhar sua ponte!', 4500), 1200);
  loop();
}

carregarPersonagem();
