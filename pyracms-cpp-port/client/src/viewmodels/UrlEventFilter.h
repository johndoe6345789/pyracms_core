#pragma once

#include <QEvent>
#include <QFileOpenEvent>
#include <QObject>
#include <QUrl>

#include "viewmodels/MainViewModel.h"

namespace Hypernucleus {

// macOS delivers pyracms:// URLs as QFileOpenEvent instead of arguments.
class UrlEventFilter : public QObject {
public:
    explicit UrlEventFilter(MainViewModel* vm) : QObject(vm), m_vm(vm) {}

protected:
    bool eventFilter(QObject* watched, QEvent* event) override
    {
        if (event->type() == QEvent::FileOpen) {
            const QUrl url = static_cast<QFileOpenEvent*>(event)->url();
            if (url.isValid()) {
                m_vm->handleUrl(url.toString());
                return true;
            }
        }
        return QObject::eventFilter(watched, event);
    }

private:
    MainViewModel* m_vm;
};

} // namespace Hypernucleus
