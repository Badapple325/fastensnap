/**
 * Upload helper for FastenSnap
 * - uploadImage(uri, webhookUrl?) will POST the image as form-data to webhookUrl
 * - If webhookUrl is not provided or network fails, returns a mocked recognition result
 */

export type RecognitionLabel = {
  label: string;
  confidence: number; // 0..1
  details?: Record<string, any>;
};

export type RecognitionResult = {
  labels: RecognitionLabel[];
  raw?: any;
};

import { WEBHOOK_URL } from '@/config/webhook';

async function uriToBlob(uri: string): Promise<Blob | null> {
  try {
    const resp = await fetch(uri);
    const blob = await resp.blob();
    return blob;
  } catch (e) {
    return null;
  }
}

export async function uploadImage(
  uri: string,
  webhookUrl?: string
): Promise<RecognitionResult> {
  // Determine webhook to call: explicit param wins, otherwise use config placeholder
  const url = webhookUrl ?? WEBHOOK_URL ?? '';
  if (!url) {
    // No webhook configured — return mock so app works offline
    return mockResult(uri);
  }

  const blob = await uriToBlob(uri);
  if (!blob) return mockResult(uri);

  const fd = new FormData();
  // @ts-ignore - React Native's FormData accepts a { uri, name, type } object
  fd.append('file', { uri, name: 'photo.jpg', type: blob.type || 'image/jpeg' });

  try {
    const res = await fetch(url, {
      method: 'POST',
      body: fd as any,
      // Do not set Content-Type; let fetch set the multipart boundary.
    });

    if (!res.ok) {
      return mockResult(uri);
    }

    const data = await res.json();
    // Expect n8n or ML webhook to return structured JSON like { labels: [{label, confidence, details}], raw }
    // Try multiple common response shapes and normalize to RecognitionResult
    const labels: RecognitionLabel[] = [];

    // 1) data.labels (our preferred shape)
    if (data && Array.isArray(data.labels) && data.labels.length) {
      for (const l of data.labels) {
        labels.push({ label: l.label || String(l), confidence: l.confidence ?? 0, details: l.details ?? l });
      }
      return { labels, raw: data };
    }

    // 2) data.predictions or data.outputs (Replicate / Roboflow common shapes)
    const preds = data && (data.predictions || data.outputs || data.output || data.result || data[0]);
    if (preds) {
      const arr = Array.isArray(preds) ? preds : [preds];
      for (const p of arr) {
        // p might be { class, label, confidence } or a string
        if (typeof p === 'string') {
          labels.push({ label: p, confidence: 1 });
        } else {
          const label = p.class || p.label || p.name || (p.metadata && p.metadata.label) || JSON.stringify(p);
          const confidence = p.confidence ?? p.score ?? p.probability ?? 0;
          labels.push({ label: label, confidence: typeof confidence === 'number' ? confidence : 0, details: p });
        }
      }
      if (labels.length) return { labels, raw: data };
    }

    // 3) Some providers return an array at top level
    if (Array.isArray(data)) {
      for (const p of data) {
        if (typeof p === 'string') labels.push({ label: p, confidence: 1 });
        else labels.push({ label: p.label || JSON.stringify(p), confidence: p.confidence ?? 0, details: p });
      }
      if (labels.length) return { labels, raw: data };
    }

    // 4) If the response contains nested prediction objects under data["0"] or similar
    if (data && typeof data === 'object') {
      // attempt generic extraction heuristics
      const possible = Object.values(data).flatMap((v: any) => (Array.isArray(v) ? v : []));
      for (const item of possible) {
        if (item && (item.label || item.class || item.name)) {
          labels.push({ label: item.label || item.class || item.name || JSON.stringify(item), confidence: item.confidence ?? 0, details: item });
        }
      }
      if (labels.length) return { labels, raw: data };
    }

    // Fallback to mock if nothing matched
    return mockResult(uri);
  } catch (e) {
    return mockResult(uri);
  }
}

function mockResult(uri: string): RecognitionResult {
  // Simple heuristic mock: random confidence and a plausible label list for fasteners
  const samples = [
    { label: 'Phillips Pan Head Screw', confidence: 0.92 },
    { label: 'Hex Head Bolt, M8 x 1.25', confidence: 0.86 },
    { label: 'Flat Washer, 5/16"', confidence: 0.78 },
    { label: 'Nail, 2" Common', confidence: 0.64 },
  ];

  // Pick 1-2 labels
  const labels = [samples[Math.floor(Math.random() * samples.length)]];
  if (Math.random() > 0.7) labels.push(samples[Math.floor(Math.random() * samples.length)]);

  return { labels, raw: { mocked: true, uri } };
}

export default {
  uploadImage,
};
