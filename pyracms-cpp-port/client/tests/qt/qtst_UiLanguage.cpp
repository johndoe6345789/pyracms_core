#include <QtTest>

#include "AppFixture.h"
#include "models/GameDepModel.h"
#include "models/GameFilterModel.h"
#include "services/LanguageManager.h"
#include "viewmodels/LanguageWiring.h"

using namespace Hypernucleus;

// Texts made in C++ follow a language change (MainViewModel::retranslate).
class TstUiLanguage : public QObject {
    Q_OBJECT

    static QString group(AppFixture& a)
    {
        const QModelIndex i = a.vm->library()->index(0, 0);
        return a.vm->library()->data(i, GameDepRows::GroupRole).toString();
    }

private slots:
    void modelTextsFollowTheLanguage();
    void settingsKeepsTheChoice();
};

void TstUiLanguage::modelTextsFollowTheLanguage()
{
    AppFixture a;
    QTRY_COMPARE_WITH_TIMEOUT(a.vm->library()->count(), 2, 5000);
    QCOMPARE(group(a), QString("Not installed"));
    LanguageManager lm(QStringLiteral(QM_DIR));
    lm.apply("es");
    retranslateTexts(a.vm);
    QCOMPARE(group(a), QString("No instalado"));
    lm.apply("fr");
    retranslateTexts(a.vm);
    QCOMPARE(group(a), QString("Non installé"));
    lm.apply("en");
    retranslateTexts(a.vm);
    QCOMPARE(group(a), QString("Not installed"));
}

void TstUiLanguage::settingsKeepsTheChoice()
{
    AppFixture a;
    QSignalSpy changed(a.vm->settings(), &SettingsManager::languageChanged);
    a.vm->settings()->setLanguage("es");
    a.vm->settings()->save();
    QCOMPARE(changed.count(), 1);
    SettingsManager again;
    QCOMPARE(again.language(), QString("es"));
    a.vm->settings()->setLanguage("system");
    a.vm->settings()->save();
}

QTEST_MAIN(TstUiLanguage)
#include "qtst_UiLanguage.moc"
