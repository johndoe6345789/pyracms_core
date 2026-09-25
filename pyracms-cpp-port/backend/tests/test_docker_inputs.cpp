#include "services/DockerExecutionService.h"

#include <algorithm>
#include <filesystem>
#include <fstream>
#include <gtest/gtest.h>
#include <sstream>

using namespace pyracms;
using Svc = DockerExecutionService;

TEST(DockerInputsTest, ArgvCarriesTheInputsDirAsALabelBeforeTheImage) {
    auto argv = Svc::buildArgv("img", "print(1)", "/tmp/pyracms-run-x");
    EXPECT_EQ(argv.back(), "print(1)");
    EXPECT_EQ(argv[argv.size() - 2], "img");
    auto label = std::find(argv.begin(), argv.end(), "--label");
    ASSERT_NE(label, argv.end());
    EXPECT_EQ(*(label + 1), "pyracms.inputs=/tmp/pyracms-run-x");
    auto plain = Svc::buildArgv("img", "print(1)");
    EXPECT_EQ(std::find(plain.begin(), plain.end(), "--label"), plain.end());
}

TEST(DockerInputsTest, NamesAreOnePlainPathComponent) {
    for (const char *ok : {"enable1.txt", "232input1.txt", "a b.txt"})
        EXPECT_TRUE(Svc::inputNameOk(ok)) << ok;
    for (const char *bad : {"", ".hidden", "__code__", "a/b", "..", "a\\b",
                            "x\ny", "../etc/passwd"})
        EXPECT_FALSE(Svc::inputNameOk(bad)) << bad;
    EXPECT_FALSE(Svc::inputNameOk(std::string(101, 'a')));
}

TEST(DockerInputsTest, OnlyPythonTakesInputsAndCapsApply) {
    std::vector<RunInput> in = {{"a.txt", "x"}, {"../b", "y"}, {"c.txt", "z"}};
    EXPECT_TRUE(Svc::usableInputs("ruby", in).empty());
    EXPECT_EQ(Svc::usableInputs("c", in).size(), 2u);
    EXPECT_EQ(Svc::usableInputs("cpp", in).size(), 2u);
    auto kept = Svc::usableInputs("python", in);
    ASSERT_EQ(kept.size(), 2u);
    EXPECT_EQ(kept[1].name, "c.txt");
    std::vector<RunInput> big = {
        {"big.bin", std::string(Svc::kMaxInputBytes - 1, 'a')}, {"s.txt", "1"}};
    EXPECT_EQ(Svc::usableInputs("python", big).size(), 2u);
    big.push_back({"extra", "x"});
    EXPECT_EQ(Svc::usableInputs("python", big).size(), 2u);
    std::vector<RunInput> many;
    for (size_t i = 0; i < Svc::kMaxInputFiles + 5; ++i)
        many.push_back({"f" + std::to_string(i), "x"});
    EXPECT_EQ(Svc::usableInputs("python", many).size(), Svc::kMaxInputFiles);
}

TEST(DockerInputsTest, StagesTheCodeAndFilesThenCleansUp) {
    auto dir = Svc::stageInputs("print(1)", {{"in.txt", "hello"}});
    ASSERT_FALSE(dir.empty());
    std::ifstream code(dir + "/__code__"), in(dir + "/in.txt");
    std::stringstream a, b;
    a << code.rdbuf();
    b << in.rdbuf();
    EXPECT_EQ(a.str(), "print(1)");
    EXPECT_EQ(b.str(), "hello");
    Svc::removeInputs(dir);
    EXPECT_FALSE(std::filesystem::exists(dir));
    Svc::removeInputs("");
}
