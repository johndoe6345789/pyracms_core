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
    void normalizesNames_data();
    void normalizesNames();
    void exactBeatsPlatformIndependent();
    void fallsBackToPlatformIndependent();
    void rejectsWrongArch();
};

void TstBinarySelector::normalizesNames_data()
{
    QTest::addColumn<QString>("in");
    QTest::addColumn<QString>("os");
    QTest::addColumn<QString>("arch");
    QTest::newRow("win") << "Win64" << "windows" << "";
    QTest::newRow("mac") << "Darwin" << "macos" << "";
    QTest::newRow("lin") << "LIN" << "linux" << "";
    QTest::newRow("amd") << "AMD64" << "" << "x86_64";
    QTest::newRow("arm") << "aarch64" << "" << "arm64";
    QTest::newRow("i386") << "i686" << "" << "x86";
}

void TstBinarySelector::normalizesNames()
{
    QFETCH(QString, in);
    QFETCH(QString, os);
    QFETCH(QString, arch);
    if (!os.isEmpty()) QCOMPARE(BinarySelector::normalizeOs(in), os);
    if (!arch.isEmpty()) QCOMPARE(BinarySelector::normalizeArch(in), arch);
}

void TstBinarySelector::exactBeatsPlatformIndependent()
{
    const QList<BinaryInfo> l{bin("pi", "pi", "p"),
                              bin("linux", "x86_64", "l")};
    QCOMPARE(BinarySelector::pickBinary(l, "linux", "x86_64")->fileRef,
             QString("l"));
}

void TstBinarySelector::fallsBackToPlatformIndependent()
{
    const QList<BinaryInfo> l{bin("windows", "x86_64", "w"),
                              bin("any", "all", "p")};
    QCOMPARE(BinarySelector::pickBinary(l, "linux", "arm64")->fileRef,
             QString("p"));
}

void TstBinarySelector::rejectsWrongArch()
{
    const QList<BinaryInfo> l{bin("linux", "arm64", "a")};
    QVERIFY(BinarySelector::pickBinary(l, "linux", "x86_64") == nullptr);
}

QTEST_APPLESS_MAIN(TstBinarySelector)
#include "qtst_BinarySelector.moc"
