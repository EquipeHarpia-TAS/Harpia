<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Spark! - Robozinho no Espaço</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>

  <!-- ═══════════════ SPLASH ═══════════════ -->
  <div id="splash" class="space-bg">
    <div class="stars-bg" id="stars-splash"></div>
    <div class="splash-content">
      <button class="gear-btn" id="btn-settings-splash">⚙</button>
      <!-- Botão de idioma -->
      <button class="lang-btn" id="lang-btn">🌐 EN</button>
      <div class="splash-title">
        <span class="title-emoji">🚀</span>
        <h1>
          <span id="splash-title-1">Robozinho</span><br>
          <span id="splash-title-2">no Espaço!</span>
        </h1>
      </div>
      <div class="name-section">
        <label for="player-name">Qual é o seu nome, astronauta?</label>
        <input type="text" id="player-name" placeholder="Digite seu nome..." maxlength="18" autocomplete="off" />
      </div>
      <div class="char-section">
        <p class="char-label">Escolha seu robô:</p>
        <div class="char-grid">
          <button class="char-btn selected" data-char="🤖">🤖</button>
          <button class="char-btn" data-char="👾">👾</button>
          <button class="char-btn" data-char="🛸">🛸</button>
          <button class="char-btn" data-char="🦾">🦾</button>
        </div>
      </div>
      <button class="btn-primary" id="btn-start">▶ Iniciar Missão!</button>
      <button class="btn-secondary hidden" id="btn-continue">▶ Continuar Missão</button>
      <p class="splash-hint">Prepare-se para programar sua nave! 🌟</p>
    </div>
    <div class="planet planet-1">🪐</div>
    <div class="planet planet-2">🌕</div>
    <div class="planet planet-3">🌍</div>
  </div>

  <!-- ═══════════════ TUTORIAL ═══════════════ -->
  <div id="tutorial" class="space-bg hidden">
    <div class="stars-bg" id="stars-tutorial"></div>
    <div class="tut-box">
      <div class="tut-progress">
        <div class="tut-dot" id="dot-0"></div>
        <div class="tut-dot" id="dot-1"></div>
        <div class="tut-dot" id="dot-2"></div>
      </div>
      <span class="tut-emoji" id="tut-emoji"></span>
      <div class="tut-title"  id="tut-title"></div>
      <div class="tut-text"   id="tut-text"></div>
      <div class="tut-demo hidden" id="tut-demo">
        <div class="tut-demo-blocks">
          <div class="tut-demo-block" draggable="true" id="demo-block">➡️ Direita</div>
        </div>
        <div class="tut-demo-drop" id="demo-drop">
          <span class="tut-demo-hint">Arraste aqui!</span>
        </div>
      </div>
      <div class="tut-btns">
        <button class="btn-ghost" id="btn-tut-back">← Voltar</button>
        <button class="btn-ghost" id="btn-tut-skip">Pular tutorial</button>
        <button class="btn-primary" id="btn-tut-next">Próximo ➜</button>
      </div>
    </div>
    <div class="planet planet-1">🪐</div>
    <div class="planet planet-2">🌕</div>
  </div>

  <!-- ═══════════════ SELEÇÃO DE FASES ═══════════════ -->
  <div id="phase-select" class="space-bg hidden">
    <div class="stars-bg" id="stars-phases"></div>

    <div class="star-wrap">
      <button class="gear-btn" id="btn-settings-phases">⚙</button>

      <div class="star-title" id="phase-screen-title-text">Escolha a Fase</div>
      <div class="star-sub">— selecione sua missão —</div>

      <div class="star-container" id="star-container">
        <div class="sc" id="sc">
          <svg viewBox="0 0 380 380" xmlns="http://www.w3.org/2000/svg" id="starSvg"></svg>
          <div id="nodes"></div>
          <div class="cn lk" id="cn">
            <span class="cn-em">🔒</span>
            <span class="cn-lb">F6</span>
          </div>
        </div>
      </div>

      <div class="star-bottom-btns">
        <button class="btn-credits-phase bloqueada" id="btn-phase-credits" disabled>🔒 Ver Créditos</button>
        <button class="btn-ghost" id="btn-phase-home">← Início</button>
      </div>
    </div>

    <div class="planet planet-1">🪐</div>
    <div class="planet planet-2">🌕</div>
  </div>

  <!-- ═══════════════ JOGO ═══════════════ -->
  <div id="app" class="hidden">
    <canvas id="world"></canvas>
    <div class="game-header">
      <button class="btn-ghost small" id="btn-back-to-phases">← Fases</button>
      <h1 id="game-title">🤖 Robozinho</h1>
      <button class="gear-btn light" id="btn-settings-game">⚙</button>
    </div>
    <div class="game-area">
      <div class="panel-blocos">
        <div class="panel-title">Blocos</div>
        <button class="block right"   draggable="true" data-cmd="right">➡️ Direita</button>
        <button class="block left"    draggable="true" data-cmd="left">⬅️ Esquerda</button>
        <button class="block up"      draggable="true" data-cmd="up">⬆️ Cima</button>
        <button class="block down"    draggable="true" data-cmd="down">⬇️ Baixo</button>
        <button class="block collect" draggable="true" data-cmd="collect">⭐ Coletar</button>
      </div>
    </div>
    <div class="panel-programa">
      <div id="drop-zone">
        <div class="empty-hint" id="hint">Arraste os blocos aqui!</div>
      </div>
      <button class="btn-run"   id="run-btn">▶ Executar!</button>
      <button class="btn-clear" id="clear-btn">Limpar</button>
      <div id="msg"></div>
    </div>
    <div class="hud-score">
      <div class="score-num" id="score-num">0</div>
      <div class="score-label">estrelas ⭐</div>
      <div class="hud-star-counter" id="hud-star-counter">0 / 0 ⭐</div>
      <div class="phase-indicator" id="phase-indicator"></div>
    </div>
  </div>

  <!-- ═══════════════ MODAL CONFIGURAÇÕES ═══════════════ -->
  <div id="settings-modal" class="modal-overlay hidden">
    <div class="modal-box">
      <div class="modal-title">⚙️ Configurações</div>
      <div class="setting-row">
        <span class="setting-label">Volume</span>
        <input type="range" id="vol-slider" min="0" max="1" step="0.05" value="0.7" />
        <span class="vol-val" id="vol-val">70%</span>
      </div>
      <button class="btn-ghost" id="btn-settings-credits" style="width:100%;margin-bottom:10px;">🏆 Ver Créditos</button>
      <button class="btn-primary" id="btn-settings-close">Fechar</button>
    </div>
  </div>

  <!-- ═══════════════ MODAL VITÓRIA ═══════════════ -->
  <div id="victory-modal" class="modal-overlay hidden">
    <div class="modal-box victory-box">
      <span class="victory-emoji">🏆</span>
      <div class="modal-title">Fase Concluída!</div>
      <div class="victory-sub">Você coletou todas as estrelas!</div>
      <div class="victory-stars">⭐ ⭐ ⭐</div>
      <button class="btn-primary" id="btn-next-phase">Próxima Fase ➜</button>
      <button class="btn-ghost"   id="btn-see-phases">Ver Fases</button>
    </div>
  </div>

  <!-- ═══════════════ MODAL CONFIRMAR SAÍDA ═══════════════ -->
  <div id="confirm-modal" class="modal-overlay hidden">
    <div class="modal-box">
      <div class="modal-title">⚠️ Voltar ao Início?</div>
      <div class="confirm-text">Seu progresso na fase atual será perdido.</div>
      <div class="confirm-btns">
        <button class="btn-ghost" id="btn-confirm-cancel">Cancelar</button>
        <button class="btn-primary" id="btn-confirm-ok">Sim, voltar</button>
      </div>
    </div>
  </div>

  <!-- ═══════════════ MODAL NARRATIVA ZYRON ═══════════════ -->
  <div id="story-modal" class="story-overlay hidden">
    <!-- Fundo estelar do overlay -->
    <div class="story-bg-stars" id="story-bg-stars"></div>
    <div class="story-bg-planet story-bg-planet-1">🪐</div>
    <div class="story-bg-planet story-bg-planet-2">🌙</div>
    <div class="story-bg-planet story-bg-planet-3">⭐</div>
    <div class="story-box">
      <div class="story-stars" id="story-stars"></div>
      <div class="story-narrator">
        <span class="story-avatar">👽</span>
        <span class="story-name" id="story-name">Zyron</span>
      </div>
      <div class="story-text-wrap">
        <p class="story-text" id="story-text"></p>
        <span class="story-cursor">▋</span>
      </div>
      <div class="story-progress" id="story-progress"></div>
      <button class="btn-story-next" id="btn-story-next">▶</button>
      <button class="btn-story-skip" id="btn-story-skip">Pular</button>
    </div>
  </div>

  <!-- ═══════════════ TELA DE CRÉDITOS ═══════════════ -->
  <div id="credits-screen" class="space-bg hidden">
    <div class="stars-bg" id="stars-credits"></div>
    <div class="credits-box">
      <div class="credits-rocket" id="credits-rocket">🚀</div>
      <h2 class="credits-main-title">✦ Créditos ✦</h2>

      <div class="credits-group" id="cg-0">
        <div class="credits-role">Grupo</div>
        <div class="credits-name big">Spark 🚀</div>
      </div>

      <div class="credits-divider" id="cd-0"></div>

      <div class="credits-group" id="cg-1">
        <div class="credits-role">Desenvolvedor</div>
        <div class="credits-name">Guilherme Martins de Almeida</div>
      </div>

      <div class="credits-group" id="cg-2">
        <div class="credits-role">Desenvolvedor</div>
        <div class="credits-name">Fabricio de Sá Caldas</div>
      </div>

      <div class="credits-divider" id="cd-1"></div>

      <div class="credits-group" id="cg-3">
        <div class="credits-role">Product Owner</div>
        <div class="credits-name">Guilherme Da Cruz Andrade</div>
      </div>

      <div class="credits-group" id="cg-4">
        <div class="credits-role">Scrum Master</div>
        <div class="credits-name">Nathan Fernandes</div>
      </div>

      <div class="credits-group" id="cg-5">
        <div class="credits-role">Quality Assurance</div>
        <div class="credits-name">Rian Santo Das Virgens</div>
      </div>

      <div class="credits-divider" id="cd-2"></div>

      <div class="credits-group" id="cg-6">
        <div class="credits-role">Professor</div>
        <div class="credits-name big gold">João Roberto Ursino Da Cruz</div>
      </div>

      <div class="credits-divider" id="cd-3"></div>

      <div class="credits-group" id="cg-7">
        <div class="credits-thanks">Obrigado por jogar! ⭐</div>
        <div class="credits-year">2026</div>
      </div>

      <button class="btn-ghost credits-btn-home" id="btn-credits-home">← Início</button>
    </div>
    <div class="planet planet-1">🪐</div>
    <div class="planet planet-2">🌕</div>
    <div class="planet planet-3">🌍</div>
  </div>


  <!-- Tooltip estrela -->
  <div class="star-tip" id="star-tip">
    <div class="st-name" id="st-name"></div>
    <div class="st-dif"  id="st-dif"></div>
    <div class="st-status" id="st-status"></div>
    <div class="st-action" id="st-action"></div>
  </div>

  <script src="mundo/renderer.js"></script>
  <script src="mundo/animator.js"></script>
  <script src="i18n.js"></script>
  <script src="game.js"></script>

</body>
</html>
