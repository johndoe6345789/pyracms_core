#include "storage/BlobStorage.h"

#include <cctype>

namespace pyracms {

int blobHttpStatus(BlobStatus s) {
    switch (s) {
    case BlobStatus::Ok:
        return 200;
    case BlobStatus::NotFound:
        return 404;
    case BlobStatus::Unavailable:
        return 503;
    default:
        return 502;
    }
}

const char *blobMessage(BlobStatus s) {
    switch (s) {
    case BlobStatus::NotFound:
        return "File not found";
    case BlobStatus::Unavailable:
        return "File storage is temporarily unavailable";
    default:
        return "File storage error";
    }
}

bool blobIdValid(const std::string &id) {
    if (id.empty() || id.size() > 64)
        return false;
    for (unsigned char c : id) {
        if (!std::isalnum(c) && c != '-')
            return false;
    }
    return true;
}

} // namespace pyracms
