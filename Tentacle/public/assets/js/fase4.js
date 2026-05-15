/* =============================================
   DESENHA MUNDO — FASE 4 (reformulada)
   "O Rio das Travessias"

   7 ilhas separadas por rios intransponíveis.
   O jogador desenha pontes reais: o traçado
   vira heightmap de colisão — ele caminha
   fisicamente sobre o próprio desenho.

   Mecânica fiel à Fase 2:
   • Gap maior que o pulo → precisa de ponte
   • Qualquer desenho com ≥ 3 % de cobertura
     é aceito (inclusivo / neurodivergente)
   • A partir da Ilha 3: chuva → precisa de
     abrigo antes de desenhar a ponte
   • Sem teleporte: o herói ANDA pela ponte
============================================= */

const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

function redimensionar() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
redimensionar();
window.addEventListener('resize', redimensionar);

/* ════════════════════════════════════════════
   CONSTANTES
════════════════════════════════════════════ */
const TOTAL_ILHAS = 7;
/* Apenas as ilhas listadas aqui disparam uma NOVA chuva (requer novo abrigo).
   As demais ilhas mantêm o estado de clima atual sem interromper nem reiniciar. */
const ILHAS_INICIO_CHUVA = new Set([3, 5]);  // 2 eventos em vez de 5
const VELOCIDADE  = 3.4;
const GRAVIDADE   = 0.56;
const PULO        = -13;
const SPRITE_W    = 72;
const SPRITE_H    = 72;
const TRIGGER_DIST = 280;     // distância para mostrar botão de ponte

/* Largura das ilhas e dos gaps */
const ILHA_LARGURAS = [240, 200, 200, 200, 200, 200, 260];
const GAP_LARGURAS  = [300, 310, 310, 320, 320, 340];  // todos > max pulo ≈170 px

/* ════════════════════════════════════════════
   LAYOUT DO MUNDO
════════════════════════════════════════════ */
const ilhas = [];
let curX = 60;
for (let i = 0; i < TOTAL_ILHAS; i++) {
  ilhas.push({ x: curX, w: ILHA_LARGURAS[i], h: 72, index: i });
  curX += ILHA_LARGURAS[i];
  if (i < TOTAL_ILHAS - 1) curX += GAP_LARGURAS[i];
}
const MUNDO_W = curX + 80;

const gaps = [];
for (let g = 0; g < TOTAL_ILHAS - 1; g++) {
  const il = ilhas[g], ir = ilhas[g + 1];
  gaps.push({
    index: g,
    x:  il.x + il.w,
    w:  GAP_LARGURAS[g],
    ponteImg:    null,
    ponteAlturas: null,
    pontePW:     0,
    pontePH:     0,
    ponteMaxHy:  0,
    temPonte:    false,
    cruzado:     false,
  });
}

/* ════════════════════════════════════════════
   ESTADO
════════════════════════════════════════════ */
const estado = {
  personagemImg: null,
  abrigoImg:     null,
  px: 0, py: 0, vx: 0, vy: 0,
  noChao:         true,
  viradoDireita:  true,
  animFrame: 0, animTimer: 0,
  camera: 0,
  teclas: {},
  correndo:       false,
  mundoLargura:   MUNDO_W,
  ilhaAtual:      0,
  pontos:         0,
  chuvaAtiva:     false,
  temAbrigo:      false,
  modalAberto:    false,
  vitoria:        false,
};

/* ════════════════════════════════════════════
   ELEMENTOS DOM
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
   CARREGAR PERSONAGEM
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
      .then(dados => processarDados(dados))
      .catch(() => mostrarAviso());
    return;
  }
  try { processarDados(JSON.parse(dadosStr)); }
  catch(e) { mostrarAviso(); }
}

function processarDados(dados) {
  const oc = document.createElement('canvas');
  oc.width = dados.canvas.largura; oc.height = dados.canvas.altura;
  const octx = oc.getContext('2d');
  octx.lineCap = 'round'; octx.lineJoin = 'round';
  dados.tracos.forEach(t => {
    if (!t.pontos || t.pontos.length < 2) return;
    octx.beginPath();
    octx.strokeStyle = t.cor; octx.lineWidth = t.espessura;
    octx.moveTo(t.pontos[0].x, t.pontos[0].y);
    t.pontos.forEach(p => octx.lineTo(p.x, p.y));
    octx.stroke();
  });
  createImageBitmap(oc).then(bmp => {
    estado.personagemImg = bmp;
    simularBarra(() => iniciar());
  });
}

function mostrarAviso() {
  simularBarra(() => {
    telaCarregando.style.display = 'none';
    avisoSemPersonagem.style.display = 'flex';
  });
}

/* ════════════════════════════════════════════
   DECORAÇÃO DAS ILHAS
════════════════════════════════════════════ */
const decorIlhas = ilhas.map(ilha => ({
  arvores: Array.from({ length: 1 + (ilha.index === 0 || ilha.index === TOTAL_ILHAS-1 ? 1 : 0) }, (_, i) => ({
    relX: 0.15 + i * 0.5 + Math.random() * 0.1,
    emoji: ['🌴','🌳','🌲','🎋'][Math.floor(Math.random()*4)],
  })),
  flores: Array.from({ length: 3 }, () => ({
    relX: 0.1 + Math.random() * 0.8,
    emoji: ['🌸','🌼','🌻','🌺','💐'][Math.floor(Math.random()*5)],
    off:   Math.random() * Math.PI * 2,
  })),
}));

/* ════════════════════════════════════════════
   CHUVA — elementos DOM
════════════════════════════════════════════ */
const camadaChuva = document.createElement('div');
camadaChuva.id = 'camadaChuva';
document.body.appendChild(camadaChuva);

for (let i = 0; i < 90; i++) {
  const g = document.createElement('div');
  g.className = 'gota-chuva';
  const h = 8 + Math.random() * 18, dur = 0.45 + Math.random() * 0.55;
  g.style.cssText = `left:${Math.random()*100}%;height:${h}px;animation-duration:${dur}s;animation-delay:${-Math.random()*dur}s;opacity:${0.4+Math.random()*0.5}`;
  camadaChuva.appendChild(g);
}

const nuvensChuva = [];
for (let c = 0; c < 5; c++) {
  const n = document.createElement('div');
  n.className = 'nuvem-chuva-f4';
  n.textContent = '🌧️';
  const dur = 14 + Math.random() * 10;
  n.style.top = (3 + c * 7) + '%';
  n.style.left = (Math.random() * 70) + '%';
  n.style.animationDuration = dur + 's';
  n.style.animationDelay = (-Math.random() * dur) + 's';
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
  estado.temAbrigo = true;
  estado.abrigoImg = bitmap;
  camadaChuva.classList.remove('ativa');
  camadaChuva.classList.add('protegida');
  btnAbrirAbrigo.classList.remove('visivel');
  btnAbrirAbrigo.setAttribute('aria-hidden', 'true');
  mostrarDica('🛡️ Ótimo! Agora desenhe a ponte!', 3000);
  estado.pontos += 10;  /* 10 pts por desenho */
}

function encerrarChuva() {
  estado.chuvaAtiva = false;
  estado.temAbrigo  = false;
  estado.abrigoImg  = null;
  camadaChuva.classList.remove('ativa', 'protegida');
  nuvensChuva.forEach(n => n.classList.remove('ativa'));
}

/* ════════════════════════════════════════════
   POSIÇÃO DO CHÃO POR ILHA
════════════════════════════════════════════ */
function aguaY()   { return canvas.height * 0.56; }
function chaoIlha(idx) { return aguaY() - ilhas[idx].h; }

/* ════════════════════════════════════════════
   PINGO — OLHOS SEGUEM O PERSONAGEM
════════════════════════════════════════════ */
const _pingoE  = document.getElementById('pingo-pupila-e');
const _pingoD  = document.getElementById('pingo-pupila-d');
const _brilhoE = document.getElementById('pingo-brilho-e');
const _brilhoD = document.getElementById('pingo-brilho-d');
const _pingoSvg = document.getElementById('pingo-svg');
const _OLHOS = [
  { pupila: _pingoE, brilho: _brilhoE, baseCX: 51, baseCY: 65 },
  { pupila: _pingoD, brilho: _brilhoD, baseCX: 81, baseCY: 65 },
];
function atualizarOlhosPingo(psx, psy) {
  if (!_pingoSvg) return;
  const r = _pingoSvg.getBoundingClientRect();
  if (!r.width) return;
  const sx = r.width / 130, sy = r.height / 140;
  _OLHOS.forEach(({ pupila, brilho, baseCX, baseCY }) => {
    const ex = r.left + baseCX * sx, ey = r.top + baseCY * sy;
    const dx = psx - ex, dy = psy - ey, dist = Math.sqrt(dx*dx + dy*dy) || 1;
    const ox = (dx/dist) * 2.8, oy = (dy/dist) * 2.8;
    pupila.setAttribute('cx', baseCX + ox);
    pupila.setAttribute('cy', baseCY + oy);
    brilho.setAttribute('cx', baseCX + ox + 2);
    brilho.setAttribute('cy', baseCY + oy - 2);
  });
}

/* ════════════════════════════════════════════
   CONTROLES — teclado + mobile
════════════════════════════════════════════ */
document.addEventListener('keydown', e => { estado.teclas[e.code] = true; });
document.addEventListener('keyup',   e => { estado.teclas[e.code] = false; });

function bindBtn(id, code) {
  const btn = document.getElementById(id);
  if (!btn) return;
  const on  = () => { estado.teclas[code] = true;  btn.classList.add('pressionado'); };
  const off = () => { estado.teclas[code] = false; btn.classList.remove('pressionado'); };
  btn.addEventListener('pointerdown',   on);
  btn.addEventListener('pointerup',     off);
  btn.addEventListener('pointerleave',  off);
  btn.addEventListener('pointercancel', off);
}
bindBtn('btnEsquerda', 'ArrowLeft');
bindBtn('btnDireita',  'ArrowRight');
bindBtn('btnPular',    'ArrowUp');

/* ════════════════════════════════════════════
   HEIGHTMAP DA PONTE
   Igual à Fase 2 — mas por gap (não global)
════════════════════════════════════════════ */
function construirHeightmap(cv, gapW) {
  const pw = gapW + 40;
  const ph = Math.round(pw * cv.height / cv.width);
  const oc   = document.createElement('canvas');
  oc.width   = pw; oc.height = ph;
  const octx = oc.getContext('2d');
  octx.drawImage(cv, 0, 0, pw, ph);
  const pixels = octx.getImageData(0, 0, pw, ph).data;
  const alturas = new Float32Array(pw).fill(ph);

  for (let sx = 0; sx < pw; sx++) {
    const srcX = Math.round((sx / pw) * (oc.width - 1));
    const x0 = Math.max(0, srcX - 3), x1 = Math.min(oc.width - 1, srcX + 3);
    for (let sy = 0; sy < ph; sy++) {
      const srcY = Math.round((sy / ph) * (oc.height - 1));
      const y0 = Math.max(0, srcY - 2), y1 = Math.min(oc.height - 1, srcY + 2);
      let found = false;
      outer: for (let cy = y0; cy <= y1; cy++)
        for (let cx = x0; cx <= x1; cx++) {
          /* BUG FIX: O canvas tem fundo branco opaco (alpha=255).
             Verificar só o alpha sempre disparava para o fundo branco.
             Agora exige que o pixel NÃO seja branco — igual ao calcCobertura. */
          const pidx = (cy * oc.width + cx) * 4;
          const r = pixels[pidx], g = pixels[pidx+1], b = pixels[pidx+2], a = pixels[pidx+3];
          if (a > 60 && !(r > 240 && g > 240 && b > 240)) { found = true; break outer; }
        }
      if (found) { alturas[sx] = sy; break; }
    }
  }

  /* Interpola buracos internos */
  const GAP_MAX = 40;
  let gapStart = -1;
  for (let sx = 0; sx <= pw; sx++) {
    const vazio = sx === pw || alturas[sx] >= ph;
    if (!vazio && gapStart >= 0) {
      const yL = gapStart > 0 ? alturas[gapStart-1] : alturas[sx];
      const yR = alturas[sx], tam = sx - gapStart;
      if (tam <= GAP_MAX)
        for (let g = 0; g < tam; g++)
          alturas[gapStart+g] = yL + (yR-yL)*(g/tam);
      gapStart = -1;
    } else if (vazio && gapStart < 0) { gapStart = sx; }
  }

  /* Propaga bordas para cobrir os primeiros/últimos pixels do gap */
  let first = -1, last = -1;
  for (let sx = 0; sx < pw; sx++) { if (alturas[sx] < ph) { first = sx; break; } }
  for (let sx = pw-1; sx >= 0; sx--) { if (alturas[sx] < ph) { last = sx; break; } }
  if (first > 0)  for (let sx = 0; sx < first; sx++) alturas[sx] = alturas[first];
  if (last  >= 0) for (let sx = last+1; sx < pw; sx++) alturas[sx] = alturas[last];

  /* maxHy = hy do ponto mais baixo do tracado (maior Y = mais proximo do rodape).
     Ancorar ESSE ponto em chaoY garante que a ponte sempre toque o nivel das ilhas,
     independente de onde a crianca desenhou no canvas. */
  let maxHy = 0;
  for (let sx = 0; sx < pw; sx++)
    if (alturas[sx] < ph && alturas[sx] > maxHy) maxHy = alturas[sx];
  if (maxHy === 0) maxHy = ph - 2; /* fallback: sem desenho, usa quasi-fundo */

  /* FIX: Rampa suave nas margens (primeiros e últimos 20 px = margem do canvas).
     Garante que o início e o fim da ponte sempre partem do nível do chão (maxHy),
     independente de onde o usuário começou/terminou o traçado.
     Sem isso, pontes desenhadas no centro/topo do canvas ficam "flutuando" nas
     bordas e o personagem cai na água ao entrar nelas. */
  const MARGEM = 20;
  const hyFirst = alturas[MARGEM] < ph ? alturas[MARGEM] : maxHy;
  const hyLast  = alturas[pw - MARGEM - 1] < ph ? alturas[pw - MARGEM - 1] : maxHy;
  for (let sx = 0; sx < MARGEM; sx++) {
    const t = sx / MARGEM;
    alturas[sx] = maxHy + (hyFirst - maxHy) * t;
  }
  for (let sx = pw - MARGEM; sx < pw; sx++) {
    const t = (sx - (pw - MARGEM)) / MARGEM;
    alturas[sx] = hyLast + (maxHy - hyLast) * t;
  }

  return { alturas, pontePW: pw, pontePH: ph, maxHy };
}

/* superficieGap
   gy   = chaoY - maxHy  →  pixel mais baixo do tracado fica em chaoY
   sY   = gy + hy        →  superficie no pixel exato do tracado
   Fisica RENTE ao tracado: o personagem pisa no pixel desenhado. */
function superficieGap(gap, worldX) {
  if (!gap.ponteAlturas) return Infinity;
  const chaoY = aguaY() - 72;
  const pw = gap.pontePW, ph = gap.pontePH;
  const localX = Math.max(0, Math.min(pw-1, worldX - (gap.x - 20)));
  const ix = Math.floor(localX);
  const hy = gap.ponteAlturas[ix];
  if (hy >= ph) return Infinity;
  const gy = chaoY - gap.ponteMaxHy;   /* ancora o ponto mais baixo em chaoY */
  return gy + hy;                       /* superficie = posicao exata do pixel */
}


/* ════════════════════════════════════════════
   FÍSICA
════════════════════════════════════════════ */
function atualizarPersonagem() {
  if (estado.modalAberto || estado.vitoria) return;

  const tecs  = estado.teclas;
  const esq   = tecs['ArrowLeft']  || tecs['KeyA'];
  const dir   = tecs['ArrowRight'] || tecs['KeyD'];
  const pulo  = tecs['ArrowUp']    || tecs['KeyW'] || tecs['Space'];

  if (dir)       { estado.vx = VELOCIDADE;  estado.viradoDireita = true;  estado.correndo = true; }
  else if (esq)  { estado.vx = -VELOCIDADE; estado.viradoDireita = false; estado.correndo = true; }
  else           { estado.vx *= 0.80; estado.correndo = false; }

  if (pulo && estado.noChao) { estado.vy = PULO; estado.noChao = false; }

  estado.vy += GRAVIDADE;
  estado.px += estado.vx;
  estado.py += estado.vy;

  /* Limites do mundo */
  if (estado.px < 0) { estado.px = 0; estado.vx = 0; }
  if (estado.px > MUNDO_W - SPRITE_W) { estado.px = MUNDO_W - SPRITE_W; estado.vx = 0; }

  const centroX   = estado.px + SPRITE_W / 2;
  /* posição dos pés NO FRAME ANTERIOR (antes de aplicar vy) */
  const prevFeetY = estado.py + SPRITE_H - estado.vy;
  estado.noChao   = false;

  /* ── Colisão com ilhas — swept detection ── */
  for (const ilha of ilhas) {
    const chao = aguaY() - ilha.h;
    const sobreIlha = estado.px + SPRITE_W > ilha.x + 4 && estado.px < ilha.x + ilha.w - 4;
    /* Cruzou a superfície este frame (independente da velocidade) */
    if (sobreIlha && estado.vy >= 0 && estado.py + SPRITE_H >= chao && prevFeetY <= chao + 4) {
      estado.py    = chao - SPRITE_H;
      estado.vy    = 0;
      estado.noChao = true;

      /* Chegou numa nova ilha? */
      if (ilha.index > estado.ilhaAtual) {
        const anterior = estado.ilhaAtual;
        estado.ilhaAtual = ilha.index;
        estado.pontos   += 20;
        /* Marca gap anterior como cruzado */
        if (ilha.index > 0) gaps[ilha.index - 1].cruzado = true;
        /* Última ilha → vitória */
        if (estado.ilhaAtual === TOTAL_ILHAS - 1) {
          setTimeout(mostrarVitoria, 800);
        }
        /* Gerenciamento de chuva na transição de ilha:
           - Se a nova ilha é um ponto de início de chuva → encerra estado anterior e começa nova chuva (novo abrigo necessário)
           - Caso contrário → mantém o estado atual intacto (clima e abrigo não mudam)
           Isso evita a oscilação de parar/reiniciar a chuva em cada travessia. */
        if (ILHAS_INICIO_CHUVA.has(estado.ilhaAtual) && !estado.vitoria) {
          if (estado.chuvaAtiva) encerrarChuva();
          setTimeout(iniciarChuva, 600);
        }
        /* Ilhas não listadas: o clima (sol ou chuva+abrigo) persiste normalmente */
      }
    }
  }

  /* ── Colisão com pontes — superfície rente ao traçado ── */
  for (const gap of gaps) {
    if (!gap.temPonte) continue;
    /* Cobre desde o início do gap até o fim, com margem */
    if (centroX < gap.x - SPRITE_W || centroX > gap.x + gap.w + SPRITE_W) continue;

    /* BUG FIX: amostrar pé esquerdo, centro e pé direito — usa a superfície
       mais alta (menor Y) entre os três. Antes só centroX era checado,
       causando queda nas bordas laterais da ponte. */
    const xPeEsq   = estado.px + 8;
    const xPeDir   = estado.px + SPRITE_W - 8;
    const sYEsq    = superficieGap(gap, xPeEsq);
    const sYCentro = superficieGap(gap, centroX);
    const sYDir    = superficieGap(gap, xPeDir);
    let sY = Infinity;
    if (sYEsq    !== Infinity) sY = Math.min(sY, sYEsq);
    if (sYCentro !== Infinity) sY = Math.min(sY, sYCentro);
    if (sYDir    !== Infinity) sY = Math.min(sY, sYDir);
    if (sY === Infinity) continue;

    /* BUG FIX: swept detection igual à colisão com ilhas.
       prevFeetY <= sY + 8 garante que o personagem vinha DE CIMA da
       superfície no frame anterior, impedindo snap incorreto vindo de baixo. */
    if (estado.py + SPRITE_H >= sY && prevFeetY <= sY + 8 && estado.vy >= 0) {
      estado.py     = sY - SPRITE_H;
      estado.vy     = 0;
      estado.noChao = true;
    }
  }

  /* ── Caiu na água ── */
  if (estado.py + SPRITE_H > aguaY() + 80) {
    const il = ilhas[estado.ilhaAtual];
    estado.px = il.x + il.w - SPRITE_W - 10;
    estado.py = chaoIlha(estado.ilhaAtual) - SPRITE_H;
    estado.vy = 0; estado.vx = 0; estado.noChao = true;
    mostrarDica('💦 Cuidado com o rio! Traverse pela sua ponte! 🌊', 2500);
    spawnSplash(centroX - estado.camera, aguaY() - 20);
    /* Garante que o botão do abrigo apareça se ainda é necessário */
    if (estado.chuvaAtiva && !estado.temAbrigo && !estado.modalAberto) {
      btnAbrirAbrigo.classList.add('visivel');
      btnAbrirAbrigo.setAttribute('aria-hidden', 'false');
    }
  }

  /* ── Rede de segurança: garante botão do abrigo sempre visível quando necessário ── */
  if (estado.chuvaAtiva && !estado.temAbrigo && !estado.modalAberto &&
      !btnAbrirAbrigo.classList.contains('visivel')) {
    btnAbrirAbrigo.classList.add('visivel');
    btnAbrirAbrigo.setAttribute('aria-hidden', 'false');
  }

  /* ── Câmera ── */
  const alvo = Math.max(0, Math.min(estado.px - canvas.width * 0.38, MUNDO_W - canvas.width));
  estado.camera += (alvo - estado.camera) * 0.10;

  /* ── Animação de corrida ── */
  if (estado.correndo && estado.noChao) {
    estado.animTimer++;
    if (estado.animTimer > 8) { estado.animFrame = (estado.animFrame + 1) % 4; estado.animTimer = 0; }
  } else if (!estado.correndo) { estado.animFrame = 0; }

  /* ── Detectar proximidade ao próximo gap ── */
  verificarProximidadePonte();
}

function verificarProximidadePonte() {
  const gIdx = estado.ilhaAtual;
  if (gIdx >= gaps.length) return;
  const gap  = gaps[gIdx];
  if (gap.cruzado) return;
  const dist = gap.x - (estado.px + SPRITE_W);
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
   SPLASH NA ÁGUA
════════════════════════════════════════════ */
function spawnSplash(sx, sy) {
  const el = document.createElement('div');
  el.className = 'splash-agua'; el.textContent = '💦';
  el.style.left = (sx - 18) + 'px'; el.style.top = (sy - 20) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

/* ════════════════════════════════════════════
   RENDERIZAÇÃO
════════════════════════════════════════════ */
function desenharCenario(t) {
  const cam = estado.camera, W = canvas.width, H = canvas.height;
  const ay   = aguaY();
  ctx.clearRect(0, 0, W, H);

  /* Céu */
  const gradCeu = ctx.createLinearGradient(0, 0, 0, ay);
  if (estado.chuvaAtiva && !estado.temAbrigo) {
    gradCeu.addColorStop(0, '#3A5E7A'); gradCeu.addColorStop(1, '#6A9AB8');
  } else {
    gradCeu.addColorStop(0, '#A8E6FF'); gradCeu.addColorStop(1, '#D4F5FF');
  }
  ctx.fillStyle = gradCeu; ctx.fillRect(0, 0, W, ay);

  /* Nuvens (dia ensolarado) */
  if (!estado.chuvaAtiva) {
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    [[0.15,0.12,55],[0.42,0.08,70],[0.68,0.16,48],[0.85,0.1,60]].forEach(([rx,ry,r]) => {
      const cx2 = rx * W - cam * 0.05, cy2 = ry * H;
      ctx.beginPath();
      ctx.arc(cx2, cy2, r, 0, Math.PI*2);
      ctx.arc(cx2 + r*0.9, cy2 - r*0.3, r*0.75, 0, Math.PI*2);
      ctx.arc(cx2 - r*0.7, cy2 - r*0.2, r*0.65, 0, Math.PI*2);
      ctx.fill();
    });
  }

  /* Água */
  const gradAgua = ctx.createLinearGradient(0, ay, 0, H);
  gradAgua.addColorStop(0, '#29C6D8'); gradAgua.addColorStop(0.4, '#1A8FA0'); gradAgua.addColorStop(1, '#0D4D5A');
  ctx.fillStyle = gradAgua; ctx.fillRect(0, ay, W, H - ay);

  /* Ondas */
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) {
    const wy = ay + 12 + i * 14;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 30) {
      const wx = x + cam * (0.6 + i * 0.1);
      ctx.lineTo(x, wy + Math.sin((wx + t * 40) * 0.04) * 4);
    }
    ctx.stroke();
  }

  /* Ilhas */
  ilhas.forEach(ilha => {
    const ix = ilha.x - cam;
    if (ix + ilha.w < -20 || ix > W + 20) return;
    const iy = ay - ilha.h;

    /* Sombra */
    ctx.fillStyle = 'rgba(0,80,100,0.22)';
    ctx.beginPath(); ctx.ellipse(ix + ilha.w/2, ay + 6, ilha.w/2 + 8, 10, 0, 0, Math.PI*2); ctx.fill();

    /* Terra */
    const gradIlha = ctx.createLinearGradient(0, iy, 0, ay);
    gradIlha.addColorStop(0, '#5BBF6A'); gradIlha.addColorStop(0.35, '#3D9E50'); gradIlha.addColorStop(1, '#2C6E38');
    ctx.fillStyle = gradIlha;
    ctx.beginPath(); ctx.roundRect(ix, iy, ilha.w, ilha.h, [10, 10, 0, 0]); ctx.fill();

    /* Grama */
    ctx.fillStyle = '#7AD67A';
    ctx.beginPath(); ctx.roundRect(ix, iy, ilha.w, 10, [10, 10, 0, 0]); ctx.fill();

    /* Decoração */
    const dec = decorIlhas[ilha.index];
    dec.arvores.forEach(a => {
      const ax = ix + a.relX * ilha.w;
      ctx.font = '28px serif'; ctx.textAlign = 'center';
      ctx.fillText(a.emoji, ax, iy - 4);
    });
    dec.flores.forEach(f => {
      const fx = ix + f.relX * ilha.w;
      const fy = iy + 2 + Math.sin(t * 0.05 + f.off) * 1.2;
      ctx.font = '14px serif'; ctx.textAlign = 'center';
      ctx.fillText(f.emoji, fx, fy);
    });

    /* ── Bandeira de chegada na última ilha ── */
    if (ilha.index === TOTAL_ILHAS - 1) {
      const bx  = ix + ilha.w - 38;   /* posição X do poste */
      const by  = iy - 68;            /* topo do poste      */
      const ph2 = 68;                 /* altura do poste    */

      /* Poste */
      ctx.save();
      ctx.strokeStyle = '#8D6E63';
      ctx.lineWidth   = 4;
      ctx.lineCap     = 'round';
      ctx.beginPath();
      ctx.moveTo(bx, by + ph2);
      ctx.lineTo(bx, by);
      ctx.stroke();

      /* Bandeira (triângulo) — ondula usando tick */
      const wag  = Math.sin(t * 0.07) * 3;
      const flag = new Path2D();
      flag.moveTo(bx,      by);
      flag.lineTo(bx + 30, by + 9  + wag);
      flag.lineTo(bx,      by + 20);
      flag.closePath();
      ctx.fillStyle = '#FF4444';
      ctx.fill(flag);
      /* Listra branca diagonal */
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth   = 2;
      ctx.beginPath();
      ctx.moveTo(bx + 4,  by + 3);
      ctx.lineTo(bx + 26, by + 8 + wag);
      ctx.stroke();

      /* Brilho animado ao redor do poste quando vitória próxima */
      if (estado.ilhaAtual >= TOTAL_ILHAS - 2) {
        const pulse = 0.4 + 0.35 * Math.abs(Math.sin(t * 0.05));
        ctx.save();
        ctx.globalAlpha = pulse;
        ctx.font = '22px serif'; ctx.textAlign = 'center';
        ctx.fillText('✨', bx + 14, by - 8);
        ctx.restore();
      }

      ctx.restore();
    }
  });

  /* Pontes desenhadas */
  gaps.forEach(gap => {
    if (!gap.temPonte || !gap.ponteImg) return;
    const chaoY = ay - 72;
    const gx = gap.x - cam - 20;
    /* gy usa o mesmo ancoro da fisica: ponto mais baixo do tracado em chaoY */
    const gy = chaoY - gap.ponteMaxHy;
    ctx.save(); ctx.globalAlpha = 0.95;
    ctx.drawImage(gap.ponteImg, gx, gy, gap.pontePW, gap.pontePH);
    ctx.restore();
  });

  /* Abrigo sobre o personagem */
  if (estado.temAbrigo && estado.abrigoImg) {
    const px2 = estado.px - cam;
    const ah = 70, aw = ah * (estado.abrigoImg.width / estado.abrigoImg.height);
    ctx.save(); ctx.globalAlpha = 0.9;
    ctx.drawImage(estado.abrigoImg, px2 + SPRITE_W/2 - aw/2, estado.py - ah - 4, aw, ah);
    ctx.restore();
  }
}

function desenharPersonagem() {
  const px2 = Math.round(estado.px - estado.camera);
  const py2 = Math.round(estado.py);

  /* Sombra */
  ctx.beginPath();
  ctx.ellipse(px2 + SPRITE_W/2, aguaY() - ilhas[estado.ilhaAtual]?.h + 5 || aguaY() - 72 + 5,
              SPRITE_W/2 * 0.6, 5, 0, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fill();

  ctx.save();
  if (!estado.viradoDireita) {
    ctx.translate(px2 + SPRITE_W, 0); ctx.scale(-1, 1); ctx.translate(-px2, 0);
  }
  let bounce = 0;
  if (estado.correndo && estado.noChao)
    bounce = Math.sin(estado.animFrame * Math.PI / 2) * 2;
  let scaleY = 1;
  if (!estado.noChao) scaleY = estado.vy < 0 ? 1.14 : 0.9;

  ctx.translate(px2 + SPRITE_W/2, py2 + SPRITE_H/2);
  ctx.rotate(bounce * 0.04);
  ctx.scale(1, scaleY);
  ctx.translate(-(px2 + SPRITE_W/2), -(py2 + SPRITE_H/2));

  if (estado.personagemImg) {
    ctx.drawImage(estado.personagemImg, px2, py2, SPRITE_W, SPRITE_H);
  } else {
    ctx.font = `${SPRITE_H}px serif`; ctx.textAlign = 'center';
    ctx.fillText('🤖', px2 + SPRITE_W/2, py2 + SPRITE_H);
  }
  ctx.restore();
}

function desenharHUD() {
  ctx.save();
  ctx.font = "bold 18px 'Nunito', sans-serif";
  ctx.fillStyle = '#1A3A3A'; ctx.textAlign = 'right'; ctx.textBaseline = 'top';
  ctx.fillText('⭐ ' + estado.pontos, canvas.width - 14, 54);
  ctx.restore();
}

function desenharControles() {
  const itens = [
    { icone: '←', label: 'Esquerda' },
    { icone: '→', label: 'Direita'  },
    { icone: '↑', label: 'Pular'    },
  ];
  const pad = 12, itemH = 30, bW = 165;
  const bH  = itens.length * itemH + pad * 2 + 20;
  const bX  = 12, bY = 56;
  ctx.save();
  ctx.globalAlpha = 0.85; ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.roundRect(bX, bY, bW, bH, 12); ctx.fill();
  ctx.globalAlpha = 0.7; ctx.strokeStyle = '#29C6D8'; ctx.lineWidth = 2; ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.font = "bold 11px 'Nunito', sans-serif"; ctx.fillStyle = '#1A8FA0';
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText('CONTROLES', bX + pad, bY + pad);
  itens.forEach((item, i) => {
    const cy = bY + pad + 20 + i * itemH, cx = bX + pad;
    const isPular = i === 2;
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = isPular ? '#FDE98A' : '#f0f0f0';
    ctx.beginPath(); ctx.roundRect(cx, cy + 2, 24, 22, 5); ctx.fill();
    ctx.strokeStyle = isPular ? '#C9A500' : '#ccc'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.font = "bold 14px 'Nunito', sans-serif";
    ctx.fillStyle = isPular ? '#7a5500' : '#333';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(item.icone, cx + 12, cy + 13);
    ctx.font = "bold 12px 'Nunito', sans-serif";
    ctx.fillStyle = '#3A3530'; ctx.textAlign = 'left';
    ctx.fillText(item.label, cx + 32, cy + 13);
  });
  ctx.restore();
}

/* ════════════════════════════════════════════
   LOOP PRINCIPAL
════════════════════════════════════════════ */
let tick = 0, pausado = false, rodando = true;

function loop() {
  if (!rodando || pausado) return;
  tick++;
  atualizarPersonagem();
  desenharCenario(tick);
  desenharPersonagem();
  desenharHUD();
  desenharControles();
  /* Olhos do Pingo */
  atualizarOlhosPingo(
    estado.px - estado.camera + SPRITE_W / 2,
    estado.py + SPRITE_H / 2
  );
  requestAnimationFrame(loop);
}

/* ════════════════════════════════════════════
   MODAIS DE DESENHO
════════════════════════════════════════════ */
let corAtual = '#4E342E', espAtual = 9;
let ctxPonte = null, ctxAbrigo = null;
let desenhando = false, ultX = 0, ultY = 0;

function getPos(e, cv) {
  const r = cv.getBoundingClientRect();
  const src = e.touches ? e.touches[0] : e;
  return { x: (src.clientX - r.left) * (cv.width / r.width),
           y: (src.clientY - r.top)  * (cv.height / r.height) };
}

function inicCanvas(cv) {
  const c = cv.getContext('2d');
  c.clearRect(0, 0, cv.width, cv.height);
  c.fillStyle = '#fff'; c.fillRect(0, 0, cv.width, cv.height);
  return c;
}

function bindDesenho(cv, getCtx) {
  function ini(e) {
    desenhando = true; e.preventDefault();
    const p = getPos(e, cv); ultX = p.x; ultY = p.y;
    const c = getCtx();
    c.beginPath(); c.arc(p.x, p.y, espAtual/2, 0, Math.PI*2);
    c.fillStyle = corAtual; c.fill();
    cv.closest('.modal-canvas-wrap').querySelector('.modal-canvas-dica').style.opacity = '0';
  }
  function mov(e) {
    if (!desenhando) return; e.preventDefault();
    const p = getPos(e, cv), c = getCtx();
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

/* Cores e espessuras */
[modalPonte, modalAbrigo].forEach(modal => {
  modal.querySelectorAll('.modal-cor').forEach(btn =>
    btn.addEventListener('click', function() {
      modal.querySelectorAll('.modal-cor').forEach(b => b.classList.remove('ativo'));
      this.classList.add('ativo'); corAtual = this.dataset.cor;
    }));
  modal.querySelectorAll('.modal-esp').forEach(btn =>
    btn.addEventListener('click', function() {
      modal.querySelectorAll('.modal-esp').forEach(b => b.classList.remove('ativo'));
      this.classList.add('ativo'); espAtual = parseInt(this.dataset.esp);
    }));
});

document.getElementById('btnLimparPonte').addEventListener('click', () => {
  ctxPonte = inicCanvas(canvasPonte);
  canvasPonte.closest('.modal-canvas-wrap').querySelector('.modal-canvas-dica').style.opacity = '1';
});
document.getElementById('btnLimparAbrigo').addEventListener('click', () => {
  ctxAbrigo = inicCanvas(canvasAbrigo);
  canvasAbrigo.closest('.modal-canvas-wrap').querySelector('.modal-canvas-dica').style.opacity = '1';
});

function fecharModalPonte() {
  modalPonte.classList.remove('visivel'); modalPonte.setAttribute('aria-hidden', 'true');
  estado.modalAberto = false;
}
function fecharModalAbrigo() {
  modalAbrigo.classList.remove('visivel'); modalAbrigo.setAttribute('aria-hidden', 'true');
  estado.modalAberto = false;
  /* Se ainda está chovendo e sem abrigo → recoloca o botão */
  if (estado.chuvaAtiva && !estado.temAbrigo) {
    btnAbrirAbrigo.classList.add('visivel');
    btnAbrirAbrigo.setAttribute('aria-hidden', 'false');
  }
}

document.getElementById('btnCancelarPonte').addEventListener('click',  fecharModalPonte);
document.getElementById('btnCancelarAbrigo').addEventListener('click', fecharModalAbrigo);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (modalPonte.classList.contains('visivel'))  fecharModalPonte();
    if (modalAbrigo.classList.contains('visivel')) fecharModalAbrigo();
  }
});

let gapAlvo = -1;
btnAbrirPonte.addEventListener('click',                                     () => abrirModalPonte(gapAlvo));
document.getElementById('btnDesenharPonte').addEventListener('click',       () => abrirModalPonte(gapAlvo));
document.getElementById('btnDesenharAbrigo').addEventListener('click',          abrirModalAbrigo);
btnAbrirAbrigo.addEventListener('click',                                        abrirModalAbrigo);

function abrirModalPonte(gIdx) {
  if (gIdx < 0 || gaps[gIdx].cruzado) return;
  if (estado.chuvaAtiva && !estado.temAbrigo) {
    mostrarDica('☔ Desenhe um abrigo primeiro!', 2500); return;
  }
  gapAlvo = gIdx;
  estado.modalAberto = true;
  corAtual = '#4E342E'; espAtual = 9;
  modalPonte.querySelectorAll('.modal-cor').forEach((b,i) => b.classList.toggle('ativo', i===0));
  modalPonte.querySelectorAll('.modal-esp').forEach((b,i) => b.classList.toggle('ativo', i===1));
  ctxPonte = inicCanvas(canvasPonte);
  canvasPonte.closest('.modal-canvas-wrap').querySelector('.modal-canvas-dica').style.opacity = '1';
  const falas = [
    'Tem um rio na frente! 🌊<br>Desenhe uma <strong>ponte</strong> e caminhe até a outra margem!',
    'Mais um rio! 💪<br>Desenhe sua <strong>ponte</strong> e atravesse!',
    'A chuva parou! 🌈<br>Agora desenhe a <strong>ponte</strong> e cruze!',
    'Quase lá! ⭐<br>Mais uma <strong>ponte</strong> e você chega!',
    'Penúltima! 🎉<br>Capricha na <strong>ponte</strong>!',
    'A última! 🏁<br>Você consegue cruzar!',
  ];
  document.getElementById('falaModalPonte').innerHTML = falas[Math.min(gIdx, falas.length-1)];
  modalPonte.classList.add('visivel'); modalPonte.setAttribute('aria-hidden', 'false');
  btnAbrirPonte.classList.remove('visivel'); btnAbrirPonte.setAttribute('aria-hidden', 'true');
}

function abrirModalAbrigo() {
  estado.modalAberto = true;
  corAtual = '#3A3530'; espAtual = 9;
  modalAbrigo.querySelectorAll('.modal-cor').forEach((b,i) => b.classList.toggle('ativo', i===0));
  modalAbrigo.querySelectorAll('.modal-esp').forEach((b,i) => b.classList.toggle('ativo', i===1));
  ctxAbrigo = inicCanvas(canvasAbrigo);
  canvasAbrigo.closest('.modal-canvas-wrap').querySelector('.modal-canvas-dica').style.opacity = '1';
  const falas = [
    'Está <strong>chovendo</strong>! ☔<br>Desenhe um <strong>guarda-chuva</strong> para me proteger!',
    'Chuva de novo! 😮<br>Que tal uma proteção <strong>diferente</strong> desta vez?',
    'Mais chuva! ⚡<br>Pode ser <strong>o que quiser</strong> — desde que proteja!',
    'Tá chovendo demais! 🌧️<br><strong>Você decide</strong> o que desenhar!',
    'A última chuva! 🌈<br>Desenhe sua melhor proteção!',
  ];
  /* Descobre qual evento de chuva é este para variar a fala */
  const ordemChuva = [...ILHAS_INICIO_CHUVA].sort((a,b)=>a-b);
  const idxEvento  = ordemChuva.indexOf(estado.ilhaAtual);
  const idx = Math.max(0, Math.min(idxEvento >= 0 ? idxEvento : 0, falas.length-1));
  document.getElementById('falaModalAbrigo').innerHTML = falas[idx];
  modalAbrigo.classList.add('visivel'); modalAbrigo.setAttribute('aria-hidden', 'false');
  btnAbrirAbrigo.classList.remove('visivel'); btnAbrirAbrigo.setAttribute('aria-hidden', 'true');
}

/* Confirmar ponte — constrói heightmap real, sem teleporte */
document.getElementById('btnConfirmarPonte').addEventListener('click', () => {
  const gap = gaps[gapAlvo];
  if (!gap) { fecharModalPonte(); return; }
  const cobertura = calcCobertura(canvasPonte);
  if (cobertura < 0.03) {
    const btn = document.getElementById('btnConfirmarPonte');
    btn.style.transform = 'translateX(-6px)';
    setTimeout(() => btn.style.transform = 'translateX(6px)', 80);
    setTimeout(() => btn.style.transform = '', 160);
    mostrarDica('✏️ Desenhe um pouquinho mais!', 2000);
    return;
  }
  /* Constrói heightmap */
  const hm = construirHeightmap(canvasPonte, gap.w);
  gap.ponteAlturas = hm.alturas;
  gap.pontePW      = hm.pontePW;
  gap.pontePH      = hm.pontePH;
  gap.ponteMaxHy   = hm.maxHy;
  gap.temPonte     = true;
  estado.pontos   += 10;  /* 10 pts por desenho */
  canvasParaBitmap(canvasPonte).then(bmp => { gap.ponteImg = bmp; });
  fecharModalPonte();   /* FIX: fecha o canvas de desenho automaticamente */
  mostrarDica('🌉 Ponte construída! Agora atravesse caminhando! 🏃', 3000);
  btnAbrirPonte.classList.remove('visivel'); btnAbrirPonte.setAttribute('aria-hidden', 'true');
});

/* Confirmar abrigo */
document.getElementById('btnConfirmarAbrigo').addEventListener('click', () => {
  if (calcCobertura(canvasAbrigo) < 0.03) {
    const btn = document.getElementById('btnConfirmarAbrigo');
    btn.style.transform = 'translateX(-6px)';
    setTimeout(() => btn.style.transform = 'translateX(6px)', 80);
    setTimeout(() => btn.style.transform = '', 160);
    mostrarDica('✏️ Desenhe um pouquinho mais!', 2000);
    return;
  }
  canvasParaBitmap(canvasAbrigo).then(bmp => {
    fecharModalAbrigo();
    setTimeout(() => ativarAbrigo(bmp), 300);
  });
});

/* ════════════════════════════════════════════
   UTILITÁRIOS DE CANVAS
════════════════════════════════════════════ */
function calcCobertura(cv) {
  const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
  let col = 0;
  for (let i = 0; i < d.length; i += 4)
    if (d[i] < 240 || d[i+1] < 240 || d[i+2] < 240) col++;
  return col / (cv.width * cv.height);
}

function canvasParaBitmap(cv) {
  const oc = document.createElement('canvas');
  oc.width = cv.width; oc.height = cv.height;
  const octx = oc.getContext('2d');
  const src = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height);
  const out = octx.createImageData(cv.width, cv.height);
  for (let i = 0; i < src.data.length; i += 4) {
    const branco = src.data[i] > 240 && src.data[i+1] > 240 && src.data[i+2] > 240;
    out.data[i]   = src.data[i];   out.data[i+1] = src.data[i+1];
    out.data[i+2] = src.data[i+2]; out.data[i+3] = branco ? 0 : src.data[i+3];
  }
  octx.putImageData(out, 0, 0);
  return createImageBitmap(oc);
}

/* ════════════════════════════════════════════
   DICA / BALÃO
════════════════════════════════════════════ */
let dicaTimer = null;
function mostrarDica(msg, ms = 3000) {
  dicaBalao.innerHTML = msg;
  dicaBalao.classList.remove('oculto');
  clearTimeout(dicaTimer);
  dicaTimer = setTimeout(() => dicaBalao.classList.add('oculto'), ms);
}

/* ════════════════════════════════════════════
   PAUSE
════════════════════════════════════════════ */
const btnPause     = document.getElementById('btnPause');
const menuPause    = document.getElementById('menuPause');
const btnContinuar = document.getElementById('btnContinuar');

btnPause.addEventListener('click', () => {
  pausado = true;
  menuPause.style.display = 'flex';
});
btnContinuar.addEventListener('click', () => {
  pausado = false;
  menuPause.style.display = 'none';
  requestAnimationFrame(loop);
});
document.getElementById('volumeJogo')?.addEventListener('input', e => {
  /* volume handled globally if needed */
});

/* ════════════════════════════════════════════
   VITÓRIA
════════════════════════════════════════════ */
function mostrarVitoria() {
  estado.vitoria = true;
  rodando = false;
  const tv = document.getElementById('telaVitoria');
  document.getElementById('vitoriaPontos').textContent = '⭐ ' + estado.pontos + ' pontos';
  /* Mensagem sempre positiva — 3 estrelas sempre aparecem */
  document.getElementById('vitoriaMensagem').textContent = '🎉 Parabéns! Você cruzou todos os rios! 🌊🏝️';

  /* Mostra a tela primeiro; só então anima as estrelas com a classe correta (.acesa).
     O CSS tem transform: scale(0.3) → scale(1) + bounce, que precisa da classe. */
  setTimeout(() => {
    tv.style.display = 'flex';
    ['estrelaV1','estrelaV2','estrelaV3'].forEach((id, i) => {
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.classList.add('acesa');
      }, 200 + i * 380);   /* 200 ms, 580 ms, 960 ms depois da tela aparecer */
    });
  }, 400);
}

/* ════════════════════════════════════════════
   INICIAR
════════════════════════════════════════════ */
function iniciar() {
  telaCarregando.style.display = 'none';
  const il = ilhas[0];
  estado.px = il.x + 40;
  estado.py = chaoIlha(0) - SPRITE_H;
  estado.vy = 0; estado.noChao = true;
  setTimeout(() => mostrarDica('🏝️ Desenhe pontes para cruzar cada rio!', 4000), 800);
  requestAnimationFrame(loop);
}

carregarPersonagem();
