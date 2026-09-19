import QtQuick
import Hypernucleus

// Login, register, settings and deep-link dialogs of the main window.
Item {
    function openLogin() { connectPanel.close(); loginDialog.open() }
    function openSettings() { connectPanel.close(); settingsDialog.open() }
    function openConnect() { connectPanel.open() }

    LoginDialog {
        id: loginDialog
        onRegisterRequested: registerDialog.open()
    }
    RegisterDialog {
        id: registerDialog
        onBackToLogin: loginDialog.open()
    }
    SettingsDialog { id: settingsDialog }
    ConnectPanel { id: connectPanel }
    ConfirmLinkDialog {}
}
