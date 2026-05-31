// ── Renderer ─────────────────────────────────────────────────
let CELL = 72;

function calcularCell(canvas, cols, rows) {
  const areaW = canvas.width - 20;
  const areaH = canvas.height - 52 - 110;
  CELL = Math.floor(Math.min(areaW / cols, areaH / rows));
}

// ── Temas por fase — mundos imersivos ─────────────────────────
//
// Fase 0  🌙  SUPERFÍCIE DA LUA
//   Solo cinza-azulado com pó lunar, céu negro absoluto.
//   Obstáculos = crateras de impacto com bordas brilhantes.
//
// Fase 1  🪐  NEBULOSA DE GÁS (órbita de Saturno)
//   Nuvens de plasma roxo-rosa, névoa densa e cristalina.
//   Obstáculos = cristais de gás solidificado, translúcidos.
//
// Fase 2  ☄️  BURACO NEGRO
//   Vácuo absoluto, singularidade distorce tudo.
//   Solo feito de matéria comprimida azul-escura.
//   Obstáculos = fragmentos de matéria degenerada.
//
// Fase 3  🌠  CINTURÃO DE ASTEROIDES
//   Rocha ígnea laranja-ferrugem flutuando no espaço.
//   Obstáculos = blocos de ferro-níquel incandescentes.
//
// Fase 4  🔭  PLANETA FLORESTA ALIENÍGENA
//   Solo de musgo bioluminescente turquesa/verde-escuro.
//   Obstáculos = espinhos cristalinos ou fungos gigantes.
//
// Fase 5  🏆  NÚCLEO DE ESTRELA (colapso solar)
//   Plasma dourado-branco em ebulição, temperatura extrema.
//   Obstáculos = pilares de plasma condensado.

const TEMAS = [

  // ── 0 🌙 Superfície da Lua ─────────────────────────────────
  {
    // Chão: solo lunar, cinza-azulado fosco com variação sutil
    chao:       '#2c3a4a',
    chaoGrad:   ['#2c3a4a', '#1e2d3d'],   // gradiente top→bottom do tile
    // Vazio: céu lunar, negro absoluto com leve azul sideral
    vazio:      '#06090f',
    // Grade: linhas quase invisíveis, cor pó lunar
    grade:      'rgba(180,200,230,0.06)',
    // Obstáculo: cratera de impacto — cinza escuro com borda prateada-azul
    obsBase:    '#1a2030',
    obsBase2:   '#0e1520',              // cor mais escura do fundo da cratera
    obsTop:     '#8ab0d8',              // anel brilhante da borda
    obsGlow:    'rgba(100,160,230,0.20)',
    obsEmoji:   '🌑',
    // Efeito chão: pó lunar — pontinho brancos espalhados
    chaoDetalhe: 'lunar',
    // Fundo do app: céu negro com leve nebulosa azul distante
    bgApp: 'radial-gradient(ellipse 80% 50% at 50% 100%, #0a1628 0%, #06090f 60%)',
    bgParticles: { cor: '#c8d8f0', opacidade: 0.25, tamanho: 1.2 },
  },

  // ── 1 🪐 Nebulosa — Órbita de Saturno ──────────────────────
  {
    chao:       '#2d1f4e',
    chaoGrad:   ['#3a2860', '#1e1238'],
    vazio:      '#0d0818',
    grade:      'rgba(200,160,255,0.07)',
    obsBase:    '#4a1c6e',
    obsBase2:   '#2a0a40',
    obsTop:     '#c084fc',              // cristal de plasma magenta
    obsGlow:    'rgba(180,80,255,0.28)',
    obsEmoji:   '💜',
    chaoDetalhe: 'nebula',
    bgApp: 'radial-gradient(ellipse 100% 60% at 30% 80%, #1e0840 0%, #0d0818 55%), radial-gradient(ellipse 60% 40% at 70% 20%, #2a0a50 0%, transparent 60%)',
    bgParticles: { cor: '#e0b0ff', opacidade: 0.35, tamanho: 1.5 },
  },

  // ── 2 ☄️ Buraco Negro ──────────────────────────────────────
  {
    chao:       '#141428',
    chaoGrad:   ['#1c1c38', '#0c0c1e'],
    vazio:      '#050508',
    grade:      'rgba(100,100,200,0.05)',
    obsBase:    '#0a0a18',
    obsBase2:   '#030305',
    obsTop:     '#5555cc',              // borda de matéria comprimida azul-elétrica
    obsGlow:    'rgba(60,60,220,0.30)',
    obsEmoji:   '🕳️',
    chaoDetalhe: 'void',
    bgApp: 'radial-gradient(ellipse 50% 50% at 50% 50%, #0c0c28 0%, #050508 70%)',
    bgParticles: { cor: '#7070ff', opacidade: 0.15, tamanho: 0.8 },
  },

  // ── 3 🌠 Cinturão de Asteroides ────────────────────────────
  {
    chao:       '#3d2010',
    chaoGrad:   ['#4a2815', '#2e1808'],
    vazio:      '#100804',
    grade:      'rgba(255,180,80,0.06)',
    obsBase:    '#5c2200',
    obsBase2:   '#3a1500',
    obsTop:     '#ff7730',              // metal incandescente laranja-fogo
    obsGlow:    'rgba(255,100,20,0.30)',
    obsEmoji:   '🔥',
    chaoDetalhe: 'asteroid',
    bgApp: 'radial-gradient(ellipse 90% 40% at 50% 100%, #280f00 0%, #100804 50%)',
    bgParticles: { cor: '#ffaa55', opacidade: 0.20, tamanho: 1.0 },
  },

  // ── 4 🔭 Planeta Floresta Alienígena ───────────────────────
  {
    chao:       '#0a2e1c',
    chaoGrad:   ['#0d3a22', '#061a10'],
    vazio:      '#030d06',
    grade:      'rgba(60,255,120,0.07)',
    obsBase:    '#0c3018',
    obsBase2:   '#051508',
    obsTop:     '#22e87a',              // espinho bioluminescente turquesa
    obsGlow:    'rgba(20,220,100,0.28)',
    obsEmoji:   '🌿',
    chaoDetalhe: 'forest',
    bgApp: 'radial-gradient(ellipse 100% 60% at 50% 100%, #061a0c 0%, #030d06 55%), radial-gradient(ellipse 40% 30% at 20% 30%, #0a2a14 0%, transparent 60%)',
    bgParticles: { cor: '#44ff99', opacidade: 0.22, tamanho: 1.2 },
  },

  // ── 5 🏆 Núcleo Estelar — Colapso Solar ────────────────────
  {
    chao:       '#3a2200',
    chaoGrad:   ['#4a2c00', '#2a1800'],
    vazio:      '#0e0800',
    grade:      'rgba(255,220,60,0.08)',
    obsBase:    '#5a2a00',
    obsBase2:   '#3a1800',
    obsTop:     '#ffe040',              // plasma condensado dourado-branco
    obsGlow:    'rgba(255,200,20,0.38)',
    obsEmoji:   '⚡',
    chaoDetalhe: 'solar',
    bgApp: 'radial-gradient(ellipse 70% 70% at 50% 50%, #2a1000 0%, #0e0800 65%)',
    bgParticles: { cor: '#ffdd55', opacidade: 0.30, tamanho: 1.8 },
  },
];

let _temaAtual = TEMAS[0];

function setTema(faseIndex) {
  _temaAtual = TEMAS[faseIndex] || TEMAS[0];
  _bgParticulas = null;  // força regeneração das partículas
  const app = document.getElementById('app');
  if (app) app.style.background = _temaAtual.bgApp;
}

// ── Funções auxiliares de textura ────────────────────────────

function _desenharChaoLunar(ctx, x, y) {
  // Pó lunar: pontos brancos irregulares
  ctx.save();
  ctx.globalAlpha = 0.18;
  const pts = [[0.15,0.3],[0.55,0.15],[0.75,0.6],[0.3,0.75],[0.85,0.45],[0.45,0.5]];
  pts.forEach(([px,py]) => {
    ctx.beginPath();
    ctx.arc(x + px*CELL, y + py*CELL, CELL*0.03, 0, Math.PI*2);
    ctx.fillStyle = '#c8d8f0';
    ctx.fill();
  });
  ctx.restore();
}

function _desenharChaoNebula(ctx, x, y) {
  // Névoa: manchas translúcidas roxas
  ctx.save();
  const g = ctx.createRadialGradient(x+CELL*0.5,y+CELL*0.4,0, x+CELL*0.5,y+CELL*0.4,CELL*0.5);
  g.addColorStop(0,   'rgba(180,100,255,0.10)');
  g.addColorStop(1,   'rgba(180,100,255,0.00)');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, CELL, CELL);
  ctx.restore();
}

function _desenharChaoVoid(ctx, x, y) {
  // Linhas de distorção gravitacional
  ctx.save();
  ctx.globalAlpha = 0.09;
  ctx.strokeStyle = '#6060ff';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 3; i++) {
    const cy = y + CELL * (0.25 + i * 0.25);
    ctx.beginPath();
    ctx.moveTo(x, cy);
    ctx.bezierCurveTo(x+CELL*0.3, cy-CELL*0.06, x+CELL*0.7, cy+CELL*0.06, x+CELL, cy);
    ctx.stroke();
  }
  ctx.restore();
}

function _desenharChaoAsteroid(ctx, x, y) {
  // Veios de metal ferrugem
  ctx.save();
  ctx.globalAlpha = 0.14;
  ctx.strokeStyle = '#ff8840';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + CELL*0.1, y + CELL*0.2);
  ctx.lineTo(x + CELL*0.4, y + CELL*0.5);
  ctx.lineTo(x + CELL*0.7, y + CELL*0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + CELL*0.6, y + CELL*0.6);
  ctx.lineTo(x + CELL*0.9, y + CELL*0.8);
  ctx.stroke();
  ctx.restore();
}

function _desenharChaoForest(ctx, x, y) {
  // Musgo bioluminescente: pontos verde-turquesa pulsantes (estáticos)
  ctx.save();
  const pts = [[0.2,0.8],[0.5,0.6],[0.8,0.85],[0.35,0.4],[0.7,0.5]];
  pts.forEach(([px,py], i) => {
    const g = ctx.createRadialGradient(
      x+px*CELL, y+py*CELL, 0,
      x+px*CELL, y+py*CELL, CELL*0.12
    );
    g.addColorStop(0, 'rgba(40,240,130,0.30)');
    g.addColorStop(1, 'rgba(40,240,130,0.00)');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, CELL, CELL);
  });
  ctx.restore();
}

function _desenharChaoSolar(ctx, x, y) {
  // Plasma ondulante: linhas de calor douradas
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = '#ffcc00';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 2; i++) {
    const oy = y + CELL * (0.3 + i * 0.4);
    ctx.beginPath();
    ctx.moveTo(x, oy);
    ctx.bezierCurveTo(
      x+CELL*0.25, oy-CELL*0.1,
      x+CELL*0.75, oy+CELL*0.1,
      x+CELL, oy
    );
    ctx.stroke();
  }
  ctx.restore();
}

function _desenharDetalheChao(ctx, x, y, tipo) {
  if (tipo === 'lunar')    _desenharChaoLunar(ctx, x, y);
  else if (tipo === 'nebula')   _desenharChaoNebula(ctx, x, y);
  else if (tipo === 'void')     _desenharChaoVoid(ctx, x, y);
  else if (tipo === 'asteroid') _desenharChaoAsteroid(ctx, x, y);
  else if (tipo === 'forest')   _desenharChaoForest(ctx, x, y);
  else if (tipo === 'solar')    _desenharChaoSolar(ctx, x, y);
}

// ── Obstáculos por tema ───────────────────────────────────────

function _obsLunar(ctx, x, y) {
  // Cratera de impacto: anel concêntrico, fundo mais escuro
  const g = ctx.createRadialGradient(x+CELL*0.5,y+CELL*0.5, CELL*0.1, x+CELL*0.5,y+CELL*0.5, CELL*0.7);
  g.addColorStop(0,   '#050810');
  g.addColorStop(0.6, '#1a2030');
  g.addColorStop(0.85,'#2c3a4a');
  g.addColorStop(1,   '#3a4a5c');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, CELL, CELL);
  // Anel brilhante (borda da cratera)
  ctx.save();
  ctx.strokeStyle = '#8ab0d8';
  ctx.lineWidth = CELL * 0.06;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.arc(x+CELL/2, y+CELL/2, CELL*0.38, 0, Math.PI*2);
  ctx.stroke();
  // Brilho interno da borda
  ctx.strokeStyle = '#c8e0ff';
  ctx.lineWidth = CELL * 0.025;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.arc(x+CELL/2, y+CELL/2, CELL*0.36, 0, Math.PI*2);
  ctx.stroke();
  ctx.restore();
  // Emoji
  if (CELL >= 40) {
    ctx.save(); ctx.font=`${CELL*0.38}px serif`; ctx.textAlign='center';
    ctx.textBaseline='middle'; ctx.globalAlpha=0.55;
    ctx.fillText('🌑', x+CELL/2, y+CELL/2);
    ctx.restore();
  }
}

function _obsNebula(ctx, x, y) {
  // Cristal de plasma: facetado, translúcido magenta
  ctx.fillStyle = '#2a0a40';
  ctx.fillRect(x, y, CELL, CELL);
  // Gradiente interno cristalino
  const g = ctx.createLinearGradient(x, y, x+CELL, y+CELL);
  g.addColorStop(0,   'rgba(200,80,255,0.45)');
  g.addColorStop(0.5, 'rgba(100,20,180,0.20)');
  g.addColorStop(1,   'rgba(60,0,120,0.50)');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, CELL, CELL);
  // Reflexo interno (faceta)
  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = '#e0b0ff';
  ctx.beginPath();
  ctx.moveTo(x+CELL*0.15, y+CELL*0.1);
  ctx.lineTo(x+CELL*0.55, y+CELL*0.1);
  ctx.lineTo(x+CELL*0.35, y+CELL*0.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // Borda brilhante
  ctx.strokeStyle = '#c084fc';
  ctx.lineWidth = 2;
  ctx.strokeRect(x+1, y+1, CELL-2, CELL-2);
  // Glow
  const glow = ctx.createRadialGradient(x+CELL/2,y+CELL/2,0,x+CELL/2,y+CELL/2,CELL*0.8);
  glow.addColorStop(0, 'rgba(180,80,255,0.0)');
  glow.addColorStop(1, 'rgba(180,80,255,0.22)');
  ctx.fillStyle = glow; ctx.fillRect(x, y, CELL, CELL);
  if (CELL >= 40) {
    ctx.save(); ctx.font=`${CELL*0.38}px serif`; ctx.textAlign='center';
    ctx.textBaseline='middle'; ctx.globalAlpha=0.60;
    ctx.fillText('💜', x+CELL/2, y+CELL/2);
    ctx.restore();
  }
}

function _obsVoid(ctx, x, y) {
  // Matéria comprimida: quase negro, brilho azul-elétrico nas bordas
  ctx.fillStyle = '#030306';
  ctx.fillRect(x, y, CELL, CELL);
  // Bordas distorcidas azul-elétrico
  const g = ctx.createLinearGradient(x, y, x, y+CELL);
  g.addColorStop(0,   'rgba(80,80,255,0.55)');
  g.addColorStop(0.08,'rgba(20,20,80,0.10)');
  g.addColorStop(0.92,'rgba(20,20,80,0.10)');
  g.addColorStop(1,   'rgba(80,80,255,0.40)');
  ctx.fillStyle = g; ctx.fillRect(x, y, CELL, CELL);
  // Linhas de energia
  ctx.save();
  ctx.strokeStyle = '#7070ff';
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.30;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(x, y + CELL*(i/4));
    ctx.lineTo(x+CELL, y + CELL*(i/4));
    ctx.stroke();
  }
  ctx.restore();
  // Borda azul
  ctx.strokeStyle = '#5555cc';
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.8;
  ctx.strokeRect(x+1, y+1, CELL-2, CELL-2);
  ctx.globalAlpha = 1;
  if (CELL >= 40) {
    ctx.save(); ctx.font=`${CELL*0.38}px serif`; ctx.textAlign='center';
    ctx.textBaseline='middle'; ctx.globalAlpha=0.55;
    ctx.fillText('🕳️', x+CELL/2, y+CELL/2);
    ctx.restore();
  }
}

function _obsAsteroid(ctx, x, y) {
  // Bloco de ferro-níquel incandescente: marrom-escuro com veios laranja
  ctx.fillStyle = '#3a1800';
  ctx.fillRect(x, y, CELL, CELL);
  // Textura de rocha metalizada
  ctx.save();
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 1.2;
  for (let d = -CELL; d < CELL*2; d += Math.max(7, CELL/7)) {
    ctx.beginPath();
    ctx.moveTo(x+d, y);
    ctx.lineTo(x+d+CELL, y+CELL);
    ctx.stroke();
  }
  ctx.restore();
  // Veios de metal incandescente
  ctx.save();
  ctx.strokeStyle = '#ff7730';
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.50;
  ctx.beginPath(); ctx.moveTo(x+CELL*0.1,y+CELL*0.3); ctx.lineTo(x+CELL*0.5,y+CELL*0.6); ctx.lineTo(x+CELL*0.9,y+CELL*0.4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x+CELL*0.3,y+CELL*0.7); ctx.lineTo(x+CELL*0.7,y+CELL*0.85); ctx.stroke();
  ctx.restore();
  // Brilho de calor na borda superior
  const gTop = ctx.createLinearGradient(x, y, x, y+CELL*0.3);
  gTop.addColorStop(0,   'rgba(255,120,40,0.70)');
  gTop.addColorStop(1,   'rgba(255,120,40,0.00)');
  ctx.fillStyle = gTop; ctx.fillRect(x, y, CELL, CELL*0.3);
  ctx.fillStyle = '#ff7730'; ctx.fillRect(x, y, CELL, 3);
  // Glow laranja
  const glow = ctx.createRadialGradient(x+CELL/2,y+CELL/2,CELL*0.15,x+CELL/2,y+CELL/2,CELL*0.85);
  glow.addColorStop(0, 'rgba(0,0,0,0)');
  glow.addColorStop(1, 'rgba(255,100,20,0.28)');
  ctx.fillStyle = glow; ctx.fillRect(x, y, CELL, CELL);
  if (CELL >= 40) {
    ctx.save(); ctx.font=`${CELL*0.38}px serif`; ctx.textAlign='center';
    ctx.textBaseline='middle'; ctx.globalAlpha=0.60;
    ctx.fillText('🔥', x+CELL/2, y+CELL/2);
    ctx.restore();
  }
}

function _obsForest(ctx, x, y) {
  // Espinho bioluminescente: verde-negro com borda turquesa incandescente
  ctx.fillStyle = '#041208';
  ctx.fillRect(x, y, CELL, CELL);
  // Gradiente de profundidade vegetal
  const g = ctx.createLinearGradient(x, y, x, y+CELL);
  g.addColorStop(0,   'rgba(20,200,100,0.30)');
  g.addColorStop(0.4, 'rgba(10,80,40,0.15)');
  g.addColorStop(1,   'rgba(0,30,10,0.40)');
  ctx.fillStyle = g; ctx.fillRect(x, y, CELL, CELL);
  // Espinho triangular central
  ctx.save();
  ctx.fillStyle = '#0a3018';
  ctx.beginPath();
  ctx.moveTo(x+CELL*0.5, y+CELL*0.05);
  ctx.lineTo(x+CELL*0.85, y+CELL*0.9);
  ctx.lineTo(x+CELL*0.15, y+CELL*0.9);
  ctx.closePath();
  ctx.fill();
  // Borda luminosa do espinho
  ctx.strokeStyle = '#22e87a';
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.8;
  ctx.stroke();
  ctx.restore();
  // Brilho bioluminescente nas bordas
  ctx.strokeStyle = '#22e87a';
  ctx.lineWidth = 2; ctx.globalAlpha = 0.6;
  ctx.strokeRect(x+1, y+1, CELL-2, CELL-2);
  ctx.globalAlpha = 1;
  // Glow verde
  const glow = ctx.createRadialGradient(x+CELL/2,y+CELL/2,CELL*0.15,x+CELL/2,y+CELL/2,CELL*0.85);
  glow.addColorStop(0, 'rgba(0,0,0,0)');
  glow.addColorStop(1, 'rgba(20,220,100,0.25)');
  ctx.fillStyle = glow; ctx.fillRect(x, y, CELL, CELL);
  if (CELL >= 40) {
    ctx.save(); ctx.font=`${CELL*0.38}px serif`; ctx.textAlign='center';
    ctx.textBaseline='middle'; ctx.globalAlpha=0.65;
    ctx.fillText('🌿', x+CELL/2, y+CELL/2);
    ctx.restore();
  }
}

function _obsSolar(ctx, x, y) {
  // Pilar de plasma dourado-branco: intenso, quase cegante
  const g = ctx.createLinearGradient(x, y, x, y+CELL);
  g.addColorStop(0,   '#7a4000');
  g.addColorStop(0.3, '#5c2800');
  g.addColorStop(0.7, '#3a1800');
  g.addColorStop(1,   '#281000');
  ctx.fillStyle = g; ctx.fillRect(x, y, CELL, CELL);
  // Núcleo de plasma: coluna brilhante central
  const gPlasma = ctx.createLinearGradient(x+CELL*0.3, y, x+CELL*0.7, y);
  gPlasma.addColorStop(0,   'rgba(255,220,50,0.0)');
  gPlasma.addColorStop(0.5, 'rgba(255,220,50,0.55)');
  gPlasma.addColorStop(1,   'rgba(255,220,50,0.0)');
  ctx.fillStyle = gPlasma; ctx.fillRect(x, y, CELL, CELL);
  // Textura de ondas de calor
  ctx.save();
  ctx.strokeStyle = 'rgba(255,180,0,0.25)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const oy = y + CELL*(i*0.25);
    ctx.beginPath();
    ctx.moveTo(x, oy);
    ctx.bezierCurveTo(x+CELL*0.25,oy-CELL*0.05,x+CELL*0.75,oy+CELL*0.05,x+CELL,oy);
    ctx.stroke();
  }
  ctx.restore();
  // Borda superior — faixa de plasma branco-quente
  const gBorda = ctx.createLinearGradient(x, y, x, y+5);
  gBorda.addColorStop(0, '#ffffa0');
  gBorda.addColorStop(1, '#ffe040');
  ctx.fillStyle = gBorda; ctx.fillRect(x, y, CELL, 4);
  // Glow dourado intenso
  const glow = ctx.createRadialGradient(x+CELL/2,y+CELL/2,CELL*0.1,x+CELL/2,y+CELL/2,CELL*0.85);
  glow.addColorStop(0, 'rgba(255,200,0,0.0)');
  glow.addColorStop(1, 'rgba(255,200,0,0.35)');
  ctx.fillStyle = glow; ctx.fillRect(x, y, CELL, CELL);
  if (CELL >= 40) {
    ctx.save(); ctx.font=`${CELL*0.38}px serif`; ctx.textAlign='center';
    ctx.textBaseline='middle'; ctx.globalAlpha=0.65;
    ctx.fillText('⚡', x+CELL/2, y+CELL/2);
    ctx.restore();
  }
}

function desenharMapa(ctx, mapa, offsetX, offsetY) {
  const T = _temaAtual;
  mapa.forEach((linha, row) => {
    linha.forEach((tile, col) => {
      const x = offsetX + col * CELL;
      const y = offsetY + row * CELL;

      if (tile === 2) {
        // ── Obstáculo: renderização temática ─────────────────
        const det = T.chaoDetalhe;
        if      (det === 'lunar')    _obsLunar(ctx, x, y);
        else if (det === 'nebula')   _obsNebula(ctx, x, y);
        else if (det === 'void')     _obsVoid(ctx, x, y);
        else if (det === 'asteroid') _obsAsteroid(ctx, x, y);
        else if (det === 'forest')   _obsForest(ctx, x, y);
        else if (det === 'solar')    _obsSolar(ctx, x, y);
        else                         _obsLunar(ctx, x, y);

      } else {
        // ── Tile normal: chão ou vazio ────────────────────────
        if (tile === 1) {
          // Gradiente suave de profundidade no chão
          const gChao = ctx.createLinearGradient(x, y, x, y+CELL);
          gChao.addColorStop(0, T.chaoGrad[0]);
          gChao.addColorStop(1, T.chaoGrad[1]);
          ctx.fillStyle = gChao;
          ctx.fillRect(x, y, CELL, CELL);
          // Detalhe temático no chão
          _desenharDetalheChao(ctx, x, y, T.chaoDetalhe);
        } else {
          ctx.fillStyle = T.vazio;
          ctx.fillRect(x, y, CELL, CELL);
        }
        ctx.strokeStyle = T.grade;
        ctx.lineWidth   = 1;
        ctx.strokeRect(x, y, CELL, CELL);
      }
    });
  });
}

function desenharEstrelas(ctx, estrelas, offsetX, offsetY) {
  ctx.save();
  ctx.font      = `${CELL * 0.55}px serif`;
  ctx.textAlign = 'center';
  estrelas.forEach(s => {
    const x = offsetX + s.x * CELL + CELL / 2;
    const y = offsetY + s.y * CELL + CELL * 0.72;
    ctx.fillText('⭐', x, y);
  });
  ctx.restore();
}

function desenharRobo(ctx, robo, char, offsetX, offsetY) {
  ctx.save();
  ctx.font      = `${CELL * 0.6}px serif`;
  ctx.textAlign = 'center';
  const x = offsetX + robo.x * CELL + CELL / 2;
  const y = offsetY + robo.y * CELL + CELL * 0.75;
  ctx.fillText(char, x, y);
  ctx.restore();
}

// Cache de partículas de fundo por tema
let _bgParticulas = null;
let _bgTemaCache  = null;

function _gerarParticulas(canvas) {
  const T = _temaAtual;
  if (_bgTemaCache === T && _bgParticulas) return _bgParticulas;
  _bgTemaCache = T;
  const p = T.bgParticles;
  _bgParticulas = [];
  const count = Math.floor((canvas.width * canvas.height) / 8000);
  for (let i = 0; i < count; i++) {
    _bgParticulas.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: p.tamanho * (0.5 + Math.random()),
      a: p.opacidade * (0.4 + Math.random() * 0.6),
    });
  }
  return _bgParticulas;
}

function renderMundo(ctx, canvas, estado, mapa, offsetX, offsetY) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Fundo com gradiente do tema
  const T = _temaAtual;
  const cx = canvas.width * 0.5;
  const cy = canvas.height * 0.5;
  const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(canvas.width, canvas.height)*0.75);
  bgGrad.addColorStop(0, T.chaoGrad[1]);   // centro com cor do chão mais escura
  bgGrad.addColorStop(1, T.vazio);         // bordas com o vazio do tema
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Partículas de fundo (estrelas/poeira/névoa)
  const parts = _gerarParticulas(canvas);
  const pc = T.bgParticles.cor;
  parts.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.a;
    ctx.fillStyle = pc;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  });

  desenharMapa(ctx, mapa, offsetX, offsetY);
  desenharEstrelas(ctx, estado.estrelas, offsetX, offsetY);
}

function renderRobo(ctx, robo, playerChar, offsetX, offsetY) {
  desenharRobo(ctx, robo, playerChar, offsetX, offsetY);
}

function render(ctx, canvas, estado, mapa, playerChar, offsetX, offsetY) {
  renderMundo(ctx, canvas, estado, mapa, offsetX, offsetY);
  desenharRobo(ctx, estado.robo, playerChar, offsetX, offsetY);
}
