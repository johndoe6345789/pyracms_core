#pragma once

#include "controllers/HttpAliases.h"

#include <drogon/HttpController.h>

namespace pyracms {

// A random public photo of a site, for the gallery's headline image.
class GalleryFeaturedController
    : public drogon::HttpController<GalleryFeaturedController> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(GalleryFeaturedController::random, "/api/gallery/random",
                  drogon::Get);
    METHOD_LIST_END

    void random(HttpReq req, HttpCbRef callback);
};

} // namespace pyracms
