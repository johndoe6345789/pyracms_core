import QtQuick
import QtQuick.Layouts
import Hypernucleus
import Hypernucleus as HN

// Window body: top bar, Library/Store pages and the download strip.
ColumnLayout {
    id: root

    property int tab: 0     // 0 = Library, 1 = Store
    signal tabRequested(int index)
    signal settingsRequested()
    signal loginRequested()
    signal connectRequested()
    signal showGameRequested(string name)

    function focusSearch() {
        if (tab === 0)
            library.focusSearch()
        else
            store.focusSearch()
    }

    spacing: 0

    HN.ToolBar {
        Layout.fillWidth: true
        currentTab: root.tab
        onTabRequested: (index) => root.tabRequested(index)
        onSettingsRequested: root.settingsRequested()
        onLoginRequested: root.loginRequested()
        onConnectRequested: root.connectRequested()
    }

    StackLayout {
        Layout.fillWidth: true
        Layout.fillHeight: true
        currentIndex: root.tab

        GameDepTab { id: library }
        StoreView { id: store }
    }

    ProgressOverlay {
        Layout.fillWidth: true
        onShowGameRequested: (name) => root.showGameRequested(name)
    }
}
