import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Download manager strip at the bottom of the window (Steam style):
// what is being installed, progress, speed, queue and Cancel.
Rectangle {
    id: root

    readonly property var dl: MainViewModel.downloads
    signal showGameRequested(string name)

    visible: dl.busy
    implicitHeight: visible ? 72 : 0
    color: Theme.topBar

    Rectangle {
        anchors.top: parent.top
        width: parent.width
        height: 1
        color: Theme.divider
    }

    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: Theme.spaceL
        anchors.rightMargin: Theme.spaceL
        spacing: Theme.spaceL

        DownloadInfo { dl: root.dl }
        DownloadBar { dl: root.dl }

        Label {
            Layout.preferredWidth: 90
            horizontalAlignment: Text.AlignRight
            text: root.dl.speedText
            color: Theme.text
        }

        Button {
            text: qsTr("View")
            onClicked: root.showGameRequested(root.dl.activeName)
        }
        Button {
            text: qsTr("Cancel")
            onClicked: root.dl.cancelActive()
            Accessible.name: qsTr("Cancel download")
        }
    }
}
