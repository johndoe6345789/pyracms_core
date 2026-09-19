import QtQuick.Controls
import QtQuick.Layouts

// Full-width text input used by the sign-in / register forms.
TextField {
    Layout.fillWidth: true
    Layout.preferredWidth: 0
    inputMethodHints: Qt.ImhNoAutoUppercase | Qt.ImhNoPredictiveText
}
