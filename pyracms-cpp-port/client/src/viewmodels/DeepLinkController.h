#pragma once

#include "domain/DeepLinkParser.h"

#include <QObject>
#include <QtQml/qqmlregistration.h>

namespace Hypernucleus {

// Holds the pyracms:// link that is waiting for the user's confirmation.
// The window shows a dialog bound to these properties. Whether a link needs
// confirmation at all is decided by MainViewModel (see handleUrl).
class DeepLinkController : public QObject {
    Q_OBJECT
    QML_ELEMENT
    QML_UNCREATABLE("Owned by MainViewModel")
    Q_PROPERTY(bool pending READ pending NOTIFY pendingChanged)
    Q_PROPERTY(QString action READ action NOTIFY pendingChanged)
    Q_PROPERTY(QString slug READ slug NOTIFY pendingChanged)
    Q_PROPERTY(QString name READ name NOTIFY pendingChanged)
    Q_PROPERTY(bool siteMismatch READ siteMismatch NOTIFY pendingChanged)

public:
    explicit DeepLinkController(QObject* parent = nullptr);

    bool pending() const { return m_link.isValid(); }
    QString action() const { return m_link.actionName(); }
    QString slug() const { return m_link.slug; }
    QString name() const { return m_link.name; }
    bool siteMismatch() const { return m_siteMismatch; }

    // Parse and store. Returns false (and emits rejected) for bad links.
    bool setUrl(const QString& url, const QString& currentSlug);
    DeepLink link() const { return m_link; }
    void clear();

    Q_INVOKABLE void accept();
    Q_INVOKABLE void dismiss();

signals:
    void pendingChanged();
    void rejected(const QString& error);
    void accepted(const QString& action, const QString& slug,
                  const QString& name);

private:
    DeepLink m_link;
    bool m_siteMismatch = false;
};

} // namespace Hypernucleus
