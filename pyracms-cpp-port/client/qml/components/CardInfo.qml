import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Lower half of a store tile: title, blurb, tags and action button.
ColumnLayout {
    id: info

    property string name
    property string title
    property string description
    property var tags
    property real progress
    property string primaryKind
    property string primaryLabel

    Layout.fillWidth: true
    Layout.fillHeight: true
    Layout.margins: Theme.spaceM
    spacing: Theme.spaceS

    Label {
        Layout.fillWidth: true
        text: info.title
        color: Theme.textBright
        font.pixelSize: Theme.fontMedium
        font.bold: true
        elide: Text.ElideRight
    }
    Label {
        Layout.fillWidth: true
        Layout.fillHeight: true
        text: info.description
        color: Theme.textDim
        font.pixelSize: Theme.fontSmall
        wrapMode: Text.WordWrap
        elide: Text.ElideRight
        maximumLineCount: 3
        textFormat: Text.PlainText
    }
    Label {
        Layout.fillWidth: true
        visible: info.tags.length > 0
        text: info.tags.slice(0, 3).join("  ·  ")
        color: Theme.accent
        font.pixelSize: Theme.fontSmall
        elide: Text.ElideRight
    }
    PrimaryButton {
        Layout.fillWidth: true
        implicitHeight: 34
        fontSize: Theme.fontNormal
        text: info.primaryLabel
        kind: info.primaryKind
        progress: info.progress
        enabled: info.primaryKind !== "none"
        onClicked: MainViewModel.primaryActionFor(info.name)
    }
}
