#ifndef PYRACMS_USER_HANDLER_H
#define PYRACMS_USER_HANDLER_H

#include <string>
#include <memory>
#include "database.h"
#include "auth_handler.h"

namespace pyracms {

class UserHandler {
public:
    UserHandler(std::shared_ptr<Database> db, std::shared_ptr<AuthHandler> auth);
    ~UserHandler();

    // User management endpoints
    std::string handleLogin(const std::string& request_body);
    std::string handleLogout(const std::string& token);
    std::string handleRegister(const std::string& request_body);
    std::string handleGetProfile(int user_id);
    std::string handleUpdateProfile(int user_id, const std::string& request_body);
    std::string handleListUsers(int limit, int offset);

private:
    std::shared_ptr<Database> db_;
    std::shared_ptr<AuthHandler> auth_;
    
    std::string jsonError(const std::string& message, int code = 400);
    std::string jsonSuccess(const std::string& data);
};

} // namespace pyracms

#endif // PYRACMS_USER_HANDLER_H
