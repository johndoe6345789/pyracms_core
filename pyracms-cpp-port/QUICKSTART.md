# Quick Start Guide - PyraCMS C++ Port

This guide will help you get the PyraCMS C++ port running quickly.

## Prerequisites

- **C++ Compiler**: GCC 9+ or Clang 10+
- **CMake**: 3.15+
- **Bun**: Latest
- **PostgreSQL**: 13+
- **Docker** (optional, for containerized setup)

## Option 1: Docker Compose (Easiest)

This is the fastest way to get started for development:

```bash
cd pyracms-cpp-port

# Start all services (PostgreSQL, backend, frontend)
docker-compose up

# The frontend will be available at http://localhost:3000
# The backend API will be at http://localhost:8080
```

To stop:
```bash
docker-compose down
```

## Option 2: Manual Setup

### Step 1: Setup PostgreSQL

Create a database:
```bash
# Using psql
createdb pyracms

# Or using Docker
docker run --name pyracms-postgres \
  -e POSTGRES_USER=pyracms \
  -e POSTGRES_PASSWORD=pyracms \
  -e POSTGRES_DB=pyracms \
  -p 5432:5432 \
  -d postgres:15-alpine
```

### Step 2: Configure Environment

Backend environment:
```bash
cd pyracms-cpp-port/backend
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL="postgresql://pyracms:pyracms@localhost:5432/pyracms?schema=public"
```

Frontend environment:
```bash
cd pyracms-cpp-port/frontend
cp .env.example .env.local

# The default values should work
# NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Step 3: Setup Backend

```bash
cd pyracms-cpp-port/backend

# Install Prisma dependencies
bun install

# Run database migrations
bunx prisma migrate dev
bunx prisma generate

# Build the C++ backend
mkdir build && cd build
cmake ..
make -j$(nproc)

# Optional: Run tests
ctest --output-on-failure
```

### Step 4: Setup Frontend

```bash
cd pyracms-cpp-port/frontend

# Install dependencies
bun install

# Optional: Run tests
bun test
```

### Step 5: Start the Servers

Terminal 1 - Backend:
```bash
cd pyracms-cpp-port/backend/build
./pyracms_server --host 0.0.0.0 --port 8080
```

Terminal 2 - Frontend:
```bash
cd pyracms-cpp-port/frontend
bun run dev
```

### Step 6: Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

## Development Workflow

### Making Backend Changes

1. Edit C++ files in `backend/src/` or `backend/include/`
2. Rebuild:
   ```bash
   cd backend/build
   make -j$(nproc)
   ```
3. Run tests:
   ```bash
   ctest --verbose
   ```
4. Restart the server

### Making Frontend Changes

The Next.js development server supports hot reload, so changes are reflected automatically.

To run tests:
```bash
cd frontend
bun test
```

### Database Changes

1. Edit `backend/prisma/schema.prisma`
2. Create migration:
   ```bash
   cd backend
   bunx prisma migrate dev --name your_migration_name
   ```
3. The migration will be applied automatically

## Troubleshooting

### Backend Won't Compile

- Check GCC/Clang version: `g++ --version` or `clang++ --version`
- Check CMake version: `cmake --version`
- Install build dependencies on Ubuntu:
  ```bash
  sudo apt-get install build-essential cmake libssl-dev
  ```

### Frontend Build Errors

- Delete `node_modules` and reinstall:
  ```bash
  rm -rf node_modules bun.lockb
  bun install
  ```
- Check Bun version: `bun --version`

### Database Connection Errors

- Verify PostgreSQL is running:
  ```bash
  pg_isready
  ```
- Check connection string in `.env`
- Ensure database exists:
  ```bash
  psql -l | grep pyracms
  ```

### Port Already in Use

If ports 3000 or 8080 are already in use:

Backend:
```bash
./pyracms_server --port 8081
```

Frontend:
```bash
PORT=3001 bun run dev
```

Don't forget to update the API URL in frontend `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8081
```

## Next Steps

- Read the [main README](README.md) for detailed documentation
- Check [backend README](backend/README.md) for backend-specific docs
- Check [frontend README](frontend/README.md) for frontend-specific docs
- Explore the API endpoints
- Start building your modules!

## Multi-Architecture Support

The project supports building for multiple architectures using QEMU:

### Quick Docker Multi-Arch Build

```bash
# Set up Docker Buildx (one-time setup)
docker buildx create --name multiarch --use
docker buildx inspect --bootstrap

# Build for multiple architectures
cd pyracms-cpp-port
docker buildx build \
  --platform linux/amd64,linux/arm64,linux/arm/v7 \
  -t pyracms-backend:multiarch \
  backend/

docker buildx build \
  --platform linux/amd64,linux/arm64,linux/arm/v7 \
  -t pyracms-frontend:multiarch \
  frontend/
```

### Supported Platforms

- **linux/amd64** - Standard x86_64 (Intel/AMD)
- **linux/arm64** - ARM 64-bit (Apple Silicon M1/M2, AWS Graviton, RPi 4+)
- **linux/arm/v7** - ARM 32-bit (Raspberry Pi 3, older ARM devices)

### CI/CD Multi-Arch

GitHub Actions automatically tests builds across multiple architectures:
- Native builds on x86_64 and macOS
- Cross-compilation for aarch64 with QEMU
- Multi-arch Docker builds with automated testing

## Getting Help

- Check the README files in each directory
- Review the code comments for TODOs and implementation notes
- Open an issue on GitHub

## Important Notes

⚠️ **This is a development setup** with placeholder implementations for:
- JWT token generation/validation
- Password hashing (uses insecure std::hash)
- Session management

**Before production use**, you MUST:
1. Integrate proper JWT library (jwt-cpp, libjwt)
2. Implement secure password hashing (bcrypt, Argon2)
3. Add proper HTTP server library (Boost.Beast, cpp-httplib, etc.)
4. Complete database integration
5. Add proper logging
6. Implement rate limiting
7. Add HTTPS support
8. Review and update all security settings

See the TODO section in the main README for a complete list.
