#pragma once

#include "services/DockerExecutionService.h"

#include <drogon/drogon.h>
#include <functional>
#include <vector>

namespace pyracms {

// The bytes of a snippet's attachments, read from file storage in order,
// for staging into the sandbox. Attachments that are missing, unreadable,
// oddly named or over the size/count caps are skipped, never an error.
void loadSnippetInputs(const drogon::orm::DbClientPtr &db, int snippetId,
                       std::function<void(std::vector<RunInput>)> cb);

} // namespace pyracms
