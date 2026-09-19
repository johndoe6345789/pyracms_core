#include <QFileOpenEvent>
#include <QGuiApplication>
#include <QLocale>
#include <QQmlApplicationEngine>
#include <QQuickStyle>
#include <QTimer>
#include <QUrl>

#include "domain/DeepLinkParser.h"
#include "services/LanguageManager.h"
#include "services/SettingsManager.h"
#include "services/SingleInstance.h"
#include "viewmodels/AppOptions.h"
#include "viewmodels/LanguageWiring.h"
#include "viewmodels/MainViewModel.h"
#include "viewmodels/UrlEventFilter.h"

using namespace Hypernucleus;

int main(int argc, char* argv[])
{
    QGuiApplication app(argc, argv);
    app.setOrganizationName("PyraCMS");
    app.setOrganizationDomain("pyracms.com");
    app.setApplicationName("Hypernucleus");
    app.setApplicationVersion("0.2.0");

    // One launcher per user: hand pyracms:// links to the running one.
    const QString link = DeepLinkParser::findInArguments(app.arguments());
    SingleInstance single;
    if (single.sendToPrimary(link.isEmpty() ? QStringLiteral("focus") : link))
        return 0;
    single.listenAsPrimary();

    QQuickStyle::setStyle("Material");

    // Saved language, or the system's; changed live from Settings.
    LanguageManager languages;
    const AppOptions options = AppOptions::parse(app.arguments());
    {
        SettingsManager tempSettings;
        languages.apply(options.language.isEmpty() ? tempSettings.language()
                                                   : options.language);
    }

    auto* viewModel = new MainViewModel(&app);
    MainViewModel::setInstance(viewModel);
    app.installEventFilter(new UrlEventFilter(viewModel));

    QObject::connect(&single, &SingleInstance::messageReceived, viewModel,
                     [viewModel](const QString& message) {
                         if (message == QLatin1String("focus"))
                             emit viewModel->raiseWindow();
                         else
                             viewModel->handleUrl(message);
                     });

    QQmlApplicationEngine engine;
    engine.addImportPath(QStringLiteral("qrc:/qt/qml"));
    bindLanguage(&languages, &engine, viewModel);

    const QUrl mainQml(QStringLiteral("qrc:/qt/qml/Hypernucleus/qml/Main.qml"));
    QObject::connect(
        &engine, &QQmlApplicationEngine::objectCreated, &app,
        [mainQml](QObject* obj, const QUrl& objUrl) {
            if (!obj && mainQml == objUrl) QCoreApplication::exit(-1);
        },
        Qt::QueuedConnection);
    engine.load(mainQml);
    screenshotAndQuit(engine, options);

    if (!link.isEmpty())
        QTimer::singleShot(0, viewModel,
                           [viewModel, link]() { viewModel->handleUrl(link); });

    return app.exec();
}
