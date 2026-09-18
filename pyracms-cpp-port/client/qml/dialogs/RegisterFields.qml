import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Site / username / email / password / repeat inputs.
ColumnLayout {
    id: root

    property alias site: siteField
    property alias user: userField
    property alias email: emailField
    property alias pass: passField
    property alias confirm: confirmField
    signal submitted()

    Layout.fillWidth: true
    spacing: Theme.spaceM

    AuthField {
        id: siteField
        placeholderText: qsTr("Site (tenant slug)")
        KeyNavigation.tab: userField
    }
    AuthField {
        id: userField
        placeholderText: qsTr("Username")
        KeyNavigation.tab: emailField
    }
    AuthField {
        id: emailField
        placeholderText: qsTr("Email")
        inputMethodHints: Qt.ImhEmailCharactersOnly
        KeyNavigation.tab: passField
    }
    AuthField {
        id: passField
        placeholderText: qsTr("Password")
        echoMode: TextInput.Password
        KeyNavigation.tab: confirmField
    }
    AuthField {
        id: confirmField
        placeholderText: qsTr("Repeat password")
        echoMode: TextInput.Password
        onAccepted: root.submitted()
    }
}
