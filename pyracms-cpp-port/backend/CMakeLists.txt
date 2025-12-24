cmake_minimum_required(VERSION 3.15)
project(pyracms_cpp_backend VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# Options
option(BUILD_TESTS "Build tests" ON)
option(BUILD_SHARED_LIBS "Build shared libraries" OFF)

# Find dependencies
find_package(Threads REQUIRED)

# Include directories
include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}/include
    ${CMAKE_CURRENT_SOURCE_DIR}/external
)

# Source files
set(BACKEND_SOURCES
    src/main.cpp
    src/server.cpp
    src/auth_handler.cpp
    src/user_handler.cpp
    src/database.cpp
)

# Create executable
add_executable(pyracms_server ${BACKEND_SOURCES})

# Link libraries
target_link_libraries(pyracms_server
    PRIVATE
    Threads::Threads
)

# Testing
if(BUILD_TESTS)
    enable_testing()
    add_subdirectory(tests)
endif()

# Installation
install(TARGETS pyracms_server
    RUNTIME DESTINATION bin
)
