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
option(COVERAGE "Instrument code for gcov/gcovr" OFF)
if(COVERAGE)
    add_compile_options(--coverage -O0 -g)
    add_link_options(--coverage)
endif()

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

    src/controllers/ArticleTagController.cpp

    src/controllers/BoolReply.cpp

    src/controllers/CommentController.cpp

    src/controllers/DocsController.cpp

    src/controllers/FileController.cpp

    src/controllers/GalleryController.cpp

    src/controllers/GameDepController.cpp

    src/controllers/NotificationController.cpp

    src/controllers/SearchController.cpp

    src/controllers/SeoController.cpp

    src/controllers/SettingsController.cpp

    src/controllers/SocialController.cpp

    src/controllers/UserController.cpp

    src/controllers/WebSocketCollabController.cpp

    src/controllers/WebSocketNotificationController.cpp

    src/controllers/WebhookController.cpp

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

    src/controllers/auth/AuthControllerApplyReset.cpp

    src/controllers/auth/AuthControllerForgotPassword.cpp

    src/controllers/auth/AuthControllerLogin.cpp

    src/controllers/auth/AuthControllerMe.cpp

    src/controllers/auth/AuthControllerOauthCallback.cpp

    src/controllers/auth/AuthControllerOauthKnownUser.cpp

    src/controllers/auth/AuthControllerOauthLink.cpp

    src/controllers/auth/AuthControllerOauthNewUser.cpp

    src/controllers/auth/AuthControllerOauthProfile.cpp

    src/controllers/auth/AuthControllerOauthProviders.cpp

    src/controllers/auth/AuthControllerOauthUnlink.cpp

    src/controllers/auth/AuthControllerOauthUrl.cpp

    src/controllers/auth/AuthControllerRegisterDone.cpp

    src/controllers/auth/AuthControllerRegisterIn.cpp

    src/controllers/auth/AuthControllerRegisterUser.cpp

    src/controllers/auth/AuthControllerResetPassword.cpp

    src/controllers/auth/AuthControllerVerifyEmail.cpp

    src/controllers/auth/AuthControllerWithTenant.cpp

    src/controllers/forum/ForumControllerCreateCategory.cpp

    src/controllers/forum/ForumControllerCreateForum.cpp

    src/controllers/forum/ForumControllerCreatePost.cpp

    src/controllers/forum/ForumControllerCreateThread.cpp

    src/controllers/forum/ForumControllerDeleteCategory.cpp

    src/controllers/forum/ForumControllerDeleteForum.cpp

    src/controllers/forum/ForumControllerDeletePost.cpp

    src/controllers/forum/ForumControllerDeleteThread.cpp

    src/controllers/forum/ForumControllerGetForum.cpp

    src/controllers/forum/ForumControllerGetPostById.cpp

    src/controllers/forum/ForumControllerGetThread.cpp

    src/controllers/forum/ForumControllerListCategories.cpp

    src/controllers/forum/ForumControllerSetThreadFlags.cpp

    src/controllers/forum/ForumControllerUpdateCategory.cpp

    src/controllers/forum/ForumControllerUpdateForum.cpp

    src/controllers/forum/ForumControllerUpdatePost.cpp

    src/controllers/forum/ForumControllerUpdateThread.cpp

    src/controllers/forum/ForumControllerVotePost.cpp

    src/controllers/menu/MenuControllerCreateGroup.cpp

    src/controllers/menu/MenuControllerCreateItem.cpp

    src/controllers/menu/MenuControllerDeleteGroup.cpp

    src/controllers/menu/MenuControllerDeleteItem.cpp

    src/controllers/menu/MenuControllerListGroups.cpp

    src/controllers/menu/MenuControllerListItems.cpp

    src/controllers/menu/MenuControllerUpdateItem.cpp

    src/controllers/snippet/CodeSnippetControllerCreateSnippet.cpp

    src/controllers/snippet/CodeSnippetControllerDeleteSnippet.cpp

    src/controllers/snippet/CodeSnippetControllerForkSnippet.cpp

    src/controllers/snippet/CodeSnippetControllerGetSnippet.cpp

    src/controllers/snippet/CodeSnippetControllerListSnippets.cpp

    src/controllers/snippet/CodeSnippetControllerRunSnippet.cpp

    src/controllers/snippet/CodeSnippetControllerUpdateSnippet.cpp

    src/controllers/tenant/TenantControllerCreate.cpp

    src/controllers/tenant/TenantControllerGetBySlug.cpp

    src/controllers/tenant/TenantControllerList.cpp

    src/controllers/tenant/TenantControllerRemove.cpp

    src/filters/AdminFilter.cpp

    src/filters/JwtAuthFilter.cpp

    src/filters/TenantGuard.cpp

    src/filters/Viewer.cpp

    src/services/AnalyticsService.cpp

    src/services/ArticleService.cpp

    src/services/ArticleTagService.cpp

    src/services/AuthService.cpp

    src/services/CacheService.cpp

    src/services/CommentService.cpp

    src/services/DockerExecutionService.cpp

    src/services/ElasticsearchService.cpp

    src/services/EmailService.cpp

    src/services/FileService.cpp

    src/services/GalleryService.cpp

    src/services/GameDepService.cpp

    src/services/NotificationService.cpp

    src/services/OAuthService.cpp

    src/services/SearchService.cpp

    src/services/SeoService.cpp

    src/services/SettingsService.cpp

    src/services/SocialService.cpp

    src/services/WebhookService.cpp

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

    src/services/forum/ForumServiceCreateCategory.cpp

    src/services/forum/ForumServiceCreateForum.cpp

    src/services/forum/ForumServiceCreatePost.cpp

    src/services/forum/ForumServiceCreateThread.cpp

    src/services/forum/ForumServiceDeleteCategory.cpp

    src/services/forum/ForumServiceDeleteForum.cpp

    src/services/forum/ForumServiceDeletePost.cpp

    src/services/forum/ForumServiceDeleteThread.cpp

    src/services/forum/ForumServiceGetForum.cpp

    src/services/forum/ForumServiceGetPost.cpp

    src/services/forum/ForumServiceGetThread.cpp

    src/services/forum/ForumServiceListCategories.cpp

    src/services/forum/ForumServiceRowToCategoryDto.cpp

    src/services/forum/ForumServiceRowToForumDto.cpp

    src/services/forum/ForumServiceRowToPostDto.cpp

    src/services/forum/ForumServiceRowToThreadDto.cpp

    src/services/forum/ForumServiceSetThreadFlags.cpp

    src/services/forum/ForumServiceUpdateCategory.cpp

    src/services/forum/ForumServiceUpdateForum.cpp

    src/services/forum/ForumServiceUpdatePost.cpp

    src/services/forum/ForumServiceUpdateThread.cpp

    src/services/forum/ForumServiceVotePost.cpp

    src/services/menu/MenuServiceCreateMenuGroup.cpp

    src/services/menu/MenuServiceCreateMenuItem.cpp

    src/services/menu/MenuServiceDeleteMenuGroup.cpp

    src/services/menu/MenuServiceDeleteMenuItem.cpp

    src/services/menu/MenuServiceListMenuGroups.cpp

    src/services/menu/MenuServiceListMenuItems.cpp

    src/services/menu/MenuServiceRowToGroupDto.cpp

    src/services/menu/MenuServiceRowToItemDto.cpp

    src/services/menu/MenuServiceUpdateMenuItem.cpp

    src/services/snippet/CodeSnippetServiceCreateSnippet.cpp

    src/services/snippet/CodeSnippetServiceDeleteSnippet.cpp

    src/services/snippet/CodeSnippetServiceForkSnippet.cpp

    src/services/snippet/CodeSnippetServiceGetSnippet.cpp

    src/services/snippet/CodeSnippetServiceListSnippets.cpp

    src/services/snippet/CodeSnippetServiceRecordExecution.cpp

    src/services/snippet/CodeSnippetServiceRowToDto.cpp

    src/services/snippet/CodeSnippetServiceUpdateSnippet.cpp

    src/services/tenant/TenantServiceCreateTenant.cpp

    src/services/tenant/TenantServiceDeleteTenant.cpp

    src/services/tenant/TenantServiceFindBySlug.cpp

    src/services/tenant/TenantServiceIsValidDisplayName.cpp

    src/services/tenant/TenantServiceIsValidSlug.cpp

    src/services/tenant/TenantServiceListTenants.cpp

    src/services/tenant/TenantServiceNormalizeSlug.cpp

    src/services/tenant/TenantServiceRowToDto.cpp

    src/services/user/UserServiceCountUsers.cpp

    src/services/user/UserServiceCreateUser.cpp

    src/services/user/UserServiceDeleteUser.cpp

    src/services/user/UserServiceFindByEmail.cpp

    src/services/user/UserServiceFindById.cpp

    src/services/user/UserServiceFindByUsername.cpp

    src/services/user/UserServiceGetPasswordHash.cpp

    src/services/user/UserServiceGetUserRole.cpp

    src/services/user/UserServiceListUsers.cpp

    src/services/user/UserServiceRowToDto.cpp

    src/services/user/UserServiceSetUserRole.cpp

    src/services/user/UserServiceUpdatePassword.cpp

    src/services/user/UserServiceUpdateUser.cpp

)

add_library(pyracms_lib STATIC ${LIB_SOURCES})
target_link_libraries(pyracms_lib
    PUBLIC
    Drogon::Drogon
    nlohmann_json::nlohmann_json
    jwt-cpp::jwt-cpp
    CURL::libcurl
)
target_include_directories(pyracms_lib PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include)

# Main executable
add_executable(pyracms_server src/main.cpp)
# --whole-archive is required so Drogon controller static initializers
# (which register routes) are not stripped from the static lib by the linker.
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
