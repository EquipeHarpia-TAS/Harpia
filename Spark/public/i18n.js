/* ════════════════════════════════════════════════════════════
   SPARK — Internacionalização (PT / EN)
════════════════════════════════════════════════════════════ */

const TRANSLATIONS = {
  pt: {
    /* ── Splash ── */
    splashTitle1: 'SPARK!',
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
    phaseEndingNome: 'Epílogo',
    phaseEndingDesc: 'História & Créditos',

    /* ── Jogo ── */
    blocksTitle: 'Blocos',
    blockLabels: {
      right:   'Direita',
      left:    'Esquerda',
      up:      'Cima',
      down:    'Baixo',
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
      { nome: 'Buraco Negro' },
      { nome: 'Corredor de Asteroides' },
      { nome: 'Labirinto Estelar' },
      { nome: 'Fim do Universo' }
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
    phaseEndingNome: 'See Credits',
    phaseEndingDesc: 'Story & Credits',

    /* ── Game ── */
    blocksTitle: 'Blocks',
    blockLabels: {
      right:   'Right',
      left:    'Left',
      up:      'Up',
      down:    'Down',
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
      { nome: 'Black Hole' },
      { nome: 'Asteroid Corridor' },
      { nome: 'Star Labyrinth' },
      { nome: 'End of the Universe' }
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
      "Spark, acorda! A Estação Orion-7 está em perigo. Os reatores pararam e as estrelas de plasma — que mantêm tudo funcionando — estão flutuando pelos destroços lá fora.",
      "Tem muita gente aqui dentro contando com essas estrelas. E você é o único que consegue chegar até elas. Eu sei que você nunca voou antes. Isso me deixa um pouquinho nervoso, não vou mentir.",
      "Mas também sei que você foi feito para isso. Cada parte sua, cada circuito. Eu vou estar aqui te guiando — e vou torcer muito por você.",
      "Vai lá, Spark! Pelo menos é o que estou tentando me convencer a dizer sem tremer."
    ]
  },
  {
    falas: [
      "Você voltou! Eu fiquei de olho em cada movimento seu lá dentro e… uau. Nunca vi nada igual. Para um robô que nunca tinha voado, você foi incrível.",
      "Mas ainda tem estrelas para pegar. Elas caíram dentro da Nebulosa Cinzenta — uma névoa que bagunça todos os meus scanners. Lá dentro, só você e seus próprios sentidos.",
      "Tem algo se mexendo na névoa. Não sei o que é ainda. Mas desta vez… desta vez eu já sei que você vai dar um jeito. Não sei explicar direito — só sei.",
      "Vai, Spark! Me mostre que eu não estava errado em acreditar em você."
    ]
  },
  {
    falas: [
      "Spark, preciso ser honesto: esse é o lugar mais perigoso que já vi em toda a minha vida. A gravidade aqui é tão forte que até minha voz vai sumir quando você chegar perto do centro.",
      "As últimas estrelas estão do outro lado. Os reatores têm energia para pouco tempo. Cada passo aqui precisa ser pensado com muito cuidado — não tem como voltar atrás se errar.",
      "Antes, eu ficava nervoso porque você era novo. Agora fico nervoso porque me preocupo com você. Isso é diferente, sabe? Isso mudou.",
      "Pense antes de se mover, tá? Você vai voltar — disso eu já tenho certeza."
    ]
  },
  {
    falas: [
      "Você saiu do buraco negro. Nenhum robô desta estação tinha conseguido isso antes. Eu precisei parar um segundo só para processar o que acabei de ver.",
      "Ainda tem estrelas para recuperar — do outro lado de um corredor cheio de asteroides girando. As pedras se movem em ritmo certo. Se você observar antes de agir, vai achar a hora certa de passar.",
      "Sabe a diferença entre você e uma sonda normal? A sonda só segue ordens. Você pensa. Você sente o espaço ao redor de um jeito que eu não consigo nem explicar direito.",
      "Leia o campo, Spark. Você já sabe o que fazer — só ainda não percebeu isso!"
    ]
  },
  {
    falas: [
      "O que está à sua frente é o Labirinto Estelar — uma estrutura tão antiga que nenhum mapa funciona direito aqui. Toda vez que alguém entra, ele muda de forma.",
      "As últimas estrelas estão lá dentro. E desta vez, Spark, eu não vou conseguir te ajudar direito — meus dados não valem nada aqui. Você vai ter que confiar em você mesmo.",
      "Mas sabe o que aprendi nas últimas fases? Que você não precisava tanto de mim quanto eu pensava. Cada vez que fiquei com medo, você achou o caminho. Cada vez que duvidei, você me provou o contrário.",
      "Se sentir perdido, para e respira. O caminho sempre existe — e você é maior do que qualquer labirinto."
    ]
  },
  {
    falas: [
      "Chegamos ao fim do universo mapeado. Daqui pra frente, não existe nada nos nossos registros. E foi bem aqui que as últimas estrelas caíram — como se o espaço tivesse guardado o mais difícil pro mais corajoso.",
      "Quando você pegar a última estrela, os reatores voltam. A estação acende. Todo mundo que ficou esperando vai poder sorrir de novo.",
      "Lembra quando eu falei que estava tentando me convencer de que acreditava em você? Foi mentira. Eu sempre soube. Só estava com medo, e o medo faz a gente esconder o que sente.",
      "Vai, Spark. Você não está salvando só uma estação — está salvando tudo que existe dentro dela. E eu nunca vou esquecer isso."
    ]
  }
];
TRANSLATIONS.pt.storyBtn = "Entendido. Vou lá.";
TRANSLATIONS.pt.storyNarrator = "Zyron";

TRANSLATIONS.en.story = [
  {
    falas: [
      "Spark, wake up! Station Orion-7 is in danger. The reactors stopped and the plasma stars — which keep everything running — are floating through the wreckage outside.",
      "There are a lot of people in here counting on those stars. And you're the only one who can reach them. I know you've never flown before. That makes me a little nervous, not gonna lie.",
      "But I also know you were made for this. Every part of you, every circuit. I'll be right here guiding you — and cheering really hard for you.",
      "Go get 'em, Spark! At least that's what I'm trying to say without shaking."
    ]
  },
  {
    falas: [
      "You came back! I was watching your every move in there and… wow. Never seen anything like it. For a robot that had never flown before, you were incredible.",
      "But there are still stars to collect. They fell inside the Grey Nebula — a mist that messes up all my scanners. In there, it's just you and your own senses.",
      "Something is moving in the nebula. I don't know what yet. But this time… this time I already know you'll figure it out. I can't really explain why. I just know.",
      "Go, Spark! Show me I wasn't wrong to believe in you."
    ]
  },
  {
    falas: [
      "Spark, I have to be honest: this is the most dangerous place I've ever seen in my whole life. The gravity here is so strong that even my voice will disappear when you get close to the center.",
      "The last stars are on the other side. The reactors don't have much power left. Every step here needs to be thought through carefully — there's no going back if something goes wrong.",
      "Before, I was nervous because you were new. Now I'm nervous because I worry about you. That's different, you know? That changed.",
      "Think before you move, okay? You're coming back — I'm sure of that now."
    ]
  },
  {
    falas: [
      "You came out of the black hole. No robot on this station had ever done that before. I had to stop for a second just to process what I just saw.",
      "There are still stars to recover — on the other side of a corridor full of spinning asteroids. The rocks move in a rhythm. If you watch before you act, you'll find the right moment to pass through.",
      "You know what's different between you and a regular probe? The probe just follows orders. You think. You feel the space around you in a way I can't even explain properly.",
      "Read the field, Spark. You already know what to do — you just haven't realized it yet!"
    ]
  },
  {
    falas: [
      "What's ahead is the Star Labyrinth — a structure so old that no map works properly here. Every time someone goes in, it changes shape.",
      "The last stars are in there. And this time, Spark, I won't be able to help much — my data is useless here. You're going to have to trust yourself.",
      "But you know what I learned over the last few phases? That you didn't need me as much as I thought. Every time I got scared, you found the way. Every time I doubted, you proved me wrong.",
      "If you feel lost, stop and breathe. The path is always there — and you're bigger than any labyrinth."
    ]
  },
  {
    falas: [
      "We've reached the edge of the mapped universe. From here on, there's nothing in our records. And it was right here that the last stars fell — like space saved the hardest part for the bravest one.",
      "When you grab the last star, the reactors come back. The station lights up. Everyone who's been waiting will get to smile again.",
      "Remember when I said I was trying to convince myself I believed in you? That was a fib. I always knew. I was just scared — and being scared makes us hide what we really feel.",
      "Go, Spark. You're not just saving a station — you're saving everything inside it. And I'll never forget that."
    ]
  }
];
TRANSLATIONS.en.storyBtn = "Understood. Let's go.";
TRANSLATIONS.en.storyNarrator = "Zyron";

/* ── História de Conclusão ───────────────────────────────── */
TRANSLATIONS.pt.storyConclusao = {
  falas: [
    "Spark! Os reatores voltaram! As luzes estão acendendo em toda a estação e eu estou aqui do meu lado tremendo de felicidade olhando pra todos os monitores!",
    "Todo mundo aqui dentro vai poder dormir esta noite. Vai poder acordar amanhã, tomar o café da manhã, ligar pra quem ama. Tudo isso por causa de você — de cada passo que você deu lá fora.",
    "Na fase 1, eu disse que estava tentando me convencer de que acreditava em você. Eu menti. Sempre soube quem você era. Só precisava que você descobrisse também.",
    "Você não salvou só uma estação, Spark. Salvou sonhos. Salvou histórias. Salvou um monte de gente que nunca vai saber o seu nome, mas que vai continuar vivendo por causa de você.",
    "Até a próxima missão, herói. Dessa vez não vou fingir que tenho dúvidas. Eu sei exatamente quem você é — e o universo inteiro também sabe."
  ]
};
TRANSLATIONS.pt.storyConclusaoSkip = "Ir para créditos";
TRANSLATIONS.pt.storyConclusaoBtn = "Ver os Créditos ✨";

TRANSLATIONS.en.storyConclusao = {
  falas: [
    "Spark! The reactors are back! Lights are turning on all over the station and I'm over here shaking with happiness staring at all the monitors!",
    "Everyone in here gets to sleep tonight. Gets to wake up tomorrow, have breakfast, call the people they love. All of that — because of you. Because of every single step you took out there.",
    "In phase one I said I was trying to convince myself I believed in you. I fibbed. I always knew who you were. I just needed you to find out too.",
    "You didn't just save a station, Spark. You saved dreams. You saved stories. You saved a whole lot of people who'll never know your name — but who get to keep living because of you.",
    "Until the next mission, hero. This time I'm not pretending to have doubts. I know exactly who you are — and the whole universe does too."
  ]
};
TRANSLATIONS.en.storyConclusaoSkip = "Go to credits";
TRANSLATIONS.en.storyConclusaoBtn = "See the Credits ✨";