#include "server.h"
#include "database.h"
#include "auth_handler.h"
#include "user_handler.h"
#include <iostream>
#include <memory>

int main(int argc, char* argv[]) {
    std::cout << "PyraCMS C++ Server Starting..." << std::endl;

    // Configuration
    std::string host = "0.0.0.0";
    int port = 8080;
    std::string db_connection = "postgresql://localhost:5432/pyracms";

    // Parse command line arguments
    for (int i = 1; i < argc; i++) {
        std::string arg = argv[i];
        if (arg == "--host" && i + 1 < argc) {
            host = argv[++i];
        } else if (arg == "--port" && i + 1 < argc) {
            port = std::stoi(argv[++i]);
        } else if (arg == "--db" && i + 1 < argc) {
            db_connection = argv[++i];
        }
    }

    try {
        // Initialize components
        auto db = std::make_shared<pyracms::Database>(db_connection);
        auto auth = std::make_shared<pyracms::AuthHandler>();
        auto user_handler = std::make_shared<pyracms::UserHandler>(db, auth);

        // Connect to database
        if (!db->connect()) {
            std::cerr << "Failed to connect to database" << std::endl;
            return 1;
        }
        std::cout << "Database connected successfully" << std::endl;

        // Run migrations
        if (!db->migrate()) {
            std::cerr << "Failed to run database migrations" << std::endl;
            return 1;
        }

        // Create and configure server
        pyracms::Server server(host, port);

        // Register routes
        server.addRoute("POST", "/api/auth/login", 
            [user_handler](const std::string& body) {
                return user_handler->handleLogin(body);
            });
        
        server.addRoute("POST", "/api/auth/logout",
            [user_handler](const std::string& body) {
                return user_handler->handleLogout(body);
            });
        
        server.addRoute("POST", "/api/auth/register",
            [user_handler](const std::string& body) {
                return user_handler->handleRegister(body);
            });

        std::cout << "Server starting on " << host << ":" << port << std::endl;
        server.start();

    } catch (const std::exception& e) {
        std::cerr << "Fatal error: " << e.what() << std::endl;
        return 1;
    }

    return 0;
}
