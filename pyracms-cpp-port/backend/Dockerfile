FROM ubuntu:22.04 AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    libssl-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Bun for Prisma
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

WORKDIR /app

# Copy source files
COPY CMakeLists.txt ./
COPY src/ ./src/
COPY include/ ./include/
COPY tests/ ./tests/
COPY package.json bun.lockb ./
COPY prisma/ ./prisma/

# Install Prisma
RUN bun install --frozen-lockfile

# Build the application
RUN mkdir build && cd build \
    && cmake -DCMAKE_BUILD_TYPE=Release -DBUILD_TESTS=OFF .. \
    && make

# Production stage
FROM ubuntu:22.04

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libssl3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/build/pyracms_server /app/
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/prisma /app/prisma

EXPOSE 8080

CMD ["/app/pyracms_server", "--host", "0.0.0.0", "--port", "8080"]
