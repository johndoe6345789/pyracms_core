import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Server and site dropdowns. The site list follows the chosen server
// (public GET /api/tenants); both still accept typed text.
ColumnLayout {
    id: root

    readonly property var conn: MainViewModel.connection
    property alias server: serverBox.text
    property alias site: siteBox.text
    signal serverEdited(string text)
    signal siteEdited(string text)

    function refreshSites() { conn.sites.load(serverBox.text) }
    function focusSite() { siteBox.focusField() }

    Layout.fillWidth: true
    spacing: Theme.spaceS
    onVisibleChanged: if (visible) refreshSites()

    FieldLabel { text: qsTr("Server") }
    SuggestBox {
        id: serverBox
        choices: root.conn.servers
        placeholderText: qsTr("https://games.example.com")
        onEdited: (t) => { loadTimer.restart(); root.serverEdited(t) }
        onAccepted: siteBox.focusField()
        Accessible.name: qsTr("Server URL")
    }
    FieldHint {
        readonly property string err: root.conn.serverError(serverBox.text)
        color: err !== "" ? Theme.danger : Theme.textDim
        text: err !== "" ? err : qsTr("Pick a server or type its address.")
    }
    FieldLabel { text: qsTr("Site"); Layout.topMargin: Theme.spaceM }
    SuggestBox {
        id: siteBox
        choices: root.conn.sites.sites
        placeholderText: qsTr("Site name (slug)")
        onEdited: (t) => root.siteEdited(t)
        Accessible.name: qsTr("Site")
    }
    FieldHint {
        text: root.conn.sites.status !== "" ? root.conn.sites.status
              : qsTr("The site whose games and accounts you use.")
    }
    Timer { id: loadTimer; interval: 350; onTriggered: root.refreshSites() }
}
