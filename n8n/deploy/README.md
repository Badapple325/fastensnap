# Deploying n8n for FastenSnap (Railway)

This folder contains a minimal Dockerfile and manifest to deploy n8n quickly on Railway (or Render). Use the official `n8nio/n8n` image to avoid building from source.

Quick steps (Railway)
1. Create a new project on Railway and choose "Deploy from GitHub" or "Deploy from Dockerfile." If deploying from this repo, point Railway at the `n8n/deploy/Dockerfile` path.
2. In Railway, add environment variables (use the values from `.env.template`):
   - `REPLICATE_API_TOKEN` — your Replicate API token
   - `N8N_BASIC_AUTH_ACTIVE=true` (optional)
   - `N8N_BASIC_AUTH_USER` — set a username (e.g., admin)
   - `N8N_BASIC_AUTH_PASSWORD` — set a strong password
3. Deploy the service. Railway will build the image from the Dockerfile and provide a public URL.
4. Open the n8n UI at the provided URL. Import the workflow JSON from `n8n/README.md` (use Import > Paste JSON) and edit the HTTP Request node to reference your Replicate token/model or use n8n environment vars.
5. Copy the webhook URL (it will look like `https://<railway-host>/webhook/fastensnap-upload`) and paste it into `config/webhook.ts` in the app.

Notes for Render
- Similar steps apply on Render: create a Web Service, set the Dockerfile path, configure environment variables, and deploy.

Security
- Do not commit actual secret values. Use Railway's environment variables or n8n's credential manager.
