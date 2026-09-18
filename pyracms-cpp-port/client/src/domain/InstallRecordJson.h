#pragma once

#include "domain/InstallStateStore.h"

#include <QJsonObject>

namespace Hypernucleus {
namespace InstallJson {

QJsonObject toJson(const InstallRecord& r);
InstallRecord fromJson(const QJsonObject& o);

} // namespace InstallJson
} // namespace Hypernucleus
