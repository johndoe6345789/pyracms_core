#include "services/SecretStore.h"

#include <QProcess>
#include <QStandardPaths>

namespace Hypernucleus {
namespace {

constexpr int kTimeoutMs = 8000;

// Freedesktop Secret Service (GNOME Keyring, KWallet, ...) through the
// `secret-tool` program of libsecret. The secret travels over stdin, never
// on the command line. Without a running keyring every call just fails.
class LibsecretStore : public SecretStore {
public:
    explicit LibsecretStore(const QString& tool) : m_tool(tool) {}
    QString backendName() const override { return "libsecret"; }
    bool isAvailable() const override { return !m_tool.isEmpty(); }

    bool write(const QString& service, const QString& account,
               const QString& secret) override
    {
        QString out;
        return run({"store", "--label=Hypernucleus", "service", service,
                    "account", account},
                   secret.toUtf8(), &out);
    }

    QString read(const QString& service, const QString& account) override
    {
        QString out;
        if (!run({"lookup", "service", service, "account", account}, {}, &out))
            return QString();
        return out;
    }

    bool remove(const QString& service, const QString& account) override
    {
        QString out;
        return run({"clear", "service", service, "account", account}, {},
                   &out);
    }

private:
    bool run(const QStringList& args, const QByteArray& input, QString* out)
    {
        if (m_tool.isEmpty()) return false;
        QProcess p;
        p.start(m_tool, args);
        if (!p.waitForStarted(kTimeoutMs)) return false;
        if (!input.isEmpty()) p.write(input);
        p.closeWriteChannel();
        if (!p.waitForFinished(kTimeoutMs)) {
            p.kill();
            return false;
        }
        *out = QString::fromUtf8(p.readAllStandardOutput());
        return p.exitStatus() == QProcess::NormalExit && p.exitCode() == 0;
    }

    QString m_tool;
};

} // namespace

std::unique_ptr<SecretStore> createLibsecretStore(const QString& path)
{
    const QString tool =
        path.isNull() ? QStandardPaths::findExecutable("secret-tool") : path;
    return std::make_unique<LibsecretStore>(tool);
}

} // namespace Hypernucleus
