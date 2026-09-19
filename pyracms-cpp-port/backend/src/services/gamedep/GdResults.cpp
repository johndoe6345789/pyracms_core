#include "services/gamedep/GdTypes.h"

namespace pyracms {

GdResult gdError(int status, const std::string &message) {
    GdResult r;
    r.status = status;
    r.body["error"] = message;
    return r;
}

GdResult gdOk(int status) {
    GdResult r;
    r.status = status;
    r.body["success"] = true;
    return r;
}

GdResult gdDbError(const std::string &what) {
    bool dup = what == "Already exists";
    return gdError(dup ? 409 : 400, dup ? "Already exists" : what);
}

bool gdValidType(const std::string &type) {
    return type == "game" || type == "dep";
}

GdResult gdBadType() {
    return gdError(400, "type must be game or dep");
}

} // namespace pyracms
