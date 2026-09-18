import QtQuick
import Hypernucleus

// Store tile cover: accent gradient, image, fallback letter and the
// "In library" badge.
Item {
    id: art

    property color accent
    property string cover
    property string title
    property bool installed: false

    Rectangle {
        anchors.fill: parent
        gradient: Gradient {
            GradientStop {
                position: 0.0
                color: Qt.darker(art.accent, 1.6)
            }
            GradientStop {
                position: 1.0
                color: Qt.darker(art.accent, 3.4)
            }
        }
    }
    Image {
        anchors.fill: parent
        source: art.cover
        fillMode: Image.PreserveAspectCrop
        asynchronous: true
        visible: status === Image.Ready
    }
    Text {
        anchors.centerIn: parent
        visible: art.cover === ""
        text: art.title.length > 0
              ? art.title.charAt(0).toUpperCase() : "?"
        color: Qt.rgba(1, 1, 1, 0.55)
        font.pixelSize: 44
        font.bold: true
    }
    Rectangle {
        visible: art.installed
        anchors.top: parent.top
        anchors.right: parent.right
        anchors.margins: Theme.spaceS
        radius: 2
        color: Theme.green
        width: inLib.implicitWidth + 12
        height: 20
        Text {
            id: inLib
            anchors.centerIn: parent
            text: qsTr("In library")
            color: Theme.accentText
            font.pixelSize: Theme.fontSmall
        }
    }
}
