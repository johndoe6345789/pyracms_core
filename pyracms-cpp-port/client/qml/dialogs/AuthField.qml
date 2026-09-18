import QtQuick.Controls
import QtQuick.Layouts

// Full-width text input used by the sign-in / register forms.
TextField {
    Layout.fillWidth: true
    inputMethodHints: Qt.ImhNoAutoUppercase | Qt.ImhNoPredictiveText
}
