#pragma once

#include <string>

namespace pyracms {

// Stateless anti-forgery "state" for the OAuth round trip:
// <nonce>.<expiry epoch>.<HMAC-SHA256>, keyed with the server secret.
// A forged, altered or expired state is rejected. (It is not bound to a
// browser session: the front end must also compare it with the value it
// stored before redirecting.)
std::string makeOAuthState(long long now, int ttlSeconds = 600);
bool verifyOAuthState(const std::string &state, long long now);

} // namespace pyracms
