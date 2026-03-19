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
find_package(CURL REQUIRED)

# Include directories
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/include)

# Backend library (shared between server and tests)
# Auto-generated from source files — run `python generate_cmake.py` to update
set(LIB_SOURCES

    src/controllers/AnalyticsController.cpp

    src/controllers/ArticleController.cpp

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

add_library(pyracms_lib OBJECT ${LIB_SOURCES})
target_link_libraries(pyracms_lib
    PUBLIC
    Drogon::Drogon
    jwt-cpp::jwt-cpp
    CURL::libcurl
)
target_include_directories(pyracms_lib PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include)

# Main executable
add_executable(pyracms_server src/main.cpp)
target_link_libraries(pyracms_server PRIVATE pyracms_lib)

# Testing
if(BUILD_TESTS)
    enable_testing()
    add_subdirectory(tests)
endif()

# Installation
install(TARGETS pyracms_server RUNTIME DESTINATION bin)
