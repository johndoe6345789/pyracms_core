import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Small explanatory text below a settings control.
Label {
    visible: text !== ""
    color: Theme.textDim
    font.pixelSize: Theme.fontSmall
    wrapMode: Text.WordWrap
    Layout.fillWidth: true
}
