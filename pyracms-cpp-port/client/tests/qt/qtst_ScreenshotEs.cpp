#include <QtTest>
#include <QImage>
#include <QProcess>
#include <QTemporaryDir>

// Starts the real launcher offscreen (software renderer) once per language
// and looks at the picture of its window.
class TstScreenshotEs : public QObject {
    Q_OBJECT

    static QImage shoot(const QString& lang, const QTemporaryDir& d)
    {
        const QString png = d.filePath("shot_" + lang + ".png");
        QProcess app;
        QProcessEnvironment env = QProcessEnvironment::systemEnvironment();
        env.insert("QT_QPA_PLATFORM", "offscreen");
        env.insert("QT_QUICK_BACKEND", "software");
        env.insert("HYPERNUCLEUS_HOME", d.filePath("home_" + lang));
        app.setProcessEnvironment(env);
        app.start(QStringLiteral(APP_PATH),
                  {"--lang", lang, "--screenshot", png});
        if (!app.waitForFinished(40000)) app.kill();
        return QImage(png);
    }

private slots:
    void spanishWindowDiffersFromEnglish();
};

void TstScreenshotEs::spanishWindowDiffersFromEnglish()
{
    QTemporaryDir d;
    const QImage en = shoot("en", d);
    const QImage es = shoot("es", d);
    QVERIFY(!en.isNull());
    QVERIFY(!es.isNull());
    QVERIFY(es.width() > 400 && es.height() > 300);
    QCOMPARE(es.size(), en.size());
    QVERIFY(es != en); // the texts of the window changed
}

QTEST_MAIN(TstScreenshotEs)
#include "qtst_ScreenshotEs.moc"
