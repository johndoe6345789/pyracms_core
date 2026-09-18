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
    void gamePrefersConcreteBinary();
    void gameUsesSourceWhenOnlyPiBinary();
    void depUsesPiBinary();
    void errorsWhenNoBuildMatches();
};

void TstBinarySelector::gamePrefersConcreteBinary()
{
    RevisionInfo r;
    r.version = "1";
    r.fileRef = "src";
    r.binaries = {bin("linux", "x86_64", "nat")};
    const auto t = BinarySelector::resolveTarget(r, "game", "linux", "x86_64");
    QVERIFY(t.ok);
    QVERIFY(t.nativeBuild);
    QCOMPARE(t.fileRef, QString("nat"));
}

void TstBinarySelector::gameUsesSourceWhenOnlyPiBinary()
{
    RevisionInfo r;
    r.fileRef = "src";
    r.binaries = {bin("pi", "pi", "pi")};
    const auto t = BinarySelector::resolveTarget(r, "game", "linux", "x86_64");
    QVERIFY(!t.nativeBuild);
    QCOMPARE(t.fileRef, QString("src"));
    QCOMPARE(t.moduleType, QString("folder")); // default layout
}

void TstBinarySelector::depUsesPiBinary()
{
    RevisionInfo r;
    r.moduleType = "file";
    r.binaries = {bin("pi", "pi", "pi")};
    const auto t = BinarySelector::resolveTarget(r, "dep", "macos", "arm64");
    QVERIFY(t.ok);
    QVERIFY(!t.nativeBuild);
    QCOMPARE(t.fileRef, QString("pi"));
    QCOMPARE(t.moduleType, QString("file"));
}

void TstBinarySelector::errorsWhenNoBuildMatches()
{
    RevisionInfo r;
    r.version = "2";
    r.binaries = {bin("windows", "x86_64", "w")};
    const auto t = BinarySelector::resolveTarget(r, "dep", "linux", "x86_64");
    QVERIFY(!t.ok);
    QVERIFY(t.error.contains("linux"));
}

QTEST_APPLESS_MAIN(TstBinarySelector)
#include "qtst_BinarySelector_2.moc"
