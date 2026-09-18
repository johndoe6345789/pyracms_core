#pragma once

#include <QObject>
#include <QtQml/qqmlregistration.h>

namespace Hypernucleus {

// Special sidebar category (everything else is a tag name).
constexpr const char* CATEGORY_FAVOURITES = "__favourites__";

// Enums shared between C++ and QML: GameStates.Installed, GameStates.FilterAll
// ...
class GameStates : public QObject {
    Q_OBJECT
    QML_ELEMENT
    QML_UNCREATABLE("GameStates only provides enums")

public:
    enum State {
        NotInstalled = 0,
        Installed,
        UpdateAvailable,
        Queued,
        Downloading,
        Verifying,
        Installing,
        Launching,
        Running,
        LaunchFailed,
        InstallFailed
    };
    Q_ENUM(State)

    enum Filter { FilterAll = 0, FilterInstalled, FilterUpdates };
    Q_ENUM(Filter)
};

} // namespace Hypernucleus
