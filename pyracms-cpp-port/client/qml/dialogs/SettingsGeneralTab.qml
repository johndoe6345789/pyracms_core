import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Server, site, install folder and appearance settings.
ScrollView {
    id: general

    property var ed

    contentWidth: availableWidth
    clip: true

    ColumnLayout {
        width: general.availableWidth
        spacing: Theme.spaceL

        ConnectFields {
            Layout.topMargin: Theme.spaceM
            server: general.ed.repoUrl
            site: general.ed.tenantSlug
            onServerEdited: (t) => general.ed.repoUrl = t
            onSiteEdited: (t) => general.ed.tenantSlug = t
        }
        SettingsBlock {
            FieldLabel { text: qsTr("Install folder") }
            TextField {
                Layout.fillWidth: true
                text: general.ed.installDir
                onTextEdited: general.ed.installDir = text
                placeholderText: MainViewModel.paths.dataDir
            }
            FieldHint {
                text: qsTr("Leave empty for the default: %1. Existing "
                           + "installs stay where they are.")
                      .arg(MainViewModel.paths.dataDir)
            }
        }
        SettingsBlock {
            FieldLabel { text: qsTr("Appearance") }
            Switch {
                text: qsTr("Dark theme")
                checked: MainViewModel.settings.darkMode
                onToggled: {
                    MainViewModel.settings.darkMode = checked
                    MainViewModel.settings.save()
                }
            }
        }
    }
}
