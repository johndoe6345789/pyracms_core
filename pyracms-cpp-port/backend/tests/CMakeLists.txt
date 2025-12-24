cmake_minimum_required(VERSION 3.15)

# Find Google Test
find_package(GTest)

if(NOT GTest_FOUND)
    message(STATUS "Google Test not found, downloading from GitHub...")
    include(FetchContent)
    FetchContent_Declare(
        googletest
        GIT_REPOSITORY https://github.com/google/googletest.git
        GIT_TAG release-1.12.1
    )
    FetchContent_MakeAvailable(googletest)
endif()

# Test files
set(TEST_SOURCES
    test_auth.cpp
    test_database.cpp
    test_user_handler.cpp
)

# Create test executable
add_executable(pyracms_tests ${TEST_SOURCES})

# Include directories
target_include_directories(pyracms_tests PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/../include
)

# Link test executable
target_link_libraries(pyracms_tests
    PRIVATE
    GTest::gtest_main
    GTest::gmock
)

# Add tests
include(GoogleTest)
gtest_discover_tests(pyracms_tests)
