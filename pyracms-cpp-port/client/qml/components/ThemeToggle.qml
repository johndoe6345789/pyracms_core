import QtQuick.Controls
import Hypernucleus

// Light / dark theme switch button.
ToolButton {
    text: MainViewModel.settings.darkMode ? qsTr("Light") : qsTr("Dark")
    onClicked: {
        const s = MainViewModel.settings
        s.darkMode = !s.darkMode
        s.save()
    }
    ToolTip.visible: hovered
    ToolTip.text: qsTr("Switch theme")
}
