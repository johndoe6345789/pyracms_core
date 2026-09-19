import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Footer of the sign-in / register dialogs: [back] ... [cancel] [submit].
Item {
    id: root

    property string backText
    property string submitText
    property bool busy: false
    property bool canSubmit: true
    signal backClicked()
    signal cancelClicked()
    signal submitClicked()

    implicitHeight: row.implicitHeight + Theme.spaceM + Theme.spaceL

    RowLayout {
        id: row
        anchors.fill: parent
        anchors.leftMargin: Theme.spaceM
        anchors.rightMargin: Theme.spaceL
        anchors.topMargin: Theme.spaceM
        anchors.bottomMargin: Theme.spaceL
        spacing: Theme.spaceM

        Button {
            text: root.backText
            flat: true
            onClicked: root.backClicked()
        }
        Item { Layout.fillWidth: true }
        Button {
            text: qsTr("Cancel")
            onClicked: root.cancelClicked()
        }
        Button {
            text: root.submitText
            highlighted: true
            enabled: !root.busy && root.canSubmit
            onClicked: root.submitClicked()
        }
    }
}
