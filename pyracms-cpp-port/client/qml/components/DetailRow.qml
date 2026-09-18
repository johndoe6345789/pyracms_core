import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// One "label ... value" line; hidden when the value is empty.
RowLayout {
    id: row

    property string label
    property string value

    visible: value !== ""
    spacing: Theme.spaceL

    Label {
        text: row.label
        color: Theme.textDim
        Layout.preferredWidth: 130
    }
    Label {
        text: row.value
        color: Theme.text
        Layout.fillWidth: true
        elide: Text.ElideMiddle
    }
}
