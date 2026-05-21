/*
  =============================================
  DESENHA MUNDO — Sprint 2
  Arquivo: script.js
  =============================================
*/

/* =============================================
   1. REFERÊNCIAS AOS ELEMENTOS DO DOM
============================================= */
const telaInicio   = document.getElementById('tela-inicio');
const telaJornada  = document.getElementById('tela-jornada');
const telaDesenho  = document.getElementById('tela-desenho');
const botao        = document.getElementById('btnComecar');
const btnMudo      = document.getElementById('btnMudo');
const btnSalvar    = document.getElementById('btnSalvar');
const feedbackSalvo = document.getElementById('feedbackSalvo');
const canvasDica   = document.getElementById('canvasDica');

/* =============================================
   2. CONFIGURAÇÃO DO WEB AUDIO API
============================================= */
let audioCtx      = null;
let gainMestre    = null;
let estaNoMudo    = false;
let audioIniciado = false;
let intervaloMusica = null;
let compassoAtual   = 0;

function criarContexto() {
  if (audioIniciado) return;
  audioIniciado = true;
  audioCtx   = new (window.AudioContext || window.webkitAudioContext)();
  gainMestre = audioCtx.createGain();
  gainMestre.gain.value = 0.7;
  gainMestre.connect(audioCtx.destination);
}

function tocarNota(frequencia, inicio, duracao, tipo = 'sine', volume = 0.3, envoltoria = {}) {
  if (!audioCtx) return;
  const agora    = audioCtx.currentTime;
  const ataque   = envoltoria.ataque      || 0.02;
  const sustento = envoltoria.sustentacao || duracao * 0.6;
  const release  = envoltoria.release     || 0.15;
  const osc  = audioCtx.createOscillator();
  osc.type            = tipo;
  osc.frequency.value = frequencia;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0, agora + inicio);
  gain.gain.linearRampToValueAtTime(volume, agora + inicio + ataque);
  gain.gain.setValueAtTime(volume, agora + inicio + sustento);
  gain.gain.linearRampToValueAtTime(0, agora + inicio + duracao + release);
  osc.connect(gain);
  gain.connect(gainMestre);
  osc.start(agora + inicio);
  osc.stop(agora + inicio + duracao + release + 0.05);
}

const MELODIA    = [261.63, 293.66, 329.63, 392.00, 349.23, 329.63, 293.66, 261.63];
const BAIXO      = [130.81, 146.83, 164.81, 196.00];
const TEMPO_NOTA = 0.55;

function tocarCompassoMusica() {
  if (!audioCtx || estaNoMudo) return;
  const notaMelodia = MELODIA[compassoAtual % MELODIA.length];
  const notaBaixo   = BAIXO[Math.floor(compassoAtual / 2) % BAIXO.length];
  tocarNota(notaMelodia, 0, TEMPO_NOTA * 0.8, 'triangle', 0.18, { ataque: 0.03, sustentacao: TEMPO_NOTA * 0.5, release: 0.12 });
  if (compassoAtual % 2 === 0) {
    tocarNota(notaBaixo, 0, TEMPO_NOTA * 1.5, 'sine', 0.10, { ataque: 0.05, sustentacao: TEMPO_NOTA, release: 0.2 });
  }
  compassoAtual++;
}

function iniciarMusicaDeFundo() {
  if (intervaloMusica) return;
  tocarCompassoMusica();
  intervaloMusica = setInterval(tocarCompassoMusica, TEMPO_NOTA * 1000);
}

function pararMusicaDeFundo() {
  if (intervaloMusica) { clearInterval(intervaloMusica); intervaloMusica = null; }
}

function tocarSomHover() {
  if (!audioCtx || estaNoMudo) return;
  tocarNota(523.25, 0,    0.18, 'sine', 0.10, { ataque: 0.01, release: 0.10 });
  tocarNota(659.25, 0.02, 0.16, 'sine', 0.08, { ataque: 0.01, release: 0.10 });
  tocarNota(783.99, 0.04, 0.14, 'sine', 0.06, { ataque: 0.01, release: 0.10 });
}

function tocarSomCliqueIniciar() {
  if (!audioCtx || estaNoMudo) return;
  [
    { freq: 523.25, inicio: 0.00, dur: 0.12 },
    { freq: 659.25, inicio: 0.10, dur: 0.12 },
    { freq: 783.99, inicio: 0.20, dur: 0.12 },
    { freq: 1046.5, inicio: 0.30, dur: 0.30 },
  ].forEach(({ freq, inicio, dur }) => {
    tocarNota(freq, inicio, dur, 'triangle', 0.25, { ataque: 0.01, sustentacao: dur * 0.6, release: 0.12 });
  });
}

function tocarSomJornada() {
  if (!audioCtx || estaNoMudo) return;
  tocarNota(392.00, 0,    0.6, 'triangle', 0.18, { ataque: 0.05, release: 0.25 });
  tocarNota(493.88, 0.05, 0.6, 'triangle', 0.14, { ataque: 0.05, release: 0.25 });
  tocarNota(587.33, 0.10, 0.6, 'triangle', 0.12, { ataque: 0.05, release: 0.25 });
}

function tocarSomSalvar() {
  if (!audioCtx || estaNoMudo) return;
  [
    { freq: 523.25, inicio: 0.00, dur: 0.15 },
    { freq: 659.25, inicio: 0.12, dur: 0.15 },
    { freq: 783.99, inicio: 0.24, dur: 0.15 },
    { freq: 1046.5, inicio: 0.36, dur: 0.40 },
    { freq: 1318.5, inicio: 0.50, dur: 0.50 },
  ].forEach(({ freq, inicio, dur }) => {
    tocarNota(freq, inicio, dur, 'triangle', 0.22, { ataque: 0.01, sustentacao: dur * 0.7, release: 0.15 });
  });
}

function tocarSomTraco() {
  if (!audioCtx || estaNoMudo) return;
  tocarNota(880, 0, 0.05, 'sine', 0.04, { ataque: 0.005, release: 0.04 });
}

/* Controle de mudo */
function alternarMudo() {
  estaNoMudo = !estaNoMudo;
  if (gainMestre) {
    gainMestre.gain.cancelScheduledValues(audioCtx.currentTime);
    gainMestre.gain.linearRampToValueAtTime(estaNoMudo ? 0 : 0.7, audioCtx.currentTime + 0.3);
  }
  btnMudo.textContent = estaNoMudo ? '🔇' : '🔊';
  btnMudo.setAttribute('aria-label', estaNoMudo ? 'Ativar sons' : 'Desativar sons');
  btnMudo.setAttribute('title',      estaNoMudo ? 'Ativar sons' : 'Desativar sons');
}
btnMudo.addEventListener('click', alternarMudo);

function inicializarAudio() {
  criarContexto();
  iniciarMusicaDeFundo();
  document.removeEventListener('click', inicializarAudio);
}
document.addEventListener('click', inicializarAudio);


/* =============================================
   TRANSIÇÃO: TELA INÍCIO → JORNADA → DESENHO
============================================= */
function iniciarJornada() {
  botao.disabled      = true;
  botao.style.opacity = '0.6';
  tocarSomCliqueIniciar();
  telaInicio.classList.add('saindo');

  setTimeout(function () {
    pararMusicaDeFundo();
    telaInicio.style.display = 'none';

    telaJornada.style.opacity       = '0';
    telaJornada.style.pointerEvents = 'auto';
    telaJornada.removeAttribute('aria-hidden');
    telaInicio.setAttribute('aria-hidden', 'true');

    setTimeout(function () {
      telaJornada.classList.add('visivel');
      telaJornada.style.opacity    = '1';
      telaJornada.style.transition = 'opacity 0.8s ease';
      tocarSomJornada();
      telaJornada.focus();

      /* Após 2s no loading, vai para tela de desenho */
      setTimeout(irParaDesenho, 2000);

    }, 80);
  }, 750);
}

function irParaDesenho() {
  telaJornada.classList.add('saindo');

  setTimeout(function () {
    telaJornada.style.display = 'none';
    telaJornada.setAttribute('aria-hidden', 'true');

    telaDesenho.style.opacity       = '0';
    telaDesenho.style.pointerEvents = 'auto';
    telaDesenho.removeAttribute('aria-hidden');

    setTimeout(function () {
      telaDesenho.classList.add('visivel');
      telaDesenho.style.opacity    = '1';
      telaDesenho.style.transition = 'opacity 0.8s ease';
      iniciarCanvas();
      telaDesenho.focus();
    }, 80);
  }, 700);
}

botao.addEventListener('click', iniciarJornada);
botao.addEventListener('mouseenter', tocarSomHover);
botao.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); iniciarJornada(); }
});


/* =============================================
   CANVAS DE DESENHO
============================================= */
let canvas, ctx;
let desenhando    = false;
let corAtual      = '#3A3530';
let espessuraAtual = 3;
let modoborracha  = false;
let tracos        = []; /* histórico de traços para salvar no JSON */
let tracoAtual    = null;
let primeiroPonto = true; /* controla exibição da dica */

function iniciarCanvas() {
  canvas = document.getElementById('canvasDesenho');
  ctx    = canvas.getContext('2d');

  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';
  ctx.strokeStyle = corAtual;
  ctx.lineWidth   = espessuraAtual;

  /* Fundo branco */
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  /* Eventos mouse */
  canvas.addEventListener('mousedown', iniciarTraco);
  canvas.addEventListener('mousemove', continuarTraco);
  canvas.addEventListener('mouseup',   terminarTraco);
  canvas.addEventListener('mouseleave', terminarTraco);

  /* Eventos touch */
  canvas.addEventListener('touchstart',  toqueIniciar,    { passive: false });
  canvas.addEventListener('touchmove',   toqueMover,      { passive: false });
  canvas.addEventListener('touchend',    toqueTerminar,   { passive: false });

  /* Ferramentas de cor */
  document.querySelectorAll('.cor-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.cor-btn').forEach(b => b.classList.remove('ativo'));
      this.classList.add('ativo');
      corAtual    = this.dataset.cor;
      modoborracha = false;
      document.getElementById('btnBorracha').classList.remove('ativo');
    });
  });

  /* Ferramentas de espessura */
  document.querySelectorAll('.esp-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.esp-btn').forEach(b => b.classList.remove('ativo'));
      this.classList.add('ativo');
      espessuraAtual = parseInt(this.dataset.esp);
    });
  });

  /* Borracha */
  document.getElementById('btnBorracha').addEventListener('click', function () {
    modoborracha = !modoborracha;
    this.classList.toggle('ativo', modoborracha);
    document.querySelectorAll('.cor-btn').forEach(b => b.classList.remove('ativo'));
  });

  /* Limpar */
  document.getElementById('btnLimpar').addEventListener('click', function () {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    tracos = [];
    primeiroPonto = true;
    canvasDica.style.opacity = '1';
  });

  /* Salvar */
  btnSalvar.addEventListener('click', salvarPersonagem);
}

function posicaoCanvas(e) {
  const rect  = canvas.getBoundingClientRect();
  const escX  = canvas.width  / rect.width;
  const escY  = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * escX,
    y: (e.clientY - rect.top)  * escY,
  };
}

function iniciarTraco(e) {
  desenhando = true;
  const pos  = posicaoCanvas(e);

  /* Esconde dica na primeira pincelada */
  if (primeiroPonto) {
    canvasDica.style.opacity = '0';
    primeiroPonto = false;
  }

  tracoAtual = {
    cor:       modoborracha ? '#FFFFFF' : corAtual,
    espessura: modoborracha ? espessuraAtual * 3 : espessuraAtual,
    pontos:    [{ x: pos.x, y: pos.y }],
  };

  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
  ctx.strokeStyle = tracoAtual.cor;
  ctx.lineWidth   = tracoAtual.espessura;
}

function continuarTraco(e) {
  if (!desenhando || !tracoAtual) return;
  const pos = posicaoCanvas(e);
  tracoAtual.pontos.push({ x: pos.x, y: pos.y });
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();

  /* Som suave enquanto desenha (a cada 8 pontos) */
  if (tracoAtual.pontos.length % 8 === 0) tocarSomTraco();
}

function terminarTraco() {
  if (!desenhando || !tracoAtual) return;
  desenhando = false;
  ctx.closePath();
  if (tracoAtual.pontos.length > 1) {
    tracos.push(tracoAtual);
  }
  tracoAtual = null;
}

/* Touch */
function posicaoTouch(e) {
  const t    = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const escX = canvas.width  / rect.width;
  const escY = canvas.height / rect.height;
  return {
    clientX: rect.left + (t.clientX - rect.left),
    clientY: rect.top  + (t.clientY - rect.top),
  };
}

function toqueIniciar(e) {
  e.preventDefault();
  iniciarTraco(e.touches[0]);
}
function toqueMover(e) {
  e.preventDefault();
  continuarTraco(e.touches[0]);
}
function toqueTerminar(e) {
  e.preventDefault();
  terminarTraco();
}


/* =============================================
   SALVAR PERSONAGEM EM JSON
   Salva os traços + imagem base64 no
   localStorage como "personagem_desenho"
   para ser usado nas próximas fases do jogo.
============================================= */
function salvarPersonagem() {
  if (tracos.length === 0) {
    /* Sem traços: balança o botão */
    btnSalvar.classList.add('balanca');
    setTimeout(() => btnSalvar.classList.remove('balanca'), 600);
    return;
  }

  /* Calcula bounding box de todos os pontos desenhados */
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  tracos.forEach(t => {
    const esp = t.espessura / 2;
    t.pontos.forEach(p => {
      if (p.x - esp < minX) minX = p.x - esp;
      if (p.y - esp < minY) minY = p.y - esp;
      if (p.x + esp > maxX) maxX = p.x + esp;
      if (p.y + esp > maxY) maxY = p.y + esp;
    });
  });
  const pad = 10;
  minX = Math.max(0, Math.floor(minX - pad));
  minY = Math.max(0, Math.floor(minY - pad));
  maxX = Math.min(canvas.width,  Math.ceil(maxX + pad));
  maxY = Math.min(canvas.height, Math.ceil(maxY + pad));
  const bboxW = maxX - minX;
  const bboxH = maxY - minY;

  /* Redesenha apenas a área do desenho num canvas temporário com fundo transparente */
  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width  = bboxW;
  tmpCanvas.height = bboxH;
  const tmpCtx = tmpCanvas.getContext('2d');
  tmpCtx.lineCap  = 'round';
  tmpCtx.lineJoin = 'round';
  tracos.forEach(t => {
    if (!t.pontos || t.pontos.length < 2) return;
    tmpCtx.beginPath();
    tmpCtx.strokeStyle = t.cor;
    tmpCtx.lineWidth   = t.espessura;
    tmpCtx.moveTo(t.pontos[0].x - minX, t.pontos[0].y - minY);
    for (let i = 1; i < t.pontos.length; i++) {
      tmpCtx.lineTo(t.pontos[i].x - minX, t.pontos[i].y - minY);
    }
    tmpCtx.stroke();
  });

  const imagemBase64 = tmpCanvas.toDataURL('image/png');

  const dadosPersonagem = {
    versao:    '1.0',
    timestamp: new Date().toISOString(),
    canvas: {
      largura: bboxW,
      altura:  bboxH,
    },
    tracos: tracos.map(t => ({
      cor:       t.cor,
      espessura: t.espessura,
      pontos:    t.pontos.map(p => ({ x: p.x - minX, y: p.y - minY })),
    })),
    imagemBase64: imagemBase64,
  };

  /* Salva no localStorage */
  localStorage.setItem('personagem_desenho', JSON.stringify(dadosPersonagem));

  /* Gera download do JSON */
  const blob = new Blob([JSON.stringify(dadosPersonagem, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'personagem_desenho.json';
  a.click();
  URL.revokeObjectURL(url);

  /* Feedback visual e sonoro */
  tocarSomSalvar();
  mostrarFeedbackSalvo();
}

function mostrarFeedbackSalvo() {
  feedbackSalvo.removeAttribute('aria-hidden');
  feedbackSalvo.classList.add('visivel');
  btnSalvar.disabled = true;

  /* Redireciona para a Fase 1 após o feedback */
  setTimeout(function () {
    window.location.href = 'fase1.html';
  }, 2200);
}
