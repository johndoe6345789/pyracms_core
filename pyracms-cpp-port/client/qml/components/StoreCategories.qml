import QtQuick
import QtQuick.Layouts
import Hypernucleus

// Category chips filtering the store grid.
Flow {
    id: root

    readonly property var store: MainViewModel.store

    Layout.fillWidth: true
    spacing: Theme.spaceM
    visible: MainViewModel.categories.length > 0

    TagChip {
        text: qsTr("All")
        active: root.store.category === ""
        onClicked: root.store.category = ""
    }
    Repeater {
        model: MainViewModel.categories
        TagChip {
            id: chip
            required property string modelData
            text: chip.modelData
            active: root.store.category === chip.modelData
            onClicked: root.store.category =
                root.store.category === chip.modelData ? "" : chip.modelData
        }
    }
}
