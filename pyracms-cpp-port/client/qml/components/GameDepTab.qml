import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Library tab: sidebar (search, filters, categories, game list) on the
// left, the big game page on the right.
Item {
    id: root

    function focusSearch() { sidebar.focusSearch() }

    LibrarySidebar {
        id: sidebar
        anchors.left: parent.left
        anchors.top: parent.top
        anchors.bottom: parent.bottom
        onDetailRequested: detail.forceActiveFocus()
    }

    Rectangle {
        anchors.left: sidebar.right
        anchors.top: parent.top
        anchors.bottom: parent.bottom
        width: 1
        color: Theme.divider
    }

    InfoPanel {
        id: detail
        anchors.left: sidebar.right
        anchors.leftMargin: 1
        anchors.right: parent.right
        anchors.top: parent.top
        anchors.bottom: parent.bottom
    }
}
