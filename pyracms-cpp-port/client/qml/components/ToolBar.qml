import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Controls.Material 2.15
import QtQuick.Layouts 1.15
import "../theme" as Theme

ToolBar {
    id: root

    Material.background: Theme.Theme.primary
    Material.foreground: Theme.Theme.textOnPrimary

    RowLayout {
        anchors.fill: parent
        spacing: Theme.Theme.spacingSmall

        // App title
        Label {
            text: "Hypernucleus"
            font.pixelSize: Theme.Theme.fontSizeLarge
            font.bold: true
            color: Theme.Theme.textOnPrimary
            Layout.leftMargin: Theme.Theme.spacingLarge
        }

        Item { Layout.fillWidth: true }

        // Run button
        ToolButton {
            id: runButton
            icon.name: "media-playback-start"
            text: "\u25B6"
            font.pixelSize: 16
            enabled: mainViewModel.selectedItem.type === "game" &&
                     mainViewModel.selectedItem.installed &&
                     !mainViewModel.gameRunning
            ToolTip.visible: hovered
            ToolTip.text: "Launch Game (Ctrl+Enter)"

            onClicked: mainViewModel.launchSelected()

            contentItem: Label {
                text: parent.text
                color: parent.enabled ? Theme.Theme.textOnPrimary : Theme.Theme.textDisabled
                font: parent.font
                horizontalAlignment: Text.AlignHCenter
                verticalAlignment: Text.AlignVCenter
            }
        }

        // Stop button
        ToolButton {
            id: stopButton
            text: "\u25A0"
            font.pixelSize: 16
            enabled: mainViewModel.gameRunning
            ToolTip.visible: hovered
            ToolTip.text: "Stop Game"

            onClicked: mainViewModel.stopGame()

            contentItem: Label {
                text: parent.text
                color: parent.enabled ? Theme.Theme.textOnPrimary : Theme.Theme.textDisabled
                font: parent.font
                horizontalAlignment: Text.AlignHCenter
                verticalAlignment: Text.AlignVCenter
            }
        }

        // Separator
        Rectangle {
            width: 1
            Layout.fillHeight: true
            Layout.topMargin: 8
            Layout.bottomMargin: 8
            color: Qt.rgba(1, 1, 1, 0.3)
        }

        // Uninstall button
        ToolButton {
            id: uninstallButton
            text: "\u{1F5D1}"
            font.pixelSize: 16
            enabled: mainViewModel.selectedItem.installed === true
            ToolTip.visible: hovered
            ToolTip.text: "Uninstall Selected"

            onClicked: mainViewModel.uninstallSelected()

            contentItem: Label {
                text: parent.text
                color: parent.enabled ? Theme.Theme.textOnPrimary : Theme.Theme.textDisabled
                font: parent.font
                horizontalAlignment: Text.AlignHCenter
                verticalAlignment: Text.AlignVCenter
            }
        }

        // Refresh button
        ToolButton {
            id: refreshButton
            text: "\u21BB"
            font.pixelSize: 18
            enabled: !mainViewModel.isLoading
            ToolTip.visible: hovered
            ToolTip.text: "Refresh Catalog (Ctrl+R)"

            onClicked: mainViewModel.refreshCatalog()

            contentItem: Label {
                text: parent.text
                color: parent.enabled ? Theme.Theme.textOnPrimary : Theme.Theme.textDisabled
                font: parent.font
                horizontalAlignment: Text.AlignHCenter
                verticalAlignment: Text.AlignVCenter
            }

            // Spin animation when loading
            RotationAnimation {
                target: refreshButton.contentItem
                from: 0
                to: 360
                duration: 1000
                running: mainViewModel.isLoading
                loops: Animation.Infinite
            }
        }

        // Separator
        Rectangle {
            width: 1
            Layout.fillHeight: true
            Layout.topMargin: 8
            Layout.bottomMargin: 8
            color: Qt.rgba(1, 1, 1, 0.3)
        }

        // User info
        Label {
            text: authService.authenticated
                ? authService.username
                : "Not logged in"
            font.pixelSize: Theme.Theme.fontSizeSmall
            color: Qt.rgba(1, 1, 1, 0.8)
        }

        // Settings button
        ToolButton {
            id: settingsButton
            text: "\u2699"
            font.pixelSize: 18
            ToolTip.visible: hovered
            ToolTip.text: "Settings (Ctrl+,)"

            onClicked: settingsDialog.open()

            contentItem: Label {
                text: parent.text
                color: Theme.Theme.textOnPrimary
                font: parent.font
                horizontalAlignment: Text.AlignHCenter
                verticalAlignment: Text.AlignVCenter
            }
        }

        // Exit button
        ToolButton {
            id: exitButton
            text: "\u2715"
            font.pixelSize: 16
            ToolTip.visible: hovered
            ToolTip.text: "Exit (Ctrl+Q)"
            Layout.rightMargin: Theme.Theme.spacingNormal

            onClicked: Qt.quit()

            contentItem: Label {
                text: parent.text
                color: Theme.Theme.textOnPrimary
                font: parent.font
                horizontalAlignment: Text.AlignHCenter
                verticalAlignment: Text.AlignVCenter
            }
        }
    }
}
