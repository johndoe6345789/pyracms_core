# PyraCMS C++ Port

A modern reimplementation of PyraCMS with a C++ backend and React/Material UI/Next.js frontend.

## Overview

This is a complete port of the PyraCMS core functionality using modern technologies:

- **Backend**: C++17 with RESTful API architecture
- **Frontend**: Next.js 14 with React 18 and Material UI 5
- **Database**: PostgreSQL with Prisma ORM
- **CI/CD**: GitHub Actions workflows
- **Testing**: Google Test for C++, Jest for frontend

## Project Structure

```
pyracms-cpp-port/
├── backend/              # C++ backend server
│   ├── src/             # Source files
│   ├── include/         # Header files
│   ├── tests/           # Unit tests
│   ├── prisma/          # Database schema
│   └── CMakeLists.txt   # Build configuration
├── frontend/            # Next.js frontend
│   ├── src/
│   │   ├── app/        # Next.js app directory
│   │   ├── components/ # React components
│   │   ├── lib/        # Utility functions
│   │   └── types/      # TypeScript types
│   └── package.json
└── README.md           # This file
```

## Features

### Backend (C++)
- RESTful API server
- JWT authentication
- User management
- Session handling
- Database abstraction layer
- Comprehensive unit tests

### Frontend (React/Next.js)
- Modern React with TypeScript
- Material UI components
- Authentication pages (Login/Register)
- Dashboard interface
- API integration with axios
- Unit tests with Jest

### Database (Prisma)
- Type-safe database schema
- User and group management
- Session management
- Settings storage
- Menu management

## Prerequisites

### Backend
- C++ compiler with C++17 support (GCC 9+, Clang 10+)
- CMake 3.15+
- Node.js 18+ (for Prisma)
- PostgreSQL 13+

### Frontend
- Bun (latest version)

## Quick Start

### 1. Setup Database

Create a PostgreSQL database:

```bash
createdb pyracms
```

Create a `.env` file in both `backend/` and `frontend/` directories:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/pyracms?schema=public"
API_URL="http://localhost:8080"
```

### 2. Setup Backend

```bash
cd backend

# Install Prisma dependencies
bun install

# Run database migrations
bun run prisma:migrate
bun run prisma:generate

# Build the C++ backend
mkdir build && cd build
cmake ..
make

# Run tests
ctest --output-on-failure
```

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
bun install

# Run development server
bun run dev
```

The frontend will be available at http://localhost:3000

### 4. Run Backend Server

```bash
cd backend/build
./pyracms_server --host 0.0.0.0 --port 8080
```

## Development

### Backend Development

See [backend/README.md](backend/README.md) for detailed backend documentation.

Key commands:
```bash
# Build
cd backend/build
cmake --build .

# Run tests
ctest --verbose

# Format code
clang-format -i src/*.cpp include/*.h
```

### Frontend Development

Key commands:
```bash
cd frontend

# Development server
bun run dev

# Build for production
bun run build

# Run tests
bun test

# Lint code
bun run lint

# Type checking
bun run type-check
```

### Database Development

Prisma commands:
```bash
cd backend

# Create a new migration
bun run prisma:migrate

# View database in Prisma Studio
bun run prisma:studio

# Generate Prisma Client
bun run prisma:generate

# Deploy migrations to production
bun run prisma:deploy
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout  
- `POST /api/auth/register` - User registration

### User Management
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Testing

### Backend Tests
```bash
cd backend/build
ctest --verbose

# Run specific test
./pyracms_tests --gtest_filter=AuthHandlerTest.*
```

### Frontend Tests
```bash
cd frontend
bun test

# Watch mode
bun run test:watch

# Coverage
bun test -- --coverage
```

## CI/CD

The project includes GitHub Actions workflows for:

1. **C++ Backend CI** (`.github/workflows/cpp-backend.yml`)
   - Build on Ubuntu and macOS
   - Multi-architecture support (x86_64, aarch64)
   - QEMU for cross-compilation testing
   - Run unit tests
   - Code formatting checks

2. **Frontend CI** (`.github/workflows/frontend.yml`)
   - Lint and type checking
   - Unit tests with coverage
   - Build verification

3. **Prisma CI** (`.github/workflows/prisma.yml`)
   - Schema validation
   - Migration checks
   - Database connection tests

4. **Multi-Architecture Docker Build** (`.github/workflows/docker-multiarch.yml`)
   - QEMU-based multi-arch builds
   - Support for linux/amd64, linux/arm64, linux/arm/v7
   - Automated testing across architectures
   - Docker layer caching for faster builds

## Plugin System

PyraCMS features a powerful plugin architecture that allows addon packages to seamlessly integrate with the core:

### Plugin Capabilities

✅ **Custom Routes** - Define new pages and views
✅ **Data Models** - Create database models with full CRUD support
✅ **Navigation Integration** - Add menu items automatically
✅ **API Extensions** - Extend the REST API with custom endpoints
✅ **Lifecycle Hooks** - React to install, activate, deactivate events
✅ **Settings Management** - Configurable plugin settings

### Plugin Structure

```typescript
import { createPlugin } from '@/plugins/registry'

export const myPlugin = createPlugin({
  metadata: {
    id: 'my-plugin',
    name: 'My Plugin',
    version: '1.0.0',
    description: 'Plugin description',
  },
  routes: [...],        // Custom routes
  navigation: [...],    // Menu items
  dataModels: [...],    // Database models
  apiExtensions: [...], // API endpoints
})
```

### Example Plugins

The repository includes examples for:
- **Forum Module** - Discussion boards with topics and posts
- **Article Module** - Blog/article publishing system
- **Gallery Module** - Image gallery and media management
- **Challenge Module** - Programming challenges and submissions

### Documentation

See [`frontend/src/plugins/README.md`](frontend/src/plugins/README.md) for:
- Complete plugin API reference
- Step-by-step guide to creating plugins
- Best practices and patterns
- Backend integration examples

### Plugin Distribution

Plugins can be distributed as npm packages:

```bash
bun add @pyracms/plugin-forum
```

Then registered in your application:

```typescript
import { pluginRegistry } from '@/plugins/registry'
import { forumPlugin } from '@pyracms/plugin-forum'

pluginRegistry.register(forumPlugin)
await pluginRegistry.activate('forum')
```

## Module System

PyraCMS is designed as a modular CMS. This core repository provides:
- User authentication and authorization
- Basic CMS functionality
- API infrastructure
- Frontend framework
- **Plugin system for extensibility**

Additional modules (separate repositories):
- Forum module
- Article/Blog module
- Gallery module
- Programming challenge module

## Production Deployment

### Multi-Architecture Docker Builds

Build Docker images for multiple architectures using QEMU:

```bash
# Set up Docker Buildx
docker buildx create --name multiarch --use
docker buildx inspect --bootstrap

# Build backend for multiple architectures
cd pyracms-cpp-port/backend
docker buildx build \
  --platform linux/amd64,linux/arm64,linux/arm/v7 \
  -t your-registry/pyracms-backend:latest \
  --push .

# Build frontend for multiple architectures
cd ../frontend
docker buildx build \
  --platform linux/amd64,linux/arm64,linux/arm/v7 \
  -t your-registry/pyracms-frontend:latest \
  --push .
```

Supported architectures:
- `linux/amd64` - x86_64 (Intel/AMD processors)
- `linux/arm64` - ARM64 (Apple Silicon, AWS Graviton, Raspberry Pi 4+)
- `linux/arm/v7` - ARMv7 (Raspberry Pi 3, older ARM devices)

### Backend
1. Build in Release mode:
   ```bash
   cmake -DCMAKE_BUILD_TYPE=Release ..
   make
   ```

2. Deploy with a process manager (systemd, supervisor, etc.)

3. Use a reverse proxy (nginx, Apache) for HTTPS

### Frontend
1. Build the production bundle:
   ```bash
   bun run build
   ```

2. Deploy with:
   - Vercel (recommended for Next.js)
   - Docker container (multi-arch supported)
   - Static hosting with `next export`

### Database
1. Set up production PostgreSQL instance
2. Run migrations:
   ```bash
   bun run prisma:deploy
   ```

## Security Considerations

- [ ] Replace placeholder JWT implementation with proper library
- [ ] Implement bcrypt/Argon2 for password hashing
- [ ] Add rate limiting
- [ ] Implement CSRF protection
- [ ] Add input validation and sanitization
- [ ] Use HTTPS in production
- [ ] Implement proper session management
- [ ] Add security headers
- [ ] Regular dependency updates

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## License

Same as the original PyraCMS project.

## TODO

### Backend
- [ ] Integrate production-ready HTTP server library (Boost.Beast, cpp-httplib, etc.)
- [ ] Implement proper JWT token generation/validation
- [ ] Add bcrypt/Argon2 password hashing
- [ ] Complete Prisma Client integration
- [ ] Add structured logging (spdlog)
- [ ] Implement rate limiting
- [ ] Add CORS middleware
- [ ] Generate OpenAPI/Swagger documentation

### Frontend
- [ ] Add user profile page
- [ ] Implement password reset flow
- [ ] Add admin panel
- [ ] Implement content management UI
- [ ] Add file upload functionality
- [ ] Implement real-time notifications
- [ ] Add internationalization (i18n)
- [ ] Improve accessibility

### Infrastructure
- [ ] Add Docker support
- [ ] Add docker-compose for local development
- [ ] Set up production deployment guides
- [ ] Add monitoring and logging
- [ ] Implement automated backups
- [ ] Add performance benchmarks

## Support

For questions, issues, or contributions, please open an issue on GitHub.
