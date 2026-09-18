#include <QFileOpenEvent>
#include <QGuiApplication>
#include <QLocale>
#include <QQmlApplicationEngine>
#include <QQuickStyle>
#include <QTimer>
#include <QTranslator>
#include <QUrl>

#include "domain/DeepLinkParser.h"
#include "services/SettingsManager.h"
#include "services/SingleInstance.h"
#include "viewmodels/MainViewModel.h"

using namespace Hypernucleus;

namespace {

// macOS delivers pyracms:// URLs as QFileOpenEvent instead of arguments.
class UrlEventFilter : public QObject {
public:
    explicit UrlEventFilter(MainViewModel* vm) : QObject(vm), m_vm(vm) {}

protected:
    bool eventFilter(QObject* watched, QEvent* event) override
    {
        if (event->type() == QEvent::FileOpen) {
            const QUrl url = static_cast<QFileOpenEvent*>(event)->url();
            if (url.isValid()) {
                m_vm->handleUrl(url.toString());
                return true;
            }
        }
        return QObject::eventFilter(watched, event);
    }

private:
    MainViewModel* m_vm;
};

} // namespace

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

    QTranslator translator;
    {
        SettingsManager tempSettings;
        const QString lang = tempSettings.language();
        if (!lang.isEmpty() && lang != "en"
            && translator.load("hypernucleus_" + lang, ":/translations")) {
            app.installTranslator(&translator);
        }
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

    const QUrl mainQml(QStringLiteral("qrc:/qt/qml/Hypernucleus/qml/Main.qml"));
    QObject::connect(
        &engine, &QQmlApplicationEngine::objectCreated,
        &app, [mainQml](QObject* obj, const QUrl& objUrl) {
            if (!obj && mainQml == objUrl)
                QCoreApplication::exit(-1);
        },
        Qt::QueuedConnection);
    engine.load(mainQml);

    if (!link.isEmpty())
        QTimer::singleShot(0, viewModel, [viewModel, link]() { viewModel->handleUrl(link); });

    return app.exec();
}
