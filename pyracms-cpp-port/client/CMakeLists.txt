cmake_minimum_required(VERSION 3.16)
project(hypernucleus VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)

# Conan-generated toolchain
if(EXISTS "${CMAKE_BINARY_DIR}/conan_toolchain.cmake")
    include("${CMAKE_BINARY_DIR}/conan_toolchain.cmake")
endif()

# Options
option(BUILD_TESTS "Build tests" ON)

# Find dependencies
find_package(Qt6 REQUIRED COMPONENTS Core Quick QuickControls2 Network)
find_package(QuaZip-Qt6 REQUIRED)

# Include directories
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/src)

# Client library (shared between app and tests)
# Auto-generated from source files — run `python generate_cmake.py` to update
set(LIB_SOURCES

    src/models/DependencyModel.cpp

    src/models/GameDepModel.cpp

    src/services/ApiClient.cpp

    src/services/AuthService.cpp

    src/services/GameManager.cpp

    src/services/ModuleInstaller.cpp

    src/services/PathManager.cpp

    src/services/SettingsManager.cpp

    src/viewmodels/MainViewModel.cpp

    src/viewmodels/SettingsViewModel.cpp

)

set(LIB_HEADERS

    src/models/Constants.h

    src/models/DependencyModel.h

    src/models/GameDepModel.h

    src/services/ApiClient.h

    src/services/AuthService.h

    src/services/GameManager.h

    src/services/ModuleInstaller.h

    src/services/PathManager.h

    src/services/SettingsManager.h

    src/viewmodels/MainViewModel.h

    src/viewmodels/SettingsViewModel.h

)

add_library(hypernucleus_lib STATIC ${LIB_SOURCES} ${LIB_HEADERS})
target_link_libraries(hypernucleus_lib
    PUBLIC
    Qt6::Core
    Qt6::Quick
    Qt6::QuickControls2
    Qt6::Network
    QuaZip::QuaZip
)
target_include_directories(hypernucleus_lib PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/src)

# Main executable
qt_add_executable(hypernucleus src/main.cpp)
target_link_libraries(hypernucleus PRIVATE hypernucleus_lib)

# QML module
# Auto-generated QML file list — run `python generate_cmake.py` to update
qt_add_qml_module(hypernucleus
    URI Hypernucleus
    VERSION 1.0
    QML_FILES

        qml/Main.qml

        qml/components/GameDepTab.qml

        qml/components/InfoPanel.qml

        qml/components/PicturesPanel.qml

        qml/components/ProgressOverlay.qml

        qml/components/ToolBar.qml

        qml/dialogs/LoginDialog.qml

        qml/dialogs/RegisterDialog.qml

        qml/dialogs/SettingsDialog.qml

        qml/theme/Theme.qml

    RESOURCES
        resources/resources.qrc
)

# Testing
if(BUILD_TESTS)
    enable_testing()
    add_subdirectory(tests)
endif()

# Installation
install(TARGETS hypernucleus RUNTIME DESTINATION bin)
