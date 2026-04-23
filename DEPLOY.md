# Deploying with Coolify

## Prerequisites

- A VPS with Coolify installed
- This repository accessible from the VPS (GitHub, GitLab, etc.)

## Setup

1. **Create a new resource** in Coolify: choose "Docker Compose" as the build method.

2. **Connect your Git repository** and select the branch `deploy/vps-coolify`.

3. **Set environment variables** in the Coolify dashboard:
   - `ADMIN_PASSWORD` — password for the admin panel

4. **Configure persistent storage** — Coolify handles Docker volumes automatically via the `docker-compose.yml`. The two volumes are:
   - `app-data` — JSON data files (artworks, settings)
   - `app-uploads` — uploaded artwork images

5. **Deploy** — Coolify will build the Docker image and start the container on port 3000.

## Local Docker testing

```bash
cp .env.local.example .env.local
# Edit .env.local with your values

docker compose up --build
```

The app will be available at `http://localhost:3000`.

## Volume management

Artwork data and uploaded images persist across deployments in Docker volumes. To back up:

```bash
docker compose cp portfolio:/app/data ./backup-data
docker compose cp portfolio:/app/public/uploads ./backup-uploads
```
