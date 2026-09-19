#include "viewmodels/AppOptions.h"

#include <QCoreApplication>
#include <QImage>
#include <QQmlApplicationEngine>
#include <QQuickWindow>
#include <QTimer>

namespace Hypernucleus {

AppOptions AppOptions::parse(const QStringList& arguments)
{
    AppOptions o;
    for (int i = 1; i + 1 < arguments.size(); ++i) {
        if (arguments.at(i) == "--lang") o.language = arguments.at(i + 1);
        if (arguments.at(i) == "--screenshot")
            o.screenshot = arguments.at(i + 1);
        if (arguments.at(i) == "--open") o.open = arguments.at(i + 1);
    }
    return o;
}

void screenshotAndQuit(QQmlApplicationEngine& engine, const AppOptions& o,
                       int delayMs)
{
    if (o.screenshot.isEmpty() || engine.rootObjects().isEmpty()) return;
    auto* window = qobject_cast<QQuickWindow*>(engine.rootObjects().first());
    if (!window) return;
    if (o.open == "settings")
        QMetaObject::invokeMethod(window, "openSettings");
    const QString file = o.screenshot;
    QTimer::singleShot(delayMs, window, [window, file]() {
        const QImage image = window->grabWindow();
        const bool ok = !image.isNull() && image.save(file, "PNG");
        QCoreApplication::exit(ok ? 0 : 3);
    });
}

} // namespace Hypernucleus
