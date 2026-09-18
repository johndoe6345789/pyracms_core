#include "viewmodels/MainViewModelBase.h"
#include "viewmodels/MainViewModelDeps.h"

#include <QCoreApplication>

namespace Hypernucleus {

MainViewModelBase::MainViewModelBase(QObject* parent) : QObject(parent)
{
    createServices(this);
}

QStringList MainViewModelBase::categories() const
{
    return m_model->categories();
}
QString MainViewModelBase::favouritesCategory() const
{
    return QLatin1String(CATEGORY_FAVOURITES);
}
bool MainViewModelBase::loading() const { return m_repo->isRefreshing(); }
QString MainViewModelBase::gameLog() const { return m_games->log(); }
QString MainViewModelBase::appVersion() const
{
    return QCoreApplication::applicationVersion();
}
QString MainViewModelBase::osName() const { return m_settings->osName(); }

} // namespace Hypernucleus
