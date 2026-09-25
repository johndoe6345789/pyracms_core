#include "services/CodeSnippetService.h"
#include "services/TagRules.h"

namespace pyracms {

CodeSnippetDto CodeSnippetService::rowToDto(const drogon::orm::Row &row) {
    CodeSnippetDto dto;
    dto.id = row["id"].as<int>();
    dto.tenantId = row["tenant_id"].as<int>();
    dto.authorId = row["author_id"].as<int>();
    dto.authorUsername =
        row["username"].isNull() ? "" : row["username"].as<std::string>();
    dto.title = row["title"].as<std::string>();
    dto.code = row["code"].as<std::string>();
    dto.language = row["language"].as<std::string>();
    dto.visibility = row["visibility"].as<std::string>();
    dto.runCount = row["run_count"].as<int>();
    dto.forkedFrom =
        row["forked_from"].isNull() ? 0 : row["forked_from"].as<int>();
    dto.createdAt = row["created_at"].as<std::string>();
    dto.updatedAt = row["updated_at"].as<std::string>();
    dto.tags = splitTagList(row["tag_list"].as<std::string>());
    return dto;
}

} // namespace pyracms
