#pragma once

#include <QTemporaryDir>

#include "FakeRunner.h"
#include "services/PathManager.h"
#include "services/PipInstaller.h"

using namespace Hypernucleus;

// A PipInstaller whose "python" is scripted: `-m venv` creates the venv.
struct Rig {
    QTemporaryDir d;
    PathManager paths{d.filePath("data")};
    PipInstaller pip{&paths};
    FakeRunner run;
    Rig()
    {
        touch(d.filePath("py")); // stands in for the interpreter
        pip.setPythonPath(d.filePath("py"));
        pip.setRunner(&run);
        run.effect = [this](const FakeRunner::Call& c) {
            if (c.args.value(1) == "venv") touch(paths.venvPython("g"));
        };
    }
};
