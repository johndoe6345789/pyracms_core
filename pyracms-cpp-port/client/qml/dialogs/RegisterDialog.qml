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
    width: Math.min(Theme.dialogWidth, parent.width - 2 * Theme.spaceL)
    height: Math.min(implicitHeight, parent.height - 2 * Theme.spaceL)
    padding: Theme.spaceL
    closePolicy: Popup.CloseOnEscape

    function submit() {
        const f = fields
        const site = f.site.trim()
        const user = f.user.text.trim()
        const email = f.email.text.trim()
        if (MainViewModel.connection.serverError(f.server) !== ""
                || site === "" || user === "" || email === ""
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
        MainViewModel.connection.connectTo(f.server, site)
        MainViewModel.auth.registerUser(user, email, f.pass.text)
    }

    onAboutToShow: {
        fields.server = MainViewModel.settings.repoUrl
        fields.site = MainViewModel.settings.tenantSlug
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

    contentItem: FormScroll {
        RegisterFields { id: fields; onSubmitted: root.submit() }
        ErrorLabel { text: root.errorMessage }
    }

    footer: AuthButtons {
        backText: qsTr("Back to sign in")
        submitText: root.busy ? qsTr("Creating...")
                              : qsTr("Create account")
        busy: root.busy
        onBackClicked: { root.close(); root.backToLogin() }
        onCancelClicked: root.close()
        onSubmitClicked: root.submit()
    }
}
