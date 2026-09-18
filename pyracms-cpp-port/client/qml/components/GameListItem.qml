import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// One row of the library sidebar.
ItemDelegate {
    id: row

    required property int index
    required property string name
    required property string title
    required property int gameState
    required property real progress
    required property bool installed
    required property bool updateAvailable
    required property bool favourite
    required property color accent
    required property string cover
    required property string statusText

    readonly property bool failed:
        gameState === GameStates.LaunchFailed
        || gameState === GameStates.InstallFailed
    readonly property bool busy: gameState === GameStates.Queued
                                 || gameState === GameStates.Downloading
                                 || gameState === GameStates.Verifying
                                 || gameState === GameStates.Installing
    readonly property string subtitle:
        gameState === GameStates.Running ? qsTr("Running")
      : gameState === GameStates.Launching ? qsTr("Launching...")
      : gameState === GameStates.LaunchFailed ? qsTr("Launch failed")
      : gameState === GameStates.InstallFailed ? qsTr("Install failed")
      : busy ? statusText
      : updateAvailable ? qsTr("Update available")
      : ""

    height: 52
    hoverEnabled: true
    highlighted: ListView.isCurrentItem
    padding: 0
    Accessible.name: title + (subtitle !== "" ? ", " + subtitle : "")

    background: Rectangle {
        color: row.highlighted ? Theme.rowSelected
             : row.hovered ? Theme.panelHover : "transparent"
        border.width: row.visualFocus ? 1 : 0
        border.color: Theme.focusRing
    }

    contentItem: RowLayout {
        spacing: Theme.spaceM

        ListThumb { accent: row.accent; cover: row.cover; title: row.title }

        ListTitles {
            title: row.title
            subtitle: row.subtitle
            favourite: row.favourite
            bright: row.installed || row.highlighted
            subtitleColor: row.failed ? Theme.danger
                 : row.updateAvailable ? Theme.warning
                 : row.gameState === GameStates.Running
                   ? Theme.success : Theme.accent
        }
        Item { Layout.preferredWidth: Theme.spaceS }
    }

    // Thin progress line while installing
    Rectangle {
        visible: row.busy && row.progress >= 0
        anchors.bottom: parent.bottom
        height: 2
        width: parent.width * Math.min(1, row.progress)
        color: Theme.accent
    }
}
