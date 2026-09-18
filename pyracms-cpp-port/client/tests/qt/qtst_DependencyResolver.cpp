#include <QtTest>

#include "domain/DependencyResolver.h"

using namespace Hypernucleus;

static DepRef ref(const char* n, const char* v = "")
{
    return DepRef{n, v, ""};
}

class TstDependencyResolver : public QObject {
    Q_OBJECT

private slots:
    void ordersDependenciesFirst();
    void reportsCycles();
    void visitsSharedDependencyOnce();
};

void TstDependencyResolver::ordersDependenciesFirst()
{
    const auto lookup = [](const QString& n) -> QList<DepRef> {
        if (n == "a") return {ref("b"), ref("c")};
        if (n == "b") return {ref("c")};
        return {};
    };
    const auto out = DependencyResolver::resolveOrder({ref("a")}, lookup);
    QStringList names;
    for (const DepRef& d : out)
        names << d.name;
    QCOMPARE(names, (QStringList{"c", "b", "a"}));
}

void TstDependencyResolver::reportsCycles()
{
    const auto lookup = [](const QString& n) -> QList<DepRef> {
        return {ref(n == "a" ? "b" : "a")};
    };
    QStringList cycles;
    const auto out =
        DependencyResolver::resolveOrder({ref("a")}, lookup, &cycles);
    QCOMPARE(out.size(), 2);
    QCOMPARE(cycles, QStringList{"b -> a"});
}

void TstDependencyResolver::visitsSharedDependencyOnce()
{
    const auto lookup = [](const QString&) { return QList<DepRef>{}; };
    const auto out = DependencyResolver::resolveOrder(
        {ref("x", "1"), ref("x", "2")}, lookup);
    QCOMPARE(out.size(), 1);
    QCOMPARE(out.at(0).version, QString("1")); // first request wins
}

QTEST_APPLESS_MAIN(TstDependencyResolver)
#include "qtst_DependencyResolver.moc"
