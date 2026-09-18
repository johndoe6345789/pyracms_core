import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Store title, game count and search box.
RowLayout {
    id: root

    signal gridRequested()

    function focusSearch() {
        search.forceActiveFocus()
        search.selectAll()
    }

    Layout.fillWidth: true
    spacing: Theme.spaceL

    Label {
        text: qsTr("Browse")
        color: Theme.textBright
        font.pixelSize: Theme.fontTitle
        font.bold: true
    }
    Label {
        text: qsTr("%1 games").arg(MainViewModel.store.count)
        color: Theme.textDim
    }
    Item { Layout.fillWidth: true }
    TextField {
        id: search
        Layout.preferredWidth: 320
        placeholderText: qsTr("Search the store (Ctrl+F)")
        text: MainViewModel.store.searchText
        onTextChanged: MainViewModel.store.searchText = text
        Keys.onDownPressed: root.gridRequested()
        Keys.onEscapePressed: { text = ""; root.gridRequested() }
        Accessible.name: qsTr("Search the store")
    }
}
