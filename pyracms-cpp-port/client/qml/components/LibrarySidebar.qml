import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Library sidebar: search box, filters, categories and the game list.
Rectangle {
    id: root

    signal detailRequested()

    function focusSearch() {
        search.forceActiveFocus()
        search.selectAll()
    }

    width: Theme.sidebarWidth
    color: Theme.sidebar

    ColumnLayout {
        anchors.fill: parent
        spacing: 0

        TextField {
            id: search
            Layout.fillWidth: true
            Layout.margins: Theme.spaceM
            placeholderText: qsTr("Search games (Ctrl+F)")
            text: MainViewModel.library.searchText
            onTextChanged: MainViewModel.library.searchText = text
            Keys.onDownPressed: list.forceActiveFocus()
            Keys.onEscapePressed: { text = ""; list.forceActiveFocus() }
            Accessible.name: qsTr("Search games")
        }

        LibraryFilters {}
        LibraryList { id: list; onDetailRequested: root.detailRequested() }
    }
}
