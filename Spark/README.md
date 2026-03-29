🤖 Spark Aprende

Jogo educativo de programação em blocos para crianças com TEA (Transtorno do Espectro Autista), entre 6 e 8 anos.

🎮 Sobre o Projeto
O Spark Aprende é um jogo interativo onde a criança ensina um robô chamado Spark a se mover por um mundo em grid, montando sequências de comandos visuais (blocos com ícones). O jogo ensina conceitos de lógica de programação como sequência, loops e depuração — sem que a criança precise ler nada.
Desenvolvido como projeto universitário para a disciplina de Tópicos Avançados em Sistemas de Informação I, utilizando metodologia Scrum e práticas de TDD.

🧩 Mecânica do Jogo

A criança visualiza o grid e o objetivo da fase (uma ⭐)
Clica em blocos de ícones para montar uma sequência de comandos
Clica em ▶️ para executar — o Spark segue os comandos animados
Feedback visual e sonoro suave para acertos e erros
Sem texto, sem login, sem tempo limite

Blocos disponíveis
ÍconeComandoEnsina➡️Mover para frenteSequência↩️Virar esquerdaDireção↪️Virar direitaDireção⬆️PularCondicionais🔁RepetirLoops

♿ Acessibilidade TEA
O jogo foi projetado seguindo diretrizes de acessibilidade para crianças com autismo:

✅ Sem texto — toda comunicação é feita por ícones e animações
✅ Sem tempo limite — a criança joga no seu próprio ritmo
✅ Sem flash — animações suaves e não estroboscópicas
✅ Cores suaves — paleta de azul claro e verde menta
✅ Botões grandes — mínimo 60x60px
✅ Feedback calmo — sem buzzers ou mensagens agressivas
✅ Layout previsível — mesmo padrão em todas as fases
✅ Sem login — abre e já joga

👥 Equipe

Prince (Nathan) — @PrinceOsm — Scrum Master + Tech Lead
Fabricio — @And0rade — Dev Backend
Kayky — Dev Frontend
Rian — @Rianvirgens — Dev Backend
Martins — @Guilhermemartins443 — QA / Testes
Miles-Guilherme — Product Owner (PO)




📋 Metodologia
O projeto segue a metodologia Scrum com:

🏃 6 Sprints de 2 semanas cada
📝 Product Backlog com 9 User Stories
🃏 Planning Poker para estimativas (sequência de Fibonacci)
📅 Daily Stand-up 3x por semana (WhatsApp)
🔍 TDD — a ser implementado conforme aulas


📚 User Stories
IDHistóriaPrioridadeUS01Iniciar o jogo sem loginAltaUS02Ver o objetivo da fase visualmenteAltaUS03Montar sequência de blocosAltaUS04Executar a sequênciaAltaUS05Receber feedback de sucessoAltaUS06Receber feedback de erro sem puniçãoAltaUS07Controlar o volumeMédiaUS08Repetir uma faseAltaUS09Avançar entre fases progressivasAlta

🌿 Branches
main        → versão estável para entrega
dev         → integração contínua do time
feature/*   → branches individuais por funcionalidade



🚀 Como Rodar o Projeto
Pré-requisitos

Node.js instalado (versão 14 ou superior)
Nenhuma dependência externa — usa apenas módulos nativos do Node.js

Passo a passo
bash# 1. Clone o repositório
git clone https://github.com/PrinceOsm/-TEA-game-for-childres-.git

# 2. Entre na pasta do projeto
cd -TEA-game-for-childres-

# 3. Inicie o servidor
node server.js

# 4. Abra no navegador
# http://localhost:3000
Estrutura de pastas
spark-aprende/
├── server.js        # Servidor Node.js (módulos nativos)
├── public/
│   └── index.html   # Jogo completo (HTML + CSS + JS)
└── README.md

📄 Licença
Projeto desenvolvido para fins acadêmicos — Universidade, disciplina de Tópicos Avançados em Sistemas de Informação I.

<p align="center">Feito com 💙 pelo time Spark Aprende</p>
