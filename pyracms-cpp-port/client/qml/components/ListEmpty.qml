import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QtQuick.Window
import Hypernucleus

// Centered hint over an empty list/grid: no site yet, loading, error or
// "none". Without a site the Connect button opens the Connect card.
ColumnLayout {
    property string noneText
    readonly property bool noSite: MainViewModel.connection.needsConnect

    anchors.centerIn: parent
    width: parent.width - 2 * Theme.spaceL
    spacing: Theme.spaceM

    Label {
        Layout.fillWidth: true
        horizontalAlignment: Text.AlignHCenter
        wrapMode: Text.WordWrap
        color: Theme.textDim
        text: noSite ? MainViewModel.connection.emptyText
            : MainViewModel.loading ? qsTr("Loading games...")
            : MainViewModel.catalogError !== ""
                ? MainViewModel.catalogError
                : noneText
    }
    Button {
        Layout.alignment: Qt.AlignHCenter
        visible: noSite
        text: qsTr("Connect")
        highlighted: true
        onClicked: Window.window.openConnect()
    }
}
