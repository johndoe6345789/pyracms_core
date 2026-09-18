#pragma once

#include <QObject>
#include <QtQml/qqmlregistration.h>

#include "services/AuthService.h"
#include "services/GameManager.h"
#include "services/PathManager.h"
#include "services/SettingsManager.h"

// Makes the library's QObject services known to the QML type system (and so
// to qmllint) without moving them into the QML module.
namespace Hypernucleus {

struct SettingsBaseForeign {
    Q_GADGET
    QML_FOREIGN(SettingsBase)
    QML_ANONYMOUS
};
struct SettingsManagerForeign {
    Q_GADGET
    QML_FOREIGN(SettingsManager)
    QML_ANONYMOUS
};
struct AuthServiceForeign {
    Q_GADGET
    QML_FOREIGN(AuthService)
    QML_ANONYMOUS
};
struct GameManagerForeign {
    Q_GADGET
    QML_FOREIGN(GameManager)
    QML_ANONYMOUS
};
struct PathManagerForeign {
    Q_GADGET
    QML_FOREIGN(PathManager)
    QML_ANONYMOUS
};

} // namespace Hypernucleus
