#include "services/GameDepService.h"

namespace pyracms {

GameDepPageDto GameDepService::rowToPageDto(const drogon::orm::Row &row) {
    GameDepPageDto dto;
    dto.id = row["id"].as<int>();
    dto.type = row["type"].as<std::string>();
    dto.ownerId = row["owner_id"].as<int>();
    dto.name = row["name"].as<std::string>();
    dto.displayName = row["display_name"].as<std::string>();
    dto.description = row["description"].isNull() ? "" : row["description"].as<std::string>();
    dto.createdAt = row["created_at"].as<std::string>();
    dto.viewCount = row["view_count"].isNull() ? 0 : row["view_count"].as<int>();
    return dto;
}

GameDepRevisionDto GameDepService::rowToRevisionDto(const drogon::orm::Row &row) {
    GameDepRevisionDto dto;
    dto.id = row["id"].as<int>();
    dto.pageId = row["page_id"].as<int>();
    dto.fileId = row["file_id"].isNull() ? 0 : row["file_id"].as<int>();
    dto.moduleType = row["module_type"].isNull() ? "" : row["module_type"].as<std::string>();
    dto.version = row["version"].as<std::string>();
    dto.createdAt = row["created_at"].as<std::string>();
    dto.published = row["published"].as<bool>();
    return dto;
}

GameDepBinaryDto GameDepService::rowToBinaryDto(const drogon::orm::Row &row) {
    GameDepBinaryDto dto;
    dto.id = row["id"].as<int>();
    dto.revisionId = row["revision_id"].as<int>();
    dto.osId = row["os_id"].as<int>();
    dto.archId = row["arch_id"].as<int>();
    dto.fileId = row["file_id"].as<int>();
    dto.osName = row["os_name"].isNull() ? "" : row["os_name"].as<std::string>();
    dto.archName = row["arch_name"].isNull() ? "" : row["arch_name"].as<std::string>();
    return dto;
}

OperatingSystemDto GameDepService::rowToOsDto(const drogon::orm::Row &row) {
    OperatingSystemDto dto;
    dto.id = row["id"].as<int>();
    dto.name = row["name"].as<std::string>();
    dto.displayName = row["display_name"].as<std::string>();
    return dto;
}

ArchitectureDto GameDepService::rowToArchDto(const drogon::orm::Row &row) {
    ArchitectureDto dto;
    dto.id = row["id"].as<int>();
    dto.name = row["name"].as<std::string>();
    dto.displayName = row["display_name"].as<std::string>();
    return dto;
}

void GameDepService::listPages(const DbClientPtr &db,
                                const std::string &type,
                                int limit, int offset,
                                PageListCallback cb) {
    db->execSqlAsync(
        "SELECT * FROM gamedep_pages WHERE type = $1 "
        "ORDER BY created_at DESC LIMIT $2 OFFSET $3",
        [this, cb](const drogon::orm::Result &result) {
            std::vector<GameDepPageDto> pages;
            pages.reserve(result.size());
            for (const auto &row : result) {
                pages.push_back(rowToPageDto(row));
            }
            cb(pages);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb({});
        },
        type, limit, offset);
}

void GameDepService::createPage(const DbClientPtr &db,
                                 const std::string &type,
                                 const std::string &name,
                                 const std::string &displayName,
                                 const std::string &description,
                                 int ownerId,
                                 BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO gamedep_pages (type, name, display_name, description, "
        "owner_id, view_count, created_at) "
        "VALUES ($1, $2, $3, $4, $5, 0, NOW()) RETURNING id",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        type, name, displayName, description, ownerId);
}

void GameDepService::getPage(
    const DbClientPtr &db,
    const std::string &type,
    const std::string &name,
    std::function<void(const std::optional<GameDepPageDto> &,
                       const std::vector<GameDepRevisionDto> &)> cb) {
    db->execSqlAsync(
        "SELECT * FROM gamedep_pages WHERE type = $1 AND name = $2",
        [this, db, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(std::nullopt, {});
                return;
            }
            auto page = rowToPageDto(result[0]);
            auto pageId = page.id;
            db->execSqlAsync(
                "SELECT * FROM gamedep_revisions WHERE page_id = $1 "
                "ORDER BY created_at DESC",
                [this, cb, page](const drogon::orm::Result &revResult) {
                    std::vector<GameDepRevisionDto> revisions;
                    revisions.reserve(revResult.size());
                    for (const auto &row : revResult) {
                        revisions.push_back(rowToRevisionDto(row));
                    }
                    cb(page, revisions);
                },
                [cb, page](const drogon::orm::DrogonDbException &) {
                    cb(page, {});
                },
                pageId);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb(std::nullopt, {});
        },
        type, name);
}

void GameDepService::updatePage(const DbClientPtr &db,
                                 const std::string &type,
                                 const std::string &name,
                                 const std::string &displayName,
                                 const std::string &description,
                                 BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE gamedep_pages SET display_name = $1, description = $2 "
        "WHERE type = $3 AND name = $4",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Page not found");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        displayName, description, type, name);
}

void GameDepService::deletePage(const DbClientPtr &db,
                                 const std::string &type,
                                 const std::string &name,
                                 BoolCallback cb) {
    db->execSqlAsync(
        "DELETE FROM gamedep_pages WHERE type = $1 AND name = $2",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Page not found");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        type, name);
}

void GameDepService::createRevision(const DbClientPtr &db,
                                     int pageId,
                                     const std::string &version,
                                     const std::string &moduleType,
                                     IdCallback cb) {
    db->execSqlAsync(
        "INSERT INTO gamedep_revisions (page_id, version, module_type, "
        "published, created_at) "
        "VALUES ($1, $2, $3, false, NOW()) RETURNING id",
        [cb](const drogon::orm::Result &result) {
            cb(true, result[0]["id"].as<int>(), "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, 0, e.base().what());
        },
        pageId, version, moduleType);
}

void GameDepService::updateRevision(const DbClientPtr &db,
                                     int revisionId,
                                     const std::string &version,
                                     const std::string &moduleType,
                                     BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE gamedep_revisions SET version = $1, module_type = $2 "
        "WHERE id = $3",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Revision not found");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        version, moduleType, revisionId);
}

void GameDepService::deleteRevision(const DbClientPtr &db,
                                     int revisionId,
                                     BoolCallback cb) {
    db->execSqlAsync(
        "DELETE FROM gamedep_revisions WHERE id = $1",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Revision not found");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        revisionId);
}

void GameDepService::togglePublish(const DbClientPtr &db,
                                    int revisionId,
                                    BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE gamedep_revisions SET published = NOT published "
        "WHERE id = $1",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Revision not found");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        revisionId);
}

void GameDepService::uploadSource(const DbClientPtr &db,
                                   int revisionId,
                                   int fileId,
                                   BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE gamedep_revisions SET file_id = $1 WHERE id = $2",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Revision not found");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        fileId, revisionId);
}

void GameDepService::addBinary(const DbClientPtr &db,
                                int revisionId,
                                int osId, int archId, int fileId,
                                IdCallback cb) {
    db->execSqlAsync(
        "INSERT INTO gamedep_binaries (revision_id, os_id, arch_id, file_id) "
        "VALUES ($1, $2, $3, $4) RETURNING id",
        [cb](const drogon::orm::Result &result) {
            cb(true, result[0]["id"].as<int>(), "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, 0, e.base().what());
        },
        revisionId, osId, archId, fileId);
}

void GameDepService::updateBinary(const DbClientPtr &db,
                                   int binaryId,
                                   int osId, int archId,
                                   BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE gamedep_binaries SET os_id = $1, arch_id = $2 "
        "WHERE id = $3",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Binary not found");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        osId, archId, binaryId);
}

void GameDepService::deleteBinary(const DbClientPtr &db,
                                   int binaryId,
                                   BoolCallback cb) {
    db->execSqlAsync(
        "DELETE FROM gamedep_binaries WHERE id = $1",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Binary not found");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        binaryId);
}

void GameDepService::listBinaries(const DbClientPtr &db,
                                   int revisionId,
                                   BinaryListCallback cb) {
    db->execSqlAsync(
        "SELECT b.*, o.name AS os_name, a.name AS arch_name "
        "FROM gamedep_binaries b "
        "LEFT JOIN operating_systems o ON o.id = b.os_id "
        "LEFT JOIN architectures a ON a.id = b.arch_id "
        "WHERE b.revision_id = $1 ORDER BY b.id",
        [this, cb](const drogon::orm::Result &result) {
            std::vector<GameDepBinaryDto> binaries;
            binaries.reserve(result.size());
            for (const auto &row : result) {
                binaries.push_back(rowToBinaryDto(row));
            }
            cb(binaries);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb({});
        },
        revisionId);
}

void GameDepService::addDependency(const DbClientPtr &db,
                                    int pageId,
                                    int depRevisionId,
                                    BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO gamedep_dependencies (page_id, dep_revision_id) "
        "VALUES ($1, $2)",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        pageId, depRevisionId);
}

void GameDepService::removeDependency(const DbClientPtr &db,
                                       int dependencyId,
                                       BoolCallback cb) {
    db->execSqlAsync(
        "DELETE FROM gamedep_dependencies WHERE id = $1",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Dependency not found");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        dependencyId);
}

void GameDepService::setTags(const DbClientPtr &db,
                              int pageId,
                              const std::vector<std::string> &tags,
                              BoolCallback cb) {
    // First delete existing tags, then insert new ones
    db->execSqlAsync(
        "DELETE FROM gamedep_tags WHERE page_id = $1",
        [db, pageId, tags, cb, this](const drogon::orm::Result &) {
            if (tags.empty()) {
                cb(true, "");
                return;
            }
            // Build a multi-row insert
            std::string sql = "INSERT INTO gamedep_tags (page_id, tag) VALUES ";
            std::vector<std::string> placeholders;
            int paramIdx = 1;
            for (size_t i = 0; i < tags.size(); ++i) {
                placeholders.push_back(
                    "($" + std::to_string(paramIdx++) + ", $" +
                    std::to_string(paramIdx++) + ")");
            }
            for (size_t i = 0; i < placeholders.size(); ++i) {
                if (i > 0) sql += ", ";
                sql += placeholders[i];
            }

            // Build params: alternating pageId and tag
            // Due to Drogon's variadic template approach, we handle
            // up to a reasonable number of tags
            if (tags.size() == 1) {
                db->execSqlAsync(sql,
                    [cb](const drogon::orm::Result &) { cb(true, ""); },
                    [cb](const drogon::orm::DrogonDbException &e) { cb(false, e.base().what()); },
                    pageId, tags[0]);
            } else if (tags.size() == 2) {
                db->execSqlAsync(sql,
                    [cb](const drogon::orm::Result &) { cb(true, ""); },
                    [cb](const drogon::orm::DrogonDbException &e) { cb(false, e.base().what()); },
                    pageId, tags[0], pageId, tags[1]);
            } else if (tags.size() == 3) {
                db->execSqlAsync(sql,
                    [cb](const drogon::orm::Result &) { cb(true, ""); },
                    [cb](const drogon::orm::DrogonDbException &e) { cb(false, e.base().what()); },
                    pageId, tags[0], pageId, tags[1], pageId, tags[2]);
            } else if (tags.size() == 4) {
                db->execSqlAsync(sql,
                    [cb](const drogon::orm::Result &) { cb(true, ""); },
                    [cb](const drogon::orm::DrogonDbException &e) { cb(false, e.base().what()); },
                    pageId, tags[0], pageId, tags[1], pageId, tags[2],
                    pageId, tags[3]);
            } else if (tags.size() == 5) {
                db->execSqlAsync(sql,
                    [cb](const drogon::orm::Result &) { cb(true, ""); },
                    [cb](const drogon::orm::DrogonDbException &e) { cb(false, e.base().what()); },
                    pageId, tags[0], pageId, tags[1], pageId, tags[2],
                    pageId, tags[3], pageId, tags[4]);
            } else {
                // For larger tag sets, insert one at a time
                auto remaining = std::make_shared<int>(static_cast<int>(tags.size()));
                auto failed = std::make_shared<bool>(false);
                for (const auto &tag : tags) {
                    db->execSqlAsync(
                        "INSERT INTO gamedep_tags (page_id, tag) VALUES ($1, $2)",
                        [cb, remaining, failed](const drogon::orm::Result &) {
                            (*remaining)--;
                            if (*remaining == 0 && !*failed) {
                                cb(true, "");
                            }
                        },
                        [cb, remaining, failed](const drogon::orm::DrogonDbException &e) {
                            if (!*failed) {
                                *failed = true;
                                cb(false, e.base().what());
                            }
                        },
                        pageId, tag);
                }
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        pageId);
}

void GameDepService::vote(const DbClientPtr &db,
                           int pageId, int userId, bool isLike,
                           BoolCallback cb) {
    // Upsert: insert or update the vote
    db->execSqlAsync(
        "INSERT INTO gamedep_votes (page_id, user_id, is_like) "
        "VALUES ($1, $2, $3) "
        "ON CONFLICT (page_id, user_id) DO UPDATE SET is_like = $3",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        pageId, userId, isLike);
}

void GameDepService::listOperatingSystems(const DbClientPtr &db,
                                           OsListCallback cb) {
    db->execSqlAsync(
        "SELECT * FROM operating_systems ORDER BY name",
        [this, cb](const drogon::orm::Result &result) {
            std::vector<OperatingSystemDto> items;
            items.reserve(result.size());
            for (const auto &row : result) {
                items.push_back(rowToOsDto(row));
            }
            cb(items);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb({});
        });
}

void GameDepService::listArchitectures(const DbClientPtr &db,
                                        ArchListCallback cb) {
    db->execSqlAsync(
        "SELECT * FROM architectures ORDER BY name",
        [this, cb](const drogon::orm::Result &result) {
            std::vector<ArchitectureDto> items;
            items.reserve(result.size());
            for (const auto &row : result) {
                items.push_back(rowToArchDto(row));
            }
            cb(items);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb({});
        });
}

void GameDepService::getFullCatalogJson(const DbClientPtr &db,
                                         JsonCallback cb) {
    // Fetch all published pages with their revisions, binaries, tags, deps
    db->execSqlAsync(
        "SELECT * FROM gamedep_pages ORDER BY type, name",
        [this, db, cb](const drogon::orm::Result &pageResult) {
            auto catalog = std::make_shared<Json::Value>(Json::objectValue);
            (*catalog)["games"] = Json::Value(Json::arrayValue);
            (*catalog)["deps"] = Json::Value(Json::arrayValue);

            if (pageResult.empty()) {
                cb(*catalog);
                return;
            }

            auto remaining = std::make_shared<int>(static_cast<int>(pageResult.size()));
            auto pages = std::make_shared<std::vector<GameDepPageDto>>();
            pages->reserve(pageResult.size());
            for (const auto &row : pageResult) {
                pages->push_back(rowToPageDto(row));
            }

            for (size_t i = 0; i < pages->size(); ++i) {
                const auto &page = (*pages)[i];
                auto pageIdx = i;
                auto pageId = page.id;

                // Fetch revisions for this page
                db->execSqlAsync(
                    "SELECT * FROM gamedep_revisions WHERE page_id = $1 "
                    "AND published = true ORDER BY created_at DESC",
                    [this, db, cb, catalog, remaining, pages, pageIdx, pageId]
                    (const drogon::orm::Result &revResult) {
                        const auto &page = (*pages)[pageIdx];
                        Json::Value pageJson;
                        pageJson["id"] = page.id;
                        pageJson["name"] = page.name;
                        pageJson["displayName"] = page.displayName;
                        pageJson["description"] = page.description;
                        pageJson["ownerId"] = page.ownerId;
                        pageJson["viewCount"] = page.viewCount;
                        pageJson["createdAt"] = page.createdAt;

                        Json::Value revisionsJson(Json::arrayValue);
                        for (const auto &row : revResult) {
                            auto rev = rowToRevisionDto(row);
                            Json::Value revJson;
                            revJson["id"] = rev.id;
                            revJson["version"] = rev.version;
                            revJson["moduleType"] = rev.moduleType;
                            revJson["fileId"] = rev.fileId;
                            revJson["published"] = rev.published;
                            revJson["createdAt"] = rev.createdAt;
                            revisionsJson.append(revJson);
                        }
                        pageJson["revisions"] = revisionsJson;

                        if (page.type == "game") {
                            (*catalog)["games"].append(pageJson);
                        } else {
                            (*catalog)["deps"].append(pageJson);
                        }

                        (*remaining)--;
                        if (*remaining == 0) {
                            cb(*catalog);
                        }
                    },
                    [cb, catalog, remaining]
                    (const drogon::orm::DrogonDbException &) {
                        (*remaining)--;
                        if (*remaining == 0) {
                            cb(*catalog);
                        }
                    },
                    pageId);
            }
        },
        [cb](const drogon::orm::DrogonDbException &) {
            Json::Value empty(Json::objectValue);
            empty["games"] = Json::Value(Json::arrayValue);
            empty["deps"] = Json::Value(Json::arrayValue);
            cb(empty);
        });
}

} // namespace pyracms
