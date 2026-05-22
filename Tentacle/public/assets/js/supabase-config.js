/* =============================================
   DESENHA MUNDO — Supabase Config
   Arquivo: supabase-config.js
============================================= */

const SUPABASE_URL   = 'https://jyubnlfptuxxhojblpdh.supabase.co';
const SUPABASE_ANON  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5dWJubGZwdHV4eGhvamJscGRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMDYxOTcsImV4cCI6MjA5NDg4MjE5N30.AuaNeAdNlkPorzdD2wILYelq0QOIckZaBtO6gsbo6AY';
const STORAGE_BUCKET = 'desenhos';

const _supa = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

/* ── Sessão anônima persistente ── */
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

/* ── Converte canvas → Blob PNG ── */
function canvasParaBlob(canvasEl) {
  const base64  = canvasEl.toDataURL('image/png');
  const byteStr = atob(base64.split(',')[1]);
  const ab = new ArrayBuffer(byteStr.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteStr.length; i++) ia[i] = byteStr.charCodeAt(i);
  return { blob: new Blob([ab], { type: 'image/png' }), base64 };
}

/* ── Upload genérico ─────────────────────────────────────────────────
   Usado por salvarDesenhoSupabase e salvarDesenhoGameplay.
──────────────────────────────────────────────────────────────────── */
async function _uploadESalvar(pngBlob, base64, tipo, tracos, canvas) {
  const sessaoId    = obterSessaoId();
  const timestamp   = new Date().toISOString();
  const nomeArquivo = `${sessaoId}/${tipo}-${timestamp.replace(/[:.]/g, '-')}.png`;

  const { error: uploadError } = await _supa.storage
    .from(STORAGE_BUCKET)
    .upload(nomeArquivo, pngBlob, { contentType: 'image/png', upsert: true });

  if (uploadError) {
    console.error('[Supabase] Upload erro:', uploadError.message);
    return { ok: false, erro: uploadError.message };
  }

  const { data: urlData } = _supa.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(nomeArquivo);

  const imagemUrl = urlData?.publicUrl ?? null;

  const { error: insertError } = await _supa
    .from('desenhos')
    .insert({
      sessao_id:  sessaoId,
      imagem_url: imagemUrl,
      tipo,
      tracos: {
        versao:    '1.0',
        timestamp,
        canvas,
        tracos,
      },
    });

  if (insertError) {
    console.error('[Supabase] Insert erro:', insertError.message);
    return { ok: false, erro: insertError.message };
  }

  return { ok: true, imagemUrl };
}

/* ── Salvar herói (tela inicial) ── */
async function salvarDesenhoSupabase(dadosPersonagem) {
  const byteStr = atob(dadosPersonagem.imagemBase64.split(',')[1]);
  const ab = new ArrayBuffer(byteStr.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteStr.length; i++) ia[i] = byteStr.charCodeAt(i);
  const pngBlob = new Blob([ab], { type: 'image/png' });

  return _uploadESalvar(
    pngBlob,
    dadosPersonagem.imagemBase64,
    'heroi',
    dadosPersonagem.tracos,
    dadosPersonagem.canvas
  );
}

/* ── Salvar desenho de gameplay ──────────────────────────────────────
   tipo: 'escudo-zona1' | 'escudo-zona2' | 'escudo-zona3'
         'desafio-1' | 'desafio-2' | 'desafio-3' | 'desafio-4'

   canvasEl: elemento <canvas> com o desenho
   tracosArr: array de traços [{cor, espessura, pontos}]
──────────────────────────────────────────────────────────────────── */
async function salvarDesenhoGameplay(canvasEl, tipo, tracosArr) {
  try {
    const { blob, base64 } = canvasParaBlob(canvasEl);
    const canvas = { largura: canvasEl.width, altura: canvasEl.height };
    const result = await _uploadESalvar(blob, base64, tipo, tracosArr, canvas);
    if (result.ok) console.log(`[Supabase] ${tipo} salvo!`);
    else           console.warn(`[Supabase] ${tipo} falhou:`, result.erro);
  } catch(e) {
    console.warn('[Supabase] Erro gameplay:', e.message);
  }
}
