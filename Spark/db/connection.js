// db/connection.js
// Inicializa o banco SQLite e cria as tabelas se não existirem.

const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'spark.db'));

// Ativa WAL mode — melhor performance para leitura/escrita simultânea
db.pragma('journal_mode = WAL');

db.exec(`
  -- Jogadores cadastrados
  CREATE TABLE IF NOT EXISTS jogadores (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    nome      TEXT    NOT NULL UNIQUE,
    criado_em TEXT    DEFAULT (datetime('now'))
  );

  -- Progresso por fase (qual fase está desbloqueada)
  CREATE TABLE IF NOT EXISTS progresso (
    jogador_id    INTEGER NOT NULL,
    fase_id       INTEGER NOT NULL,
    concluida     INTEGER DEFAULT 0,   -- 0 = não, 1 = sim
    melhor_cmds   INTEGER,             -- menor número de comandos usado pra vencer
    PRIMARY KEY (jogador_id, fase_id),
    FOREIGN KEY (jogador_id) REFERENCES jogadores(id)
  );

  -- Histórico de cada tentativa
  CREATE TABLE IF NOT EXISTS tentativas (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    jogador_id    INTEGER NOT NULL,
    fase_id       INTEGER NOT NULL,
    comandos      TEXT    NOT NULL,    -- JSON array dos comandos usados
    coletadas     INTEGER NOT NULL,
    total         INTEGER NOT NULL,
    vitoria       INTEGER NOT NULL,   -- 0 ou 1
    feito_em      TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (jogador_id) REFERENCES jogadores(id)
  );
`);

module.exports = db;
