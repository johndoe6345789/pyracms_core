#include "domain/DependencyResolver.h"

#include <QSet>

namespace Hypernucleus {
namespace DependencyResolver {

namespace {

struct Walker {
    const Lookup& lookup;
    QStringList* cycles;
    QSet<QString> done;
    QSet<QString> active;
    QStringList stack;
    QList<DepRef> out;

    void visit(const DepRef& ref)
    {
        if (done.contains(ref.name))
            return;
        if (active.contains(ref.name)) {
            if (cycles)
                cycles->append(stack.last() + " -> " + ref.name);
            return;
        }
        active.insert(ref.name);
        stack.append(ref.name);
        const QList<DepRef> children = lookup ? lookup(ref.name) : QList<DepRef>();
        for (const DepRef& child : children)
            visit(child);
        stack.removeLast();
        active.remove(ref.name);
        done.insert(ref.name);
        out.append(ref);
    }
};

} // namespace

QList<DepRef> resolveOrder(const QList<DepRef>& roots, const Lookup& lookup,
                           QStringList* cycles)
{
    Walker w{lookup, cycles, {}, {}, {}, {}};
    for (const DepRef& r : roots)
        w.visit(r);
    return w.out;
}

} // namespace DependencyResolver
} // namespace Hypernucleus
