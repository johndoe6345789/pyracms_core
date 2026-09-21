#pragma once

#include "storage/SigV4.h"

#include <gtest/gtest.h>

namespace sigv4test {

// The credentials and scope of the AWS documentation examples.
inline pyracms::SigV4Key awsKey() {
    return {"AKIAIOSFODNN7EXAMPLE",
            "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY", "us-east-1"};
}

inline pyracms::SigV4Request awsReq(const std::string &method,
                                    const std::string &path,
                                    const std::string &query) {
    pyracms::SigV4Request r;
    r.method = method;
    r.path = path;
    r.query = query;
    r.amzDate = "20130524T000000Z";
    r.payloadSha = pyracms::sha256Hex("");
    r.headers["host"] = "examplebucket.s3.amazonaws.com";
    return r;
}

} // namespace sigv4test
