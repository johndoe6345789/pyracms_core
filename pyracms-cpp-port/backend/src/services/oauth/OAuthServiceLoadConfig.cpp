#include "services/DbError.h"
#include "services/OAuthService.h"

#include <curl/curl.h>
#include <json/json.h>
#include <sstream>

namespace pyracms {

void OAuthService::loadConfig() {
    // GitHub
    const char *ghId = std::getenv("OAUTH_GITHUB_CLIENT_ID");
    const char *ghSecret = std::getenv("OAUTH_GITHUB_CLIENT_SECRET");
    const char *ghRedirect = std::getenv("OAUTH_GITHUB_REDIRECT_URI");
    if (ghId && ghSecret) {
        configs_["github"] = {
            ghId,
            ghSecret,
            "https://github.com/login/oauth/authorize",
            "https://github.com/login/oauth/access_token",
            "https://api.github.com/user",
            ghRedirect ? ghRedirect
                       : "http://localhost:3000/auth/callback/github",
            "user:email"};
    }

    // Google
    const char *ggId = std::getenv("OAUTH_GOOGLE_CLIENT_ID");
    const char *ggSecret = std::getenv("OAUTH_GOOGLE_CLIENT_SECRET");
    const char *ggRedirect = std::getenv("OAUTH_GOOGLE_REDIRECT_URI");
    if (ggId && ggSecret) {
        configs_["google"] = {
            ggId,
            ggSecret,
            "https://accounts.google.com/o/oauth2/v2/auth",
            "https://oauth2.googleapis.com/token",
            "https://www.googleapis.com/oauth2/v2/userinfo",
            ggRedirect ? ggRedirect
                       : "http://localhost:3000/auth/callback/google",
            "openid email profile"};
    }

    // Discord
    const char *dsId = std::getenv("OAUTH_DISCORD_CLIENT_ID");
    const char *dsSecret = std::getenv("OAUTH_DISCORD_CLIENT_SECRET");
    const char *dsRedirect = std::getenv("OAUTH_DISCORD_REDIRECT_URI");
    if (dsId && dsSecret) {
        configs_["discord"] = {
            dsId,
            dsSecret,
            "https://discord.com/api/oauth2/authorize",
            "https://discord.com/api/oauth2/token",
            "https://discord.com/api/users/@me",
            dsRedirect ? dsRedirect
                       : "http://localhost:3000/auth/callback/discord",
            "identify email"};
    }
}

} // namespace pyracms
