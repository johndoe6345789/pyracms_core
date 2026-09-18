import QtQuick
import QtQuick.Controls
import Hypernucleus

// Short, non-blocking message near the bottom of the window.
Popup {
    id: toast

    property string message
    property bool isError: false

    function show(text, error) {
        message = text
        isError = error
        open()
        hideTimer.restart()
    }

    parent: Overlay.overlay
    x: Math.round((parent.width - width) / 2)
    y: parent.height - height - 96
    width: Math.min(560, parent.width - 40)
    padding: Theme.spaceL
    modal: false
    focus: false
    closePolicy: Popup.NoAutoClose

    background: Rectangle {
        radius: Theme.radius
        color: toast.isError ? Theme.danger : Theme.panelHover
        border.width: 1
        border.color: toast.isError ? Qt.lighter(Theme.danger, 1.3)
                                    : Theme.accentDim
    }
    contentItem: Label {
        text: toast.message
        color: Theme.accentText
        wrapMode: Text.WordWrap
        Accessible.role: Accessible.AlertMessage
    }

    Connections {
        target: MainViewModel
        function onNotify(text, error) { toast.show(text, error) }
    }

    Timer {
        id: hideTimer
        interval: toast.isError ? 7000 : 4000
        onTriggered: toast.close()
    }
}
