// ── Animator ─────────────────────────────────────────────────
const ANIM_NORMAL  = 220;
const ANIM_FREIO   = 380;
const TRAIL_LENGTH = 25;

let animando = false;
let trail    = [];
let sparkles = [];

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function roboParaPx(robo, offsetX, offsetY) {
  return {
    px: offsetX + robo.x * CELL + CELL / 2,
    py: offsetY + robo.y * CELL + CELL * 0.75
  };
}

function desenharTrail(ctx) {
  if (trail.length < 2) return;
  const baseRadius = CELL * 0.35;

  for (let i = 0; i < trail.length; i++) {
    const age    = i / (trail.length - 1);
    const radius = baseRadius * (1 - age);
    if (radius < 0.5) continue;

    const { px, py } = trail[i];
    const grad = ctx.createRadialGradient(px, py, 0, px, py, radius);
    grad.addColorStop(0,   `rgba(200, 160, 255, ${0.90 * (1 - age)})`);
    grad.addColorStop(0.4, `rgba( 80, 100, 255, ${0.70 * (1 - age)})`);
    grad.addColorStop(1,   `rgba( 30,  20, 180, 0)`);

    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }
}

function atualizarSparkles(px, py) {
  if (Math.random() < 0.35) {
    sparkles.push({
      px: px + (Math.random() - 0.5) * CELL * 0.8,
      py: py + (Math.random() - 0.5) * CELL * 0.8,
      vida: 1.0,
      tamanho: 2 + Math.random() * 3
    });
  }
  sparkles = sparkles.filter(s => s.vida > 0.05);
  for (const s of sparkles) {
    s.vida -= 0.06;
  }
}

function desenharSparkles(ctx) {
  for (const s of sparkles) {
    ctx.beginPath();
    ctx.arc(s.px, s.py, s.tamanho * s.vida, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(220, 200, 255, ${s.vida})`;
    ctx.fill();
  }
}

function animarShake(ctx, canvas, robo, mapa, playerChar, offsetX, offsetY, estado) {
  return new Promise(resolve => {
    const SHAKE_DUR = 420;
    const inicio = performance.now();
    const { px: cx, py: cy } = roboParaPx(robo, offsetX, offsetY);
    function frame(agora) {
      const t = Math.min((agora - inicio) / SHAKE_DUR, 1);
      const decay = 1 - t;
      const shakeX = Math.sin(t * Math.PI * 7) * CELL * 0.12 * decay;
      const roboShake = { x: robo.x + shakeX / CELL, y: robo.y };
      renderMundo(ctx, canvas, { robo: roboShake, estrelas: estado.estrelas }, mapa, offsetX, offsetY);
      desenharTrail(ctx);
      desenharSparkles(ctx);
      // Red flash overlay on bloqueado tile
      const bx = offsetX + robo.x * CELL;
      const by = offsetY + robo.y * CELL;
      ctx.save();
      ctx.globalAlpha = 0.25 * decay;
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(bx, by, CELL, CELL);
      ctx.restore();
      renderRobo(ctx, roboShake, playerChar, offsetX, offsetY);
      if (t < 1) requestAnimationFrame(frame);
      else resolve();
    }
    requestAnimationFrame(frame);
  });
}

function animarPasso(ctx, canvas, passoAnterior, passoAtual, proximoPasso, mapa, playerChar, offsetX, offsetY, onColetou) {
  return new Promise(resolve => {
    const roboAnterior = passoAnterior.robo;
    const roboAtual    = passoAtual.robo;

    if (passoAtual.coletadas > passoAnterior.coletadas) {
      onColetou(passoAtual.coletadas);
    }

    // Se bloqueado: anima shake no lugar e resolve
    if (passoAtual.bloqueado) {
      animarShake(ctx, canvas, roboAtual, mapa, playerChar, offsetX, offsetY, passoAtual).then(resolve);
      return;
    }

    const dirAtualX   = roboAtual.x - roboAnterior.x;
    const dirAtualY   = roboAtual.y - roboAnterior.y;
    const dirProxX    = proximoPasso ? proximoPasso.robo.x - roboAtual.x : 0;
    const dirProxY    = proximoPasso ? proximoPasso.robo.y - roboAtual.y : 0;
    const mudaDirecao = proximoPasso && (dirAtualX !== dirProxX || dirAtualY !== dirProxY);
    const ehUltimo    = !proximoPasso;
    const coletou     = passoAtual.coletadas > passoAnterior.coletadas;
    const deveFrear   = mudaDirecao || ehUltimo || coletou;

    const duracao = deveFrear ? ANIM_FREIO : ANIM_NORMAL;
    const inicio  = performance.now();

function frame(agora) {
      const elapsed  = agora - inicio;
      const progress = Math.min(elapsed / duracao, 1);
      const t        = deveFrear ? easeOutQuart(progress) : easeInOutCubic(progress);

      const roboInterpolado = {
        x: lerp(roboAnterior.x, roboAtual.x, t),
        y: lerp(roboAnterior.y, roboAtual.y, t)
      };

      const pos = roboParaPx(roboInterpolado, offsetX, offsetY);
      trail.unshift(pos);
      if (trail.length > TRAIL_LENGTH) trail.pop();
      atualizarSparkles(pos.px, pos.py);

      renderMundo(ctx, canvas, { robo: roboInterpolado, estrelas: passoAtual.estrelas }, mapa, offsetX, offsetY);
      desenharTrail(ctx);
      desenharSparkles(ctx);
      renderRobo(ctx, roboInterpolado, playerChar, offsetX, offsetY);

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        renderMundo(ctx, canvas, { robo: roboAtual, estrelas: passoAtual.estrelas }, mapa, offsetX, offsetY);
        desenharTrail(ctx);
        desenharSparkles(ctx);
        renderRobo(ctx, roboAtual, playerChar, offsetX, offsetY);
        resolve();
      }
    }

    requestAnimationFrame(frame);
  });
}

async function executarAnimacao(ctx, canvas, passos, mapa, playerChar, offsetX, offsetY, onPasso, onColetou, onFim) {
  if (animando) return;
  animando = true;
  trail    = [];
  sparkles = [];

  try {
    for (let i = 1; i < passos.length; i++) {
      onPasso(i - 1);
      const proximoPasso = i + 1 < passos.length ? passos[i + 1] : null;
      await animarPasso(
        ctx, canvas,
        passos[i - 1], passos[i], proximoPasso,
        mapa, playerChar, offsetX, offsetY,
        onColetou
      );
    }
  } catch(e) {
    console.error('Erro na animação:', e);
} finally {
    animando = false;
    trail    = [];
    sparkles = [];
    onFim();
  }
  }

