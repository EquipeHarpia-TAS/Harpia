// ── Renderer ─────────────────────────────────────────────────
let CELL = 72;

function calcularCell(canvas, cols, rows) {
  const areaW = canvas.width - 20;
  const areaH = canvas.height - 52 - 110;
  CELL = Math.floor(Math.min(areaW / cols, areaH / rows));
}

const COR_CHAO  = '#1a3a5c';
const COR_VAZIO = '#060f1e';
const COR_GRADE = 'rgba(255,255,255,0.04)';

function desenharMapa(ctx, mapa, offsetX, offsetY) {
  mapa.forEach((linha, row) => {
    linha.forEach((tile, col) => {
      const x = offsetX + col * CELL;
      const y = offsetY + row * CELL;
      ctx.fillStyle = tile === 1 ? COR_CHAO : COR_VAZIO;
      ctx.fillRect(x, y, CELL, CELL);
      ctx.strokeStyle = COR_GRADE;
      ctx.lineWidth   = 1;
      ctx.strokeRect(x, y, CELL, CELL);
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

function renderMundo(ctx, canvas, estado, mapa, offsetX, offsetY) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = COR_VAZIO;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
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