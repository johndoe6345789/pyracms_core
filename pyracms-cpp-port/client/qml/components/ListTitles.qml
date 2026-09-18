import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Title and status line of a library row.
ColumnLayout {
    id: root

    property string title
    property string subtitle
    property bool favourite: false
    property bool bright: false
    property color subtitleColor: Theme.accent

    Layout.fillWidth: true
    spacing: 0

    Label {
        Layout.fillWidth: true
        text: (root.favourite ? "★ " : "") + root.title
        color: root.bright ? Theme.textBright : Theme.textDim
        font.pixelSize: Theme.fontMedium
        elide: Text.ElideRight
    }
    Label {
        Layout.fillWidth: true
        visible: text !== ""
        text: root.subtitle
        color: root.subtitleColor
        font.pixelSize: Theme.fontSmall
        elide: Text.ElideRight
    }
}
