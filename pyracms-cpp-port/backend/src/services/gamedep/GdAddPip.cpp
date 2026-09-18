#include "services/gamedep/GdQuery.h"

namespace pyracms {

void gdAddPip(Json::Value &page) {
    Json::Value pip(Json::arrayValue);
    for (const auto &d : page["dependencies"]) {
        if (d["kind"].asString() == "pip")
            pip.append(d["name"].asString() + d["version"].asString());
    }
    page["pipRequirements"] = pip;
}

} // namespace pyracms
