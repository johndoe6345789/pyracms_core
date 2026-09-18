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
    void shaOfKnownContent();
    void shaOfMissingFileIsEmpty();
    void normalizeShaStripsPrefixAndCase();
    void verifyAcceptsMatchingSizeAndSha();
    void verifyAcceptsShaWithPrefixAndUppercase();
};

void TstDownloadVerifier::shaOfKnownContent()
{
    QTemporaryDir dir;
    QCOMPARE(DownloadVerifier::sha256File(writeFile(dir, "a", "abc")),
             QString(kAbcSha));
}

void TstDownloadVerifier::shaOfMissingFileIsEmpty()
{
    QTemporaryDir dir;
    QVERIFY(DownloadVerifier::sha256File(dir.filePath("nope")).isEmpty());
}

void TstDownloadVerifier::normalizeShaStripsPrefixAndCase()
{
    QCOMPARE(DownloadVerifier::normalizeSha("  SHA256:ABCDEF "),
             QString("abcdef"));
    QCOMPARE(DownloadVerifier::normalizeSha("abc"), QString("abc"));
    QVERIFY(DownloadVerifier::normalizeSha("").isEmpty());
}

void TstDownloadVerifier::verifyAcceptsMatchingSizeAndSha()
{
    QTemporaryDir dir;
    const VerifyResult r =
        DownloadVerifier::verify(writeFile(dir, "a", "abc"), 3, kAbcSha);
    QVERIFY2(r.ok, qPrintable(r.error));
}

void TstDownloadVerifier::verifyAcceptsShaWithPrefixAndUppercase()
{
    QTemporaryDir dir;
    const QString path = writeFile(dir, "a", "abc");
    QVERIFY(DownloadVerifier::verify(
                path, 0, QString("sha256:") + QString(kAbcSha).toUpper())
                .ok);
}

QTEST_APPLESS_MAIN(TstDownloadVerifier)
#include "qtst_DownloadVerifier.moc"
