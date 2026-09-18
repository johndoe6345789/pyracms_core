#pragma once

#include "domain/CatalogParser.h"

#include <initializer_list>

namespace Hypernucleus {
namespace CatalogParser {
namespace detail {

// Tolerant field access shared by the catalog parser parts.
QString firstString(const QJsonObject& o,
                    std::initializer_list<const char*> keys);
qint64 firstNumber(const QJsonObject& o,
                   std::initializer_list<const char*> keys);
QString cleanSha(const QString& s);
QString fileRefOf(const QJsonObject& o);

BinaryInfo parseBinary(const QJsonObject& o);
RevisionInfo parseRevision(const QJsonObject& o);
QStringList parseTags(const QJsonArray& arr);
QStringList parseShots(const QJsonObject& o, QString* hero);
QList<DepRef> parseDeps(const QJsonArray& arr);
QStringList parsePip(const QJsonObject& o);

} // namespace detail
} // namespace CatalogParser
} // namespace Hypernucleus
