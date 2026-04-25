/* =============================================
   DESENHA MUNDO — FASE 2
   "O Crepúsculo"

   ENREDO: O 1º pedaço do Lápis Mágico caiu
   no Reino do Pôr do Sol. Pingo e o herói
   chegam ao meio do caminho e se deparam
   com um BURACO GIGANTE — impossível de
   pular. O jogador precisa DESENHAR uma ponte
   no canvas: o traçado vira PNG transparente
   e aparece no jogo como uma ponte real.

   MECÂNICA CENTRAL:
   • Buraco longo no meio do mundo (400px)
   • Ao chegar perto: botão flutuante aparece
   • Clicar abre o modal de desenho
   • Desenha → confirma → PNG sem fundo
     é renderizado no chão do buraco
   • Personagem pode então atravessar
============================================= */

const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

function redimensionar() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
redimensionar();
window.addEventListener('resize', redimensionar);

/* ════════════════════════════════════════════
   ESTADO
════════════════════════════════════════════ */
const estado = {
  personagemImg:  null,
  ponteImg:       null,   /* ImageBitmap PNG transparente da ponte desenhada */
  ponteAlturas:   null,   /* Float32Array — heightmap de colisão do desenho    */
  pontePW:        0,      /* largura em px do desenho escalado no jogo         */
  pontePH:        0,      /* altura em px do desenho escalado no jogo          */
  px:0, py:0, vx:0, vy:0,
  noChao:         true,
  viradoDireita:  true,
  animFrame:0, animTimer:0,
  camera:0,
  teclas:{},
  correndo:       false,
  mundoLargura:   5200,
  buracoResolvido:false,
  modalAberto:    false,
};

const SPRITE_W   = 72;
const SPRITE_H   = 72;
const VELOCIDADE = 3.4;
const GRAVIDADE  = 0.56;
const PULO       = -13;

/* Buraco: começa em x=2200, largura 400 — intransponível com pulo */
const BURACO_X   = 2200;
const BURACO_W   = 400;
const BURACO_TRIGGER = 320; /* distância para mostrar o botão */

const META_X = 4950;

/* ════════════════════════════════════════════
   CARREGAR PERSONAGEM (traços → PNG sem fundo)
════════════════════════════════════════════ */
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

/* Reconstrói o sprite a partir dos traços — canvas SEM fundo = PNG transparente */
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
    for (let i = 1; i < t.pontos.length; i++) octx.lineTo(t.pontos[i].x, t.pontos[i].y);
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

/* ════════════════════════════════════════════
   CENÁRIO — PÔR DO SOL
════════════════════════════════════════════ */
const MUNDO_W = estado.mundoLargura;
function lerp(a,b,t){ return a+(b-a)*t; }

const estrelas = Array.from({length:80},()=>({
  x:Math.random()*MUNDO_W, y:10+Math.random()*(window.innerHeight*0.38),
  r:0.6+Math.random()*1.8, fase:Math.random()*Math.PI*2,
}));
const brasas = Array.from({length:35},()=>({
  x:Math.random()*MUNDO_W, y:50+Math.random()*300,
  r:1.5+Math.random()*2.5, vel:0.3+Math.random()*0.5,
  fase:Math.random()*Math.PI*2, alpha:0.4+Math.random()*0.5,
}));
const nuvens = Array.from({length:16},()=>({
  x:Math.random()*MUNDO_W, y:40+Math.random()*120,
  r:30+Math.random()*50, alpha:0.35+Math.random()*0.35,
  cor:['#FF6B35','#FF9A5C','#C84B6E','#FF7B8A','#FFB347'][Math.floor(Math.random()*5)],
}));
const arvores = Array.from({length:26},(_,i)=>({
  x:100+i*195+Math.random()*70, h:80+Math.random()*80, r:20+Math.random()*20,
}));
const arbustos = Array.from({length:40},(_,i)=>({
  x:60+i*120+Math.random()*50, r:14+Math.random()*12,
}));

const CHAO_Y = () => canvas.height - 110;

/* ── PLATAFORMAS — layout variado inspirado na Fase 1 ──────────────
   Duas zonas separadas pelo buraco (2200–2600).
   Alturas e larguras diversificadas para criar puzzles de pulo.
─────────────────────────────────────────────────────────────────── */
const plataformas = [
  /* ── Zona esquerda (antes do buraco) ── */
  { x:  310, y:()=>CHAO_Y()-100, w:140 },
  { x:  530, y:()=>CHAO_Y()-175, w:130 },
  { x:  730, y:()=>CHAO_Y()- 85, w:155 },
  { x:  950, y:()=>CHAO_Y()-210, w:120 },
  { x: 1130, y:()=>CHAO_Y()-140, w:160 },
  { x: 1320, y:()=>CHAO_Y()-260, w:110 },
  { x: 1490, y:()=>CHAO_Y()-185, w:145 },
  { x: 1690, y:()=>CHAO_Y()- 95, w:155 },
  { x: 1890, y:()=>CHAO_Y()-220, w:120 },
  { x: 2060, y:()=>CHAO_Y()-150, w:130 },

  /* ── buraco 2200–2600 — sem plataformas ── */

  /* ── Zona direita (após o buraco) ── */
  { x: 2700, y:()=>CHAO_Y()-115, w:150 },
  { x: 2910, y:()=>CHAO_Y()-195, w:130 },
  { x: 3100, y:()=>CHAO_Y()- 90, w:165 },
  { x: 3310, y:()=>CHAO_Y()-245, w:115 },
  { x: 3510, y:()=>CHAO_Y()-165, w:145 },
  { x: 3720, y:()=>CHAO_Y()-100, w:170 },
  { x: 3930, y:()=>CHAO_Y()-195, w:130 },
  { x: 4130, y:()=>CHAO_Y()-130, w:155 },
  { x: 4360, y:()=>CHAO_Y()-230, w:120 },
  { x: 4580, y:()=>CHAO_Y()-155, w:145 },
];

/* ── MOEDAS ─────────────────────────────────────────────────────────
   Uma moeda centrada acima de cada plataforma +
   moedas no chão ao longo do mundo (pulando a zona do buraco).
─────────────────────────────────────────────────────────────────── */
const moedas = [];
plataformas.forEach(p => {
  moedas.push({ x: p.x + p.w / 2, y: () => p.y() - 30, coletada: false });
});
for (let i = 0; i < 24; i++) {
  const mx = 200 + i * 195;
  if (mx >= BURACO_X - 60 && mx <= BURACO_X + BURACO_W + 60) continue;
  moedas.push({ x: mx, y: () => CHAO_Y() - 50, coletada: false });
}
let pontos=0;

/* ════════════════════════════════════════════
   MODAL DE DESENHO DA PONTE
════════════════════════════════════════════ */
const btnAbrirDesenho = document.getElementById('btnAbrirDesenho');
const modalPonte      = document.getElementById('modalPonte');
let canvasPonte, ctxPonte;
let desenhandoPonte=false, corPonte='#3A3530', espPonte=9, primPonte=true;
let tracosPonte=[];  /* guarda traços para PNG sem fundo */
let tracoPonteAtual=null;

function mostrarBotaoDesenho() {
  if(estado.buracoResolvido||estado.modalAberto) return;
  btnAbrirDesenho.classList.add('visivel');
  btnAbrirDesenho.setAttribute('aria-hidden','false');
}
function esconderBotaoDesenho() {
  btnAbrirDesenho.classList.remove('visivel');
  btnAbrirDesenho.setAttribute('aria-hidden','true');
}

function abrirModalPonte() {
  estado.modalAberto = true;
  esconderBotaoDesenho();
  modalPonte.setAttribute('aria-hidden','false');
  modalPonte.classList.add('visivel');
}
function fecharModalPonte() {
  modalPonte.classList.remove('visivel');
  modalPonte.setAttribute('aria-hidden','true');
  setTimeout(()=>{ estado.modalAberto=false; }, 400);
}

function iniciarModalPonte() {
  canvasPonte = document.getElementById('canvasPonte');
  ctxPonte    = canvasPonte.getContext('2d');
  ctxPonte.lineCap='round'; ctxPonte.lineJoin='round';
  /* SEM fillRect branco — fundo transparente desde o início */

  canvasPonte.addEventListener('mousedown',  iniTracoPonte);
  canvasPonte.addEventListener('mousemove',  contTracoPonte);
  canvasPonte.addEventListener('mouseup',    fimTracoPonte);
  canvasPonte.addEventListener('mouseleave', fimTracoPonte);
  canvasPonte.addEventListener('touchstart', e=>{e.preventDefault();iniTracoPonte(e.touches[0]);},{passive:false});
  canvasPonte.addEventListener('touchmove',  e=>{e.preventDefault();contTracoPonte(e.touches[0]);},{passive:false});
  canvasPonte.addEventListener('touchend',   e=>{e.preventDefault();fimTracoPonte();},{passive:false});

  document.querySelectorAll('.modal-cor').forEach(btn=>{
    btn.addEventListener('click',function(){
      document.querySelectorAll('#modalPonte .modal-cor').forEach(b=>b.classList.remove('ativo'));
      this.classList.add('ativo'); corPonte=this.dataset.cor;
    });
  });
  document.querySelectorAll('#modalPonte .modal-esp').forEach(btn=>{
    btn.addEventListener('click',function(){
      document.querySelectorAll('#modalPonte .modal-esp').forEach(b=>b.classList.remove('ativo'));
      this.classList.add('ativo'); espPonte=parseInt(this.dataset.esp);
    });
  });
  document.getElementById('btnLimparPonte').addEventListener('click',()=>{
    ctxPonte.clearRect(0,0,canvasPonte.width,canvasPonte.height);
    tracosPonte=[]; primPonte=true;
    document.getElementById('dicaCanvasPonte').style.opacity='1';
  });

  document.getElementById('btnDesenharPonte').addEventListener('click', abrirModalPonte);
  document.getElementById('btnCancelarPonte').addEventListener('click',()=>{
    fecharModalPonte();
    /* se não resolveu, mostra o botão de novo */
    if(!estado.buracoResolvido) setTimeout(mostrarBotaoDesenho, 450);
  });
  document.getElementById('btnConfirmarPonte').addEventListener('click', confirmarPonte);
}

function posPonte(e){
  const rect=canvasPonte.getBoundingClientRect();
  return {
    x:(e.clientX-rect.left)*(canvasPonte.width/rect.width),
    y:(e.clientY-rect.top)*(canvasPonte.height/rect.height),
  };
}

function iniTracoPonte(e){
  desenhandoPonte=true;
  const pos=posPonte(e);
  if(primPonte){
    document.getElementById('dicaCanvasPonte').style.opacity='0';
    primPonte=false;
  }
  tracoPonteAtual={cor:corPonte,espessura:espPonte,pontos:[{x:pos.x,y:pos.y}]};
  ctxPonte.beginPath();
  ctxPonte.moveTo(pos.x,pos.y);
  ctxPonte.strokeStyle=corPonte; ctxPonte.lineWidth=espPonte;
}
function contTracoPonte(e){
  if(!desenhandoPonte||!tracoPonteAtual) return;
  const pos=posPonte(e);
  tracoPonteAtual.pontos.push({x:pos.x,y:pos.y});
  ctxPonte.lineTo(pos.x,pos.y); ctxPonte.stroke();
}
function fimTracoPonte(){
  if(!desenhandoPonte||!tracoPonteAtual) return;
  desenhandoPonte=false; ctxPonte.closePath();
  if(tracoPonteAtual.pontos.length>1) tracosPonte.push(tracoPonteAtual);
  tracoPonteAtual=null;
}

/**
 * Converte os traços em PNG com fundo 100% transparente.
 * Reconstrói em canvas offscreen SEM fillRect branco.
 * Exige mínimo de pixels coloridos para validar.
 */
function confirmarPonte(){
  /* Verifica pixels no canvas de preview */
  const dados=ctxPonte.getImageData(0,0,canvasPonte.width,canvasPonte.height).data;
  let coloridos=0;
  for(let i=0;i<dados.length;i+=24){
    if(dados[i+3]>120) coloridos++;
  }
  if(coloridos<80||tracosPonte.length===0){
    /* Pouco conteúdo — balança botão */
    const btn=document.getElementById('btnConfirmarPonte');
    btn.style.transform='translateX(-5px)';
    setTimeout(()=>{btn.style.transform='translateX(5px)';},80);
    setTimeout(()=>{btn.style.transform='translateX(0)';},160);
    const dica=document.getElementById('dicaCanvasPonte');
    dica.style.opacity='0.85'; dica.textContent='Desenhe mais! ✏️';
    setTimeout(()=>{dica.style.opacity='0';dica.textContent='✏️ Desenhe a ponte aqui!';},1600);
    return;
  }

  /* Bounding box dos traços */
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  tracosPonte.forEach(t=>{
    const e=t.espessura/2;
    t.pontos.forEach(p=>{
      if(p.x-e<minX)minX=p.x-e; if(p.y-e<minY)minY=p.y-e;
      if(p.x+e>maxX)maxX=p.x+e; if(p.y+e>maxY)maxY=p.y+e;
    });
  });
  const pad=8;
  minX=Math.max(0,Math.floor(minX-pad)); minY=Math.max(0,Math.floor(minY-pad));
  maxX=Math.min(canvasPonte.width,Math.ceil(maxX+pad));
  maxY=Math.min(canvasPonte.height,Math.ceil(maxY+pad));

  /* Canvas offscreen SEM fundo */
  const oc=document.createElement('canvas');
  oc.width=maxX-minX; oc.height=maxY-minY;
  const octx=oc.getContext('2d');
  octx.lineCap='round'; octx.lineJoin='round';
  /* NÃO fazemos fillRect — fundo permanece transparente */
  tracosPonte.forEach(t=>{
    if(!t.pontos||t.pontos.length<2) return;
    octx.beginPath();
    octx.strokeStyle=t.cor; octx.lineWidth=t.espessura;
    octx.moveTo(t.pontos[0].x-minX,t.pontos[0].y-minY);
    for(let i=1;i<t.pontos.length;i++) octx.lineTo(t.pontos[i].x-minX,t.pontos[i].y-minY);
    octx.stroke();
  });

  createImageBitmap(oc).then(bmp=>{
    estado.ponteImg        = bmp;
    estado.buracoResolvido = true;
    pontos += 30;

    /* ── Gera heightmap de colisão a partir dos pixels do desenho ──
       Para cada coluna x do desenho escalado (pw pixels),
       varre de cima para baixo e registra o y do primeiro pixel
       opaco (alpha > 60). Isso vira a superfície de caminhada.
       Após o scan, interpola colunas vazias para cobrir buracos
       de até GAP_MAX pixels causados por traços diagonais.        */
    const pw = BURACO_W + 40;
    const ph = Math.round(pw * oc.height / oc.width);
    const pixels = octx.getImageData(0, 0, oc.width, oc.height).data;
    const alturas = new Float32Array(pw).fill(ph); /* ph = sem superfície */

    for (let sx = 0; sx < pw; sx++) {
      const srcX = Math.round((sx / pw) * (oc.width - 1));
      /* Janela de ±3px na fonte para capturar traços diagonais finos */
      const x0 = Math.max(0, srcX - 3);
      const x1 = Math.min(oc.width - 1, srcX + 3);
      for (let sy = 0; sy < ph; sy++) {
        const srcY = Math.round((sy / ph) * (oc.height - 1));
        const y0 = Math.max(0, srcY - 2);
        const y1 = Math.min(oc.height - 1, srcY + 2);
        let found = false;
        outer: for (let cy = y0; cy <= y1; cy++) {
          for (let cx = x0; cx <= x1; cx++) {
            if (pixels[(cy * oc.width + cx) * 4 + 3] > 60) { found = true; break outer; }
          }
        }
        if (found) { alturas[sx] = sy; break; }
      }
    }

    /* Interpola colunas sem superfície entre vizinhos válidos */
    const GAP_MAX = 40; /* pixels — gaps maiores ficam abertos */
    let gapStart = -1;
    for (let sx = 0; sx <= pw; sx++) {
      const vazio = sx === pw || alturas[sx] >= ph;
      if (!vazio && gapStart >= 0) {
        /* Fecha gap: interpola entre gapStart-1 e sx */
        const yL = gapStart > 0        ? alturas[gapStart - 1] : alturas[sx];
        const yR = alturas[sx];
        const tam = sx - gapStart;
        if (tam <= GAP_MAX) {
          for (let g = 0; g < tam; g++) {
            alturas[gapStart + g] = yL + (yR - yL) * (g / tam);
          }
        }
        gapStart = -1;
      } else if (vazio && gapStart < 0) {
        gapStart = sx;
      }
    }

    estado.ponteAlturas = alturas;
    estado.pontePW      = pw;
    estado.pontePH      = ph;

    fecharModalPonte();
    esconderBotaoDesenho();
  });
}

/* ════════════════════════════════════════════
   SUPERFÍCIE DA PONTE
   Retorna o y (tela) do topo do desenho na
   coluna worldX. Se não há pixel sólido
   naquela coluna, retorna Infinity (buraco).
════════════════════════════════════════════ */
function superficiePonte(worldX) {
  if (!estado.ponteAlturas) return Infinity;
  const chaoY = CHAO_Y();
  const pw    = estado.pontePW;
  const ph    = estado.pontePH;
  /* O desenho é renderizado de BURACO_X-20 até BURACO_X-20+pw */
  const localX = worldX - (BURACO_X - 20);
  if (localX < 0 || localX >= pw) return chaoY;
  const ix = Math.max(0, Math.min(pw - 1, Math.floor(localX)));
  const hy = estado.ponteAlturas[ix];
  if (hy >= ph) return Infinity; /* coluna sem superfície */
  /* py_ do desenho no mundo = chaoY - ph (bottom âncora em chaoY) */
  return chaoY - ph + hy;
}

/* ════════════════════════════════════════════
   INICIAR JOGO
════════════════════════════════════════════ */
function iniciarJogo(){
  estado.px=80; estado.py=CHAO_Y()-SPRITE_H;
  telaCarregando.classList.add('saindo');
  setTimeout(()=>{telaCarregando.style.display='none';},700);
  setTimeout(()=>{document.getElementById('dicaBalao').classList.add('oculto');},4000);
  iniciarModalPonte();
  loop();
}

/* ════════════════════════════════════════════
   INPUT
════════════════════════════════════════════ */
document.addEventListener('keydown',e=>{estado.teclas[e.code]=true;});
document.addEventListener('keyup',  e=>{estado.teclas[e.code]=false;});
const btnE=document.getElementById('btnEsquerda');
const btnD=document.getElementById('btnDireita');
function pressionarBtn(btn,code,ativo){
  btn.classList.toggle('pressionado',ativo); estado.teclas[code]=ativo;
}
btnE.addEventListener('pointerdown', ()=>pressionarBtn(btnE,'ArrowLeft', true));
btnE.addEventListener('pointerup',   ()=>pressionarBtn(btnE,'ArrowLeft', false));
btnE.addEventListener('pointerleave',()=>pressionarBtn(btnE,'ArrowLeft', false));
btnD.addEventListener('pointerdown', ()=>pressionarBtn(btnD,'ArrowRight',true));
btnD.addEventListener('pointerup',   ()=>pressionarBtn(btnD,'ArrowRight',false));
btnD.addEventListener('pointerleave',()=>pressionarBtn(btnD,'ArrowRight',false));

/* ════════════════════════════════════════════
   FÍSICA
════════════════════════════════════════════ */
function atualizarFisica(){
  if(estado.modalAberto){estado.vx=0;return;}

  const esq =estado.teclas['ArrowLeft'] ||estado.teclas['KeyA'];
  const dir =estado.teclas['ArrowRight']||estado.teclas['KeyD'];
  const pulo=estado.teclas['ArrowUp']   ||estado.teclas['KeyW']||estado.teclas['Space'];

  if(dir)      {estado.vx=VELOCIDADE; estado.viradoDireita=true;  estado.correndo=true;}
  else if(esq) {estado.vx=-VELOCIDADE;estado.viradoDireita=false; estado.correndo=true;}
  else         {estado.vx*=0.82; estado.correndo=false;}

  /* Bloqueia no limite esquerdo do buraco se não resolvido */
  if(!estado.buracoResolvido){
    const borda=BURACO_X-SPRITE_W;
    if(estado.px>=borda&&estado.vx>0){estado.px=borda;estado.vx=0;}
  }

  if(pulo&&estado.noChao){estado.vy=PULO;estado.noChao=false;}
  estado.vy+=GRAVIDADE;
  estado.px+=estado.vx; estado.py+=estado.vy;

  if(estado.px<0){estado.px=0;estado.vx=0;}
  if(estado.px>estado.mundoLargura-SPRITE_W){estado.px=estado.mundoLargura-SPRITE_W;estado.vx=0;}

  const chaoY=CHAO_Y();

  /* ── Colisão com o chão e com o desenho da ponte ──
     Sem ponte: buraco é vazio.
     Com ponte: a superfície de colisão segue os pixels
                do desenho do jogador (heightmap).           */
  const centroX   = estado.px + SPRITE_W / 2;
  const naBuracoX = centroX > BURACO_X && centroX < BURACO_X + BURACO_W;

  if (naBuracoX) {
    if (!estado.buracoResolvido) {
      /* Sem ponte — cai no abismo; reseta se muito fundo */
      if (estado.py > chaoY + 180) {
        estado.px = BURACO_X - SPRITE_W - 8;
        estado.py = chaoY - SPRITE_H;
        estado.vx = 0; estado.vy = 0; estado.noChao = true;
      }
    } else {
      /* Com ponte — colide com a superfície desenhada */
      const sY = superficiePonte(centroX);
      if (sY === Infinity) {
        /* Coluna sem pixel: cai no abismo */
        if (estado.py > chaoY + 180) {
          estado.px = BURACO_X - SPRITE_W - 8;
          estado.py = chaoY - SPRITE_H;
          estado.vx = 0; estado.vy = 0; estado.noChao = true;
        }
      } else if (estado.py + SPRITE_H >= sY && estado.vy >= 0) {
        estado.py     = sY - SPRITE_H;
        estado.vy     = 0;
        estado.noChao = true;
      }
    }
  } else {
    /* Fora do buraco — chão normal */
    if (estado.py + SPRITE_H >= chaoY && estado.vy >= 0) {
      estado.py     = chaoY - SPRITE_H;
      estado.vy     = 0;
      estado.noChao = true;
    }
  }

  plataformas.forEach(p=>{
    const py=p.y();
    if(estado.px+SPRITE_W>p.x&&estado.px<p.x+p.w&&
       estado.py+SPRITE_H>=py&&estado.py+SPRITE_H<=py+20&&estado.vy>=0){
      estado.py=py-SPRITE_H;estado.vy=0;estado.noChao=true;
    }
  });

  moedas.forEach(m=>{
    if(m.coletada)return;
    const my=m.y();
    if(Math.abs(estado.px+SPRITE_W/2-m.x)<30&&Math.abs(estado.py+SPRITE_H/2-my)<30){
      m.coletada=true; pontos+=10;
    }
  });

  const alvo=estado.px-canvas.width/3;
  estado.camera+=(alvo-estado.camera)*0.1;
  if(estado.camera<0)estado.camera=0;
  if(estado.camera>estado.mundoLargura-canvas.width)estado.camera=estado.mundoLargura-canvas.width;

  if(estado.correndo&&estado.noChao){
    estado.animTimer++;
    if(estado.animTimer>8){estado.animFrame=(estado.animFrame+1)%4;estado.animTimer=0;}
  }else if(!estado.correndo){estado.animFrame=0;}

  /* Mostra botão ao chegar perto do buraco */
  const distBuraco=BURACO_X-(estado.px+SPRITE_W);
  if(!estado.buracoResolvido&&!estado.modalAberto&&distBuraco>0&&distBuraco<BURACO_TRIGGER){
    mostrarBotaoDesenho();
  }

  verificarMeta();
}

/* ════════════════════════════════════════════
   RENDERIZAÇÃO
════════════════════════════════════════════ */
let tempo=0;

function progresso(){return Math.min(1,estado.camera/(estado.mundoLargura-canvas.width||1));}

function desenharCeu(){
  const p=progresso();
  const grad=ctx.createLinearGradient(0,0,0,canvas.height);
  const r0=lerp(28,12,p),g0=lerp(16,8,p),b0=lerp(64,32,p);
  const r1=lerp(255,180,p),g1=lerp(110,40,p),b1=lerp(50,60,p);
  const r2=lerp(255,220,p),g2=lerp(180,80,p),b2=lerp(60,30,p);
  grad.addColorStop(0,`rgb(${r0|0},${g0|0},${b0|0})`);
  grad.addColorStop(0.45,`rgb(${r1|0},${g1|0},${b1|0})`);
  grad.addColorStop(1,`rgb(${r2|0},${g2|0},${b2|0})`);
  ctx.fillStyle=grad; ctx.fillRect(0,0,canvas.width,canvas.height);
}

function desenharSol(){
  const p=progresso();
  const solY=canvas.height*lerp(0.18,0.62,p);
  const solX=canvas.width*0.62-estado.camera*0.04;
  const raio=lerp(56,70,p);
  const halo=ctx.createRadialGradient(solX,solY,raio*0.4,solX,solY,raio*3.2);
  halo.addColorStop(0,`rgba(255,180,60,${lerp(0.30,0.18,p)})`);
  halo.addColorStop(0.5,`rgba(255,100,30,${lerp(0.12,0.07,p)})`);
  halo.addColorStop(1,'rgba(255,60,10,0)');
  ctx.fillStyle=halo; ctx.beginPath(); ctx.arc(solX,solY,raio*3.2,0,Math.PI*2); ctx.fill();
  const disc=ctx.createRadialGradient(solX-raio*0.2,solY-raio*0.2,2,solX,solY,raio);
  disc.addColorStop(0,'#FFF4AA'); disc.addColorStop(0.4,'#FFCC44');
  disc.addColorStop(1,`rgb(${lerp(255,200,p)|0},${lerp(110,50,p)|0},20)`);
  ctx.fillStyle=disc; ctx.beginPath(); ctx.arc(solX,solY,raio,0,Math.PI*2); ctx.fill();
}

function desenharEstrelas(){
  tempo+=0.02;
  const p=progresso(); const vis=Math.max(0,(p-0.2)*2); if(vis<=0)return;
  estrelas.forEach(e=>{
    const sx=e.x-estado.camera*0.03,sy=e.y;
    if(sx<-4||sx>canvas.width+4||sy/canvas.height>0.42)return;
    const b=vis*(0.3+0.7*Math.abs(Math.sin(tempo+e.fase)));
    ctx.beginPath();ctx.arc(sx,sy,e.r,0,Math.PI*2);
    ctx.fillStyle=`rgba(255,240,200,${b})`;ctx.fill();
  });
}

function desenharNuvens(){
  nuvens.forEach(n=>{
    const nx=n.x-estado.camera*0.22;
    if(nx<-150||nx>canvas.width+150)return;
    ctx.save();ctx.globalAlpha=n.alpha;ctx.fillStyle=n.cor;
    ctx.beginPath();
    ctx.arc(nx,n.y,n.r,0,Math.PI*2);
    ctx.arc(nx+n.r*0.85,n.y-n.r*0.3,n.r*0.75,0,Math.PI*2);
    ctx.arc(nx-n.r*0.75,n.y-n.r*0.2,n.r*0.65,0,Math.PI*2);
    ctx.arc(nx+n.r*1.5,n.y+n.r*0.1,n.r*0.55,0,Math.PI*2);
    ctx.fill();ctx.restore();
  });
}

function desenharBrasas(){
  brasas.forEach(b=>{
    const bx=((b.x-estado.camera*0.5)%(MUNDO_W+200)+MUNDO_W+200)%(MUNDO_W+200)-100;
    if(bx<-10||bx>canvas.width+10)return;
    const by=b.y-(tempo*b.vel*30%canvas.height);
    const drift=Math.sin(tempo*0.8+b.fase)*12;
    ctx.beginPath();ctx.arc(bx+drift,by,b.r,0,Math.PI*2);
    ctx.fillStyle=`rgba(255,${Math.floor(lerp(120,200,Math.random()))},40,${b.alpha*0.7})`;ctx.fill();
  });
}

function desenharMontanhas(){
  const h=canvas.height;
  ctx.beginPath();ctx.moveTo(0,h);
  for(let x=0;x<=canvas.width+60;x+=24){
    const wx=x+estado.camera*0.30;
    ctx.lineTo(x,h-160+Math.sin(wx*0.002)*70+Math.sin(wx*0.005+1)*40);
  }
  ctx.lineTo(canvas.width,h);ctx.closePath();ctx.fillStyle='rgba(40,16,70,0.85)';ctx.fill();
  ctx.beginPath();ctx.moveTo(0,h);
  for(let x=0;x<=canvas.width+60;x+=18){
    const wx=x+estado.camera*0.50;
    ctx.lineTo(x,h-100+Math.sin(wx*0.003+2)*48+Math.sin(wx*0.007)*24);
  }
  ctx.lineTo(canvas.width,h);ctx.closePath();ctx.fillStyle='rgba(60,16,40,0.90)';ctx.fill();
}

function desenharArvores(){
  arvores.forEach(a=>{
    const ax=a.x-estado.camera,base=CHAO_Y();
    if(ax<-60||ax>canvas.width+60)return;
    ctx.fillStyle='rgba(18,8,32,0.95)';
    ctx.fillRect(ax-4,base-a.h*0.35,8,a.h*0.35);
    for(let i=0;i<3;i++){
      const ty=base-a.h*0.28-i*(a.h*0.28),tw=a.r*(1.8-i*0.4);
      ctx.beginPath();ctx.moveTo(ax,ty-a.h*0.32);ctx.lineTo(ax-tw,ty);ctx.lineTo(ax+tw,ty);ctx.closePath();ctx.fill();
    }
  });
}

function desenharArbustos(){
  arbustos.forEach(a=>{
    const ax=a.x-estado.camera,base=CHAO_Y();
    if(ax<-40||ax>canvas.width+40)return;
    ctx.fillStyle='rgba(22,8,40,0.92)';
    ctx.beginPath();
    ctx.arc(ax,base-a.r*0.6,a.r,0,Math.PI*2);
    ctx.arc(ax-a.r,base-a.r*0.3,a.r*0.7,0,Math.PI*2);
    ctx.arc(ax+a.r,base-a.r*0.3,a.r*0.7,0,Math.PI*2);
    ctx.fill();
  });
}

/* Altura do deck sólido da ponte — usada também na física */
const PONTE_DECK_H = 16;

function desenharChao(){
  const chaoY=CHAO_Y(),p=progresso();
  const grad=ctx.createLinearGradient(0,chaoY,0,canvas.height);
  grad.addColorStop(0,`rgb(${lerp(110,70,p)|0},${lerp(60,30,p)|0},${lerp(20,10,p)|0})`);
  grad.addColorStop(0.18,`rgb(${lerp(90,55,p)|0},${lerp(48,24,p)|0},${lerp(16,8,p)|0})`);
  grad.addColorStop(1,`rgb(${lerp(60,30,p)|0},${lerp(28,12,p)|0},${lerp(8,4,p)|0})`);

  const bx  = BURACO_X - estado.camera;
  const bxF = BURACO_X + BURACO_W - estado.camera;

  /* ── Chão esquerdo e direito ── */
  ctx.fillStyle = grad;
  ctx.fillRect(0,   chaoY, Math.max(0, bx),              canvas.height - chaoY);
  ctx.fillRect(bxF, chaoY, Math.max(0, canvas.width-bxF),canvas.height - chaoY);

  /* ── Abismo sempre visível ── */
  const ab = ctx.createLinearGradient(0, chaoY, 0, chaoY + 90);
  ab.addColorStop(0, '#0A0008'); ab.addColorStop(1, '#020002');
  ctx.fillStyle = ab;
  ctx.fillRect(bx, chaoY, BURACO_W, canvas.height - chaoY);

  /* ── Grama das bordas ── */
  const gramaCor = `rgba(${lerp(130,80,p)|0},${lerp(70,30,p)|0},10,1)`;
  ctx.fillStyle = gramaCor;
  ctx.fillRect(0,   chaoY, Math.max(0, bx), 5);
  ctx.fillRect(bxF, chaoY, Math.max(0, canvas.width-bxF), 5);

  if (!estado.buracoResolvido) {
    /* Indicador pulsante acima do buraco */
    ctx.save();
    ctx.font="bold 20px 'Nunito',sans-serif";
    ctx.fillStyle=`rgba(255,209,102,${0.6+0.3*Math.sin(tempo*2.5)})`;
    ctx.textAlign='center'; ctx.textBaseline='bottom';
    ctx.fillText('↓ buraco ↓', bx+BURACO_W/2, chaoY-10+Math.sin(tempo*2)*4);
    ctx.restore();
  } else if (estado.ponteImg) {
    /* Desenho do jogador — a superfície de colisão segue os pixels */
    const pw  = estado.pontePW;
    const ph  = estado.pontePH;
    const px_ = bx - 20;
    const py_ = chaoY - ph;   /* bottom da imagem âncora em chaoY */
    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.drawImage(estado.ponteImg, px_, py_, pw, ph);
    ctx.restore();
  }
}

function desenharPlataformas(){
  plataformas.forEach(p=>{
    const px=p.x-estado.camera, py=p.y();
    if(px>canvas.width+20||px+p.w<-20) return;

    /* Sombra */
    ctx.fillStyle='rgba(0,0,0,0.28)';
    ctx.beginPath(); ctx.roundRect(px+5,py+7,p.w,22,8); ctx.fill();

    /* Corpo */
    const g=ctx.createLinearGradient(0,py,0,py+22);
    g.addColorStop(0,'#7B3020'); g.addColorStop(1,'#4A1810');
    ctx.fillStyle=g; ctx.beginPath(); ctx.roundRect(px,py,p.w,22,8); ctx.fill();

    /* Topo colorido — gradiente horizontal laranja-pôr-do-sol */
    const t=ctx.createLinearGradient(px,py,px+p.w,py);
    t.addColorStop(0,'#C04830'); t.addColorStop(0.5,'#E07040'); t.addColorStop(1,'#C04830');
    ctx.fillStyle=t; ctx.beginPath(); ctx.roundRect(px,py,p.w,9,[8,8,0,0]); ctx.fill();

    /* Brilho no topo */
    ctx.fillStyle='rgba(255,180,60,0.22)';
    ctx.beginPath(); ctx.roundRect(px+3,py+1,p.w-6,4,3); ctx.fill();

    /* Linhas de tábua verticais */
    ctx.strokeStyle='rgba(60,16,6,0.30)'; ctx.lineWidth=1.2;
    for(let tx=px+22; tx<px+p.w-8; tx+=22){
      ctx.beginPath(); ctx.moveTo(tx,py+1); ctx.lineTo(tx,py+20); ctx.stroke();
    }
  });
}

function desenharMoedas(){
  moedas.forEach(m=>{
    if(m.coletada)return;
    const mx=m.x-estado.camera;if(mx<-20||mx>canvas.width+20)return;
    const my=m.y()+Math.sin(tempo*3+m.x*0.01)*4;
    const glow=ctx.createRadialGradient(mx,my,2,mx,my,18);
    glow.addColorStop(0,'rgba(255,220,80,0.35)');glow.addColorStop(1,'rgba(255,140,20,0)');
    ctx.fillStyle=glow;ctx.beginPath();ctx.arc(mx,my,18,0,Math.PI*2);ctx.fill();
    ctx.save();ctx.beginPath();ctx.arc(mx,my,10,0,Math.PI*2);
    ctx.fillStyle='#FFD166';ctx.fill();
    ctx.strokeStyle='#FF8C00';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='#FF8C00';ctx.font="bold 10px 'Nunito',sans-serif";
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('★',mx,my);
    ctx.restore();
  });
}

function desenharMeta(){
  const mx=META_X-estado.camera,base=CHAO_Y();
  if(mx<-80||mx>canvas.width+80)return;
  const halo=ctx.createRadialGradient(mx,base-50,5,mx,base-50,80);
  halo.addColorStop(0,'rgba(255,220,80,0.25)');halo.addColorStop(1,'rgba(255,120,30,0)');
  ctx.fillStyle=halo;ctx.beginPath();ctx.arc(mx,base-50,80,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#7B3020';ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(mx,base);ctx.lineTo(mx,base-100);ctx.stroke();
  const fg=ctx.createLinearGradient(mx,base-100,mx+50,base-65);
  fg.addColorStop(0,'#FF6B35');fg.addColorStop(1,'#FFD166');
  ctx.fillStyle=fg;ctx.beginPath();ctx.moveTo(mx,base-100);ctx.lineTo(mx+50,base-80);ctx.lineTo(mx,base-60);ctx.closePath();ctx.fill();
  ctx.save();ctx.font="bold 14px 'Nunito',sans-serif";ctx.fillStyle='#fff';
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🏁',mx+18,base-80);ctx.restore();
}

function desenharPersonagem(){
  const px=Math.round(estado.px-estado.camera),py=Math.round(estado.py);
  ctx.save();

  /* Sombra no chão */
  ctx.beginPath();ctx.ellipse(px+SPRITE_W/2,CHAO_Y()+4,SPRITE_W/2*0.7,6,0,0,Math.PI*2);
  ctx.fillStyle='rgba(80,20,0,0.30)';ctx.fill();

  if(!estado.viradoDireita){ctx.translate(px+SPRITE_W,0);ctx.scale(-1,1);ctx.translate(-px,0);}
  let balanco=0;
  if(estado.correndo&&estado.noChao)balanco=Math.sin(estado.animFrame*Math.PI/2)*2;
  let scaleY=1;if(!estado.noChao)scaleY=estado.vy<0?1.15:0.9;
  ctx.translate(px+SPRITE_W/2,py+SPRITE_H/2);
  ctx.rotate(balanco*0.04);ctx.scale(1,scaleY);
  ctx.translate(-(px+SPRITE_W/2),-(py+SPRITE_H/2));

  if(estado.personagemImg){
    /* Halo circular de fundo — separa o personagem do cenário escuro */
    const cx=px+SPRITE_W/2, cy=py+SPRITE_H/2;
    const halo=ctx.createRadialGradient(cx,cy,4,cx,cy,SPRITE_W*0.75);
    halo.addColorStop(0,'rgba(255,255,255,0.32)');
    halo.addColorStop(0.6,'rgba(255,255,255,0.10)');
    halo.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=halo;
    ctx.beginPath();ctx.arc(cx,cy,SPRITE_W*0.75,0,Math.PI*2);ctx.fill();

    /* Contorno branco — 4 passes com shadowBlur branco criam borda nítida */
    ctx.shadowColor='rgba(255,255,255,1)';
    ctx.shadowBlur=7;
    for(let i=0;i<4;i++) ctx.drawImage(estado.personagemImg,px,py,SPRITE_W,SPRITE_H);
    ctx.shadowBlur=0;

    /* Render final limpo por cima */
    ctx.drawImage(estado.personagemImg,px,py,SPRITE_W,SPRITE_H);
  }else{
    ctx.beginPath();ctx.arc(px+SPRITE_W/2,py+SPRITE_H/2,SPRITE_W/2,0,Math.PI*2);
    ctx.fillStyle='#FF8C6B';ctx.fill();
  }
  ctx.restore();
}

function desenharPontuacao(){
  ctx.save();
  ctx.font="bold 18px 'Nunito',sans-serif";
  ctx.fillStyle='#FFD166';ctx.textAlign='right';ctx.textBaseline='top';
  ctx.shadowColor='rgba(0,0,0,0.5)';ctx.shadowBlur=4;
  ctx.fillText('⭐ '+pontos,canvas.width-14,54);
  ctx.restore();
}

/* ════════════════════════════════════════════
   LOOP
════════════════════════════════════════════ */
let rodando=true;
function loop(){
  if(!rodando)return;
  atualizarFisica();
  ctx.clearRect(0,0,canvas.width,canvas.height);
  desenharCeu();desenharSol();desenharEstrelas();desenharNuvens();
  desenharBrasas();desenharMontanhas();desenharArvores();desenharArbustos();
  desenharChao();desenharPlataformas();desenharMoedas();
  desenharMeta();desenharPersonagem();desenharPontuacao();
  requestAnimationFrame(loop);
}

/* ════════════════════════════════════════════
   VITÓRIA
════════════════════════════════════════════ */
let jogo_concluido=false;
function verificarMeta(){
  if(jogo_concluido)return;
  const cx=estado.px+SPRITE_W/2;
  if(cx>=META_X-20&&cx<=META_X+70){jogo_concluido=true;rodando=false;mostrarVitoria();}
}
function mostrarVitoria(){
  const tv=document.getElementById('telaVitoria');
  const vp=document.getElementById('vitoriaPontos');
  const vm=document.getElementById('vitoriaMensagem');
  const pct=moedas.filter(m=>m.coletada).length/moedas.length;
  const n=pct>=1?3:pct>=0.5?2:1;
  const msg=['Você atravessou o crepúsculo! Continue! 💪','Muito bem! O Lápis brilha! 🌅','INCRÍVEL! Coletou tudo! 1º pedaço do Lápis: ENCONTRADO! 🌟'];
  vp.textContent='⭐ '+pontos+' pontos';vm.textContent=msg[n-1];
  tv.classList.add('visivel');
  for(let i=1;i<=3;i++){
    const el=document.getElementById('estrelaV'+i);
    if(i<=n){setTimeout(()=>el.classList.add('acesa'),i*350);}
    else{el.style.filter='grayscale(1) opacity(0.25)';el.style.opacity='0.3';}
  }
  setTimeout(lancarConfete,400);
}
function lancarConfete(){
  const cores=['#FF6B35','#FFD166','#FF8C6B','#C84B6E','#FFB347','#FF4500'];
  for(let i=0;i<60;i++){
    const el=document.createElement('div');el.className='confete-item';
    el.style.left=Math.random()*100+'vw';
    el.style.background=cores[Math.floor(Math.random()*cores.length)];
    el.style.animationDuration=(1.8+Math.random()*2)+'s';
    el.style.animationDelay=(Math.random()*1.2)+'s';
    el.style.width=(6+Math.random()*8)+'px';el.style.height=(10+Math.random()*10)+'px';
    el.style.borderRadius=Math.random()>0.5?'50%':'2px';
    document.body.appendChild(el);setTimeout(()=>el.remove(),5000);
  }
}

carregarPersonagem();
