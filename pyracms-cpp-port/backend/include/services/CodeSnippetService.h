#pragma once

#include "services/CodeSnippetDtos.h"

#include <drogon/drogon.h>
#include <functional>
#include <optional>
#include <string>
#include <vector>

namespace pyracms {

class CodeSnippetService {
  public:
    using DbClientPtr = drogon::orm::DbClientPtr;
    using BoolCallback =
        std::function<void(bool success, const std::string &error)>;
    void listSnippets(
        const DbClientPtr &db, int tenantId, const std::string &language,
        int authorId, int viewerId, const std::string &tag, int limit,
        int offset,
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
                       const std::string &visibility,
                       const std::string &summary, BoolCallback cb);
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

    // Newest first, at most `limit`.
    void listRevisions(
        const DbClientPtr &db, int snippetId, int limit,
        std::function<void(const std::vector<SnippetRevisionDto> &)> cb);
    void getRevision(
        const DbClientPtr &db, int snippetId, int number,
        std::function<void(const std::optional<SnippetRevisionDto> &)> cb);
    // Author only. Copies revision `number` back onto the snippet and
    // records that as a new revision (history is never rewritten).
    void revertToRevision(const DbClientPtr &db, int snippetId, int number,
                          int userId, BoolCallback cb);

  private:
    CodeSnippetDto rowToDto(const drogon::orm::Row &row);
};

} // namespace pyracms
