// ── Gerador de mapas aleatórios com validação BFS ─────────────
//
// Recebe a definição de uma fase (sem mapa) e gera um mapa novo
// a cada chamada, garantindo que:
//   1. O robô e todas as estrelas ficam em tiles CHÃO (1)
//   2. Todas as estrelas são alcançáveis a partir do robô (BFS)
//   3. A densidade de obstáculos (tile 2) escala com a dificuldade
//
// Tiles:
//   0 = vazio (buraco — intransponível, sem chão visual)
//   1 = chão navegável
//   2 = obstáculo (bloqueia o robô)
//
// Estratégia:
//   - Parte de um mapa 100% chão (todo tile 1)
//   - Tenta espalhar obstáculos aleatoriamente nos tiles que NÃO
//     são ocupados pelo robô ou por uma estrela
//   - Após cada inserção valida BFS; se falhar, descarta aquele tile
//   - Repete até atingir a densidade alvo ou esgotar tentativas

'use strict';

// Vizinhos 4-conectados (cima, baixo, esquerda, direita)
function _vizinhos(x, y, cols, rows) {
  return [
    [x+1, y], [x-1, y], [x, y+1], [x, y-1],
  ].filter(([nx, ny]) => nx >= 0 && nx < cols && ny >= 0 && ny < rows);
}

// BFS: retorna Set de "x,y" alcançáveis a partir de (sx, sy)
// Um tile é alcançável se mapa[y][x] !== 2  (não é obstáculo)
// e mapa[y][x] !== 0 (não é buraco — seguimos apenas tile 1)
function _bfs(mapa, sx, sy) {
  const rows = mapa.length, cols = mapa[0].length;
  const visitado = new Set();
  const fila = [[sx, sy]];
  visitado.add(`${sx},${sy}`);
  while (fila.length > 0) {
    const [cx, cy] = fila.shift();
    for (const [nx, ny] of _vizinhos(cx, cy, cols, rows)) {
      const k = `${nx},${ny}`;
      if (!visitado.has(k) && mapa[ny][nx] === 1) {
        visitado.add(k);
        fila.push([nx, ny]);
      }
    }
  }
  return visitado;
}

// Verifica se todas as estrelas são alcançáveis do robô
function _validar(mapa, robo, estrelas) {
  if (mapa[robo.y][robo.x] !== 1) return false;
  const alcancaveis = _bfs(mapa, robo.x, robo.y);
  return estrelas.every(s => alcancaveis.has(`${s.x},${s.y}`));
}

// Gera um mapa aleatório válido para uma fase
// fase: { cols, rows, roboInicial, estrelas, dificuldade }
// dificuldade 1-6 → ~10% a ~35% dos tiles chão viram obstáculo
function gerarMapa(fase) {
  const { cols, rows, roboInicial: robo, estrelas, dificuldade } = fase;

  // Células protegidas (robô + estrelas) — nunca viram obstáculo
  const protegidas = new Set(
    [robo, ...estrelas].map(p => `${p.x},${p.y}`)
  );

  // Densidade alvo de obstáculos nos tiles chão (não protegidos)
  // dif 1 → 12%,  dif 6 → 38%
  const densidadeAlvo = 0.10 + (dificuldade - 1) * 0.055;

  // Total de tiles disponíveis para virar obstáculo
  const totalChao = rows * cols - protegidas.size;
  const maxObs    = Math.floor(totalChao * densidadeAlvo);

  // Monta lista de candidatos (todas células não protegidas)
  const candidatos = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!protegidas.has(`${x},${y}`)) candidatos.push([x, y]);
    }
  }

  // Embaralha (Fisher-Yates)
  for (let i = candidatos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidatos[i], candidatos[j]] = [candidatos[j], candidatos[i]];
  }

  // Começa com mapa todo chão
  const mapa = Array.from({ length: rows }, () => Array(cols).fill(1));

  // Tenta inserir obstáculos validando BFS a cada inserção
  let inseridos = 0;
  for (const [x, y] of candidatos) {
    if (inseridos >= maxObs) break;

    mapa[y][x] = 2;           // tenta colocar obstáculo
    if (_validar(mapa, robo, estrelas)) {
      inseridos++;             // BFS ok — mantém
    } else {
      mapa[y][x] = 1;          // BFS falhou — reverte
    }
  }

  return mapa;
}

module.exports = { gerarMapa };
