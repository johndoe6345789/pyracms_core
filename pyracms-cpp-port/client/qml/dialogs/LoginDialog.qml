import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Optional sign in to a PyraCMS site (private games, account features).
// Accounts are per site (tenant), so the login carries the site slug.
Dialog {
    id: root

    property string errorMessage: ""
    property bool busy: false
    signal registerRequested()

    title: qsTr("Sign in")
    modal: true
    parent: Overlay.overlay
    anchors.centerIn: parent
    width: Math.min(Theme.dialogWidth, parent.width - 2 * Theme.spaceL)
    height: Math.min(implicitHeight, parent.height - 2 * Theme.spaceL)
    padding: Theme.spaceL
    closePolicy: Popup.CloseOnEscape

    function submit() {
        const f = fields
        if (MainViewModel.connection.serverError(f.server) !== ""
                || f.site.trim() === "" || f.user.text.trim() === ""
                || f.pass.text === "") {
            errorMessage = qsTr("Server, site, username and password "
                                + "are required.")
            return
        }
        errorMessage = ""
        busy = true
        MainViewModel.connection.connectTo(f.server, f.site)
        MainViewModel.auth.login(f.user.text.trim(), f.pass.text,
                                 f.site.trim())
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
        function onLoginSuccess() {
            root.busy = false
            fields.pass.text = ""
            root.close()
        }
        function onLoginFailed(error) {
            root.busy = false
            root.errorMessage = error
        }
    }

    contentItem: FormScroll {
        LoginFields { id: fields; onSubmitted: root.submit() }
        ErrorLabel { text: root.errorMessage }
    }

    footer: AuthButtons {
        backText: qsTr("Create account")
        submitText: root.busy ? qsTr("Signing in...") : qsTr("Sign in")
        busy: root.busy
        onBackClicked: { root.close(); root.registerRequested() }
        onCancelClicked: root.close()
        onSubmitClicked: root.submit()
    }
}
