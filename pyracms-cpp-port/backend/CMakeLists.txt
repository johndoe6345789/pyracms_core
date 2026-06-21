cmake_minimum_required(VERSION 3.15)
project(pyracms_server VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# Conan-generated toolchain
if(EXISTS "${CMAKE_BINARY_DIR}/conan_toolchain.cmake")
    include("${CMAKE_BINARY_DIR}/conan_toolchain.cmake")
endif()

# Options
option(BUILD_TESTS "Build tests" ON)

# Find dependencies
find_package(Drogon REQUIRED)
find_package(jwt-cpp REQUIRED)
find_package(nlohmann_json REQUIRED)
find_package(CURL REQUIRED)

# Bridge: Conan exports jsoncpp_lib (lowercase) but Homebrew Drogon's
# DrogonTargets.cmake references Jsoncpp_lib (capital J). Create an alias.
if(TARGET jsoncpp_lib AND NOT TARGET Jsoncpp_lib)
    add_library(Jsoncpp_lib ALIAS jsoncpp_lib)
endif()

# Include directories
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/include)

# Backend library (shared between server and tests)
# Auto-generated from source files — run `python generate_cmake.py` to update
set(LIB_SOURCES

    src/controllers/AnalyticsController.cpp

    src/controllers/ArticleController.cpp

    src/controllers/article/ArticleControllerCreateArticle.cpp

    src/controllers/article/ArticleControllerDeleteArticle.cpp

    src/controllers/article/ArticleControllerGetArticle.cpp

    src/controllers/article/ArticleControllerGetRevision.cpp

    src/controllers/article/ArticleControllerListArticles.cpp

    src/controllers/article/ArticleControllerListRevisions.cpp

    src/controllers/article/ArticleControllerPublishArticle.cpp

    src/controllers/article/ArticleControllerRevertToRevision.cpp

    src/controllers/article/ArticleControllerScheduleArticle.cpp

    src/controllers/article/ArticleControllerSetTags.cpp

    src/controllers/article/ArticleControllerSwitchRenderer.cpp

    src/controllers/article/ArticleControllerTogglePrivate.cpp

    src/controllers/article/ArticleControllerUnpublishArticle.cpp

    src/controllers/article/ArticleControllerUpdateArticle.cpp

    src/controllers/article/ArticleControllerVoteArticle.cpp

    src/controllers/ArticleTagController.cpp

    src/controllers/AuthController.cpp

    src/controllers/CodeSnippetController.cpp

    src/controllers/CommentController.cpp

    src/controllers/DocsController.cpp

    src/controllers/FileController.cpp

    src/controllers/ForumController.cpp

    src/controllers/GalleryController.cpp

    src/controllers/GameDepController.cpp

    src/controllers/MenuController.cpp

    src/controllers/NotificationController.cpp

    src/controllers/SearchController.cpp

    src/controllers/SeoController.cpp

    src/controllers/SettingsController.cpp

    src/controllers/SocialController.cpp

    src/controllers/TenantController.cpp

    src/controllers/UserController.cpp

    src/controllers/WebSocketCollabController.cpp

    src/controllers/WebSocketNotificationController.cpp

    src/controllers/WebhookController.cpp

    src/filters/JwtAuthFilter.cpp

    src/services/AnalyticsService.cpp

    src/services/ArticleService.cpp

    src/services/article/ArticleServiceCreateArticle.cpp

    src/services/article/ArticleServiceDeleteArticle.cpp

    src/services/article/ArticleServiceGetArticle.cpp

    src/services/article/ArticleServiceGetRevision.cpp

    src/services/article/ArticleServiceListArticles.cpp

    src/services/article/ArticleServiceListArticlesByStatus.cpp

    src/services/article/ArticleServiceListRevisions.cpp

    src/services/article/ArticleServiceListTags.cpp

    src/services/article/ArticleServicePublishArticle.cpp

    src/services/article/ArticleServicePublishDueArticles.cpp

    src/services/article/ArticleServiceRevertToRevision.cpp

    src/services/article/ArticleServiceRowToArticleDto.cpp

    src/services/article/ArticleServiceRowToRevisionDto.cpp

    src/services/article/ArticleServiceScheduleArticle.cpp

    src/services/article/ArticleServiceSetTags.cpp

    src/services/article/ArticleServiceSwitchRenderer.cpp

    src/services/article/ArticleServiceTogglePrivate.cpp

    src/services/article/ArticleServiceUnpublishArticle.cpp

    src/services/article/ArticleServiceUpdateArticle.cpp

    src/services/article/ArticleServiceVoteArticle.cpp

    src/services/ArticleTagService.cpp

    src/services/AuthService.cpp

    src/services/CacheService.cpp

    src/services/CodeSnippetService.cpp

    src/services/CommentService.cpp

    src/services/DockerExecutionService.cpp

    src/services/ElasticsearchService.cpp

    src/services/EmailService.cpp

    src/services/FileService.cpp

    src/services/ForumService.cpp

    src/services/GalleryService.cpp

    src/services/GameDepService.cpp

    src/services/MenuService.cpp

    src/services/NotificationService.cpp

    src/services/OAuthService.cpp

    src/services/SearchService.cpp

    src/services/SeoService.cpp

    src/services/SettingsService.cpp

    src/services/SocialService.cpp

    src/services/TenantService.cpp

    src/services/UserService.cpp

    src/services/WebhookService.cpp

)

add_library(pyracms_lib STATIC ${LIB_SOURCES})
target_link_libraries(pyracms_lib
    PUBLIC
    Drogon::Drogon
    jwt-cpp::jwt-cpp
    nlohmann_json::nlohmann_json
    CURL::libcurl
)
target_include_directories(pyracms_lib PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include)

# Main executable
# --whole-archive is required so Drogon controller static initializers
# (which register routes) are not stripped from the static lib by the linker.
add_executable(pyracms_server src/main.cpp)
target_link_libraries(pyracms_server PRIVATE
    "-Wl,--whole-archive"
    pyracms_lib
    "-Wl,--no-whole-archive"
)

# Testing
if(BUILD_TESTS)
    enable_testing()
    add_subdirectory(tests)
endif()

# Installation
install(TARGETS pyracms_server RUNTIME DESTINATION bin)
