#pragma once

#include <drogon/drogon.h>
#include <functional>
#include <optional>
#include <string>
#include <vector>

namespace pyracms {

struct GameDepPageDto {
    int id;
    std::string type;
    int ownerId;
    std::string name;
    std::string displayName;
    std::string description;
    std::string createdAt;
    int viewCount;
};

struct GameDepRevisionDto {
    int id;
    int pageId;
    int fileId;
    std::string moduleType;
    std::string version;
    std::string createdAt;
    bool published;
};

struct GameDepBinaryDto {
    int id;
    int revisionId;
    int osId;
    int archId;
    int fileId;
    std::string osName;
    std::string archName;
};

struct OperatingSystemDto {
    int id;
    std::string name;
    std::string displayName;
};

struct ArchitectureDto {
    int id;
    std::string name;
    std::string displayName;
};

class GameDepService {
public:
    using DbClientPtr = drogon::orm::DbClientPtr;
    using BoolCallback = std::function<void(bool, const std::string &)>;
    using PageCallback = std::function<void(const std::optional<GameDepPageDto> &)>;
    using PageListCallback = std::function<void(const std::vector<GameDepPageDto> &)>;
    using RevisionCallback = std::function<void(const std::optional<GameDepRevisionDto> &)>;
    using RevisionListCallback = std::function<void(const std::vector<GameDepRevisionDto> &)>;
    using BinaryListCallback = std::function<void(const std::vector<GameDepBinaryDto> &)>;
    using OsListCallback = std::function<void(const std::vector<OperatingSystemDto> &)>;
    using ArchListCallback = std::function<void(const std::vector<ArchitectureDto> &)>;
    using JsonCallback = std::function<void(const Json::Value &)>;
    using IdCallback = std::function<void(bool, int, const std::string &)>;

    void listPages(const DbClientPtr &db,
                   const std::string &type,
                   int limit, int offset,
                   PageListCallback cb);

    void createPage(const DbClientPtr &db,
                    const std::string &type,
                    const std::string &name,
                    const std::string &displayName,
                    const std::string &description,
                    int ownerId,
                    BoolCallback cb);

    void getPage(const DbClientPtr &db,
                 const std::string &type,
                 const std::string &name,
                 std::function<void(const std::optional<GameDepPageDto> &,
                                    const std::vector<GameDepRevisionDto> &)> cb);

    void updatePage(const DbClientPtr &db,
                    const std::string &type,
                    const std::string &name,
                    const std::string &displayName,
                    const std::string &description,
                    BoolCallback cb);

    void deletePage(const DbClientPtr &db,
                    const std::string &type,
                    const std::string &name,
                    BoolCallback cb);

    void createRevision(const DbClientPtr &db,
                        int pageId,
                        const std::string &version,
                        const std::string &moduleType,
                        IdCallback cb);

    void updateRevision(const DbClientPtr &db,
                        int revisionId,
                        const std::string &version,
                        const std::string &moduleType,
                        BoolCallback cb);

    void deleteRevision(const DbClientPtr &db,
                        int revisionId,
                        BoolCallback cb);

    void togglePublish(const DbClientPtr &db,
                       int revisionId,
                       BoolCallback cb);

    void uploadSource(const DbClientPtr &db,
                      int revisionId,
                      int fileId,
                      BoolCallback cb);

    void addBinary(const DbClientPtr &db,
                   int revisionId,
                   int osId, int archId, int fileId,
                   IdCallback cb);

    void updateBinary(const DbClientPtr &db,
                      int binaryId,
                      int osId, int archId,
                      BoolCallback cb);

    void deleteBinary(const DbClientPtr &db,
                      int binaryId,
                      BoolCallback cb);

    void listBinaries(const DbClientPtr &db,
                      int revisionId,
                      BinaryListCallback cb);

    void addDependency(const DbClientPtr &db,
                       int pageId,
                       int depRevisionId,
                       BoolCallback cb);

    void removeDependency(const DbClientPtr &db,
                          int dependencyId,
                          BoolCallback cb);

    void setTags(const DbClientPtr &db,
                 int pageId,
                 const std::vector<std::string> &tags,
                 BoolCallback cb);

    void vote(const DbClientPtr &db,
              int pageId, int userId, bool isLike,
              BoolCallback cb);

    void listOperatingSystems(const DbClientPtr &db,
                              OsListCallback cb);

    void listArchitectures(const DbClientPtr &db,
                           ArchListCallback cb);

    void getFullCatalogJson(const DbClientPtr &db,
                            JsonCallback cb);

private:
    GameDepPageDto rowToPageDto(const drogon::orm::Row &row);
    GameDepRevisionDto rowToRevisionDto(const drogon::orm::Row &row);
    GameDepBinaryDto rowToBinaryDto(const drogon::orm::Row &row);
    OperatingSystemDto rowToOsDto(const drogon::orm::Row &row);
    ArchitectureDto rowToArchDto(const drogon::orm::Row &row);
};

} // namespace pyracms
