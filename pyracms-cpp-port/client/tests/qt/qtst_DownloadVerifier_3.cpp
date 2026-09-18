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
    void verifyMissingFile();
    void resumeOffsetBehaviour();
};

void TstDownloadVerifier::verifyMissingFile()
{
    QTemporaryDir dir;
    const VerifyResult r =
        DownloadVerifier::verify(dir.filePath("missing"), 0, QString());
    QVERIFY(!r.ok);
    QVERIFY(!r.error.isEmpty());
}

void TstDownloadVerifier::resumeOffsetBehaviour()
{
    QTemporaryDir dir;
    QCOMPARE(DownloadVerifier::resumeOffset(dir.filePath("none.part"), 100),
             qint64(0));

    const QString empty = writeFile(dir, "empty.part", "");
    QCOMPARE(DownloadVerifier::resumeOffset(empty, 100), qint64(0));

    const QString half = writeFile(dir, "half.part", QByteArray(40, 'x'));
    QCOMPARE(DownloadVerifier::resumeOffset(half, 100), qint64(40));
    QCOMPARE(DownloadVerifier::resumeOffset(half, 0),
             qint64(40)); // total unknown: trust it
    QCOMPARE(DownloadVerifier::resumeOffset(half, 40),
             qint64(40)); // already complete

    // Larger than the expected size proves the file is stale or corrupt.
    QCOMPARE(DownloadVerifier::resumeOffset(half, 39), qint64(0));
}

QTEST_APPLESS_MAIN(TstDownloadVerifier)
#include "qtst_DownloadVerifier_3.moc"
