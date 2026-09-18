import QtQuick
import QtQuick.Controls
import Hypernucleus

// Section header of the library list (e.g. INSTALLED / AVAILABLE).
Rectangle {
    required property string section

    width: ListView.view.width
    height: 26
    color: Theme.topBar

    Label {
        anchors.verticalCenter: parent.verticalCenter
        anchors.left: parent.left
        anchors.leftMargin: Theme.spaceM
        text: parent.section.toUpperCase()
        color: Theme.textDim
        font.pixelSize: Theme.fontSmall
        font.bold: true
    }
}
