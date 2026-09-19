#pragma once

#include <QFile>
#include <QJsonDocument>
#include <QJsonObject>
#include <QString>

// JSON files captured from the live backend (tests/fixtures).
inline QJsonObject fixtureJson(const QString& name)
{
    QFile f(QStringLiteral(FIXTURE_DIR) + "/" + name);
    if (!f.open(QIODevice::ReadOnly)) return {};
    return QJsonDocument::fromJson(f.readAll()).object();
}
