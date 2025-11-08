# FastenSnap n8n workflow

This folder contains a ready-to-import n8n workflow (JSON) and deployment notes to connect FastenSnap to an ML provider (example uses Replicate). Import the workflow into your n8n instance, set credentials, and deploy.

Quick overview
- Webhook node: POST multipart/form-data to `/webhook/fastensnap-upload`
- Function node: encodes uploaded binary into base64
- HTTP Request node: forwards the base64 image to Replicate API (replace with your preferred model/provider)
- Function node: maps the response into `{ labels: [{ label, confidence, details }] }`
- Respond to Webhook: returns JSON to the mobile app

How to import
1. Start your n8n instance (local or hosted). For production, see deployment notes below.
2. In n8n, click Import > Import from file and paste the JSON from the code block below.
3. Edit the HTTP Request node to set your Replicate API token and model version, or replace the HTTP Request node with a call to Roboflow/your custom endpoint.

---

Copy the following JSON and import it into n8n (File > Import):

```json
{
  "name": "FastenSnap - image webhook -> Replicate",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "fastensnap-upload",
        "responseMode": "onReceived",
        "responseData": "={{$json}}",
        "options": {}
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "functionCode": "const newItems = []; for (const item of items) { const newItem = { json: {} }; const binaryKey = item.binary && Object.keys(item.binary || {})[0] ? Object.keys(item.binary || {})[0] : null; const binary = binaryKey ? item.binary[binaryKey] : null; if (binary && binary.data) { const b64 = Buffer.from(binary.data).toString('base64'); newItem.json.base64 = b64; newItem.json.filename = binary.fileName || 'upload.jpg'; } else if (item.json && item.json.body) { newItem.json.base64 = item.json.body; } newItems.push(newItem); } return newItems;"
      },
      "name": "EncodeToBase64",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [500, 300]
    },
    {
      "parameters": {
        "url": "=https://api.replicate.com/v1/predictions",
        "options": {
          "headers": {
            "Authorization": "=Bearer 'REPLACE_WITH_YOUR_TOKEN'",
            "Content-Type": "application/json"
          }
        },
        "bodyParametersJson": "=JSON.stringify({ version: 'REPLACE_WITH_MODEL_VERSION', input: { image: 'data:image/jpeg;base64,' + $json.base64 } })",
        "responseFormat": "json",
        "fullResponse": false
      },
      "name": "Replicate",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [750, 300]
    },
    {
      "parameters": {
        "functionCode": "const out = { labels: [] }; const body = items[0].json || {}; if (body && body.output) { const outData = Array.isArray(body.output) ? body.output : [body.output]; out.labels = outData.map(o => ({ label: o.label || o.class || String(o), confidence: o.confidence || 0, details: o })); } else if (body && body.predictions) { out.labels = body.predictions.map(p => ({ label: p.label || p.class, confidence: p.confidence || 0, details: p })); } else if (body && body[0]) { out.labels = (Array.isArray(body) ? body : [body]).map(p => ({ label: p.label || p.class || String(p), confidence: p.confidence || 0, details: p })); } else { out.labels = [{ label: 'Unknown fastener', confidence: 0, details: body }]; } return [{ json: out }];"
      },
      "name": "FormatResult",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [1000, 300]
    },
    {
      "parameters": {
        "responseCode": 200
      },
      "name": "RespondToWebhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [1250, 300]
    }
  ],
  "connections": {
    "Webhook": { "main": [ [ { "node": "EncodeToBase64", "type": "main", "index": 0 } ] ] },
    "EncodeToBase64": { "main": [ [ { "node": "Replicate", "type": "main", "index": 0 } ] ] },
    "Replicate": { "main": [ [ { "node": "FormatResult", "type": "main", "index": 0 } ] ] },
    "FormatResult": { "main": [ [ { "node": "RespondToWebhook", "type": "main", "index": 0 } ] ] }
  }
}
```

Deployment notes
1. Get a Replicate API token (or Roboflow/other model token). For Replicate, set your token in the HTTP Request node header or configure n8n credentials/secrets.
2. Replace `REPLACE_WITH_MODEL_VERSION` with the model version you want to use (from Replicate). Example: `a1b2c3d4e5f6...`.
3. Host n8n: Render, Railway, or use n8n.cloud. For Render/Railway set up a new service using the official n8n Docker image or quickstart. Make sure webhooks are reachable from the public internet.
4. After deployment, copy the public webhook URL that n8n exposes (it will be like `https://<your-host>/webhook/fastensnap-upload`) and paste it into your mobile app config (see `config/webhook.ts`).
5. Optional: add a retry/timeout node in front of the Replicate call to handle slow ML responses; add caching for repeated uploads.

Security & secrets
- Do not commit your Replicate API token. Use n8n's credential management or environment variables in your host.
- If hosting on Render/Railway, set the `REPLICATE_API_TOKEN` as a secret/env var, and reference it in the HTTP Request node.

Testing the full loop
1. Start your Expo app (or run on device) and set the webhook URL in `config/webhook.ts`.
2. From the Capture or Upload tab, pick/take a photo, then press Upload. The app will POST the image to your n8n webhook, which will call the ML model and return structured labels.
