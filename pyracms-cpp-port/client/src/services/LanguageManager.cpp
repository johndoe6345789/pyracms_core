#include "services/LanguageManager.h"

#include <QCoreApplication>

namespace Hypernucleus {

LanguageManager::LanguageManager(const QString& dir, QObject* parent)
    : QObject(parent), m_dir(dir)
{
}

QStringList LanguageManager::supported()
{
    return {QStringLiteral("en"), QStringLiteral("es"), QStringLiteral("fr")};
}

QString LanguageManager::resolve(const QString& setting, const QLocale& system)
{
    const QString s = setting.trimmed().toLower();
    if (!s.isEmpty() && s != "system")
        return supported().contains(s) ? s : QStringLiteral("en");
    for (const QString& ui : system.uiLanguages()) {
        const QString code = ui.left(2).toLower(); // "es-ES" -> "es"
        if (supported().contains(code)) return code;
    }
    return QStringLiteral("en");
}

QString LanguageManager::apply(const QString& setting)
{
    QString lang = resolve(setting, QLocale::system());
    if (m_installed) {
        QCoreApplication::removeTranslator(&m_translator);
        m_installed = false;
    }
    // English is the source language: nothing to load.
    if (lang != "en") {
        if (m_translator.load("hypernucleus_" + lang, m_dir)) {
            QCoreApplication::installTranslator(&m_translator);
            m_installed = true;
        } else {
            lang = QStringLiteral("en"); // no .qm: stay in English
        }
    }
    m_current = lang;
    emit languageApplied(lang);
    return lang;
}

} // namespace Hypernucleus
