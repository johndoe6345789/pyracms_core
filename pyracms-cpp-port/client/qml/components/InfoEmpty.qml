import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Placeholder shown when no game is selected.
ColumnLayout {
    anchors.centerIn: parent
    spacing: Theme.spaceM

    Label {
        text: qsTr("Select a game")
        color: Theme.textBright
        font.pixelSize: Theme.fontTitle
        Layout.alignment: Qt.AlignHCenter
    }
    Label {
        text: qsTr("Pick something from the list to see details, "
                   + "install or play it.")
        color: Theme.textDim
        Layout.alignment: Qt.AlignHCenter
    }
}
