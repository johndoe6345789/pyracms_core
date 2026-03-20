import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Controls.Material 2.15
import QtQuick.Layouts 1.15
import "../theme" as Theme

Popup {
    id: root

    property double progressValue: 0.0
    property string progressText: ""
    property string moduleName: ""

    modal: true
    closePolicy: Popup.NoAutoClose
    anchors.centerIn: Overlay.overlay
    width: 420
    height: 180
    padding: Theme.Theme.spacingLarge

    background: Rectangle {
        radius: Theme.Theme.radiusMedium
        color: Theme.Theme.surface
        border.color: Theme.Theme.border
        border.width: 1

        // Shadow effect
        Rectangle {
            anchors.fill: parent
            anchors.margins: -2
            z: -1
            radius: Theme.Theme.radiusMedium + 2
            color: "transparent"
            border.color: Qt.rgba(0, 0, 0, 0.1)
            border.width: 4
        }
    }

    ColumnLayout {
        anchors.fill: parent
        spacing: Theme.Theme.spacingMedium

        // Title
        Label {
            text: qsTr("Installing: %1").arg(root.moduleName)
            font.pixelSize: Theme.Theme.fontSizeMedium
            font.bold: true
            color: Theme.Theme.textPrimary
            Layout.fillWidth: true
            elide: Text.ElideRight
        }

        // Progress bar
        ProgressBar {
            id: progressBar
            Layout.fillWidth: true
            from: 0
            to: 1
            value: root.progressValue >= 0 ? root.progressValue : 0
            indeterminate: root.progressValue < 0

            Material.accent: Theme.Theme.primary
        }

        // Progress text
        Label {
            text: root.progressText
            font.pixelSize: Theme.Theme.fontSizeNormal
            color: Theme.Theme.textSecondary
            Layout.fillWidth: true
            elide: Text.ElideRight
        }

        // Percentage
        Label {
            text: root.progressValue >= 0
                ? Math.round(root.progressValue * 100) + "%"
                : qsTr("Please wait...")
            font.pixelSize: Theme.Theme.fontSizeLarge
            font.bold: true
            color: Theme.Theme.primary
            horizontalAlignment: Text.AlignHCenter
            Layout.fillWidth: true
        }

        Item { Layout.fillHeight: true }

        // Cancel button
        Button {
            text: qsTr("Cancel")
            Layout.alignment: Qt.AlignRight
            flat: true
            Material.foreground: Theme.Theme.error

            onClicked: {
                // Cancel is best-effort; we close the overlay
                root.visible = false
            }
        }
    }
}
