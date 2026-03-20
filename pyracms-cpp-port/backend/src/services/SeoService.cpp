#include "services/SeoService.h"

namespace pyracms {

std::string SeoService::xmlEscape(const std::string &s) {
    std::string result;
    result.reserve(s.size());
    for (char c : s) {
        switch (c) {
            case '&': result += "&amp;"; break;
            case '<': result += "&lt;"; break;
            case '>': result += "&gt;"; break;
            case '"': result += "&quot;"; break;
            case '\'': result += "&apos;"; break;
            default: result += c;
        }
    }
    return result;
}

void SeoService::generateSitemap(const DbClientPtr &db, int tenantId,
                                  const std::string &baseUrl,
                                  StringCallback cb) {
    db->execSqlAsync(
        "SELECT name, created_at FROM articles "
        "WHERE tenant_id = $1 AND status = 'published' AND is_private = false "
        "ORDER BY created_at DESC",
        [this, baseUrl, cb](const drogon::orm::Result &result) {
            std::string xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
                "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";

            // Home page
            xml += "  <url><loc>" + xmlEscape(baseUrl) + "</loc>"
                   "<changefreq>daily</changefreq><priority>1.0</priority></url>\n";

            for (const auto &row : result) {
                auto name = row["name"].as<std::string>();
                auto date = row["created_at"].as<std::string>();
                // Truncate to date only
                if (date.size() > 10) date = date.substr(0, 10);
                xml += "  <url><loc>" + xmlEscape(baseUrl + "/articles/" + name) + "</loc>"
                       "<lastmod>" + xmlEscape(date) + "</lastmod>"
                       "<changefreq>weekly</changefreq><priority>0.8</priority></url>\n";
            }

            xml += "</urlset>\n";
            cb(xml);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb("");
        },
        tenantId);
}

void SeoService::generateRssFeed(const DbClientPtr &db, int tenantId,
                                  const std::string &baseUrl,
                                  const std::string &siteTitle,
                                  StringCallback cb) {
    db->execSqlAsync(
        "SELECT a.name, a.display_name, a.created_at, "
        "  (SELECT content FROM article_revisions WHERE article_id = a.id "
        "   ORDER BY created_at DESC LIMIT 1) AS content "
        "FROM articles a "
        "WHERE a.tenant_id = $1 AND a.status = 'published' AND a.is_private = false "
        "ORDER BY a.created_at DESC LIMIT 20",
        [this, baseUrl, siteTitle, cb](const drogon::orm::Result &result) {
            std::string xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
                "<rss version=\"2.0\" xmlns:atom=\"http://www.w3.org/2005/Atom\">\n"
                "<channel>\n"
                "  <title>" + xmlEscape(siteTitle) + "</title>\n"
                "  <link>" + xmlEscape(baseUrl) + "</link>\n"
                "  <description>" + xmlEscape(siteTitle) + " RSS Feed</description>\n"
                "  <atom:link href=\"" + xmlEscape(baseUrl) + "/api/rss.xml\" "
                "rel=\"self\" type=\"application/rss+xml\"/>\n";

            for (const auto &row : result) {
                auto name = row["name"].as<std::string>();
                auto title = row["display_name"].as<std::string>();
                auto date = row["created_at"].as<std::string>();
                auto content = row["content"].isNull() ? "" : row["content"].as<std::string>();
                // Truncate content for description
                if (content.size() > 500) content = content.substr(0, 500) + "...";

                xml += "  <item>\n"
                       "    <title>" + xmlEscape(title) + "</title>\n"
                       "    <link>" + xmlEscape(baseUrl + "/articles/" + name) + "</link>\n"
                       "    <guid>" + xmlEscape(baseUrl + "/articles/" + name) + "</guid>\n"
                       "    <pubDate>" + xmlEscape(date) + "</pubDate>\n"
                       "    <description>" + xmlEscape(content) + "</description>\n"
                       "  </item>\n";
            }

            xml += "</channel>\n</rss>\n";
            cb(xml);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb("");
        },
        tenantId);
}

void SeoService::generateAtomFeed(const DbClientPtr &db, int tenantId,
                                   const std::string &baseUrl,
                                   const std::string &siteTitle,
                                   StringCallback cb) {
    db->execSqlAsync(
        "SELECT a.name, a.display_name, a.created_at, "
        "  (SELECT content FROM article_revisions WHERE article_id = a.id "
        "   ORDER BY created_at DESC LIMIT 1) AS content "
        "FROM articles a "
        "WHERE a.tenant_id = $1 AND a.status = 'published' AND a.is_private = false "
        "ORDER BY a.created_at DESC LIMIT 20",
        [this, baseUrl, siteTitle, cb](const drogon::orm::Result &result) {
            std::string xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
                "<feed xmlns=\"http://www.w3.org/2005/Atom\">\n"
                "  <title>" + xmlEscape(siteTitle) + "</title>\n"
                "  <link href=\"" + xmlEscape(baseUrl) + "\"/>\n"
                "  <link href=\"" + xmlEscape(baseUrl) + "/api/atom.xml\" rel=\"self\"/>\n"
                "  <id>" + xmlEscape(baseUrl) + "</id>\n";

            for (const auto &row : result) {
                auto name = row["name"].as<std::string>();
                auto title = row["display_name"].as<std::string>();
                auto date = row["created_at"].as<std::string>();
                auto content = row["content"].isNull() ? "" : row["content"].as<std::string>();
                if (content.size() > 500) content = content.substr(0, 500) + "...";

                xml += "  <entry>\n"
                       "    <title>" + xmlEscape(title) + "</title>\n"
                       "    <link href=\"" + xmlEscape(baseUrl + "/articles/" + name) + "\"/>\n"
                       "    <id>" + xmlEscape(baseUrl + "/articles/" + name) + "</id>\n"
                       "    <updated>" + xmlEscape(date) + "</updated>\n"
                       "    <summary>" + xmlEscape(content) + "</summary>\n"
                       "  </entry>\n";
            }

            xml += "</feed>\n";
            cb(xml);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb("");
        },
        tenantId);
}

void SeoService::getArticleJsonLd(const DbClientPtr &db, int tenantId,
                                   const std::string &articleName,
                                   const std::string &baseUrl,
                                   std::function<void(const Json::Value &)> cb) {
    db->execSqlAsync(
        "SELECT a.*, u.username AS author_name, "
        "  (SELECT content FROM article_revisions WHERE article_id = a.id "
        "   ORDER BY created_at DESC LIMIT 1) AS content "
        "FROM articles a "
        "LEFT JOIN users u ON u.id = a.user_id "
        "WHERE a.tenant_id = $1 AND a.name = $2",
        [baseUrl, articleName, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(Json::Value::null);
                return;
            }
            const auto row = result[0];
            Json::Value ld;
            ld["@context"] = "https://schema.org";
            ld["@type"] = "Article";
            ld["headline"] = row["display_name"].as<std::string>();
            ld["url"] = baseUrl + "/articles/" + articleName;
            ld["datePublished"] = row["created_at"].as<std::string>();
            if (!row["published_at"].isNull())
                ld["dateModified"] = row["published_at"].as<std::string>();

            Json::Value author;
            author["@type"] = "Person";
            author["name"] = row["author_name"].isNull() ? "Unknown" : row["author_name"].as<std::string>();
            ld["author"] = author;

            auto content = row["content"].isNull() ? "" : row["content"].as<std::string>();
            if (content.size() > 200) content = content.substr(0, 200) + "...";
            ld["description"] = content;

            cb(ld);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb(Json::Value::null);
        },
        tenantId, articleName);
}

void SeoService::getOpenGraphData(const DbClientPtr &db, int tenantId,
                                   const std::string &articleName,
                                   const std::string &baseUrl,
                                   std::function<void(const Json::Value &)> cb) {
    db->execSqlAsync(
        "SELECT a.display_name, a.created_at, u.username AS author_name, "
        "  (SELECT LEFT(content, 200) FROM article_revisions WHERE article_id = a.id "
        "   ORDER BY created_at DESC LIMIT 1) AS description "
        "FROM articles a "
        "LEFT JOIN users u ON u.id = a.user_id "
        "WHERE a.tenant_id = $1 AND a.name = $2",
        [baseUrl, articleName, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(Json::Value::null);
                return;
            }
            const auto row = result[0];
            Json::Value og;
            og["og:type"] = "article";
            og["og:title"] = row["display_name"].as<std::string>();
            og["og:url"] = baseUrl + "/articles/" + articleName;
            og["og:description"] = row["description"].isNull() ? "" : row["description"].as<std::string>();
            og["article:published_time"] = row["created_at"].as<std::string>();
            og["article:author"] = row["author_name"].isNull() ? "" : row["author_name"].as<std::string>();
            cb(og);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb(Json::Value::null);
        },
        tenantId, articleName);
}

} // namespace pyracms
