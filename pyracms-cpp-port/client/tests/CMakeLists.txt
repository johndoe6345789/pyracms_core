cmake_minimum_required(VERSION 3.21)

find_package(Qt6 REQUIRED COMPONENTS Test)

# --- QtTest suites: one executable per file in tests/qt ---------------------
# Auto-generated -- run `python generate_cmake.py` to update
set(QT_TEST_SOURCES
    qt/qtst_ApiClient.cpp
    qt/qtst_ApiLogin.cpp
    qt/qtst_ApiLogin_2.cpp
    qt/qtst_BinarySelector.cpp
    qt/qtst_BinarySelector_2.cpp
    qt/qtst_BinarySelector_3.cpp
    qt/qtst_CatalogParser.cpp
    qt/qtst_CatalogParser_2.cpp
    qt/qtst_CatalogParser_3.cpp
    qt/qtst_CatalogParser_4.cpp
    qt/qtst_CatalogParser_5.cpp
    qt/qtst_CatalogParser_6.cpp
    qt/qtst_DeepLinkParser.cpp
    qt/qtst_DeepLinkParser_2.cpp
    qt/qtst_DeepLinkParser_3.cpp
    qt/qtst_DependencyResolver.cpp
    qt/qtst_DownloadManager.cpp
    qt/qtst_DownloadManager_2.cpp
    qt/qtst_DownloadManager_3.cpp
    qt/qtst_DownloadManager_4.cpp
    qt/qtst_DownloadManager_5.cpp
    qt/qtst_DownloadVerifier.cpp
    qt/qtst_DownloadVerifier_2.cpp
    qt/qtst_DownloadVerifier_3.cpp
    qt/qtst_EntryRepository.cpp
    qt/qtst_EntryRepository_2.cpp
    qt/qtst_EntryRepository_3.cpp
    qt/qtst_InstallFlow.cpp
    qt/qtst_InstallFlow_2.cpp
    qt/qtst_InstallFlow_3.cpp
    qt/qtst_InstallFlow_4.cpp
    qt/qtst_InstallFlow_5.cpp
    qt/qtst_InstallPlanner.cpp
    qt/qtst_InstallPlanner_2.cpp
    qt/qtst_InstallRunner.cpp
    qt/qtst_InstallRunner_2.cpp
    qt/qtst_InstallStateStore.cpp
    qt/qtst_InstallStateStore_2.cpp
    qt/qtst_InstallStateStore_3.cpp
    qt/qtst_InstallStateStore_4.cpp
    qt/qtst_InstallStateStore_5.cpp
    qt/qtst_LaunchFlow.cpp
    qt/qtst_LaunchFlow_2.cpp
    qt/qtst_LaunchFlow_3.cpp
    qt/qtst_LaunchFlow_4.cpp
    qt/qtst_LaunchFlow_5.cpp
    qt/qtst_LaunchFlow_6.cpp
    qt/qtst_LaunchNative.cpp
    qt/qtst_LaunchPython.cpp
    qt/qtst_PipInstaller.cpp
    qt/qtst_PipResolver.cpp
    qt/qtst_PipRun.cpp
    qt/qtst_PipRun_2.cpp
    qt/qtst_PipSpec.cpp
    qt/qtst_PlannerErrors.cpp
    qt/qtst_PlannerErrors_2.cpp
    qt/qtst_SingleInstance.cpp
    qt/qtst_UiDeepLinkAndSettings.cpp
    qt/qtst_UiDeepLinkAndSettings_2.cpp
    qt/qtst_UiDeepLinkAndSettings_3.cpp
    qt/qtst_UiDownloadCenter.cpp
    qt/qtst_UiDownloadCenter_2.cpp
    qt/qtst_UiDownloadCenter_3.cpp
    qt/qtst_UiFilterModel.cpp
    qt/qtst_UiFilterModel_2.cpp
    qt/qtst_UiFilterModel_3.cpp
    qt/qtst_UiGameModel.cpp
    qt/qtst_UiGameModel_2.cpp
    qt/qtst_UiGameModel_3.cpp
    qt/qtst_UiLinks.cpp
    qt/qtst_UiLinks_2.cpp
    qt/qtst_UiMainViewModel.cpp
    qt/qtst_UiMainViewModel_2.cpp
    qt/qtst_UiMainViewModel_3.cpp
    qt/qtst_UiSelectedView.cpp
    qt/qtst_UiSelectedView_2.cpp
)

# QML-facing C++ types (models, view-models) compiled without the QML
# module so QtTest can exercise them: suites named qtst_Ui*.cpp use it.
find_package(Qt6 REQUIRED COMPONENTS Gui Qml)
set(UI_SOURCES
    ${CMAKE_SOURCE_DIR}/src/models/DependencyModel.cpp
    ${CMAKE_SOURCE_DIR}/src/models/GameDepModel.cpp
    ${CMAKE_SOURCE_DIR}/src/models/GameDepModel_data.cpp
    ${CMAKE_SOURCE_DIR}/src/models/GameDepModel_fillRow.cpp
    ${CMAKE_SOURCE_DIR}/src/models/GameDepModel_refreshAll.cpp
    ${CMAKE_SOURCE_DIR}/src/models/GameDepModel_statusTextOf.cpp
    ${CMAKE_SOURCE_DIR}/src/models/GameFilterModel.cpp
    ${CMAKE_SOURCE_DIR}/src/models/GameFilterModel_filterAcceptsRow.cpp
    ${CMAKE_SOURCE_DIR}/src/viewmodels/DeepLinkController.cpp
    ${CMAKE_SOURCE_DIR}/src/viewmodels/DownloadCenter.cpp
    ${CMAKE_SOURCE_DIR}/src/viewmodels/DownloadCenter_cancelActive.cpp
    ${CMAKE_SOURCE_DIR}/src/viewmodels/DownloadCenter_enqueue.cpp
    ${CMAKE_SOURCE_DIR}/src/viewmodels/DownloadCenter_onProgress.cpp
    ${CMAKE_SOURCE_DIR}/src/viewmodels/MainViewModel.cpp
    ${CMAKE_SOURCE_DIR}/src/viewmodels/MainViewModelBase.cpp
    ${CMAKE_SOURCE_DIR}/src/viewmodels/MainViewModel_cancelDownload.cpp
    ${CMAKE_SOURCE_DIR}/src/viewmodels/MainViewModel_dispatch.cpp
    ${CMAKE_SOURCE_DIR}/src/viewmodels/MainViewModel_handleUrl.cpp
    ${CMAKE_SOURCE_DIR}/src/viewmodels/MainViewModel_refreshSelected.cpp
    ${CMAKE_SOURCE_DIR}/src/viewmodels/MainViewModel_runLinkAction.cpp
    ${CMAKE_SOURCE_DIR}/src/viewmodels/MainViewModel_wireCatalog.cpp
    ${CMAKE_SOURCE_DIR}/src/viewmodels/MainViewModel_wireGameSignals.cpp
    ${CMAKE_SOURCE_DIR}/src/viewmodels/MainViewModel_wireInstallSignals.cpp
    ${CMAKE_SOURCE_DIR}/src/viewmodels/MainViewModel_wireSettings.cpp
    ${CMAKE_SOURCE_DIR}/src/viewmodels/SelectedGameView.cpp
    ${CMAKE_SOURCE_DIR}/src/viewmodels/SelectedGameView_build.cpp
    ${CMAKE_SOURCE_DIR}/src/viewmodels/SelectedGameView_primaryFor.cpp
    ${CMAKE_SOURCE_DIR}/src/viewmodels/ServiceHolder.cpp
    ${CMAKE_SOURCE_DIR}/src/viewmodels/SettingsEditBase.cpp
    ${CMAKE_SOURCE_DIR}/src/viewmodels/SettingsViewModel.cpp
    ${CMAKE_SOURCE_DIR}/src/viewmodels/SettingsViewModel_cancel.cpp
    ${CMAKE_SOURCE_DIR}/src/viewmodels/SettingsViewModel_checkDirty.cpp
    ${CMAKE_SOURCE_DIR}/src/viewmodels/SettingsViewModel_preferPip.cpp
    ${CMAKE_SOURCE_DIR}/src/models/Constants.h
    ${CMAKE_SOURCE_DIR}/src/models/DependencyModel.h
    ${CMAKE_SOURCE_DIR}/src/models/GameDepModel.h
    ${CMAKE_SOURCE_DIR}/src/models/GameDepRows.h
    ${CMAKE_SOURCE_DIR}/src/models/GameFilterModel.h
    ${CMAKE_SOURCE_DIR}/src/viewmodels/DeepLinkController.h
    ${CMAKE_SOURCE_DIR}/src/viewmodels/DownloadCenter.h
    ${CMAKE_SOURCE_DIR}/src/viewmodels/MainViewModel.h
    ${CMAKE_SOURCE_DIR}/src/viewmodels/MainViewModelBase.h
    ${CMAKE_SOURCE_DIR}/src/viewmodels/MainViewModelDeps.h
    ${CMAKE_SOURCE_DIR}/src/viewmodels/SelectedGameView.h
    ${CMAKE_SOURCE_DIR}/src/viewmodels/ServiceHolder.h
    ${CMAKE_SOURCE_DIR}/src/viewmodels/SettingsEditBase.h
    ${CMAKE_SOURCE_DIR}/src/viewmodels/SettingsViewModel.h
    ${CMAKE_SOURCE_DIR}/src/viewmodels/UrlEventFilter.h
)
add_library(hypernucleus_ui_test STATIC ${UI_SOURCES})
target_link_libraries(hypernucleus_ui_test PUBLIC
    hypernucleus_lib Qt6::Gui Qt6::Qml)
target_include_directories(hypernucleus_ui_test PUBLIC
    ${CMAKE_SOURCE_DIR}/src ${CMAKE_SOURCE_DIR}/src/models
    ${CMAKE_SOURCE_DIR}/src/viewmodels)

foreach(test_src ${QT_TEST_SOURCES})
    get_filename_component(test_name ${test_src} NAME_WE)
    add_executable(${test_name} ${test_src})
    target_link_libraries(${test_name} PRIVATE hypernucleus_lib Qt6::Test)
    if(test_name MATCHES "^qtst_Ui")
        target_link_libraries(${test_name} PRIVATE hypernucleus_ui_test)
    endif()
    add_test(NAME ${test_name} COMMAND ${test_name})
    # The suites use their own QSettings / data folders, never the user's.
    set_tests_properties(${test_name} PROPERTIES ENVIRONMENT "QT_QPA_PLATFORM=offscreen")
endforeach()

# --- GoogleTest suites (original tests, one executable) ---------------------
option(BUILD_GTEST_TESTS "Build the GoogleTest suites (needs network or GTest)" ON)

if(BUILD_GTEST_TESTS)
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

    # Auto-generated test sources
    set(TEST_SOURCES
        tst_ApiClient.cpp
        tst_ApiClient_auth.cpp
        tst_ApiClient_fetch.cpp
        tst_ModuleInstaller.cpp
        tst_ModuleInstaller_circular.cpp
        tst_ModuleInstaller_resolve.cpp
        tst_ModuleInstaller_state.cpp
        tst_SettingsManager.cpp
        tst_SettingsManager_persist.cpp
        tst_SettingsManager_set.cpp
    )

    add_executable(hypernucleus_tests ${TEST_SOURCES})

    target_link_libraries(hypernucleus_tests
        PRIVATE
        hypernucleus_lib
        Qt6::Test
        GTest::gtest_main
        GTest::gmock
    )

    include(GoogleTest)
    gtest_discover_tests(hypernucleus_tests)
endif()
