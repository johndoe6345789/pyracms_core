import QtQuick
import QtQuick.Controls
import Hypernucleus

// "Sign in" button, or the user name with a Settings / Sign out menu.
ToolButton {
    id: account

    signal settingsRequested()
    signal loginRequested()

    text: MainViewModel.auth.authenticated
          ? MainViewModel.auth.username : qsTr("Sign in")
    font.bold: true
    onClicked: MainViewModel.auth.authenticated
               ? accountMenu.open() : account.loginRequested()
    Accessible.name: qsTr("Account")

    Menu {
        id: accountMenu
        y: account.height
        MenuItem {
            text: qsTr("Settings...")
            onTriggered: account.settingsRequested()
        }
        MenuItem {
            text: qsTr("Sign out")
            onTriggered: MainViewModel.logout()
        }
    }
}
