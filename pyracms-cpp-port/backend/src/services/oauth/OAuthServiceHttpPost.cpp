#include "services/DbError.h"
#include "services/OAuthService.h"

#include <curl/curl.h>
#include <json/json.h>
#include <sstream>

namespace pyracms {

std::string OAuthService::httpPost(const std::string &url,
                                   const std::string &postData,
                                   const std::vector<std::string> &headers) {
    std::string response;
    CURL *curl = curl_easy_init();
    if (!curl)
        return "";

    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, postData.c_str());
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, curlWriteCallback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 10L);

    struct curl_slist *headerList = nullptr;
    for (const auto &h : headers) {
        headerList = curl_slist_append(headerList, h.c_str());
    }
    headerList = curl_slist_append(headerList, "Accept: application/json");
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headerList);

    curl_easy_perform(curl);
    curl_slist_free_all(headerList);
    curl_easy_cleanup(curl);
    return response;
}

} // namespace pyracms
