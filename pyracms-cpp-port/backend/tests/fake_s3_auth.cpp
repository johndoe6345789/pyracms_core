#include "fake_s3.h"
#include "fake_s3_state.h"
#include "storage/SigV4.h"

#include <sstream>

namespace harness::fake {

using namespace pyracms;

// Splits "a;b;c" into its parts.
static std::vector<std::string> split(const std::string &s, char c) {
    std::vector<std::string> out;
    std::stringstream ss(s);
    std::string part;
    while (std::getline(ss, part, c))
        out.push_back(part);
    return out;
}

// Value of "Key=" inside "Credential=..., SignedHeaders=..., Signature=...".
static std::string field(const std::string &auth, const std::string &key) {
    auto p = auth.find(key + "=");
    if (p == std::string::npos)
        return "";
    p += key.size() + 1;
    return auth.substr(p, auth.find_first_of(", ", p) - p);
}

// Verifies a real SigV4 header signature against the request as received.
bool verifySigV4(const drogon::HttpRequestPtr &r, const std::string &secret) {
    auto auth = r->getHeader("Authorization");
    if (auth.rfind("AWS4-HMAC-SHA256 ", 0) != 0)
        return false;
    auto cred = split(field(auth, "Credential"), '/');
    if (cred.size() != 5 || cred[0] != kFakeS3Access || cred[3] != "s3")
        return false;
    SigV4Request q;
    // Drogon rewrites HEAD to GET before handlers run; sign the real verb.
    q.method = r->isHead() ? "HEAD" : r->methodString();
    q.path = r->path();
    q.query = r->query();
    q.amzDate = r->getHeader("x-amz-date");
    q.payloadSha = r->getHeader("x-amz-content-sha256");
    if (q.amzDate.substr(0, 8) != cred[1] ||
        q.payloadSha != sha256Hex(std::string(r->body())))
        return false;
    for (auto &h : split(field(auth, "SignedHeaders"), ';'))
        if (h != "x-amz-date" && h != "x-amz-content-sha256")
            q.headers[h] = r->getHeader(h);
    return sigv4Sign({cred[0], secret, cred[2]}, q) ==
           field(auth, "Signature");
}

} // namespace harness::fake
