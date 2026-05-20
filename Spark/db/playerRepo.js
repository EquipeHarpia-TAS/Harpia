// db/playerRepo.js
// Todas as operações de banco relacionadas a jogadores e progresso.

const db = require('./connection');

// ── Jogadores ─────────────────────────────────────────────────

/**
 * Cria um jogador se não existir. Retorna o jogador.
 */
function obterOuCriarJogador(nome) {
  const existente = db.prepare('SELECT * FROM jogadores WHERE nome = ?').get(nome);
  if (existente) return existente;

  const resultado = db.prepare('INSERT INTO jogadores (nome) VALUES (?)').run(nome);
  return { id: resultado.lastInsertRowid, nome };
}

// ── Progresso ─────────────────────────────────────────────────

/**
 * Retorna o progresso completo de um jogador (todas as fases).
 */
function obterProgresso(jogadorId) {
  return db.prepare('SELECT * FROM progresso WHERE jogador_id = ?').all(jogadorId);
}

/**
 * Marca uma fase como concluída e atualiza melhor_cmds se for recorde.
 */
function registrarVitoria(jogadorId, faseId, qtdComandos) {
  const atual = db
    .prepare('SELECT * FROM progresso WHERE jogador_id = ? AND fase_id = ?')
    .get(jogadorId, faseId);

  if (!atual) {
    db.prepare(`
      INSERT INTO progresso (jogador_id, fase_id, concluida, melhor_cmds)
      VALUES (?, ?, 1, ?)
    `).run(jogadorId, faseId, qtdComandos);
  } else {
    const novoMelhor = atual.melhor_cmds === null || qtdComandos < atual.melhor_cmds
      ? qtdComandos
      : atual.melhor_cmds;

    db.prepare(`
      UPDATE progresso SET concluida = 1, melhor_cmds = ?
      WHERE jogador_id = ? AND fase_id = ?
    `).run(novoMelhor, jogadorId, faseId);
  }
}

// ── Tentativas ────────────────────────────────────────────────

/**
 * Salva uma tentativa (vitória ou derrota) no histórico.
 */
function salvarTentativa({ jogadorId, faseId, comandos, coletadas, total, vitoria }) {
  db.prepare(`
    INSERT INTO tentativas (jogador_id, fase_id, comandos, coletadas, total, vitoria)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    jogadorId,
    faseId,
    JSON.stringify(comandos),
    coletadas,
    total,
    vitoria ? 1 : 0
  );
}

/**
 * Retorna o histórico de tentativas de um jogador numa fase.
 */
function obterHistorico(jogadorId, faseId) {
  return db
    .prepare('SELECT * FROM tentativas WHERE jogador_id = ? AND fase_id = ? ORDER BY feito_em DESC')
    .all(jogadorId, faseId)
    .map(t => ({ ...t, comandos: JSON.parse(t.comandos) }));
}

/**
 * Ranking global: jogadores que concluíram mais fases, com menor média de comandos.
 */
function obterRanking() {
  return db.prepare(`
    SELECT
      j.nome,
      COUNT(p.fase_id)        AS fases_concluidas,
      AVG(p.melhor_cmds)      AS media_cmds
    FROM jogadores j
    JOIN progresso p ON p.jogador_id = j.id AND p.concluida = 1
    GROUP BY j.id
    ORDER BY fases_concluidas DESC, media_cmds ASC
    LIMIT 10
  `).all();
}

module.exports = {
  obterOuCriarJogador,
  obterProgresso,
  registrarVitoria,
  salvarTentativa,
  obterHistorico,
  obterRanking
};
