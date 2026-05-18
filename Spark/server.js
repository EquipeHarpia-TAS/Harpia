// Fase 1: 6x5 — pequeno, fácil
// Fase 2: 8x6 — médio
// Fase 3: 10x8 — grande, difícil

const FASES = [
  {
    id: 0,
    emoji: '🌙',
    nome: 'Primeiro Voo',
    dificuldade: 1,
    roboInicial: { x: 0, y: 4 },
    estrelas: [
      { x: 5, y: 0 },
      { x: 3, y: 2 },
      { x: 1, y: 4 }
    ],
    mapa: [
      [1, 1, 1, 1, 1, 1],
      [1, 0, 1, 1, 0, 1],
      [1, 1, 1, 0, 1, 1],
      [1, 0, 1, 1, 1, 0],
      [1, 1, 0, 1, 1, 1]
    ]
  },
  {
    id: 1,
    emoji: '🪐',
    nome: 'Nebulosa',
    dificuldade: 2,
    roboInicial: { x: 0, y: 0 },
    estrelas: [
      { x: 7, y: 5 },
      { x: 3, y: 2 },
      { x: 6, y: 1 }
    ],
    mapa: [
      [1, 1, 0, 1, 1, 1, 1, 0],
      [1, 0, 1, 1, 0, 1, 1, 1],
      [1, 1, 1, 0, 1, 1, 0, 1],
      [0, 1, 1, 1, 1, 0, 1, 1],
      [1, 1, 0, 1, 1, 1, 1, 0],
      [1, 0, 1, 1, 0, 1, 1, 1]
    ]
  },
  {
    id: 2,
    emoji: '☄️',
    nome: 'Buraco Negro',
    dificuldade: 3,
    roboInicial: { x: 4, y: 4 },
    estrelas: [
      { x: 0, y: 0 },
      { x: 9, y: 7 },
      { x: 0, y: 7 }
    ],
    mapa: [
      [1, 0, 1, 1, 0, 1, 1, 0, 1, 1],
      [1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
      [0, 1, 1, 0, 1, 1, 1, 1, 0, 1],
      [1, 1, 0, 1, 1, 0, 1, 1, 1, 0],
      [1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
      [1, 1, 1, 0, 1, 1, 1, 0, 1, 1],
      [0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
      [1, 1, 0, 1, 1, 1, 0, 1, 1, 1]
    ]
  }
];

module.exports = FASES;