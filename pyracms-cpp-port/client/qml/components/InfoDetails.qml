import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Details section: versions, size, location, type, dates, views.
ColumnLayout {
    id: root

    property var g
    readonly property bool hasGame:
        g !== undefined && g.name !== undefined && g.name !== ""

    readonly property string kindText: !hasGame || !g.installed ? ""
        : g.kind === "native" ? qsTr("Native build") : qsTr("Python game")

    Layout.fillWidth: true
    spacing: Theme.spaceL

    SectionTitle { text: qsTr("Details") }
    ColumnLayout {
        Layout.fillWidth: true
        spacing: Theme.spaceS
        DetailRow {
            label: qsTr("Latest version")
            value: root.hasGame ? root.g.latestVersion : ""
        }
        DetailRow {
            label: qsTr("Download size")
            value: !root.hasGame || !root.g.downloadSize ? ""
                : root.g.downloadNote
                  ? root.g.downloadSize + " (" + root.g.downloadNote + ")"
                  : root.g.downloadSize
        }
        DetailRow {
            label: qsTr("Publisher")
            value: root.hasGame ? root.g.owner : ""
        }
        DetailRow {
            label: qsTr("Downloads")
            value: root.hasGame && root.g.downloads > 0
                   ? String(root.g.downloads) : ""
        }
        DetailRow {
            label: qsTr("Installed version")
            value: root.hasGame ? root.g.installedVersion : ""
        }
        DetailRow {
            label: qsTr("Size on disk")
            value: root.hasGame ? root.g.installSize : ""
        }
        DetailRow {
            label: qsTr("Location")
            value: root.hasGame ? root.g.installPath : ""
        }
        DetailRow { label: qsTr("Type"); value: root.kindText }
        DetailRow {
            label: qsTr("Added")
            value: root.hasGame ? root.g.createdAt : ""
        }
        DetailRow {
            label: qsTr("Views")
            value: root.hasGame && root.g.views > 0
                   ? String(root.g.views) : ""
        }
    }
}
