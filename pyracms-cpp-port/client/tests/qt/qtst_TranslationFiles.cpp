#include <QtTest>
#include <QRegularExpression>
#include <QXmlStreamReader>

// translations/*.ts: complete, with every %1 / %2 placeholder kept.
class TstTranslationFiles : public QObject {
    Q_OBJECT
    struct Msg {
        QString source, translation, type;
    };
    static QList<Msg> load(const QString& lang)
    {
        QFile f(QStringLiteral(TS_DIR) + "/hypernucleus_" + lang + ".ts");
        QList<Msg> out;
        if (!f.open(QIODevice::ReadOnly)) return out;
        QXmlStreamReader xml(&f);
        Msg m;
        while (!xml.atEnd()) {
            xml.readNext();
            if (!xml.isStartElement()) continue;
            if (xml.name() == QLatin1String("message")) m = Msg();
            if (xml.name() == QLatin1String("source"))
                m.source = xml.readElementText();
            if (xml.name() == QLatin1String("translation")) {
                m.type = xml.attributes().value("type").toString();
                m.translation = xml.readElementText();
                out << m;
            }
        }
        return out;
    }
    static QStringList placeholders(const QString& text)
    {
        static const QRegularExpression re("%\\d");
        QStringList out;
        for (auto it = re.globalMatch(text); it.hasNext();)
            out << it.next().captured();
        out.sort();
        return out;
    }

private slots:
    void noUnfinishedOrEmptyTranslations_data();
    void noUnfinishedOrEmptyTranslations();
    void placeholdersSurvive_data();
    void placeholdersSurvive();
};

void TstTranslationFiles::noUnfinishedOrEmptyTranslations_data()
{
    QTest::addColumn<QString>("lang");
    for (const char* l : {"en", "es", "fr"}) QTest::newRow(l) << l;
}

void TstTranslationFiles::noUnfinishedOrEmptyTranslations()
{
    QFETCH(QString, lang);
    const QList<Msg> msgs = load(lang);
    QVERIFY(msgs.size() > 200);
    for (const Msg& m : msgs) {
        QVERIFY2(m.type.isEmpty(), qPrintable(m.source));
        QVERIFY2(!m.translation.isEmpty(), qPrintable(m.source));
    }
}

void TstTranslationFiles::placeholdersSurvive_data()
{
    noUnfinishedOrEmptyTranslations_data();
}

void TstTranslationFiles::placeholdersSurvive()
{
    QFETCH(QString, lang);
    for (const Msg& m : load(lang))
        QVERIFY2(placeholders(m.source) == placeholders(m.translation),
                 qPrintable(m.source));
}

QTEST_MAIN(TstTranslationFiles)
#include "qtst_TranslationFiles.moc"
