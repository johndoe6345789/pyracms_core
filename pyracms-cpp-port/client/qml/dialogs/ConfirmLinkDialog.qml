import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Asks before a pyracms:// link installs something or switches site.
Dialog {
    id: root

    readonly property var link: MainViewModel.deepLinks
    readonly property bool isInstall: link.action === "install"

    title: isInstall ? qsTr("Install game?") : qsTr("Start game?")
    modal: true
    parent: Overlay.overlay
    anchors.centerIn: parent
    width: 440
    closePolicy: Popup.CloseOnEscape
    standardButtons: Dialog.Ok | Dialog.Cancel

    // Driven by the pending link, not opened by hand.
    visible: link.pending
    onAccepted: link.accept()
    onRejected: link.dismiss()

    ColumnLayout {
        anchors.fill: parent
        spacing: Theme.spaceM
        Label {
            Layout.fillWidth: true
            wrapMode: Text.WordWrap
            font.bold: true
            color: Theme.textBright
            text: root.isInstall
                  ? qsTr("A link asks Hypernucleus to install \"%1\".")
                        .arg(root.link.name)
                  : qsTr("A link asks Hypernucleus to start \"%1\".")
                        .arg(root.link.name)
        }
        Label {
            Layout.fillWidth: true
            wrapMode: Text.WordWrap
            color: root.link.siteMismatch ? Theme.warning : Theme.textDim
            text: root.link.siteMismatch
                  ? qsTr("The link is for the site \"%1\", which is not "
                         + "the site you are using. Continuing switches "
                         + "to it and signs you out of the current site.")
                        .arg(root.link.slug)
                  : qsTr("Site: %1").arg(root.link.slug)
        }
        Label {
            Layout.fillWidth: true
            wrapMode: Text.WordWrap
            color: Theme.textDim
            visible: root.isInstall
            text: qsTr("Only continue if you trust the website that "
                       + "opened this link.")
        }
    }
}
