const express = require('express');
const path    = require('path');

const { validarComandos, executarComandos } = require('./gameLogic');
const FASES_BASE = require('./fases');
const { gerarMapa }  = require('./gerarMapa');
const { init, getProgresso, salvarProgresso } = require('./db');

const app  = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Rota principal ────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── API: retorna todas as fases com mapa gerado aleatoriamente ─
// Cada GET /api/fases gera novos mapas (barreiras novas a cada vez)
app.get('/api/fases', (req, res) => {
  const fases = FASES_BASE.map(fase => ({
    ...fase,
    mapa: gerarMapa(fase),
  }));
  res.json(fases);
});

// ── API: executa os comandos do programa do robô ──────────────
// O body deve conter { comandos, faseId, mapa }
// O frontend manda de volta o mapa que recebeu (evita re-geração)
app.post('/api/executar', (req, res) => {
  const { comandos, faseId, mapa } = req.body;

  const validacao = validarComandos(comandos);
  if (!validacao.valido) {
    return res.status(400).json({ erro: validacao.erro });
  }

  const faseDef = FASES_BASE.find(f => f.id === faseId);
  if (!faseDef) {
    return res.status(404).json({ erro: `Fase ${faseId} não encontrada.` });
  }

  // Usa o mapa enviado pelo frontend (o mesmo que foi gerado e exibido)
  // Se não vier mapa (cliente antigo), gera um novo
  const mapaFinal = (Array.isArray(mapa) && mapa.length > 0)
    ? mapa
    : gerarMapa(faseDef);

  const resultado = executarComandos(
    comandos, faseDef.roboInicial, faseDef.estrelas, mapaFinal
  );
  res.json(resultado);
});

// ── API: progresso do jogador ─────────────────────────────────
app.get('/api/progresso/:deviceId', async (req, res) => {
  try {
    const dados = await getProgresso(req.params.deviceId);
    res.json(dados || {});
  } catch(e) {
    res.status(500).json({ erro: 'Erro ao ler progresso.' });
  }
});

app.post('/api/progresso/:deviceId', async (req, res) => {
  try {
    const { faseAtual, fasesCompletas, volume } = req.body;
    await salvarProgresso(req.params.deviceId, { faseAtual, fasesCompletas, volume });
    res.json({ ok: true });
  } catch(e) {
    res.status(500).json({ erro: 'Erro ao salvar progresso.' });
  }
});

init().catch(console.error);

app.listen(PORT, () => {
  console.log(`🚀 Spark rodando em http://localhost:${PORT}`);
});
