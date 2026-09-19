#pragma once

#include <string>

namespace pyracms {

// Startup security policy read from the environment.

// True when PYRACMS_ENV / APP_ENV / NODE_ENV is "production".
bool isProduction();

// Why `secret` (may be null) is unacceptable in production, "" if fine.
std::string weakSecretReason(const char *secret);

// JWT signing secret. JWT_SECRET when set; otherwise one random secret
// per process (dev only; tokens do not survive a restart).
std::string resolveJwtSecret();

// Startup gate: "" when the configuration may run, else the reason the
// server must refuse to start (production without a strong JWT_SECRET).
std::string startupSecurityError();

} // namespace pyracms
