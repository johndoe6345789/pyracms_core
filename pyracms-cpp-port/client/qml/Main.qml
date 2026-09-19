import QtQuick
import QtQuick.Controls
import QtQuick.Controls.Material
import Hypernucleus

ApplicationWindow {
    id: root

    property int tab: 0     // 0 = Library, 1 = Store

    width: 1280
    height: 800
    minimumWidth: 900
    minimumHeight: 600
    visible: true
    title: qsTr("Hypernucleus")
    color: Theme.bg

    Material.theme: Theme.isDark ? Material.Dark : Material.Light
    Material.accent: Theme.accent
    Material.background: Theme.bg
    Material.primary: Theme.topBar

    // The theme singleton follows the saved setting (dark by default).
    Binding {
        target: Theme
        property: "isDark"
        value: MainViewModel.settings.darkMode
    }

    function focusSearch() { content.focusSearch() }

    function showGame(name) { tab = 0; MainViewModel.select(name) }

    Component.onCompleted: {
        const geom = MainViewModel.settings.windowGeometry
        if (geom.width >= minimumWidth && geom.height >= minimumHeight) {
            x = geom.x; y = geom.y
            width = geom.width; height = geom.height
        }
        // No sign-in wall: public games work anonymously.
        if (MainViewModel.connection.needsConnect)
            Qt.callLater(dialogs.openConnect)
    }

    onClosing: {
        MainViewModel.settings.windowGeometry =
            Qt.rect(x, y, width, height)
        MainViewModel.settings.save()
    }

    AppShortcuts {
        onSearchRequested: root.focusSearch()
        onTabRequested: (index) => root.tab = index
        onSettingsRequested: dialogs.openSettings()
    }

    Connections {
        target: MainViewModel
        function onShowGame(name) { root.showGame(name) }
        function onRaiseWindow() {
            root.show(); root.raise(); root.requestActivate()
        }
    }

    MainContent {
        id: content
        anchors.fill: parent
        tab: root.tab
        onTabRequested: (index) => root.tab = index
        onSettingsRequested: dialogs.openSettings()
        onLoginRequested: dialogs.openLogin()
        onConnectRequested: dialogs.openConnect()
        onShowGameRequested: (name) => root.showGame(name)
    }

    AppDialogs { id: dialogs }
    Toast {}
}
