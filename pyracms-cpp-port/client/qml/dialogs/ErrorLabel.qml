import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Red wrapped message; hidden while empty.
Label {
    Layout.fillWidth: true
    visible: text !== ""
    color: Theme.danger
    wrapMode: Text.WordWrap
}
