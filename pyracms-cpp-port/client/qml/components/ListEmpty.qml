import QtQuick
import QtQuick.Controls
import Hypernucleus

// Centered hint over an empty list/grid: loading, error or "none".
Label {
    property string noneText

    anchors.centerIn: parent
    width: parent.width - 2 * Theme.spaceL
    horizontalAlignment: Text.AlignHCenter
    wrapMode: Text.WordWrap
    color: Theme.textDim
    text: MainViewModel.loading ? qsTr("Loading games...")
        : MainViewModel.catalogError !== ""
            ? qsTr("Could not reach the server.\n%1")
                  .arg(MainViewModel.catalogError)
            : noneText
}
