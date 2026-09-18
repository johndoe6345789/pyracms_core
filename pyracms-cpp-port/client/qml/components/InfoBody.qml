import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Everything below the action bar on the game page.
ColumnLayout {
    id: root

    property var g
    readonly property bool hasGame:
        g !== undefined && g.name !== undefined && g.name !== ""

    Layout.fillWidth: true
    Layout.margins: Theme.spaceXL
    spacing: Theme.spaceL

    Label {
        visible: root.hasGame && !root.g.detailLoaded
        text: qsTr("Loading details...")
        color: Theme.textDim
    }
    InfoAbout { g: root.g }
    InfoRequirements {}
    InfoDetails { g: root.g }
    InfoLog {}
}
