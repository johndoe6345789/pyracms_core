import QtQuick
import Hypernucleus

// Global keyboard shortcuts of the main window.
Item {
    id: root

    signal searchRequested()
    signal tabRequested(int index)
    signal settingsRequested()

    Shortcut {
        sequence: "Ctrl+F"
        onActivated: root.searchRequested()
    }
    Shortcut { sequence: "Ctrl+1"; onActivated: root.tabRequested(0) }
    Shortcut { sequence: "Ctrl+2"; onActivated: root.tabRequested(1) }
    Shortcut { sequence: "Ctrl+,"; onActivated: root.settingsRequested() }
    Shortcut { sequence: "Ctrl+R"; onActivated: MainViewModel.refresh() }
    Shortcut { sequence: "F5"; onActivated: MainViewModel.refresh() }
}
