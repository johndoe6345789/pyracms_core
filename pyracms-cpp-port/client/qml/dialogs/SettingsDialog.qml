import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Settings: server, site, install folder, appearance, Python.
// Edits are kept in MainViewModel.settingsEditor until Save is pressed.
Dialog {
    id: root

    readonly property var ed: MainViewModel.settingsEditor

    title: qsTr("Settings")
    modal: true
    parent: Overlay.overlay
    anchors.centerIn: parent
    width: 560
    height: Math.min(560, parent.height - 60)
    closePolicy: Popup.CloseOnEscape

    onAboutToShow: ed.cancel()   // discard stale edits, reload from disk

    ColumnLayout {
        anchors.fill: parent
        spacing: Theme.spaceM

        TabBar {
            id: tabs
            Layout.fillWidth: true
            TabButton { text: qsTr("General") }
            TabButton { text: qsTr("Python") }
            TabButton { text: qsTr("Links") }
        }

        StackLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            currentIndex: tabs.currentIndex

            SettingsGeneralTab { ed: root.ed }
            SettingsPythonTab { ed: root.ed }
            SettingsLinksTab {}
        }

        RowLayout {
            Layout.fillWidth: true
            Button {
                text: qsTr("Reset to defaults")
                flat: true
                onClicked: root.ed.resetDefaults()
            }
            Item { Layout.fillWidth: true }
            Button {
                text: qsTr("Cancel")
                onClicked: { root.ed.cancel(); root.close() }
            }
            Button {
                text: qsTr("Save")
                highlighted: true
                enabled: root.ed.isDirty && root.ed.urlError === ""
                onClicked: { root.ed.save(); root.close() }
            }
        }
    }
}
