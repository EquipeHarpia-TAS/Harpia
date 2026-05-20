const express = require('express');
const path    = require('path');

const { validarComandos, executarComandos } = require('./gameLogic');
const FASES = require('./fases');

// ── Banco de dados ────────────────────────────────────────────
const {
  obterOuCriarJogador,
  obterProgresso,
  registrarVitoria,
  salvarTentativa,
  obterHistorico,
  obterRanking
} = require('./db/playerRepo');

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
app.get('/api/fases', (req, res) => {
  res.json(FASES);
});

// ── API: cadastra/obtém jogador ───────────────────────────────
// Body: { nome: "Nathan" }
app.post('/api/jogador', (req, res) => {
  const { nome } = req.body;
  if (!nome || nome.trim() === '') {
    return res.status(400).json({ erro: 'Nome do jogador é obrigatório.' });
  }

  const jogador   = obterOuCriarJogador(nome.trim());
  const progresso = obterProgresso(jogador.id);

  res.json({ jogador, progresso });
});

// ── API: progresso de um jogador ──────────────────────────────
// GET /api/jogador/:id/progresso
app.get('/api/jogador/:id/progresso', (req, res) => {
  const progresso = obterProgresso(Number(req.params.id));
  res.json(progresso);
});

// ── API: histórico de tentativas ──────────────────────────────
// GET /api/jogador/:id/historico/:faseId
app.get('/api/jogador/:id/historico/:faseId', (req, res) => {
  const historico = obterHistorico(
    Number(req.params.id),
    Number(req.params.faseId)
  );
  res.json(historico);
});

// ── API: ranking global ───────────────────────────────────────
app.get('/api/ranking', (req, res) => {
  res.json(obterRanking());
});

// ── API: executa os comandos do programa do robô ──────────────
// Body: { comandos: [...], faseId: 0, jogadorId: 1 }
app.post('/api/executar', (req, res) => {
  const { comandos, faseId, jogadorId } = req.body;

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

  // Executa a lógica do jogo
  const resultado = executarComandos(comandos, fase.roboInicial, fase.estrelas, fase.mapa);

  // ── Persiste no banco se jogadorId fornecido ──────────────
  if (jogadorId) {
    salvarTentativa({
      jogadorId,
      faseId,
      comandos,
      coletadas: resultado.coletadas,
      total:     resultado.totalEstrelas,
      vitoria:   resultado.vitoria
    });

    if (resultado.vitoria) {
      registrarVitoria(jogadorId, faseId, comandos.length);
    }
  }

  res.json(resultado);
});

// ── Inicia o servidor ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Spark rodando em http://localhost:${PORT}`);
});
