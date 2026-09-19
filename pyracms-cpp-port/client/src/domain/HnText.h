#pragma once

#include <QCoreApplication>

namespace Hypernucleus {

// Translation context for user-facing text of code that is not a QObject
// (domain logic, static helpers): HnText::tr("...") is picked up by lupdate
// and translated at run time like any tr().
struct HnText {
    Q_DECLARE_TR_FUNCTIONS(HnText)
};

} // namespace Hypernucleus
