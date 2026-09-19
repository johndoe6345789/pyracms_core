#pragma once

#include <QLocale>
#include <QObject>
#include <QStringList>
#include <QTranslator>

namespace Hypernucleus {

// Loads hypernucleus_<lang>.qm and installs it into the application. The
// setting is "system" (follow the OS language) or a code from supported().
class LanguageManager : public QObject {
    Q_OBJECT

public:
    // `dir` holds the .qm files: ":/translations" in the app, a build
    // folder in tests.
    explicit LanguageManager(const QString& dir = QStringLiteral(":/translations"),
                             QObject* parent = nullptr);

    static QStringList supported(); // en, es, fr
    // "system" / "" -> the first OS UI language we have, else "en";
    // unknown codes -> "en".
    static QString resolve(const QString& setting, const QLocale& system);

    // Installs the translator for `setting`; returns the language in use.
    QString apply(const QString& setting);
    QString current() const { return m_current; }

signals:
    void languageApplied(const QString& language);

private:
    QString m_dir;
    QString m_current = QStringLiteral("en");
    QTranslator m_translator;
    bool m_installed = false;
};

} // namespace Hypernucleus
