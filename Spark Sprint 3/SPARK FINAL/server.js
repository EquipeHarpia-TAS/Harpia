const express = require('express');
const path    = require('path');

const { validarComandos, executarComandos } = require('./gameLogic');
const FASES = require('./fases');
console.log('FASES carregadas:', JSON.stringify(FASES[0]));

const app  = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Rota principal ────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── API: retorna todas as fases ───────────────────────────────
// O frontend nunca tem os dados das fases hardcoded — busca aqui.
app.get('/api/fases', (req, res) => {
  res.json(FASES);
});

// ── API: executa os comandos do programa do robô ──────────────
app.post('/api/executar', (req, res) => {
  const { comandos, faseId } = req.body;

  // Valida comandos
  const validacao = validarComandos(comandos);
  if (!validacao.valido) {
    return res.status(400).json({ erro: validacao.erro });
  }

  // Busca a fase pelo ID
  const fase = FASES.find(f => f.id === faseId);
  if (!fase) {
    return res.status(404).json({ erro: `Fase ${faseId} não encontrada.` });
  }

  // Executa e retorna os passos
  const resultado = executarComandos(comandos, fase.roboInicial, fase.estrelas, fase.mapa);
  res.json(resultado);
});

// ── Inicia o servidor ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Spark rodando em http://localhost:${PORT}`);
});
