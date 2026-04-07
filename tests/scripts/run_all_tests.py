"""Purpose: Run backend and frontend automated tests and save readable output artifacts for demos/review."""

from __future__ import annotations

import datetime as dt
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUTPUT_DIR = ROOT / "tests" / "output"
BACKEND_LOG = OUTPUT_DIR / "backend-test-output.txt"
FRONTEND_LOG = OUTPUT_DIR / "frontend-test-output.txt"
SUMMARY_MD = OUTPUT_DIR / "summary.md"


def _run_and_capture(command: list[str], cwd: pathlib.Path, output_path: pathlib.Path) -> int:
    """Run a command, stream output to terminal, and write the same content to a file."""
    process = subprocess.run(
        command,
        cwd=str(cwd),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        check=False,
    )
    output_path.write_text(process.stdout, encoding="utf-8")
    print(process.stdout)
    return process.returncode


def main() -> int:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    backend_exit = _run_and_capture([sys.executable, "-m", "pytest", "tests/backend", "-v"], ROOT, BACKEND_LOG)
    frontend_exit = _run_and_capture(["npm.cmd", "run", "test:ci"], ROOT / "finai-dashboard", FRONTEND_LOG)

    timestamp = dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    summary_lines = [
        "# Test Execution Summary",
        "",
        f"- Run timestamp: {timestamp}",
        f"- Backend exit code: {backend_exit} ({'PASS' if backend_exit == 0 else 'FAIL'})",
        f"- Frontend exit code: {frontend_exit} ({'PASS' if frontend_exit == 0 else 'FAIL'})",
        f"- Backend log: {BACKEND_LOG.relative_to(ROOT).as_posix()}",
        f"- Frontend log: {FRONTEND_LOG.relative_to(ROOT).as_posix()}",
    ]
    SUMMARY_MD.write_text("\n".join(summary_lines) + "\n", encoding="utf-8")

    print(f"Summary written to: {SUMMARY_MD.relative_to(ROOT).as_posix()}")

    if backend_exit != 0 or frontend_exit != 0:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
