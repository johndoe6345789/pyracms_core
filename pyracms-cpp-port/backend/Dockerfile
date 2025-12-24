FROM ubuntu:22.04 AS builder

# Install build dependencies including Ninja and Conan
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    ninja-build \
    git \
    libssl-dev \
    curl \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install Conan package manager
RUN pip3 install conan && conan --version

# Install Bun for Prisma and TypeScript tooling
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

WORKDIR /app

# Copy source files
COPY CMakeLists.txt ./
COPY src/ ./src/
COPY include/ ./include/
COPY tests/ ./tests/
# Copy package.json and optionally bun.lockb if it exists
COPY package.json bun.lockb* ./
COPY prisma/ ./prisma/

# Install Prisma using bunx
RUN bun install --frozen-lockfile
RUN bunx prisma generate

# Build the application with Ninja
RUN mkdir build && cd build \
    && cmake -G Ninja -DCMAKE_BUILD_TYPE=Release -DBUILD_TESTS=OFF .. \
    && ninja

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
