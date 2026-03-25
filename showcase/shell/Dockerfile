FROM node:20-slim AS builder
WORKDIR /app

# Copy only what the shell + scripts need
COPY showcase/scripts/package.json ./scripts/package.json
COPY showcase/shell/package.json ./shell/package.json

# Install deps for both (standalone, no workspace)
RUN cd scripts && npm install --silent && cd ../shell && npm install --silent

# Copy source
COPY showcase/shared/ ./shared/
COPY showcase/packages/ ./packages/
COPY showcase/scripts/ ./scripts/
COPY showcase/shell/ ./shell/

# Generate registry + content, then build Next.js
RUN cd scripts && node node_modules/tsx/dist/cli.mjs generate-registry.ts \
    && node node_modules/tsx/dist/cli.mjs bundle-demo-content.ts \
    && cd ../shell && npx next build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=10000

COPY --from=builder /app/shell/.next ./.next
COPY --from=builder /app/shell/node_modules ./node_modules
COPY --from=builder /app/shell/package.json ./

EXPOSE 10000
CMD ["npx", "next", "start", "-p", "10000"]
