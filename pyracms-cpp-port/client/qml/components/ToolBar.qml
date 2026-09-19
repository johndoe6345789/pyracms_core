import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Top bar: brand, LIBRARY / STORE tabs, refresh, theme, account menu.
// (Referenced as HN.ToolBar from Main.qml to keep it apart from the
// Qt Quick Controls ToolBar type.)
Rectangle {
    id: root

    property int currentTab: 0
    signal tabRequested(int index)
    signal settingsRequested()
    signal loginRequested()
    signal connectRequested()

    implicitHeight: 52
    color: Theme.topBar

    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: Theme.spaceL
        anchors.rightMargin: Theme.spaceM
        spacing: 0

        Label {
            text: "HYPERNUCLEUS"
            color: Theme.accent
            font.pixelSize: Theme.fontLarge
            font.bold: true
            font.letterSpacing: 2
            Layout.rightMargin: Theme.spaceXL
        }

        TopTab {
            text: qsTr("LIBRARY")
            selected: root.currentTab === 0
            onClicked: root.tabRequested(0)
        }
        TopTab {
            text: qsTr("STORE")
            selected: root.currentTab === 1
            onClicked: root.tabRequested(1)
        }

        Item { Layout.fillWidth: true }

        BusyIndicator {
            running: MainViewModel.loading
            visible: running
            Layout.preferredWidth: 32
            Layout.preferredHeight: 32
        }
        ToolButton {
            visible: MainViewModel.connection.needsConnect
            text: qsTr("Connect")
            font.bold: true
            onClicked: root.connectRequested()
        }
        ToolButton {
            text: qsTr("Refresh")
            onClicked: MainViewModel.refresh()
            ToolTip.visible: hovered
            ToolTip.text: qsTr("Reload games (Ctrl+R)")
        }
        ThemeToggle {}
        AccountButton {
            onSettingsRequested: root.settingsRequested()
            onLoginRequested: root.loginRequested()
        }
        ToolButton {
            text: qsTr("Settings")
            onClicked: root.settingsRequested()
            ToolTip.visible: hovered
            ToolTip.text: qsTr("Settings (Ctrl+,)")
        }
    }
}
