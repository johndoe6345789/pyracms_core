#include "viewmodels/LanguageWiring.h"
#include "models/GameDepModel.h"
#include "models/GameFilterModel.h"
#include "services/LanguageManager.h"
#include "services/SettingsManager.h"
#include "viewmodels/MainViewModel.h"

#include <QQmlApplicationEngine>

namespace Hypernucleus {

void retranslateTexts(MainViewModel* vm)
{
    if (auto* rows = qobject_cast<GameDepModel*>(vm->library()->sourceModel()))
        rows->refreshAll();
    vm->select(vm->selectedName()); // rebuilds the detail page
}

void bindLanguage(LanguageManager* languages, QQmlApplicationEngine* engine,
                  MainViewModel* vm)
{
    QObject::connect(
        vm->settings(), &SettingsManager::languageChanged, vm,
        [languages, engine, vm]() {
            languages->apply(vm->settings()->language());
            engine->retranslate();
            retranslateTexts(vm);
        });
}

} // namespace Hypernucleus
