// ── Definições das fases (sem mapa fixo) ─────────────────────
// O mapa é gerado dinamicamente a cada partida por gerarMapa.js
// Campos: id, emoji, nome, dificuldade, cols, rows, roboInicial, estrelas

const FASES = [
  {
    id: 0, emoji: '🌙', nome: 'Primeiro Voo', dificuldade: 1,
    cols: 6, rows: 5,
    roboInicial: { x: 0, y: 4 },
    estrelas: [{ x: 5, y: 0 }, { x: 4, y: 2 }, { x: 1, y: 4 }],
  },
  {
    id: 1, emoji: '🪐', nome: 'Nebulosa', dificuldade: 2,
    cols: 8, rows: 6,
    roboInicial: { x: 0, y: 0 },
    estrelas: [{ x: 7, y: 5 }, { x: 2, y: 2 }, { x: 6, y: 1 }],
  },
  {
    id: 2, emoji: '☄️', nome: 'Buraco Negro', dificuldade: 3,
    cols: 10, rows: 8,
    roboInicial: { x: 4, y: 4 },
    estrelas: [{ x: 0, y: 0 }, { x: 9, y: 7 }, { x: 0, y: 7 }],
  },
  {
    id: 3, emoji: '🌠', nome: 'Corredor de Asteroides', dificuldade: 4,
    cols: 9, rows: 7,
    roboInicial: { x: 0, y: 6 },
    estrelas: [{ x: 8, y: 0 }, { x: 1, y: 0 }, { x: 5, y: 3 }],
  },
  {
    id: 4, emoji: '🔭', nome: 'Labirinto Estelar', dificuldade: 5,
    cols: 10, rows: 8,
    roboInicial: { x: 0, y: 7 },
    estrelas: [{ x: 9, y: 0 }, { x: 4, y: 4 }, { x: 1, y: 2 }],
  },
  {
    id: 5, emoji: '🏆', nome: 'Fim do Universo', dificuldade: 6,
    cols: 11, rows: 9,
    roboInicial: { x: 0, y: 8 },
    estrelas: [{ x: 10, y: 0 }, { x: 5, y: 4 }, { x: 2, y: 2 }],
  },
];

module.exports = FASES;
