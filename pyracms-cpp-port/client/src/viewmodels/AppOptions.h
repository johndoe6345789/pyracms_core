#pragma once

#include <QString>
#include <QStringList>

class QQmlApplicationEngine;

namespace Hypernucleus {

// Developer / QA switches of the launcher (they never change saved settings):
//   --lang <code>          run in this language (en, es, fr, system)
//   --screenshot <file>    save the first window as PNG after it has been
//                          drawn, then quit
//   --open settings        open the Settings dialog first
struct AppOptions {
    QString language;
    QString screenshot;
    QString open; // "settings": show that dialog before the screenshot

    static AppOptions parse(const QStringList& arguments);
};

// With --screenshot: grabs the first window after `delayMs`, saves it and
// quits. Does nothing for an empty file name.
void screenshotAndQuit(QQmlApplicationEngine& engine, const AppOptions& o,
                       int delayMs = 1500);

} // namespace Hypernucleus
