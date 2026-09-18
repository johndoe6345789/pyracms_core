import QtQuick
import Hypernucleus

// Big banner at the top of a game page: cover art when the server has
// some, otherwise a gradient in the game's accent colour, fading into
// the page.
Item {
    id: root

    property url source
    property color accent: Theme.accentDim
    property string title
    property string subtitle

    Rectangle {
        anchors.fill: parent
        gradient: Gradient {
            GradientStop {
                position: 0.0
                color: Qt.darker(root.accent, 1.5)
            }
            GradientStop {
                position: 1.0
                color: Qt.darker(root.accent, 3.4)
            }
        }
    }

    Image {
        id: art
        anchors.fill: parent
        source: root.source
        fillMode: Image.PreserveAspectCrop
        asynchronous: true
        cache: true
        visible: status === Image.Ready
    }

    // Fade into the page background.
    Rectangle {
        anchors.fill: parent
        gradient: Gradient {
            GradientStop {
                position: 0.35
                color: Qt.rgba(Theme.bg.r, Theme.bg.g, Theme.bg.b, 0)
            }
            GradientStop { position: 1.0; color: Theme.bg }
        }
    }

    Column {
        anchors.left: parent.left
        anchors.bottom: parent.bottom
        anchors.margins: Theme.spaceXL
        spacing: Theme.spaceS
        width: parent.width - 2 * Theme.spaceXL

        Text {
            width: parent.width
            text: root.title
            color: Theme.textBright
            font.pixelSize: Theme.fontHero
            font.bold: true
            elide: Text.ElideRight
            style: Text.Outline
            styleColor: Qt.rgba(0, 0, 0, 0.45)
        }
        Text {
            width: parent.width
            visible: text !== ""
            text: root.subtitle
            color: Theme.text
            font.pixelSize: Theme.fontMedium
            elide: Text.ElideRight
        }
    }
}
