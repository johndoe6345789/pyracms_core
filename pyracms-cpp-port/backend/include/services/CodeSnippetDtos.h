#pragma once

#include <cstdint>
#include <string>
#include <vector>

namespace pyracms {

struct CodeSnippetDto {
    int id;
    int tenantId;
    int authorId;
    std::string authorUsername;
    std::string title;
    std::string code;
    std::string language;
    std::string visibility;
    int runCount;
    int forkedFrom;
    std::string createdAt;
    std::string updatedAt;
    std::vector<std::string> tags;
};

struct SnippetExecutionDto {
    int id;
    int snippetId;
    int userId;
    std::string output;
    int exitCode;
    int executionTimeMs;
    std::string createdAt;
};

// A file attached to a snippet (e.g. the input a challenge's code reads
// with open()), joined from `files` for the frontend to show/download it.
struct SnippetAttachmentDto {
    int id;
    std::string fileUuid;
    std::string filename;
    std::string mimetype;
    int64_t size;
};

// One saved state of a snippet. `number` is 1-based and per snippet.
struct SnippetRevisionDto {
    int id;
    int number;
    int snippetId;
    std::string title;
    std::string code;
    std::string language;
    std::string summary;
    int userId;
    std::string authorUsername;
    std::string createdAt;
};

} // namespace pyracms
