#include <QtTest>

#include "services/LanguageManager.h"

using namespace Hypernucleus;

// Uses the .qm files that lrelease made from translations/*.ts.
class TstLanguageManager : public QObject {
    Q_OBJECT

    static QString play()
    {
        return QCoreApplication::translate("PrimaryText", "Play");
    }

private slots:
    void resolvesSettingsAndSystemLocales();
    void loadsAndSwitchesTranslators();
    void unknownOrMissingFallsBackToEnglish();
    void translatesTextOfNonQObjectCode();
};

void TstLanguageManager::resolvesSettingsAndSystemLocales()
{
    const QLocale es("es_ES"), de("de_DE"), fr("fr_CA");
    QCOMPARE(LanguageManager::resolve("system", es), QString("es"));
    QCOMPARE(LanguageManager::resolve("", fr), QString("fr"));
    QCOMPARE(LanguageManager::resolve("system", de), QString("en"));
    QCOMPARE(LanguageManager::resolve("FR", de), QString("fr"));
    QCOMPARE(LanguageManager::resolve("xx", es), QString("en"));
    QCOMPARE(LanguageManager::supported(),
             (QStringList{"en", "es", "fr"}));
}

void TstLanguageManager::loadsAndSwitchesTranslators()
{
    LanguageManager lm(QStringLiteral(QM_DIR));
    QSignalSpy applied(&lm, &LanguageManager::languageApplied);
    QCOMPARE(play(), QString("Play"));
    QCOMPARE(lm.apply("es"), QString("es"));
    QCOMPARE(play(), QString("Jugar"));
    QCOMPARE(lm.apply("fr"), QString("fr")); // replaces, not stacks
    QCOMPARE(play(), QString("Jouer"));
    QCOMPARE(lm.apply("en"), QString("en"));
    QCOMPARE(play(), QString("Play"));
    QCOMPARE(applied.count(), 3);
    QCOMPARE(lm.current(), QString("en"));
}

void TstLanguageManager::unknownOrMissingFallsBackToEnglish()
{
    LanguageManager missing(QStringLiteral("/no/such/folder"));
    QCOMPARE(missing.apply("es"), QString("en"));
    QCOMPARE(play(), QString("Play"));
    LanguageManager lm(QStringLiteral(QM_DIR));
    QCOMPARE(lm.apply("klingon"), QString("en"));
}

void TstLanguageManager::translatesTextOfNonQObjectCode()
{
    LanguageManager lm(QStringLiteral(QM_DIR));
    lm.apply("es");
    QCOMPARE(QCoreApplication::translate("HnText", "Malformed URL"),
             QString("URL mal formada"));
    lm.apply("fr");
    QCOMPARE(QCoreApplication::translate("HnText", "Malformed URL"),
             QString("URL mal formée"));
}

QTEST_MAIN(TstLanguageManager)
#include "qtst_LanguageManager.moc"
