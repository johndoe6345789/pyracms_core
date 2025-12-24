# PyraCMS C++ Backend

A modern C++ backend implementation for PyraCMS using REST API architecture.

## Features

- **C++ 17** backend with modern practices
- **Prisma ORM** for type-safe database operations
- **RESTful API** architecture
- **JWT Authentication** for secure user sessions
- **PostgreSQL** database support
- **CMake** build system
- **Google Test** framework for unit testing

## Project Structure

```
backend/
├── CMakeLists.txt          # Main CMake configuration
├── include/                # Header files
│   ├── server.h           # HTTP server interface
│   ├── database.h         # Database operations
│   ├── auth_handler.h     # Authentication logic
│   └── user_handler.h     # User management
├── src/                   # Implementation files
│   ├── main.cpp           # Entry point
│   ├── server.cpp         # Server implementation
│   ├── database.cpp       # Database implementation
│   ├── auth_handler.cpp   # Auth implementation
│   └── user_handler.cpp   # User handler implementation
├── tests/                 # Unit tests
│   ├── CMakeLists.txt
│   ├── test_auth.cpp
│   ├── test_database.cpp
│   └── test_user_handler.cpp
├── prisma/               # Database schema
│   └── schema.prisma
└── package.json          # Prisma dependencies
```

## Prerequisites

- **C++ Compiler**: GCC 9+ or Clang 10+ with C++17 support
- **CMake**: 3.15 or higher
- **Node.js**: 18+ (for Prisma)
- **PostgreSQL**: 13+ (or another supported database)
- **Google Test**: For running tests (automatically downloaded if not found)

## Dependencies

The project requires the following libraries:

- **HTTP Server Library** (choose one):
  - [Boost.Beast](https://www.boost.org/doc/libs/release/libs/beast/)
  - [cpp-httplib](https://github.com/yhirose/cpp-httplib)
  - [Pistache](https://github.com/pistacheio/pistache)
  - [oatpp](https://oatpp.io/)

- **JSON Library**:
  - [nlohmann/json](https://github.com/nlohmann/json)

- **Password Hashing**:
  - [bcrypt](https://github.com/rg3/bcrypt) or
  - [Argon2](https://github.com/P-H-C/phc-winner-argon2)

## Setup

### 1. Install Prisma Dependencies

```bash
cd backend
bun install
```

### 2. Configure Database

Create a `.env` file in the backend directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/pyracms?schema=public"
```

### 3. Run Database Migrations

```bash
bun run prisma:migrate
bun run prisma:generate
```

### 4. Build the Backend

```bash
mkdir build
cd build
cmake ..
make
```

### 5. Run Tests

```bash
cd build
ctest --output-on-failure
```

Or run the test executable directly:

```bash
./pyracms_tests
```

## Running the Server

```bash
./build/pyracms_server --host 0.0.0.0 --port 8080 --db "postgresql://localhost:5432/pyracms"
```

Options:
- `--host`: Host address (default: 0.0.0.0)
- `--port`: Port number (default: 8080)
- `--db`: Database connection string

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/register` - User registration

### User Management

- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Development

### Adding New Routes

1. Define the handler function in the appropriate handler class
2. Register the route in `main.cpp`
3. Implement the handler logic
4. Add tests in the `tests/` directory

### Database Migrations

To create a new migration:

```bash
bun run prisma:migrate
```

To view the database in Prisma Studio:

```bash
bun run prisma:studio
```

## Production Deployment

### Build for Production

```bash
cmake -DCMAKE_BUILD_TYPE=Release ..
make
```

### Deploy Migrations

```bash
bun run prisma:deploy
```

## TODO

The current implementation provides a foundation. To complete the backend:

1. **Integrate HTTP Server Library**: Choose and integrate a production-ready HTTP library
2. **Implement JSON Parsing**: Add nlohmann/json or similar for request/response parsing
3. **Complete Database Integration**: Integrate Prisma Client or use libpqxx for PostgreSQL
4. **Implement JWT**: Add proper JWT token generation and validation
5. **Add Password Hashing**: Integrate bcrypt or Argon2 for secure password storage
6. **Add Logging**: Integrate spdlog or similar for structured logging
7. **Add Configuration**: Use a configuration file or environment variables
8. **Add CORS Support**: Implement CORS headers for frontend integration
9. **Add Rate Limiting**: Implement rate limiting for API endpoints
10. **Add API Documentation**: Generate OpenAPI/Swagger documentation

## Testing

Run all tests:

```bash
cd build
ctest --verbose
```

Run specific test suite:

```bash
./pyracms_tests --gtest_filter=AuthHandlerTest.*
```

## License

Same as PyraCMS core project.

## Contributing

Contributions are welcome! Please follow the existing code style and add tests for new features.
