import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Interface language: follows the system or is one of the shipped
// translations. Applied at once (the window retranslates), no Save needed.
RowLayout {
    id: root

    readonly property var settings: MainViewModel.settings
    readonly property var codes: ["system", "en", "es", "fr"]

    spacing: Theme.spaceS

    Label {
        text: qsTr("Language")
        color: Theme.textDim
    }
    ComboBox {
        id: box
        implicitWidth: 170
        Accessible.name: qsTr("Language")
        // Language names stay in their own language.
        model: [qsTr("System default"), "English", "Español", "Français"]
        currentIndex: Math.max(0, root.codes.indexOf(root.settings.language))
        onActivated: function(index) {
            root.settings.language = root.codes[index]
            root.settings.save()
        }
    }
}
