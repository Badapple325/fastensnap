const express = require('express');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

const upload = multer({ storage: multer.memoryStorage() });
const app = express();

const PORT = process.env.PORT || 80;
const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
const REPLICATE_MODEL_VERSION = process.env.REPLICATE_MODEL_VERSION || process.env.REPLICATE_MODEL || '';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'uploads';

if (!REPLICATE_TOKEN) {
  console.warn('Warning: REPLICATE_API_TOKEN is not set — replication calls will fail');
}

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
}

function normalizeResponse(json) {
  const labels = [];
  const data = json || {};

  if (Array.isArray(data.labels) && data.labels.length) {
    for (const l of data.labels) labels.push({ label: l.label || String(l), confidence: l.confidence ?? 0, details: l.details ?? l });
    return { labels, raw: data };
  }

  const preds = data.predictions || data.outputs || data.output || data.result || data[0];
  if (preds) {
    const arr = Array.isArray(preds) ? preds : [preds];
    for (const p of arr) {
      if (typeof p === 'string') labels.push({ label: p, confidence: 1 });
      else labels.push({ label: p.class || p.label || p.name || JSON.stringify(p), confidence: p.confidence ?? p.score ?? 0, details: p });
    }
    if (labels.length) return { labels, raw: data };
  }

  if (Array.isArray(data)) {
    for (const p of data) {
      if (typeof p === 'string') labels.push({ label: p, confidence: 1 });
      else labels.push({ label: p.label || JSON.stringify(p), confidence: p.confidence ?? 0, details: p });
    }
    if (labels.length) return { labels, raw: data };
  }

  // generic search
  if (typeof data === 'object') {
    const possible = Object.values(data).flatMap((v) => (Array.isArray(v) ? v : []));
    for (const item of possible) {
      if (item && (item.label || item.class || item.name)) labels.push({ label: item.label || item.class || item.name || JSON.stringify(item), confidence: item.confidence ?? 0, details: item });
    }
    if (labels.length) return { labels, raw: data };
  }

  return { labels: [{ label: 'Unknown fastener', confidence: 0, details: data }], raw: data };
}

app.post('/webhook/fastensnap-upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'no file provided' });

    const { originalname, mimetype, buffer } = req.file;
    const b64 = buffer.toString('base64');

    // Optionally upload to Supabase Storage
    let publicUrl = null;
    let storagePath = null;
    if (supabase) {
      const filename = `${Date.now()}_${originalname}`.replace(/[^a-zA-Z0-9_.-]/g, '_');
      storagePath = filename;
      const { data: up, error: upErr } = await supabase.storage.from(SUPABASE_BUCKET).upload(filename, buffer, { contentType: mimetype });
      if (upErr) {
        console.warn('Supabase upload error', upErr.message || upErr);
      } else {
        const { data: pu } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(filename);
        publicUrl = pu?.publicUrl || null;
      }
    }

    // Call Replicate
    const payload = {
      version: REPLICATE_MODEL_VERSION,
      input: { image: `data:${mimetype};base64,${b64}` },
    };

    const r = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const txt = await r.text();
      return res.status(502).json({ error: 'replicate error', detail: txt });
    }

    const json = await r.json();
    const normalized = normalizeResponse(json);

    // Persist into Supabase table if available
    if (supabase) {
      try {
        await supabase.from('recognitions').insert([{ image_path: storagePath, image_url: publicUrl, labels: normalized.labels, raw: json }]);
      } catch (e) {
        console.warn('supabase insert failed', e && e.message ? e.message : e);
      }
    }

    return res.json(normalized);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error', detail: String(err) });
  }
});

app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log('FastenSnap backend listening on', PORT));
