import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Controls.Material 2.15
import QtQuick.Layouts 1.15
import "../theme" as Theme

Item {
    id: root

    property string filterType: "game"

    function focusSearch() {
        searchField.forceActiveFocus()
    }

    ColumnLayout {
        anchors.fill: parent
        spacing: 0

        // Search bar
        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: 48
            color: Theme.Theme.surface

            RowLayout {
                anchors.fill: parent
                anchors.margins: Theme.Theme.spacingNormal

                TextField {
                    id: searchField
                    Layout.fillWidth: true
                    placeholderText: qsTr("Search...")
                    font.pixelSize: Theme.Theme.fontSizeNormal
                    leftPadding: 36

                    Image {
                        source: "image://theme/edit-find"
                        width: 16
                        height: 16
                        anchors.left: parent.left
                        anchors.leftMargin: 10
                        anchors.verticalCenter: parent.verticalCenter
                        opacity: 0.5
                        visible: false
                    }

                    Label {
                        text: "\u{1F50D}"
                        anchors.left: parent.left
                        anchors.leftMargin: 8
                        anchors.verticalCenter: parent.verticalCenter
                        font.pixelSize: 14
                        opacity: 0.5
                    }

                    onTextChanged: mainViewModel.search(text)

                    // Clear button
                    ToolButton {
                        visible: searchField.text.length > 0
                        text: "\u2715"
                        anchors.right: parent.right
                        anchors.verticalCenter: parent.verticalCenter
                        width: 28
                        height: 28
                        onClicked: searchField.text = ""
                    }
                }
            }
        }

        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: 1
            color: Theme.Theme.divider
        }

        // Tree view
        ScrollView {
            Layout.fillWidth: true
            Layout.fillHeight: true
            clip: true

            ListView {
                id: treeView
                model: mainViewModel.gameDepModel
                anchors.fill: parent

                delegate: Item {
                    width: treeView.width
                    height: isCategory ? categoryLoader.height : itemLoader.height
                    visible: isCategory || model.type === root.filterType

                    // Category header
                    Loader {
                        id: categoryLoader
                        active: isCategory
                        width: parent.width

                        sourceComponent: Component {
                            ItemDelegate {
                                width: parent ? parent.width : 100
                                height: 40

                                property bool expanded: true

                                contentItem: RowLayout {
                                    spacing: Theme.Theme.spacingNormal

                                    Label {
                                        text: expanded ? "\u25BC" : "\u25B6"
                                        font.pixelSize: 10
                                        color: Theme.Theme.textSecondary
                                    }

                                    Label {
                                        text: model.displayName
                                        font.pixelSize: Theme.Theme.fontSizeNormal
                                        font.bold: true
                                        color: Theme.Theme.textPrimary
                                        Layout.fillWidth: true
                                    }
                                }

                                background: Rectangle {
                                    color: Theme.Theme.surfaceVariant
                                }

                                onClicked: expanded = !expanded
                            }
                        }
                    }

                    // Item row
                    Loader {
                        id: itemLoader
                        active: !isCategory
                        width: parent.width

                        sourceComponent: Component {
                            ItemDelegate {
                                width: parent ? parent.width : 100
                                height: 48
                                highlighted: mainViewModel.selectedItem.name === model.name
                                leftPadding: 32

                                contentItem: RowLayout {
                                    spacing: Theme.Theme.spacingNormal

                                    // Installed indicator
                                    Rectangle {
                                        width: 8
                                        height: 8
                                        radius: 4
                                        color: model.installed
                                            ? Theme.Theme.installedColor
                                            : Theme.Theme.notInstalledColor
                                    }

                                    ColumnLayout {
                                        spacing: 2
                                        Layout.fillWidth: true

                                        Label {
                                            text: model.displayName
                                            font.pixelSize: Theme.Theme.fontSizeNormal
                                            color: Theme.Theme.textPrimary
                                            elide: Text.ElideRight
                                            Layout.fillWidth: true
                                        }

                                        Label {
                                            text: model.installed
                                                ? "v" + model.installedVersion
                                                : qsTr("Not installed")
                                            font.pixelSize: Theme.Theme.fontSizeSmall
                                            color: model.installed
                                                ? Theme.Theme.success
                                                : Theme.Theme.textSecondary
                                        }
                                    }
                                }

                                onClicked: {
                                    // We need to pass the row and parent row
                                    // The parent row is the category index
                                    var parentRow = -1
                                    // Find which category this belongs to
                                    for (var i = 0; i < index; i++) {
                                        // Approximate: select by row and parent
                                    }
                                    mainViewModel.selectItem(index, parentRow)
                                }

                                onDoubleClicked: {
                                    if (model.type === "game" && model.installed) {
                                        mainViewModel.launchSelected()
                                    } else if (!model.installed) {
                                        mainViewModel.installSelected()
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Item count footer
        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: 24
            color: Theme.Theme.surfaceVariant

            Label {
                anchors.centerIn: parent
                text: mainViewModel.gameDepModel.totalCount + " " + qsTr("items")
                font.pixelSize: Theme.Theme.fontSizeSmall
                color: Theme.Theme.textSecondary
            }
        }
    }
}
