import QtQuick
import QtQuick.Layouts
import Hypernucleus

// The store landing page: header, category chips and the tile grid.
Item {
    id: page

    signal opened(string name)

    function focusSearch() { header.focusSearch() }

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: Theme.spaceL
        spacing: Theme.spaceM

        StoreHeader {
            id: header
            onGridRequested: grid.forceActiveFocus()
        }
        StoreCategories {}
        StoreGrid { id: grid; onOpened: (n) => page.opened(n) }
    }
}
