#pragma once

#include <drogon/HttpController.h>
#include "services/GalleryService.h"

namespace pyracms {

class GalleryController : public drogon::HttpController<GalleryController> {
public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(GalleryController::listAlbums, "/api/gallery/albums", drogon::Get);
    ADD_METHOD_TO(GalleryController::createAlbum, "/api/gallery/albums", drogon::Post, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(GalleryController::getAlbum, "/api/gallery/albums/{id}", drogon::Get);
    ADD_METHOD_TO(GalleryController::updateAlbum, "/api/gallery/albums/{id}", drogon::Put, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(GalleryController::deleteAlbum, "/api/gallery/albums/{id}", drogon::Delete, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(GalleryController::addPicture, "/api/gallery/albums/{id}/pictures", drogon::Post, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(GalleryController::getPicture, "/api/gallery/pictures/{id}", drogon::Get);
    ADD_METHOD_TO(GalleryController::updatePicture, "/api/gallery/pictures/{id}", drogon::Put, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(GalleryController::deletePicture, "/api/gallery/pictures/{id}", drogon::Delete, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(GalleryController::setDefaultPicture, "/api/gallery/pictures/{id}/default", drogon::Put, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(GalleryController::votePicture, "/api/gallery/pictures/{id}/vote", drogon::Post, "pyracms::JwtAuthFilter");
    METHOD_LIST_END

    void listAlbums(const drogon::HttpRequestPtr &req,
                    std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void createAlbum(const drogon::HttpRequestPtr &req,
                     std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void getAlbum(const drogon::HttpRequestPtr &req,
                  std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                  int id);

    void updateAlbum(const drogon::HttpRequestPtr &req,
                     std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                     int id);

    void deleteAlbum(const drogon::HttpRequestPtr &req,
                     std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                     int id);

    void addPicture(const drogon::HttpRequestPtr &req,
                    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                    int id);

    void getPicture(const drogon::HttpRequestPtr &req,
                    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                    int id);

    void updatePicture(const drogon::HttpRequestPtr &req,
                       std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                       int id);

    void deletePicture(const drogon::HttpRequestPtr &req,
                       std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                       int id);

    void setDefaultPicture(const drogon::HttpRequestPtr &req,
                           std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                           int id);

    void votePicture(const drogon::HttpRequestPtr &req,
                     std::function<void(const drogon::HttpResponsePtr &)> &&callback,
                     int id);

private:
    GalleryService galleryService_;
};

} // namespace pyracms
