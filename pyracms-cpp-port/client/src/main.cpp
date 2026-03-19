#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QQmlContext>
#include <QQuickStyle>
#include <QIcon>
#include <QSysInfo>

#include "viewmodels/MainViewModel.h"
#include "viewmodels/SettingsViewModel.h"
#include "models/GameDepModel.h"
#include "models/DependencyModel.h"
#include "models/Constants.h"
#include "services/ApiClient.h"
#include "services/AuthService.h"
#include "services/SettingsManager.h"
#include "services/PathManager.h"
#include "services/ModuleInstaller.h"
#include "services/GameManager.h"

int main(int argc, char* argv[])
{
    QGuiApplication app(argc, argv);
    app.setOrganizationName("PyraCMS");
    app.setOrganizationDomain("pyracms.com");
    app.setApplicationName("Hypernucleus");
    app.setApplicationVersion("0.1.0");

    // Set Material Design style
    QQuickStyle::setStyle("Material");

    // Register enums for QML access
    qmlRegisterUncreatableMetaObject(
        Hypernucleus::staticMetaObject,
        "Hypernucleus", 1, 0,
        "Hypernucleus",
        "Access to enums only"
    );

    // Register types for QML
    qmlRegisterType<Hypernucleus::GameDepModel>(
        "Hypernucleus", 1, 0, "GameDepModel");
    qmlRegisterType<Hypernucleus::DependencyModel>(
        "Hypernucleus", 1, 0, "DependencyModel");

    // Create the main view model (owns all services)
    auto* mainViewModel = new Hypernucleus::MainViewModel(&app);

    // Create settings view model
    auto* settingsViewModel = new Hypernucleus::SettingsViewModel(
        mainViewModel->settingsManager(),
        mainViewModel->apiClient(),
        &app
    );

    // Set up QML engine
    QQmlApplicationEngine engine;

    // Expose singletons to QML context
    QQmlContext* ctx = engine.rootContext();
    ctx->setContextProperty("mainViewModel", mainViewModel);
    ctx->setContextProperty("settingsViewModel", settingsViewModel);
    ctx->setContextProperty("apiClient", mainViewModel->apiClient());
    ctx->setContextProperty("authService", mainViewModel->authService());
    ctx->setContextProperty("settingsManager", mainViewModel->settingsManager());
    ctx->setContextProperty("pathManager", mainViewModel->pathManager());
    ctx->setContextProperty("gameManager", mainViewModel->gameManager());

    // Expose OS/arch info
    ctx->setContextProperty("detectedOs",
                             Hypernucleus::SettingsManager::detectOs());
    ctx->setContextProperty("detectedArch",
                             Hypernucleus::SettingsManager::detectArch());
    ctx->setContextProperty("appVersion", app.applicationVersion());

    // Load QML
    const QUrl mainQml(QStringLiteral("qrc:/qml/Main.qml"));
    QObject::connect(
        &engine, &QQmlApplicationEngine::objectCreated,
        &app, [mainQml](QObject* obj, const QUrl& objUrl) {
            if (!obj && mainQml == objUrl)
                QCoreApplication::exit(-1);
        },
        Qt::QueuedConnection
    );

    engine.load(mainQml);

    return app.exec();
}
