# 🚀 Spark! — Robozinho no Espaço

## Como rodar localmente

### 1. Instalar dependências
```bash
npm install
```

### 2. Iniciar o servidor
```bash
npm start
```

### 3. Abrir no navegador
```
http://localhost:3000
```

---

## Estrutura do projeto

```
spark/
├── server.js        ← Servidor Express (rotas /api/fases e /api/executar)
├── fases.js         ← Dados das fases (Node.js)
├── gameLogic.js     ← Lógica de execução dos comandos (Node.js)
├── package.json
└── public/          ← Arquivos do frontend (servidos pelo Express)
    ├── index.html
    ├── style.css
    ├── i18n.js
    ├── game.js
    └── mundo/
        ├── renderer.js
        └── animator.js
```

## APIs disponíveis

| Rota | Método | Descrição |
|------|--------|-----------|
| `/api/fases` | GET | Retorna todas as fases |
| `/api/executar` | POST | Executa os comandos do robô |
