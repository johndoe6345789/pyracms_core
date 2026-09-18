import QtQuick
import QtQuick.Controls
import Hypernucleus

// Modal full-size screenshot viewer; Left/Right browse.
Popup {
    id: viewer

    property var screenshots: []
    property int current: 0

    function openAt(i) {
        current = i
        open()
        forceActiveFocus()
    }
    function step(delta) {
        const n = screenshots.length
        if (n > 0)
            current = (current + delta + n) % n
    }

    parent: Overlay.overlay
    modal: true
    anchors.centerIn: parent
    width: Math.min(parent.width - 80, 1100)
    height: Math.min(parent.height - 80, 700)
    padding: 0

    background: Rectangle { color: "black"; radius: Theme.radius }
    contentItem: Item {
        focus: true
        Keys.onLeftPressed: viewer.step(-1)
        Keys.onRightPressed: viewer.step(1)
        Image {
            anchors.fill: parent
            anchors.margins: 8
            source: viewer.screenshots.length > viewer.current
                    ? viewer.screenshots[viewer.current] : ""
            fillMode: Image.PreserveAspectFit
            asynchronous: true
        }
        Text {
            anchors.bottom: parent.bottom
            anchors.horizontalCenter: parent.horizontalCenter
            anchors.margins: 10
            text: (viewer.current + 1) + " / " + viewer.screenshots.length
            color: "white"
        }
    }
}
