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
    width: Math.min(Theme.dialogWidthWide, parent.width - 2 * Theme.spaceL)
    height: Math.min(600, parent.height - 2 * Theme.spaceL)
    padding: Theme.spaceL
    closePolicy: Popup.CloseOnEscape

    onAboutToShow: ed.cancel()   // discard stale edits, reload from disk

    contentItem: ColumnLayout {
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
    }

    footer: Item {
        implicitHeight: buttons.implicitHeight + Theme.spaceM + Theme.spaceL
        RowLayout {
            id: buttons
            anchors.fill: parent
            anchors.leftMargin: Theme.spaceM
            anchors.rightMargin: Theme.spaceL
            anchors.topMargin: Theme.spaceM
            anchors.bottomMargin: Theme.spaceL
            spacing: Theme.spaceM
            SettingsLanguage {}
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
