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

    src/controllers/ArticleController.cpp

    src/controllers/ArticleTagController.cpp

    src/controllers/BoolReply.cpp

    src/controllers/WsAuth.cpp

    src/controllers/activity/ActivityControllerList.cpp

    src/controllers/analytics/AnalyticsControllerGetPageViews.cpp

    src/controllers/analytics/AnalyticsControllerGetSearchQueries.cpp

    src/controllers/analytics/AnalyticsControllerGetSummary.cpp

    src/controllers/analytics/AnalyticsControllerGetTopContent.cpp

    src/controllers/analytics/AnalyticsControllerGetTrafficSources.cpp

    src/controllers/analytics/AnalyticsControllerTrackPageView.cpp

    src/controllers/article/ArticleControllerCreateArticle.cpp

    src/controllers/article/ArticleControllerDeleteArticle.cpp

    src/controllers/article/ArticleControllerGetArticle.cpp

    src/controllers/article/ArticleControllerGetRevision.cpp

    src/controllers/article/ArticleControllerJson.cpp

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

    src/controllers/audit/AuditControllerList.cpp

    src/controllers/auth/AuthControllerApplyReset.cpp

    src/controllers/auth/AuthControllerFinishLogin.cpp

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

    src/controllers/comment/CommentControllerCreateComment.cpp

    src/controllers/comment/CommentControllerDeleteComment.cpp

    src/controllers/comment/CommentControllerGetComments.cpp

    src/controllers/comment/CommentControllerUpdateComment.cpp

    src/controllers/comment/CommentControllerVoteComment.cpp

    src/controllers/docs/DocsControllerOpenapiSpec.cpp

    src/controllers/docs/DocsControllerSwaggerUi.cpp

    src/controllers/file/FileControllerBlob.cpp

    src/controllers/file/FileControllerDownload.cpp
    src/controllers/file/FileControllerServe.cpp
    src/controllers/file/FileControllerThumbnail.cpp

    src/controllers/file/FileControllerHelpers.cpp

    src/controllers/file/FileControllerJson.cpp

    src/controllers/file/FileControllerManage.cpp

    src/controllers/file/FileControllerUpload.cpp

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

    src/controllers/forum/ForumExtrasMove.cpp

    src/controllers/forum/ForumExtrasReact.cpp

    src/controllers/forum/ForumExtrasStats.cpp

    src/controllers/forum/ForumThreadJson.cpp

    src/controllers/gallery/GalleryControllerAddPicture.cpp

    src/controllers/gallery/GalleryControllerCreateAlbum.cpp

    src/controllers/gallery/GalleryControllerDeleteAlbum.cpp

    src/controllers/gallery/GalleryControllerDeletePicture.cpp

    src/controllers/gallery/GalleryControllerGetAlbum.cpp

    src/controllers/gallery/GalleryControllerGetPicture.cpp

    src/controllers/gallery/GalleryControllerListAlbums.cpp

    src/controllers/gallery/GalleryControllerSetDefaultPicture.cpp

    src/controllers/gallery/GalleryControllerUpdateAlbum.cpp

    src/controllers/gallery/GalleryControllerUpdatePicture.cpp

    src/controllers/gallery/GalleryControllerVotePicture.cpp

    src/controllers/gamedep/GameDepAttachControllerDeps.cpp

    src/controllers/gamedep/GameDepAttachControllerMeta.cpp

    src/controllers/gamedep/GameDepControllerPages.cpp

    src/controllers/gamedep/GameDepControllerWrites.cpp

    src/controllers/gamedep/GameDepRevisionControllerBinaries.cpp

    src/controllers/gamedep/GameDepRevisionControllerRevisions.cpp

    src/controllers/gamedep/GdHttp.cpp

    src/controllers/menu/MenuControllerCreateGroup.cpp

    src/controllers/menu/MenuControllerCreateItem.cpp

    src/controllers/menu/MenuControllerDeleteGroup.cpp

    src/controllers/menu/MenuControllerDeleteItem.cpp

    src/controllers/menu/MenuControllerListGroups.cpp

    src/controllers/menu/MenuControllerListItems.cpp

    src/controllers/menu/MenuControllerUpdateItem.cpp

    src/controllers/notification/NotificationControllerDeleteNotification.cpp

    src/controllers/notification/NotificationControllerList.cpp

    src/controllers/notification/NotificationControllerMarkAllRead.cpp

    src/controllers/notification/NotificationControllerMarkRead.cpp

    src/controllers/notification/NotificationControllerUnreadCount.cpp

    src/controllers/search/SearchControllerAutocomplete.cpp

    src/controllers/search/SearchControllerSearch.cpp

    src/controllers/search/SearchItemJson.cpp

    src/controllers/seo/SeoControllerArticleJsonLd.cpp

    src/controllers/seo/SeoControllerArticleOpenGraph.cpp

    src/controllers/seo/SeoControllerAtomFeed.cpp

    src/controllers/seo/SeoControllerRssFeed.cpp

    src/controllers/seo/SeoControllerSitemap.cpp

    src/controllers/settings/SettingsControllerCreateOrUpdate.cpp

    src/controllers/settings/SettingsControllerGetByName.cpp

    src/controllers/settings/SettingsControllerList.cpp

    src/controllers/settings/SettingsControllerRemove.cpp

    src/controllers/snippet/CodeSnippetControllerCreateSnippet.cpp

    src/controllers/snippet/CodeSnippetControllerDeleteSnippet.cpp

    src/controllers/snippet/CodeSnippetControllerForkSnippet.cpp

    src/controllers/snippet/CodeSnippetControllerGetSnippet.cpp

    src/controllers/snippet/CodeSnippetControllerListSnippets.cpp

    src/controllers/snippet/CodeSnippetControllerRunSnippet.cpp

    src/controllers/snippet/CodeSnippetControllerUpdateSnippet.cpp

    src/controllers/social/SocialControllerFollow.cpp

    src/controllers/social/SocialControllerGetAchievements.cpp

    src/controllers/social/SocialControllerGetActivity.cpp

    src/controllers/social/SocialControllerGetFollowers.cpp

    src/controllers/social/SocialControllerGetFollowing.cpp

    src/controllers/social/SocialControllerGetReputation.cpp

    src/controllers/social/SocialControllerUnfollow.cpp

    src/controllers/tenant/TenantControllerCreate.cpp

    src/controllers/tenant/TenantControllerGetBySlug.cpp

    src/controllers/tenant/TenantControllerList.cpp

    src/controllers/tenant/TenantControllerRemove.cpp

    src/controllers/user/UserAdminGate.cpp

    src/controllers/user/UserAdminSteps.cpp

    src/controllers/user/UserAdminUpdate.cpp

    src/controllers/user/UserControllerBan.cpp

    src/controllers/user/UserControllerChangePassword.cpp

    src/controllers/user/UserControllerDelete.cpp

    src/controllers/user/UserControllerGetById.cpp

    src/controllers/user/UserControllerList.cpp

    src/controllers/user/UserControllerRole.cpp

    src/controllers/user/UserControllerUpdate.cpp

    src/controllers/webhook/WebhookControllerCreate.cpp

    src/controllers/webhook/WebhookControllerDelete.cpp

    src/controllers/webhook/WebhookControllerDeliveries.cpp

    src/controllers/webhook/WebhookControllerList.cpp

    src/controllers/webhook/WebhookControllerUpdate.cpp

    src/controllers/wscollab/WebSocketCollabControllerHandleConnectionClosed.cpp

    src/controllers/wscollab/WebSocketCollabControllerHandleNewConnection.cpp

    src/controllers/wscollab/WebSocketCollabControllerHandleNewMessage.cpp

    src/controllers/wscollab/WebSocketCollabControllerState.cpp

    src/controllers/wsnotify/WebSocketNotificationControllerBroadcastNotification.cpp

    src/controllers/wsnotify/WebSocketNotificationControllerGetOnlineUsers.cpp

    src/controllers/wsnotify/WebSocketNotificationControllerHandleConnectionClosed.cpp

    src/controllers/wsnotify/WebSocketNotificationControllerHandleNewConnection.cpp

    src/controllers/wsnotify/WebSocketNotificationControllerHandleNewMessage.cpp

    src/controllers/wsnotify/WebSocketNotificationControllerHandleThreadSubscribe.cpp

    src/controllers/wsnotify/WebSocketNotificationControllerHandleThreadUnsubscribe.cpp

    src/controllers/wsnotify/WebSocketNotificationControllerHandleTypingIndicator.cpp

    src/controllers/wsnotify/WebSocketNotificationControllerPushNotification.cpp

    src/controllers/wsnotify/WebSocketNotificationControllerPushToThread.cpp

    src/controllers/wsnotify/WebSocketNotificationControllerState.cpp

    src/filters/AdminFilter.cpp

    src/filters/AdminOwner.cpp

    src/filters/AuditScopeFilter.cpp

    src/filters/JwtAccountState.cpp

    src/filters/JwtAuthFilter.cpp

    src/filters/OwnerFilter.cpp

    src/filters/OwnerQueries.cpp

    src/filters/OwnerTarget.cpp

    src/filters/RateLimitFilter.cpp

    src/filters/TenantGuard.cpp

    src/filters/TenantOfTarget.cpp

    src/filters/Viewer.cpp

    src/security/ClientIp.cpp

    src/security/Hash.cpp

    src/security/HttpSecurity.cpp

    src/security/HttpSecurityInstall.cpp

    src/security/OAuthState.cpp

    src/security/RateLimiter.cpp

    src/security/RateLimiterLockout.cpp

    src/security/SecurityConfig.cpp

    src/security/SsrfGuard.cpp

    src/security/SsrfUrl.cpp

    src/services/ArticleService.cpp

    src/services/ArticleTagService.cpp

    src/services/DbError.cpp

    src/services/DockerExecutionService.cpp

    src/services/DockerRunArgv.cpp

    src/services/SettingsService.cpp

    src/services/WebhookDelivery.cpp

    src/services/WebhookFire.cpp

    src/services/WebhookSend.cpp

    src/services/analytics/AnalyticsServiceGetPageViews.cpp

    src/services/analytics/AnalyticsServiceGetSearchQueries.cpp

    src/services/analytics/AnalyticsServiceGetSummary.cpp

    src/services/analytics/AnalyticsServiceGetTopContent.cpp

    src/services/analytics/AnalyticsServiceGetTrafficSources.cpp

    src/services/analytics/AnalyticsServiceTrackPageView.cpp

    src/services/article/ArticleServiceCreateArticle.cpp

    src/services/article/ArticleServiceDeleteArticle.cpp

    src/services/article/ArticleServiceGetArticle.cpp

    src/services/article/ArticleServiceGetRevision.cpp

    src/services/article/ArticleServiceListArticles.cpp

    src/services/article/ArticleServiceListRevisions.cpp

    src/services/article/ArticleServiceListTags.cpp

    src/services/article/ArticleServicePublishArticle.cpp

    src/services/article/ArticleServicePublishDueArticles.cpp

    src/services/article/ArticleServiceRefreshSearchIndex.cpp

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

    src/services/audit/AuditLog.cpp

    src/services/auth/AuthServiceBurnPasswordCheck.cpp

    src/services/auth/AuthServiceCtor.cpp

    src/services/auth/AuthServiceGenerateRandomToken.cpp

    src/services/auth/AuthServiceGenerateToken.cpp

    src/services/auth/AuthServiceHashPassword.cpp

    src/services/auth/AuthServiceVerifyPassword.cpp

    src/services/auth/AuthServiceVerifyToken.cpp

    src/services/cache/CacheServiceArticleKey.cpp

    src/services/cache/CacheServiceAutocompleteKey.cpp

    src/services/cache/CacheServiceDel.cpp

    src/services/cache/CacheServiceDelPattern.cpp

    src/services/cache/CacheServiceExecCommand.cpp

    src/services/cache/CacheServiceGet.cpp

    src/services/cache/CacheServiceInitialize.cpp

    src/services/cache/CacheServiceInstance.cpp

    src/services/cache/CacheServiceInvalidateArticle.cpp

    src/services/cache/CacheServiceInvalidateArticleList.cpp

    src/services/cache/CacheServiceInvalidateSearch.cpp

    src/services/cache/CacheServiceIsConnected.cpp

    src/services/cache/CacheServiceReconnect.cpp

    src/services/cache/CacheServiceSearchKey.cpp

    src/services/cache/CacheServiceSet.cpp

    src/services/cache/CacheServiceState.cpp

    src/services/comment/CommentServiceCreateComment.cpp

    src/services/comment/CommentServiceDeleteComment.cpp

    src/services/comment/CommentServiceFindById.cpp

    src/services/comment/CommentServiceGetComments.cpp

    src/services/comment/CommentServiceRowToDto.cpp

    src/services/comment/CommentServiceUpdateComment.cpp

    src/services/comment/CommentServiceVoteComment.cpp

    src/services/elasticsearch/ElasticsearchServiceAutocomplete.cpp

    src/services/elasticsearch/ElasticsearchServiceCreateIndexes.cpp

    src/services/elasticsearch/ElasticsearchServiceCurlWriteCallback.cpp

    src/services/elasticsearch/ElasticsearchServiceDeleteDocument.cpp

    src/services/elasticsearch/ElasticsearchServiceHttpRequest.cpp

    src/services/elasticsearch/ElasticsearchServiceIndexArticle.cpp

    src/services/elasticsearch/ElasticsearchServiceInitialize.cpp

    src/services/elasticsearch/ElasticsearchServiceInstance.cpp

    src/services/elasticsearch/ElasticsearchServiceIsConfigured.cpp

    src/services/elasticsearch/ElasticsearchServiceParseJson.cpp

    src/services/elasticsearch/ElasticsearchServiceSearch.cpp

    src/services/elasticsearch/ElasticsearchServiceSearchBody.cpp

    src/services/email/EmailServiceBuildMimeMessage.cpp

    src/services/email/EmailServiceCtor.cpp

    src/services/email/EmailServicePasswordResetEmailTemplate.cpp

    src/services/email/EmailServiceSendEmail.cpp

    src/services/email/EmailServiceSendPasswordResetEmail.cpp

    src/services/email/EmailServiceState.cpp

    src/services/file/FileServiceQueries.cpp

    src/services/file/FileServiceUpload.cpp

    src/services/forum/ForumReactions.cpp

    src/services/forum/ForumReactionsWrite.cpp

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

    src/services/forum/ForumServiceRowToForumDto.cpp

    src/services/forum/ForumServiceRowToPostDto.cpp

    src/services/forum/ForumServiceRowToThreadDto.cpp

    src/services/forum/ForumServiceSetThreadFlags.cpp

    src/services/forum/ForumServiceUpdateCategory.cpp

    src/services/forum/ForumServiceUpdateForum.cpp

    src/services/forum/ForumServiceUpdatePost.cpp

    src/services/forum/ForumServiceUpdateThread.cpp

    src/services/forum/ForumServiceVotePost.cpp

    src/services/gallery/GalleryServiceAddPicture.cpp

    src/services/gallery/GalleryServiceAlbumRowToDto.cpp

    src/services/gallery/GalleryServiceCreateAlbum.cpp

    src/services/gallery/GalleryServiceDeleteAlbum.cpp

    src/services/gallery/GalleryServiceDeletePicture.cpp

    src/services/gallery/GalleryServiceGetAlbum.cpp

    src/services/gallery/GalleryServiceGetPicture.cpp

    src/services/gallery/GalleryServiceListAlbums.cpp

    src/services/gallery/GalleryServicePictureRowToDto.cpp

    src/services/gallery/GalleryServiceSetDefaultPicture.cpp

    src/services/gallery/GalleryServiceUpdateAlbum.cpp

    src/services/gallery/GalleryServiceUpdatePicture.cpp

    src/services/gallery/GalleryServiceVotePicture.cpp

    src/services/gamedep/GameDepAttachBinary.cpp

    src/services/gamedep/GameDepAttachDependency.cpp

    src/services/gamedep/GameDepAttachPip.cpp

    src/services/gamedep/GameDepAttachShots.cpp

    src/services/gamedep/GameDepAttachTags.cpp

    src/services/gamedep/GameDepAttachVote.cpp

    src/services/gamedep/GameDepServiceCatalog.cpp

    src/services/gamedep/GameDepServiceLookups.cpp

    src/services/gamedep/GameDepServiceReads.cpp

    src/services/gamedep/GameDepWriteCreatePage.cpp

    src/services/gamedep/GameDepWriteCreateRevision.cpp

    src/services/gamedep/GameDepWritePage.cpp

    src/services/gamedep/GameDepWritePublish.cpp

    src/services/gamedep/GameDepWriteRevisions.cpp

    src/services/gamedep/GdAddPip.cpp

    src/services/gamedep/GdFileId.cpp

    src/services/gamedep/GdQuery.cpp

    src/services/gamedep/GdResults.cpp

    src/services/gamedep/GdSqlBinaries.cpp

    src/services/gamedep/GdSqlPage.cpp
    src/services/gamedep/GdFileAccess.cpp
    src/services/gamedep/GdVisibility.cpp

    src/services/gamedep/GdSqlParts.cpp

    src/services/gamedep/GdSqlRevisions.cpp

    src/services/gamedep/GdWithPage.cpp

    src/services/gamedep/GdWithRevision.cpp

    src/services/menu/MenuServiceCreateMenuGroup.cpp

    src/services/menu/MenuServiceCreateMenuItem.cpp

    src/services/menu/MenuServiceDeleteMenuGroup.cpp

    src/services/menu/MenuServiceDeleteMenuItem.cpp

    src/services/menu/MenuServiceListMenuGroups.cpp

    src/services/menu/MenuServiceListMenuItems.cpp

    src/services/menu/MenuServiceRowToGroupDto.cpp

    src/services/menu/MenuServiceRowToItemDto.cpp

    src/services/menu/MenuServiceUpdateMenuItem.cpp

    src/services/notification/NotificationServiceCreateNotification.cpp

    src/services/notification/NotificationServiceDeleteNotification.cpp

    src/services/notification/NotificationServiceGetNotifications.cpp

    src/services/notification/NotificationServiceGetUnreadCount.cpp

    src/services/notification/NotificationServiceMarkAllRead.cpp

    src/services/notification/NotificationServiceMarkRead.cpp

    src/services/notification/NotificationServiceRowToDto.cpp

    src/services/oauth/OAuthServiceCtor.cpp

    src/services/oauth/OAuthServiceCurlWriteCallback.cpp

    src/services/oauth/OAuthServiceExchangeCode.cpp

    src/services/oauth/OAuthServiceFindByProvider.cpp

    src/services/oauth/OAuthServiceGetAuthorizationUrl.cpp

    src/services/oauth/OAuthServiceGetConfig.cpp

    src/services/oauth/OAuthServiceGetLinkedProviders.cpp

    src/services/oauth/OAuthServiceGetProviderProfile.cpp

    src/services/oauth/OAuthServiceHttpGet.cpp

    src/services/oauth/OAuthServiceHttpPost.cpp

    src/services/oauth/OAuthServiceLinkAccount.cpp

    src/services/oauth/OAuthServiceLoadConfig.cpp

    src/services/oauth/OAuthServiceUnlinkProvider.cpp

    src/services/search/SearchServiceAutocomplete.cpp

    src/services/search/SearchServiceCollector.cpp

    src/services/search/SearchServiceEsAutocomplete.cpp

    src/services/search/SearchServiceEsCodec.cpp

    src/services/search/SearchServiceEsSearch.cpp

    src/services/search/SearchServiceSearch.cpp

    src/services/search/SearchServiceSearchArticles.cpp

    src/services/search/SearchServiceSearchForumPosts.cpp

    src/services/search/SearchServiceSearchGameDeps.cpp

    src/services/search/SearchServiceSearchSnippets.cpp

    src/services/search/SearchServiceToTsQuery.cpp

    src/services/search/SearchServiceUseElasticsearch.cpp

    src/services/seo/SeoServiceGenerateAtomFeed.cpp

    src/services/seo/SeoServiceGenerateRssFeed.cpp

    src/services/seo/SeoServiceGenerateSitemap.cpp

    src/services/seo/SeoServiceGetArticleJsonLd.cpp

    src/services/seo/SeoServiceGetOpenGraphData.cpp

    src/services/seo/SeoServiceXmlEscape.cpp

    src/services/snippet/CodeSnippetServiceCreateSnippet.cpp

    src/services/snippet/CodeSnippetServiceDeleteSnippet.cpp

    src/services/snippet/CodeSnippetServiceForkSnippet.cpp

    src/services/snippet/CodeSnippetServiceGetSnippet.cpp

    src/services/snippet/CodeSnippetServiceListSnippets.cpp

    src/services/snippet/CodeSnippetServiceRecordExecution.cpp

    src/services/snippet/CodeSnippetServiceRowToDto.cpp

    src/services/snippet/CodeSnippetServiceUpdateSnippet.cpp

    src/services/social/SocialServiceCalculateReputation.cpp

    src/services/social/SocialServiceFollowUser.cpp

    src/services/social/SocialServiceGetActivityFeed.cpp

    src/services/social/SocialServiceGetFollowers.cpp

    src/services/social/SocialServiceGetFollowing.cpp

    src/services/social/SocialServiceGetUserAchievements.cpp

    src/services/social/SocialServiceUnfollowUser.cpp

    src/services/tenant/TenantServiceCreateTenant.cpp

    src/services/tenant/TenantServiceDeleteTenant.cpp

    src/services/tenant/TenantServiceFindBySlug.cpp

    src/services/tenant/TenantServiceIsValidDisplayName.cpp

    src/services/tenant/TenantServiceIsValidSlug.cpp

    src/services/tenant/TenantServiceListTenants.cpp

    src/services/tenant/TenantServiceRowToDto.cpp

    src/services/user/UserAdminServiceLoadTarget.cpp

    src/services/user/UserAdminServiceSetBanned.cpp

    src/services/user/UserAdminServiceSetRole.cpp

    src/services/user/UserServiceCreateUser.cpp

    src/services/user/UserServiceDeleteUser.cpp

    src/services/user/UserServiceFindByEmail.cpp

    src/services/user/UserServiceFindById.cpp

    src/services/user/UserServiceFindByUsername.cpp

    src/services/user/UserServiceGetPasswordHash.cpp

    src/services/user/UserServiceGetUserRole.cpp

    src/services/user/UserServiceListScoped.cpp

    src/services/user/UserServiceRegisterAccount.cpp

    src/services/user/UserServiceRowToDto.cpp

    src/services/user/UserServiceUpdatePassword.cpp

    src/services/user/UserServiceUpdateProblem.cpp

    src/services/user/UserServiceUpdateUser.cpp

    src/services/webhook/WebhookEvents.cpp

    src/services/webhook/WebhookServiceCreateWebhook.cpp

    src/services/webhook/WebhookServiceDeleteWebhook.cpp

    src/services/webhook/WebhookServiceEventsLiteral.cpp

    src/services/webhook/WebhookServiceGetDeliveries.cpp

    src/services/webhook/WebhookServiceListWebhooks.cpp

    src/services/webhook/WebhookServiceRowToDto.cpp

    src/services/webhook/WebhookServiceUpdateWebhook.cpp

    src/startup/StartupCacheSearch.cpp

    src/startup/StartupDbClient.cpp

    src/startup/StartupPublishTimer.cpp

    src/storage/BlobRegistry.cpp

    src/storage/BlobStatus.cpp

    src/storage/LocalDiskStorage.cpp

    src/storage/S3Storage.cpp

    src/storage/S3StorageHttp.cpp

    src/storage/StorageConfig.cpp

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
