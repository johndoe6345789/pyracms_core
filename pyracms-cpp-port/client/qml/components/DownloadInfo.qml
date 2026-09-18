import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Name of the active download and its current step / queue length.
ColumnLayout {
    id: info

    property var dl

    Layout.preferredWidth: 300
    spacing: 2

    Label {
        Layout.fillWidth: true
        text: info.dl.label
        color: Theme.textBright
        font.bold: true
        elide: Text.ElideRight
    }
    Label {
        Layout.fillWidth: true
        text: info.dl.stepText + (info.dl.queue.length > 0
              ? "  -  " + qsTr("%1 queued").arg(info.dl.queue.length)
              : "")
        color: Theme.textDim
        font.pixelSize: Theme.fontSmall
        elide: Text.ElideRight
    }
}
