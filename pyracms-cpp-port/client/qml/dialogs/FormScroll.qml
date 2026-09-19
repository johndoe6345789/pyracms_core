import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Content of a form dialog: a column as wide as the dialog that scrolls
// when the window is too short for it.
ScrollView {
    id: root

    default property alias content: column.data

    contentWidth: availableWidth
    clip: true

    ColumnLayout {
        id: column
        width: root.availableWidth
        spacing: Theme.spaceM
    }
}
