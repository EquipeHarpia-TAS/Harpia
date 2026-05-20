# Configuração do Supabase — Desenha Mundo

## 1. Criar o projeto
Acesse https://supabase.com → **New project**.

## 2. Rodar o SQL (SQL Editor no painel)

```sql
create table public.desenhos (
  id          uuid default gen_random_uuid() primary key,
  criado_em   timestamptz default now(),
  sessao_id   text not null,
  tracos      jsonb not null,
  imagem_url  text
);

alter table public.desenhos enable row level security;

create policy "Inserção pública"
  on public.desenhos for insert
  to anon
  with check (true);
```

## 3. Criar o bucket de imagens
**Storage → New bucket**
- Nome: `desenhos`
- Public: ✅ ativado

## 4. Colar as credenciais
Abra `public/assets/js/supabase-config.js` e substitua:

```js
const SUPABASE_URL  = 'COLE_SUA_URL_AQUI';
const SUPABASE_ANON = 'COLE_SUA_ANON_KEY_AQUI';
```

As credenciais ficam em **Project Settings → API**:
- **Project URL** → `SUPABASE_URL`
- **anon / public key** → `SUPABASE_ANON`

## 5. Testar
1. `npm install && npm start`
2. Abra `http://localhost:3000`
3. Desenhe um herói → clique em **"Meu herói está pronto!"**
4. No painel Supabase:
   - **Table Editor → desenhos** → nova linha com traços JSON
   - **Storage → desenhos** → PNG do desenho

## Como funciona
- O desenho é salvo no `localStorage` primeiro (jogo funciona offline)
- Em seguida é enviado ao Supabase em background
- Se falhar (sem internet ou credenciais não configuradas), o jogo continua normalmente
