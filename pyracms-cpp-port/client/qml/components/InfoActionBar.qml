import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Primary action, version selector, status and favourite/more buttons.
Rectangle {
    id: root

    property var g
    readonly property bool hasGame:
        g !== undefined && g.name !== undefined && g.name !== ""
    property bool failed: false

    Layout.fillWidth: true
    Layout.preferredHeight: 88
    color: Theme.sidebar

    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: Theme.spaceXL
        anchors.rightMargin: Theme.spaceXL
        spacing: Theme.spaceL

        PrimaryButton {
            text: root.hasGame ? root.g.primaryLabel : ""
            kind: root.hasGame ? root.g.primaryKind : "none"
            progress: root.hasGame ? root.g.progress : -1
            enabled: root.hasGame && root.g.primaryEnabled
            onClicked: MainViewModel.primaryAction()
        }
        VersionPicker { g: root.g }
        InfoStatus {
            g: root.g
            failed: root.failed
        }
        ToolButton {
            text: root.hasGame && root.g.favourite ? "★" : "☆"
            font.pixelSize: Theme.fontLarge
            onClicked: MainViewModel.toggleFavourite(root.g.name)
            ToolTip.visible: hovered
            ToolTip.text: qsTr("Favourite")
            Accessible.name: qsTr("Toggle favourite")
        }
        InfoMoreMenu { g: root.g }
    }
}
