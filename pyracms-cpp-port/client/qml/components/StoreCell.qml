import QtQuick
import Hypernucleus

// Grid delegate wrapping one GameCard.
Item {
    id: cell

    required property int index
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

    width: GridView.view.cellWidth
    height: GridView.view.cellHeight

    GameCard {
        anchors.fill: parent
        anchors.margins: Theme.spaceS
        name: cell.name
        title: cell.title
        description: cell.description
        tags: cell.tags
        cover: cell.cover
        accent: cell.accent
        gameState: cell.gameState
        progress: cell.progress
        installed: cell.installed
        primaryKind: cell.primaryKind
        primaryLabel: cell.primaryLabel
        onOpened: (n) => cell.opened(n)
    }
}
