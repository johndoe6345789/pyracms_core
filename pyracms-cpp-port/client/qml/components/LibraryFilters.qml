import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// All / Installed / Updates chips plus the category combo box.
ColumnLayout {
    id: root

    readonly property var lib: MainViewModel.library

    Layout.fillWidth: true
    spacing: 0

    RowLayout {
        Layout.fillWidth: true
        Layout.leftMargin: Theme.spaceM
        Layout.rightMargin: Theme.spaceM
        spacing: Theme.spaceS

        TagChip {
            text: qsTr("All")
            active: root.lib.filter === GameStates.FilterAll
            onClicked: root.lib.filter = GameStates.FilterAll
        }
        TagChip {
            text: qsTr("Installed")
            active: root.lib.filter === GameStates.FilterInstalled
            onClicked: root.lib.filter = GameStates.FilterInstalled
        }
        TagChip {
            text: qsTr("Updates")
            active: root.lib.filter === GameStates.FilterUpdates
            onClicked: root.lib.filter = GameStates.FilterUpdates
        }
        Item { Layout.fillWidth: true }
    }

    ComboBox {
        id: categoryBox
        Layout.fillWidth: true
        Layout.margins: Theme.spaceM
        model: [qsTr("All categories"), qsTr("Favourites")]
               .concat(MainViewModel.categories)
        onActivated: (index) => {
            if (index === 0)
                root.lib.category = ""
            else if (index === 1)
                root.lib.category = MainViewModel.favouritesCategory
            else
                root.lib.category = MainViewModel.categories[index - 2]
        }
        Accessible.name: qsTr("Category")
    }
}
