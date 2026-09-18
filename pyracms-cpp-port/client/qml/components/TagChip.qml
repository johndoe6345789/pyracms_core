import QtQuick
import Hypernucleus

// Small rounded tag. Clickable when a handler is connected to `clicked`.
Rectangle {
    id: chip

    property alias text: label.text
    property bool active: false
    signal clicked()

    implicitWidth: label.implicitWidth + 16
    implicitHeight: 24
    radius: 12
    color: active ? Theme.accent
           : (mouse.containsMouse ? Theme.panelHover : Theme.panel)
    border.width: 1
    border.color: active ? Theme.accent : Theme.divider

    Text {
        id: label
        anchors.centerIn: parent
        color: chip.active ? Theme.accentText : Theme.text
        font.pixelSize: Theme.fontSmall
    }

    MouseArea {
        id: mouse
        anchors.fill: parent
        hoverEnabled: true
        cursorShape: Qt.PointingHandCursor
        onClicked: chip.clicked()
    }
}
