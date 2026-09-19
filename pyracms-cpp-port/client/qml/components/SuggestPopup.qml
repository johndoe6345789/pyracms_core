import QtQuick
import QtQuick.Controls
import Hypernucleus

// Dropdown list of a SuggestBox: rows are [{value, label}].
Popup {
    id: root

    property var matches: []
    property alias currentIndex: list.currentIndex
    signal picked(string value)

    function next() { list.incrementCurrentIndex() }
    function previous() { list.decrementCurrentIndex() }

    padding: 1
    closePolicy: Popup.CloseOnEscape | Popup.CloseOnPressOutsideParent
    background: Rectangle {
        color: Theme.panel
        border.color: Theme.divider
        radius: Theme.radius
    }
    contentItem: ListView {
        id: list
        clip: true
        currentIndex: -1
        model: root.matches
        implicitHeight: Math.min(contentHeight, 200)
        ScrollBar.vertical: ScrollBar {}
        delegate: ItemDelegate {
            width: ListView.view.width
            text: modelData.label
            highlighted: ListView.isCurrentItem
            onClicked: root.picked(modelData.value)
        }
    }
}
