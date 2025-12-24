#!/usr/bin/env python3
"""
workflow_diagnose.py
--------------------
Utility to help ChatGPT / Codex style agents quickly diagnose GitHub Actions
workflow issues without needing to run workflows. The script surfaces triggers,
job runners, dependency and action pinning details, and potential security
warnings so an LLM can focus on the most relevant context.
"""
from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, Iterable, List, Mapping, MutableMapping, Optional, Sequence

try:
    import yaml
except ImportError as exc:  # pragma: no cover - dependency issue should be obvious
    raise SystemExit(
        "PyYAML is required for workflow diagnostics. Install it with 'pip install pyyaml'."
    ) from exc


@dataclass
class Finding:
    message: str
    severity: str = "info"
    context: Optional[str] = None

    def format(self) -> str:
        parts = [f"[{self.severity.upper()}] {self.message}"]
        if self.context:
            parts.append(f"    Context: {self.context}")
        return "\n".join(parts)


@dataclass
class JobSummary:
    job_id: str
    name: str
    runs_on: Sequence[str] | str
    permissions: Optional[Mapping[str, str]]
    concurrency: Optional[Mapping[str, str]]
    findings: List[Finding] = field(default_factory=list)

    def format(self) -> str:
        runner = self.runs_on if isinstance(self.runs_on, str) else ", ".join(self.runs_on)
        lines = [f"Job: {self.name} ({self.job_id})", f"  Runs-on: {runner}"]
        if self.permissions:
            lines.append(f"  Permissions: {self.permissions}")
        if self.concurrency:
            lines.append(f"  Concurrency: {self.concurrency}")
        for finding in self.findings:
            lines.append("  " + finding.format())
        return "\n".join(lines)


@dataclass
class WorkflowSummary:
    path: Path
    name: str
    triggers: Sequence[str]
    permissions: Optional[Mapping[str, str]]
    jobs: List[JobSummary]
    findings: List[Finding] = field(default_factory=list)

    def format(self) -> str:
        lines = [f"Workflow: {self.name}", f"Path: {self.path}", f"Triggers: {', '.join(self.triggers) if self.triggers else 'None'}"]
        if self.permissions:
            lines.append(f"Workflow permissions: {self.permissions}")
        for finding in self.findings:
            lines.append(finding.format())
        lines.append("Jobs:")
        for job in self.jobs:
            lines.append(job.format())
        return "\n".join(lines)


def discover_workflows(directory: Path) -> List[Path]:
    if not directory.exists():
        raise FileNotFoundError(f"Workflow directory not found: {directory}")
    return sorted(
        path
        for path in directory.iterdir()
        if path.suffix in {".yml", ".yaml"} and path.is_file()
    )


def load_yaml(path: Path) -> MutableMapping[str, object]:
    with path.open("r", encoding="utf-8") as stream:
        return yaml.safe_load(stream) or {}


def normalize_triggers(raw_on: object) -> List[str]:
    if raw_on is None:
        return []
    if isinstance(raw_on, (list, tuple)):
        return [str(item) for item in raw_on]
    if isinstance(raw_on, str):
        return [raw_on]
    if isinstance(raw_on, Mapping):
        return [str(key) for key in raw_on.keys()]
    return [str(raw_on)]


def analyze_action_pin(step_uses: str) -> Optional[Finding]:
    if step_uses.startswith("./"):
        return None
    if "@" not in step_uses:
        return Finding(
            message="Action is not version pinned; prefer explicit versions or commit SHAs.",
            severity="warn",
            context=step_uses,
        )

    _, ref = step_uses.rsplit("@", 1)
    if re.fullmatch(r"v?\d+", ref):
        return Finding(
            message="Action is pinned only to a major version; consider pinning to a minor version or commit SHA.",
            severity="warn",
            context=step_uses,
        )
    if ref in {"main", "master", "HEAD"}:
        return Finding(
            message="Action references a mutable branch; prefer immutable tags or SHAs.",
            severity="warn",
            context=step_uses,
        )
    return None


def analyze_steps(steps: Iterable[Mapping[str, object]]) -> List[Finding]:
    findings: List[Finding] = []
    for step in steps:
        uses = step.get("uses") if isinstance(step, Mapping) else None
        if isinstance(uses, str):
            pin_finding = analyze_action_pin(uses)
            if pin_finding:
                findings.append(pin_finding)
    return findings


def analyze_job(job_id: str, job: Mapping[str, object]) -> JobSummary:
    name = str(job.get("name", job_id))
    runs_on = job.get("runs-on", "(not specified)")
    permissions = job.get("permissions") if isinstance(job, Mapping) else None
    concurrency = job.get("concurrency") if isinstance(job, Mapping) else None
    steps = job.get("steps") if isinstance(job, Mapping) else None

    findings: List[Finding] = []
    if permissions is None:
        findings.append(
            Finding(
                message="Job permissions are not set; defaults may be broader than necessary.",
                severity="info",
            )
        )
    if isinstance(job.get("strategy"), Mapping) and job["strategy"].get("fail-fast") is True:
        findings.append(
            Finding(
                message="Matrix fail-fast is enabled; this can hide failures in later configurations.",
                severity="info",
            )
        )
    if isinstance(steps, Iterable):
        findings.extend(analyze_steps(step for step in steps if isinstance(step, Mapping)))

    return JobSummary(
        job_id=job_id,
        name=name,
        runs_on=runs_on,
        permissions=permissions,
        concurrency=concurrency,
        findings=findings,
    )


def analyze_workflow(path: Path) -> WorkflowSummary:
    data = load_yaml(path)
    name = str(data.get("name", path.stem))
    raw_triggers = data.get("on")
    triggers = normalize_triggers(raw_triggers)
    permissions = data.get("permissions") if isinstance(data, Mapping) else None
    jobs_raw = data.get("jobs") if isinstance(data, Mapping) else {}

    findings: List[Finding] = []
    if permissions is None:
        findings.append(
            Finding(
                message="Workflow permissions are not set; defaults may grant more access than needed.",
                severity="info",
            )
        )
    if any(trigger == "pull_request_target" for trigger in triggers):
        findings.append(
            Finding(
                message="pull_request_target trigger is present; ensure untrusted contributions cannot write to protected resources.",
                severity="warn",
            )
        )

    jobs: List[JobSummary] = []
    if isinstance(jobs_raw, Mapping):
        for job_id, job_body in jobs_raw.items():
            if isinstance(job_body, Mapping):
                jobs.append(analyze_job(job_id, job_body))

    return WorkflowSummary(
        path=path,
        name=name,
        triggers=triggers,
        permissions=permissions,
        jobs=jobs,
        findings=findings,
    )


def run_diagnostics(workflow_dir: Path) -> List[WorkflowSummary]:
    summaries: List[WorkflowSummary] = []
    for path in discover_workflows(workflow_dir):
        summaries.append(analyze_workflow(path))
    return summaries


def print_report(summaries: Sequence[WorkflowSummary]) -> None:
    if not summaries:
        print("No workflows found.")
        return

    for summary in summaries:
        print(summary.format())
        print("-" * 80)


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Diagnose GitHub Actions workflows.")
    parser.add_argument(
        "--workflows",
        type=Path,
        default=Path(".github/workflows"),
        help="Path to the workflows directory (default: .github/workflows)",
    )
    args = parser.parse_args(argv)

    try:
        summaries = run_diagnostics(args.workflows)
    except FileNotFoundError as exc:
        print(exc, file=sys.stderr)
        return 2

    print_report(summaries)
    return 0


if __name__ == "__main__":
    sys.exit(main())
