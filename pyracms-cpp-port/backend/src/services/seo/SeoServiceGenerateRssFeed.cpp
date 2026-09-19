#include "services/SeoService.h"

namespace pyracms {

void SeoService::generateRssFeed(const DbClientPtr &db, int tenantId,
                                 const std::string &baseUrl,
                                 const std::string &siteTitle,
                                 StringCallback cb) {
    db->execSqlAsync(
        "SELECT a.name, a.display_name, a.created_at, "
        "  (SELECT content FROM article_revisions WHERE article_id = a.id "
        "   ORDER BY created_at DESC LIMIT 1) AS content "
        "FROM articles a "
        "WHERE a.tenant_id = $1 AND a.status = 'published' AND a.is_private = "
        "false "
        "ORDER BY a.created_at DESC LIMIT 20",
        [this, baseUrl, siteTitle, cb](const drogon::orm::Result &result) {
            std::string xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
                              "<rss version=\"2.0\" "
                              "xmlns:atom=\"http://www.w3.org/2005/Atom\">\n"
                              "<channel>\n"
                              "  <title>" +
                              xmlEscape(siteTitle) +
                              "</title>\n"
                              "  <link>" +
                              xmlEscape(baseUrl) +
                              "</link>\n"
                              "  <description>" +
                              xmlEscape(siteTitle) +
                              " RSS Feed</description>\n"
                              "  <atom:link href=\"" +
                              xmlEscape(baseUrl) +
                              "/api/rss.xml\" "
                              "rel=\"self\" type=\"application/rss+xml\"/>\n";

            for (const auto &row : result) {
                auto name = row["name"].as<std::string>();
                auto title = row["display_name"].as<std::string>();
                auto date = row["created_at"].as<std::string>();
                auto content = row["content"].isNull()
                                   ? ""
                                   : row["content"].as<std::string>();
                // Truncate content for description
                if (content.size() > 500)
                    content = content.substr(0, 500) + "...";

                xml += "  <item>\n"
                       "    <title>" +
                       xmlEscape(title) +
                       "</title>\n"
                       "    <link>" +
                       xmlEscape(baseUrl + "/articles/" + name) +
                       "</link>\n"
                       "    <guid>" +
                       xmlEscape(baseUrl + "/articles/" + name) +
                       "</guid>\n"
                       "    <pubDate>" +
                       xmlEscape(date) +
                       "</pubDate>\n"
                       "    <description>" +
                       xmlEscape(content) +
                       "</description>\n"
                       "  </item>\n";
            }

            xml += "</channel>\n</rss>\n";
            cb(xml);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb(""); }, tenantId);
}

} // namespace pyracms
