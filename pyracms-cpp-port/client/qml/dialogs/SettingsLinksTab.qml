import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// URL scheme registration and app version info.
ScrollView {
    id: links

    contentWidth: availableWidth
    clip: true

    ColumnLayout {
        width: links.availableWidth
        spacing: Theme.spaceL

        SettingsBlock {
            FieldLabel { text: qsTr("pyracms:// links") }
            Button {
                text: qsTr("Register link handler")
                onClicked: MainViewModel.registerUrlScheme()
            }
            FieldHint {
                text: qsTr("Let websites start or install games with "
                    + "pyracms://launch/<site>/<game> and "
                    + "pyracms://install/<site>/<game>. Registers this "
                    + "app as the handler for the current user.")
            }
        }
        SettingsBlock {
            FieldLabel { text: qsTr("About") }
            Label {
                Layout.fillWidth: true
                color: Theme.text
                wrapMode: Text.WordWrap
                text: qsTr("Hypernucleus %1 on %2")
                      .arg(MainViewModel.appVersion)
                      .arg(MainViewModel.osName)
            }
        }
    }
}
