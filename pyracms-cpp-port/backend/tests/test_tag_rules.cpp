#include "services/TagRules.h"

#include <gtest/gtest.h>

using namespace pyracms;

TEST(TagRules, NormalizeTrimsLowersDedupesAndDropsBlanks) {
    auto out = normalizeTags(
        {"  Python ", "python", "", "   ", "Flight  Simulator", "A,B"});
    EXPECT_EQ(out, (std::vector<std::string>{"python", "flight-simulator",
                                            "a-b"}));
}

TEST(TagRules, NormalizeCapsLengthAndCount) {
    auto out = normalizeTags({std::string(100, 'x')});
    ASSERT_EQ(out.size(), 1u);
    EXPECT_EQ(out[0].size(), kMaxTagLength);
    std::vector<std::string> many;
    for (int i = 0; i < 50; ++i)
        many.push_back("t" + std::to_string(i));
    EXPECT_EQ(normalizeTags(many).size(), kMaxTagsPerItem);
    EXPECT_EQ(normalizeTags({"Ünï"})[0], "Ünï"); // non-ASCII is left alone
}

TEST(TagRules, JoinAndSplitRoundTrip) {
    EXPECT_EQ(joinTags({"a", "b"}), "a\nb");
    EXPECT_EQ(joinTags({}), "");
    EXPECT_EQ(splitTagList("a,b,,c"),
              (std::vector<std::string>{"a", "b", "c"}));
    EXPECT_TRUE(splitTagList("").empty());
}
