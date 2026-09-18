import QtQuick
import QtQuick.Controls
import Hypernucleus

// The big state-aware button of the game page (Install / Play / Update /
// Installing 42% / Launch failed). `kind` colours it, `progress` (0..1)
// draws a fill while a download is running.
Button {
    id: control

    // install | update | play | stop | cancel | none
    property string kind: "install"
    property real progress: -1
    property int fontSize: Theme.fontLarge

    readonly property color baseColor: kind === "play" ? Theme.green
                                     : kind === "stop" ? Theme.danger
                                     : kind === "cancel" ? Theme.panelHover
                                     : Theme.accent

    implicitHeight: 46
    implicitWidth: Math.max(200, label.implicitWidth + 48)
    hoverEnabled: true
    focusPolicy: Qt.StrongFocus
    Accessible.role: Accessible.Button
    Accessible.name: text

    background: Rectangle {
        radius: Theme.radius
        color: !control.enabled ? Theme.disabled
             : control.down ? Qt.darker(control.baseColor, 1.25)
             : control.hovered ? Qt.lighter(control.baseColor, 1.12)
             : control.baseColor
        border.width: control.visualFocus ? 2 : 0
        border.color: Theme.focusRing

        Rectangle {
            visible: control.kind === "cancel" && control.progress >= 0
            width: parent.width * Math.min(1, control.progress)
            height: parent.height
            radius: Theme.radius
            color: Theme.accent
            opacity: 0.9
        }
    }

    contentItem: Text {
        id: label
        text: control.text
        color: Theme.accentText
        font.pixelSize: control.fontSize
        font.bold: true
        horizontalAlignment: Text.AlignHCenter
        verticalAlignment: Text.AlignVCenter
        elide: Text.ElideRight
    }
}
