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

    test_auth_service.cpp

    test_user_service.cpp

)

add_executable(pyracms_tests ${TEST_SOURCES})

target_link_libraries(pyracms_tests
    PRIVATE
    pyracms_lib
    GTest::gtest_main
    GTest::gmock
)

include(GoogleTest)
gtest_discover_tests(pyracms_tests)
