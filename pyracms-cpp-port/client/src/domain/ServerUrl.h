#pragma once

#include <QString>
#include <QStringList>

namespace Hypernucleus {
namespace ServerUrl {

constexpr int MaxRecent = 8;

// Servers offered out of the box (local Docker stack, public site).
QStringList presets();
// "http(s)://host[:port][/path]" without trailing slash; empty if invalid.
QString normalize(const QString& text);
// Empty when `text` is a usable server address, else a short reason.
QString error(const QString& text);
// Most-recent-first list with `url` on top, no duplicates, capped.
QStringList remember(const QStringList& recent, const QString& url);
// Presets followed by the recent servers, without duplicates.
QStringList choices(const QStringList& recent);

} // namespace ServerUrl
} // namespace Hypernucleus
