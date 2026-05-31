/* ══════════════════════════════════════════════════════════════
   SPARK — Estilos
   Organização:
   1. Reset & Variáveis
   2. Animações
   3. Fundo espacial (compartilhado)
   4. Splash
   5. Tutorial
   6. Seleção de fases
   7. Jogo
   8. Modais (configurações e vitória)
══════════════════════════════════════════════════════════════ */

/* ── 1. Reset & Variáveis ─────────────────────────────────── */
* { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --font-game:   'Comic Sans MS', 'Chalkboard SE', cursive;
  --blue-light:  #64B4FF;
  --blue-mid:    #5890D2;
  --blue-dark:   #3A68A8;
  --blue-deeper: #1D5FCC;
  --text-muted:  #A8C8FF;
  --bg-space:    rgba(255,255,255,0.08);
  --border-soft: rgba(255,255,255,0.15);
  --radius-lg:   28px;
  --radius-md:   16px;
  --radius-sm:   12px;
}

body {
  font-family: var(--font-game);
  background: #060B1A;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

/* ── 2. Animações ─────────────────────────────────────────── */
@keyframes fadeOut      { to { opacity: 0; transform: scale(1.02); } }
@keyframes fadeInUp     { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: none; } }
@keyframes screenFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes rocketBounce { 0%,100% { transform: translateY(0) rotate(-4deg); } 50% { transform: translateY(-7px) rotate(4deg); } }
@keyframes pulseBtn     { 0%,100% { box-shadow: 0 4px 16px rgba(88,148,210,.30); } 50% { box-shadow: 0 4px 24px rgba(88,148,210,.50); } }
@keyframes twinkle      { from { opacity: .05; transform: scale(.8); } to { opacity: .65; transform: scale(1.1); } }
@keyframes drift        { from { transform: translateY(0) rotate(0deg); } to { transform: translateY(14px) rotate(5deg); } }
@keyframes pop          { 0% { transform: scale(0) rotate(-12deg); } 60% { transform: scale(1.2) rotate(2deg); } 100% { transform: scale(1) rotate(0); } }
@keyframes confettiFall { 0% { transform: translateY(-20px) rotate(0deg) scale(1); opacity: .85; } 100% { transform: translateY(105vh) rotate(480deg) scale(.5); opacity: 0; } }
@keyframes victoryPop   { 0% { transform: scale(.6) rotate(-6deg); opacity: 0; } 70% { transform: scale(1.06) rotate(1deg); opacity: 1; } 100% { transform: scale(1) rotate(0); opacity: 1; } }

/* ── 3. Fundo Espacial (compartilhado entre telas) ─────────── */
.space-bg {
  position: fixed; inset: 0;
  background: linear-gradient(160deg, #060B1A 0%, #0D1B3E 50%, #060B1A 100%);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; z-index: 80;
  animation: screenFadeIn .45s ease both;
}
.space-bg.hidden    { display: none; }
.space-bg.fade-out  { animation: fadeOut .6s ease forwards; }

.stars-bg { position: absolute; inset: 0; pointer-events: none; }
.star {
  position: absolute; background: white; border-radius: 50%;
  animation: twinkle var(--dur) ease-in-out infinite alternate; opacity: 0;
}

.planet { position: absolute; font-size: 64px; opacity: .18; pointer-events: none; animation: drift 20s ease-in-out infinite alternate; }
.planet-1 { top: 8%;   left: 5%;   animation-duration: 18s; font-size: 72px; }
.planet-2 { bottom:10%; right: 6%;  animation-duration: 22s; font-size: 56px; }
.planet-3 { top: 55%;  left: 2%;   animation-duration: 25s; font-size: 48px; }

/* ── Botões reutilizáveis ─────────────────────────────────── */
.btn-primary {
  width: 100%; padding: 16px;
  background: linear-gradient(135deg, var(--blue-mid), var(--blue-dark));
  color: white; border: none; border-radius: var(--radius-md);
  font-family: var(--font-game); font-size: 20px; font-weight: 700; cursor: pointer;
  transition: transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .3s;
  box-shadow: 0 4px 16px rgba(88,148,210,.35);
  animation: pulseBtn 3s ease-in-out infinite;
  margin-bottom: 10px;
}
.btn-primary:hover  { transform: scale(1.03); }
.btn-primary:active { transform: scale(.98); }
.btn-primary:disabled { opacity: .55; cursor: not-allowed; transform: none; animation: none; }

.btn-secondary {
  width: 100%; padding: 12px;
  background: var(--bg-space); color: rgba(255,255,255,.85);
  border: 1.5px solid var(--border-soft); border-radius: var(--radius-md);
  font-family: var(--font-game); font-size: 16px; font-weight: 700; cursor: pointer;
  transition: background .15s;
}
.btn-secondary:hover { background: rgba(255,255,255,.14); }

.btn-ghost {
  padding: 12px 18px; background: transparent;
  color: rgba(255,255,255,.6); border: 1.5px solid var(--border-soft);
  border-radius: var(--radius-sm); font-family: var(--font-game);
  font-size: 14px; cursor: pointer;
  transition: color .15s, border-color .15s, background .15s;
}
.btn-ghost:hover { color: #FFF; border-color: rgba(255,255,255,.4); background: rgba(255,255,255,.06); }
.btn-ghost.small { padding: 6px 14px; font-size: 14px; }

.gear-btn {
  background: var(--bg-space); border: 1.5px solid rgba(255,255,255,.2);
  border-radius: 10px; padding: 7px 11px;
  color: rgba(255,255,255,.7); font-size: 18px;
  cursor: pointer; transition: color .15s, background .15s; line-height: 1;
}
.gear-btn:hover { color: #FFF; background: rgba(255,255,255,.14); }
.gear-btn.light { background: transparent; border-color: #C5D8F6; color: #4A6FA5; font-size: 16px; }
.gear-btn.light:hover { background: #EEF4FF; color: #1D3557; }

.hidden { display: none !important; }

/* ── 4. Splash ────────────────────────────────────────────── */
#splash { z-index: 100; }

.splash-content {
  position: relative; z-index: 10;
  background: rgba(255,255,255,.06); border: 1.5px solid var(--border-soft);
  border-radius: var(--radius-lg); padding: 36px 40px;
  width: 100%; max-width: 420px; text-align: center;
  backdrop-filter: blur(12px);
  animation: fadeInUp .8s cubic-bezier(.22,1,.36,1) both;
}
.splash-content .gear-btn { position: absolute; top: 16px; right: 16px; }

.splash-title     { margin-bottom: 28px; }
.title-emoji      { display: block; font-size: 56px; line-height: 1; margin-bottom: 10px; animation: rocketBounce 2s ease-in-out infinite; }
.splash-title h1  { font-size: 30px; font-weight: 700; color: #FFF; text-shadow: 0 0 20px rgba(100,180,255,.6); line-height: 1.25; }

.name-section         { margin-bottom: 24px; }
.name-section label   { display: block; font-size: 14px; color: var(--text-muted); margin-bottom: 8px; }
.name-section input   {
  width: 100%; padding: 12px 16px;
  background: rgba(255,255,255,.1); border: 1.5px solid rgba(255,255,255,.2);
  border-radius: var(--radius-md); font-family: var(--font-game);
  font-size: 16px; font-weight: 700; color: #FFF; text-align: center; outline: none;
  transition: border-color .2s, background .2s;
}
.name-section input::placeholder { color: rgba(255,255,255,.3); }
.name-section input:focus { border-color: var(--blue-light); background: rgba(100,180,255,.12); }

.char-section  { margin-bottom: 28px; }
.char-label    { font-size: 14px; color: var(--text-muted); margin-bottom: 10px; }
.char-grid     { display: flex; justify-content: center; gap: 10px; }
.char-btn {
  width: 58px; height: 58px; font-size: 28px;
  background: rgba(255,255,255,.08); border: 2px solid var(--border-soft);
  border-radius: var(--radius-md); cursor: pointer; line-height: 1;
  transition: transform .25s cubic-bezier(.34,1.56,.64,1), background .25s, border-color .25s;
}
.char-btn:hover    { transform: scale(1.09); background: rgba(100,180,255,.12); }
.char-btn.selected { border-color: #7AAFE0; background: rgba(100,180,255,.18); transform: scale(1.08); }

.splash-hint { font-size: 12px; color: rgba(255,255,255,.35); margin-top: 14px; }

/* ── 5. Tutorial ──────────────────────────────────────────── */
#tutorial { z-index: 90; }

.tut-box {
  position: relative; z-index: 10;
  background: rgba(255,255,255,.07); border: 1.5px solid var(--border-soft);
  border-radius: var(--radius-lg); padding: 32px 36px;
  width: 100%; max-width: 460px; text-align: center;
  backdrop-filter: blur(14px);
  animation: fadeInUp .6s cubic-bezier(.22,1,.36,1) both;
}

.tut-progress { display: flex; justify-content: center; gap: 8px; margin-bottom: 24px; }
.tut-dot { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,.2); transition: background .3s, transform .3s; }
.tut-dot.active { background: var(--blue-light); transform: scale(1.3); }
.tut-dot.done   { background: rgba(100,180,255,.5); }

.tut-emoji { font-size: 64px; display: block; margin-bottom: 14px; animation: rocketBounce 2s ease-in-out infinite; }
.tut-title { font-size: 22px; font-weight: 700; color: #FFF; margin-bottom: 10px; text-shadow: 0 0 16px rgba(100,180,255,.5); }
.tut-text  { font-size: 15px; color: #C8DEFF; line-height: 1.6; margin-bottom: 24px; min-height: 72px; }

.tut-btns  { display: flex; gap: 10px; }
.tut-btns .btn-primary { margin-bottom: 0; font-size: 17px; padding: 14px; animation: none; }

/* ── 6. Seleção de Fases ─────────────────────────────────── */
#phase-select {
  z-index: 85;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: 16px;
}

/* (phase-box / phase-grid / phase-card removidos — substituídos pela tela estrela) */

/* ── 7. Jogo ──────────────────────────────────────────────── */

/* O app agora ocupa a tela toda */
#app {
  position: fixed; inset: 0;
  background: #060f1e;
  animation: screenFadeIn .45s ease both;
  overflow: hidden;
}

/* Canvas ocupa tudo por baixo */
#world {
  display: block;
  position: absolute; inset: 0;
  width: 100%; height: 100%;
}

/* Header HUD — barra no topo por cima do canvas */
.game-header {
  position: absolute; top: 0; left: 0; right: 0; z-index: 10;
  display: flex; align-items: center; gap: 10px;
  padding: 10px 16px;
  background: rgba(6,15,30,0.75);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.game-header h1 {
  font-size: 18px; font-weight: 700;
  color: #FFF; flex: 1; text-align: center;
  text-shadow: 0 0 12px rgba(100,180,255,.5);
}
.game-header .btn-ghost.small {
  color: rgba(255,255,255,.7);
  border-color: rgba(255,255,255,.2);
}
.game-header .gear-btn.light {
  background: rgba(255,255,255,.08);
  border-color: rgba(255,255,255,.2);
  color: rgba(255,255,255,.7);
}
.game-header .gear-btn.light:hover {
  background: rgba(255,255,255,.16);
  color: #FFF;
}

/* Área do jogo — o canvas é o fundo, os painéis ficam por cima */
.game-area {
  position: absolute; inset: 0;
  top: 52px;    /* abaixo do header */
  bottom: 110px; /* acima da barra do programa */
  display: flex;
  align-items: stretch;
  pointer-events: none; /* deixa cliques passarem para o canvas por padrão */
}

/* Painel de blocos — lateral esquerda */
.panel-blocos {
  pointer-events: all;
  width: 160px;
  margin: 12px 0 12px 12px;
  background: rgba(6,15,30,0.80);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: var(--radius-md);
  padding: 10px 8px;
  display: flex; flex-direction: column;
  overflow-y: auto;
}

/* Painel do programa — barra na base */
.panel-programa {
  pointer-events: all;
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 110px;
  background: rgba(6,15,30,0.85);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255,255,255,0.10);
  padding: 8px 12px;
  display: flex; align-items: center; gap: 10px;
}

/* Score e fase — canto inferior direito */
.hud-score {
  pointer-events: none;
  position: absolute; bottom: 120px; right: 16px; z-index: 10;
  text-align: center;
}
.score-num   { font-size: 32px; font-weight: 700; color: #FFD700; line-height: 1; text-shadow: 0 0 10px rgba(255,215,0,.5); }
.score-label { font-size: 11px; color: rgba(255,255,255,.5); margin-top: 2px; }
.phase-indicator { font-size: 11px; color: rgba(255,255,255,.4); margin-top: 4px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; }

/* Painel genérico (mantido para não quebrar nada) */
.panel { background: rgba(6,15,30,0.80); border-radius: var(--radius-md); border: 1px solid rgba(255,255,255,0.10); padding: 10px; }
.panel-title { font-size: 11px; font-weight: 700; color: rgba(255,255,255,.5); text-align: center; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 8px; }

.block {
  display: flex; align-items: center; gap: 6px;
  width: 100%; border: none; border-radius: var(--radius-sm);
  padding: 8px 10px; margin-bottom: 6px;
  font-family: var(--font-game); font-size: 13px; font-weight: 700;
  cursor: grab; transition: transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .25s; user-select: none;
}
.block:last-child  { margin-bottom: 0; }
.block:hover       { transform: scale(1.04); box-shadow: 0 3px 10px rgba(0,0,0,.3); }
.block:active      { transform: scale(.97); cursor: grabbing; }
.block.right   { background: #B5D4F4; color: #0C447C; }
.block.left    { background: #C0DD97; color: #27500A; }
.block.up      { background: #FAC775; color: #633806; }
.block.down    { background: #F4C0D1; color: #72243E; }
.block.collect { background: #9FE1CB; color: #085041; }

/* Drop zone dentro da barra do programa */
#drop-zone {
  flex: 1; display: flex; align-items: center; gap: 6px;
  overflow-x: auto; overflow-y: hidden;
  min-height: 52px; max-height: 52px;
  border: 2px dashed rgba(255,255,255,.2);
  border-radius: var(--radius-sm); padding: 6px 8px;
  transition: background .2s, border-color .2s;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,.2) transparent;
}
#drop-zone.drag-over { background: rgba(55,138,221,.15); border-color: #378ADD; }

.empty-hint { color: rgba(255,255,255,.3); font-size: 13px; white-space: nowrap; pointer-events: none; padding: 0 8px; }

.prog-block {
  display: flex; align-items: center; gap: 6px; flex-shrink: 0;
  border-radius: 8px; padding: 6px 10px;
  font-size: 13px; font-weight: 700; white-space: nowrap;
}
.prog-block .remove-btn {
  font-size: 11px; opacity: .5; cursor: pointer;
  border: none; background: transparent; font-family: var(--font-game);
  padding: 1px 3px; border-radius: 4px;
}
.prog-block .remove-btn:hover { opacity: 1; background: rgba(0,0,0,.15); }

.btn-run {
  flex-shrink: 0; padding: 10px 18px;
  background: #2A9278; color: white; border: none;
  border-radius: var(--radius-sm); font-family: var(--font-game);
  font-size: 15px; font-weight: 700; cursor: pointer;
  transition: background .25s, transform .25s cubic-bezier(.34,1.56,.64,1);
  white-space: nowrap;
}
.btn-run:hover    { background: #1E6E5A; transform: scale(1.02); }
.btn-run:active   { transform: scale(.98); }
.btn-run:disabled { opacity: .55; cursor: not-allowed; transform: none; }

.btn-clear {
  flex-shrink: 0; padding: 8px 14px;
  background: transparent; color: rgba(255,255,255,.5);
  border: 1px solid rgba(255,255,255,.2); border-radius: 10px;
  font-family: var(--font-game); font-size: 12px; cursor: pointer;
  transition: background .15s; white-space: nowrap;
}
.btn-clear:hover { background: rgba(255,255,255,.08); color: #FFF; }

#msg { font-size: 13px; font-weight: 700; color: #7DF7C0; white-space: nowrap; flex-shrink: 0; }

.star-anim { display: inline-block; animation: pop .45s ease; }
/* ── 8. Modais ────────────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(4,8,20,.88);
  display: flex; align-items: center; justify-content: center;
  z-index: 300; backdrop-filter: blur(6px);
}

.modal-box {
  background: linear-gradient(160deg, #060B1A 0%, #0D1B3E 60%, #060B1A 100%);
  border: 1.5px solid rgba(140, 180, 255, 0.2);
  border-radius: 24px; padding: 36px 32px;
  width: 100%; max-width: 360px;
  animation: fadeInUp .3s cubic-bezier(.22,1,.36,1) both;
  box-shadow: 0 0 60px rgba(80, 140, 255, 0.15), 0 0 0 1px rgba(255,255,255,0.04);
}
.modal-title { font-size: 22px; font-weight: 700; color: #FFF; margin-bottom: 28px; text-align: center; }

.setting-row  { display: flex; align-items: center; gap: 14px; margin-bottom: 22px; }
.setting-label { font-size: 15px; color: var(--text-muted); min-width: 80px; }
#vol-slider   { flex: 1; height: 6px; cursor: pointer; accent-color: var(--blue-light); border-radius: 4px; }
.vol-val      { font-size: 14px; color: #FFF; font-weight: 700; min-width: 36px; text-align: right; }

.modal-box .btn-primary { animation: none; font-size: 16px; padding: 13px; }

.victory-box    { text-align: center; animation: victoryPop .5s cubic-bezier(.22,1,.36,1) both; box-shadow: 0 0 60px rgba(58,142,246,.25); border-color: rgba(100,180,255,.35); }
.victory-emoji  { font-size: 72px; display: block; margin-bottom: 12px; animation: rocketBounce 2s ease-in-out infinite; }
.victory-sub    { font-size: 15px; color: var(--text-muted); margin-bottom: 18px; }
.victory-stars  { font-size: 40px; margin-bottom: 28px; letter-spacing: 4px; }
.victory-box .btn-primary { background: linear-gradient(135deg, #3A8EF6, var(--blue-deeper)); box-shadow: 0 4px 20px rgba(58,142,246,.4); }

.confirm-text { font-size: 15px; color: var(--text-muted); text-align: center; margin-bottom: 28px; }
.confirm-btns { display: flex; gap: 10px; }
.confirm-btns .btn-primary { margin-bottom: 0; animation: none; font-size: 16px; padding: 13px; }

/* ── Tutorial demo drag ───────────────────────────────────── */
.tut-demo {
  display: flex; align-items: center; gap: 20px;
  justify-content: center; margin-bottom: 20px;
}

.tut-demo-blocks { display: flex; flex-direction: column; gap: 8px; }

.tut-demo-block {
  background: #B5D4F4; color: #0C447C;
  border: none; border-radius: var(--radius-sm);
  padding: 10px 16px; font-family: var(--font-game);
  font-size: 14px; font-weight: 700; cursor: grab;
  transition: transform .2s, box-shadow .2s;
  user-select: none;
}
.tut-demo-block:hover { transform: scale(1.05); box-shadow: 0 4px 12px rgba(0,0,0,.3); }
.tut-demo-block.dragging { opacity: .5; }

.tut-demo-drop {
  width: 140px; height: 56px;
  border: 2.5px dashed rgba(255,255,255,.3);
  border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  transition: background .2s, border-color .2s;
}
.tut-demo-drop.drag-over { background: rgba(100,180,255,.15); border-color: var(--blue-light); }
.tut-demo-drop.success   { background: rgba(78,205,196,.15); border-color: #4ECDC4; }

.tut-demo-hint { font-size: 13px; color: rgba(255,255,255,.4); pointer-events: none; }

.tut-btns { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.tut-btns .btn-primary { flex: 1; margin-bottom: 0; font-size: 16px; padding: 13px; animation: none; min-width: 140px; }
.tut-btns .btn-ghost   { flex-shrink: 0; }
/* ── Botão de idioma ──────────────────────────────────────── */
.lang-btn {
  position: absolute;
  top: 16px;
  right: 60px;
  background: rgba(255,255,255,0.15);
  border: 1.5px solid rgba(255,255,255,0.35);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  padding: 6px 13px;
  border-radius: 20px;
  cursor: pointer;
  backdrop-filter: blur(6px);
  transition: background 0.2s, transform 0.15s;
  z-index: 10;
  letter-spacing: 0.5px;
}
.lang-btn:hover {
  background: rgba(255,255,255,0.28);
  transform: scale(1.07);
}
.lang-btn:active {
  transform: scale(0.96);
}


/* ── 9. Narrativa Zyron ──────────────────────────────────── */
.story-overlay {
  position: fixed;
  inset: 0;
  background: linear-gradient(160deg, #060B1A 0%, #0D1B3E 50%, #060B1A 100%);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.5s ease;
  overflow: hidden;
}
.story-overlay.hidden { display: none; }

/* Estrelas de fundo que cobrem o overlay inteiro */
.story-bg-stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
.story-bg-star {
  position: absolute;
  border-radius: 50%;
  background: white;
  animation: twinkle var(--dur, 3s) ease-in-out var(--delay, 0s) infinite alternate;
  opacity: 0;
}

/* Planetas decorativos no fundo do overlay */
.story-bg-planet {
  position: absolute;
  font-size: 64px;
  opacity: 0.12;
  pointer-events: none;
  animation: drift 20s ease-in-out infinite alternate;
}
.story-bg-planet-1 { top: 6%;   left: 4%;   animation-duration: 18s; font-size: 70px; }
.story-bg-planet-2 { bottom: 8%; right: 5%;  animation-duration: 23s; font-size: 54px; }
.story-bg-planet-3 { top: 60%;  left: 1%;   animation-duration: 27s; font-size: 44px; }

.story-box {
  position: relative;
  width: min(520px, 92vw);
  background: linear-gradient(160deg, #0a0a2e 0%, #0d1b4b 60%, #0a1a30 100%);
  border: 1.5px solid rgba(140, 180, 255, 0.25);
  border-radius: 20px;
  padding: 36px 32px 28px;
  box-shadow: 0 0 60px rgba(80, 140, 255, 0.15), 0 0 0 1px rgba(255,255,255,0.04);
  overflow: hidden;
}

/* estrelas decorativas dentro do box */
.story-stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  border-radius: 20px;
}
.story-star-dot {
  position: absolute;
  border-radius: 50%;
  background: #fff;
  opacity: 0;
  animation: storyStarPulse var(--dur, 3s) ease-in-out infinite;
  animation-delay: var(--delay, 0s);
}
@keyframes storyStarPulse {
  0%, 100% { opacity: 0; }
  50%       { opacity: 0.6; }
}

/* narrador */
.story-narrator {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}
.story-avatar {
  font-size: 32px;
  filter: drop-shadow(0 0 8px rgba(120, 180, 255, 0.8));
  animation: avatarFloat 3s ease-in-out infinite;
}
@keyframes avatarFloat {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-5px); }
}
.story-name {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(140, 200, 255, 0.7);
}

/* texto */
.story-text-wrap {
  min-height: 96px;
  margin-bottom: 20px;
  position: relative;
}
.story-text {
  font-size: 18px;
  line-height: 1.65;
  color: #e8f0ff;
  font-style: italic;
  margin: 0;
  letter-spacing: 0.2px;
}
.story-cursor {
  display: inline-block;
  color: rgba(140, 200, 255, 0.9);
  animation: cursorBlink 0.7s step-end infinite;
  font-size: 18px;
  vertical-align: baseline;
  margin-left: 2px;
}
@keyframes cursorBlink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

/* progresso (bolinhas) */
.story-progress {
  display: flex;
  gap: 7px;
  justify-content: center;
  margin-bottom: 22px;
}
.story-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(140, 180, 255, 0.25);
  transition: background 0.3s, transform 0.3s;
}
.story-dot.active {
  background: rgba(140, 200, 255, 0.9);
  transform: scale(1.35);
  box-shadow: 0 0 6px rgba(140, 200, 255, 0.6);
}
.story-dot.done {
  background: rgba(140, 200, 255, 0.45);
}

/* botões */
.btn-story-next {
  display: block;
  width: 100%;
  padding: 13px;
  background: linear-gradient(135deg, #2255cc, #3b7fff);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
  margin-bottom: 10px;
}
.btn-story-next:hover  { opacity: 0.88; transform: translateY(-1px); }
.btn-story-next:active { transform: scale(0.97); }

.btn-story-skip {
  display: block;
  width: 100%;
  background: none;
  border: none;
  color: rgba(140, 180, 255, 0.45);
  font-size: 13px;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s;
  letter-spacing: 0.5px;
}
.btn-story-skip:hover { color: rgba(140, 180, 255, 0.8); }

/* entrada do modal */
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* ── 10. Tela de Créditos ──────────────────────────────────── */
@keyframes creditsFloat { 0%,100% { transform: translateY(0) rotate(-6deg); } 50% { transform: translateY(-12px) rotate(6deg); } }
@keyframes creditsFadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
@keyframes creditsGlow { 0%,100% { text-shadow: 0 0 18px rgba(245,200,66,.5); } 50% { text-shadow: 0 0 36px rgba(245,200,66,.9); } }

#credits-screen { z-index: 200; overflow-y: auto; align-items: flex-start; padding: 40px 16px; }
.credits-box { position: relative; z-index: 10; background: rgba(255,255,255,.06); border: 1.5px solid rgba(255,255,255,.14); border-radius: var(--radius-lg); padding: 40px 36px 32px; width: 100%; max-width: 440px; text-align: center; backdrop-filter: blur(14px); margin: auto; }
.credits-rocket { font-size: 60px; display: block; margin-bottom: 12px; animation: creditsFloat 3s ease-in-out infinite; }
.credits-main-title { font-size: 26px; font-weight: 700; color: #f5c842; letter-spacing: 3px; margin-bottom: 28px; animation: creditsGlow 3s ease-in-out infinite; }
.credits-group { margin-bottom: 14px; opacity: 0; }
.credits-role { font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: #7AAFE0; margin-bottom: 4px; }
.credits-name { font-size: 17px; font-weight: 700; color: #e8f0ff; }
.credits-name.big { font-size: 22px; }
.credits-name.gold { color: #f5c842; animation: creditsGlow 3s ease-in-out infinite; }
.credits-divider { width: 40px; height: 1px; background: rgba(122,175,224,.4); margin: 18px auto; opacity: 0; }
.credits-thanks { font-size: 20px; font-weight: 700; color: #FFF; margin-bottom: 6px; }
.credits-year { font-size: 14px; color: rgba(255,255,255,.35); letter-spacing: 2px; }
.credits-btn-home { margin-top: 28px; opacity: 0; }

/* ── MELHORIAS TDAH/TEA ─────────────────────────────────── */

/* Star counter HUD */
.hud-star-counter {
  font-size: 1.1rem;
  font-weight: 700;
  color: #FFD700;
  text-shadow: 0 0 10px rgba(255,215,0,0.6);
  margin-top: 4px;
  letter-spacing: 1px;
  animation: starCounterPulse 0.4s ease;
}

@keyframes starCounterPulse {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* Block pulse when added to dropzone */
@keyframes blockPulseAnim {
  0%   { box-shadow: 0 0 0 0 rgba(255,215,0,0.8); transform: scale(1); }
  50%  { box-shadow: 0 0 0 8px rgba(255,215,0,0.0); transform: scale(1.06); }
  100% { box-shadow: 0 0 0 0 rgba(255,215,0,0); transform: scale(1); }
}

.block-pulse {
  animation: blockPulseAnim 0.4s ease-out !important;
}

/* Victory modal - player name emphasis */
.victory-sub {
  font-size: 1.15rem;
  font-weight: 600;
  color: #FFD700;
  text-align: center;
  margin: 6px 0 12px;
}

/* Zyron story: bigger text, better readability for kids */
.story-text {
  font-size: 1.2rem !important;
  line-height: 1.7 !important;
  text-align: center;
}

.story-avatar {
  font-size: 2.8rem !important;
}

/* Story progress dots bigger */
.story-dot {
  width: 12px !important;
  height: 12px !important;
}

/* ─────────────────────────────────────────────────────────── */

/* ── Botão Ver Créditos (abaixo da grade, centralizado) ──────── */
.phase-ending-row {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  width: calc(3 * 130px + 2 * 14px);
  margin-left: auto;
  margin-right: auto;
}

.phase-ending-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  width: 100%;
  background: rgba(245, 200, 66, 0.1);
  border: 1.5px solid rgba(245, 200, 66, 0.45);
  border-radius: var(--radius-sm);
  color: #f5c842;
  font-family: var(--font-game);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background .2s, border-color .2s, transform .2s;
  letter-spacing: 0.3px;
}
.phase-ending-btn:hover:not(:disabled) {
  background: rgba(245, 200, 66, 0.2);
  border-color: #f5c842;
  transform: translateX(2px);
}
.phase-ending-btn.bloqueada {
  opacity: .35;
  cursor: not-allowed;
  color: rgba(255,255,255,.5);
  border-color: rgba(255,255,255,.2);
  background: transparent;
}
.phase-ending-arrow {
  font-size: 16px;
  transition: transform .2s;
}
.phase-ending-btn:hover:not(:disabled) .phase-ending-arrow {
  transform: translateX(3px);
}

/* ══════════════════════════════════════════════
   STAR SECTOR — Seleção de Fases em Estrela
   ══════════════════════════════════════════════ */
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap');

/* Container principal da tela de fases com estrela */
.star-wrap {
  position: relative; z-index: 10;
  display: flex; flex-direction: column; align-items: center;
  justify-content: center;
  padding: 20px 0 24px;
  width: 100%;
}
.star-wrap .gear-btn { position: absolute; top: 0; right: 16px; }

.star-title {
  font-family: 'Orbitron', cursive;
  font-size: 18px; font-weight: 900;
  color: #f5c842; letter-spacing: 5px;
  text-transform: uppercase;
  text-shadow: 0 0 18px rgba(245,200,66,.5);
  margin-bottom: 2px;
}
.star-sub {
  font-size: 11px; color: rgba(122,175,224,.65);
  letter-spacing: 3px; margin-bottom: 10px;
  font-style: italic;
}

/* Área da estrela */
.sc {
  position: relative; width: 380px; height: 380px; z-index: 2;
}
.sc svg {
  position: absolute; inset: 0; width: 100%; height: 100%;
}

/* Nós nas pontas */
.fn {
  position: absolute; width: 58px; height: 58px; border-radius: 50%;
  background: #060B1A;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  cursor: pointer; transform: translate(-50%,-50%);
  transition: transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .25s;
  z-index: 5;
}
.fn.completa   { border: 2.5px solid #4ECDC4; box-shadow: 0 0 14px rgba(78,205,196,.4); }
.fn.disponivel { border: 2.5px solid #64B4FF; box-shadow: 0 0 12px rgba(100,180,255,.3); }
.fn.bloqueada  { border: 2px solid rgba(255,255,255,.15); opacity: .35; cursor: not-allowed; }
.fn.completa:hover, .fn.disponivel:hover { transform: translate(-50%,-50%) scale(1.17); }
.fn .fn-em { font-size: 21px; line-height: 1; }
.fn .fn-nm { font-size: 8px; color: rgba(200,222,255,.5); font-family: 'Orbitron', cursive; letter-spacing: 1px; margin-top: 1px; }
.fn .fn-ck {
  position: absolute; top: -4px; right: -4px;
  background: #4ECDC4; border-radius: 50%;
  width: 16px; height: 16px; font-size: 9px;
  display: flex; align-items: center; justify-content: center;
  color: #060B1A; font-weight: 900;
}

/* Labels das pontas */
.flbl {
  position: absolute; transform: translateX(-50%);
  font-size: 9px; color: rgba(200,222,255,.75);
  letter-spacing: 1.5px; text-align: center;
  text-transform: uppercase; white-space: nowrap;
  z-index: 5; pointer-events: none;
  text-shadow: 0 1px 8px rgba(0,0,0,.9);
}

/* Nó central */
.cn {
  position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%);
  width: 60px; height: 60px; border-radius: 50%;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  cursor: pointer; z-index: 6;
  transition: transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .25s;
}
.cn.lk { border: 2px solid rgba(180,80,255,.3); background: rgba(60,10,110,.15); opacity: .38; cursor: not-allowed; }
.cn.ok {
  border: 2px solid rgba(180,80,255,.75); background: rgba(80,20,140,.22);
  box-shadow: 0 0 24px rgba(160,80,255,.45);
  animation: cn-pulse 3s ease-in-out infinite;
}
.cn.ok:hover { transform: translate(-50%,-50%) scale(1.14); }
@keyframes cn-pulse {
  0%,100% { box-shadow: 0 0 20px rgba(160,80,255,.38); }
  50%      { box-shadow: 0 0 40px rgba(160,80,255,.7); }
}
.cn-em { font-size: 22px; }
.cn-lb { font-size: 7px; color: rgba(200,150,255,.7); letter-spacing: 2px; text-transform: uppercase; font-family: 'Orbitron', cursive; }

/* Tooltip */
.star-tip {
  position: fixed; pointer-events: none; z-index: 999;
  background: rgba(6,11,26,.97); border: 1.5px solid rgba(100,180,255,.3);
  border-radius: 12px; padding: 10px 16px; min-width: 150px;
  opacity: 0; transition: opacity .15s;
}
.star-tip.show { opacity: 1; }
.st-name   { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 3px; }
.st-dif    { font-size: 11px; color: #f5c842; margin-bottom: 3px; }
.st-status { font-size: 11px; }
.st-status.ok { color: #4ECDC4; }
.st-status.di { color: #64B4FF; }
.st-status.lk { color: rgba(255,255,255,.35); }
.st-action { font-size: 10px; color: rgba(100,180,255,.55); margin-top: 5px; }

/* ── Botões inferiores da tela de fases ── */
.star-bottom-btns {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  width: 100%;
}

.btn-credits-phase {
  background: rgba(245,200,66,.1);
  border: 1.5px solid rgba(245,200,66,.5);
  border-radius: 10px;
  color: #f5c842;
  padding: 9px 28px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: .5px;
  transition: background .2s, border-color .2s, opacity .2s;
}
.btn-credits-phase:hover:not(:disabled) {
  background: rgba(245,200,66,.22);
  border-color: #f5c842;
}
.btn-credits-phase.bloqueada {
  opacity: .35;
  cursor: not-allowed;
}

/* ── Star container: wrapper maior que o .sc para acomodar labels nas pontas ── */
.star-container {
  position: relative;
  width: 460px;
  height: 460px;
  flex-shrink: 0;
}
.star-container .sc {
  position: absolute;
  top: 40px;
  left: 40px;
}
/* Labels ficam no star-container, não no .sc */
.star-container .flbl {
  position: absolute;
}
