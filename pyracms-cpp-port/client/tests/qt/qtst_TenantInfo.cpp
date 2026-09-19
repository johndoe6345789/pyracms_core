#include <QtTest>

#include "domain/TenantInfo.h"

using namespace Hypernucleus;

class TstTenantInfo : public QObject {
    Q_OBJECT

private slots:
    void parsesTenantList();
    void skipsEntriesWithoutSlug();
    void notAnArrayGivesEmptyList();
    void labelShowsNameAndSlug();
    void choicesCarryValueLabelAndDescription();
};

static QJsonDocument doc(const char* json)
{
    return QJsonDocument::fromJson(json);
}

void TstTenantInfo::parsesTenantList()
{
    const auto t = TenantParser::parse(doc(
        R"([{"id":3,"slug":" acme ","displayName":"Acme Games",
             "description":"d","extra":1},{"id":4,"slug":"b"}])"));
    QCOMPARE(t.size(), 2);
    QCOMPARE(t[0].id, 3);
    QCOMPARE(t[0].slug, QString("acme"));
    QCOMPARE(t[0].displayName, QString("Acme Games"));
    QCOMPARE(t[0].description, QString("d"));
    QVERIFY(t[1].displayName.isEmpty());
}

void TstTenantInfo::skipsEntriesWithoutSlug()
{
    const auto t = TenantParser::parse(
        doc(R"([{"id":1},{"slug":""},5,{"slug":"ok"}])"));
    QCOMPARE(t.size(), 1);
    QCOMPARE(t[0].slug, QString("ok"));
}

void TstTenantInfo::notAnArrayGivesEmptyList()
{
    QVERIFY(TenantParser::parse(doc(R"({"error":"x"})")).isEmpty());
    QVERIFY(TenantParser::parse(QJsonDocument()).isEmpty());
}

void TstTenantInfo::labelShowsNameAndSlug()
{
    TenantInfo t;
    t.slug = "acme";
    QCOMPARE(t.label(), QString("acme"));
    t.displayName = "acme";
    QCOMPARE(t.label(), QString("acme"));
    t.displayName = "Acme Games";
    QCOMPARE(t.label(), QString("Acme Games (acme)"));
}

void TstTenantInfo::choicesCarryValueLabelAndDescription()
{
    TenantInfo t;
    t.slug = "acme";
    t.displayName = "Acme";
    t.description = "Fun";
    const QVariantList l = TenantParser::toChoices({t});
    QCOMPARE(l.size(), 1);
    const QVariantMap m = l[0].toMap();
    QCOMPARE(m["value"].toString(), QString("acme"));
    QCOMPARE(m["label"].toString(), QString("Acme (acme)"));
    QCOMPARE(m["description"].toString(), QString("Fun"));
}

QTEST_APPLESS_MAIN(TstTenantInfo)
#include "qtst_TenantInfo.moc"
