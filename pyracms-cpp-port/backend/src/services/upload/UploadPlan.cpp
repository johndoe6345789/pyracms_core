#include "services/upload/UploadPlan.h"
#include "services/upload/UploadHash.h"

namespace pyracms {

PartPlan planPart(const std::vector<PartRow> &parts, int n, int64_t size,
                  const std::string &md5, int64_t declared) {
    PartPlan plan;
    int count = static_cast<int>(parts.size());
    if (n < 1 || n > count + 1) {
        plan.action = PartAction::OutOfOrder;
        return plan;
    }
    if (n <= count && parts[n - 1].etag == md5 &&
        parts[n - 1].size == size) {
        plan.action = PartAction::Duplicate;
        plan.etag = md5;
        return plan;
    }
    if (n < count) { // an earlier part changed: later hashes would be stale
        plan.action = PartAction::OutOfOrder;
        return plan;
    }
    int64_t before = 0;
    for (int i = 0; i < n - 1; ++i)
        before += parts[i].size;
    plan.prevState = n == 1 ? shaStateInit() : parts[n - 2].stateHex;
    if (before + size > declared)
        plan.action = PartAction::TooMuch;
    return plan;
}

} // namespace pyracms
