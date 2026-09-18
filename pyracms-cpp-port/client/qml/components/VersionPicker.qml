import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Labelled combo box choosing which version to install/play.
ColumnLayout {
    id: root

    property var g
    readonly property bool hasGame:
        g !== undefined && g.name !== undefined && g.name !== ""

    spacing: 2
    visible: hasGame && g.versions.length > 0

    Label {
        text: qsTr("Version")
        color: Theme.textDim
        font.pixelSize: Theme.fontSmall
    }
    ComboBox {
        id: versionBox
        implicitWidth: 150
        model: root.hasGame ? root.g.versions : []
        currentIndex: root.hasGame
            ? Math.max(0, root.g.versions.indexOf(root.g.selectedVersion))
            : 0
        onActivated: MainViewModel.selectVersion(currentText)
        Accessible.name: qsTr("Version")
    }
}
