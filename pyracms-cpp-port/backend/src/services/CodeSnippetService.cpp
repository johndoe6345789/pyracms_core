#include "services/CodeSnippetService.h"

namespace pyracms {

CodeSnippetDto CodeSnippetService::rowToDto(const drogon::orm::Row &row) {
    CodeSnippetDto dto;
    dto.id = row["id"].as<int>();
    dto.tenantId = row["tenant_id"].as<int>();
    dto.authorId = row["author_id"].as<int>();
    dto.authorUsername = row["username"].isNull() ? "" : row["username"].as<std::string>();
    dto.title = row["title"].as<std::string>();
    dto.code = row["code"].as<std::string>();
    dto.language = row["language"].as<std::string>();
    dto.visibility = row["visibility"].as<std::string>();
    dto.runCount = row["run_count"].as<int>();
    dto.forkedFrom = row["forked_from"].isNull() ? 0 : row["forked_from"].as<int>();
    dto.createdAt = row["created_at"].as<std::string>();
    dto.updatedAt = row["updated_at"].as<std::string>();
    return dto;
}

void CodeSnippetService::listSnippets(
    const DbClientPtr &db, int tenantId,
    const std::string &language, int authorId,
    int limit, int offset,
    std::function<void(const std::vector<CodeSnippetDto> &, int total)> cb) {

    std::string countSql = "SELECT COUNT(*) AS cnt FROM code_snippets s WHERE s.tenant_id = $1";
    std::string sql =
        "SELECT s.*, u.username FROM code_snippets s "
        "LEFT JOIN users u ON u.id = s.author_id "
        "WHERE s.tenant_id = $1";

    std::vector<std::string> conditions;
    // We build dynamic SQL based on filters
    // For simplicity we handle the common cases
    if (!language.empty()) {
        sql += " AND s.language = $2";
        countSql += " AND s.language = $2";
    }
    if (authorId > 0) {
        sql += " AND s.author_id = $3";
        countSql += " AND s.author_id = $3";
    }

    sql += " ORDER BY s.created_at DESC LIMIT " + std::to_string(limit) + " OFFSET " + std::to_string(offset);

    if (!language.empty() && authorId > 0) {
        db->execSqlAsync(
            countSql,
            [this, db, sql, limit, offset, language, authorId, tenantId, cb](const drogon::orm::Result &countResult) {
                int total = countResult[0]["cnt"].as<int>();
                db->execSqlAsync(
                    sql,
                    [this, total, cb](const drogon::orm::Result &result) {
                        std::vector<CodeSnippetDto> snippets;
                        for (const auto &row : result) {
                            snippets.push_back(rowToDto(row));
                        }
                        cb(snippets, total);
                    },
                    [cb](const drogon::orm::DrogonDbException &) {
                        cb({}, 0);
                    },
                    tenantId, language, authorId);
            },
            [cb](const drogon::orm::DrogonDbException &) {
                cb({}, 0);
            },
            tenantId, language, authorId);
    } else if (!language.empty()) {
        db->execSqlAsync(
            countSql,
            [this, db, sql, limit, offset, language, tenantId, cb](const drogon::orm::Result &countResult) {
                int total = countResult[0]["cnt"].as<int>();
                db->execSqlAsync(
                    sql,
                    [this, total, cb](const drogon::orm::Result &result) {
                        std::vector<CodeSnippetDto> snippets;
                        for (const auto &row : result) {
                            snippets.push_back(rowToDto(row));
                        }
                        cb(snippets, total);
                    },
                    [cb](const drogon::orm::DrogonDbException &) {
                        cb({}, 0);
                    },
                    tenantId, language);
            },
            [cb](const drogon::orm::DrogonDbException &) {
                cb({}, 0);
            },
            tenantId, language);
    } else if (authorId > 0) {
        // Renumber params for no language filter
        std::string sql2 =
            "SELECT s.*, u.username FROM code_snippets s "
            "LEFT JOIN users u ON u.id = s.author_id "
            "WHERE s.tenant_id = $1 AND s.author_id = $2 "
            "ORDER BY s.created_at DESC LIMIT " + std::to_string(limit) + " OFFSET " + std::to_string(offset);
        std::string countSql2 =
            "SELECT COUNT(*) AS cnt FROM code_snippets s "
            "WHERE s.tenant_id = $1 AND s.author_id = $2";

        db->execSqlAsync(
            countSql2,
            [this, db, sql2, limit, offset, authorId, tenantId, cb](const drogon::orm::Result &countResult) {
                int total = countResult[0]["cnt"].as<int>();
                db->execSqlAsync(
                    sql2,
                    [this, total, cb](const drogon::orm::Result &result) {
                        std::vector<CodeSnippetDto> snippets;
                        for (const auto &row : result) {
                            snippets.push_back(rowToDto(row));
                        }
                        cb(snippets, total);
                    },
                    [cb](const drogon::orm::DrogonDbException &) {
                        cb({}, 0);
                    },
                    tenantId, authorId);
            },
            [cb](const drogon::orm::DrogonDbException &) {
                cb({}, 0);
            },
            tenantId, authorId);
    } else {
        std::string simpleSql =
            "SELECT s.*, u.username FROM code_snippets s "
            "LEFT JOIN users u ON u.id = s.author_id "
            "WHERE s.tenant_id = $1 "
            "ORDER BY s.created_at DESC LIMIT " + std::to_string(limit) + " OFFSET " + std::to_string(offset);
        std::string simpleCountSql =
            "SELECT COUNT(*) AS cnt FROM code_snippets s WHERE s.tenant_id = $1";

        db->execSqlAsync(
            simpleCountSql,
            [this, db, simpleSql, limit, offset, tenantId, cb](const drogon::orm::Result &countResult) {
                int total = countResult[0]["cnt"].as<int>();
                db->execSqlAsync(
                    simpleSql,
                    [this, total, cb](const drogon::orm::Result &result) {
                        std::vector<CodeSnippetDto> snippets;
                        for (const auto &row : result) {
                            snippets.push_back(rowToDto(row));
                        }
                        cb(snippets, total);
                    },
                    [cb](const drogon::orm::DrogonDbException &) {
                        cb({}, 0);
                    },
                    tenantId);
            },
            [cb](const drogon::orm::DrogonDbException &) {
                cb({}, 0);
            },
            tenantId);
    }
}

void CodeSnippetService::getSnippet(
    const DbClientPtr &db, int snippetId,
    std::function<void(const std::optional<CodeSnippetDto> &)> cb) {

    db->execSqlAsync(
        "SELECT s.*, u.username FROM code_snippets s "
        "LEFT JOIN users u ON u.id = s.author_id "
        "WHERE s.id = $1",
        [this, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(std::nullopt);
            } else {
                cb(rowToDto(result[0]));
            }
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb(std::nullopt);
        },
        snippetId);
}

void CodeSnippetService::createSnippet(
    const DbClientPtr &db, int tenantId, int authorId,
    const std::string &title, const std::string &code,
    const std::string &language, const std::string &visibility,
    std::function<void(bool success, int snippetId, const std::string &error)> cb) {

    db->execSqlAsync(
        "INSERT INTO code_snippets (tenant_id, author_id, title, code, language, visibility) "
        "VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
        [cb](const drogon::orm::Result &result) {
            int newId = result[0]["id"].as<int>();
            cb(true, newId, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, 0, e.base().what());
        },
        tenantId, authorId, title, code, language, visibility);
}

void CodeSnippetService::updateSnippet(
    const DbClientPtr &db, int snippetId, int userId,
    const std::string &title, const std::string &code,
    const std::string &language, const std::string &visibility,
    BoolCallback cb) {

    db->execSqlAsync(
        "UPDATE code_snippets SET title = $1, code = $2, language = $3, "
        "visibility = $4, updated_at = NOW() "
        "WHERE id = $5 AND author_id = $6",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Snippet not found or not owned by user");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        title, code, language, visibility, snippetId, userId);
}

void CodeSnippetService::deleteSnippet(
    const DbClientPtr &db, int snippetId, int userId,
    BoolCallback cb) {

    db->execSqlAsync(
        "DELETE FROM code_snippets WHERE id = $1 AND author_id = $2",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Snippet not found or not owned by user");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        snippetId, userId);
}

void CodeSnippetService::forkSnippet(
    const DbClientPtr &db, int snippetId, int userId, int tenantId,
    std::function<void(bool success, int newId, const std::string &error)> cb) {

    db->execSqlAsync(
        "SELECT * FROM code_snippets WHERE id = $1",
        [this, db, userId, tenantId, snippetId, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(false, 0, "Snippet not found");
                return;
            }

            auto title = result[0]["title"].as<std::string>() + " (fork)";
            auto code = result[0]["code"].as<std::string>();
            auto language = result[0]["language"].as<std::string>();

            db->execSqlAsync(
                "INSERT INTO code_snippets (tenant_id, author_id, title, code, language, "
                "visibility, forked_from) "
                "VALUES ($1, $2, $3, $4, $5, 'public', $6) RETURNING id",
                [cb](const drogon::orm::Result &insertResult) {
                    int newId = insertResult[0]["id"].as<int>();
                    cb(true, newId, "");
                },
                [cb](const drogon::orm::DrogonDbException &e) {
                    cb(false, 0, e.base().what());
                },
                tenantId, userId, title, code, language, snippetId);
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, 0, e.base().what());
        },
        snippetId);
}

void CodeSnippetService::recordExecution(
    const DbClientPtr &db, int snippetId, int userId,
    const std::string &output, int exitCode, int executionTimeMs,
    BoolCallback cb) {

    // Record execution and increment run_count
    db->execSqlAsync(
        "INSERT INTO snippet_executions (snippet_id, user_id, output, exit_code, execution_time_ms) "
        "VALUES ($1, $2, $3, $4, $5)",
        [db, snippetId, cb](const drogon::orm::Result &) {
            db->execSqlAsync(
                "UPDATE code_snippets SET run_count = run_count + 1 WHERE id = $1",
                [cb](const drogon::orm::Result &) {
                    cb(true, "");
                },
                [cb](const drogon::orm::DrogonDbException &e) {
                    cb(false, e.base().what());
                },
                snippetId);
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        snippetId, userId, output, exitCode, executionTimeMs);
}

} // namespace pyracms
