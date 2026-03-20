# Stage 1: Conan dependency installation
FROM ubuntu:22.04 AS conan-stage

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    cmake \
    build-essential \
    pkg-config \
    libgl1-mesa-dev \
    libxkbcommon-dev \
    libxkbcommon-x11-dev \
    libfontconfig1-dev \
    libfreetype6-dev \
    libx11-dev \
    libx11-xcb-dev \
    libxext-dev \
    libxfixes-dev \
    libxi-dev \
    libxrender-dev \
    libxcb1-dev \
    libxcb-glx0-dev \
    libxcb-keysyms1-dev \
    libxcb-image0-dev \
    libxcb-shm0-dev \
    libxcb-icccm4-dev \
    libxcb-sync-dev \
    libxcb-xfixes0-dev \
    libxcb-shape0-dev \
    libxcb-randr0-dev \
    libxcb-render-util0-dev \
    libxcb-cursor-dev \
    libxcb-xinerama0-dev \
    libxcb-xkb-dev \
    libxkbcommon-x11-dev \
    libdbus-1-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

RUN pip3 install conan jinja2

WORKDIR /app

# Copy conan files and install dependencies
COPY conanfile.txt .
RUN conan profile detect --force && \
    conan install . --output-folder=build --build=missing \
    -s build_type=Release

# Stage 2: Build
FROM conan-stage AS build-stage

COPY . .

# Generate CMakeLists.txt from template
RUN python3 generate_cmake.py

# Build
RUN cd build && \
    cmake .. \
    -DCMAKE_TOOLCHAIN_FILE=conan_toolchain.cmake \
    -DCMAKE_BUILD_TYPE=Release \
    -DBUILD_TESTS=OFF && \
    cmake --build . --parallel $(nproc)

# Stage 3: Runtime
FROM ubuntu:22.04 AS runtime

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libxkbcommon0 \
    libxkbcommon-x11-0 \
    libfontconfig1 \
    libfreetype6 \
    libdbus-1-3 \
    libssl3 \
    libxcb-cursor0 \
    libxcb-icccm4 \
    libxcb-keysyms1 \
    libxcb-shape0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built binary and Qt libraries
COPY --from=build-stage /app/build/hypernucleus .

# Copy Qt6 shared libraries from Conan cache
COPY --from=build-stage /root/.conan2/p/*/p/lib/*.so* /usr/local/lib/
COPY --from=build-stage /root/.conan2/p/*/p/plugins /usr/local/plugins/

ENV LD_LIBRARY_PATH=/usr/local/lib
ENV QT_PLUGIN_PATH=/usr/local/plugins
ENV QT_QPA_PLATFORM=xcb

ENTRYPOINT ["/app/hypernucleus"]
