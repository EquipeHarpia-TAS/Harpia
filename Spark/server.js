const express = require('express');
const path    = require('path');

const app  = express();
const PORT = 3000;

// Aceita JSON no body das requisições
app.use(express.json());

// ─── Rota principal: página do jogo ───────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// ─── API: executa o programa do robô ──────────────────────────
app.post('/api/executar', (req, res) => {
  const { comandos } = req.body;

  if (!Array.isArray(comandos) || comandos.length === 0) {
    return res.status(400).json({ erro: 'Nenhum comando enviado.' });
  }

  const COLS = 4, ROWS = 4;

  let robo      = { x: 0, y: 3 };
  let estrelas  = [{ x: 3, y: 0 }, { x: 2, y: 1 }, { x: 1, y: 2 }];
  let coletadas = 0;
  const passos  = [];

  // Estado inicial
  passos.push({ passo: 0, cmd: 'inicio', robo: { ...robo }, estrelas: estrelas.map(s => ({ ...s })), coletadas });

  for (let i = 0; i < comandos.length; i++) {
    const cmd = comandos[i];

    if      (cmd === 'right'   && robo.x < COLS - 1) robo.x++;
    else if (cmd === 'left'    && robo.x > 0)         robo.x--;
    else if (cmd === 'up'      && robo.y > 0)         robo.y--;
    else if (cmd === 'down'    && robo.y < ROWS - 1)  robo.y++;
    else if (cmd === 'spin')   { /* efeito visual apenas */ }
    else if (cmd === 'collect') {
      const idx = estrelas.findIndex(s => s.x === robo.x && s.y === robo.y);
      if (idx >= 0) { estrelas.splice(idx, 1); coletadas++; }
    }

    passos.push({ passo: i + 1, cmd, robo: { ...robo }, estrelas: estrelas.map(s => ({ ...s })), coletadas });
  }

  let mensagem;
  if (coletadas === 3)      mensagem = '⭐ Parabéns! Coletou tudo!';
  else if (coletadas > 0)   mensagem = `Ótimo! Coletou ${coletadas} estrela${coletadas > 1 ? 's' : ''}! Tente pegar todas!`;
  else                      mensagem = 'Tente chegar nas estrelas! Você consegue! 💪';

  res.json({ passos, coletadas, mensagem });
});

// ─── Inicia o servidor ────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Robozinho no Espaço rodando em http://localhost:${PORT}`);
});
