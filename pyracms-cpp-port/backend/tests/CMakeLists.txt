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

    fake_s3.cpp

    fake_s3_handle.cpp

    http_accounts.cpp

    http_calls.cpp

    http_harness.cpp

    test_activity_http.cpp

    test_admin_filter.cpp

    test_admin_target.cpp

    test_analytics_summary_http.cpp

    test_article_http_1.cpp

    test_article_http_2.cpp

    test_article_http_3.cpp

    test_audit_http.cpp

    test_auth_http.cpp

    test_auth_reset_http.cpp

    test_auth_service.cpp

    test_auth_tenant_claim.cpp

    test_comment_notify_http.cpp

    test_feature_gate.cpp

    test_feature_gate_http.cpp

    test_feature_rules.cpp

    test_file_http.cpp

    test_file_range_rules.cpp

    test_file_s3_errors.cpp

    test_file_s3_http.cpp

    test_file_s3_range.cpp

    test_forum_flow_db_1.cpp

    test_forum_flow_db_2.cpp

    test_forum_flow_db_3.cpp

    test_forum_http_1.cpp

    test_forum_http_2.cpp

    test_forum_move_http.cpp

    test_forum_reactions_http.cpp

    test_forum_scope_db_1.cpp

    test_forum_scope_db_2.cpp

    test_forum_stats_http.cpp

    test_gallery_http.cpp

    test_gamedep_http_1.cpp

    test_gamedep_http_2.cpp

    test_gamedep_http_3.cpp

    test_gamedep_http_4.cpp

    test_gamedep_public_files_http.cpp

    test_gamedep_public_http.cpp

    test_jwt_filter_1.cpp

    test_jwt_filter_2.cpp

    test_menu_tenant_db_1.cpp

    test_menu_tenant_db_2.cpp

    test_owner_admin_content_http.cpp

    test_owner_admin_forum_http.cpp

    test_owner_admin_users_http_1.cpp

    test_owner_admin_users_http_2.cpp

    test_owner_scope_forum_http.cpp

    test_owner_scope_menu_http.cpp

    test_public_reads_http.cpp

    test_publish_due_http.cpp

    test_reset_tenant_http.cpp

    test_role_rules.cpp

    test_search_http.cpp

    test_search_thread_http.cpp

    test_security_auth_http_1.cpp

    test_security_auth_http_2.cpp

    test_security_auth_http_3.cpp

    test_security_auth_http_4.cpp

    test_security_auth_http_5.cpp

    test_security_auth_http_6.cpp

    test_security_auth_http_7.cpp

    test_security_content_http_1.cpp

    test_security_content_http_2.cpp

    test_security_content_http_3.cpp

    test_security_content_http_4.cpp

    test_security_edge_http_1.cpp

    test_security_edge_http_2.cpp

    test_security_edge_http_3.cpp

    test_security_edge_http_4.cpp

    test_security_edge_http_5.cpp

    test_security_rules_1_1.cpp

    test_security_rules_1_2.cpp

    test_security_rules_2_1.cpp

    test_security_rules_2_2.cpp

    test_security_rules_2_3.cpp

    test_security_rules_2_4.cpp

    test_security_ws_1.cpp

    test_security_ws_2.cpp

    test_security_ws_3.cpp

    test_security_ws_4.cpp

    test_services_crud_db_1.cpp

    test_services_crud_db_2.cpp

    test_snippet_menu_http.cpp

    test_snippet_scope_db_1.cpp

    test_snippet_scope_db_2.cpp

    test_social_http.cpp

    test_social_service_http.cpp

    test_storage_config.cpp

    test_storage_local.cpp

    test_storage_s3.cpp

    test_tenant_http.cpp

    test_tenant_rules.cpp

    test_tenant_service.cpp

    test_tenant_service_2.cpp

    test_user_admin_http_1.cpp

    test_user_admin_http_2.cpp

    test_user_admin_http_3.cpp

    test_user_admin_http_4.cpp

    test_user_admin_last_http.cpp

    test_user_admin_last_http_2.cpp

    test_user_admin_last_rules.cpp

    test_user_admin_rules.cpp

    test_user_admin_rules_2.cpp

    test_user_admin_rules_3.cpp

    test_user_scope_db_1.cpp

    test_user_scope_db_2.cpp

    test_user_service.cpp

    test_user_service_roles.cpp

    test_user_service_roles_2.cpp

    test_user_service_roles_3.cpp

    test_user_visibility.cpp

    test_webhook_events_http.cpp

    test_webhook_http.cpp

    test_webhook_service_http.cpp

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
