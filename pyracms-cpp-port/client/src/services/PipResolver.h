#pragma once

#include <QHash>
#include <QMap>
#include <QObject>
#include <QStringList>
#include <functional>

class QNetworkAccessManager;

namespace Hypernucleus {

// "pip first": asks the Python package index whether a package name exists.
// Only names that are NOT on pip are fetched from the PyraCMS dependency API.
// Uses its own network manager so tenant/JWT headers never reach PyPI.
class PipResolver : public QObject {
    Q_OBJECT

public:
    using Callback = std::function<void(const QMap<QString, bool>&)>;

    explicit PipResolver(QObject* parent = nullptr);

    // e.g. https://pypi.org/pypi  (a name is looked up as <base>/<name>/json)
    void setIndexUrl(const QString& base);
    QString indexUrl() const { return m_indexUrl; }

    // PEP 503 normalisation: lowercase, runs of -_. become "-".
    static QString normalizeName(const QString& name);

    // Result maps every requested name to "exists on pip". Unreachable index
    // counts as "not on pip" so offline users fall back to the PyraCMS API.
    void check(const QStringList& names, Callback done);

private:
    QNetworkAccessManager* m_nam;
    QString m_indexUrl;
    QHash<QString, bool> m_cache;
};

} // namespace Hypernucleus
