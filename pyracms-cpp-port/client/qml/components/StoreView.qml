import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Store / Browse tab: every game of the tenant as a grid. Opening a tile
// pushes the same game page the library uses.
Item {
    id: root

    function focusSearch() {
        if (stack.depth === 1 && stack.currentItem
                && stack.currentItem.focusSearch)
            stack.currentItem.focusSearch()
    }
    function openGame(name) {
        MainViewModel.select(name)
        if (stack.depth === 1)
            stack.push(detailPage)
    }
    function backToGrid() {
        if (stack.depth > 1)
            stack.pop()
    }

    StackView {
        id: stack
        anchors.fill: parent
        initialItem: gridPage
    }

    Component {
        id: detailPage
        InfoPanel {
            showBack: true
            onBackRequested: stack.pop()
        }
    }

    Component {
        id: gridPage
        StoreGridPage { onOpened: (n) => root.openGame(n) }
    }
}
