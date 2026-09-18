#pragma once

#include "services/gamedep/GdTypes.h"
#include <vector>

namespace pyracms {

// Read side: pages, the launcher catalog and reference data.
class GameDepService {
public:
    struct ListQuery {
        std::string type, q, tag;
        int limit{50}, offset{0};
    };
    void listPages(const GdCtx &c, const ListQuery &q, GdCb cb);
    void getPage(const GdCtx &c, const std::string &type,
                 const std::string &name, GdCb cb);
    // {"gamedep":[{"game":{...}},{"dependency":{...}}]} (published).
    void catalog(const GdCtx &c, GdCb cb);
    void listOperatingSystems(const GdCtx &c, GdCb cb);
    void listArchitectures(const GdCtx &c, GdCb cb);
};

// Write side: pages and their revisions.
class GameDepWriteService {
public:
    void createPage(const GdCtx &c, const std::string &type,
                    const Json::Value &body, GdCb cb);
    void updatePage(const GdCtx &c, const std::string &type,
                    const std::string &name, const Json::Value &body,
                    GdCb cb);
    void deletePage(const GdCtx &c, const std::string &type,
                    const std::string &name, GdCb cb);
    void createRevision(const GdCtx &c, const std::string &type,
                        const std::string &name, const Json::Value &body,
                        GdCb cb);
    void updateRevision(const GdCtx &c, const std::string &type,
                        const std::string &name, const std::string &ver,
                        const Json::Value &body, GdCb cb);
    void deleteRevision(const GdCtx &c, const std::string &type,
                        const std::string &name, const std::string &ver,
                        GdCb cb);
    void togglePublish(const GdCtx &c, const std::string &type,
                       const std::string &name, const std::string &ver,
                       GdCb cb);
    void uploadSource(const GdCtx &c, const std::string &type,
                      const std::string &name, const std::string &ver,
                      const Json::Value &body, GdCb cb);
};

// Attachments: binaries, dependencies, tags, screenshots, votes.
class GameDepAttachService {
public:
    void addBinary(const GdCtx &c, const std::string &type,
                   const std::string &name, const std::string &ver,
                   const Json::Value &body, GdCb cb);
    void deleteBinary(const GdCtx &c, const std::string &type,
                      const std::string &name, const std::string &ver,
                      int id, GdCb cb);
    void addDependency(const GdCtx &c, const std::string &type,
                       const std::string &name, const Json::Value &body,
                       GdCb cb);
    void removeDependency(const GdCtx &c, const std::string &type,
                          const std::string &name, int id, GdCb cb);
    void setPip(const GdCtx &c, const std::string &type,
                const std::string &name, const Json::Value &body, GdCb cb);
    void setTags(const GdCtx &c, const std::string &type,
                 const std::string &name, const Json::Value &body,
                 GdCb cb);
    void addScreenshot(const GdCtx &c, const std::string &type,
                       const std::string &name, const Json::Value &body,
                       GdCb cb);
    void removeScreenshot(const GdCtx &c, const std::string &type,
                          const std::string &name, int id, GdCb cb);
    void vote(const GdCtx &c, const std::string &type,
              const std::string &name, const Json::Value &body, GdCb cb);
};

} // namespace pyracms
