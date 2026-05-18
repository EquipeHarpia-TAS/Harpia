// ── Lógica do jogo ───────────────────────────────────────────
// COLS e ROWS vêm do mapa da fase — cada fase pode ter tamanho diferente.

const COMANDOS_VALIDOS = new Set(['right', 'left', 'up', 'down', 'spin', 'collect']);

function validarComandos(comandos) {
  if (!Array.isArray(comandos) || comandos.length === 0) {
    return { valido: false, erro: 'Nenhum comando enviado.' };
  }
  for (const cmd of comandos) {
    if (!COMANDOS_VALIDOS.has(cmd)) {
      return { valido: false, erro: `Comando inválido: "${cmd}"` };
    }
  }
  return { valido: true };
}

function executarComandos(comandos, roboInicial, estrelasIniciais, mapa) {
  let robo      = { ...roboInicial };
  let estrelas  = estrelasIniciais.map(s => ({ ...s }));
  let coletadas = 0;
  const totalEstrelas = estrelas.length;
  const passos = [];

  const COLS = mapa[0].length;
  const ROWS = mapa.length;

  passos.push({
    passo: 0,
    cmd: 'inicio',
    robo: { ...robo },
    estrelas: estrelas.map(s => ({ ...s })),
    coletadas
  });

  for (let i = 0; i < comandos.length; i++) {
    const cmd = comandos[i];

    switch (cmd) {
      case 'right':   if (robo.x < COLS - 1) robo.x++; break;
      case 'left':    if (robo.x > 0)         robo.x--; break;
      case 'up':      if (robo.y > 0)         robo.y--; break;
      case 'down':    if (robo.y < ROWS - 1)  robo.y++; break;
      case 'spin':    break;
      case 'collect': {
        const idx = estrelas.findIndex(s => s.x === robo.x && s.y === robo.y);
        if (idx >= 0) { estrelas.splice(idx, 1); coletadas++; }
        break;
      }
    }

    passos.push({
      passo: i + 1,
      cmd,
      robo: { ...robo },
      estrelas: estrelas.map(s => ({ ...s })),
      coletadas
    });
  }

  return { passos, coletadas, totalEstrelas, vitoria: coletadas === totalEstrelas };
}

module.exports = { validarComandos, executarComandos };