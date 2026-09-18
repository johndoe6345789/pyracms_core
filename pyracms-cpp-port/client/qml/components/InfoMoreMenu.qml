import QtQuick
import QtQuick.Controls
import Hypernucleus

// The "..." button with install-folder / log / uninstall actions.
ToolButton {
    id: btn

    property var g
    readonly property bool hasGame:
        g !== undefined && g.name !== undefined && g.name !== ""

    text: "⋯"
    font.pixelSize: Theme.fontLarge
    onClicked: moreMenu.open()
    Accessible.name: qsTr("More actions")

    Menu {
        id: moreMenu
        y: btn.height
        MenuItem {
            text: qsTr("Open install folder")
            enabled: btn.hasGame && btn.g.installed
            onTriggered: MainViewModel.openInstallFolder(btn.g.name)
        }
        MenuItem {
            text: qsTr("Open last log")
            onTriggered: MainViewModel.openLogFile(btn.g.name)
        }
        MenuSeparator {}
        MenuItem {
            text: qsTr("Uninstall...")
            enabled: btn.hasGame && btn.g.canUninstall
            onTriggered: confirmUninstall.open()
        }
    }

    Dialog {
        id: confirmUninstall
        parent: Overlay.overlay
        anchors.centerIn: parent
        modal: true
        title: qsTr("Uninstall %1?").arg(btn.hasGame ? btn.g.title : "")
        standardButtons: Dialog.Ok | Dialog.Cancel
        onAccepted: MainViewModel.uninstall(btn.g.name)
        Label {
            text: qsTr("The game files and its downloaded Python "
                       + "packages will be deleted.")
            wrapMode: Text.WordWrap
            width: 320
        }
    }
}
