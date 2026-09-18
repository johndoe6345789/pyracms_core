import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// One requirement line: name, version and where it comes from.
Rectangle {
    id: dep

    required property string name
    required property string version
    required property string source
    required property bool installed

    Layout.fillWidth: true
    Layout.preferredHeight: 40
    color: Theme.panel
    radius: Theme.radius

    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: Theme.spaceL
        anchors.rightMargin: Theme.spaceL
        Label {
            text: dep.name
            color: Theme.textBright
            font.bold: true
        }
        Label { text: dep.version; color: Theme.textDim }
        Item { Layout.fillWidth: true }
        Label {
            color: dep.installed ? Theme.success : Theme.textDim
            text: dep.installed ? qsTr("Installed")
                : dep.source === "pip" ? qsTr("From pip")
                : dep.source === "pyracms" ? qsTr("From PyraCMS")
                : qsTr("pip, else PyraCMS")
        }
    }
}
