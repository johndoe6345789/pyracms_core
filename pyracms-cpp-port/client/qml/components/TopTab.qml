import QtQuick
import QtQuick.Controls
import Hypernucleus

// A LIBRARY / STORE style tab in the top bar.
Item {
    id: tab

    property alias text: lbl.text
    property bool selected: false
    signal clicked()

    implicitWidth: lbl.implicitWidth + 36
    implicitHeight: 52
    activeFocusOnTab: true
    Accessible.role: Accessible.PageTab
    Accessible.name: text

    Label {
        id: lbl
        anchors.centerIn: parent
        color: tab.selected ? Theme.textBright
               : (hover.hovered ? Theme.text : Theme.textDim)
        font.pixelSize: Theme.fontMedium
        font.bold: true
        font.letterSpacing: 1
    }
    Rectangle {
        anchors.bottom: parent.bottom
        width: parent.width
        height: 3
        color: Theme.accent
        visible: tab.selected
    }
    Rectangle {
        anchors.fill: parent
        color: "transparent"
        border.width: tab.activeFocus ? 1 : 0
        border.color: Theme.focusRing
    }
    HoverHandler { id: hover }
    TapHandler { onTapped: tab.clicked() }
    Keys.onReturnPressed: tab.clicked()
    Keys.onSpacePressed: tab.clicked()
}
