import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Controls.Material 2.15
import QtQuick.Layouts 1.15
import "../theme" as Theme

Dialog {
    id: root

    title: "Settings"
    modal: true
    width: 500
    height: 420
    standardButtons: Dialog.NoButton

    onOpened: {
        settingsViewModel.fetchOsArchLists()
    }

    ColumnLayout {
        anchors.fill: parent
        spacing: Theme.Theme.spacingMedium

        TabBar {
            id: settingsTabs
            Layout.fillWidth: true

            TabButton {
                text: "General"
                font.pixelSize: Theme.Theme.fontSizeNormal
            }
            TabButton {
                text: "Advanced"
                font.pixelSize: Theme.Theme.fontSizeNormal
            }
        }

        StackLayout {
            currentIndex: settingsTabs.currentIndex
            Layout.fillWidth: true
            Layout.fillHeight: true

            // General tab
            ColumnLayout {
                spacing: Theme.Theme.spacingMedium

                // Repository URL
                Label {
                    text: "Repository URL"
                    font.pixelSize: Theme.Theme.fontSizeNormal
                    font.bold: true
                    color: Theme.Theme.textPrimary
                }

                TextField {
                    id: repoUrlField
                    Layout.fillWidth: true
                    text: settingsViewModel.repoUrl
                    placeholderText: "http://localhost:8080"
                    font.pixelSize: Theme.Theme.fontSizeNormal

                    onTextChanged: settingsViewModel.repoUrl = text

                    Material.accent: settingsViewModel.urlError
                        ? Theme.Theme.error : Theme.Theme.primary
                }

                Label {
                    text: settingsViewModel.urlError
                    visible: settingsViewModel.urlError !== ""
                    color: Theme.Theme.error
                    font.pixelSize: Theme.Theme.fontSizeSmall
                }

                // Operating System
                Label {
                    text: "Operating System"
                    font.pixelSize: Theme.Theme.fontSizeNormal
                    font.bold: true
                    color: Theme.Theme.textPrimary
                    Layout.topMargin: Theme.Theme.spacingNormal
                }

                ComboBox {
                    id: osCombo
                    Layout.fillWidth: true
                    model: settingsViewModel.osList
                    currentIndex: settingsViewModel.osList.indexOf(settingsViewModel.osName)
                    font.pixelSize: Theme.Theme.fontSizeNormal

                    onCurrentTextChanged: {
                        if (currentText !== "")
                            settingsViewModel.osName = currentText
                    }
                }

                // Architecture
                Label {
                    text: "Architecture"
                    font.pixelSize: Theme.Theme.fontSizeNormal
                    font.bold: true
                    color: Theme.Theme.textPrimary
                    Layout.topMargin: Theme.Theme.spacingNormal
                }

                ComboBox {
                    id: archCombo
                    Layout.fillWidth: true
                    model: settingsViewModel.archList
                    currentIndex: settingsViewModel.archList.indexOf(settingsViewModel.archName)
                    font.pixelSize: Theme.Theme.fontSizeNormal

                    onCurrentTextChanged: {
                        if (currentText !== "")
                            settingsViewModel.archName = currentText
                    }
                }

                Item { Layout.fillHeight: true }
            }

            // Advanced tab
            ColumnLayout {
                spacing: Theme.Theme.spacingMedium

                Label {
                    text: "Download Chunk Size (bytes)"
                    font.pixelSize: Theme.Theme.fontSizeNormal
                    font.bold: true
                    color: Theme.Theme.textPrimary
                }

                SpinBox {
                    id: chunkSpinBox
                    Layout.fillWidth: true
                    from: 1024
                    to: 1048576
                    stepSize: 1024
                    value: settingsViewModel.chunkSize
                    editable: true

                    onValueChanged: settingsViewModel.chunkSize = value
                }

                Label {
                    text: "Recommended: 8192 bytes. Larger values may improve download speed on fast connections."
                    font.pixelSize: Theme.Theme.fontSizeSmall
                    color: Theme.Theme.textSecondary
                    wrapMode: Text.WordWrap
                    Layout.fillWidth: true
                }

                Rectangle {
                    Layout.fillWidth: true
                    Layout.preferredHeight: 1
                    color: Theme.Theme.divider
                    Layout.topMargin: Theme.Theme.spacingLarge
                }

                Label {
                    text: "Data Directory"
                    font.pixelSize: Theme.Theme.fontSizeNormal
                    font.bold: true
                    color: Theme.Theme.textPrimary
                }

                Label {
                    text: pathManager.dataDir
                    font.pixelSize: Theme.Theme.fontSizeSmall
                    color: Theme.Theme.textSecondary
                    Layout.fillWidth: true
                    elide: Text.ElideMiddle
                }

                Item { Layout.fillHeight: true }
            }
        }

        // Button row
        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: 1
            color: Theme.Theme.divider
        }

        RowLayout {
            Layout.fillWidth: true
            spacing: Theme.Theme.spacingNormal

            Button {
                text: "Reset Defaults"
                flat: true
                Material.foreground: Theme.Theme.warning

                onClicked: settingsViewModel.resetDefaults()
            }

            Item { Layout.fillWidth: true }

            Button {
                text: "Cancel"
                flat: true

                onClicked: {
                    settingsViewModel.cancel()
                    root.close()
                }
            }

            Button {
                text: "Save"
                enabled: settingsViewModel.isDirty && settingsViewModel.urlError === ""
                Material.background: Theme.Theme.primary
                Material.foreground: Theme.Theme.textOnPrimary

                onClicked: {
                    settingsViewModel.save()
                    root.close()
                }
            }
        }
    }
}
