import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Controls.Material 2.15
import QtQuick.Layouts 1.15
import "../theme" as Theme

Dialog {
    id: root

    title: "Create Account"
    modal: true
    width: 380
    height: 460
    closePolicy: Popup.CloseOnEscape
    standardButtons: Dialog.NoButton

    property string errorMessage: ""
    property string successMessage: ""

    ColumnLayout {
        anchors.fill: parent
        spacing: Theme.Theme.spacingMedium

        Label {
            text: "Hypernucleus"
            font.pixelSize: Theme.Theme.fontSizeHeader
            font.bold: true
            color: Theme.Theme.primary
            Layout.alignment: Qt.AlignHCenter
        }

        Label {
            text: "Create a new account"
            font.pixelSize: Theme.Theme.fontSizeSmall
            color: Theme.Theme.textSecondary
            Layout.alignment: Qt.AlignHCenter
        }

        Item { Layout.preferredHeight: Theme.Theme.spacingSmall }

        // Username
        TextField {
            id: regUsernameField
            Layout.fillWidth: true
            placeholderText: "Username"
            font.pixelSize: Theme.Theme.fontSizeNormal
            inputMethodHints: Qt.ImhNoAutoUppercase

            Keys.onReturnPressed: regEmailField.forceActiveFocus()
        }

        // Email
        TextField {
            id: regEmailField
            Layout.fillWidth: true
            placeholderText: "Email"
            font.pixelSize: Theme.Theme.fontSizeNormal
            inputMethodHints: Qt.ImhEmailCharactersOnly

            Keys.onReturnPressed: regPasswordField.forceActiveFocus()
        }

        // Password
        TextField {
            id: regPasswordField
            Layout.fillWidth: true
            placeholderText: "Password"
            font.pixelSize: Theme.Theme.fontSizeNormal
            echoMode: TextInput.Password

            Keys.onReturnPressed: regConfirmField.forceActiveFocus()
        }

        // Confirm password
        TextField {
            id: regConfirmField
            Layout.fillWidth: true
            placeholderText: "Confirm Password"
            font.pixelSize: Theme.Theme.fontSizeNormal
            echoMode: TextInput.Password

            Keys.onReturnPressed: registerButton.clicked()
        }

        // Password mismatch warning
        Label {
            text: "Passwords do not match"
            visible: regConfirmField.text.length > 0 &&
                     regPasswordField.text !== regConfirmField.text
            color: Theme.Theme.warning
            font.pixelSize: Theme.Theme.fontSizeSmall
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

        // Success message
        Label {
            text: root.successMessage
            visible: root.successMessage !== ""
            color: Theme.Theme.success
            font.pixelSize: Theme.Theme.fontSizeSmall
            Layout.fillWidth: true
            wrapMode: Text.WordWrap
        }

        Item { Layout.fillHeight: true }

        // Register button
        Button {
            id: registerButton
            text: apiClient.loading ? "Creating account..." : "Register"
            Layout.fillWidth: true
            enabled: regUsernameField.text.length > 0 &&
                     regEmailField.text.length > 0 &&
                     regPasswordField.text.length >= 6 &&
                     regPasswordField.text === regConfirmField.text &&
                     !apiClient.loading
            Material.background: Theme.Theme.primary
            Material.foreground: Theme.Theme.textOnPrimary
            font.pixelSize: Theme.Theme.fontSizeNormal

            onClicked: {
                root.errorMessage = ""
                root.successMessage = ""
                authService.registerUser(
                    regUsernameField.text,
                    regEmailField.text,
                    regPasswordField.text
                )
            }
        }

        // Back to login link
        RowLayout {
            Layout.alignment: Qt.AlignHCenter
            spacing: Theme.Theme.spacingSmall

            Label {
                text: "Already have an account?"
                font.pixelSize: Theme.Theme.fontSizeSmall
                color: Theme.Theme.textSecondary
            }

            Label {
                text: "Sign In"
                font.pixelSize: Theme.Theme.fontSizeSmall
                color: Theme.Theme.primary
                font.underline: true

                MouseArea {
                    anchors.fill: parent
                    cursorShape: Qt.PointingHandCursor
                    onClicked: {
                        root.close()
                        loginDialog.open()
                    }
                }
            }
        }
    }

    Connections {
        target: authService
        function onRegisterSuccess() {
            root.successMessage = "Account created! You can now sign in."
            root.errorMessage = ""
            // Clear fields
            regUsernameField.text = ""
            regEmailField.text = ""
            regPasswordField.text = ""
            regConfirmField.text = ""
            // Switch to login after a delay
            switchTimer.start()
        }
        function onRegisterFailed(error) {
            root.errorMessage = error
            root.successMessage = ""
        }
    }

    Timer {
        id: switchTimer
        interval: 2000
        repeat: false
        onTriggered: {
            root.close()
            loginDialog.open()
        }
    }

    onOpened: {
        root.errorMessage = ""
        root.successMessage = ""
        regUsernameField.forceActiveFocus()
    }
}
