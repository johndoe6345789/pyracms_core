import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Scrollable grid of store tiles.
GridView {
    id: grid

    signal opened(string name)

    readonly property int columns: Math.max(1, Math.floor(width / 240))

    Layout.fillWidth: true
    Layout.fillHeight: true
    clip: true
    model: MainViewModel.store
    activeFocusOnTab: true
    keyNavigationEnabled: true
    boundsBehavior: Flickable.StopAtBounds
    ScrollBar.vertical: ScrollBar {}

    cellWidth: Math.floor(width / columns)
    cellHeight: 310

    delegate: StoreCell { onOpened: (n) => grid.opened(n) }

    Keys.onReturnPressed: {
        if (currentIndex >= 0)
            opened(MainViewModel.store.nameAt(currentIndex))
    }

    ListEmpty { visible: grid.count === 0; noneText: qsTr("No games found.") }
}
