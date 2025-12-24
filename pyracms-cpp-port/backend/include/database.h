#ifndef PYRACMS_DATABASE_H
#define PYRACMS_DATABASE_H

#include <string>
#include <vector>
#include <memory>
#include <optional>

namespace pyracms {

// User model
struct User {
    int id;
    std::string username;
    std::string email;
    std::string password_hash;
    std::string created_at;
    bool is_active;
};

// Database interface
class Database {
public:
    Database(const std::string& connection_string);
    ~Database();

    // User operations
    std::optional<User> getUserById(int id);
    std::optional<User> getUserByUsername(const std::string& username);
    std::optional<User> getUserByEmail(const std::string& email);
    bool createUser(const User& user);
    bool updateUser(const User& user);
    bool deleteUser(int id);
    std::vector<User> listUsers(int limit = 100, int offset = 0);

    // Database management
    bool connect();
    void disconnect();
    bool isConnected() const;
    bool migrate();

private:
    class Impl;
    std::unique_ptr<Impl> pImpl;
    
    std::string connection_string_;
    bool connected_;
};

} // namespace pyracms

#endif // PYRACMS_DATABASE_H
