#pragma once

#include <drogon/drogon.h>
#include <functional>
#include <optional>
#include <string>

namespace pyracms {

struct FileDto {
    int id;
    std::string filename;
    std::string uuid;
    std::string mimetype;
    int64_t size;
    std::string createdAt;
    bool isPicture;
    bool isVideo;
    int downloadCount;
};

class FileService {
public:
    using DbClientPtr = drogon::orm::DbClientPtr;
    using Callback = std::function<void(const std::optional<FileDto> &)>;
    using ListCallback = std::function<void(const std::vector<FileDto> &)>;
    using BoolCallback = std::function<void(bool success, const std::string &error)>;

    void uploadFile(const DbClientPtr &db,
                    const std::string &filename,
                    const std::string &uuid,
                    const std::string &mimetype,
                    int64_t size,
                    bool isPicture,
                    bool isVideo,
                    BoolCallback cb);

    void getFile(const DbClientPtr &db,
                 const std::string &uuid,
                 Callback cb);

    void deleteFile(const DbClientPtr &db,
                    const std::string &uuid,
                    BoolCallback cb);

    void listFiles(const DbClientPtr &db, int limit, int offset,
                   ListCallback cb);

    void incrementDownloadCount(const DbClientPtr &db,
                                const std::string &uuid,
                                BoolCallback cb);

private:
    FileDto rowToDto(const drogon::orm::Row &row);
};

} // namespace pyracms
