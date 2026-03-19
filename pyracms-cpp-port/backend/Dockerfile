FROM ubuntu:24.04 AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    ninja-build \
    git \
    libssl-dev \
    libpq-dev \
    libjsoncpp-dev \
    python3 \
    python3-pip \
    curl \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install Conan 2
RUN pip3 install --break-system-packages conan && conan profile detect

WORKDIR /app

# Copy conan files first for dependency caching
COPY conanfile.txt ./
RUN conan install . --output-folder=build --build=missing \
    -s compiler.cppstd=17 -s build_type=Release

# Copy source files
COPY CMakeLists.txt ./
COPY src/ ./src/
COPY include/ ./include/
COPY tests/ ./tests/
COPY sql/ ./sql/

# Build with CMake + Ninja
RUN cd build && cmake .. \
    -G Ninja \
    -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_TOOLCHAIN_FILE=conan_toolchain.cmake \
    -DBUILD_TESTS=OFF \
    && ninja

# Production stage
FROM ubuntu:24.04

RUN apt-get update && apt-get install -y \
    libssl3t64 \
    libpq5 \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy binary, migrations, and openapi spec
COPY --from=builder /app/build/pyracms_server /app/
COPY --from=builder /app/sql/ /app/sql/
COPY openapi.yaml /app/

# Copy Conan shared libraries needed at runtime
COPY --from=builder /root/.conan2/p/*/p/lib/*.so* /usr/local/lib/
RUN ldconfig

# Init script to run migrations then start server
COPY docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/app/docker-entrypoint.sh"]
