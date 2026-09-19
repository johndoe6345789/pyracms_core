#pragma once

#include "services/SiteDirectory.h"

#include <QObject>
#include <QString>
#include <QVariantList>
#include <QtQml/qqmlregistration.h>

namespace Hypernucleus {

class SettingsManager;

// Server + site choice shared by the Connect panel and the dialogs.
class ConnectController : public QObject {
    Q_OBJECT
    QML_ANONYMOUS
    Q_PROPERTY(Hypernucleus::SiteDirectory* sites READ sites CONSTANT)
    Q_PROPERTY(QVariantList servers READ servers NOTIFY serversChanged)
    Q_PROPERTY(bool needsConnect READ needsConnect NOTIFY needsConnectChanged)

public:
    ConnectController(SettingsManager* settings, SiteDirectory* sites,
                      QObject* parent = nullptr);

    SiteDirectory* sites() const { return m_sites; }
    // [{value: url, label: url}]: presets, then servers used before.
    QVariantList servers() const;
    // No site chosen yet: the window offers the Connect panel.
    bool needsConnect() const;

    // Empty when `url` is usable, else a message for the user.
    Q_INVOKABLE QString serverError(const QString& url) const;
    // Validates, remembers the server and applies server + site (an account
    // of another server / site is signed out). False when either is invalid.
    Q_INVOKABLE bool connectTo(const QString& url, const QString& site);

signals:
    void serversChanged();
    void needsConnectChanged();

private:
    SettingsManager* m_settings;
    SiteDirectory* m_sites;
};

} // namespace Hypernucleus
