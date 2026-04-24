const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

/* Serve os arquivos estáticos da pasta /public */
app.use(express.static(path.join(__dirname, 'public')));

/* Rota raiz → index.html */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* Rota da fase 1 */
app.get('/fase1', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'fase1.html'));
});

/* Rota da fase 2 */
app.get('/fase2', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'fase2.html'));
});

/* Rota da fase 3 */
app.get('/fase3', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'fase3.html'));
});

app.listen(PORT, () => {
  console.log(`🎮 Desenha Mundo rodando em http://localhost:${PORT}`);
});
