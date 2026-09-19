#pragma once

#include "filters/AdminFilter.h"

// Puts the real DB role lookup back after a test swaps in a fake, since the
// HTTP tests share the process (and its static filter state).
struct RoleLookupRestore {
    pyracms::AdminFilter::RoleLookup keep;
    ~RoleLookupRestore() { pyracms::AdminFilter::roleLookup() = keep; }
};
