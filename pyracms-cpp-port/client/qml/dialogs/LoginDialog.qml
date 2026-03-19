import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Controls.Material 2.15
import QtQuick.Layouts 1.15
import "../theme" as Theme

Dialog {
    id: root

    title: "Login to Hypernucleus"
    modal: true
    width: 380
    height: 340
    closePolicy: Popup.NoAutoClose
    standardButtons: Dialog.NoButton

    property string errorMessage: ""

    ColumnLayout {
        anchors.fill: parent
        spacing: Theme.Theme.spacingMedium

        // Logo/header area
        Label {
            text: "Hypernucleus"
            font.pixelSize: Theme.Theme.fontSizeHeader
            font.bold: true
            color: Theme.Theme.primary
            Layout.alignment: Qt.AlignHCenter
        }

        Label {
            text: "Sign in to manage your games and dependencies"
            font.pixelSize: Theme.Theme.fontSizeSmall
            color: Theme.Theme.textSecondary
            Layout.alignment: Qt.AlignHCenter
            wrapMode: Text.WordWrap
            Layout.fillWidth: true
            horizontalAlignment: Text.AlignHCenter
        }

        Item { Layout.preferredHeight: Theme.Theme.spacingNormal }

        // Username
        TextField {
            id: usernameField
            Layout.fillWidth: true
            placeholderText: "Username"
            font.pixelSize: Theme.Theme.fontSizeNormal
            inputMethodHints: Qt.ImhNoAutoUppercase

            Keys.onReturnPressed: passwordField.forceActiveFocus()
            Keys.onEnterPressed: passwordField.forceActiveFocus()
        }

        // Password
        TextField {
            id: passwordField
            Layout.fillWidth: true
            placeholderText: "Password"
            font.pixelSize: Theme.Theme.fontSizeNormal
            echoMode: TextInput.Password

            Keys.onReturnPressed: loginButton.clicked()
            Keys.onEnterPressed: loginButton.clicked()
        }

        // Error message
        Label {
            text: root.errorMessage
            visible: root.errorMessage !== ""
            color: Theme.Theme.error
            font.pixelSize: Theme.Theme.fontSizeSmall
            Layout.fillWidth: true
            wrapMode: Text.WordWrap
        }

        Item { Layout.fillHeight: true }

        // Login button
        Button {
            id: loginButton
            text: apiClient.loading ? "Signing in..." : "Sign In"
            Layout.fillWidth: true
            enabled: usernameField.text.length > 0 &&
                     passwordField.text.length > 0 &&
                     !apiClient.loading
            Material.background: Theme.Theme.primary
            Material.foreground: Theme.Theme.textOnPrimary
            font.pixelSize: Theme.Theme.fontSizeNormal

            onClicked: {
                root.errorMessage = ""
                authService.login(usernameField.text, passwordField.text)
            }
        }

        // Register link
        RowLayout {
            Layout.alignment: Qt.AlignHCenter
            spacing: Theme.Theme.spacingSmall

            Label {
                text: "Don't have an account?"
                font.pixelSize: Theme.Theme.fontSizeSmall
                color: Theme.Theme.textSecondary
            }

            Label {
                text: "Register"
                font.pixelSize: Theme.Theme.fontSizeSmall
                color: Theme.Theme.primary
                font.underline: true

                MouseArea {
                    anchors.fill: parent
                    cursorShape: Qt.PointingHandCursor
                    onClicked: {
                        root.close()
                        registerDialog.open()
                    }
                }
            }
        }

        // Skip login (for browsing without auth)
        Button {
            text: "Continue without login"
            Layout.alignment: Qt.AlignHCenter
            flat: true
            font.pixelSize: Theme.Theme.fontSizeSmall
            Material.foreground: Theme.Theme.textSecondary

            onClicked: {
                root.close()
                mainViewModel.refreshCatalog()
            }
        }
    }

    Connections {
        target: authService
        function onLoginFailed(error) {
            root.errorMessage = error
        }
        function onLoginSuccess() {
            root.errorMessage = ""
            usernameField.text = ""
            passwordField.text = ""
        }
    }

    onOpened: {
        root.errorMessage = ""
        usernameField.forceActiveFocus()
    }
}
