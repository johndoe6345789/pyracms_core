cmake_minimum_required(VERSION 3.21)
project(hypernucleus VERSION 0.2.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
set(CMAKE_AUTOMOC ON)

# Conan-generated toolchain
if(EXISTS "${CMAKE_BINARY_DIR}/conan_toolchain.cmake")
    include("${CMAKE_BINARY_DIR}/conan_toolchain.cmake")
endif()

# Options
option(BUILD_TESTS "Build tests" ON)
option(ENABLE_COVERAGE "Instrument with gcov (GCC/Clang)" OFF)

if(ENABLE_COVERAGE)
    add_compile_options(--coverage -O0 -g)
    add_link_options(--coverage)
endif()

# Find dependencies
find_package(Qt6 REQUIRED COMPONENTS Core Gui Network Qml Quick QuickControls2)
find_package(QuaZip-Qt6 REQUIRED)

# Include directories
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/src)

# Client library (shared between app and tests): domain + services, no QML.
# Auto-generated from source files -- run `python generate_cmake.py` to update
set(LIB_SOURCES
    src/domain/BinarySelector.cpp
    src/domain/BinarySelector_normalizeOs.cpp
    src/domain/BinarySelector_normalizeOs_resolveTarget.cpp
    src/domain/CatalogDeps.cpp
    src/domain/CatalogFields.cpp
    src/domain/CatalogParser.cpp
    src/domain/CatalogParser_parseCatalog.cpp
    src/domain/CatalogParser_parseEntry.cpp
    src/domain/CatalogRevision.cpp
    src/domain/CatalogShots.cpp
    src/domain/DeepLinkParser.cpp
    src/domain/DeepLinkParser_isSafeSegment.cpp
    src/domain/DeepLinkParser_isSafeSegment_findInArguments.cpp
    src/domain/DependencyResolver.cpp
    src/domain/DownloadVerifier.cpp
    src/domain/GameEntry.cpp
    src/domain/InstallRecordJson.cpp
    src/domain/InstallStateStore.cpp
    src/domain/InstallStateStore_importLegacyIni.cpp
    src/domain/InstallStateStore_load.cpp
    src/domain/InstallStateStore_save.cpp
    src/domain/InstallStateStore_set.cpp
    src/domain/LaunchResolver.cpp
    src/domain/LaunchResolver_pythonPathEntries.cpp
    src/domain/VersionCompare.cpp
    src/services/ApiClient.cpp
    src/services/ApiClient_fetchFile.cpp
    src/services/ApiClient_getJson.cpp
    src/services/ApiClient_loginWithTenant.cpp
    src/services/ApiClient_registerUser.cpp
    src/services/ApiClient_setLoading.cpp
    src/services/ArchiveExtractor.cpp
    src/services/ArchiveExtractor_entry.cpp
    src/services/ArchiveExtractor_extractZip.cpp
    src/services/ArchiveExtractor_installLayout.cpp
    src/services/AuthService.cpp
    src/services/AuthService_logout.cpp
    src/services/DownloadManager.cpp
    src/services/DownloadManager_complete.cpp
    src/services/DownloadManager_onReadyRead.cpp
    src/services/DownloadManager_send.cpp
    src/services/DownloadManager_start.cpp
    src/services/EntryRepository.cpp
    src/services/EntryRepository_applyCatalog.cpp
    src/services/EntryRepository_ensureDetail.cpp
    src/services/EntryRepository_refreshFallback.cpp
    src/services/GameManager.cpp
    src/services/GameManager_connectProcess.cpp
    src/services/GameManager_connectProcess_finishRun.cpp
    src/services/GameManager_launchGame.cpp
    src/services/GameManager_prepare.cpp
    src/services/GameManager_stopGame.cpp
    src/services/InstallPlanner.cpp
    src/services/InstallPlanner_advance.cpp
    src/services/InstallPlanner_build.cpp
    src/services/InstallPlanner_gameSteps.cpp
    src/services/InstallPlanner_steps.cpp
    src/services/InstallRunner.cpp
    src/services/InstallRunner_concerns.cpp
    src/services/ModuleInstaller.cpp
    src/services/ModuleInstaller_annotate.cpp
    src/services/ModuleInstaller_fail.cpp
    src/services/ModuleInstaller_install.cpp
    src/services/ModuleInstaller_performInstall.cpp
    src/services/ModuleInstaller_removeDirectory.cpp
    src/services/ModuleInstaller_uninstall.cpp
    src/services/PathManager.cpp
    src/services/PathManager_depDir.cpp
    src/services/PathManager_gameDir.cpp
    src/services/PipInstaller.cpp
    src/services/PipInstaller_cancel.cpp
    src/services/PipInstaller_install.cpp
    src/services/PipInstaller_process.cpp
    src/services/PipResolver.cpp
    src/services/PipResolver_check.cpp
    src/services/PlanWalk.cpp
    src/services/PythonLocator.cpp
    src/services/SettingsBase.cpp
    src/services/SettingsManager.cpp
    src/services/SettingsManager_detectArch.cpp
    src/services/SettingsManager_load.cpp
    src/services/SettingsManager_tenantSlug.cpp
    src/services/SingleInstance.cpp
    src/services/SingleInstance_onNewConnection.cpp
    src/services/UrlSchemeRegistrar.cpp
    src/services/UrlSchemeRegistrar_registerForCurrentUser.cpp
)

set(LIB_HEADERS
    src/domain/BinarySelector.h
    src/domain/CatalogFields.h
    src/domain/CatalogParser.h
    src/domain/DeepLinkParser.h
    src/domain/DependencyResolver.h
    src/domain/DownloadVerifier.h
    src/domain/Format.h
    src/domain/GameEntry.h
    src/domain/InstallJob.h
    src/domain/InstallPlan.h
    src/domain/InstallRecordJson.h
    src/domain/InstallStateStore.h
    src/domain/LaunchResolver.h
    src/domain/MediaRef.h
    src/domain/VersionCompare.h
    src/services/ApiClient.h
    src/services/ArchiveEntry.h
    src/services/ArchiveExtractor.h
    src/services/AuthService.h
    src/services/DownloadManager.h
    src/services/EntryRepository.h
    src/services/GameManager.h
    src/services/InstallPlanner.h
    src/services/InstallRunner.h
    src/services/ModuleInstaller.h
    src/services/PathManager.h
    src/services/PipInstaller.h
    src/services/PipResolver.h
    src/services/PlanWalk.h
    src/services/PythonLocator.h
    src/services/SettingsBase.h
    src/services/SettingsManager.h
    src/services/SingleInstance.h
    src/services/UrlSchemeRegistrar.h
)

add_library(hypernucleus_lib STATIC ${LIB_SOURCES} ${LIB_HEADERS})
target_link_libraries(hypernucleus_lib
    PUBLIC
    Qt6::Core
    Qt6::Network
    QuaZip::QuaZip
)
target_include_directories(hypernucleus_lib PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/src)

# Main executable
qt_add_executable(hypernucleus src/main.cpp)
target_link_libraries(hypernucleus PRIVATE
    hypernucleus_lib
    Qt6::Gui
    Qt6::Qml
    Qt6::Quick
    Qt6::QuickControls2
)

# qmltyperegistrar includes the QML-facing headers by file name.
target_include_directories(hypernucleus PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/src/models
    ${CMAKE_CURRENT_SOURCE_DIR}/src/viewmodels
)

# Singleton QML types must be flagged before the module is created.
set_source_files_properties(
    qml/theme/Theme.qml
    PROPERTIES QT_QML_SINGLETON_TYPE TRUE
)

# QML module "Hypernucleus": QML files plus the QML-facing C++ types
# (QML_ELEMENT / QML_SINGLETON) from src/models and src/viewmodels.
# Auto-generated lists -- run `python generate_cmake.py` to update
qt_add_qml_module(hypernucleus
    URI Hypernucleus
    VERSION 1.0
    RESOURCE_PREFIX /qt/qml
    QML_FILES
        qml/Main.qml
        qml/components/AccountButton.qml
        qml/components/AppShortcuts.qml
        qml/components/CardInfo.qml
        qml/components/CoverArt.qml
        qml/components/DependencyRow.qml
        qml/components/DetailRow.qml
        qml/components/DownloadBar.qml
        qml/components/DownloadInfo.qml
        qml/components/GameCard.qml
        qml/components/GameDepTab.qml
        qml/components/GameListItem.qml
        qml/components/GroupHeader.qml
        qml/components/HeroBanner.qml
        qml/components/InfoAbout.qml
        qml/components/InfoActionBar.qml
        qml/components/InfoBody.qml
        qml/components/InfoDetails.qml
        qml/components/InfoEmpty.qml
        qml/components/InfoLog.qml
        qml/components/InfoMoreMenu.qml
        qml/components/InfoPanel.qml
        qml/components/InfoRequirements.qml
        qml/components/InfoStatus.qml
        qml/components/LibraryFilters.qml
        qml/components/LibraryList.qml
        qml/components/LibrarySidebar.qml
        qml/components/ListEmpty.qml
        qml/components/ListThumb.qml
        qml/components/ListTitles.qml
        qml/components/MainContent.qml
        qml/components/PicturesPanel.qml
        qml/components/PrimaryButton.qml
        qml/components/ProgressOverlay.qml
        qml/components/ScreenshotViewer.qml
        qml/components/SectionTitle.qml
        qml/components/StoreCategories.qml
        qml/components/StoreCell.qml
        qml/components/StoreGrid.qml
        qml/components/StoreGridPage.qml
        qml/components/StoreHeader.qml
        qml/components/StoreView.qml
        qml/components/TagChip.qml
        qml/components/ThemeToggle.qml
        qml/components/Toast.qml
        qml/components/ToolBar.qml
        qml/components/TopTab.qml
        qml/components/VersionPicker.qml
        qml/dialogs/AppDialogs.qml
        qml/dialogs/AuthButtons.qml
        qml/dialogs/AuthField.qml
        qml/dialogs/ConfirmLinkDialog.qml
        qml/dialogs/ErrorLabel.qml
        qml/dialogs/FieldHint.qml
        qml/dialogs/FieldLabel.qml
        qml/dialogs/LoginDialog.qml
        qml/dialogs/LoginFields.qml
        qml/dialogs/RegisterDialog.qml
        qml/dialogs/RegisterFields.qml
        qml/dialogs/SettingsBlock.qml
        qml/dialogs/SettingsDialog.qml
        qml/dialogs/SettingsGeneralTab.qml
        qml/dialogs/SettingsLinksTab.qml
        qml/dialogs/SettingsPythonTab.qml
        qml/theme/Theme.qml
    SOURCES
        src/models/DependencyModel.cpp
        src/models/GameDepModel.cpp
        src/models/GameDepModel_data.cpp
        src/models/GameDepModel_fillRow.cpp
        src/models/GameDepModel_refreshAll.cpp
        src/models/GameDepModel_statusTextOf.cpp
        src/models/GameFilterModel.cpp
        src/models/GameFilterModel_filterAcceptsRow.cpp
        src/viewmodels/DeepLinkController.cpp
        src/viewmodels/DownloadCenter.cpp
        src/viewmodels/DownloadCenter_cancelActive.cpp
        src/viewmodels/DownloadCenter_enqueue.cpp
        src/viewmodels/DownloadCenter_onProgress.cpp
        src/viewmodels/MainViewModel.cpp
        src/viewmodels/MainViewModelBase.cpp
        src/viewmodels/MainViewModel_cancelDownload.cpp
        src/viewmodels/MainViewModel_dispatch.cpp
        src/viewmodels/MainViewModel_handleUrl.cpp
        src/viewmodels/MainViewModel_refreshSelected.cpp
        src/viewmodels/MainViewModel_runLinkAction.cpp
        src/viewmodels/MainViewModel_wireCatalog.cpp
        src/viewmodels/MainViewModel_wireGameSignals.cpp
        src/viewmodels/MainViewModel_wireInstallSignals.cpp
        src/viewmodels/MainViewModel_wireSettings.cpp
        src/viewmodels/SelectedGameView.cpp
        src/viewmodels/SelectedGameView_build.cpp
        src/viewmodels/SelectedGameView_primaryFor.cpp
        src/viewmodels/ServiceHolder.cpp
        src/viewmodels/SettingsEditBase.cpp
        src/viewmodels/SettingsViewModel.cpp
        src/viewmodels/SettingsViewModel_cancel.cpp
        src/viewmodels/SettingsViewModel_checkDirty.cpp
        src/viewmodels/SettingsViewModel_preferPip.cpp
        src/models/Constants.h
        src/models/DependencyModel.h
        src/models/ForeignTypes.h
        src/models/GameDepModel.h
        src/models/GameDepRows.h
        src/models/GameFilterModel.h
        src/viewmodels/DeepLinkController.h
        src/viewmodels/DownloadCenter.h
        src/viewmodels/MainViewModel.h
        src/viewmodels/MainViewModelBase.h
        src/viewmodels/MainViewModelDeps.h
        src/viewmodels/SelectedGameView.h
        src/viewmodels/ServiceHolder.h
        src/viewmodels/SettingsEditBase.h
        src/viewmodels/SettingsViewModel.h
        src/viewmodels/UrlEventFilter.h
)

# Testing
if(BUILD_TESTS)
    enable_testing()
    add_subdirectory(tests)
endif()

# Installation
install(TARGETS hypernucleus RUNTIME DESTINATION bin)
