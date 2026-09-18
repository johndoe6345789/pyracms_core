#pragma once

#include <QString>

namespace Hypernucleus {

// pyracms://launch/<slug>/<name>   and   pyracms://install/<slug>/<name>
struct DeepLink {
    enum class Action { None, Launch, Install };

    Action action = Action::None;
    QString slug;  // tenant / site slug
    QString name;  // game name
    QString error; // set when parsing failed

    bool isValid() const { return action != Action::None && error.isEmpty(); }
    QString actionName() const;
};

namespace DeepLinkParser {

// Strict parser: exactly scheme "pyracms", host launch|install and two
// path segments. Percent-decoding is applied; slugs and names may not
// contain path separators, "..", control characters or exceed 128 chars.
DeepLink parse(const QString& url);

QString build(DeepLink::Action action, const QString& slug,
              const QString& name);

// Scan command-line arguments for the first pyracms:// URL.
QString findInArguments(const QStringList& args);

} // namespace DeepLinkParser
} // namespace Hypernucleus
