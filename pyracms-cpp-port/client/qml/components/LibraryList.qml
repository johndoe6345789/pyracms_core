import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Grouped, keyboard-navigable list of library games.
ListView {
    id: list

    signal detailRequested()

    Layout.fillWidth: true
    Layout.fillHeight: true
    clip: true
    model: MainViewModel.library
    currentIndex: -1
    keyNavigationEnabled: true
    activeFocusOnTab: true
    boundsBehavior: Flickable.StopAtBounds
    ScrollBar.vertical: ScrollBar {}

    section.property: "group"
    section.criteria: ViewSection.FullString
    section.delegate: GroupHeader {}

    delegate: GameListItem {
        width: ListView.view.width
        onClicked: {
            ListView.view.currentIndex = index
            MainViewModel.select(name)
        }
        onDoubleClicked: MainViewModel.primaryActionFor(name)
    }

    onCurrentIndexChanged: {
        if (currentIndex >= 0 && activeFocus)
            MainViewModel.select(
                MainViewModel.library.nameAt(currentIndex))
    }
    Keys.onReturnPressed: detailRequested()
    Keys.onEnterPressed: detailRequested()

    Connections {
        target: MainViewModel
        function onSelectedChanged() {
            list.currentIndex = MainViewModel.library.indexOfName(
                MainViewModel.selectedName)
        }
    }

    ListEmpty { visible: list.count === 0; noneText: qsTr("No games match.") }
}
