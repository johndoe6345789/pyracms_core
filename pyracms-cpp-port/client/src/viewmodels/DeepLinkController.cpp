#include "viewmodels/DeepLinkController.h"

namespace Hypernucleus {

DeepLinkController::DeepLinkController(QObject* parent)
    : QObject(parent)
{
}

bool DeepLinkController::setUrl(const QString& url, const QString& currentSlug)
{
    const DeepLink parsed = DeepLinkParser::parse(url);
    if (!parsed.isValid()) {
        emit rejected(parsed.error);
        return false;
    }
    m_link = parsed;
    m_siteMismatch = !currentSlug.isEmpty() && currentSlug != parsed.slug;
    emit pendingChanged();
    return true;
}

void DeepLinkController::clear()
{
    if (!m_link.isValid())
        return;
    m_link = DeepLink();
    m_siteMismatch = false;
    emit pendingChanged();
}

void DeepLinkController::accept()
{
    if (!m_link.isValid())
        return;
    const DeepLink link = m_link;
    clear();
    emit accepted(link.actionName(), link.slug, link.name);
}

void DeepLinkController::dismiss()
{
    clear();
}

} // namespace Hypernucleus
