# Publish Release Workflow

This workflow (`publish-release.yml`) automatically builds, tests, and publishes the PyraCMS C++ Port to GitHub Container Registry (GHCR) and creates GitHub Releases with downloadable artifacts.

## Triggers

The workflow is triggered by:

1. **Git Tags**: When you push a version tag matching `v*.*.*` or `cpp-port-v*.*.*`
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **GitHub Releases**: When a release is published through the GitHub UI

3. **Manual Dispatch**: Through the GitHub Actions UI with a custom version input

## Features

### 1. Docker Image Publishing to GHCR

- **Backend Image**: Built with CMake, Ninja, and Conan
  - Image: `ghcr.io/{owner}/{repo}/pyracms-cpp-backend:{version}`
  - Multi-architecture: `linux/amd64`, `linux/arm64`, `linux/arm/v7`
  
- **Frontend Image**: Built with Bun (bunx) and Next.js
  - Image: `ghcr.io/{owner}/{repo}/pyracms-cpp-frontend:{version}`
  - Multi-architecture: `linux/amd64`, `linux/arm64`, `linux/arm/v7`

### 2. Release Artifacts

Pre-built binaries packaged as zip files for:
- **x86_64** architecture
- **aarch64** (ARM64) architecture

Each package includes:
- Compiled backend server binary
- Built frontend application
- Prisma schema and migrations
- Docker compose configuration
- README with usage instructions
- SHA256 checksums

### 3. Multi-Architecture Support

- **QEMU**: Enables building and testing ARM images on x86_64 runners
- **Cross-compilation**: Builds native binaries for multiple architectures
- **Testing**: Validates images work on all target platforms

## Build Tools

### C++ Backend
- **CMake**: Build system configuration
- **Ninja**: Fast parallel build tool
- **Conan**: C++ package manager (installed and available)
- **bunx**: Used for Prisma TypeScript tooling

### TypeScript Frontend
- **Bun**: JavaScript runtime and package manager
- **bunx**: Package runner for executing Next.js build

## Jobs

### 1. `build-backend`
Builds multi-architecture Docker images for the C++ backend and pushes to GHCR.

### 2. `build-frontend`
Builds multi-architecture Docker images for the TypeScript frontend and pushes to GHCR.

### 3. `build-release-artifacts`
Creates downloadable release packages with pre-built binaries for x86_64 and aarch64.

### 4. `create-release`
Creates a GitHub Release with all artifacts when triggered by a tag push.

### 5. `test-published-images`
Validates that published images can be pulled and work on all target platforms.

## Usage

### Publishing a New Release

1. **Tag a version**:
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

2. **Wait for workflow**: The workflow will automatically:
   - Build Docker images for all architectures
   - Push images to GHCR
   - Create release artifacts
   - Create a GitHub Release with downloadable files

3. **Pull Docker images**:
   ```bash
   docker pull ghcr.io/{owner}/{repo}/pyracms-cpp-backend:v1.0.0
   docker pull ghcr.io/{owner}/{repo}/pyracms-cpp-frontend:v1.0.0
   ```

4. **Download release artifacts**: Visit the GitHub Releases page

### Manual Trigger

1. Go to Actions → "Publish CPP Port to GHCR and Release"
2. Click "Run workflow"
3. Enter a version tag (e.g., `v1.0.0`)
4. Click "Run workflow"

## Environment Variables

- `REGISTRY`: Set to `ghcr.io` (GitHub Container Registry)
- `BACKEND_IMAGE_NAME`: Constructed from repository name
- `FRONTEND_IMAGE_NAME`: Constructed from repository name

## Permissions Required

The workflow requires:
- `contents: write` - For creating releases
- `packages: write` - For pushing to GHCR

These are automatically granted through `GITHUB_TOKEN`.

## Docker Image Tags

Images are tagged with:
- Specific version (e.g., `v1.0.0`)
- Semantic version parts (`1.0`, `1`)
- `latest` (for default branch)

## Troubleshooting

### Build Failures

1. **ARM64 cross-compilation fails**: Ensure QEMU is properly set up
2. **CMake configuration fails**: Check CMakeLists.txt syntax
3. **Ninja not found**: Verify ninja-build package installation
4. **Conan issues**: Check Conan is properly installed with pip3

### Push to GHCR Fails

1. Verify `GITHUB_TOKEN` has `packages: write` permission
2. Check repository visibility settings
3. Ensure you're authenticated: `docker login ghcr.io`

### Release Creation Fails

1. Verify tag format matches trigger patterns
2. Check `contents: write` permission is granted
3. Ensure artifacts were successfully uploaded

## Example Output

After successful execution:

1. **GHCR Images**:
   - `ghcr.io/owner/repo/pyracms-cpp-backend:v1.0.0`
   - `ghcr.io/owner/repo/pyracms-cpp-frontend:v1.0.0`

2. **Release Artifacts**:
   - `pyracms-cpp-port-v1.0.0-x86_64.zip`
   - `pyracms-cpp-port-v1.0.0-x86_64.zip.sha256`
   - `pyracms-cpp-port-v1.0.0-aarch64.zip`
   - `pyracms-cpp-port-v1.0.0-aarch64.zip.sha256`

## Notes

- Multi-architecture builds may take 30-60 minutes
- QEMU emulation is slower than native builds
- Release artifacts are kept according to repository retention settings
- Docker images in GHCR follow GitHub package retention policies
