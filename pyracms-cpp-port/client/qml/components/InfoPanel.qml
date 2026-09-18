import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// The big game page: hero banner, primary action, version selector,
// description, tags, screenshots, requirements and details.
Item {
    id: root

    property bool showBack: false
    signal backRequested()

    readonly property var g: MainViewModel.selected
    readonly property bool hasGame:
        g !== undefined && g.name !== undefined && g.name !== ""
    readonly property bool failed: hasGame
        && (g.state === GameStates.LaunchFailed
            || g.state === GameStates.InstallFailed)

    focus: true
    Keys.onEscapePressed: if (showBack) backRequested()
    Keys.onReturnPressed:
        if (hasGame && g.primaryEnabled) MainViewModel.primaryAction()

    InfoEmpty { visible: !root.hasGame }

    ScrollView {
        id: scroll
        anchors.fill: parent
        visible: root.hasGame
        contentWidth: availableWidth
        clip: true

        ColumnLayout {
            width: scroll.availableWidth
            spacing: 0

            HeroBanner {
                Layout.fillWidth: true
                Layout.preferredHeight: 280
                source: root.hasGame ? root.g.cover : ""
                accent: root.hasGame ? root.g.accent : Theme.accentDim
                title: root.hasGame ? root.g.title : ""
                subtitle: root.hasGame && root.g.latestVersion !== ""
                    ? qsTr("Version %1").arg(root.g.latestVersion) : ""

                Button {
                    visible: root.showBack
                    text: qsTr("< Back")
                    anchors.left: parent.left
                    anchors.top: parent.top
                    anchors.margins: Theme.spaceM
                    onClicked: root.backRequested()
                }
            }
            InfoActionBar {
                g: root.g
                failed: root.failed
            }
            InfoBody { g: root.g }
        }
    }
}
