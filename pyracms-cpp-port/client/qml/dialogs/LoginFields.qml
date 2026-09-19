import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Intro text, server / site dropdowns, username and password.
ColumnLayout {
    id: root

    property alias server: connect.server
    property alias site: connect.site
    property alias user: userField
    property alias pass: passField
    signal submitted()

    function refreshSites() { connect.refreshSites() }

    Layout.fillWidth: true
    spacing: Theme.spaceM

    Label {
        Layout.fillWidth: true
        Layout.preferredWidth: 0
        wrapMode: Text.WordWrap
        color: Theme.textDim
        text: qsTr("Signing in is optional: public games install and "
                   + "play without an account. Sign in for private "
                   + "games and account features.")
    }
    ConnectFields { id: connect }
    FieldLabel { text: qsTr("Username"); Layout.topMargin: Theme.spaceS }
    AuthField {
        id: userField
        Accessible.name: qsTr("Username")
    }
    FieldLabel { text: qsTr("Password") }
    AuthField {
        id: passField
        echoMode: TextInput.Password
        onAccepted: root.submitted()
        Accessible.name: qsTr("Password")
    }
}
