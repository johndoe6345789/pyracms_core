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
    std::string sha256;
    int tenantId{0};               // 0 = platform site
    std::string folder;            // path in the file manager, "" = top
    std::string visibility{"public"}; // or "authenticated" (signed in only)
    std::string storage{"local"};  // BlobStorage that holds the bytes
};

class FileService {
  public:
    using DbClientPtr = drogon::orm::DbClientPtr;
    using Callback = std::function<void(const std::optional<FileDto> &)>;
    using ListCallback = std::function<void(const std::vector<FileDto> &)>;
    using BoolCallback =
        std::function<void(bool success, const std::string &error)>;

    void uploadFile(const DbClientPtr &db, const std::string &filename,
                    const std::string &uuid, const std::string &mimetype,
                    int64_t size, bool isPicture, bool isVideo, BoolCallback cb,
                    const std::string &sha256 = "", int userId = 0,
                    int tenantId = 0,
                    const std::string &storage = "local");

    void getFile(const DbClientPtr &db, const std::string &uuid, Callback cb);

    void setVisibility(const DbClientPtr &db, const std::string &uuid,
                       const std::string &visibility, BoolCallback cb);

    void deleteFile(const DbClientPtr &db, const std::string &uuid,
                    BoolCallback cb);

    // scopeUser 0 = any uploader; scopeTenant < 0 = any site;
    // folder "*" = any folder, else exactly that one ("" = the top).
    void listFiles(const DbClientPtr &db, int limit, int offset, int scopeUser,
                   int scopeTenant, const std::string &folder,
                   ListCallback cb);

    void incrementDownloadCount(const DbClientPtr &db, const std::string &uuid,
                                BoolCallback cb);

  private:
    FileDto rowToDto(const drogon::orm::Row &row);
};

} // namespace pyracms
