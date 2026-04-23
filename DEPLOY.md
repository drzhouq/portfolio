# Deploying to Cloudflare Workers + R2

## Prerequisites

1. Install the Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Authenticate with Cloudflare:
   ```bash
   wrangler login
   ```

## Setup

### Create R2 Bucket

```bash
wrangler r2 bucket create portfolio-assets
```

Enable public access for the bucket in the Cloudflare dashboard:
- Go to **R2** > **portfolio-assets** > **Settings** > **Public access**
- Enable public access and note the public URL (e.g., `https://pub-{hash}.r2.dev`)

### Configure Secrets

Set the admin password as a secret (not stored in wrangler.jsonc):

```bash
wrangler secret put ADMIN_PASSWORD
```

Set the R2 public URL so uploaded images get the correct public URL:

```bash
wrangler secret put R2_PUBLIC_URL
```

Enter the public bucket URL from the step above (e.g., `https://pub-abc123.r2.dev`).

### Custom Domain (Optional)

1. In the Cloudflare dashboard, go to **Workers & Pages** > **portfolio** > **Settings** > **Domains & Routes**
2. Add your custom domain (must be on Cloudflare DNS)

## Deploy

Build and deploy:

```bash
npm run build
npm run deploy
```

Or in one step:

```bash
npm run build && npm run deploy
```

## Local Development

Local development uses file-based storage (no R2 required):

```bash
cp .env.local.example .env.local
# Edit .env.local with your ADMIN_PASSWORD
npm run dev
```

Data is stored in `data/` and images in `public/uploads/`.
