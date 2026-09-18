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

        SettingsBlock {
            FieldLabel { text: qsTr("Server URL") }
            TextField {
                Layout.fillWidth: true
                text: general.ed.repoUrl
                onTextEdited: general.ed.repoUrl = text
                color: general.ed.urlError !== ""
                       ? Theme.danger : Theme.text
                inputMethodHints: Qt.ImhUrlCharactersOnly
                                  | Qt.ImhNoAutoUppercase
            }
            FieldHint {
                text: general.ed.urlError !== "" ? general.ed.urlError
                      : qsTr("Address of the PyraCMS backend.")
            }
        }
        SettingsBlock {
            FieldLabel { text: qsTr("Site (tenant slug)") }
            TextField {
                Layout.fillWidth: true
                text: general.ed.tenantSlug
                onTextEdited: general.ed.tenantSlug = text
                inputMethodHints: Qt.ImhNoAutoUppercase
                                  | Qt.ImhNoPredictiveText
            }
            FieldHint {
                text: qsTr("Games, dependencies and accounts are "
                           + "scoped to this site.")
            }
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
