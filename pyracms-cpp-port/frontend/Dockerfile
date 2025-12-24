FROM oven/bun:1-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies using bunx
RUN bun install --frozen-lockfile

# Copy source files
COPY . .

# Build the application using bunx
RUN bunx next build

# Production stage
FROM oven/bun:1-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

# Copy necessary files from builder
COPY --from=frontend-builder /app/public ./public
COPY --from=frontend-builder /app/.next/standalone ./
COPY --from=frontend-builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
