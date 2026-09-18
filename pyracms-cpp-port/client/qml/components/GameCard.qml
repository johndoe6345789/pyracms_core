import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Store tile: cover art, title, tags and the same state-aware button as
// the game page. Click opens the game page.
Rectangle {
    id: card

    required property string name
    required property string title
    required property string description
    required property var tags
    required property string cover
    required property color accent
    required property int gameState
    required property real progress
    required property bool installed
    required property string primaryKind
    required property string primaryLabel

    signal opened(string name)

    activeFocusOnTab: true
    color: hover.hovered || activeFocus ? Theme.panelHover : Theme.panel
    radius: Theme.radius
    border.width: activeFocus ? 2 : 0
    border.color: Theme.accent
    Accessible.role: Accessible.Button
    Accessible.name: title + ", " + primaryLabel

    HoverHandler { id: hover }
    TapHandler { onTapped: card.opened(card.name) }
    Keys.onReturnPressed: card.opened(card.name)
    Keys.onSpacePressed: card.opened(card.name)

    ColumnLayout {
        anchors.fill: parent
        spacing: 0

        CoverArt {
            Layout.fillWidth: true
            Layout.preferredHeight: 110
            accent: card.accent
            cover: card.cover
            title: card.title
            installed: card.installed
        }
        CardInfo {
            name: card.name
            title: card.title
            description: card.description
            tags: card.tags
            progress: card.progress
            primaryKind: card.primaryKind
            primaryLabel: card.primaryLabel
        }
    }
}
