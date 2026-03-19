import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Controls.Material 2.15
import QtQuick.Layouts 1.15
import "components" as Components
import "dialogs" as Dialogs
import "theme" as Theme

ApplicationWindow {
    id: root
    width: 1280
    height: 800
    minimumWidth: 800
    minimumHeight: 600
    visible: true
    title: "Hypernucleus - Game & Dependency Manager"

    Material.theme: Material.Light
    Material.primary: Theme.Theme.primary
    Material.accent: Theme.Theme.secondary

    // Save/restore window geometry
    Component.onCompleted: {
        var geom = settingsManager.windowGeometry
        if (geom.width > 0 && geom.height > 0) {
            x = geom.x
            y = geom.y
            width = geom.width
            height = geom.height
        }

        // Show login dialog if not authenticated
        if (!authService.authenticated) {
            loginDialog.open()
        } else {
            mainViewModel.refreshCatalog()
        }
    }

    onClosing: {
        settingsManager.windowGeometry = Qt.rect(x, y, width, height)
        settingsManager.save()
    }

    // Toolbar
    header: Components.ToolBar {
        id: toolBar
    }

    // Main content
    ColumnLayout {
        anchors.fill: parent
        spacing: 0

        // Tab bar
        TabBar {
            id: tabBar
            Layout.fillWidth: true
            Material.background: Theme.Theme.surface

            TabButton {
                text: "Games"
                font.pixelSize: Theme.Theme.fontSizeNormal
            }
            TabButton {
                text: "Dependencies"
                font.pixelSize: Theme.Theme.fontSizeNormal
            }
        }

        // Content area with split view
        SplitView {
            Layout.fillWidth: true
            Layout.fillHeight: true
            orientation: Qt.Horizontal

            // Left panel: tree view
            Components.GameDepTab {
                id: gameDepTab
                SplitView.preferredWidth: parent.width * 0.35
                SplitView.minimumWidth: 250
                filterType: tabBar.currentIndex === 0 ? "game" : "dep"
            }

            // Right panel: detail view
            ColumnLayout {
                SplitView.fillWidth: true
                SplitView.minimumWidth: 400
                spacing: 0

                // Info panel
                Components.InfoPanel {
                    id: infoPanel
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                }

                // Pictures panel
                Components.PicturesPanel {
                    id: picturesPanel
                    Layout.fillWidth: true
                    Layout.preferredHeight: 200
                    visible: mainViewModel.selectedItem.pictures !== undefined &&
                             mainViewModel.selectedItem.pictures.length > 0
                }
            }
        }

        // Status bar
        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: 28
            color: Theme.Theme.surfaceVariant

            RowLayout {
                anchors.fill: parent
                anchors.leftMargin: Theme.Theme.spacingNormal
                anchors.rightMargin: Theme.Theme.spacingNormal

                Label {
                    text: mainViewModel.statusMessage
                    font.pixelSize: Theme.Theme.fontSizeSmall
                    color: Theme.Theme.textSecondary
                    elide: Text.ElideRight
                    Layout.fillWidth: true
                }

                Label {
                    text: detectedOs + " / " + detectedArch
                    font.pixelSize: Theme.Theme.fontSizeSmall
                    color: Theme.Theme.textSecondary
                }

                Label {
                    text: "v" + appVersion
                    font.pixelSize: Theme.Theme.fontSizeSmall
                    color: Theme.Theme.textDisabled
                }
            }
        }
    }

    // Progress overlay
    Components.ProgressOverlay {
        id: progressOverlay
        visible: mainViewModel.showProgress
        progressValue: mainViewModel.progressValue
        progressText: mainViewModel.progressText
        moduleName: mainViewModel.progressName
    }

    // Dialogs
    Dialogs.LoginDialog {
        id: loginDialog
        anchors.centerIn: parent
    }

    Dialogs.RegisterDialog {
        id: registerDialog
        anchors.centerIn: parent
    }

    Dialogs.SettingsDialog {
        id: settingsDialog
        anchors.centerIn: parent
    }

    // Error dialog
    Dialog {
        id: errorDialog
        title: "Error"
        modal: true
        anchors.centerIn: parent
        width: 400
        standardButtons: Dialog.Ok

        property string errorTitle: ""
        property string errorMessage: ""

        ColumnLayout {
            width: parent.width

            Label {
                text: errorDialog.errorTitle
                font.pixelSize: Theme.Theme.fontSizeMedium
                font.bold: true
                Layout.fillWidth: true
                wrapMode: Text.WordWrap
            }

            Label {
                text: errorDialog.errorMessage
                font.pixelSize: Theme.Theme.fontSizeNormal
                Layout.fillWidth: true
                wrapMode: Text.WordWrap
                Layout.topMargin: Theme.Theme.spacingNormal
            }
        }
    }

    // Connections
    Connections {
        target: mainViewModel
        function onErrorOccurred(title, message) {
            errorDialog.errorTitle = title
            errorDialog.errorMessage = message
            errorDialog.open()
        }
    }

    Connections {
        target: authService
        function onLoginSuccess() {
            loginDialog.close()
            mainViewModel.refreshCatalog()
        }
        function onLoggedOut() {
            loginDialog.open()
        }
    }

    // Global shortcuts
    Shortcut {
        sequence: "Ctrl+R"
        onActivated: mainViewModel.refreshCatalog()
    }
    Shortcut {
        sequence: "Ctrl+F"
        onActivated: gameDepTab.focusSearch()
    }
    Shortcut {
        sequence: "Ctrl+,"
        onActivated: settingsDialog.open()
    }
    Shortcut {
        sequence: "Ctrl+Q"
        onActivated: Qt.quit()
    }
}
