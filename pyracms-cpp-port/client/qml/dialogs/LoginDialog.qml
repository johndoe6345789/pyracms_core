import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Hypernucleus

// Sign in to a PyraCMS site. Accounts are per site (tenant), so the site
// slug is part of the login request: {username, password, tenant}.
Dialog {
    id: root

    property string errorMessage: ""
    property bool busy: false
    signal registerRequested()

    title: qsTr("Sign in to Hypernucleus")
    modal: true
    parent: Overlay.overlay
    anchors.centerIn: parent
    width: 420
    closePolicy: Popup.CloseOnEscape

    function submit() {
        const site = fields.site.text.trim()
        const user = fields.user.text.trim()
        const server = fields.server.text.trim()
        if (site === "" || user === "" || fields.pass.text === "") {
            errorMessage = qsTr("Site, username and password are required.")
            return
        }
        errorMessage = ""
        busy = true
        if (server !== MainViewModel.settings.repoUrl)
            MainViewModel.settings.repoUrl = server
        MainViewModel.auth.login(user, fields.pass.text, site)
    }

    onAboutToShow: {
        fields.server.text = MainViewModel.settings.repoUrl
        fields.site.text = MainViewModel.settings.tenantSlug
        errorMessage = ""
        busy = false
        if (fields.site.text === "")
            fields.site.forceActiveFocus()
        else
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

    ColumnLayout {
        anchors.fill: parent
        spacing: Theme.spaceM

        LoginFields { id: fields; onSubmitted: root.submit() }
        ErrorLabel { text: root.errorMessage }

        AuthButtons {
            spacing: Theme.spaceM
            backText: qsTr("Create account")
            skipText: qsTr("Browse without signing in")
            submitText: root.busy ? qsTr("Signing in...")
                                  : qsTr("Sign in")
            busy: root.busy
            onBackClicked: { root.close(); root.registerRequested() }
            onSkipClicked: root.close()
            onSubmitClicked: root.submit()
        }
    }
}
