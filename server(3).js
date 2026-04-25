/* ════════════════════════════════════════════════
   SPARK! — Servidor Node.js
   Serve os arquivos estáticos do jogo
════════════════════════════════════════════════ */

const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// Serve a pasta public como raiz estática
app.use(express.static(path.join(__dirname, 'public')));

// Rota raiz — entrega o index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Spark! rodando em http://localhost:${PORT}`);
});
