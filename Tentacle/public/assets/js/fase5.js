/* =============================================
   DESENHA MUNDO — FASE 5
   "O Guardião das Cores"

   ENREDO: O 3º e último pedaço do Lápis Mágico
   está guardado no Castelo das Cores. Mas o
   Guardião bloqueia o caminho com 4 DESAFIOS
   DE DESENHO rápidos e animados.

   MECÂNICA CENTRAL:
   Ao chegar perto do Guardião, um botão aparece.
   A criança aceita o desafio e resolve 4 rodadas
   de desenho livre no modal. Após cada uma, o
   Guardião reage com animação (dança, ri, gira).
   No 4º desafio: totalmente livre, sem dica.
   Depois: Guardião sai do caminho, o Lápis
   aparece e o jogo termina com grande celebração.

   DESAFIOS:
   1 — "Me mostre uma coisa REDONDA!"   ⭕
   2 — "Desenhe algo que VOA!"          🦋
   3 — "Me mostre FOGO ou uma estrela!" ⭐
   4 — "Desenha o que você quiser!"     🎨

   PRINCÍPIOS PARA NEURODIVERGENTES:
   • Nenhum critério de "forma correta"
   • Apenas contagem de pixels (qualquer traço vale)
   • Reação visual imediata e entusiasmada
   • 4º desafio é o mais fácil — encerra com vitória
   • Castelo tem poucas plataformas — foco no desenho
============================================= */

const canvas = document.getElementById('gameCanvas');
const imgMoeda = new Image();
imgMoeda.src = 'assets/moeda.png';

const ctx    = canvas.getContext('2d');
function redimensionar(){ canvas.width=window.innerWidth; canvas.height=window.innerHeight; }
redimensionar();
window.addEventListener('resize', redimensionar);

/* ════════════════════════════════════════════
   CONFIGURAÇÃO DOS 4 DESAFIOS
════════════════════════════════════════════ */
const DESAFIOS = [
  {
    fala:    'HUMM… vou começar fácil!<br>Me mostre uma coisa <strong>REDONDA</strong>! ⭕<br><span style="font-size:0.85em;color:#A05020">Pode ser uma bola, o sol, uma pizza…</span>',
    dica:    '⭕',
    reacaoEmoji: '😄',
    reacaoTexto: 'ARRASOU!\nIsso é exatamente\no que eu precisava!',
    badge:   '1 / 4',
  },
  {
    fala:    'Boa! Agora quero ver algo que <strong>VOA</strong>! 🦋<br><span style="font-size:0.85em;color:#A05020">Pássaro, avião, borboleta… você decide!</span>',
    dica:    '🦋',
    reacaoEmoji: '🤩',
    reacaoTexto: 'UAU, QUE LINDO!\nVocê é incrível mesmo!',
    badge:   '2 / 4',
  },
  {
    fala:    'Impressionante! Pensei que fosse mais difícil…<br>Agora desenhe <strong>fogo</strong> ou uma <strong>estrela</strong>! ⭐<br><span style="font-size:0.85em;color:#A05020">Capricha nessa!</span>',
    dica:    '⭐',
    reacaoEmoji: '🎉',
    reacaoTexto: 'SENSACIONAL!\nQuase lá,\nsó mais um!',
    badge:   '3 / 4',
  },
  {
    fala:    'Ok… confesso que não esperava chegar até aqui!<br>Último desafio: desenhe <strong>o que você quiser!</strong> 🎨<br><span style="font-size:0.85em;color:#A05020">Pode ser qualquer coisa da sua imaginação!</span>',
    dica:    '🎨',
    reacaoEmoji: '🏆',
    reacaoTexto: 'PERFEITO!\nVocê é o maior artista\nque eu já vi na vida!',
    badge:   '4 / 4',
  },
];

/* ════════════════════════════════════════════
   ESTADO DO JOGO
════════════════════════════════════════════ */
const estado = {
  personagemImg:   null,
  px:0, py:0, vx:0, vy:0,
  noChao:true, viradoDireita:true,
  animFrame:0, animTimer:0,
  camera:0, teclas:{}, correndo:false,
  mundoLargura:    4050,

  /* Guardião */
  guardiaEstado:   'aguardando',  /* aguardando | encontro | desafio_N | reagindo | liberado */
  desafioAtual:    0,             /* 0 a 3 */
  modalAberto:     false,
  guardiaoX:       2100,          /* posição mundo do Guardião */
  guardiaoSaindo:  false,
  guardiaoOffsetY: 0,             /* animação de saída (sobe e some) */

  /* Pontinhos de progresso */
  progDesafios:    [false, false, false, false],
};

const SPRITE_W=72, SPRITE_H=72, VELOCIDADE=3.4, GRAVIDADE=0.56, PULO=-13;
const META_X      = 3680;
const TRIGGER_X   = 400;   /* distância do herói ao Guardião para mostrar botão */

/* ════════════════════════════════════════════
   CARREGAR PERSONAGEM (traços → PNG sem fundo)
════════════════════════════════════════════ */
const telaCarregando     = document.getElementById('telaCarregando');
const loadBarra          = document.getElementById('loadBarra');
const avisoSemPersonagem = document.getElementById('avisoSemPersonagem');

function simularBarra(cb){
  let p=0;
  const iv=setInterval(()=>{
    p+=Math.random()*18+8;
    if(p>=100){p=100;clearInterval(iv);setTimeout(cb,300);}
    loadBarra.style.width=p+'%';
  },120);
}
function carregarPersonagem(){
  const dadosStr=localStorage.getItem('personagem_desenho');
  if(!dadosStr){
    fetch('personagem_desenho.json')
      .then(r=>{if(!r.ok)throw new Error();return r.json();})
      .then(d=>processarDados(d)).catch(()=>mostrarAviso());
    return;
  }
  try{processarDados(JSON.parse(dadosStr));}catch(e){mostrarAviso();}
}
function processarDados(dados){
  const oc=document.createElement('canvas');
  oc.width=dados.canvas.largura; oc.height=dados.canvas.altura;
  const octx=oc.getContext('2d'); octx.lineCap='round'; octx.lineJoin='round';
  dados.tracos.forEach(t=>{
    if(!t.pontos||t.pontos.length<2) return;
    octx.beginPath(); octx.strokeStyle=t.cor; octx.lineWidth=t.espessura;
    octx.moveTo(t.pontos[0].x,t.pontos[0].y);
    for(let i=1;i<t.pontos.length;i++) octx.lineTo(t.pontos[i].x,t.pontos[i].y);
    octx.stroke();
  });
  createImageBitmap(oc).then(bmp=>{
    estado.personagemImg=bmp;
    simularBarra(()=>iniciarJogo());
  });
}
function mostrarAviso(){ telaCarregando.style.display='none'; avisoSemPersonagem.classList.add('visivel'); }

/* ════════════════════════════════════════════
   CENÁRIO — CASTELO MÁGICO
════════════════════════════════════════════ */
const MUNDO_W = estado.mundoLargura;
function lerp(a,b,t){ return a+(b-a)*t; }

/* Torres do castelo ao fundo */
const torres = [
  {x:400,  h:200, w:70},
  {x:600,  h:240, w:80},
  {x:900,  h:180, w:65},
  {x:1250, h:220, w:75},
  {x:1600, h:260, w:85},
  {x:1900, h:200, w:70},
  {x:2350, h:300, w:90},
  {x:2650, h:240, w:80},
  {x:2950, h:200, w:70},
  {x:3200, h:280, w:88},
];

/* Nuvens rosadas decorativas */
const nuvens = Array.from({length:14},()=>({
  x:   Math.random()*MUNDO_W,
  y:   30+Math.random()*120,
  r:   40+Math.random()*55,
  alpha:0.45+Math.random()*0.3,
  vel: 0.04+Math.random()*0.08,
}));

/* Estrelas/faíscas mágicas */
const faiscas = Array.from({length:40},()=>({
  x:   Math.random()*MUNDO_W,
  y:   20+Math.random()*200,
  r:   1+Math.random()*2,
  fase:Math.random()*Math.PI*2,
}));

const CHAO_Y = ()=>canvas.height-110;

/* Plataformas do castelo — poucas, foco é no Guardião */
const plataformas = [
  {x:200,  y:()=>CHAO_Y()-90,  w:140},
  {x:480,  y:()=>CHAO_Y()-130, w:120},
  {x:720,  y:()=>CHAO_Y()-80,  w:150},
  {x:980,  y:()=>CHAO_Y()-115, w:130},
  {x:1220, y:()=>CHAO_Y()-90,  w:145},
  {x:1480, y:()=>CHAO_Y()-125, w:115},
  {x:1720, y:()=>CHAO_Y()-80,  w:150},
  /* ── Novas plataformas ANTES do Guardião ── */
  {x:1910, y:()=>CHAO_Y()-115, w:125},
  {x:2040, y:()=>CHAO_Y()-88,  w:120},
  /* ── Novas plataformas DEPOIS do Guardião ── */
  {x:2320, y:()=>CHAO_Y()-105, w:130},
  {x:2445, y:()=>CHAO_Y()-128, w:118},
  /* ── Caminho até a meta ── */
  {x:2620, y:()=>CHAO_Y()-90,  w:140},
  {x:2890, y:()=>CHAO_Y()-110, w:130},
  {x:3150, y:()=>CHAO_Y()-85,  w:145},
  {x:3390, y:()=>CHAO_Y()-100, w:120},
];

const moedas = [];
plataformas.forEach(p=>{
  for(let i=0;i<2;i++) moedas.push({x:p.x+p.w*(0.3+i*0.4),y:()=>p.y()-28,coletada:false});
});
for(let i=0;i<20;i++){
  const mx=160+i*165;
  /* Nenhuma moeda perto do Guardião */
  if(mx>estado.guardiaoX-150 && mx<estado.guardiaoX+200) continue;
  moedas.push({x:mx,y:()=>CHAO_Y()-50,coletada:false});
}
let pontos=0;

/* ════════════════════════════════════════════
   SISTEMA DO GUARDIÃO
════════════════════════════════════════════ */
const btnAbrirEncontro = document.getElementById('btnAbrirEncontro');
const modalDesafio     = document.getElementById('modalDesafio');
const overlayReacao    = document.getElementById('overlayReacao');

/* Altura e largura do Guardião no canvas */
const G_W=110, G_H=130;

function verificarProximidadeGuardiao(){
  if(estado.guardiaEstado!=='aguardando') return;
  const dist = estado.guardiaoX - (estado.px+SPRITE_W);
  if(dist>0 && dist<TRIGGER_X){
    estado.guardiaEstado='encontro';
    btnAbrirEncontro.classList.add('visivel');
    btnAbrirEncontro.setAttribute('aria-hidden','false');
  }
}

function abrirProximoDesafio(){
  const idx=estado.desafioAtual;
  if(idx>=DESAFIOS.length){
    /* Todos os desafios concluídos */
    iniciarSaidaGuardiao();
    return;
  }
  const d=DESAFIOS[idx];

  /* Atualiza conteúdo do modal */
  document.getElementById('desafioFala').innerHTML  = d.fala;
  document.getElementById('desafioDica').textContent= d.dica;
  document.getElementById('desafioBadge').textContent=d.badge;

  resetarCanvasDesafio();

  estado.modalAberto=true;
  modalDesafio.setAttribute('aria-hidden','false');
  modalDesafio.classList.add('visivel');
}

function fecharModalDesafio(){
  modalDesafio.classList.remove('visivel');
  modalDesafio.setAttribute('aria-hidden','true');
  setTimeout(()=>{ estado.modalAberto=false; },400);
}

function mostrarReacao(idx){
  const d=DESAFIOS[idx];
  document.getElementById('reacaoEmoji').textContent = d.reacaoEmoji;
  /* Quebra de linha no texto */
  const el=document.getElementById('reacaoTexto');
  el.innerHTML=d.reacaoTexto.replace(/\n/g,'<br>');

  overlayReacao.setAttribute('aria-hidden','false');
  overlayReacao.classList.add('visivel');

  /* Marca progresso */
  estado.progDesafios[idx]=true;

  setTimeout(()=>{
    overlayReacao.classList.remove('visivel');
    overlayReacao.setAttribute('aria-hidden','true');

    estado.desafioAtual++;
    if(estado.desafioAtual<DESAFIOS.length){
      abrirProximoDesafio();
    }else{
      iniciarSaidaGuardiao();
    }
  }, 2000);
}

function iniciarSaidaGuardiao(){
  estado.guardiaEstado='liberado';
  estado.guardiaoSaindo=true;
  /* Animação: Guardião se move para cima e some */
}

/* ════════════════════════════════════════════
   CANVAS DE DESENHO DO DESAFIO
════════════════════════════════════════════ */
let canvasDesafio, ctxDesafio;
let desenhando5=false, cor5='#3A3530', esp5=9, prim5=true;
let tracos5=[], traco5Atual=null;

function iniciarCanvasDesafio(){
  canvasDesafio=document.getElementById('canvasDesafio');
  ctxDesafio=canvasDesafio.getContext('2d');
  ctxDesafio.lineCap='round'; ctxDesafio.lineJoin='round';

  canvasDesafio.addEventListener('mousedown',  iniD5);
  canvasDesafio.addEventListener('mousemove',  contD5);
  canvasDesafio.addEventListener('mouseup',    fimD5);
  canvasDesafio.addEventListener('mouseleave', fimD5);
  canvasDesafio.addEventListener('touchstart', e=>{e.preventDefault();iniD5(e.touches[0]);},{passive:false});
  canvasDesafio.addEventListener('touchmove',  e=>{e.preventDefault();contD5(e.touches[0]);},{passive:false});
  canvasDesafio.addEventListener('touchend',   e=>{e.preventDefault();fimD5();},{passive:false});

  document.querySelectorAll('#modalDesafio .modal-cor').forEach(btn=>{
    btn.addEventListener('click',function(){
      document.querySelectorAll('#modalDesafio .modal-cor').forEach(b=>b.classList.remove('ativo'));
      this.classList.add('ativo'); cor5=this.dataset.cor;
    });
  });
  document.querySelectorAll('#modalDesafio .modal-esp').forEach(btn=>{
    btn.addEventListener('click',function(){
      document.querySelectorAll('#modalDesafio .modal-esp').forEach(b=>b.classList.remove('ativo'));
      this.classList.add('ativo'); esp5=parseInt(this.dataset.esp);
    });
  });
  document.getElementById('btnLimparDesafio').addEventListener('click', resetarCanvasDesafio);
  document.getElementById('btnAceitarDesafio').addEventListener('click',()=>{
    btnAbrirEncontro.classList.remove('visivel');
    btnAbrirEncontro.setAttribute('aria-hidden','true');
    estado.guardiaEstado='desafio';
    /* Pequena pausa para o botão sumir antes de abrir o modal */
    setTimeout(abrirProximoDesafio, 300);
  });
  document.getElementById('btnConfirmarDesafio').addEventListener('click', confirmarDesafio5);
}

function resetarCanvasDesafio(){
  if(!ctxDesafio||!canvasDesafio) return;
  ctxDesafio.clearRect(0,0,canvasDesafio.width,canvasDesafio.height);
  tracos5=[]; traco5Atual=null; prim5=true;
  const dica=document.getElementById('dicaCanvasDesafio');
  if(dica){dica.style.opacity='1'; dica.textContent='✏️ Desenhe aqui!';}
}

function posD5(e){
  const rect=canvasDesafio.getBoundingClientRect();
  return{
    x:(e.clientX-rect.left)*(canvasDesafio.width/rect.width),
    y:(e.clientY-rect.top)*(canvasDesafio.height/rect.height),
  };
}
function iniD5(e){
  desenhando5=true; const pos=posD5(e);
  if(prim5){ document.getElementById('dicaCanvasDesafio').style.opacity='0'; prim5=false; }
  traco5Atual={cor:cor5,espessura:esp5,pontos:[{x:pos.x,y:pos.y}]};
  ctxDesafio.beginPath(); ctxDesafio.moveTo(pos.x,pos.y);
  ctxDesafio.strokeStyle=cor5; ctxDesafio.lineWidth=esp5;
}
function contD5(e){
  if(!desenhando5||!traco5Atual) return;
  const pos=posD5(e); traco5Atual.pontos.push({x:pos.x,y:pos.y});
  ctxDesafio.lineTo(pos.x,pos.y); ctxDesafio.stroke();
}
function fimD5(){
  if(!desenhando5||!traco5Atual) return;
  desenhando5=false; ctxDesafio.closePath();
  if(traco5Atual.pontos.length>1) tracos5.push(traco5Atual);
  traco5Atual=null;
}

/**
 * Valida o desenho por contagem de pixels.
 * Critério MUITO generoso — qualquer traço real vale.
 * Rejeita apenas canvas em branco ou toque acidental.
 */
function confirmarDesafio5(){
  const dados=ctxDesafio.getImageData(0,0,canvasDesafio.width,canvasDesafio.height).data;
  let coloridos=0;
  for(let i=0;i<dados.length;i+=24){if(dados[i+3]>80) coloridos++;}

  if(coloridos<50||tracos5.length===0){
    /* Pouco conteúdo — botão treme gentilmente */
    const btn=document.getElementById('btnConfirmarDesafio');
    btn.style.animation='none';
    btn.style.transform='translateX(-6px)';
    setTimeout(()=>{btn.style.transform='translateX(6px)';},80);
    setTimeout(()=>{btn.style.transform='translateX(-3px)';},160);
    setTimeout(()=>{btn.style.transform='translateX(0)';},240);
    const dica=document.getElementById('dicaCanvasDesafio');
    dica.style.opacity='0.9'; dica.textContent='Pode ser qualquer coisa! ✏️';
    setTimeout(()=>{dica.style.opacity='0'; dica.textContent='✏️ Desenhe aqui!';},1800);
    return;
  }

  /* Aceito! Fecha modal e mostra reação */
  const idx=estado.desafioAtual;
  fecharModalDesafio();
  pontos+=30;
  setTimeout(()=>mostrarReacao(idx), 350);
}

/* ════════════════════════════════════════════
   INICIAR JOGO
════════════════════════════════════════════ */
function iniciarJogo(){
  estado.px=80; estado.py=CHAO_Y()-SPRITE_H;
  telaCarregando.classList.add('saindo');
  setTimeout(()=>{telaCarregando.style.display='none';},700);
  setTimeout(()=>{document.getElementById('dicaBalao').classList.add('oculto');},4000);
  iniciarCanvasDesafio();
  loop();
}

/* ════════════════════════════════════════════
   INPUT
════════════════════════════════════════════ */

/* ── PINGO — olhos seguem o personagem ── */
const _pingoE  = document.getElementById('pingo-pupila-e');
const _pingoD  = document.getElementById('pingo-pupila-d');
const _brilhoE = document.getElementById('pingo-brilho-e');
const _brilhoD = document.getElementById('pingo-brilho-d');
const _pingoCanto = document.getElementById('pingo-canto');
const _pingoSvg   = document.getElementById('pingo-svg');

const _OLHOS = [
  { pupila: _pingoE, brilho: _brilhoE, baseCX: 51, baseCY: 65 },
  { pupila: _pingoD, brilho: _brilhoD, baseCX: 81, baseCY: 65 },
];
const _MAX_TRAVEL = 2.8;

function atualizarOlhosPingo(playerScreenX, playerScreenY) {
  if (!_pingoSvg || !_pingoCanto) return;

  const svgRect = _pingoSvg.getBoundingClientRect();
  if (svgRect.width === 0) return;

  const scaleX = svgRect.width  / 130;
  const scaleY = svgRect.height / 140;

  _OLHOS.forEach(({ pupila, brilho, baseCX, baseCY }) => {
    /* Centro do olho em coordenadas de tela */
    const eyeX = svgRect.left + baseCX * scaleX;
    const eyeY = svgRect.top  + baseCY * scaleY;

    const dx   = playerScreenX - eyeX;
    const dy   = playerScreenY - eyeY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    const ox = (dx / dist) * _MAX_TRAVEL;
    const oy = (dy / dist) * _MAX_TRAVEL;

    pupila.setAttribute('cx', baseCX + ox);
    pupila.setAttribute('cy', baseCY + oy);
    /* brilho acompanha com deslocamento fixo */
    brilho.setAttribute('cx', baseCX + ox + 2);
    brilho.setAttribute('cy', baseCY + oy - 2);
  });
}

document.addEventListener('keydown',e=>{estado.teclas[e.code]=true;});
document.addEventListener('keyup',  e=>{estado.teclas[e.code]=false;});
const btnE=document.getElementById('btnEsquerda');
const btnD=document.getElementById('btnDireita');
function pressionarBtn(btn,code,ativo){btn.classList.toggle('pressionado',ativo);estado.teclas[code]=ativo;}
btnE.addEventListener('pointerdown', ()=>pressionarBtn(btnE,'ArrowLeft', true));
btnE.addEventListener('pointerup',   ()=>pressionarBtn(btnE,'ArrowLeft', false));
btnE.addEventListener('pointerleave',()=>pressionarBtn(btnE,'ArrowLeft', false));
btnD.addEventListener('pointerdown',   ()=>pressionarBtn(btnD,'ArrowRight',true));
btnD.addEventListener('pointerup',     ()=>pressionarBtn(btnD,'ArrowRight',false));
btnD.addEventListener('pointerleave',  ()=>pressionarBtn(btnD,'ArrowRight',false));
btnD.addEventListener('pointercancel', ()=>pressionarBtn(btnD,'ArrowRight',false));
btnE.addEventListener('pointercancel', ()=>pressionarBtn(btnE,'ArrowLeft', false));
const btnP5=document.getElementById('btnPular');
if(btnP5){
  btnP5.addEventListener('pointerdown',   ()=>pressionarBtn(btnP5,'ArrowUp',true));
  btnP5.addEventListener('pointerup',     ()=>pressionarBtn(btnP5,'ArrowUp',false));
  btnP5.addEventListener('pointerleave',  ()=>pressionarBtn(btnP5,'ArrowUp',false));
  btnP5.addEventListener('pointercancel', ()=>pressionarBtn(btnP5,'ArrowUp',false));
}

/* ════════════════════════════════════════════
   FÍSICA
════════════════════════════════════════════ */
function atualizarFisica(){
  if(estado.modalAberto){ estado.vx=0; return; }

  const esq =estado.teclas['ArrowLeft'] ||estado.teclas['KeyA'];
  const dir =estado.teclas['ArrowRight']||estado.teclas['KeyD'];
  const pulo=estado.teclas['ArrowUp']   ||estado.teclas['KeyW']||estado.teclas['Space'];

  if(dir)      {estado.vx=VELOCIDADE;  estado.viradoDireita=true;  estado.correndo=true;}
  else if(esq) {estado.vx=-VELOCIDADE; estado.viradoDireita=false; estado.correndo=true;}
  else         {estado.vx*=0.82; estado.correndo=false;}

  /* Bloqueia antes do Guardião enquanto não liberado */
  if(estado.guardiaEstado!=='liberado'){
    const borda=estado.guardiaoX-SPRITE_W-10;
    if(estado.px>=borda && estado.vx>0){ estado.px=borda; estado.vx=0; }
  }

  if(pulo&&estado.noChao){estado.vy=PULO;estado.noChao=false;try{ efeitoPulo.currentTime=0; efeitoPulo.play(); }catch(e){}}
  estado.vy+=GRAVIDADE; estado.px+=estado.vx; estado.py+=estado.vy;

  if(estado.px<0){estado.px=0;estado.vx=0;}
  if(estado.px>estado.mundoLargura-SPRITE_W){estado.px=estado.mundoLargura-SPRITE_W;estado.vx=0;}

  const chaoY=CHAO_Y();
  if(estado.py>=chaoY-SPRITE_H){estado.py=chaoY-SPRITE_H;estado.vy=0;estado.noChao=true;}

  plataformas.forEach(p=>{
    const py=p.y();
    if(estado.px+SPRITE_W>p.x&&estado.px<p.x+p.w&&
       estado.py+SPRITE_H>=py&&estado.py+SPRITE_H<=py+20&&estado.vy>=0){
      estado.py=py-SPRITE_H;estado.vy=0;estado.noChao=true;
    }
  });

  moedas.forEach(m=>{
    if(m.coletada)return; const my=m.y();
    if(Math.abs(estado.px+SPRITE_W/2-m.x)<30&&Math.abs(estado.py+SPRITE_H/2-my)<30){
      m.coletada=true; pontos+=10; try{ efeitoMoeda.currentTime=0; efeitoMoeda.play(); }catch(e){}
    }
  });

  const alvo=estado.px-canvas.width/3;
  estado.camera+=(alvo-estado.camera)*0.1;
  if(estado.camera<0) estado.camera=0;
  if(estado.camera>estado.mundoLargura-canvas.width) estado.camera=estado.mundoLargura-canvas.width;

  if(estado.correndo&&estado.noChao){
    estado.animTimer++;
    if(estado.animTimer>8){estado.animFrame=(estado.animFrame+1)%4;estado.animTimer=0;}
  }else if(!estado.correndo){estado.animFrame=0;}

  /* Guardião saindo: move para cima até sumir */
  if(estado.guardiaoSaindo){
    guardiao_saidaTimer++;
    estado.guardiaoOffsetY += 3.5;      /* sobe e some */
    if(guardiao_saidaTimer>80){
      estado.guardiaoSaindo=false;
    }
  }

  verificarProximidadeGuardiao();
  verificarMeta();
}

let guardiao_saidaTimer=0;
let tempo=0;

/* ════════════════════════════════════════════
   RENDERIZAÇÃO — CASTELO MÁGICO
════════════════════════════════════════════ */
function progresso(){ return Math.min(1,estado.camera/(estado.mundoLargura-canvas.width||1)); }

function desenharCeu(){
  const p=progresso();
  const grad=ctx.createLinearGradient(0,0,0,canvas.height);
  grad.addColorStop(0,  `rgb(${lerp(255,255,p)|0},${lerp(154,220,p)|0},${lerp(122,160,p)|0})`);
  grad.addColorStop(0.5,`rgb(${lerp(255,255,p)|0},${lerp(200,230,p)|0},${lerp(140,180,p)|0})`);
  grad.addColorStop(1,  `rgb(${lerp(255,255,p)|0},${lerp(230,245,p)|0},${lerp(170,200,p)|0})`);
  ctx.fillStyle=grad; ctx.fillRect(0,0,canvas.width,canvas.height);
}

function desenharNuvens(){
  nuvens.forEach(n=>{
    const off=((n.x-estado.camera*0.20+tempo*n.vel*40)%(MUNDO_W+300)+MUNDO_W+300)%(MUNDO_W+300)-150;
    if(off<-200||off>canvas.width+200) return;
    ctx.save(); ctx.globalAlpha=n.alpha;
    ctx.fillStyle='rgba(255,255,255,0.88)';
    ctx.beginPath();
    ctx.arc(off,         n.y,          n.r,        0,Math.PI*2);
    ctx.arc(off+n.r*0.85,n.y-n.r*0.3, n.r*0.75,   0,Math.PI*2);
    ctx.arc(off-n.r*0.75,n.y-n.r*0.2, n.r*0.65,   0,Math.PI*2);
    ctx.arc(off+n.r*1.5, n.y+n.r*0.05,n.r*0.55,   0,Math.PI*2);
    ctx.fill(); ctx.restore();
  });
}

function desenharFaiscas(){
  faiscas.forEach(f=>{
    const fx=f.x-estado.camera*0.04;
    if(fx<-6||fx>canvas.width+6||f.y>canvas.height*0.55) return;
    const b=0.3+0.7*Math.abs(Math.sin(tempo*1.5+f.fase));
    ctx.beginPath(); ctx.arc(fx,f.y,f.r,0,Math.PI*2);
    ctx.fillStyle=`rgba(255,210,100,${b})`; ctx.fill();
  });
}

function desenharTorres(){
  torres.forEach(t=>{
    const tx=t.x-estado.camera*0.35, base=CHAO_Y();
    if(tx<-120||tx>canvas.width+120) return;
    /* Sombra */
    ctx.fillStyle='rgba(180,100,40,0.25)';
    ctx.fillRect(tx+8,base-t.h+6,t.w,t.h);
    /* Corpo da torre */
    const tg=ctx.createLinearGradient(tx,base-t.h,tx+t.w,base);
    tg.addColorStop(0,'#E8C890'); tg.addColorStop(1,'#C4904A');
    ctx.fillStyle=tg; ctx.fillRect(tx,base-t.h,t.w,t.h);
    /* Ameias */
    const ameiaW=Math.floor(t.w/4), ameiaH=18;
    for(let a=0;a<4;a++){
      if(a%2===0){
        ctx.fillStyle='#D4A860';
        ctx.fillRect(tx+a*ameiaW,base-t.h-ameiaH,ameiaW,ameiaH);
      }
    }
    /* Janela com luz */
    ctx.fillStyle='rgba(255,230,120,0.7)';
    ctx.beginPath(); ctx.roundRect(tx+t.w/2-8,base-t.h*0.55,16,20,[8,8,0,0]); ctx.fill();
  });
}

function desenharChao(){
  const chaoY=CHAO_Y();
  const gg=ctx.createLinearGradient(0,chaoY,0,canvas.height);
  gg.addColorStop(0,   '#C8924A');
  gg.addColorStop(0.12,'#A86E30');
  gg.addColorStop(1,   '#7A4A18');
  ctx.fillStyle=gg; ctx.fillRect(0,chaoY,canvas.width,canvas.height-chaoY);
  /* Linha de grama dourada */
  ctx.fillStyle='#E8A840'; ctx.fillRect(0,chaoY,canvas.width,6);
  /* Detalhes de pedra no chão */
  for(let x=Math.floor(estado.camera/80)*80-80; x<estado.camera+canvas.width+80; x+=80){
    const sx=x-estado.camera;
    ctx.strokeStyle='rgba(180,110,40,0.3)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(sx,chaoY+8); ctx.lineTo(sx+60,chaoY+8); ctx.stroke();
  }
}

function desenharPlataformas(){
  plataformas.forEach(p=>{
    const px=p.x-estado.camera, py=p.y();
    if(px>canvas.width+20||px+p.w<-20) return;
    /* Sombra */
    ctx.fillStyle='rgba(120,60,20,0.22)';
    ctx.beginPath(); ctx.roundRect(px+4,py+6,p.w,22,8); ctx.fill();
    /* Plataforma (pedra do castelo) */
    const pg=ctx.createLinearGradient(0,py,0,py+22);
    pg.addColorStop(0,'#D4A460'); pg.addColorStop(1,'#B87830');
    ctx.fillStyle=pg; ctx.beginPath(); ctx.roundRect(px,py,p.w,22,8); ctx.fill();
    /* Linha de topo */
    const pt=ctx.createLinearGradient(px,py,px+p.w,py);
    pt.addColorStop(0,'#E8C070'); pt.addColorStop(0.5,'#F0D080'); pt.addColorStop(1,'#E8C070');
    ctx.fillStyle=pt; ctx.beginPath(); ctx.roundRect(px,py,p.w,9,[8,8,0,0]); ctx.fill();
    /* Brilho */
    ctx.fillStyle='rgba(255,240,160,0.15)';
    ctx.beginPath(); ctx.roundRect(px+2,py+1,p.w-4,4,4); ctx.fill();
  });
}

function desenharMoedas(){
  moedas.forEach(m=>{
    if(m.coletada) return;
    const mx=m.x-estado.camera;
    if(mx<-20||mx>canvas.width+20) return;
    const my=m.y()+Math.sin(tempo*3+m.x*0.01)*4;
    if(imgMoeda.complete && imgMoeda.naturalWidth>0){
      ctx.save();
      ctx.drawImage(imgMoeda, mx-10, my-10, 20, 20);
      ctx.restore();
    } else {
      ctx.save();
      ctx.beginPath();
      ctx.arc(mx,my,10,0,Math.PI*2);
      ctx.fillStyle='#F9D776';
      ctx.fill();
      ctx.strokeStyle='#E8C040';
      ctx.lineWidth=2;
      ctx.stroke();
      ctx.restore();
    }
  });
}

/* ═══════════════════════════════════════════
   DESENHAR O GUARDIÃO NO CANVAS DO JOGO
   Aparece como um personagem grande
   antes do encounter e sai animado depois.
═══════════════════════════════════════════ */
function desenharGuardiao(){
  const gx=estado.guardiaoX-estado.camera;
  const base=CHAO_Y();
  if(gx<-200||gx>canvas.width+200) return;
  /* Se liberado e saiu completamente */
  if(!estado.guardiaoSaindo && estado.guardiaEstado==='liberado' &&
     guardiao_saidaTimer>80) return;

  ctx.save();

  /* Animação de balanço suave */
  const balancoY = estado.guardiaEstado==='liberado'
    ? Math.sin(tempo*8)*12    /* vibra mais rápido ao sair */
    : Math.sin(tempo*1.8)*6;  /* balanço idle */
  const balancoR = Math.sin(tempo*1.2)*0.04;

  ctx.translate(gx+G_W/2, base-G_H/2+balancoY-estado.guardiaoOffsetY);
  ctx.rotate(balancoR);
  ctx.translate(-G_W/2,-G_H/2);
  if(estado.guardiaoSaindo) ctx.globalAlpha=Math.max(0,1-estado.guardiaoOffsetY/200);

  /* Sombra no chão */
  ctx.beginPath();
  ctx.ellipse(G_W/2,G_H+10, G_W*0.45,10,0,0,Math.PI*2);
  ctx.fillStyle='rgba(100,50,0,0.25)'; ctx.fill();

  /* Corpo */
  ctx.beginPath();
  ctx.ellipse(G_W/2,G_H*0.56,G_W*0.50,G_H*0.52,0,0,Math.PI*2);
  ctx.fillStyle='#4EC9C0'; ctx.fill();
  ctx.strokeStyle='#28A89E'; ctx.lineWidth=3; ctx.stroke();

  /* Barriga */
  ctx.beginPath();
  ctx.ellipse(G_W/2,G_H*0.64,G_W*0.32,G_H*0.28,0,0,Math.PI*2);
  ctx.fillStyle='rgba(125,232,226,0.55)'; ctx.fill();

  /* Coroa */
  ctx.fillStyle='#FFD166'; ctx.strokeStyle='#E8B830'; ctx.lineWidth=2;
  ctx.beginPath();
  const cy=G_H*0.06;
  ctx.moveTo(G_W*0.2,cy+12);ctx.lineTo(G_W*0.28,cy);ctx.lineTo(G_W*0.38,cy+8);
  ctx.lineTo(G_W*0.50,cy-4);ctx.lineTo(G_W*0.62,cy+8);ctx.lineTo(G_W*0.72,cy);
  ctx.lineTo(G_W*0.80,cy+12);ctx.closePath();
  ctx.fill(); ctx.stroke();
  /* Pedras da coroa */
  [[0.28,cy],[0.50,cy-4],[0.72,cy]].forEach(([rx,ry])=>{
    ctx.beginPath(); ctx.arc(G_W*rx,ry,4,0,Math.PI*2);
    ctx.fillStyle='#FF6B6B'; ctx.fill();
  });

  /* Olho esquerdo */
  ctx.beginPath(); ctx.ellipse(G_W*0.35,G_H*0.45,9,10,0,0,Math.PI*2);
  ctx.fillStyle='#fff'; ctx.fill();
  ctx.beginPath(); ctx.arc(G_W*0.36,G_H*0.46,5.5,0,Math.PI*2);
  ctx.fillStyle='#1A2A5E'; ctx.fill();
  ctx.beginPath(); ctx.arc(G_W*0.38,G_H*0.44,2,0,Math.PI*2);
  ctx.fillStyle='#fff'; ctx.fill();

  /* Olho direito */
  ctx.beginPath(); ctx.ellipse(G_W*0.65,G_H*0.45,9,10,0,0,Math.PI*2);
  ctx.fillStyle='#fff'; ctx.fill();
  ctx.beginPath(); ctx.arc(G_W*0.66,G_H*0.46,5.5,0,Math.PI*2);
  ctx.fillStyle='#1A2A5E'; ctx.fill();
  ctx.beginPath(); ctx.arc(G_W*0.68,G_H*0.44,2,0,Math.PI*2);
  ctx.fillStyle='#fff'; ctx.fill();

  /* Boca — muda conforme o estado */
  const bocaAberta = estado.guardiaEstado==='liberado' ||
    (estado.desafioAtual>0 && !estado.modalAberto);
  ctx.strokeStyle='#1A2A5E'; ctx.lineWidth=3.5; ctx.lineCap='round';
  ctx.beginPath();
  if(bocaAberta){
    /* Sorriso aberto */
    ctx.moveTo(G_W*0.34,G_H*0.64); ctx.quadraticCurveTo(G_W*0.50,G_H*0.78,G_W*0.66,G_H*0.64);
  }else{
    /* Sorriso fechado */
    ctx.moveTo(G_W*0.36,G_H*0.64); ctx.quadraticCurveTo(G_W*0.50,G_H*0.73,G_W*0.64,G_H*0.64);
  }
  ctx.stroke();

  /* Manchas decorativas */
  [[0.22,0.65,'#FF8C6B'],[0.78,0.65,'#F9D776'],[0.50,0.30,'#C8A8FF']].forEach(([rx,ry,col])=>{
    ctx.beginPath(); ctx.arc(G_W*rx,G_H*ry,7,0,Math.PI*2);
    ctx.fillStyle=col; ctx.globalAlpha=0.65; ctx.fill(); ctx.globalAlpha=1;
  });

  /* Braço esquerdo */
  const brAng = Math.sin(tempo*2)*0.25;
  ctx.strokeStyle='#28A89E'; ctx.lineWidth=9; ctx.lineCap='round';
  ctx.beginPath();
  ctx.moveTo(G_W*0.15,G_H*0.52);
  ctx.lineTo(G_W*0.15-20*Math.cos(brAng), G_H*0.40-20*Math.sin(brAng));
  ctx.stroke();

  /* Braço direito */
  ctx.beginPath();
  ctx.moveTo(G_W*0.85,G_H*0.52);
  ctx.lineTo(G_W*0.85+20*Math.cos(brAng), G_H*0.40-20*Math.sin(brAng));
  ctx.stroke();

  /* Estrelinhas ao redor quando liberado */
  if(estado.guardiaEstado==='liberado'){
    for(let s=0;s<5;s++){
      const ang=tempo*2+s*(Math.PI*2/5);
      const sr=G_W*0.7, sx=G_W/2+sr*Math.cos(ang), sy=G_H/2+sr*Math.sin(ang);
      ctx.beginPath(); ctx.arc(sx,sy,4+Math.sin(tempo*4+s)*2,0,Math.PI*2);
      ctx.fillStyle=['#FFD166','#FF8C6B','#5BB8A0','#C8A8FF','#FF6B6B'][s];
      ctx.globalAlpha=0.6+0.4*Math.abs(Math.sin(tempo*3+s));
      ctx.fill(); ctx.globalAlpha=1;
    }
  }

  /* Balão de fala do Guardião no canvas */
  if(estado.guardiaEstado==='encontro'){
    const bX=G_W/2;
    const bY=-18;
    const texto='PARA! Prove seu talento!';
    ctx.save();
    ctx.font="bold 11px 'Nunito',sans-serif";
    const tw=ctx.measureText(texto).width;
    const bW=tw+20, bH=30, bR=10;
    /* Caixa branca do balão */
    ctx.fillStyle='#fff';
    ctx.strokeStyle='#E8864A';
    ctx.lineWidth=2.5;
    ctx.beginPath();
    ctx.roundRect(bX-bW/2, bY-bH, bW, bH, bR);
    ctx.fill(); ctx.stroke();
    /* Pontinha do balão */
    ctx.beginPath();
    ctx.moveTo(bX-8,bY); ctx.lineTo(bX,bY+10); ctx.lineTo(bX+8,bY);
    ctx.fillStyle='#fff'; ctx.fill();
    ctx.strokeStyle='#E8864A'; ctx.lineWidth=2.5;
    ctx.beginPath();
    ctx.moveTo(bX-8,bY+1); ctx.lineTo(bX,bY+11); ctx.lineTo(bX+8,bY+1);
    ctx.stroke();
    /* Texto */
    ctx.fillStyle='#7A3A10';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(texto, bX, bY-bH/2);
    ctx.restore();
  }

  /* Pontinhos de progresso dos desafios */
  const totalD=DESAFIOS.length;
  const dotStart=G_W/2-(totalD*14)/2;
  for(let d=0;d<totalD;d++){
    ctx.beginPath();
    ctx.arc(dotStart+d*14+7, G_H+28, 5, 0, Math.PI*2);
    ctx.fillStyle = estado.progDesafios[d]?'#FFD166':'rgba(200,150,80,0.35)';
    ctx.fill();
    if(estado.progDesafios[d]){
      ctx.strokeStyle='#C89020'; ctx.lineWidth=1.5; ctx.stroke();
    }
  }

  ctx.restore();
}


function desenharMeta(){
  const mx=META_X-estado.camera, base=CHAO_Y();
  if(mx<-80||mx>canvas.width+80) return;

  const altPoste=90;
  const by=base-altPoste;

  ctx.save();

  /* Poste */
  ctx.strokeStyle='#8D6E63'; ctx.lineWidth=4; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(mx,base); ctx.lineTo(mx,by); ctx.stroke();

  /* Bandeira vermelha ondulante */
  const wag=Math.sin(tempo*4)*3;
  const flag=new Path2D();
  flag.moveTo(mx,by); flag.lineTo(mx+30,by+9+wag); flag.lineTo(mx,by+20); flag.closePath();
  ctx.fillStyle='#FF4444'; ctx.fill(flag);

  /* Listra branca diagonal */
  ctx.strokeStyle='rgba(255,255,255,0.7)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(mx+4,by+3); ctx.lineTo(mx+26,by+8+wag); ctx.stroke();

  /* Brilho pulsante quando o jogador está perto */
  if(META_X-estado.px<600){
    const pulse=0.4+0.35*Math.abs(Math.sin(tempo*3));
    ctx.globalAlpha=pulse; ctx.font='22px serif'; ctx.textAlign='center';
    ctx.fillText('✨',mx+14,by-10);
  }

  ctx.restore();
}

function desenharPersonagem(){
  const px=Math.round(estado.px-estado.camera), py=Math.round(estado.py);
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(px+SPRITE_W/2,CHAO_Y()+4,SPRITE_W/2*0.7,6,0,0,Math.PI*2);
  ctx.fillStyle='rgba(140,80,20,0.30)'; ctx.fill();
  if(!estado.viradoDireita){ctx.translate(px+SPRITE_W,0);ctx.scale(-1,1);ctx.translate(-px,0);}
  let balanco=0;
  if(estado.correndo&&estado.noChao) balanco=Math.sin(estado.animFrame*Math.PI/2)*2;
  let scaleY=1; if(!estado.noChao) scaleY=estado.vy<0?1.15:0.9;
  ctx.translate(px+SPRITE_W/2,py+SPRITE_H/2);
  ctx.rotate(balanco*0.04); ctx.scale(1,scaleY);
  ctx.translate(-(px+SPRITE_W/2),-(py+SPRITE_H/2));
  if(estado.personagemImg){
    ctx.shadowColor='rgba(255,180,60,0.8)'; ctx.shadowBlur=10;
    ctx.drawImage(estado.personagemImg,px,py,SPRITE_W,SPRITE_H);
    ctx.shadowBlur=0; ctx.drawImage(estado.personagemImg,px,py,SPRITE_W,SPRITE_H);
  }else{
    ctx.beginPath(); ctx.arc(px+SPRITE_W/2,py+SPRITE_H/2,SPRITE_W/2,0,Math.PI*2);
    ctx.fillStyle='#FF8C6B'; ctx.fill();
  }
  ctx.restore();
}

function desenharPontuacao(){
  ctx.save(); ctx.font="bold 18px 'Nunito',sans-serif";
  ctx.fillStyle='#7A3A10'; ctx.textAlign='right'; ctx.textBaseline='top';
  ctx.shadowColor='rgba(255,200,80,0.5)'; ctx.shadowBlur=4;
  ctx.fillText('⭐ '+pontos,canvas.width-14,54); ctx.restore();
}

/* ════════════════════════════════════════════
   LOOP PRINCIPAL
════════════════════════════════════════════ */
let rodando=true;
let pausado=false;
function loop(){
  if(!rodando || pausado) return;
  tempo+=0.018; atualizarFisica();
  ctx.clearRect(0,0,canvas.width,canvas.height);
  desenharCeu(); desenharFaiscas(); desenharNuvens();
  desenharTorres(); desenharChao(); desenharPlataformas();
  desenharMoedas(); desenharMeta();
  desenharGuardiao(); desenharPersonagem(); desenharPontuacao();
  /* Pingo observa o personagem */
  const _psx = (estado.px - estado.camera) + SPRITE_W / 2;
  const _psy = estado.py + SPRITE_H / 2;
  atualizarOlhosPingo(_psx, _psy);
  requestAnimationFrame(loop);
}

/* ════════════════════════════════════════════
   VITÓRIA
════════════════════════════════════════════ */
let jogo_concluido=false;
function verificarMeta(){
  if(jogo_concluido) return;
  const cx=estado.px+SPRITE_W/2;
  if(cx>=META_X-20&&cx<=META_X+70){ jogo_concluido=true; rodando=false; mostrarVitoria(); }
}
function mostrarVitoria(){
  try{ efeitoVitoria.currentTime=0; efeitoVitoria.play(); }catch(e){}
  const tv=document.getElementById('telaVitoria');
  const vp=document.getElementById('vitoriaPontos');
  const vm=document.getElementById('vitoriaMensagem');
  const pct=moedas.filter(m=>m.coletada).length/moedas.length;
  const n=pct>=0.9?3:pct>=0.5?2:1;
  const msg=[
    'Você fez o Lápis voltar! Obrigado! 🎨',
    'Incrível! O mundo está colorido de novo! 🌈',
    'LENDÁRIO! 3 pedaços + tudo coletado! Herói das cores! 🏅',
  ];
  vp.textContent='⭐ '+pontos+' pontos'; vm.textContent=msg[n-1];
  tv.classList.add('visivel');
  for(let i=1;i<=3;i++){
    const el=document.getElementById('estrelaV'+i);
    if(i<=n){ setTimeout(()=>el.classList.add('acesa'),i*350); }
    else{ el.style.filter='grayscale(1) opacity(0.25)'; el.style.opacity='0.3'; }
  }
  setTimeout(lancarConfete,300);
}
function lancarConfete(){
  /* Confete extra na fase final! */
  const cores=['#FFD166','#FF8C6B','#5BB8A0','#C8A8FF','#FF6B6B','#80D8FF','#98FF80'];
  for(let i=0;i<90;i++){
    const el=document.createElement('div'); el.className='confete-item';
    el.style.left=Math.random()*100+'vw';
    el.style.background=cores[Math.floor(Math.random()*cores.length)];
    el.style.animationDuration=(1.5+Math.random()*2.5)+'s';
    el.style.animationDelay=(Math.random()*1.5)+'s';
    el.style.width=(6+Math.random()*10)+'px'; el.style.height=(10+Math.random()*12)+'px';
    el.style.borderRadius=Math.random()>0.4?'50%':'2px';
    document.body.appendChild(el); setTimeout(()=>el.remove(),6000);
  }
}

/* ════════════════════════════════════════════
   PAUSE
════════════════════════════════════════════ */

/* =============================================
   SONS — fase 5
   Substitua os arquivos em assets/sounds/
============================================= */
const musica      = new Audio('assets/sounds/musica-fase5.mp3');
musica.loop       = true;
musica.volume     = 0.5;

const efeitoPulo  = new Audio('assets/sounds/pulo.mp3');
efeitoPulo.volume = 0.7;

const efeitoMoeda = new Audio('assets/sounds/moeda.mp3');
efeitoMoeda.volume = 0.8;

const efeitoVitoria = new Audio('assets/sounds/vitoria.mp3');
efeitoVitoria.volume = 0.9;

const efeitoPause = new Audio('assets/sounds/pause.mp3');
efeitoPause.volume = 0.6;

// Inicia música ao primeiro clique/toque (política do browser)
function iniciarMusica() {
  musica.play().catch(()=>{});
  document.removeEventListener('click', iniciarMusica);
  document.removeEventListener('keydown', iniciarMusica);
  document.removeEventListener('touchstart', iniciarMusica);
}
document.addEventListener('click', iniciarMusica);
document.addEventListener('keydown', iniciarMusica);
document.addEventListener('touchstart', iniciarMusica);

const btnPause     = document.getElementById('btnPause');
const menuPause    = document.getElementById('menuPause');
const btnContinuar = document.getElementById('btnContinuar');
const volumeJogo   = document.getElementById('volumeJogo');

function abrirPause() {
  try{ efeitoPause.currentTime=0; efeitoPause.play(); }catch(e){}
  if (jogo_concluido || estado.modalAberto) return;
  pausado = true;
  musica.pause();
  menuPause.classList.add('visivel');
}

function fecharPause() {
  pausado = false;
  musica.play().catch(()=>{});
  menuPause.classList.remove('visivel');
  if (rodando) requestAnimationFrame(loop);
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
  musica.volume      = volume * 0.5;
  efeitoPulo.volume  = volume * 0.7;
    efeitoMoeda.volume = volume;
  efeitoVitoria.volume = volume * 0.9;
  efeitoPause.volume   = volume * 0.6;
  localStorage.setItem('volume_jogo', volume);
});

const volumeSalvo = localStorage.getItem('volume_jogo');
if (volumeSalvo !== null) volumeJogo.value = volumeSalvo * 100;

/* ── INICIAR ── */
carregarPersonagem();
