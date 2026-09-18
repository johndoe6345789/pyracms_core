import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Requirements section listing the game's dependencies.
ColumnLayout {
    Layout.fillWidth: true
    spacing: Theme.spaceL

    SectionTitle { text: qsTr("Requirements") }
    Label {
        visible: MainViewModel.dependencies.count === 0
        text: qsTr("No dependencies")
        color: Theme.textDim
    }
    Repeater {
        model: MainViewModel.dependencies
        delegate: DependencyRow {}
    }
}
