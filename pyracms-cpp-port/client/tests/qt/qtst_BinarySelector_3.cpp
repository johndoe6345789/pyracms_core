#include <QtTest>

#include "domain/BinarySelector.h"

using namespace Hypernucleus;

static BinaryInfo bin(const char* os, const char* arch, const char* ref)
{
    BinaryInfo b;
    b.os = os;
    b.arch = arch;
    b.fileRef = ref;
    return b;
}

class TstBinarySelector : public QObject {
    Q_OBJECT

private slots:
    void errorsWithoutAnyFile();
    void targetJsonRoundTrip();
};

void TstBinarySelector::errorsWithoutAnyFile()
{
    const auto t = BinarySelector::resolveTarget(RevisionInfo(), "game",
                                                 "linux", "x86_64");
    QVERIFY(!t.ok);
    QVERIFY(t.error.contains("No file UUID"));
}

void TstBinarySelector::targetJsonRoundTrip()
{
    DownloadTarget t;
    t.fileRef = "f";
    t.url = "/x";
    t.size = 9;
    t.sha256 = "ab";
    t.nativeBuild = true;
    t.executable = "e";
    const auto back = DownloadTarget::fromJson(t.toJson());
    QVERIFY(back.ok);
    QCOMPARE(back.size, qint64(9));
    QCOMPARE(back.executable, QString("e"));
    QVERIFY(back.nativeBuild);
    const auto legacy =
        DownloadTarget::fromJson(QJsonObject{{"file_uuid", "u"}});
    QCOMPARE(legacy.fileRef, QString("u"));
}

QTEST_APPLESS_MAIN(TstBinarySelector)
#include "qtst_BinarySelector_3.moc"
