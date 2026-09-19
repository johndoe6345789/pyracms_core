cmake_minimum_required(VERSION 3.15)

# Find Google Test
find_package(GTest)

if(NOT GTest_FOUND)
    message(STATUS "Google Test not found, downloading from GitHub...")
    include(FetchContent)
    FetchContent_Declare(
        googletest
        GIT_REPOSITORY https://github.com/google/googletest.git
        GIT_TAG v1.14.0
    )
    FetchContent_MakeAvailable(googletest)
endif()

# Auto-generated test sources — run `python generate_cmake.py` to update
set(TEST_SOURCES

    http_accounts.cpp

    http_harness.cpp

    test_admin_filter.cpp

    test_article_http_1.cpp

    test_article_http_2.cpp

    test_auth_http.cpp

    test_auth_service.cpp

    test_auth_tenant_claim.cpp

    test_comment_notify_http.cpp

    test_file_http.cpp

    test_forum_flow_db_1.cpp

    test_forum_flow_db_2.cpp

    test_forum_flow_db_3.cpp

    test_forum_http_1.cpp

    test_forum_http_2.cpp

    test_forum_scope_db_1.cpp

    test_forum_scope_db_2.cpp

    test_gallery_http.cpp

    test_gamedep_http_1.cpp

    test_gamedep_http_2.cpp

    test_gamedep_http_3.cpp

    test_gamedep_http_4.cpp

    test_jwt_filter_1.cpp

    test_jwt_filter_2.cpp

    test_menu_tenant_db_1.cpp

    test_menu_tenant_db_2.cpp

    test_public_reads_http.cpp

    test_role_rules.cpp

    test_services_crud_db_1.cpp

    test_services_crud_db_2.cpp

    test_snippet_menu_http.cpp

    test_snippet_scope_db_1.cpp

    test_snippet_scope_db_2.cpp

    test_social_http.cpp

    test_tenant_rules.cpp
    test_user_visibility.cpp

    test_tenant_service.cpp

    test_user_scope_db_1.cpp

    test_user_scope_db_2.cpp

    test_user_service.cpp

    test_user_service_roles.cpp

    test_webhook_http.cpp

)

add_executable(pyracms_tests ${TEST_SOURCES})

# --whole-archive keeps controller/filter static initializers, so the
# HTTP tests (http_harness.h) see every route like the real server.
target_link_libraries(pyracms_tests
    PRIVATE
    "-Wl,--whole-archive"
    pyracms_lib
    "-Wl,--no-whole-archive"
    GTest::gtest_main
    GTest::gmock
)

include(GoogleTest)
gtest_discover_tests(pyracms_tests)
