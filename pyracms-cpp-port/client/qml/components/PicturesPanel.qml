import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Controls.Material 2.15
import QtQuick.Layouts 1.15
import "../theme" as Theme

Item {
    id: root

    property var pictures: mainViewModel.selectedItem.pictures || []

    Rectangle {
        anchors.fill: parent
        color: Theme.Theme.surfaceVariant

        ColumnLayout {
            anchors.fill: parent
            anchors.margins: Theme.Theme.spacingNormal
            spacing: Theme.Theme.spacingSmall

            // Header
            Label {
                text: "Screenshots"
                font.pixelSize: Theme.Theme.fontSizeMedium
                font.bold: true
                color: Theme.Theme.textPrimary
            }

            // Thumbnail grid
            ScrollView {
                Layout.fillWidth: true
                Layout.fillHeight: true
                clip: true
                ScrollBar.vertical.policy: ScrollBar.AlwaysOff

                GridView {
                    id: gridView
                    width: parent.width
                    cellWidth: 180
                    cellHeight: 135
                    model: root.pictures

                    delegate: Item {
                        width: gridView.cellWidth
                        height: gridView.cellHeight

                        Rectangle {
                            anchors.fill: parent
                            anchors.margins: Theme.Theme.spacingSmall
                            radius: Theme.Theme.radiusSmall
                            color: Theme.Theme.surface
                            border.color: Theme.Theme.border
                            border.width: 1
                            clip: true

                            Image {
                                id: thumbnail
                                anchors.fill: parent
                                anchors.margins: 2
                                fillMode: Image.PreserveAspectFit
                                asynchronous: true

                                // Will be set when thumbnail data arrives
                                property string uuid: modelData.uuid || modelData

                                Component.onCompleted: {
                                    apiClient.fetchThumbnail(uuid)
                                }

                                BusyIndicator {
                                    anchors.centerIn: parent
                                    running: thumbnail.status === Image.Loading
                                    visible: running
                                    width: 32
                                    height: 32
                                }

                                Label {
                                    anchors.centerIn: parent
                                    text: "No Preview"
                                    font.pixelSize: Theme.Theme.fontSizeSmall
                                    color: Theme.Theme.textDisabled
                                    visible: thumbnail.status === Image.Error ||
                                             thumbnail.source === ""
                                }
                            }

                            MouseArea {
                                anchors.fill: parent
                                cursorShape: Qt.PointingHandCursor
                                onClicked: {
                                    enlargedImage.uuid = thumbnail.uuid
                                    enlargedImage.source = thumbnail.source
                                    enlargedDialog.open()
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Enlarged image dialog
    Dialog {
        id: enlargedDialog
        modal: true
        width: Math.min(root.Window.window ? root.Window.window.width * 0.8 : 800, 800)
        height: Math.min(root.Window.window ? root.Window.window.height * 0.8 : 600, 600)
        anchors.centerIn: Overlay.overlay
        standardButtons: Dialog.Close
        title: "Screenshot"

        Image {
            id: enlargedImage
            property string uuid: ""
            anchors.fill: parent
            fillMode: Image.PreserveAspectFit
            asynchronous: true
        }
    }

    // Handle thumbnail data from API
    Connections {
        target: apiClient
        function onThumbnailFetched(uuid, data) {
            // In production, you would save to disk and set the source
            // For now, we store as base64 data URL
            for (var i = 0; i < gridView.count; i++) {
                var item = gridView.itemAtIndex(i)
                if (item && item.children[0] && item.children[0].children[0]) {
                    var img = item.children[0].children[0]
                    if (img.uuid === uuid) {
                        // Save thumbnail to pictures dir and set source
                        var path = pathManager.picturesDir + "/" + uuid + ".png"
                        img.source = "file://" + path
                    }
                }
            }
        }
    }
}
