#pragma once

#include "MiniHttp.h"
#include "services/DownloadManager.h"

// Helpers of the anonymous / private download suites.
inline bool dlSentAuth(const MiniHttp& http)
{
    return http.heads.last().contains("Authorization: Bearer",
                                      Qt::CaseInsensitive);
}

inline Hypernucleus::DownloadManager::Request dlJob(const MiniHttp& http,
                                                    const QString& dest)
{
    Hypernucleus::DownloadManager::Request r;
    r.id = "job";
    r.url = QUrl(http.baseUrl() + "/api/files/abc");
    r.destPath = dest;
    return r;
}
