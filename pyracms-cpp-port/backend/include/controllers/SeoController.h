#pragma once

#include <drogon/HttpController.h>
#include "services/SeoService.h"

namespace pyracms {

class SeoController : public drogon::HttpController<SeoController> {
public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(SeoController::sitemap, "/api/sitemap.xml", drogon::Get);
    ADD_METHOD_TO(SeoController::rssFeed, "/api/rss.xml", drogon::Get);
    ADD_METHOD_TO(SeoController::atomFeed, "/api/atom.xml", drogon::Get);
    ADD_METHOD_TO(SeoController::articleJsonLd, "/api/articles/{name}/jsonld", drogon::Get);
    ADD_METHOD_TO(SeoController::articleOpenGraph, "/api/articles/{name}/opengraph", drogon::Get);
    METHOD_LIST_END

    void sitemap(const drogon::HttpRequestPtr &req,
                 std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void rssFeed(const drogon::HttpRequestPtr &req,
                 std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void atomFeed(const drogon::HttpRequestPtr &req,
                  std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void articleJsonLd(const drogon::HttpRequestPtr &req,
                       std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                       const std::string &name);

    void articleOpenGraph(const drogon::HttpRequestPtr &req,
                          std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                          const std::string &name);

private:
    SeoService seoService_;
};

} // namespace pyracms
