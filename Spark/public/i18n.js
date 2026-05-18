/* ════════════════════════════════════════════════════════════
   SPARK — Internacionalização (PT / EN)
════════════════════════════════════════════════════════════ */

const TRANSLATIONS = {
  pt: {
    /* ── Splash ── */
    splashTitle1: 'Robozinho',
    splashTitle2: 'no Espaço!',
    splashNameLabel: 'Qual é o seu nome, astronauta?',
    splashNamePlaceholder: 'Digite seu nome...',
    splashCharLabel: 'Escolha seu robô:',
    splashStart: '▶ Iniciar Missão!',
    splashContinue: '▶ Continuar Missão',
    splashHint: 'Prepare-se para programar sua nave! 🌟',

    /* ── Tutorial ── */
    tutBack: '← Voltar',
    tutSkip: 'Pular tutorial',
    tutNext: 'Próximo ➜',
    tutStart: '🚀 Iniciar Missão!',
    tutDemoHint: 'Arraste aqui!',
    tutDemoBlock: '➡️ Direita',
    tutSteps: [
      {
        emoji: '🌟',
        titulo: 'Sua Missão!',
        texto: 'Olá, Astronauta! Neste jogo você vai <b>programar um robozinho</b> para coletar as estrelas ⭐ do espaço!\n\nClique em <b>Próximo</b> para aprender como!',
        demo: false
      },
      {
        emoji: '🧩',
        titulo: 'Use os Blocos!',
        texto: 'Arraste o bloco abaixo para a área pontilhada para ver como funciona!',
        demo: true
      },
      {
        emoji: '🏆',
        titulo: 'Ganhe Recompensas!',
        texto: 'Cada estrela coletada é uma <b>vitória</b>! ⭐\n\nSe pegar todas as estrelas da fase, você ganha uma recompensa especial! 🎉\n\nVamos começar a missão!',
        demo: false
      }
    ],

    /* ── Seleção de fases ── */
    phaseSelectTitle: 'Escolha a Fase',
    phaseHome: '← Início',
    phaseCompleted: '✓ Concluída',
    phaseLocked: '🔒 Bloqueada',

    /* ── Jogo ── */
    blocksTitle: 'Blocos',
    blockLabels: {
      right:   'Direita',
      left:    'Esquerda',
      up:      'Cima',
      down:    'Baixo',
      spin:    'Girar',
      collect: 'Coletar'
    },
    dropHint: 'Arraste os blocos aqui!',
    btnRun:   '▶ Executar!',
    btnClear: 'Limpar',
    backToPhases: '← Fases',
    scoreLabel: 'estrelas ⭐',
    msgSending: '⏳ Enviando para o servidor...',
    msgNoBlocks: 'Adicione blocos primeiro! 😊',
    msgConnError: '❌ Erro de conexão com o servidor.',
    msgVictory: '<span class="star-anim">⭐</span> Parabéns! Coletou tudo!',
    msgPartial: (col, tot) => `Ótimo! Coletou ${col} de ${tot}! Tente pegar todas!`,
    msgTryAgain: 'Tente chegar nas estrelas! Você consegue! 💪',

    /* ── Configurações ── */
    settingsTitle: '⚙️ Configurações',
    settingsVolume: 'Volume',
    settingsClose: 'Fechar',

    /* ── Vitória ── */
    victoryTitle: 'Fase Concluída!',
    victorySub: 'Você coletou todas as estrelas!',
    victoryNext: 'Próxima Fase ➜',
    victorySeePhases: 'Ver Fases',

    /* ── Confirmar saída ── */
    confirmTitle: '⚠️ Voltar ao Início?',
    confirmText: 'Seu progresso na fase atual será perdido.',
    confirmCancel: 'Cancelar',
    confirmOk: 'Sim, voltar',

    /* ── Fases ── */
    phases: [
      { nome: 'Primeiro Voo' },
      { nome: 'Nebulosa' },
      { nome: 'Buraco Negro' }
    ]
  },

  en: {
    /* ── Splash ── */
    splashTitle1: 'Little Robot',
    splashTitle2: 'in Space!',
    splashNameLabel: "What's your name, astronaut?",
    splashNamePlaceholder: 'Enter your name...',
    splashCharLabel: 'Choose your robot:',
    splashStart: '▶ Start Mission!',
    splashContinue: '▶ Continue Mission',
    splashHint: 'Get ready to program your ship! 🌟',

    /* ── Tutorial ── */
    tutBack: '← Back',
    tutSkip: 'Skip tutorial',
    tutNext: 'Next ➜',
    tutStart: '🚀 Start Mission!',
    tutDemoHint: 'Drag here!',
    tutDemoBlock: '➡️ Right',
    tutSteps: [
      {
        emoji: '🌟',
        titulo: 'Your Mission!',
        texto: 'Hello, Astronaut! In this game you will <b>program a little robot</b> to collect the stars ⭐ in space!\n\nClick <b>Next</b> to learn how!',
        demo: false
      },
      {
        emoji: '🧩',
        titulo: 'Use the Blocks!',
        texto: 'Drag the block below to the dotted area to see how it works!',
        demo: true
      },
      {
        emoji: '🏆',
        titulo: 'Earn Rewards!',
        texto: 'Every star collected is a <b>victory</b>! ⭐\n\nIf you grab all the stars in the level, you earn a special reward! 🎉\n\nLet\'s start the mission!',
        demo: false
      }
    ],

    /* ── Phase select ── */
    phaseSelectTitle: 'Choose a Level',
    phaseHome: '← Home',
    phaseCompleted: '✓ Completed',
    phaseLocked: '🔒 Locked',

    /* ── Game ── */
    blocksTitle: 'Blocks',
    blockLabels: {
      right:   'Right',
      left:    'Left',
      up:      'Up',
      down:    'Down',
      spin:    'Spin',
      collect: 'Collect'
    },
    dropHint: 'Drag blocks here!',
    btnRun:   '▶ Run!',
    btnClear: 'Clear',
    backToPhases: '← Levels',
    scoreLabel: 'stars ⭐',
    msgSending: '⏳ Sending to server...',
    msgNoBlocks: 'Add some blocks first! 😊',
    msgConnError: '❌ Connection error.',
    msgVictory: '<span class="star-anim">⭐</span> Congrats! All stars collected!',
    msgPartial: (col, tot) => `Nice! Collected ${col} of ${tot}! Try to get them all!`,
    msgTryAgain: 'Try to reach the stars! You can do it! 💪',

    /* ── Settings ── */
    settingsTitle: '⚙️ Settings',
    settingsVolume: 'Volume',
    settingsClose: 'Close',

    /* ── Victory ── */
    victoryTitle: 'Level Complete!',
    victorySub: 'You collected all the stars!',
    victoryNext: 'Next Level ➜',
    victorySeePhases: 'See Levels',

    /* ── Confirm exit ── */
    confirmTitle: '⚠️ Go back to Home?',
    confirmText: 'Your progress in the current level will be lost.',
    confirmCancel: 'Cancel',
    confirmOk: 'Yes, go back',

    /* ── Phases ── */
    phases: [
      { nome: 'First Flight' },
      { nome: 'Nebula' },
      { nome: 'Black Hole' }
    ]
  }
};

/* Idioma ativo — padrão: português */
let currentLang = localStorage.getItem('spark_lang') || 'pt';

function t() {
  return TRANSLATIONS[currentLang];
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('spark_lang', lang);
}

/* ── Narrativa do Zyron ──────────────────────────────────── */
TRANSLATIONS.pt.story = [
  {
    falas: [
      "Pequeno Spark. Você não foi feito para isso.",
      "Mas o universo não pediu permissão.",
      "A Estação Orion-7 está morrendo. Suas estrelas de plasma flutuam nos destroços.",
      "Sem elas… silêncio eterno.",
      "Você é o único que ainda funciona. O único que pode agir.",
      "Voe, Spark. O universo está observando."
    ]
  },
  {
    falas: [
      "Você voltou. Eu sabia que voltaria.",
      "Mas as estrelas restantes estão mais fundo — dentro da Nebulosa Cinzenta, onde a luz some.",
      "E Spark… algo se move lá dentro. Algo que não quer que você chegue até elas.",
      "Continue. O medo é apenas energia que ainda não encontrou direção."
    ]
  },
  {
    falas: [
      "Esta é a borda, Spark. Daqui em diante, nem eu posso garantir nada.",
      "As últimas estrelas estão além — na fronteira do buraco negro. Onde o tempo dobra.",
      "Mas se você não for… a Orion-7 para de existir em minutos.",
      "Eu vi galáxias nascerem e morrerem. Nunca vi um robozinho como você.",
      "Vá. E volte."
    ]
  }
];
TRANSLATIONS.pt.storyBtn = "Entendido. Vou lá.";
TRANSLATIONS.pt.storyNarrator = "Zyron";

TRANSLATIONS.en.story = [
  {
    falas: [
      "Little Spark. You were not built for this.",
      "But the universe did not ask for permission.",
      "Station Orion-7 is dying. Its plasma stars drift through the wreckage.",
      "Without them… eternal silence.",
      "You are the only one still running. The only one who can act.",
      "Fly, Spark. The universe is watching."
    ]
  },
  {
    falas: [
      "You came back. I knew you would.",
      "But the remaining stars are deeper — inside the Grey Nebula, where light disappears.",
      "And Spark… something moves in there. Something that does not want you to reach them.",
      "Keep going. Fear is just energy that hasn't found its direction yet."
    ]
  },
  {
    falas: [
      "This is the edge, Spark. Beyond this point, even I cannot guarantee anything.",
      "The last stars are out there — on the rim of the black hole. Where time bends.",
      "But if you don't go… Orion-7 ceases to exist in minutes.",
      "I have watched galaxies born and die. I have never seen a little robot like you.",
      "Go. And come back."
    ]
  }
];
TRANSLATIONS.en.storyBtn = "Understood. Let's go.";
TRANSLATIONS.en.storyNarrator = "Zyron";
