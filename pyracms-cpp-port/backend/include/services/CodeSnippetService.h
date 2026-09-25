#pragma once

#include <drogon/drogon.h>
#include <functional>
#include <optional>
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

class CodeSnippetService {
  public:
    using DbClientPtr = drogon::orm::DbClientPtr;
    using BoolCallback =
        std::function<void(bool success, const std::string &error)>;
    void listSnippets(
        const DbClientPtr &db, int tenantId, const std::string &language,
        int authorId, int viewerId, int limit, int offset,
        std::function<void(const std::vector<CodeSnippetDto> &, int total)> cb);
    // scopeTenant 0 = any site. Private snippets: author (viewer) only.
    void
    getSnippet(const DbClientPtr &db, int snippetId, int scopeTenant,
               int viewerId,
               std::function<void(const std::optional<CodeSnippetDto> &)> cb);
    void createSnippet(const DbClientPtr &db, int tenantId, int authorId,
                       const std::string &title, const std::string &code,
                       const std::string &language,
                       const std::string &visibility,
                       std::function<void(bool success, int snippetId,
                                          const std::string &error)>
                           cb);
    void updateSnippet(const DbClientPtr &db, int snippetId, int userId,
                       const std::string &title, const std::string &code,
                       const std::string &language,
                       const std::string &visibility, BoolCallback cb);
    void deleteSnippet(const DbClientPtr &db, int snippetId, int userId,
                       BoolCallback cb);
    void forkSnippet(
        const DbClientPtr &db, int snippetId, int userId, int tenantId,
        std::function<void(bool success, int newId, const std::string &error)>
            cb);
    void recordExecution(const DbClientPtr &db, int snippetId, int userId,
                         const std::string &output, int exitCode,
                         int executionTimeMs, BoolCallback cb);

    void listAttachments(
        const DbClientPtr &db, int snippetId,
        std::function<void(const std::vector<SnippetAttachmentDto> &)> cb);
    // Owner-only: 0 rows affected/returned means not owned or not found,
    // same convention as updateSnippet/deleteSnippet.
    void addAttachment(const DbClientPtr &db, int snippetId, int userId,
                       const std::string &fileUuid, BoolCallback cb);
    void removeAttachment(const DbClientPtr &db, int snippetId,
                          int attachmentId, int userId, BoolCallback cb);

  private:
    CodeSnippetDto rowToDto(const drogon::orm::Row &row);
};

} // namespace pyracms
