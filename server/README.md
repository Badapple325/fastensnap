FastenSnap backend
==================

This lightweight Express server replaces the earlier n8n workflow for a simple pipeline:

- Accepts multipart/form-data with a `file` field at POST `/webhook/fastensnap-upload`.
- Encodes the image and forwards it to Replicate for prediction.
- Normalizes predictions into `{ labels: [{label, confidence, details}], raw }`.
- Optionally uploads the image and stores the result to Supabase (if credentials are provided).

Environment variables
---------------------

Required:
- `REPLICATE_API_TOKEN` — your Replicate API token
- `REPLICATE_MODEL_VERSION` — model/version string to pass to Replicate

Optional (for Supabase storage & history):
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `SUPABASE_BUCKET` (defaults to `uploads`)

Deploying
---------

On Render (recommended): Create a new Web Service, deploy from this repo, and set the Root Directory to `server`.
Use Docker environment (the provided Dockerfile will build and run the server).

Set the environment variables in Render (REPLICATE_API_TOKEN, REPLICATE_MODEL_VERSION, SUPABASE_* as needed).

Local testing
-------------
Install dependencies and run locally:

```powershell
cd server
npm install
npm start
```

Test with curl:

```bash
curl -v -X POST -F "file=@/path/to/sample.jpg" http://localhost:80/webhook/fastensnap-upload
```

Notes
-----
- Create a Supabase `uploads` storage bucket and a `recognitions` table with columns: `id (uuid pk)`, `created_at (timestamp default now())`, `image_path text`, `image_url text`, `labels jsonb`, `raw jsonb`.
- If you prefer not to use Supabase storage, the server will still work and simply skip uploads.
