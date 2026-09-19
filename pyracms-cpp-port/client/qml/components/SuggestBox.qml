import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Editable field with a dropdown of choices ([{value, label}]). Typing
// filters the list; a row (click, arrows + Enter) fills in its value.
FocusScope {
    id: root

    property var choices: []
    property alias text: field.text
    property alias placeholderText: field.placeholderText
    property bool showAll: false
    readonly property var matches: {
        const q = field.text.trim().toLowerCase()
        if (showAll || q === "") return choices
        return choices.filter(c => c.value.toLowerCase().includes(q)
                                  || c.label.toLowerCase().includes(q))
    }
    signal edited(string text)
    signal accepted()

    function focusField() { field.forceActiveFocus() }
    function pick(value) {
        field.text = value
        popup.close()
        root.edited(value)
    }

    Layout.fillWidth: true
    Layout.preferredWidth: 0
    implicitHeight: field.implicitHeight

    TextField {
        id: field
        anchors.fill: parent
        rightPadding: arrow.width + Theme.spaceS
        inputMethodHints: Qt.ImhNoAutoUppercase | Qt.ImhNoPredictiveText
        onTextEdited: {
            root.showAll = false
            popup.currentIndex = -1
            root.edited(text)
            if (root.matches.length > 0) popup.open()
        }
        onAccepted: {
            const i = popup.currentIndex
            if (popup.opened && i >= 0) root.pick(root.matches[i].value)
            else { popup.close(); root.accepted() }
        }
        Keys.onDownPressed: {
            if (!popup.opened) { root.showAll = true; popup.open() }
            else popup.next()
        }
        Keys.onUpPressed: popup.previous()
    }
    ToolButton {
        id: arrow
        anchors.right: parent.right
        anchors.verticalCenter: parent.verticalCenter
        width: height
        text: "▾"
        focusPolicy: Qt.NoFocus
        Accessible.name: qsTr("Show choices")
        onClicked: {
            if (popup.opened) { popup.close(); return }
            root.showAll = true
            popup.open()
        }
    }
    SuggestPopup {
        id: popup
        y: root.height + 2
        width: root.width
        matches: root.matches
        onPicked: (value) => root.pick(value)
    }
}
