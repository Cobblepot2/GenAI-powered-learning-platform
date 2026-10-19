"""Create a portable, dependency-free classroom demo ZIP using an explicit allowlist.

Run: python scripts/package_demo.py
The application requires Python; Node and reportlab are optional maintenance tools.
"""
from hashlib import sha256
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "demo"
ARCHIVE = OUTPUT / "learnloop-week8-9-demo.zip"

# Only these project files are included. Never include .git, credentials,
# browser records, temporary renders or the output ZIP itself.
SOURCES = (
    ".gitignore",
    "README.md",
    "Start-Demo.cmd",
    "serve.py",
    "package.json",
    "requirements-docs.txt",
    "web/index.html",
    "web/styles.css",
    "web/app.mjs",
    "web/domain.mjs",
    "tests/domain.test.mjs",
    "docs/architecture.md",
    "docs/backlog-and-roadmap.md",
    "docs/backlog.csv",
    "docs/classroom-demo.md",
    "docs/meeting-script.md",
    "docs/project-plan.md",
    "docs/user-validation.md",
    "docs/verification.md",
    "docs/screenshots/course-library.jpg",
    "scripts/build_progress_pdf.py",
    "scripts/package_demo.py",
    "output/pdf/learnloop-week8-9-progress.pdf",
)


def build():
    missing = [name for name in SOURCES if not (ROOT / name).is_file()]
    if missing:
        raise FileNotFoundError("Missing required files: " + ", ".join(missing))
    OUTPUT.mkdir(parents=True, exist_ok=True)
    temporary = ARCHIVE.with_suffix(".zip.tmp")
    try:
        with ZipFile(temporary, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
            for name in sorted(SOURCES):
                info = ZipInfo("learnloop-demo/" + name, date_time=(1980, 1, 1, 0, 0, 0))
                info.compress_type = ZIP_DEFLATED
                info.external_attr = 0o100644 << 16
                archive.writestr(info, (ROOT / name).read_bytes())
        with ZipFile(temporary) as archive:
            bad = archive.testzip()
            if bad:
                raise RuntimeError("Corrupt archive entry: " + bad)
            assert len(archive.namelist()) == len(SOURCES)
        temporary.replace(ARCHIVE)
    finally:
        if temporary.exists():
            temporary.unlink()
    digest = sha256(ARCHIVE.read_bytes()).hexdigest()
    (OUTPUT / "SHA256SUMS.txt").write_text(f"{digest}  {ARCHIVE.name}\n", encoding="ascii")
    print(f"Packaged {len(SOURCES)} project files: {ARCHIVE.name}")
    print(f"SHA256: {digest}")
    return ARCHIVE


if __name__ == "__main__":
    build()
