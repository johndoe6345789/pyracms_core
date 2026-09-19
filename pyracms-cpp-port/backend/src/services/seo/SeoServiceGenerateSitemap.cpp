#include "services/SeoService.h"

namespace pyracms {

void SeoService::generateSitemap(const DbClientPtr &db, int tenantId,
                                 const std::string &baseUrl,
                                 StringCallback cb) {
    db->execSqlAsync(
        "SELECT name, created_at FROM articles "
        "WHERE tenant_id = $1 AND status = 'published' AND is_private = false "
        "ORDER BY created_at DESC",
        [this, baseUrl, cb](const drogon::orm::Result &result) {
            std::string xml =
                "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
                "<urlset "
                "xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";

            // Home page
            xml += "  <url><loc>" + xmlEscape(baseUrl) +
                   "</loc>"
                   "<changefreq>daily</changefreq><priority>1.0</priority></"
                   "url>\n";

            for (const auto &row : result) {
                auto name = row["name"].as<std::string>();
                auto date = row["created_at"].as<std::string>();
                // Truncate to date only
                if (date.size() > 10)
                    date = date.substr(0, 10);
                xml += "  <url><loc>" +
                       xmlEscape(baseUrl + "/articles/" + name) +
                       "</loc>"
                       "<lastmod>" +
                       xmlEscape(date) +
                       "</lastmod>"
                       "<changefreq>weekly</changefreq><priority>0.8</"
                       "priority></url>\n";
            }

            xml += "</urlset>\n";
            cb(xml);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb(""); }, tenantId);
}

} // namespace pyracms
