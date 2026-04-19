url-shortener
===

![build status](https://github.com/oToToT/url-shortener/workflows/Deploy%20Frontend/badge.svg)

## Structure

- `client/`: static frontend deployed to GitHub Pages
- `server/src/`: Google Cloud Function source
- `server/test_server.js`: local Express wrapper for the function handler

## Local Server Development

Create `server/src/config.json` from `server/src/config.example.json`, then run:

```bash
cd server
npm install
npm start
```

The server reads config from `server/src/config.json` for local development and from environment variables when deployed to Google Cloud Functions.

## Manual Cloud Function Deploy

From the repo root, update the deployed function with:

```bash
gcloud functions deploy YOUR_FUNCTION_NAME \
  --gen2 \
  --runtime=nodejs22 \
  --region=YOUR_REGION \
  --source=server/src \
  --entry-point=handler \
  --trigger-http \
  --set-env-vars=HOST_ADDR=https://YOUR_FRONTEND_URL,URL_BASE=abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789,MAX_TRIES=100,URL_MIN_LENGTH=3
```
