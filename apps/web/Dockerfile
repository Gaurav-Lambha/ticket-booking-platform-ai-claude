# syntax=docker/dockerfile:1

# --- Build stage ---
FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.5.0 --activate

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/tsconfig/package.json packages/tsconfig/
COPY packages/config/package.json packages/config/
COPY packages/types/package.json packages/types/
COPY packages/ui/package.json packages/ui/
COPY apps/web/package.json apps/web/

RUN pnpm install --frozen-lockfile --filter @repo/web...

COPY packages/tsconfig packages/tsconfig
COPY packages/config packages/config
COPY packages/types packages/types
COPY packages/ui packages/ui
COPY apps/web apps/web

RUN pnpm --filter @repo/config build
RUN pnpm --filter @repo/types build
RUN pnpm --filter @repo/ui build
RUN pnpm --filter @repo/web build

# --- Production stage ---
FROM nginx:1.27-alpine AS runner

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY infra/nginx/spa.conf /etc/nginx/conf.d/default.conf

RUN chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
