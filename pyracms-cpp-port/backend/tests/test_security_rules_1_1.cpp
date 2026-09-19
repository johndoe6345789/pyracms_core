#include "controllers/FileRules.h"
#include "filters/OwnerRules.h"
#include "security/Hash.h"
#include "security/Validate.h"

#include <gtest/gtest.h>

using namespace pyracms;

TEST(ValidateTest, UsernamesAreLettersDigitsAndSeparators) {
    EXPECT_TRUE(isValidUsername("alice_1.x-y"));
    EXPECT_FALSE(isValidUsername("ab"));
    EXPECT_FALSE(isValidUsername(std::string(33, 'a')));
    EXPECT_FALSE(isValidUsername("bad name"));
    EXPECT_FALSE(isValidUsername("<script>"));
    EXPECT_FALSE(isValidUsername("a\nb"));
}

TEST(ValidateTest, EmailsRefuseHeaderInjectionAndJunk) {
    EXPECT_TRUE(isValidEmail("a.b+c@example.co.uk"));
    for (const char *bad :
         {"", "no-at.example.com", "a@b", "a@@b.co", "@b.co", "a@.co",
          "a b@c.co", "a@c.co\r\nBcc: x@y.z", "a@c.co,d@e.fg",
          "\"a\"@c.co", "a@c.co>", "a@c."})
        EXPECT_FALSE(isValidEmail(bad)) << bad;
    EXPECT_FALSE(isValidEmail(std::string(130, 'a') + "@b.co"));
}

TEST(ValidateTest, UuidIdsKeysAndNames) {
    EXPECT_TRUE(isValidUuid("123e4567-e89b-12d3-a456-426614174000"));
    EXPECT_FALSE(isValidUuid("../../etc/passwd"));
    EXPECT_FALSE(isValidUuid("123e4567-e89b-12d3-a456-42661417400"));
    int id = 0;
    EXPECT_TRUE(parseId("42", id));
    EXPECT_EQ(id, 42);
    EXPECT_FALSE(parseId("-1", id));
    EXPECT_FALSE(parseId("4x", id));
    EXPECT_FALSE(parseId("99999999999", id));
    EXPECT_TRUE(isSafeKey("feature_x.y-1"));
    EXPECT_FALSE(isSafeKey("a b"));
    EXPECT_TRUE(isSafeName("Home page"));
    EXPECT_FALSE(isSafeName("a/b"));
    EXPECT_FALSE(isSafeName("a?b"));
    EXPECT_FALSE(isSafeName("a\\b"));
    EXPECT_TRUE(isBoundedText("line\nbreak", 20));
    EXPECT_FALSE(isBoundedText("bell\x07", 20));
    EXPECT_FALSE(isBoundedText("toolong", 3));
    EXPECT_TRUE(isKnownRenderer("HTML"));
    EXPECT_FALSE(isKnownRenderer("php"));
}

TEST(ValidateTest, CredentialLikeSettingsAreSensitive) {
    for (const char *n : {"smtp_host", "SECRET_x", "db_password", "api_key",
                          "stripeKey", "auth_token"})
        EXPECT_TRUE(isSensitiveSettingName(n)) << n;
    for (const char *n : {"site_name", "acl_rules", "feature_forum"})
        EXPECT_FALSE(isSensitiveSettingName(n)) << n;
}

TEST(OwnerRulesTest, TargetsAreReadFromThePath) {
    EXPECT_EQ(targetOf("/api/articles/home/revert/3").kind, Resource::Article);
    EXPECT_EQ(targetOf("/api/articles/home/revert/3").key, "home");
    EXPECT_EQ(targetOf("/api/gallery/albums/7/pictures").kind, Resource::Album);
    EXPECT_EQ(targetOf("/api/gallery/pictures/9/default").kind,
              Resource::Picture);
    EXPECT_EQ(targetOf("/api/webhooks/5/deliveries").key, "5");
    EXPECT_EQ(targetOf("/api/files/abc").kind, Resource::File);
    EXPECT_EQ(targetOf("/api/articles").kind, Resource::None);
    EXPECT_EQ(targetOf("/other/articles/x").kind, Resource::None);
}
