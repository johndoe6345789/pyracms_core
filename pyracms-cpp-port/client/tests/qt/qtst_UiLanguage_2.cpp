#include <QtTest>
#include <QQmlApplicationEngine>

#include "AppFixture.h"
#include "services/LanguageManager.h"
#include "viewmodels/LanguageWiring.h"

using namespace Hypernucleus;

// Settings -> Language drives the translator and retranslates the UI.
class TstUiLanguage2 : public QObject {
    Q_OBJECT

private slots:
    void settingsChangeInstallsTheTranslator();
};

void TstUiLanguage2::settingsChangeInstallsTheTranslator()
{
    AppFixture a;
    QQmlApplicationEngine engine;
    LanguageManager lm(QStringLiteral(QM_DIR));
    bindLanguage(&lm, &engine, a.vm);
    const auto play = []() {
        return QCoreApplication::translate("PrimaryText", "Play");
    };
    a.vm->settings()->setLanguage("fr");
    QCOMPARE(lm.current(), QString("fr"));
    QCOMPARE(play(), QString("Jouer"));
    a.vm->settings()->setLanguage("es");
    QCOMPARE(play(), QString("Jugar"));
    a.vm->settings()->setLanguage("en");
    QCOMPARE(play(), QString("Play"));
}

QTEST_MAIN(TstUiLanguage2)
#include "qtst_UiLanguage_2.moc"
