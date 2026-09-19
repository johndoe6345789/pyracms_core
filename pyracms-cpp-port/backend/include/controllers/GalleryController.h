#pragma once

#include "controllers/HttpAliases.h"
#include "services/GalleryService.h"

#include <drogon/HttpController.h>

namespace pyracms {

class GalleryController : public drogon::HttpController<GalleryController> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(GalleryController::listAlbums, "/api/gallery/albums",
                  drogon::Get);
    ADD_METHOD_TO(GalleryController::createAlbum, "/api/gallery/albums",
                  drogon::Post, PYR_JWT);
    ADD_METHOD_TO(GalleryController::getAlbum, "/api/gallery/albums/{id}",
                  drogon::Get);
    ADD_METHOD_TO(GalleryController::updateAlbum, "/api/gallery/albums/{id}",
                  drogon::Put, PYR_JWT, "pyracms::OwnerFilter");
    ADD_METHOD_TO(GalleryController::deleteAlbum, "/api/gallery/albums/{id}",
                  drogon::Delete, PYR_JWT, "pyracms::OwnerFilter");
    ADD_METHOD_TO(GalleryController::addPicture,
                  "/api/gallery/albums/{id}/pictures", drogon::Post, PYR_JWT,
                  "pyracms::OwnerFilter");
    ADD_METHOD_TO(GalleryController::getPicture, "/api/gallery/pictures/{id}",
                  drogon::Get);
    ADD_METHOD_TO(GalleryController::updatePicture,
                  "/api/gallery/pictures/{id}", drogon::Put, PYR_JWT,
                  "pyracms::OwnerFilter");
    ADD_METHOD_TO(GalleryController::deletePicture,
                  "/api/gallery/pictures/{id}", drogon::Delete, PYR_JWT,
                  "pyracms::OwnerFilter");
    ADD_METHOD_TO(GalleryController::setDefaultPicture,
                  "/api/gallery/pictures/{id}/default", drogon::Put, PYR_JWT,
                  "pyracms::OwnerFilter");
    ADD_METHOD_TO(GalleryController::votePicture,
                  "/api/gallery/pictures/{id}/vote", drogon::Post, PYR_JWT);
    METHOD_LIST_END

    void listAlbums(HttpReq req, HttpCbRef callback);

    void createAlbum(HttpReq req, HttpCbRef callback);

    void getAlbum(HttpReq req, HttpCbRef callback, int id);

    void updateAlbum(HttpReq req, HttpCbRef callback, int id);

    void deleteAlbum(HttpReq req, HttpCbRef callback, int id);

    void addPicture(HttpReq req, HttpCbRef callback, int id);

    void getPicture(HttpReq req, HttpCbRef callback, int id);

    void updatePicture(HttpReq req, HttpCbRef callback, int id);

    void deletePicture(HttpReq req, HttpCbRef callback, int id);

    void setDefaultPicture(HttpReq req, HttpCbRef callback, int id);

    void votePicture(HttpReq req, HttpCbRef callback, int id);

  private:
    GalleryService galleryService_;
};

} // namespace pyracms
