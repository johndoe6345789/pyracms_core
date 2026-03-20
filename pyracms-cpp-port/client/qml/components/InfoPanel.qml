import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Controls.Material 2.15
import QtQuick.Layouts 1.15
import "../theme" as Theme

Item {
    id: root

    property var item: mainViewModel.selectedItem

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: Theme.Theme.spacingLarge
        spacing: Theme.Theme.spacingMedium

        // Empty state
        Label {
            visible: !item || Object.keys(item).length === 0
            text: qsTr("Select an item from the list to view details")
            font.pixelSize: Theme.Theme.fontSizeMedium
            color: Theme.Theme.textSecondary
            horizontalAlignment: Text.AlignHCenter
            Layout.fillWidth: true
            Layout.fillHeight: true
            verticalAlignment: Text.AlignVCenter
        }

        // Detail view
        ScrollView {
            visible: item && Object.keys(item).length > 0
            Layout.fillWidth: true
            Layout.fillHeight: true
            clip: true

            ColumnLayout {
                width: parent.width
                spacing: Theme.Theme.spacingMedium

                // Title
                Label {
                    text: item.displayName || item.name || ""
                    font.pixelSize: Theme.Theme.fontSizeTitle
                    font.bold: true
                    color: Theme.Theme.textPrimary
                    Layout.fillWidth: true
                    wrapMode: Text.WordWrap
                }

                // Type badge
                Rectangle {
                    width: typeBadge.implicitWidth + 16
                    height: typeBadge.implicitHeight + 8
                    radius: Theme.Theme.radiusSmall
                    color: item.type === "game"
                        ? Theme.Theme.primary
                        : Theme.Theme.secondary

                    Label {
                        id: typeBadge
                        anchors.centerIn: parent
                        text: item.type === "game" ? qsTr("Game") : qsTr("Dependency")
                        color: Theme.Theme.textOnPrimary
                        font.pixelSize: Theme.Theme.fontSizeSmall
                        font.bold: true
                    }
                }

                // Installed status
                RowLayout {
                    spacing: Theme.Theme.spacingNormal

                    Rectangle {
                        width: 12
                        height: 12
                        radius: 6
                        color: item.installed
                            ? Theme.Theme.installedColor
                            : Theme.Theme.notInstalledColor
                    }

                    Label {
                        text: item.installed
                            ? qsTr("Installed (v%1)").arg(item.installedVersion)
                            : qsTr("Not installed")
                        font.pixelSize: Theme.Theme.fontSizeNormal
                        color: item.installed
                            ? Theme.Theme.success
                            : Theme.Theme.textSecondary
                    }
                }

                // Description
                Label {
                    text: item.description || qsTr("No description available.")
                    font.pixelSize: Theme.Theme.fontSizeNormal
                    color: Theme.Theme.textPrimary
                    Layout.fillWidth: true
                    wrapMode: Text.WordWrap
                    Layout.topMargin: Theme.Theme.spacingNormal
                }

                // Separator
                Rectangle {
                    Layout.fillWidth: true
                    Layout.preferredHeight: 1
                    color: Theme.Theme.divider
                    Layout.topMargin: Theme.Theme.spacingNormal
                }

                // Dependencies section
                Label {
                    text: qsTr("Dependencies")
                    font.pixelSize: Theme.Theme.fontSizeMedium
                    font.bold: true
                    color: Theme.Theme.textPrimary
                    Layout.topMargin: Theme.Theme.spacingNormal
                    visible: mainViewModel.dependencyModel.count > 0
                }

                Label {
                    text: qsTr("No dependencies")
                    font.pixelSize: Theme.Theme.fontSizeNormal
                    color: Theme.Theme.textSecondary
                    visible: mainViewModel.dependencyModel.count === 0
                }

                ListView {
                    id: depList
                    Layout.fillWidth: true
                    Layout.preferredHeight: contentHeight
                    Layout.maximumHeight: 200
                    model: mainViewModel.dependencyModel
                    interactive: false
                    visible: mainViewModel.dependencyModel.count > 0

                    delegate: ItemDelegate {
                        width: depList.width
                        height: 36
                        leftPadding: Theme.Theme.spacingLarge

                        contentItem: RowLayout {
                            spacing: Theme.Theme.spacingNormal

                            Rectangle {
                                width: 8
                                height: 8
                                radius: 4
                                color: model.installed
                                    ? Theme.Theme.installedColor
                                    : Theme.Theme.notInstalledColor
                            }

                            Label {
                                text: model.name
                                font.pixelSize: Theme.Theme.fontSizeNormal
                                color: Theme.Theme.textPrimary
                                Layout.fillWidth: true
                            }

                            Label {
                                text: model.version
                                font.pixelSize: Theme.Theme.fontSizeSmall
                                color: Theme.Theme.textSecondary
                            }

                            Label {
                                text: model.installed ? qsTr("Installed") : qsTr("Missing")
                                font.pixelSize: Theme.Theme.fontSizeSmall
                                color: model.installed
                                    ? Theme.Theme.success
                                    : Theme.Theme.warning
                            }
                        }
                    }
                }

                // Separator
                Rectangle {
                    Layout.fillWidth: true
                    Layout.preferredHeight: 1
                    color: Theme.Theme.divider
                    Layout.topMargin: Theme.Theme.spacingNormal
                }

                // Available versions
                Label {
                    text: qsTr("Available Versions")
                    font.pixelSize: Theme.Theme.fontSizeMedium
                    font.bold: true
                    color: Theme.Theme.textPrimary
                    Layout.topMargin: Theme.Theme.spacingNormal
                }

                Flow {
                    Layout.fillWidth: true
                    spacing: Theme.Theme.spacingSmall

                    Repeater {
                        model: item.revisions ? Object.keys(item.revisions) : []

                        Rectangle {
                            width: versionLabel.implicitWidth + 16
                            height: versionLabel.implicitHeight + 8
                            radius: Theme.Theme.radiusSmall
                            color: modelData === item.installedVersion
                                ? Theme.Theme.primary
                                : Theme.Theme.surfaceVariant
                            border.color: Theme.Theme.border
                            border.width: 1

                            Label {
                                id: versionLabel
                                anchors.centerIn: parent
                                text: modelData
                                font.pixelSize: Theme.Theme.fontSizeSmall
                                color: modelData === item.installedVersion
                                    ? Theme.Theme.textOnPrimary
                                    : Theme.Theme.textPrimary
                            }
                        }
                    }
                }

                // Action buttons
                RowLayout {
                    Layout.fillWidth: true
                    Layout.topMargin: Theme.Theme.spacingLarge
                    spacing: Theme.Theme.spacingNormal

                    Button {
                        text: item.installed ? qsTr("Reinstall") : qsTr("Install")
                        Material.background: Theme.Theme.primary
                        Material.foreground: Theme.Theme.textOnPrimary
                        font.pixelSize: Theme.Theme.fontSizeNormal
                        onClicked: mainViewModel.installSelected()
                    }

                    Button {
                        text: qsTr("Uninstall")
                        visible: item.installed
                        Material.background: Theme.Theme.error
                        Material.foreground: Theme.Theme.textOnPrimary
                        font.pixelSize: Theme.Theme.fontSizeNormal
                        onClicked: mainViewModel.uninstallSelected()
                    }

                    Button {
                        text: mainViewModel.gameRunning ? qsTr("Stop") : qsTr("Launch")
                        visible: item.type === "game" && item.installed
                        Material.background: mainViewModel.gameRunning
                            ? Theme.Theme.warning
                            : Theme.Theme.success
                        Material.foreground: Theme.Theme.textOnPrimary
                        font.pixelSize: Theme.Theme.fontSizeNormal
                        onClicked: {
                            if (mainViewModel.gameRunning) {
                                mainViewModel.stopGame()
                            } else {
                                mainViewModel.launchSelected()
                            }
                        }
                    }
                }

                // Spacer
                Item {
                    Layout.fillHeight: true
                }
            }
        }
    }
}
