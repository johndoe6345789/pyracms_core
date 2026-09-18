import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Failure text or "update available" hint next to the version box.
ColumnLayout {
    id: root

    property var g
    readonly property bool hasGame:
        g !== undefined && g.name !== undefined && g.name !== ""
    property bool failed: false

    Layout.fillWidth: true
    spacing: 2

    Label {
        Layout.fillWidth: true
        visible: root.failed
        text: root.hasGame ? root.g.statusText : ""
        color: Theme.danger
        wrapMode: Text.WordWrap
        maximumLineCount: 2
        elide: Text.ElideRight
    }
    Label {
        Layout.fillWidth: true
        visible: !root.failed && root.hasGame && root.g.updateAvailable
        text: root.hasGame
              ? qsTr("Update available: %1").arg(root.g.latestVersion) : ""
        color: Theme.warning
    }
}
