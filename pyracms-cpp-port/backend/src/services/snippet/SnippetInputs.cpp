#include "services/SnippetInputs.h"

#include "services/CodeSnippetService.h"
#include "services/FileService.h"
#include "storage/BlobRegistry.h"

namespace pyracms {

namespace {

struct Walk {
    drogon::orm::DbClientPtr db;
    std::vector<SnippetAttachmentDto> atts;
    std::vector<RunInput> out;
    size_t next{0};
    size_t bytes{0};
    std::function<void(std::vector<RunInput>)> done;
};

void step(std::shared_ptr<Walk> w) {
    using Svc = DockerExecutionService;
    while (w->next < w->atts.size()) {
        const auto a = w->atts[w->next++];
        if (!Svc::inputNameOk(a.filename) || a.size < 0 ||
            w->out.size() >= Svc::kMaxInputFiles ||
            w->bytes + static_cast<size_t>(a.size) > Svc::kMaxInputBytes)
            continue;
        static FileService files;
        files.getFile(w->db, a.fileUuid,
                      [w, a](const std::optional<FileDto> &f) {
            auto store = f ? BlobRegistry::named(f->storage) : nullptr;
            if (!store)
                return step(w);
            store->get({f->tenantId, f->uuid, false},
                       [w, a](BlobStatus s, std::string data) {
                           if (s == BlobStatus::Ok) {
                               w->bytes += data.size();
                               w->out.push_back({a.filename, std::move(data)});
                           }
                           step(w);
                       });
        });
        return;
    }
    w->done(std::move(w->out));
}

} // namespace

void loadSnippetInputs(const drogon::orm::DbClientPtr &db, int snippetId,
                       std::function<void(std::vector<RunInput>)> cb) {
    static CodeSnippetService snippets;
    snippets.listAttachments(
        db, snippetId,
        [db, cb](const std::vector<SnippetAttachmentDto> &atts) {
            auto w = std::make_shared<Walk>();
            w->db = db;
            w->atts = atts;
            w->done = cb;
            step(w);
        });
}

} // namespace pyracms
