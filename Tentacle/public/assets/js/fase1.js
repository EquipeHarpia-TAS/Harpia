/* =============================================
   DESENHA MUNDO — FASE 1
   Arquivo: fase1.js
   Personagem anda horizontalmente num cenário
   com paralaxe. Sprite = desenho do JSON.
============================================= */

const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

/* ── REDIMENSIONAR ── */
function redimensionar() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
redimensionar();
window.addEventListener('resize', () => { redimensionar(); });

/* ── ESTADO DO JOGO ── */
const estado = {
  personagemImg: null,   /* ImageBitmap do desenho */
  px: 0,                 /* posição X do personagem (mundo) */
  py: 0,                 /* posição Y (chão) */
  vx: 0,                 /* velocidade X */
  vy: 0,                 /* velocidade Y */
  noChao: true,
  viradoDireita: true,
  animFrame: 0,
  animTimer: 0,
  camera: 0,             /* offset da câmera */
  teclas: {},
  correndo: false,
  mundoLargura: 4000,
};

/* ── PERSONAGEM SPRITE ── */
const SPRITE_W   = 72;
const SPRITE_H   = 72;
const VELOCIDADE = 3.2;
const GRAVIDADE  = 0.55;
const PULO       = -12;

/* ── CARREGAMENTO DO JSON ── */
const telaCarregando     = document.getElementById('telaCarregando');
const loadBarra          = document.getElementById('loadBarra');
const avisoSemPersonagem = document.getElementById('avisoSemPersonagem');

function simularBarra(cb) {
  let p = 0;
  const iv = setInterval(() => {
    p += Math.random() * 18 + 8;
    if (p >= 100) { p = 100; clearInterval(iv); setTimeout(cb, 300); }
    loadBarra.style.width = p + '%';
  }, 120);
}

function carregarPersonagem() {
  /* Tenta localStorage primeiro */
  let dadosStr = localStorage.getItem('personagem_desenho');

  if (!dadosStr) {
    /* Tenta carregar o JSON do mesmo diretório via fetch */
    fetch('personagem_desenho.json')
      .then(r => { if (!r.ok) throw new Error('não encontrado'); return r.json(); })
      .then(dados => processarDados(dados))
      .catch(() => mostrarAviso());
    return;
  }

  try {
    const dados = JSON.parse(dadosStr);
    processarDados(dados);
  } catch (e) {
    mostrarAviso();
  }
}

function processarDados(dados) {
  /* Renderiza os traços num canvas offscreen SEM fundo (transparente) */
  const oc  = document.createElement('canvas');
  oc.width  = dados.canvas.largura;
  oc.height = dados.canvas.altura;
  const octx = oc.getContext('2d');
  octx.lineCap  = 'round';
  octx.lineJoin = 'round';

  dados.tracos.forEach(traco => {
    if (!traco.pontos || traco.pontos.length < 2) return;
    octx.beginPath();
    octx.strokeStyle = traco.cor;
    octx.lineWidth   = traco.espessura;
    octx.moveTo(traco.pontos[0].x, traco.pontos[0].y);
    for (let i = 1; i < traco.pontos.length; i++) {
      octx.lineTo(traco.pontos[i].x, traco.pontos[i].y);
    }
    octx.stroke();
  });

  createImageBitmap(oc).then(bmp => {
    estado.personagemImg = bmp;
    simularBarra(() => iniciarJogo());
  });
}

function mostrarAviso() {
  telaCarregando.style.display = 'none';
  avisoSemPersonagem.classList.add('visivel');
}

/* ── CENÁRIO ── */
const nuvens = [];
for (let i = 0; i < 14; i++) {
  nuvens.push({
    x:     Math.random() * 4000,
    y:     30 + Math.random() * 140,
    r:     28 + Math.random() * 40,
    alpha: 0.5 + Math.random() * 0.4,
    vel:   0.15 + Math.random() * 0.2,
  });
}

const estrelas = [];
for (let i = 0; i < 30; i++) {
  estrelas.push({
    x:    Math.random() * 4000,
    y:    20 + Math.random() * 120,
    r:    1 + Math.random() * 2,
    fase: Math.random() * Math.PI * 2,
  });
}

const flores = [];
for (let i = 0; i < 40; i++) {
  flores.push({
    x:    120 + i * 90 + Math.random() * 40,
    tipo: Math.floor(Math.random() * 3),
  });
}

const arvores = [];
for (let i = 0; i < 18; i++) {
  arvores.push({
    x: 180 + i * 210 + Math.random() * 80,
    h: 60  + Math.random() * 50,
    r: 28  + Math.random() * 18,
  });
}

/* ── PLATAFORMAS ── */
/* ── X posição horizontal, Y altura, W largura ── */

const CHAO_Y = () => canvas.height - 110;

const plataformas = [
  { x: 460,  y: () => CHAO_Y() - 90,  w: 140 },
  { x: 700,  y: () => CHAO_Y() - 140, w: 160 },
  { x: 920, y: () => CHAO_Y() - 85,  w: 130 },
  { x: 900, y: () => CHAO_Y() - 190,  w: 130 },
  { x: 1140, y: () => CHAO_Y() - 135,  w: 130 },
  { x: 1100, y: () => CHAO_Y() - 255,  w: 130 },
  { x: 1350, y: () => CHAO_Y() - 160, w: 180 },
  { x: 1560, y: () => CHAO_Y() - 220, w: 130 },
  { x: 1700, y: () => CHAO_Y() - 110, w: 150 },
  { x: 1900, y: () => CHAO_Y() - 180, w: 110 },
  { x: 2100, y: () => CHAO_Y() - 90,  w: 180 },
  { x: 2390, y: () => CHAO_Y() - 150, w: 160 },
  { x: 2650, y: () => CHAO_Y() - 200, w: 140 },
  { x: 2830, y: () => CHAO_Y() - 120, w: 150 },
  { x: 3100, y: () => CHAO_Y() - 90,  w: 170 },
  { x: 3290, y: () => CHAO_Y() - 165, w: 110 },
  { x: 3450, y: () => CHAO_Y() - 110, w: 160 },
];

/* Moedas */
const moedas = [];
plataformas.forEach(p => {
  moedas.push({ x: p.x + p.w / 2, y: () => p.y() - 30, coletada: false });
});
for (let i = 0; i < 20; i++) {
  moedas.push({ x: 300 + i * 170, y: () => CHAO_Y() - 50, coletada: false });
}
let pontos = 0;

/* Meta */
const META_X = 3750;

/* ── INICIAR JOGO ── */
function iniciarJogo() {
  estado.px = 80;
  estado.py = CHAO_Y() - SPRITE_H;

  telaCarregando.classList.add('saindo');
  setTimeout(() => { telaCarregando.style.display = 'none'; }, 700);

  /* Dica some após 4s */
  setTimeout(() => {
    document.getElementById('dicaBalao').classList.add('oculto');
  }, 4000);

  loop();
}

/* ── INPUT ── */
document.addEventListener('keydown', e => { estado.teclas[e.code] = true; });
document.addEventListener('keyup',   e => { estado.teclas[e.code] = false; });

const btnE = document.getElementById('btnEsquerda');
const btnD = document.getElementById('btnDireita');

function pressionarBtn(btn, code, ativo) {
  btn.classList.toggle('pressionado', ativo);
  estado.teclas[code] = ativo;
}

btnE.addEventListener('pointerdown',  () => pressionarBtn(btnE, 'ArrowLeft',  true));
btnE.addEventListener('pointerup',    () => pressionarBtn(btnE, 'ArrowLeft',  false));
btnE.addEventListener('pointerleave', () => pressionarBtn(btnE, 'ArrowLeft',  false));

btnD.addEventListener('pointerdown',  () => pressionarBtn(btnD, 'ArrowRight', true));
btnD.addEventListener('pointerup',    () => pressionarBtn(btnD, 'ArrowRight', false));
btnD.addEventListener('pointerleave', () => pressionarBtn(btnD, 'ArrowRight', false));

/* ── FÍSICA ── */
function atualizarFisica() {
  const esq  = estado.teclas['ArrowLeft']  || estado.teclas['KeyA'];
  const dir  = estado.teclas['ArrowRight'] || estado.teclas['KeyD'];
  const pulo = estado.teclas['ArrowUp']    || estado.teclas['KeyW'] || estado.teclas['Space'];

  if (dir)       { estado.vx = VELOCIDADE;  estado.viradoDireita = true;  estado.correndo = true;  }
  else if (esq)  { estado.vx = -VELOCIDADE; estado.viradoDireita = false; estado.correndo = true;  }
  else           { estado.vx *= 0.82; estado.correndo = false; }

  if (pulo && estado.noChao) {
    estado.vy     = PULO;
    estado.noChao = false;
  }

  estado.vy += GRAVIDADE;
  estado.px += estado.vx;
  estado.py += estado.vy;

  /* Limites do mundo */
  if (estado.px < 0) { estado.px = 0; estado.vx = 0; }
  if (estado.px > estado.mundoLargura - SPRITE_W) { estado.px = estado.mundoLargura - SPRITE_W; estado.vx = 0; }

  /* Colisão com chão */
  const chaoY = CHAO_Y();
  if (estado.py >= chaoY - SPRITE_H) {
    estado.py     = chaoY - SPRITE_H;
    estado.vy     = 0;
    estado.noChao = true;
  }

  /* Colisão com plataformas */
  plataformas.forEach(p => {
    const py = p.y();
    if (
      estado.px + SPRITE_W > p.x &&
      estado.px < p.x + p.w &&
      estado.py + SPRITE_H >= py &&
      estado.py + SPRITE_H <= py + 20 &&
      estado.vy >= 0
    ) {
      estado.py     = py - SPRITE_H;
      estado.vy     = 0;
      estado.noChao = true;
    }
  });

  /* Coleta de moedas */
  moedas.forEach(m => {
    if (m.coletada) return;
    const my = m.y();
    if (
      Math.abs(estado.px + SPRITE_W / 2 - m.x) < 30 &&
      Math.abs(estado.py + SPRITE_H / 2 - my)  < 30
    ) {
      m.coletada = true;
      pontos += 10;
    }
  });

  /* Câmera suave */
  const alvo = estado.px - canvas.width / 3;
  estado.camera += (alvo - estado.camera) * 0.1;
  if (estado.camera < 0) estado.camera = 0;
  if (estado.camera > estado.mundoLargura - canvas.width) estado.camera = estado.mundoLargura - canvas.width;

  /* Animação do personagem */
  if (estado.correndo && estado.noChao) {
    estado.animTimer++;
    if (estado.animTimer > 8) { estado.animFrame = (estado.animFrame + 1) % 4; estado.animTimer = 0; }
  } else if (!estado.correndo) {
    estado.animFrame = 0;
  }

  verificarMeta();
}

/* ── RENDERIZAR ── */
let tempo = 0;

function desenharCeu() {
  const w = canvas.width, h = canvas.height;
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0,   '#AADDF5');
  grad.addColorStop(0.5, '#D4EFF8');
  grad.addColorStop(1,   '#EAF7F3');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function desenharEstrelinhas() {
  tempo += 0.02;
  estrelas.forEach(e => {
    const sx = e.x - estado.camera * 0.05;
    if (sx < -10 || sx > canvas.width + 10) return;
    const alpha = 0.4 + 0.5 * Math.sin(tempo * 2 + e.fase);
    ctx.beginPath();
    ctx.arc(sx, e.y, e.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(249,215,118,${alpha})`;
    ctx.fill();
  });
}

function desenharNuvens() {
  nuvens.forEach(n => {
    const nx = n.x - estado.camera * 0.25;
    if (nx < -120 || nx > canvas.width + 120) return;
    ctx.save();
    ctx.globalAlpha = n.alpha * 0.75;
    ctx.fillStyle   = '#fff';
    ctx.beginPath();
    ctx.arc(nx,              n.y,             n.r,        0, Math.PI * 2);
    ctx.arc(nx + n.r * 0.8,  n.y - n.r * 0.3, n.r * 0.7,  0, Math.PI * 2);
    ctx.arc(nx - n.r * 0.7,  n.y - n.r * 0.2, n.r * 0.6,  0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function desenharColinas() {
  const off = estado.camera * 0.4;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height);
  for (let x = 0; x <= canvas.width + 40; x += 20) {
    const wx = x + off;
    const y  = canvas.height - 140 + Math.sin(wx * 0.003) * 60 + Math.sin(wx * 0.007) * 30;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(canvas.width, canvas.height);
  ctx.closePath();
  ctx.fillStyle = '#C8EDE3';
  ctx.fill();

  const off2 = estado.camera * 0.6;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height);
  for (let x = 0; x <= canvas.width + 40; x += 20) {
    const wx = x + off2;
    const y  = canvas.height - 85 + Math.sin(wx * 0.004 + 1) * 40 + Math.sin(wx * 0.009) * 20;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(canvas.width, canvas.height);
  ctx.closePath();
  ctx.fillStyle = '#A8DDD0';
  ctx.fill();
}

function desenharChao() {
  const chaoY = CHAO_Y();
  const grad  = ctx.createLinearGradient(0, chaoY, 0, canvas.height);
  grad.addColorStop(0,    '#6CC67A');
  grad.addColorStop(0.15, '#5BB86A');
  grad.addColorStop(1,    '#3A9A50');
  ctx.fillStyle = grad;
  ctx.fillRect(0, chaoY, canvas.width, canvas.height - chaoY);

  ctx.fillStyle = '#7ED47A';
  ctx.fillRect(0, chaoY, canvas.width, 6);

  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  ctx.fillRect(0, chaoY + 6, canvas.width, 10);
}

function desenharArvores() {
  arvores.forEach(a => {
    const ax   = a.x - estado.camera;
    const base = CHAO_Y();
    if (ax < -80 || ax > canvas.width + 80) return;

    ctx.fillStyle = '#8B6344';
    ctx.fillRect(ax - 5, base - a.h, 10, a.h);

    ctx.beginPath();
    ctx.arc(ax, base - a.h - a.r * 0.5, a.r, 0, Math.PI * 2);
    ctx.fillStyle = '#4AB86A';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(ax - a.r * 0.5, base - a.h - a.r * 0.2, a.r * 0.7, 0, Math.PI * 2);
    ctx.fillStyle = '#5CC87A';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(ax + a.r * 0.4, base - a.h - a.r * 0.3, a.r * 0.65, 0, Math.PI * 2);
    ctx.fillStyle = '#3AA858';
    ctx.fill();
  });
}

function desenharFlores() {
  flores.forEach(f => {
    const fx = f.x - estado.camera;
    const fy = CHAO_Y();
    if (fx < -20 || fx > canvas.width + 20) return;

    const cores = ['#FF8C6B', '#F9D776', '#FF6B9D'];
    ctx.fillStyle = cores[f.tipo];
    ctx.beginPath();
    ctx.arc(fx, fy - 4, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F0EE80';
    ctx.beginPath();
    ctx.arc(fx, fy - 4, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#5BB86A';
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(fx, fy - 4 + 5);
    ctx.lineTo(fx, fy);
    ctx.stroke();
  });
}

function desenharPlataformas() {
  plataformas.forEach(p => {
    const px = p.x - estado.camera;
    const py = p.y();
    if (px > canvas.width + 20 || px + p.w < -20) return;

    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath();
    ctx.roundRect(px + 4, py + 6, p.w, 22, 8);
    ctx.fill();

    const g = ctx.createLinearGradient(0, py, 0, py + 22);
    g.addColorStop(0, '#8B6344');
    g.addColorStop(1, '#6B4324');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(px, py, p.w, 22, 8);
    ctx.fill();

    ctx.fillStyle = '#6CC67A';
    ctx.beginPath();
    ctx.roundRect(px, py, p.w, 10, [8, 8, 0, 0]);
    ctx.fill();
  });
}

function desenharMoedas() {
  moedas.forEach(m => {
    if (m.coletada) return;
    const mx = m.x - estado.camera;
    if (mx < -20 || mx > canvas.width + 20) return;
    const my = m.y() + Math.sin(tempo * 3 + m.x * 0.01) * 4;

    ctx.save();
    ctx.beginPath();
    ctx.arc(mx, my, 10, 0, Math.PI * 2);
    ctx.fillStyle   = '#F9D776';
    ctx.fill();
    ctx.strokeStyle = '#E8C040';
    ctx.lineWidth   = 2;
    ctx.stroke();

    ctx.fillStyle      = '#E8A820';
    ctx.font           = "bold 10px 'Nunito', sans-serif";
    ctx.textAlign      = 'center';
    ctx.textBaseline   = 'middle';
    ctx.fillText('★', mx, my);
    ctx.restore();
  });
}

function desenharMeta() {
  const mx   = META_X - estado.camera;
  const base = CHAO_Y();
  if (mx < -60 || mx > canvas.width + 60) return;

  ctx.strokeStyle = '#8B6344';
  ctx.lineWidth   = 4;
  ctx.beginPath();
  ctx.moveTo(mx, base);
  ctx.lineTo(mx, base - 90);
  ctx.stroke();

  ctx.fillStyle = '#FF8C6B';
  ctx.beginPath();
  ctx.moveTo(mx,       base - 90);
  ctx.lineTo(mx + 40,  base - 75);
  ctx.lineTo(mx,       base - 60);
  ctx.closePath();
  ctx.fill();

  ctx.save();
  ctx.font           = "bold 13px 'Nunito', sans-serif";
  ctx.fillStyle      = '#fff';
  ctx.textAlign      = 'center';
  ctx.textBaseline   = 'middle';
  ctx.fillText('🏁', mx + 14, base - 75);
  ctx.restore();
}

function desenharPersonagem() {
  const px = Math.round(estado.px - estado.camera);
  const py = Math.round(estado.py);

  ctx.save();

  /* Sombra no chão */
  ctx.beginPath();
  ctx.ellipse(px + SPRITE_W / 2, CHAO_Y() + 4, SPRITE_W / 2 * 0.7, 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fill();

  /* Flip horizontal se virado para esquerda */
  if (!estado.viradoDireita) {
    ctx.translate(px + SPRITE_W, 0);
    ctx.scale(-1, 1);
    ctx.translate(-px, 0);
  }

  let balanco = 0;
  if (estado.correndo && estado.noChao) {
    balanco = Math.sin(estado.animFrame * Math.PI / 2) * 2;
  }

  let scaleY = 1;
  if (!estado.noChao) {
    scaleY = estado.vy < 0 ? 1.15 : 0.9;
  }

  ctx.translate(px + SPRITE_W / 2, py + SPRITE_H / 2);
  ctx.rotate(balanco * 0.04);
  ctx.scale(1, scaleY);
  ctx.translate(-(px + SPRITE_W / 2), -(py + SPRITE_H / 2));

  if (estado.personagemImg) {
    ctx.shadowColor = 'rgba(255,255,255,0.9)';
    ctx.shadowBlur  = 6;
    ctx.drawImage(estado.personagemImg, px, py, SPRITE_W, SPRITE_H);
    ctx.shadowBlur  = 0;
    ctx.drawImage(estado.personagemImg, px, py, SPRITE_W, SPRITE_H);
  } else {
    ctx.beginPath();
    ctx.arc(px + SPRITE_W / 2, py + SPRITE_H / 2, SPRITE_W / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#FF8C6B';
    ctx.fill();
  }

  ctx.restore();
}

function desenharPontuacao() {
  ctx.save();
  ctx.font           = "bold 18px 'Nunito', sans-serif";
  ctx.fillStyle      = '#3A3530';
  ctx.textAlign      = 'right';
  ctx.textBaseline   = 'top';
  ctx.fillText('⭐ ' + pontos, canvas.width - 14, 54);
  ctx.restore();
}

/* ── LOOP ── */
let rodando = true;

function loop() {
  if (!rodando) return;
  atualizarFisica();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  desenharCeu();
  desenharEstrelinhas();
  desenharNuvens();
  desenharColinas();
  desenharArvores();
  desenharFlores();
  desenharChao();
  desenharPlataformas();
  desenharMoedas();
  desenharMeta();
  desenharPersonagem();
  desenharPontuacao();

  requestAnimationFrame(loop);
}

/* ── VITÓRIA ── */
let jogo_concluido = false;

function verificarMeta() {
  if (jogo_concluido) return;
  const centroX = estado.px + SPRITE_W / 2;
  if (centroX >= META_X - 20 && centroX <= META_X + 60) {
    jogo_concluido = true;
    rodando        = false;
    mostrarVitoria();
  }
}

function mostrarVitoria() {
  const telaVitoria    = document.getElementById('telaVitoria');
  const vitoriaPontos  = document.getElementById('vitoriaPontos');
  const vitoriaMensagem = document.getElementById('vitoriaMensagem');

  const totalMoedas = moedas.length;
  const coletadas   = moedas.filter(m => m.coletada).length;
  const pct         = coletadas / totalMoedas;

  const numEstrelas = pct >= 1 ? 3 : pct >= 0.5 ? 2 : 1;

  const mensagens = [
    'Você conseguiu chegar! Continue praticando! 💪',
    'Muito bem! Ainda tem moedas te esperando! 🌟',
    'INCRÍVEL! Você coletou TUDO! Campeão absoluto! 🏅',
  ];

  vitoriaPontos.textContent   = '⭐ ' + pontos + ' pontos';
  vitoriaMensagem.textContent = mensagens[numEstrelas - 1];

  telaVitoria.classList.add('visivel');

  for (let i = 1; i <= 3; i++) {
    const el = document.getElementById('estrelaV' + i);
    if (i <= numEstrelas) {
      setTimeout(() => el.classList.add('acesa'), i * 350);
    } else {
      el.style.filter  = 'grayscale(1) opacity(0.25)';
      el.style.opacity = '0.3';
      setTimeout(() => { el.style.opacity = '0.3'; el.style.transform = 'scale(1)'; }, i * 350);
    }
  }

  setTimeout(() => lancarConfete(), 400);
}

function lancarConfete() {
  const cores = ['#FF8C6B', '#F9D776', '#5BB8A0', '#A87BE0', '#5B8FF9', '#FF6B9D'];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div');
    el.className           = 'confete-item';
    el.style.left          = Math.random() * 100 + 'vw';
    el.style.background    = cores[Math.floor(Math.random() * cores.length)];
    el.style.animationDuration = (1.8 + Math.random() * 2) + 's';
    el.style.animationDelay    = (Math.random() * 1.2) + 's';
    el.style.width         = (6 + Math.random() * 8)  + 'px';
    el.style.height        = (10 + Math.random() * 10) + 'px';
    el.style.borderRadius  = Math.random() > 0.5 ? '50%' : '2px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 5000);
  }
}

/* ── INICIAR ── */
carregarPersonagem();
