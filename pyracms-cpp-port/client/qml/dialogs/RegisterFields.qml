import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Server / site dropdowns, username, email, password and repeat.
ColumnLayout {
    id: root

    property alias server: connect.server
    property alias site: connect.site
    property alias user: userField
    property alias email: emailField
    property alias pass: passField
    property alias confirm: confirmField
    signal submitted()

    function refreshSites() { connect.refreshSites() }

    Layout.fillWidth: true
    spacing: Theme.spaceS

    ConnectFields { id: connect }
    FieldLabel { text: qsTr("Username"); Layout.topMargin: Theme.spaceM }
    AuthField { id: userField }
    FieldLabel { text: qsTr("Email") }
    AuthField {
        id: emailField
        inputMethodHints: Qt.ImhEmailCharactersOnly
    }
    FieldLabel { text: qsTr("Password") }
    AuthField { id: passField; echoMode: TextInput.Password }
    FieldLabel { text: qsTr("Repeat password") }
    AuthField {
        id: confirmField
        echoMode: TextInput.Password
        onAccepted: root.submitted()
    }
}
