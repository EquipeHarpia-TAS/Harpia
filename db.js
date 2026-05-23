const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres:Cruzeirodosul@db.yxpozchcmccltidkbfql.supabase.co:5432/postgres';

async function getClient() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  return client;
}

async function init() {
  const client = await getClient();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS progresso (
        device_id       TEXT PRIMARY KEY,
        fase_atual      INTEGER DEFAULT 0,
        fases_completas TEXT DEFAULT '[]',
        volume          REAL DEFAULT 0.7,
        atualizado_em   TIMESTAMP DEFAULT NOW()
      )
    `);
  } finally {
    await client.end();
  }
}

async function getProgresso(deviceId) {
  const client = await getClient();
  try {
    const res = await client.query('SELECT * FROM progresso WHERE device_id = $1', [deviceId]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      faseAtual:      row.fase_atual,
      fasesCompletas: JSON.parse(row.fases_completas),
      volume:         row.volume,
    };
  } finally {
    await client.end();
  }
}

async function salvarProgresso(deviceId, { faseAtual, fasesCompletas, volume }) {
  const client = await getClient();
  try {
    await client.query(`
      INSERT INTO progresso (device_id, fase_atual, fases_completas, volume, atualizado_em)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (device_id) DO UPDATE SET
        fase_atual      = EXCLUDED.fase_atual,
        fases_completas = EXCLUDED.fases_completas,
        volume          = EXCLUDED.volume,
        atualizado_em   = EXCLUDED.atualizado_em
    `, [deviceId, faseAtual, JSON.stringify(fasesCompletas), volume]);
  } finally {
    await client.end();
  }
}

module.exports = { init, getProgresso, salvarProgresso };
