import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Progress bar with the transferred / total size below it.
ColumnLayout {
    id: bar

    property var dl

    Layout.fillWidth: true
    spacing: 2

    ProgressBar {
        Layout.fillWidth: true
        from: 0
        to: 1
        value: bar.dl.progress >= 0 ? bar.dl.progress : 0
        indeterminate: bar.dl.progress < 0
        Accessible.name: bar.dl.label
    }
    Label {
        Layout.fillWidth: true
        text: bar.dl.sizeText
        color: Theme.textDim
        font.pixelSize: Theme.fontSmall
    }
}
