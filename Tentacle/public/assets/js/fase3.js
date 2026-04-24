/* =============================================
   DESENHA MUNDO — FASE 3
   "O Deserto da Tormenta"

   ENREDO: O 2º pedaço do Lápis caiu no
   Deserto de Areia Roxa. Uma tempestade de
   raios bloqueia o caminho. Para atravessar,
   o jogador desenha um ESCUDO no modal —
   o traçado vira PNG transparente e flutua
   sobre o personagem enquanto os raios caem.

   DIFERENÇAS das fases anteriores:
   • Cenário: deserto roxo, dunas, cactus
   • Botão flutuante → modal de desenho
   • Escudo = PNG do traço (sem fundo branco)
     aparece sobre o personagem no canvas
   • Raios caem com aviso visual (círculo)
     e impacto com flash de tela
   • 3 vidas; sem vidas → volta ao início
     da zona (nunca ao começo do jogo)
   • Escudo ativo = invulnerável aos raios
============================================= */

const canvas=document.getElementById('gameCanvas');
const ctx=canvas.getContext('2d');
function redimensionar(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;}
redimensionar();window.addEventListener('resize',redimensionar);

/* ════════════════════════════════════════════
   ESTADO
════════════════════════════════════════════ */
const estado={
  personagemImg:null,
  escudoImg:null,        /* ImageBitmap PNG transparente do escudo */
  px:0,py:0,vx:0,vy:0,
  noChao:true,viradoDireita:true,
  animFrame:0,animTimer:0,camera:0,teclas:{},correndo:false,
  mundoLargura:5000,
  vidas:3,
  escudoAtivo:false,
  naZona:false,          /* dentro da zona de raios */
  zonaPassada:false,
  modalAberto:false,
  invulneravel:false,
};

const SPRITE_W=72,SPRITE_H=72,VELOCIDADE=3.4,GRAVIDADE=0.56,PULO=-13;
const ZONA_INI=1800,ZONA_FIM=3200;
const META_X=4750;

/* ════════════════════════════════════════════
   CARREGAR PERSONAGEM — PNG transparente
════════════════════════════════════════════ */
const telaCarregando=document.getElementById('telaCarregando');
const loadBarra=document.getElementById('loadBarra');
const avisoSemPersonagem=document.getElementById('avisoSemPersonagem');

function simularBarra(cb){
  let p=0;const iv=setInterval(()=>{
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
  oc.width=dados.canvas.largura;oc.height=dados.canvas.altura;
  const octx=oc.getContext('2d');octx.lineCap='round';octx.lineJoin='round';
  dados.tracos.forEach(t=>{
    if(!t.pontos||t.pontos.length<2)return;
    octx.beginPath();octx.strokeStyle=t.cor;octx.lineWidth=t.espessura;
    octx.moveTo(t.pontos[0].x,t.pontos[0].y);
    for(let i=1;i<t.pontos.length;i++)octx.lineTo(t.pontos[i].x,t.pontos[i].y);
    octx.stroke();
  });
  createImageBitmap(oc).then(bmp=>{estado.personagemImg=bmp;simularBarra(()=>iniciarJogo());});
}
function mostrarAviso(){telaCarregando.style.display='none';avisoSemPersonagem.classList.add('visivel');}

/* ════════════════════════════════════════════
   CENÁRIO — DESERTO ROXO
════════════════════════════════════════════ */
const MUNDO_W=estado.mundoLargura;
function lerp(a,b,t){return a+(b-a)*t;}

const estrelas=Array.from({length:90},()=>({
  x:Math.random()*MUNDO_W,y:8+Math.random()*180,
  r:0.5+Math.random()*1.6,fase:Math.random()*Math.PI*2,
}));
const nuvens=Array.from({length:20},()=>({
  x:Math.random()*MUNDO_W,y:30+Math.random()*100,
  r:50+Math.random()*80,alpha:0.55+Math.random()*0.35,vel:0.06+Math.random()*0.10,
}));
const pedras=Array.from({length:24},(_,i)=>({
  x:150+i*200+Math.random()*80,w:22+Math.random()*30,h:14+Math.random()*20,
}));
const cactus=Array.from({length:12},(_,i)=>({
  x:120+i*380+Math.random()*100,h:40+Math.random()*35,
}));

const CHAO_Y=()=>canvas.height-100;

const plataformas=[
  {x:350,y:()=>CHAO_Y()-80,w:155},{x:660,y:()=>CHAO_Y()-70,w:160},
  {x:960,y:()=>CHAO_Y()-85,w:150},{x:1260,y:()=>CHAO_Y()-75,w:155},
  {x:1560,y:()=>CHAO_Y()-80,w:150},
  /* zona 1800–3200 — chão reto */
  {x:3300,y:()=>CHAO_Y()-75,w:155},{x:3600,y:()=>CHAO_Y()-80,w:150},
  {x:3900,y:()=>CHAO_Y()-75,w:160},{x:4200,y:()=>CHAO_Y()-80,w:155},
  {x:4500,y:()=>CHAO_Y()-75,w:150},
];

const moedas=[];
plataformas.forEach(p=>{
  for(let i=0;i<2;i++)moedas.push({x:p.x+p.w*(0.3+i*0.4),y:()=>p.y()-28,coletada:false});
});
for(let i=0;i<24;i++){
  const mx=200+i*180;
  if(mx>ZONA_INI-80&&mx<ZONA_FIM+80)continue;
  moedas.push({x:mx,y:()=>CHAO_Y()-50,coletada:false});
}
let pontos=0;

/* ════════════════════════════════════════════
   SISTEMA DE RAIOS
════════════════════════════════════════════ */
const raios=[];
let timerRaio=90;
let flashTimer=0;

function gerarRaio(){
  raios.push({x:ZONA_INI+80+Math.random()*(ZONA_FIM-ZONA_INI-160),fase:0,timer:0,acertou:false});
}
function atualizarRaios(){
  if(!estado.naZona||estado.zonaPassada)return;
  timerRaio--;
  if(timerRaio<=0){gerarRaio();timerRaio=55+Math.floor(Math.random()*50);}
  for(let i=raios.length-1;i>=0;i--){
    const r=raios[i];r.timer++;
    if(r.fase===0&&r.timer>40){r.fase=1;r.timer=0;}
    if(r.fase===1){
      if(!r.acertou&&!estado.escudoAtivo&&!estado.invulneravel){
        const rx=r.x-estado.camera,pcx=estado.px+SPRITE_W/2-estado.camera;
        if(Math.abs(rx-pcx)<55){r.acertou=true;levarDano();}
      }
      if(r.timer>8){r.fase=2;r.timer=0;}
    }
    if(r.fase===2&&r.timer>25)raios.splice(i,1);
  }
}

/* ════════════════════════════════════════════
   VIDAS
════════════════════════════════════════════ */
const barraVida=document.getElementById('barraVida');
function criarBarraVida(){
  barraVida.innerHTML='<span class="vida-label">❤️</span>';
  for(let i=0;i<3;i++){
    const c=document.createElement('span');c.className='vida-coracao';c.id='coracao'+i;c.textContent='❤️';
    barraVida.appendChild(c);
  }
}
function atualizarCoracoes(){
  for(let i=0;i<3;i++){const el=document.getElementById('coracao'+i);if(el)el.classList.toggle('perdido',i>=estado.vidas);}
}
function levarDano(){
  if(estado.invulneravel)return;
  estado.vidas--;atualizarCoracoes();
  flashTimer=6;document.getElementById('flashRaio').classList.add('aceso');
  estado.invulneravel=true;
  setTimeout(()=>{estado.invulneravel=false;},1400);
  if(estado.vidas<=0)setTimeout(reiniciarZona,700);
}
function reiniciarZona(){
  estado.vidas=3;atualizarCoracoes();
  estado.px=ZONA_INI-120;estado.py=CHAO_Y()-SPRITE_H;
  estado.vx=0;estado.vy=0;
  estado.escudoAtivo=false;estado.escudoImg=null;
  raios.length=0;timerRaio=90;
  /* Se perdeu todas as vidas, mostra o botão novamente */
  mostrarBotaoEscudo();
}

/* ════════════════════════════════════════════
   MODAL DO ESCUDO
════════════════════════════════════════════ */
const btnAbrirEscudo=document.getElementById('btnAbrirEscudo');
const modalEscudo=document.getElementById('modalEscudo');
let canvasEscudo,ctxEscudo;
let desenhandoEscudo=false,corEscudo='#3A3530',espEscudo=9,primEscudo=true;
let tracosEscudo=[],tracoEscudoAtual=null;

function mostrarBotaoEscudo(){
  if(estado.escudoAtivo||estado.modalAberto)return;
  btnAbrirEscudo.classList.add('visivel');
  btnAbrirEscudo.setAttribute('aria-hidden','false');
}
function esconderBotaoEscudo(){
  btnAbrirEscudo.classList.remove('visivel');
  btnAbrirEscudo.setAttribute('aria-hidden','true');
}
function abrirModalEscudo(){
  estado.modalAberto=true;esconderBotaoEscudo();
  modalEscudo.setAttribute('aria-hidden','false');modalEscudo.classList.add('visivel');
}
function fecharModalEscudo(){
  modalEscudo.classList.remove('visivel');modalEscudo.setAttribute('aria-hidden','true');
  setTimeout(()=>{estado.modalAberto=false;},400);
}

function iniciarModalEscudo(){
  canvasEscudo=document.getElementById('canvasEscudo');
  ctxEscudo=canvasEscudo.getContext('2d');
  ctxEscudo.lineCap='round';ctxEscudo.lineJoin='round';
  /* SEM fillRect branco — transparente desde o início */

  canvasEscudo.addEventListener('mousedown', iniTracoEscudo);
  canvasEscudo.addEventListener('mousemove', contTracoEscudo);
  canvasEscudo.addEventListener('mouseup',   fimTracoEscudo);
  canvasEscudo.addEventListener('mouseleave',fimTracoEscudo);
  canvasEscudo.addEventListener('touchstart',e=>{e.preventDefault();iniTracoEscudo(e.touches[0]);},{passive:false});
  canvasEscudo.addEventListener('touchmove', e=>{e.preventDefault();contTracoEscudo(e.touches[0]);},{passive:false});
  canvasEscudo.addEventListener('touchend',  e=>{e.preventDefault();fimTracoEscudo();},{passive:false});

  document.querySelectorAll('#modalEscudo .modal-cor').forEach(btn=>{
    btn.addEventListener('click',function(){
      document.querySelectorAll('#modalEscudo .modal-cor').forEach(b=>b.classList.remove('ativo'));
      this.classList.add('ativo');corEscudo=this.dataset.cor;
    });
  });
  document.querySelectorAll('#modalEscudo .modal-esp').forEach(btn=>{
    btn.addEventListener('click',function(){
      document.querySelectorAll('#modalEscudo .modal-esp').forEach(b=>b.classList.remove('ativo'));
      this.classList.add('ativo');espEscudo=parseInt(this.dataset.esp);
    });
  });
  document.getElementById('btnLimparEscudo').addEventListener('click',()=>{
    ctxEscudo.clearRect(0,0,canvasEscudo.width,canvasEscudo.height);
    tracosEscudo=[];primEscudo=true;
    document.getElementById('dicaCanvasEscudo').style.opacity='1';
  });
  document.getElementById('btnDesenharEscudo').addEventListener('click',abrirModalEscudo);
  document.getElementById('btnCancelarEscudo').addEventListener('click',()=>{
    fecharModalEscudo();
    if(!estado.escudoAtivo)setTimeout(mostrarBotaoEscudo,450);
  });
  document.getElementById('btnConfirmarEscudo').addEventListener('click',confirmarEscudo);
}

function posEscudo(e){
  const rect=canvasEscudo.getBoundingClientRect();
  return{x:(e.clientX-rect.left)*(canvasEscudo.width/rect.width),
         y:(e.clientY-rect.top)*(canvasEscudo.height/rect.height)};
}
function iniTracoEscudo(e){
  desenhandoEscudo=true;const pos=posEscudo(e);
  if(primEscudo){document.getElementById('dicaCanvasEscudo').style.opacity='0';primEscudo=false;}
  tracoEscudoAtual={cor:corEscudo,espessura:espEscudo,pontos:[{x:pos.x,y:pos.y}]};
  ctxEscudo.beginPath();ctxEscudo.moveTo(pos.x,pos.y);
  ctxEscudo.strokeStyle=corEscudo;ctxEscudo.lineWidth=espEscudo;
}
function contTracoEscudo(e){
  if(!desenhandoEscudo||!tracoEscudoAtual)return;
  const pos=posEscudo(e);tracoEscudoAtual.pontos.push({x:pos.x,y:pos.y});
  ctxEscudo.lineTo(pos.x,pos.y);ctxEscudo.stroke();
}
function fimTracoEscudo(){
  if(!desenhandoEscudo||!tracoEscudoAtual)return;
  desenhandoEscudo=false;ctxEscudo.closePath();
  if(tracoEscudoAtual.pontos.length>1)tracosEscudo.push(tracoEscudoAtual);
  tracoEscudoAtual=null;
}

/**
 * Valida e converte para PNG transparente.
 * Reconstrói os traços em canvas offscreen SEM fillRect branco.
 */
function confirmarEscudo(){
  const dados=ctxEscudo.getImageData(0,0,canvasEscudo.width,canvasEscudo.height).data;
  let coloridos=0;
  for(let i=0;i<dados.length;i+=24){if(dados[i+3]>120)coloridos++;}
  if(coloridos<60||tracosEscudo.length===0){
    const btn=document.getElementById('btnConfirmarEscudo');
    btn.style.transform='translateX(-5px)';
    setTimeout(()=>{btn.style.transform='translateX(5px)';},80);
    setTimeout(()=>{btn.style.transform='translateX(0)';},160);
    const dica=document.getElementById('dicaCanvasEscudo');
    dica.style.opacity='0.85';dica.textContent='Desenhe mais! ✏️';
    setTimeout(()=>{dica.style.opacity='0';dica.textContent='✏️ Desenhe o escudo aqui!';},1600);
    return;
  }

  /* Bounding box */
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  tracosEscudo.forEach(t=>{
    const e=t.espessura/2;
    t.pontos.forEach(p=>{
      if(p.x-e<minX)minX=p.x-e;if(p.y-e<minY)minY=p.y-e;
      if(p.x+e>maxX)maxX=p.x+e;if(p.y+e>maxY)maxY=p.y+e;
    });
  });
  const pad=8;
  minX=Math.max(0,Math.floor(minX-pad));minY=Math.max(0,Math.floor(minY-pad));
  maxX=Math.min(canvasEscudo.width,Math.ceil(maxX+pad));
  maxY=Math.min(canvasEscudo.height,Math.ceil(maxY+pad));

  /* Canvas offscreen SEM fundo */
  const oc=document.createElement('canvas');
  oc.width=maxX-minX;oc.height=maxY-minY;
  const octx=oc.getContext('2d');octx.lineCap='round';octx.lineJoin='round';
  /* NÃO fazemos fillRect — fundo 100% transparente */
  tracosEscudo.forEach(t=>{
    if(!t.pontos||t.pontos.length<2)return;
    octx.beginPath();octx.strokeStyle=t.cor;octx.lineWidth=t.espessura;
    octx.moveTo(t.pontos[0].x-minX,t.pontos[0].y-minY);
    for(let i=1;i<t.pontos.length;i++)octx.lineTo(t.pontos[i].x-minX,t.pontos[i].y-minY);
    octx.stroke();
  });

  createImageBitmap(oc).then(bmp=>{
    estado.escudoImg=bmp;estado.escudoAtivo=true;
    pontos+=30;fecharModalEscudo();esconderBotaoEscudo();
  });
}

/* ════════════════════════════════════════════
   INICIAR JOGO
════════════════════════════════════════════ */
function iniciarJogo(){
  estado.px=80;estado.py=CHAO_Y()-SPRITE_H;
  telaCarregando.classList.add('saindo');
  setTimeout(()=>{telaCarregando.style.display='none';},700);
  setTimeout(()=>{document.getElementById('dicaBalao').classList.add('oculto');},4000);
  criarBarraVida();iniciarModalEscudo();loop();
}

/* ════════════════════════════════════════════
   INPUT
════════════════════════════════════════════ */
document.addEventListener('keydown',e=>{estado.teclas[e.code]=true;});
document.addEventListener('keyup',  e=>{estado.teclas[e.code]=false;});
const btnE=document.getElementById('btnEsquerda');
const btnD=document.getElementById('btnDireita');
function pressionarBtn(btn,code,ativo){btn.classList.toggle('pressionado',ativo);estado.teclas[code]=ativo;}
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
  const esq=estado.teclas['ArrowLeft']||estado.teclas['KeyA'];
  const dir=estado.teclas['ArrowRight']||estado.teclas['KeyD'];
  const pulo=estado.teclas['ArrowUp']||estado.teclas['KeyW']||estado.teclas['Space'];
  if(dir)      {estado.vx=VELOCIDADE; estado.viradoDireita=true;  estado.correndo=true;}
  else if(esq) {estado.vx=-VELOCIDADE;estado.viradoDireita=false; estado.correndo=true;}
  else         {estado.vx*=0.82;estado.correndo=false;}
  if(pulo&&estado.noChao){estado.vy=PULO;estado.noChao=false;}
  estado.vy+=GRAVIDADE;estado.px+=estado.vx;estado.py+=estado.vy;
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
    if(m.coletada)return;const my=m.y();
    if(Math.abs(estado.px+SPRITE_W/2-m.x)<30&&Math.abs(estado.py+SPRITE_H/2-my)<30){m.coletada=true;pontos+=10;}
  });
  const alvo=estado.px-canvas.width/3;
  estado.camera+=(alvo-estado.camera)*0.1;
  if(estado.camera<0)estado.camera=0;
  if(estado.camera>estado.mundoLargura-canvas.width)estado.camera=estado.mundoLargura-canvas.width;
  if(estado.correndo&&estado.noChao){
    estado.animTimer++;
    if(estado.animTimer>8){estado.animFrame=(estado.animFrame+1)%4;estado.animTimer=0;}
  }else if(!estado.correndo){estado.animFrame=0;}

  /* Detecta entrada na zona */
  const cx=estado.px+SPRITE_W/2;
  if(cx>ZONA_INI&&cx<ZONA_FIM&&!estado.naZona&&!estado.zonaPassada){
    estado.naZona=true;
    barraVida.classList.add('visivel');
    if(!estado.escudoAtivo)mostrarBotaoEscudo();
  }
  if(estado.naZona&&cx>=ZONA_FIM){
    estado.naZona=false;estado.zonaPassada=true;
    barraVida.classList.remove('visivel');raios.length=0;
    if(estado.vidas===3)pontos+=50;
  }

  atualizarRaios();

  /* Flash */
  if(flashTimer>0){flashTimer--;if(flashTimer===0)document.getElementById('flashRaio').classList.remove('aceso');}

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
  grad.addColorStop(0,`rgb(${lerp(20,10,p)|0},${lerp(10,4,p)|0},${lerp(40,20,p)|0})`);
  grad.addColorStop(0.5,`rgb(${lerp(60,30,p)|0},${lerp(20,8,p)|0},${lerp(100,50,p)|0})`);
  grad.addColorStop(1,`rgb(${lerp(80,50,p)|0},${lerp(32,16,p)|0},${lerp(20,10,p)|0})`);
  ctx.fillStyle=grad;ctx.fillRect(0,0,canvas.width,canvas.height);
}
function desenharEstrelas(){
  const vis=Math.min(1,progresso()*3);if(vis<=0)return;
  estrelas.forEach(e=>{
    const sx=e.x-estado.camera*0.03;
    if(sx<-4||sx>canvas.width+4||e.y>canvas.height*0.45)return;
    const b=vis*(0.3+0.6*Math.abs(Math.sin(tempo+e.fase)));
    ctx.beginPath();ctx.arc(sx,e.y,e.r,0,Math.PI*2);
    ctx.fillStyle=`rgba(220,200,255,${b})`;ctx.fill();
  });
}
function desenharNuvens(){
  nuvens.forEach(n=>{
    const off=((n.x-estado.camera*0.22+tempo*n.vel*55)%(MUNDO_W+400)+MUNDO_W+400)%(MUNDO_W+400)-200;
    if(off<-250||off>canvas.width+250)return;
    ctx.save();ctx.globalAlpha=n.alpha;ctx.fillStyle='#1A0830';
    ctx.beginPath();
    ctx.arc(off,n.y,n.r,0,Math.PI*2);ctx.arc(off+n.r*0.9,n.y-n.r*0.35,n.r*0.8,0,Math.PI*2);
    ctx.arc(off-n.r*0.8,n.y-n.r*0.2,n.r*0.7,0,Math.PI*2);ctx.arc(off+n.r*1.6,n.y+n.r*0.1,n.r*0.6,0,Math.PI*2);
    ctx.fill();ctx.restore();
  });
}
function desenharDunas(){
  const h=canvas.height;
  ctx.beginPath();ctx.moveTo(0,h);
  for(let x=0;x<=canvas.width+40;x+=16){
    const wx=x+estado.camera*0.28;
    ctx.lineTo(x,h-130+Math.sin(wx*0.0015)*55+Math.sin(wx*0.004+1)*28);
  }
  ctx.lineTo(canvas.width,h);ctx.closePath();ctx.fillStyle='rgba(50,22,80,0.7)';ctx.fill();
  ctx.beginPath();ctx.moveTo(0,h);
  for(let x=0;x<=canvas.width+40;x+=12){
    const wx=x+estado.camera*0.55;
    ctx.lineTo(x,h-75+Math.sin(wx*0.002+2)*36+Math.sin(wx*0.006)*18);
  }
  ctx.lineTo(canvas.width,h);ctx.closePath();ctx.fillStyle='rgba(60,28,90,0.82)';ctx.fill();
}
function desenharChao(){
  const chaoY=CHAO_Y();
  const grad=ctx.createLinearGradient(0,chaoY,0,canvas.height);
  grad.addColorStop(0,'#3D1A60');grad.addColorStop(0.15,'#2A1040');grad.addColorStop(1,'#180828');
  ctx.fillStyle=grad;ctx.fillRect(0,chaoY,canvas.width,canvas.height-chaoY);
  ctx.fillStyle='#5A2A80';ctx.fillRect(0,chaoY,canvas.width,6);
  /* Faixa da zona de tempestade */
  if(!estado.zonaPassada){
    const tx1=ZONA_INI-estado.camera,tx2=ZONA_FIM-estado.camera;
    if(tx1<canvas.width&&tx2>0){
      ctx.fillStyle='rgba(120,40,200,0.14)';
      ctx.fillRect(Math.max(0,tx1),chaoY,Math.min(canvas.width,tx2)-Math.max(0,tx1),canvas.height-chaoY);
    }
  }
}
function desenharPedras(){
  pedras.forEach(p=>{
    const px=p.x-estado.camera,py=CHAO_Y()-p.h+4;
    if(px<-40||px>canvas.width+40)return;
    const g=ctx.createLinearGradient(px,py,px,py+p.h);
    g.addColorStop(0,'#4A2268');g.addColorStop(1,'#2A1040');
    ctx.fillStyle=g;ctx.beginPath();ctx.roundRect(px-p.w/2,py,p.w,p.h,[p.h*0.4,p.h*0.4,4,4]);ctx.fill();
  });
}
function desenharCactus(){
  cactus.forEach(c=>{
    const cx=c.x-estado.camera,base=CHAO_Y();
    if(cx<-30||cx>canvas.width+30)return;
    ctx.fillStyle='#2A1A50';
    ctx.fillRect(cx-5,base-c.h,10,c.h);
    ctx.fillRect(cx-18,base-c.h*0.65,13,7);ctx.fillRect(cx+5,base-c.h*0.45,13,7);
    ctx.fillRect(cx-18,base-c.h*0.65-14,7,15);ctx.fillRect(cx+11,base-c.h*0.45-14,7,15);
  });
}
function desenharPlataformas(){
  plataformas.forEach(p=>{
    const px=p.x-estado.camera,py=p.y();
    if(px>canvas.width+20||px+p.w<-20)return;
    ctx.fillStyle='rgba(0,0,0,0.28)';ctx.beginPath();ctx.roundRect(px+4,py+6,p.w,22,8);ctx.fill();
    const g=ctx.createLinearGradient(0,py,0,py+22);
    g.addColorStop(0,'#5A2880');g.addColorStop(1,'#321448');
    ctx.fillStyle=g;ctx.beginPath();ctx.roundRect(px,py,p.w,22,8);ctx.fill();
    const t=ctx.createLinearGradient(px,py,px+p.w,py);
    t.addColorStop(0,'#7A3AA0');t.addColorStop(0.5,'#9A4AC0');t.addColorStop(1,'#7A3AA0');
    ctx.fillStyle=t;ctx.beginPath();ctx.roundRect(px,py,p.w,9,[8,8,0,0]);ctx.fill();
  });
}
function desenharMoedas(){
  moedas.forEach(m=>{
    if(m.coletada)return;const mx=m.x-estado.camera;
    if(mx<-20||mx>canvas.width+20)return;
    const my=m.y()+Math.sin(tempo*3+m.x*0.01)*4;
    const glow=ctx.createRadialGradient(mx,my,2,mx,my,16);
    glow.addColorStop(0,'rgba(200,160,255,0.4)');glow.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=glow;ctx.beginPath();ctx.arc(mx,my,16,0,Math.PI*2);ctx.fill();
    ctx.save();ctx.beginPath();ctx.arc(mx,my,10,0,Math.PI*2);
    ctx.fillStyle='#C8A8FF';ctx.fill();ctx.strokeStyle='#8050C0';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='#6030A0';ctx.font="bold 10px 'Nunito',sans-serif";
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('★',mx,my);ctx.restore();
  });
}

function desenharRaios(){
  const chaoY=CHAO_Y();
  raios.forEach(r=>{
    const rx=r.x-estado.camera;if(rx<-40||rx>canvas.width+40)return;
    if(r.fase===0){
      /* Aviso: círculo pulsante no chão */
      const alpha=0.3+0.5*Math.sin(r.timer*0.3);
      ctx.beginPath();ctx.arc(rx,chaoY-2,12+Math.sin(r.timer*0.5)*5,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,220,80,${alpha*0.35})`;ctx.fill();
      ctx.beginPath();ctx.arc(rx,chaoY-2,5,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,240,120,${alpha})`;ctx.fill();
    }
    if(r.fase===1){
      /* Impacto */
      const alpha=1-r.timer/8;
      ctx.save();ctx.globalAlpha=alpha;
      function zz(lw,cor){
        ctx.strokeStyle=cor;ctx.lineWidth=lw;ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(rx,-20);
        for(let i=0;i<8;i++){const d=(i%2===0?1:-1)*(14+Math.sin(i*1.4)*10);ctx.lineTo(rx+d,-20+(chaoY+20)/8*(i+1));}
        ctx.stroke();
      }
      zz(22,'rgba(200,160,255,0.4)');zz(10,'rgba(220,180,255,0.75)');zz(3,'#FFFFF0');
      const imp=ctx.createRadialGradient(rx,chaoY,0,rx,chaoY,60);
      imp.addColorStop(0,'rgba(255,240,100,0.8)');imp.addColorStop(1,'rgba(255,180,50,0)');
      ctx.fillStyle=imp;ctx.beginPath();ctx.arc(rx,chaoY,60,0,Math.PI*2);ctx.fill();
      ctx.restore();
    }
    if(r.fase===2){
      const alpha=0.3*(1-r.timer/25);
      ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle='rgba(180,140,255,0.6)';ctx.lineWidth=5;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(rx,-20);
      for(let i=0;i<8;i++){const d=(i%2===0?1:-1)*(14+Math.sin(i*1.4)*10);ctx.lineTo(rx+d,-20+(chaoY+20)/8*(i+1));}
      ctx.stroke();ctx.restore();
    }
  });
}

function desenharMeta(){
  const mx=META_X-estado.camera,base=CHAO_Y();
  if(mx<-80||mx>canvas.width+80)return;
  const halo=ctx.createRadialGradient(mx,base-55,6,mx,base-55,85);
  halo.addColorStop(0,'rgba(200,160,255,0.28)');halo.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=halo;ctx.beginPath();ctx.arc(mx,base-55,85,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#5A2880';ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(mx,base);ctx.lineTo(mx,base-105);ctx.stroke();
  const fg=ctx.createLinearGradient(mx,base-105,mx+50,base-68);
  fg.addColorStop(0,'#7C5CBF');fg.addColorStop(1,'#FFD166');
  ctx.fillStyle=fg;ctx.beginPath();
  ctx.moveTo(mx,base-105);ctx.lineTo(mx+50,base-82);ctx.lineTo(mx,base-60);ctx.closePath();ctx.fill();
  ctx.save();ctx.font="bold 15px 'Nunito',sans-serif";ctx.fillStyle='#fff';
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🏁',mx+18,base-82);ctx.restore();
}

function desenharPersonagem(){
  const px=Math.round(estado.px-estado.camera),py=Math.round(estado.py);
  ctx.save();
  ctx.beginPath();ctx.ellipse(px+SPRITE_W/2,CHAO_Y()+4,SPRITE_W/2*0.7,6,0,0,Math.PI*2);
  ctx.fillStyle='rgba(40,0,60,0.40)';ctx.fill();
  if(!estado.viradoDireita){ctx.translate(px+SPRITE_W,0);ctx.scale(-1,1);ctx.translate(-px,0);}
  let balanco=0;
  if(estado.correndo&&estado.noChao)balanco=Math.sin(estado.animFrame*Math.PI/2)*2;
  let scaleY=1;if(!estado.noChao)scaleY=estado.vy<0?1.15:0.9;
  ctx.translate(px+SPRITE_W/2,py+SPRITE_H/2);ctx.rotate(balanco*0.04);ctx.scale(1,scaleY);
  ctx.translate(-(px+SPRITE_W/2),-(py+SPRITE_H/2));
  if(estado.invulneravel&&Math.floor(tempo*18)%2===0)ctx.globalAlpha=0.35;
  if(estado.personagemImg){
    ctx.shadowColor='rgba(180,100,255,0.85)';ctx.shadowBlur=10;
    ctx.drawImage(estado.personagemImg,px,py,SPRITE_W,SPRITE_H);
    ctx.shadowBlur=0;ctx.drawImage(estado.personagemImg,px,py,SPRITE_W,SPRITE_H);
  }else{
    ctx.beginPath();ctx.arc(px+SPRITE_W/2,py+SPRITE_H/2,SPRITE_W/2,0,Math.PI*2);
    ctx.fillStyle='#FF8C6B';ctx.fill();
  }
  ctx.globalAlpha=1;

  /* ── Escudo PNG sobre o personagem ── */
  if(estado.escudoAtivo&&estado.escudoImg){
    const escW=SPRITE_W*1.8,escH=SPRITE_H*1.8;
    const escX=px+SPRITE_W/2-escW/2,escY=py+SPRITE_H/2-escH/2-10;
    /* Halo pulsante */
    const pulso=0.5+0.4*Math.sin(tempo*4);
    const halo=ctx.createRadialGradient(px+SPRITE_W/2,py+SPRITE_H/2,10,px+SPRITE_W/2,py+SPRITE_H/2,escW*0.7);
    halo.addColorStop(0,`rgba(150,100,255,${pulso*0.2})`);
    halo.addColorStop(0.6,`rgba(100,60,200,${pulso*0.10})`);
    halo.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=halo;ctx.beginPath();ctx.arc(px+SPRITE_W/2,py+SPRITE_H/2,escW*0.7,0,Math.PI*2);ctx.fill();
    /* O traço desenhado — fundo transparente, apenas o traço */
    ctx.globalAlpha=0.9;
    ctx.drawImage(estado.escudoImg,escX,escY,escW,escH);
    ctx.globalAlpha=1;
  }
  ctx.restore();
}

function desenharPontuacao(){
  ctx.save();ctx.font="bold 18px 'Nunito',sans-serif";
  ctx.fillStyle='#FFD166';ctx.textAlign='right';ctx.textBaseline='top';
  ctx.shadowColor='rgba(0,0,0,0.6)';ctx.shadowBlur=4;
  ctx.fillText('⭐ '+pontos,canvas.width-14,54);ctx.restore();
}

/* ════════════════════════════════════════════
   LOOP
════════════════════════════════════════════ */
let rodando=true;
function loop(){
  if(!rodando)return;
  tempo+=0.018;atualizarFisica();
  ctx.clearRect(0,0,canvas.width,canvas.height);
  desenharCeu();desenharEstrelas();desenharNuvens();desenharDunas();
  desenharCactus();desenharChao();desenharPedras();desenharPlataformas();
  desenharMoedas();desenharRaios();desenharMeta();desenharPersonagem();desenharPontuacao();
  requestAnimationFrame(loop);
}

/* ════════════════════════════════════════════
   VITÓRIA
════════════════════════════════════════════ */
let jogo_concluido=false;
function verificarMeta(){
  if(jogo_concluido)return;const cx=estado.px+SPRITE_W/2;
  if(cx>=META_X-20&&cx<=META_X+70){jogo_concluido=true;rodando=false;mostrarVitoria();}
}
function mostrarVitoria(){
  const tv=document.getElementById('telaVitoria');
  const vp=document.getElementById('vitoriaPontos');
  const vm=document.getElementById('vitoriaMensagem');
  const pct=moedas.filter(m=>m.coletada).length/moedas.length;
  const n=pct>=0.9?3:pct>=0.5?2:1;
  const msg=['Você atravessou a tormenta! Ufa! ⚡','Muito bem! 2º pedaço do Lápis: ENCONTRADO! 🌟','INCRÍVEL! Coletou tudo! O Lápis está quase inteiro! 🏅'];
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
  const cores=['#C8A8FF','#7C5CBF','#FFD166','#FF8C6B','#5BB8A0','#80D8FF'];
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
