/*
  =============================================
  DESENHA MUNDO — Sprint 1
  Arquivo: script.js
  Responsabilidade: interatividade, transições e sons
  =============================================

  Índice:
  1.  Referências aos elementos do DOM
  2.  Configuração do Web Audio API (AudioContext)
  3.  Funções auxiliares de som
  4.  Som: música de fundo (melodia suave em loop)
  5.  Som: hover no botão (acorde suave)
  6.  Som: clique em Começar (fanfarra alegre)
  7.  Som: jornada iniciada (acorde de chegada)
  8.  Controle de mudo (botão 🔊 / 🔇)
  9.  Inicialização dos sons ao primeiro clique
  10. Função principal: iniciarJornada()
  11. Eventos do botão Começar
  12. Acessibilidade: teclado (Enter / Espaço)
*/


/* =============================================
   1. REFERÊNCIAS AOS ELEMENTOS DO DOM
============================================= */
const telaInicio   = document.getElementById('tela-inicio');
const telaJornada  = document.getElementById('tela-jornada');
const botao        = document.getElementById('btnComecar');
const btnMudo      = document.getElementById('btnMudo');


/* =============================================
   2. CONFIGURAÇÃO DO WEB AUDIO API

   Todos os sons são GERADOS PROGRAMATICAMENTE
   via Web Audio API — não precisam de arquivos
   de áudio externos (.mp3, .wav etc.).

   O AudioContext só pode ser criado após uma
   interação do usuário (política dos navegadores),
   por isso ele é inicializado no primeiro clique.
============================================= */
let audioCtx  = null;   /* Contexto principal de áudio          */
let gainMestre = null;  /* Controle de volume geral (mudo/ativo) */
let musicaLoop = null;  /* Referência ao loop da música de fundo */
let estaNoMudo = false; /* Estado atual: com ou sem som          */
let audioIniciado = false; /* Garante que criamos o contexto apenas uma vez */


/* =============================================
   3. FUNÇÕES AUXILIARES DE SOM
============================================= */

/**
 * criarContexto()
 * Cria o AudioContext e o nó de volume mestre.
 * Chamada uma única vez, no primeiro clique.
 */
function criarContexto() {
  if (audioIniciado) return;
  audioIniciado = true;

  audioCtx    = new (window.AudioContext || window.webkitAudioContext)();
  gainMestre  = audioCtx.createGain();
  gainMestre.gain.value = 0.7; /* volume inicial: 70% */
  gainMestre.connect(audioCtx.destination);
}

/**
 * tocarNota(frequencia, inicio, duracao, tipo, volume, envoltoria)
 *
 * Toca uma nota sintética com controle fino.
 *
 * @param {number} frequencia  - Frequência em Hz (ex: 261.6 = Dó central)
 * @param {number} inicio      - Quando iniciar (em segundos a partir de agora)
 * @param {number} duracao     - Duração da nota em segundos
 * @param {string} tipo        - Forma de onda: 'sine' | 'triangle' | 'square' | 'sawtooth'
 * @param {number} volume      - Volume da nota (0.0 a 1.0)
 * @param {object} envoltoria  - { ataque, sustentacao, release } em segundos
 */
function tocarNota(frequencia, inicio, duracao, tipo = 'sine', volume = 0.3, envoltoria = {}) {
  if (!audioCtx) return;

  const agora    = audioCtx.currentTime;
  const ataque   = envoltoria.ataque      || 0.02;
  const sustento = envoltoria.sustentacao || duracao * 0.6;
  const release  = envoltoria.release     || 0.15;

  /* Oscilador: gera a onda sonora */
  const osc = audioCtx.createOscillator();
  osc.type            = tipo;
  osc.frequency.value = frequencia;

  /* Envelope de volume (ADSR simplificado) */
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0, agora + inicio);
  gain.gain.linearRampToValueAtTime(volume, agora + inicio + ataque);
  gain.gain.setValueAtTime(volume, agora + inicio + sustento);
  gain.gain.linearRampToValueAtTime(0, agora + inicio + duracao + release);

  /* Conecta: oscilador → envelope → volume mestre → saída */
  osc.connect(gain);
  gain.connect(gainMestre);

  osc.start(agora + inicio);
  osc.stop(agora + inicio + duracao + release + 0.05);
}


/* =============================================
   4. SOM: MÚSICA DE FUNDO
   Melodia suave e repetitiva em loop.
   Usa notas da escala de Dó maior em frequências
   baixas para ser aconchegante, não intrusiva.
   Adequada para crianças neurodivergentes:
   previsível, suave, sem surpresas.
============================================= */

/* Notas da melodia principal (Hz) */
const MELODIA = [
  261.63, /* Dó4  */
  293.66, /* Ré4  */
  329.63, /* Mi4  */
  392.00, /* Sol4 */
  349.23, /* Fá4  */
  329.63, /* Mi4  */
  293.66, /* Ré4  */
  261.63, /* Dó4  */
];

/* Notas do acompanhamento (baixo suave) */
const BAIXO = [
  130.81, /* Dó3  */
  146.83, /* Ré3  */
  164.81, /* Mi3  */
  196.00, /* Sol3 */
];

/* Duração de cada compasso em segundos */
const TEMPO_NOTA = 0.55;

/* Identificador do interval do loop */
let intervaloMusica = null;
let compassoAtual   = 0;

/**
 * tocarCompassoMusica()
 * Toca um compasso da melodia + baixo.
 * É chamada em loop a cada TEMPO_NOTA segundos.
 */
function tocarCompassoMusica() {
  if (!audioCtx || estaNoMudo) return;

  const notaMelodia = MELODIA[compassoAtual % MELODIA.length];
  const notaBaixo   = BAIXO[Math.floor(compassoAtual / 2) % BAIXO.length];

  /* Melodia: onda triangle, suave e quente */
  tocarNota(notaMelodia, 0, TEMPO_NOTA * 0.8, 'triangle', 0.18, {
    ataque: 0.03, sustentacao: TEMPO_NOTA * 0.5, release: 0.12
  });

  /* Baixo: onda sine, grave e suave, a cada 2 notas */
  if (compassoAtual % 2 === 0) {
    tocarNota(notaBaixo, 0, TEMPO_NOTA * 1.5, 'sine', 0.10, {
      ataque: 0.05, sustentacao: TEMPO_NOTA, release: 0.2
    });
  }

  compassoAtual++;
}

/**
 * iniciarMusicaDeFundo()
 * Começa o loop da música suave.
 */
function iniciarMusicaDeFundo() {
  if (intervaloMusica) return; /* evita criar múltiplos loops */
  tocarCompassoMusica(); /* toca o primeiro compasso imediatamente */
  intervaloMusica = setInterval(tocarCompassoMusica, TEMPO_NOTA * 1000);
}

/**
 * pararMusicaDeFundo()
 * Interrompe o loop da música.
 */
function pararMusicaDeFundo() {
  if (intervaloMusica) {
    clearInterval(intervaloMusica);
    intervaloMusica = null;
  }
}


/* =============================================
   5. SOM: HOVER NO BOTÃO
   Um acorde suave (Dó + Mi + Sol) que soa
   quando a criança passa o mouse no botão.
   Indica que o elemento é interativo,
   de forma gentil e não assustadora.
============================================= */
function tocarSomHover() {
  if (!audioCtx || estaNoMudo) return;

  /* Acorde de Dó maior: Dó5 + Mi5 + Sol5 */
  tocarNota(523.25, 0,    0.18, 'sine', 0.10, { ataque: 0.01, release: 0.10 });
  tocarNota(659.25, 0.02, 0.16, 'sine', 0.08, { ataque: 0.01, release: 0.10 });
  tocarNota(783.99, 0.04, 0.14, 'sine', 0.06, { ataque: 0.01, release: 0.10 });
}


/* =============================================
   6. SOM: CLIQUE NO BOTÃO COMEÇAR
   Fanfarra alegre e ascendente — comunica
   "você fez algo ótimo!".
   Ascensão de notas = sentimento de conquista.
============================================= */
function tocarSomCliqueIniciar() {
  if (!audioCtx || estaNoMudo) return;

  /* Sequência rápida e ascendente: Dó → Mi → Sol → Dó alta */
  const notas = [
    { freq: 523.25, inicio: 0.00, dur: 0.12 },  /* Dó5  */
    { freq: 659.25, inicio: 0.10, dur: 0.12 },  /* Mi5  */
    { freq: 783.99, inicio: 0.20, dur: 0.12 },  /* Sol5 */
    { freq: 1046.5, inicio: 0.30, dur: 0.30 },  /* Dó6 (acento final) */
  ];

  notas.forEach(({ freq, inicio, dur }) => {
    tocarNota(freq, inicio, dur, 'triangle', 0.25, {
      ataque: 0.01, sustentacao: dur * 0.6, release: 0.12
    });
  });
}


/* =============================================
   7. SOM: JORNADA INICIADA
   Acorde acolhedor que soa quando a tela
   da jornada aparece — sinaliza "chegamos!".
   Tríade de Sol maior: suave e esperançosa.
============================================= */
function tocarSomJornada() {
  if (!audioCtx || estaNoMudo) return;

  /* Acorde de Sol maior: Sol4 + Si4 + Ré5 */
  tocarNota(392.00, 0,    0.6, 'triangle', 0.18, { ataque: 0.05, release: 0.25 });
  tocarNota(493.88, 0.05, 0.6, 'triangle', 0.14, { ataque: 0.05, release: 0.25 });
  tocarNota(587.33, 0.10, 0.6, 'triangle', 0.12, { ataque: 0.05, release: 0.25 });
}


/* =============================================
   8. CONTROLE DE MUDO
   Botão 🔊/🔇 no canto da tela.
   Importante para crianças sensíveis a som.
============================================= */

/**
 * alternarMudo()
 * Liga ou desliga todos os sons do jogo.
 */
function alternarMudo() {
  estaNoMudo = !estaNoMudo;

  if (gainMestre) {
    /* Fade suave no volume para não assustar */
    gainMestre.gain.cancelScheduledValues(audioCtx.currentTime);
    gainMestre.gain.linearRampToValueAtTime(
      estaNoMudo ? 0 : 0.7,
      audioCtx.currentTime + 0.3
    );
  }

  /* Atualiza ícone e texto acessível do botão */
  btnMudo.textContent             = estaNoMudo ? '🔇' : '🔊';
  btnMudo.setAttribute('aria-label', estaNoMudo ? 'Ativar sons' : 'Desativar sons');
  btnMudo.setAttribute('title',      estaNoMudo ? 'Ativar sons' : 'Desativar sons');
}

/* Evento do botão de mudo */
btnMudo.addEventListener('click', alternarMudo);


/* =============================================
   9. INICIALIZAÇÃO DOS SONS AO PRIMEIRO CLIQUE
   Navegadores modernos exigem uma interação
   do usuário antes de permitir áudio.
   Usamos o primeiro clique em qualquer lugar
   para criar o AudioContext e iniciar a música.
============================================= */
function inicializarAudio() {
  criarContexto();
  iniciarMusicaDeFundo();
  /* Remove este listener após o primeiro uso */
  document.removeEventListener('click', inicializarAudio);
}

document.addEventListener('click', inicializarAudio);


/* =============================================
   10. FUNÇÃO PRINCIPAL: iniciarJornada()

   Realiza a transição suave entre as telas
   em 3 etapas, com sons correspondentes:

   Etapa 1 — Toca fanfarra + fade out (0.7s)
   Etapa 2 — Para a música, prepara tela 2
   Etapa 3 — Fade in + som de chegada
============================================= */
function iniciarJornada() {

  /* Desativa o botão para evitar cliques duplos */
  botao.disabled      = true;
  botao.style.opacity = '0.6';

  /* Som de clique: fanfarra alegre */
  tocarSomCliqueIniciar();

  /* ---- Etapa 1: Fade out da tela inicial ---- */
  telaInicio.classList.add('saindo');

  /* ---- Etapa 2: Aguarda fade out, para música e prepara tela 2 ---- */
  setTimeout(function () {

    /* Para a música de fundo suavemente */
    pararMusicaDeFundo();

    /* Esconde completamente a tela inicial */
    telaInicio.style.display = 'none';

    /* Prepara a tela da jornada */
    telaJornada.style.opacity       = '0';
    telaJornada.style.pointerEvents = 'auto';

    /* Atualiza atributos de acessibilidade */
    telaJornada.removeAttribute('aria-hidden');
    telaInicio.setAttribute('aria-hidden', 'true');

    /* Respiro visual antes do fade in */
    setTimeout(function () {

      /* ---- Etapa 3: Fade in da tela da jornada ---- */
      telaJornada.classList.add('visivel');
      telaJornada.style.opacity    = '1';
      telaJornada.style.transition = 'opacity 0.8s ease';

      /* Som de chegada: acorde acolhedor */
      tocarSomJornada();

      /* Foco acessível na nova tela */
      telaJornada.focus();

    }, 80); /* 80ms de respiro */

  }, 750); /* aguarda fade out (700ms + margem) */
}


/* =============================================
   11. EVENTOS DO BOTÃO COMEÇAR
============================================= */
botao.addEventListener('click', iniciarJornada);

/* Hover: som suave ao passar o mouse */
botao.addEventListener('mouseenter', tocarSomHover);


/* =============================================
   12. ACESSIBILIDADE: TECLADO
   Permite iniciar com Enter ou Espaço.
============================================= */
botao.addEventListener('keydown', function (evento) {
  if (evento.key === 'Enter' || evento.key === ' ') {
    evento.preventDefault();
    iniciarJornada();
  }
});
