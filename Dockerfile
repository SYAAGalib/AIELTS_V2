# ─────────────────────────────────────────────
# Stage 1: Build
# ─────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copy manifests first for layer-cache efficiency
COPY package.json package-lock.json ./

# Install all deps (includes devDeps needed for the build)
RUN npm install

# Copy the rest of the source
COPY . .

# ── Build-time environment variables ─────────
ENV NITRO_PRESET=node-server
ENV NODE_ENV=production

ENV SUPABASE_PUBLISHABLE_KEY="sb_publishable_YRt3hvQmDZGdfCKjgy4c3g_xQb59aBH"
ENV SUPABASE_URL="https://lngrdjskqafdvyhotuth.supabase.co"
ENV ADMIN_DEMO_EMAIL="admin@gmail.com"
ENV ADMIN_DEMO_PASSWORD="admin123"
ENV ADMIN_DEMO_NAME="Galib"
ENV VITE_SUPABASE_PROJECT_ID="lngrdjskqafdvyhotuth"
ENV VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_YRt3hvQmDZGdfCKjgy4c3g_xQb59aBH"
ENV VITE_SUPABASE_URL="https://lngrdjskqafdvyhotuth.supabase.co"
ENV VITE_ADMIN_DEMO_EMAIL="admin@gmail.com"
ENV VITE_ADMIN_DEMO_PASSWORD="admin123"
ENV VITE_ADMIN_DEMO_NAME="Galib"
ENV ADMIN_SESSION_SECRET="aielts-local-admin-session-secret-2026-06-09"
ENV SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuZ3JkanNrcWFmZHZ5aG90dXRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDk4MDI2MCwiZXhwIjoyMDk2NTU2MjYwfQ.UuLbaNVpCbk8MN0f18MyGRUzOyQaTF02kghv-l_ruyo"
ENV YOUTUBE_API_KEY=""
ENV LOVABLE_API_KEY=""
ENV LOVABLE_SEND_URL=""

# Build with node-server preset → outputs to .output/
RUN npm run build


# ─────────────────────────────────────────────
# Stage 2: Runtime
# ─────────────────────────────────────────────
FROM node:22-alpine AS runtime

WORKDIR /app

# Nitro node-server bundles everything; only .output/ is needed
COPY --from=builder /app/.output ./.output

# ── Runtime environment variables ────────────
ENV NODE_ENV=production
ENV PORT=3000

ENV SUPABASE_PUBLISHABLE_KEY="sb_publishable_YRt3hvQmDZGdfCKjgy4c3g_xQb59aBH"
ENV SUPABASE_URL="https://lngrdjskqafdvyhotuth.supabase.co"
ENV ADMIN_DEMO_EMAIL="admin@gmail.com"
ENV ADMIN_DEMO_PASSWORD="admin123"
ENV ADMIN_DEMO_NAME="Galib"
ENV VITE_SUPABASE_PROJECT_ID="lngrdjskqafdvyhotuth"
ENV VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_YRt3hvQmDZGdfCKjgy4c3g_xQb59aBH"
ENV VITE_SUPABASE_URL="https://lngrdjskqafdvyhotuth.supabase.co"
ENV VITE_ADMIN_DEMO_EMAIL="admin@gmail.com"
ENV VITE_ADMIN_DEMO_PASSWORD="admin123"
ENV VITE_ADMIN_DEMO_NAME="Galib"
ENV ADMIN_SESSION_SECRET="aielts-local-admin-session-secret-2026-06-09"
ENV SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuZ3JkanNrcWFmZHZ5aG90dXRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDk4MDI2MCwiZXhwIjoyMDk2NTU2MjYwfQ.UuLbaNVpCbk8MN0f18MyGRUzOyQaTF02kghv-l_ruyo"
ENV YOUTUBE_API_KEY=""
ENV LOVABLE_API_KEY=""
ENV LOVABLE_SEND_URL=""

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
