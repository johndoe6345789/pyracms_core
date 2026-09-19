import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Asks before the managed Python (python-build-standalone) is downloaded.
Dialog {
    id: root

    readonly property var setup: MainViewModel.pythonSetup

    title: qsTr("Python is needed")
    modal: true
    parent: Overlay.overlay
    anchors.centerIn: parent
    width: 460
    closePolicy: Popup.CloseOnEscape
    standardButtons: Dialog.Ok | Dialog.Cancel

    // Driven by the setup controller, not opened by hand.
    visible: setup.promptVisible
    onAccepted: setup.accept()
    onRejected: setup.decline()

    Label {
        width: parent.width
        wrapMode: Text.WordWrap
        color: Theme.textBright
        text: root.setup.promptText
    }
}
