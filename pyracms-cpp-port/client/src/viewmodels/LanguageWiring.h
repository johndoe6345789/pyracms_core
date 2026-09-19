#pragma once

class QQmlApplicationEngine;

namespace Hypernucleus {

class LanguageManager;
class MainViewModel;

// Re-evaluates the texts that are made in C++ (model rows, detail page).
void retranslateTexts(MainViewModel* vm);

// Follows Settings -> Language: installs the translator, retranslates the
// QML engine and the C++ texts, at once and without a restart.
void bindLanguage(LanguageManager* languages, QQmlApplicationEngine* engine,
                  MainViewModel* vm);

} // namespace Hypernucleus
