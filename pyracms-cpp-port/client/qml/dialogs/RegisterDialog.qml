import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Create an account on a site (tenant).
Dialog {
    id: root

    property string errorMessage: ""
    property bool busy: false
    signal backToLogin()

    title: qsTr("Create an account")
    modal: true
    parent: Overlay.overlay
    anchors.centerIn: parent
    width: 420
    closePolicy: Popup.CloseOnEscape

    function submit() {
        const f = fields
        const site = f.site.text.trim()
        const user = f.user.text.trim()
        const email = f.email.text.trim()
        if (site === "" || user === "" || email === ""
                || f.pass.text === "") {
            errorMessage = qsTr("All fields are required.")
            return
        }
        if (f.pass.text !== f.confirm.text) {
            errorMessage = qsTr("Passwords do not match.")
            return
        }
        errorMessage = ""
        busy = true
        MainViewModel.settings.tenantSlug = site
        MainViewModel.auth.registerUser(user, email, f.pass.text)
    }

    onAboutToShow: {
        fields.site.text = MainViewModel.settings.tenantSlug
        errorMessage = ""
        busy = false
        fields.user.forceActiveFocus()
    }

    Connections {
        target: MainViewModel.auth
        function onRegisterSuccess() {
            root.busy = false
            root.close()
            root.backToLogin()
        }
        function onRegisterFailed(error) {
            root.busy = false
            root.errorMessage = error
        }
    }

    ColumnLayout {
        anchors.fill: parent
        spacing: Theme.spaceM

        RegisterFields { id: fields; onSubmitted: root.submit() }
        ErrorLabel { text: root.errorMessage }

        AuthButtons {
            backText: qsTr("Back to sign in")
            submitText: root.busy ? qsTr("Creating...")
                                  : qsTr("Create account")
            busy: root.busy
            onBackClicked: { root.close(); root.backToLogin() }
            onSubmitClicked: root.submit()
        }
    }
}
