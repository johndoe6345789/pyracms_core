import QtQuick
import Hypernucleus

// Login, register, settings and deep-link dialogs of the main window.
Item {
    function openLogin() { loginDialog.open() }
    function openSettings() { settingsDialog.open() }

    LoginDialog {
        id: loginDialog
        onRegisterRequested: registerDialog.open()
    }
    RegisterDialog {
        id: registerDialog
        onBackToLogin: loginDialog.open()
    }
    SettingsDialog { id: settingsDialog }
    ConfirmLinkDialog {}
}
