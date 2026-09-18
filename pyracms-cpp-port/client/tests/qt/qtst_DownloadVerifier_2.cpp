#include <QtTest>
#include <QFile>
#include <QTemporaryDir>

#include "domain/DownloadVerifier.h"

using namespace Hypernucleus;

// sha256("abc")
static const char* kAbcSha =
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";

class TstDownloadVerifier : public QObject {
    Q_OBJECT

private:
    static QString writeFile(const QTemporaryDir& dir, const QString& name,
                             const QByteArray& data)
    {
        const QString path = dir.filePath(name);
        QFile f(path);
        if (f.open(QIODevice::WriteOnly)) f.write(data);
        return path;
    }

private slots:
    void verifyDetectsSizeMismatch();
    void verifyDetectsShaMismatch();
    void verifyDetectsTruncation();
    void verifySkipsUnknownValues();
};

void TstDownloadVerifier::verifyDetectsSizeMismatch()
{
    QTemporaryDir dir;
    const VerifyResult r =
        DownloadVerifier::verify(writeFile(dir, "a", "abc"), 4, kAbcSha);
    QVERIFY(!r.ok);
    QVERIFY(r.error.contains("Size mismatch"));
}

void TstDownloadVerifier::verifyDetectsShaMismatch()
{
    QTemporaryDir dir;
    const VerifyResult r =
        DownloadVerifier::verify(writeFile(dir, "a", "abd"), 3, kAbcSha);
    QVERIFY(!r.ok);
    QVERIFY(r.error.contains("Checksum"));
}

void TstDownloadVerifier::verifyDetectsTruncation()
{
    QTemporaryDir dir;
    const QString path = writeFile(dir, "a", "ab");
    QVERIFY(!DownloadVerifier::verify(path, 3, QString())
                 .ok); // size alone is enough
}

void TstDownloadVerifier::verifySkipsUnknownValues()
{
    QTemporaryDir dir;
    // A server that publishes neither size nor checksum must still work.
    QVERIFY(
        DownloadVerifier::verify(writeFile(dir, "a", "anything"), 0, QString())
            .ok);
    QVERIFY(
        DownloadVerifier::verify(writeFile(dir, "b", "anything"), -1, QString())
            .ok);
}

QTEST_APPLESS_MAIN(TstDownloadVerifier)
#include "qtst_DownloadVerifier_2.moc"
