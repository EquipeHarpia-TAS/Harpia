/* =============================================
   DESENHA MUNDO — Supabase Config
   Arquivo: supabase-config.js

   Substitua os valores abaixo com as suas
   credenciais (veja README-SUPABASE.md).
============================================= */

const SUPABASE_URL   = 'https://jyubnlfptuxxhojblpdh.supabase.co';
const SUPABASE_ANON  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5dWJubGZwdHV4eGhvamJscGRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMDYxOTcsImV4cCI6MjA5NDg4MjE5N30.AuaNeAdNlkPorzdD2wILYelq0QOIckZaBtO6gsbo6AY';
const STORAGE_BUCKET = 'desenhos';

/* ── Cliente ── */
const _supa = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

/* ── Sessão anônima persistente ──────────────────────────────────────
   Gera um UUID na primeira visita e reutiliza nas seguintes.
   Identifica a criança sem exigir login.
──────────────────────────────────────────────────────────────────── */
function obterSessaoId() {
  const CHAVE = 'dm_sessao_id';
  let id = localStorage.getItem(CHAVE);
  if (!id) {
    id = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : 'sess-' + Date.now() + '-' + Math.random().toString(36).slice(2);
    localStorage.setItem(CHAVE, id);
  }
  return id;
}

/* ── Salvar desenho ──────────────────────────────────────────────────
   1. Faz upload do PNG no Storage  →  obtém URL pública
   2. Insere linha na tabela desenhos  (tracos JSON + imagem_url)
   3. Retorna { ok: true, id } ou { ok: false, erro }
──────────────────────────────────────────────────────────────────── */
async function salvarDesenhoSupabase(dadosPersonagem) {
  const sessaoId = obterSessaoId();

  /* Converte imagemBase64 → Blob PNG */
  const base64  = dadosPersonagem.imagemBase64;
  const byteStr = atob(base64.split(',')[1]);
  const ab  = new ArrayBuffer(byteStr.length);
  const ia  = new Uint8Array(ab);
  for (let i = 0; i < byteStr.length; i++) ia[i] = byteStr.charCodeAt(i);
  const pngBlob = new Blob([ab], { type: 'image/png' });

  /* Upload do PNG no Storage */
  const nomeArquivo = `${sessaoId}/${dadosPersonagem.timestamp.replace(/[:.]/g, '-')}.png`;

  const { error: uploadError } = await _supa.storage
    .from(STORAGE_BUCKET)
    .upload(nomeArquivo, pngBlob, { contentType: 'image/png', upsert: true });

  if (uploadError) {
    console.error('[Supabase] Erro no upload:', uploadError.message);
    return { ok: false, erro: uploadError.message };
  }

  /* URL pública do PNG */
  const { data: urlData } = _supa.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(nomeArquivo);

  const imagemUrl = urlData?.publicUrl ?? null;

  /* Insere na tabela */
  const { data, error: insertError } = await _supa
    .from('desenhos')
    .insert({
      sessao_id:  sessaoId,
      imagem_url: imagemUrl,
      tracos: {
        versao:    dadosPersonagem.versao,
        timestamp: dadosPersonagem.timestamp,
        canvas:    dadosPersonagem.canvas,
        tracos:    dadosPersonagem.tracos,
      },
    })
    .select('id')
    .single();

  if (insertError) {
    console.error('[Supabase] Erro ao inserir:', insertError.message);
    return { ok: false, erro: insertError.message };
  }

  return { ok: true, id: data.id, imagemUrl };
}
