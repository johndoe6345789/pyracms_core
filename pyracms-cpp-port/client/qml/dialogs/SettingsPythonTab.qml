import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Python interpreter, dependency policy, OS and architecture.
ScrollView {
    id: python

    property var ed

    contentWidth: availableWidth
    clip: true

    ColumnLayout {
        width: python.availableWidth
        spacing: Theme.spaceL

        SettingsBlock {
            FieldLabel { text: qsTr("Python interpreter") }
            TextField {
                Layout.fillWidth: true
                text: python.ed.pythonPath
                onTextEdited: python.ed.pythonPath = text
                placeholderText: qsTr("auto-detect")
            }
            FieldHint {
                text: qsTr("Used to run Python games and to install pip "
                    + "packages. Empty = auto-detect (a managed "
                    + "interpreter in the data folder, then python3 / "
                    + "python / py).")
            }
        }
        SettingsBlock {
            FieldLabel { text: qsTr("Dependencies") }
            Switch {
                text: qsTr("Prefer pip")
                checked: python.ed.preferPip
                onToggled: python.ed.preferPip = checked
            }
            FieldHint {
                text: qsTr("Look packages up on pip first; only names "
                    + "that are not on pip are downloaded from the "
                    + "PyraCMS dependency list.")
            }
        }
        SettingsBlock {
            FieldLabel { text: qsTr("Operating system") }
            ComboBox {
                Layout.fillWidth: true
                model: python.ed.osList
                currentIndex: Math.max(0,
                    python.ed.osList.indexOf(python.ed.osName))
                onActivated: python.ed.osName = currentText
            }
            FieldHint {
                text: qsTr("Picks the matching binary of native games "
                           + "and dependencies.")
            }
        }
        SettingsBlock {
            FieldLabel { text: qsTr("Architecture") }
            ComboBox {
                Layout.fillWidth: true
                model: python.ed.archList
                currentIndex: Math.max(0,
                    python.ed.archList.indexOf(python.ed.archName))
                onActivated: python.ed.archName = currentText
            }
        }
    }
}
