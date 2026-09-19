import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// First-run card: pick a server and site. Not modal - the launcher stays
// usable behind it and no account is needed for public games.
Popup {
    id: root

    parent: Overlay.overlay
    x: Math.round((parent.width - width) / 2)
    y: 72
    width: Math.min(Theme.dialogWidth, parent.width - 2 * Theme.spaceL)
    padding: Theme.spaceL
    modal: false
    dim: false
    closePolicy: Popup.CloseOnEscape

    onAboutToShow: {
        fields.server = MainViewModel.settings.repoUrl
        fields.site = MainViewModel.settings.tenantSlug
    }

    function connectNow() {
        if (MainViewModel.connection.connectTo(fields.server, fields.site))
            root.close()
    }

    background: Rectangle {
        color: Theme.panel
        radius: Theme.radius
        border.color: Theme.accentDim
        border.width: 1
    }

    contentItem: ColumnLayout {
        spacing: Theme.spaceM
        Label {
            text: qsTr("Connect to a server")
            color: Theme.textBright
            font.pixelSize: Theme.fontMedium
            font.bold: true
        }
        Label {
            Layout.fillWidth: true
            Layout.preferredWidth: 0
            wrapMode: Text.WordWrap
            color: Theme.textDim
            text: qsTr("Choose where the games come from. Public games "
                       + "install and play without an account.")
        }
        ConnectFields { id: fields }
        RowLayout {
            Layout.fillWidth: true
            Layout.topMargin: Theme.spaceM
            Item { Layout.fillWidth: true }
            Button {
                text: qsTr("Not now")
                flat: true
                onClicked: root.close()
            }
            Button {
                text: qsTr("Connect")
                highlighted: true
                enabled: MainViewModel.connection.serverError(
                             fields.server) === ""
                         && fields.site.trim() !== ""
                onClicked: root.connectNow()
            }
        }
    }
}
