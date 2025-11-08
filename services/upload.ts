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
    if (data && data.labels) {
      return { labels: data.labels, raw: data };
    }

    // Attempt to map some common shapes (Replicate/Roboflow) to our result
    if (data && data.predictions) {
      const labels = Array.isArray(data.predictions)
        ? data.predictions.map((p: any) => ({ label: p.class || p.label || String(p), confidence: p.confidence ?? 0 }))
        : [];
      return { labels, raw: data };
    }

    // Fallback
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
