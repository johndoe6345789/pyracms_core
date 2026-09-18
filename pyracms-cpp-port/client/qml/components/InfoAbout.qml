import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Description, tag chips and screenshots.
ColumnLayout {
    id: root

    property var g
    readonly property bool hasGame:
        g !== undefined && g.name !== undefined && g.name !== ""
    readonly property bool hasShots:
        hasGame && g.screenshots.length > 0

    Layout.fillWidth: true
    spacing: Theme.spaceL

    SectionTitle { text: qsTr("About") }
    Label {
        Layout.fillWidth: true
        text: root.hasGame && root.g.description !== ""
              ? root.g.description : qsTr("No description yet.")
        color: Theme.text
        wrapMode: Text.WordWrap
        textFormat: Text.PlainText
        font.pixelSize: Theme.fontMedium
    }

    Flow {
        Layout.fillWidth: true
        spacing: Theme.spaceM
        visible: root.hasGame && root.g.tags.length > 0
        Repeater {
            model: root.hasGame ? root.g.tags : []
            TagChip { required property string modelData; text: modelData }
        }
    }

    SectionTitle {
        text: qsTr("Screenshots")
        visible: root.hasShots
    }
    PicturesPanel {
        Layout.fillWidth: true
        visible: root.hasShots
        screenshots: root.hasGame ? root.g.screenshots : []
    }
}
