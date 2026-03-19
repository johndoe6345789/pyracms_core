import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Controls.Material 2.15
import QtQuick.Layouts 1.15
import "../theme" as Theme

Dialog {
    id: root

    title: qsTr("Settings")
    modal: true
    width: 500
    height: 480
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
                text: qsTr("General")
                font.pixelSize: Theme.Theme.fontSizeNormal
            }
            TabButton {
                text: qsTr("Appearance")
                font.pixelSize: Theme.Theme.fontSizeNormal
            }
            TabButton {
                text: qsTr("Advanced")
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
                    text: qsTr("Repository URL")
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
                    text: qsTr("Operating System")
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
                    text: qsTr("Architecture")
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

            // Appearance tab
            ColumnLayout {
                spacing: Theme.Theme.spacingMedium

                // Dark mode toggle
                Label {
                    text: qsTr("Theme")
                    font.pixelSize: Theme.Theme.fontSizeNormal
                    font.bold: true
                    color: Theme.Theme.textPrimary
                }

                RowLayout {
                    spacing: Theme.Theme.spacingNormal

                    Switch {
                        id: darkModeSwitch
                        checked: settingsManager.darkMode
                        onCheckedChanged: settingsManager.darkMode = checked
                    }

                    Label {
                        text: darkModeSwitch.checked ? qsTr("Dark Mode") : qsTr("Light Mode")
                        font.pixelSize: Theme.Theme.fontSizeNormal
                        color: Theme.Theme.textPrimary
                    }
                }

                Rectangle {
                    Layout.fillWidth: true
                    Layout.preferredHeight: 1
                    color: Theme.Theme.divider
                    Layout.topMargin: Theme.Theme.spacingNormal
                }

                // Language selector
                Label {
                    text: qsTr("Language")
                    font.pixelSize: Theme.Theme.fontSizeNormal
                    font.bold: true
                    color: Theme.Theme.textPrimary
                    Layout.topMargin: Theme.Theme.spacingNormal
                }

                ComboBox {
                    id: languageCombo
                    Layout.fillWidth: true
                    model: ["English", "Español", "Français"]
                    property var langCodes: ["en", "es", "fr"]
                    currentIndex: langCodes.indexOf(settingsManager.language)
                    font.pixelSize: Theme.Theme.fontSizeNormal

                    onCurrentIndexChanged: {
                        if (currentIndex >= 0 && currentIndex < langCodes.length)
                            settingsManager.language = langCodes[currentIndex]
                    }
                }

                Label {
                    text: qsTr("Language changes require restart.")
                    font.pixelSize: Theme.Theme.fontSizeSmall
                    color: Theme.Theme.textSecondary
                }

                Item { Layout.fillHeight: true }
            }

            // Advanced tab
            ColumnLayout {
                spacing: Theme.Theme.spacingMedium

                Label {
                    text: qsTr("Download Chunk Size (bytes)")
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
                    text: qsTr("Recommended: 8192 bytes. Larger values may improve download speed on fast connections.")
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
                    text: qsTr("Data Directory")
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
                text: qsTr("Reset Defaults")
                flat: true
                Material.foreground: Theme.Theme.warning

                onClicked: settingsViewModel.resetDefaults()
            }

            Item { Layout.fillWidth: true }

            Button {
                text: qsTr("Cancel")
                flat: true

                onClicked: {
                    settingsViewModel.cancel()
                    root.close()
                }
            }

            Button {
                text: qsTr("Save")
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
