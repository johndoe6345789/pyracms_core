import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Output of the last game run; only shown when there is any.
ColumnLayout {
    Layout.fillWidth: true
    spacing: Theme.spaceL

    SectionTitle {
        text: qsTr("Last output")
        visible: MainViewModel.gameLog !== ""
    }
    Frame {
        Layout.fillWidth: true
        Layout.preferredHeight: 180
        visible: MainViewModel.gameLog !== ""
        ScrollView {
            anchors.fill: parent
            TextArea {
                readOnly: true
                text: MainViewModel.gameLog
                font.family: "monospace"
                font.pixelSize: Theme.fontSmall
                color: Theme.text
                wrapMode: TextEdit.WrapAnywhere
            }
        }
    }
}
