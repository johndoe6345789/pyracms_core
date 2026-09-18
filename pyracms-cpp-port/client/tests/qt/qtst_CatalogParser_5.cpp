#include <QtTest>
#include <QJsonArray>
#include <QJsonDocument>
#include <QJsonObject>

#include "domain/CatalogParser.h"
#include "domain/VersionCompare.h"

using namespace Hypernucleus;

static QJsonObject obj(const char* json)
{
    return QJsonDocument::fromJson(json).object();
}

class TstCatalogParser : public QObject {
    Q_OBJECT

private slots:
    void latestVersionUsesNumericOrderAndPublishedOnly();
    void revisionLookupToleratesFloatSpelling();
};

void TstCatalogParser::latestVersionUsesNumericOrderAndPublishedOnly()
{
    GameEntry e;
    for (const char* v : {"1.9", "1.10", "1.2"}) {
        RevisionInfo r;
        r.version = v;
        e.revisions << r;
    }
    RevisionInfo draft;
    draft.version = "2.0";
    draft.published = false;
    e.revisions << draft;
    QCOMPARE(e.latestVersion(), QString("1.10"));

    GameEntry none;
    QVERIFY(none.latestVersion().isEmpty());
}

void TstCatalogParser::revisionLookupToleratesFloatSpelling()
{
    GameEntry e;
    RevisionInfo r;
    r.version = "1.0";
    r.fileRef = "f";
    e.revisions << r;
    QVERIFY(e.revision("1.0") != nullptr);
    QVERIFY(e.revision("1") != nullptr); // original client stored floats
    QVERIFY(e.revision("2") == nullptr);
    QVERIFY(e.revision("") == nullptr);
}

QTEST_APPLESS_MAIN(TstCatalogParser)
#include "qtst_CatalogParser_5.moc"
