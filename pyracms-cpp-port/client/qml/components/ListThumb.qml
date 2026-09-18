import QtQuick
import QtQuick.Layouts
import Hypernucleus

// Small square cover (or initial letter) of a library row.
Rectangle {
    id: thumb

    property color accent
    property string cover
    property string title

    Layout.leftMargin: Theme.spaceM
    Layout.preferredWidth: 36
    Layout.preferredHeight: 36
    radius: 2
    color: Qt.darker(accent, 2.2)

    Image {
        anchors.fill: parent
        source: thumb.cover
        fillMode: Image.PreserveAspectCrop
        asynchronous: true
        visible: status === Image.Ready
    }
    Text {
        anchors.centerIn: parent
        text: thumb.title.length > 0
              ? thumb.title.charAt(0).toUpperCase() : "?"
        color: Theme.textBright
        font.bold: true
        visible: thumb.cover === ""
    }
}
