import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Intro text plus server / site / username / password inputs.
ColumnLayout {
    id: root

    property alias server: serverField
    property alias site: siteField
    property alias user: userField
    property alias pass: passField
    signal submitted()

    Layout.fillWidth: true
    spacing: Theme.spaceM

    Label {
        Layout.fillWidth: true
        wrapMode: Text.WordWrap
        color: Theme.textDim
        text: qsTr("Your account belongs to one site. Enter its slug "
                   + "(the name in the site address) together with "
                   + "your username.")
    }
    AuthField {
        id: serverField
        placeholderText: qsTr("Server URL, e.g. https://games.example.com")
        inputMethodHints: Qt.ImhUrlCharactersOnly | Qt.ImhNoAutoUppercase
        KeyNavigation.tab: siteField
        Accessible.name: qsTr("Server URL")
    }
    AuthField {
        id: siteField
        placeholderText: qsTr("Site (tenant slug)")
        KeyNavigation.tab: userField
        Accessible.name: qsTr("Site slug")
    }
    AuthField {
        id: userField
        placeholderText: qsTr("Username")
        KeyNavigation.tab: passField
        Accessible.name: qsTr("Username")
    }
    AuthField {
        id: passField
        placeholderText: qsTr("Password")
        echoMode: TextInput.Password
        onAccepted: root.submitted()
        Accessible.name: qsTr("Password")
    }
}
