pyracms README
==================

Getting Started
---------------

- cd <directory containing this file>

- $venv/bin/python setup.py develop

- $venv/bin/populate_pyracms development.ini

- $venv/bin/pserve development.ini

CI Workflow Diagnostics
-----------------------

- Run `python tools/workflow_diagnose.py` to generate a summary of GitHub Actions workflows,
  including triggers, runners, permission notes, and action pinning warnings.

