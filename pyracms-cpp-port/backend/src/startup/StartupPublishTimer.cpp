#include "services/ArticleService.h"
#include "startup/Startup.h"

namespace pyracms {

// Scheduled publishing timer: check every 60 seconds
void startPublishTimer(drogon::HttpAppFramework &app) {
    app.getLoop()->runEvery(60.0, []() {
        auto db = drogon::app().getDbClient();
        static ArticleService articleService;
        articleService.publishDueArticles(
            db, [](bool success, const std::string &msg) {
                if (success && msg != "0 articles published") {
                    LOG_INFO << "Scheduled publishing: " << msg;
                }
            });
    });
}

} // namespace pyracms
