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
   2. SONS DA TELA DE CRIAÇÃO DE PERSONAGEM
   Substitua os arquivos em assets/sounds/
   
   Arquivos necessários:
     musica-menu.mp3     — Música de fundo desta tela (loop)
     hover.mp3           — Hover nos botões de cor/opção
     clique-iniciar.mp3  — Botão "Começar a aventura!"
     jornada.mp3         — Transição para a fase (fanfarra curta)
     salvar.mp3          — Personagem salvo com sucesso
     traco.mp3           — Som ao desenhar traço no canvas
============================================= */
let estaNoMudo    = false;
let musicaMenuAtiva = false;

const musicaMenu       = new Audio('assets/sounds/musica-menu.mp3');
musicaMenu.loop        = true;
musicaMenu.volume      = 0.5;

const somHover         = new Audio('assets/sounds/hover.mp3');
somHover.volume        = 0.5;

const somCliqueIniciar = new Audio('assets/sounds/clique-iniciar.mp3');
somCliqueIniciar.volume = 0.8;

const somJornada       = new Audio('assets/sounds/jornada.mp3');
somJornada.volume      = 0.8;

const somSalvar        = new Audio('assets/sounds/salvar.mp3');
somSalvar.volume       = 0.8;

const somTraco         = new Audio('assets/sounds/traco.mp3');
somTraco.volume        = 0.3;

function _play(audio) {
  if (estaNoMudo) return;
  try { audio.currentTime = 0; audio.play(); } catch(e) {}
}

function iniciarMusicaDeFundo() {
  if (musicaMenuAtiva || estaNoMudo) return;
  musicaMenuAtiva = true;
  musicaMenu.play().catch(()=>{});
}

function pararMusicaDeFundo() {
  musicaMenu.pause();
  musicaMenu.currentTime = 0;
  musicaMenuAtiva = false;
}

function tocarSomHover()        { _play(somHover); }
function tocarSomCliqueIniciar(){ _play(somCliqueIniciar); }
function tocarSomJornada()      { _play(somJornada); }
function tocarSomSalvar()       { _play(somSalvar); }
function tocarSomTraco()        { _play(somTraco); }

// Inicia música ao primeiro clique/toque
function inicializarAudio() {
  iniciarMusicaDeFundo();
  document.removeEventListener('click', inicializarAudio);
  document.removeEventListener('keydown', inicializarAudio);
  document.removeEventListener('touchstart', inicializarAudio);
}
document.addEventListener('click', inicializarAudio);
document.addEventListener('keydown', inicializarAudio);
document.addEventListener('touchstart', inicializarAudio);

/* Controle de mudo */
function alternarMudo() {
  estaNoMudo = !estaNoMudo;
  if (estaNoMudo) {
    musicaMenu.pause();
  } else {
    musicaMenu.play().catch(()=>{});
  }
  btnMudo.textContent = estaNoMudo ? '🔇' : '🔊';
  btnMudo.setAttribute('aria-label', estaNoMudo ? 'Ativar sons' : 'Desativar sons');
  btnMudo.setAttribute('title',      estaNoMudo ? 'Ativar sons' : 'Desativar sons');
}
btnMudo.addEventListener('click', alternarMudo);




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
