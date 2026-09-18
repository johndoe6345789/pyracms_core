import QtQuick
import QtQuick.Controls
import Hypernucleus

// Screenshot strip. Click (or Enter) opens a viewer; Left/Right browse.
Item {
    id: root

    property var screenshots: []

    implicitHeight: strip.height

    ListView {
        id: strip
        width: parent.width
        height: 150
        orientation: ListView.Horizontal
        spacing: Theme.spaceM
        clip: true
        model: root.screenshots
        keyNavigationEnabled: true
        activeFocusOnTab: true

        delegate: Rectangle {
            id: shot
            required property int index
            required property string modelData
            width: 266
            height: 150
            color: Theme.panel
            border.width: ListView.isCurrentItem && strip.activeFocus ? 2 : 0
            border.color: Theme.accent

            Image {
                anchors.fill: parent
                source: shot.modelData
                fillMode: Image.PreserveAspectCrop
                asynchronous: true
            }
            MouseArea {
                anchors.fill: parent
                cursorShape: Qt.PointingHandCursor
                onClicked: {
                    strip.currentIndex = shot.index
                    viewer.openAt(shot.index)
                }
            }
        }
        Keys.onReturnPressed: viewer.openAt(currentIndex)
        Keys.onEnterPressed: viewer.openAt(currentIndex)
    }

    ScreenshotViewer { id: viewer; screenshots: root.screenshots }
}
