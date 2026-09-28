#pragma once

#include "services/VideoDtos.h"

#include <drogon/drogon.h>
#include <functional>
#include <optional>
#include <string>
#include <vector>

namespace pyracms {

// Which video a detail read may see.
struct VideoLookup {
    int tenant{0};   // 0 = any site
    int viewerId{0}; // 0 = anonymous
    bool countView{false};
    bool anyVisibility{false}; // private videos of others too
};

struct VoteTally {
    int likes{0};
    int dislikes{0};
    std::string myVote;
};

class VideoService {
  public:
    using DbClientPtr = drogon::orm::DbClientPtr;
    using ListCallback =
        std::function<void(const std::vector<VideoDto> &, int total)>;
    using VideoCallback = std::function<void(const std::optional<VideoDto> &)>;
    using CreateCallback =
        std::function<void(bool ok, int id, const std::string &error)>;
    using BoolCallback =
        std::function<void(bool success, const std::string &error)>;
    // ok=false with "Not found" when the video is missing or hidden.
    using VoteCallback = std::function<void(bool ok, const VoteTally &tally,
                                            const std::string &error)>;

    void listVideos(const DbClientPtr &db, const VideoQuery &q,
                    ListCallback cb);
    void getVideo(const DbClientPtr &db, int id, const VideoLookup &look,
                  VideoCallback cb);
    // The file must be an MP4/WebM video the user uploaded to the site.
    void createVideo(const DbClientPtr &db, int tenantId, int userId,
                     const std::string &fileUuid, const VideoInput &in,
                     CreateCallback cb);
    void updateVideo(const DbClientPtr &db, int id, const VideoInput &in,
                     BoolCallback cb);
    void deleteVideo(const DbClientPtr &db, int id, BoolCallback cb);
    // isLike nullopt clears the user's vote. tenant 0 = any site.
    void vote(const DbClientPtr &db, int id, int userId, int tenant,
              std::optional<bool> isLike, VoteCallback cb);

  private:
    void tally(const DbClientPtr &db, int id, int userId, int tenant,
               VoteCallback cb);
};

} // namespace pyracms
