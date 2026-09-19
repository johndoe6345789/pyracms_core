#include "controllers/FileRules.h"
#include "filters/OwnerRules.h"
#include "security/Hash.h"
#include "security/Validate.h"

#include <gtest/gtest.h>

using namespace pyracms;

TEST(OwnerRulesTest, AuthorsModeratorsAndSiteOwnersMayChangeContent) {
    OwnedRow row{7, 3, false};
    auto ok = [&](int role, int actor, int tenant, OwnedRow r = {7, 3, false}) {
        return writeAllowed(Resource::Article, role, actor, tenant, r);
    };
    EXPECT_TRUE(ok(1, 7, 3));            // author
    EXPECT_FALSE(ok(1, 8, 3));           // stranger
    EXPECT_TRUE(ok(2, 8, 3));            // moderator
    EXPECT_FALSE(ok(2, 8, 4));           // moderator of another site
    EXPECT_TRUE(ok(1, 8, 0, {7, 3, true})); // platform site owner
    EXPECT_FALSE(ok(1, 0, 3, {0, 3, false})); // nobody owns it: not "user 0"
    EXPECT_TRUE(ok(2, 8, 0));            // platform moderator spans sites
    (void)row;
}

TEST(OwnerRulesTest, WebhooksNeedAdminsAndFilesTheUploader) {
    OwnedRow hook{0, 3, false};
    EXPECT_FALSE(writeAllowed(Resource::Webhook, 2, 8, 3, hook));
    EXPECT_TRUE(writeAllowed(Resource::Webhook, 3, 8, 3, hook));
    EXPECT_TRUE(writeAllowed(Resource::Webhook, 1, 8, 0, {0, 3, true}));
    EXPECT_FALSE(writeAllowed(Resource::Webhook, 3, 8, 4, hook));
    OwnedRow file{7, 3, false};
    EXPECT_TRUE(writeAllowed(Resource::File, 1, 7, 3, file));
    EXPECT_FALSE(writeAllowed(Resource::File, 2, 8, 3, file));
    EXPECT_TRUE(writeAllowed(Resource::File, 3, 8, 3, file));
    EXPECT_TRUE(writeAllowed(Resource::File, 1, 8, 0, {7, 3, true}));
}

TEST(FileRulesTest, FilenamesAreReducedToASafeBasename) {
    EXPECT_EQ(safeFilename("../../etc/passwd"), "passwd");
    EXPECT_EQ(safeFilename("C:\\dir\\pic.png"), "pic.png");
    EXPECT_EQ(safeFilename("a\"b;c\r\n.png"), "abc.png");
    EXPECT_EQ(safeFilename("...hidden"), "hidden");
    EXPECT_EQ(safeFilename(""), "file");
    EXPECT_EQ(safeFilename(std::string(300, 'x') + ".png").size(), 100u);
    EXPECT_EQ(fileExtension("A.PNG"), "png");
    EXPECT_EQ(fileExtension("noext"), "");
}

TEST(FileRulesTest, ImageSignaturesMustMatchTheExtension) {
    const std::string png("\x89PNG\r\n\x1a\n" "x", 9);
    EXPECT_TRUE(magicMatches("png", png));
    EXPECT_FALSE(magicMatches("png", "<html>"));
    EXPECT_TRUE(magicMatches("jpg", std::string("\xff\xd8\xff\xe0", 4)));
    EXPECT_TRUE(magicMatches("gif", "GIF89a.."));
    EXPECT_TRUE(magicMatches("webp", "RIFF1234WEBPVP8 "));
    EXPECT_FALSE(magicMatches("webp", "RIFF1234WAVEfmt "));
    EXPECT_TRUE(magicMatches("pdf", "%PDF-1.4"));
    EXPECT_TRUE(magicMatches("txt", "anything"));
}

TEST(FileRulesTest, OnlyKnownContentTypesAreEchoed) {
    EXPECT_EQ(servedMime("image/png"), "image/png");
    EXPECT_EQ(servedMime("text/html"), "application/octet-stream");
    EXPECT_EQ(servedMime("application/x-evil"), "application/octet-stream");
}

TEST(HashTest, Sha256Vector) {
    EXPECT_EQ(sha256Hex("abc"),
              "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015"
              "ad");
}
