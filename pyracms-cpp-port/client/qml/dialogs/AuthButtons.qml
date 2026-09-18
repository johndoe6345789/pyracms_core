import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

// Button row of the sign-in / register dialogs.
RowLayout {
    id: root

    property string backText
    property string skipText
    property string submitText
    property bool busy: false
    signal backClicked()
    signal skipClicked()
    signal submitClicked()

    Layout.fillWidth: true

    Button {
        text: root.backText
        flat: true
        onClicked: root.backClicked()
    }
    Item { Layout.fillWidth: true }
    Button {
        visible: root.skipText !== ""
        text: root.skipText
        flat: true
        onClicked: root.skipClicked()
    }
    Button {
        text: root.submitText
        highlighted: true
        enabled: !root.busy
        onClicked: root.submitClicked()
    }
}
