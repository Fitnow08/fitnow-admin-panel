# syntax=docker/dockerfile:1

# ---- base: node + pnpm через corepack (официальный паттерн pnpm) ----
# Debian-slim (glibc): подходит под нативные бинды rolldown *-linux-x64-gnu,
# Node 22.x здесь >= 22.12 (требование Vite 8). НЕ alpine (musl) — во избежание
# проблем с нативными биндингами.
FROM node:22-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

# ---- build stage ----
FROM base AS builder

# Сначала только манифесты — слой install кешируется, пока не менялись lock/package.json
COPY package.json pnpm-lock.yaml  ./
# Кеш-маунт стора pnpm ускоряет повторные сборки (нужен BuildKit)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# Исходники
COPY . .

# VITE_* подставляются во время сборки, поэтому приходят build-аргументом.
# Это адрес REST-бэкенда fitnow, к которому будет ходить браузер.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm build

# ---- runtime stage ----
FROM nginx:1.27-alpine AS runner

# Конфиг с SPA-fallback вместо дефолтного
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Только собранная статика
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
