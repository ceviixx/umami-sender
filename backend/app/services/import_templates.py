import shutil
import subprocess
import tempfile
import json
import hashlib
from pathlib import Path
from datetime import datetime, timezone
import threading

from sqlalchemy.orm import Session
from sqlalchemy import select
from app.database import SessionLocal
from app.models.template import MailTemplate

REPO_URL = "https://github.com/ceviixx/umami-sender.git"
BRANCH = "templates"
SUBDIR = "." 

_refresh_lock = threading.Lock()


# ----------------- Utilities -----------------
def run(cmd, cwd=None):
    subprocess.run(
        cmd,
        cwd=cwd,
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )


def sha256_str(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


def detect_content_type(file: Path) -> str:
    suf = file.suffix.lower()
    if suf == ".html":
        return "text/html"
    if suf == ".json":
        return "application/json"
    return "text/plain"


def read_text(file: Path) -> str:
    return file.read_text(encoding="utf-8")


def canonical_json(obj) -> str:
    """Stabile, kompakte JSON-Serialisierung für Hashing/Vergleich."""
    return json.dumps(obj, sort_keys=True, separators=(",", ":"))


# ----------------- Importer -----------------
def import_templates_from_repo():
    """
    Klont die Templates-Branch, importiert/aktualisiert Templates in der DB
    und gibt Stats zurück. Verhindert parallele Läufe via Lock.
    """
    started_at = datetime.now(timezone.utc).isoformat()
    stats = {
        "inserted": 0,
        "updated": 0,
        "skipped": 0,
        "invalid": 0,
        "commit": None,
        "started_at": started_at,
        "finished_at": None,
        "errors": [],
    }

    if not _refresh_lock.acquire(blocking=False):
        stats["errors"].append("A refresh is already running.")
        stats["finished_at"] = datetime.now(timezone.utc).isoformat()
        return stats

    tmpdir = tempfile.mkdtemp(prefix="templates_")
    try:
        # --- Clone branch shallow ---
        try:
            print(f"⬇️  Cloning {REPO_URL} (branch: {BRANCH}) ...")
            run(["git", "init"], cwd=tmpdir)
            run(["git", "remote", "add", "origin", REPO_URL], cwd=tmpdir)
            run(["git", "fetch", "--depth", "1", "origin", BRANCH], cwd=tmpdir)
            run(["git", "checkout", "-b", BRANCH, f"origin/{BRANCH}"], cwd=tmpdir)
            rev = subprocess.run(
                ["git", "rev-parse", "HEAD"], cwd=tmpdir, check=True, stdout=subprocess.PIPE
            ).stdout.decode().strip()
            stats["commit"] = rev
        except subprocess.CalledProcessError as e:
            msg = f"git error: {e.stdout.decode(errors='ignore') if e.stdout else str(e)}"
            print(f"❌ {msg}")
            stats["errors"].append(msg)
            stats["finished_at"] = datetime.now(timezone.utc).isoformat()
            return stats

        base = Path(tmpdir) / SUBDIR
        if not base.exists():
            msg = f"Subdir '{SUBDIR}' not found in branch '{BRANCH}'."
            print(f"⚠️  {msg}")
            stats["errors"].append(msg)
            stats["finished_at"] = datetime.now(timezone.utc).isoformat()
            return stats

        candidates = []
        for p in base.iterdir():
            if not p.is_dir() or p.name.startswith("."):
                continue
            if (p / "template.html").exists() or (p / "template.json").exists():
                candidates.append(p)

        print(f"🔎 Found {len(candidates)} candidate template folders.")

        db: Session = SessionLocal()
        try:
            for folder in sorted(candidates):
                sender_type = folder.name

                html = folder / "template.html"
                jsn = folder / "template.json"
                dfile = folder / "demo.json"

                template_file = html if html.exists() else (jsn if jsn.exists() else None)
                if not template_file:
                    msg = f"{sender_type}: missing template.html|template.json"
                    print(f"⚠️  {msg}")
                    stats["invalid"] += 1
                    stats["errors"].append(msg)
                    continue

                content = read_text(template_file)
                content_type = detect_content_type(template_file)

                example_obj = None
                if dfile.exists():
                    try:
                        example_obj = json.loads(read_text(dfile))
                    except Exception as e:
                        msg = f"{sender_type}: demo.json invalid JSON: {e}"
                        print(f"❌ {msg}")
                        stats["invalid"] += 1
                        stats["errors"].append(msg)
                        continue

                if content_type == "application/json":
                    try:
                        json.loads(content)
                    except Exception as e:
                        msg = f"{sender_type}: template.json invalid JSON: {e}"
                        print(f"❌ {msg}")
                        stats["invalid"] += 1
                        stats["errors"].append(msg)
                        continue

                example_serialized = canonical_json(example_obj) if example_obj is not None else ""
                content_hash = sha256_str(content + example_serialized)

                stmt = select(MailTemplate).where(MailTemplate.sender_type == sender_type)
                row = db.execute(stmt).scalar_one_or_none()

                if row is None:
                    print(f"➕ Insert: {sender_type}")
                    row = MailTemplate(
                        sender_type=sender_type,
                        content=content,
                        example_content=example_obj,
                        source_commit=stats["commit"],
                        content_hash=content_hash,
                    )
                    db.add(row)
                    stats["inserted"] += 1
                else:
                    if row.content_hash != content_hash:
                        print(f"♻️  Update: {sender_type}")
                        row.content = content
                        row.example_content = example_obj
                        row.source_commit = stats["commit"]
                        row.content_hash = content_hash
                        stats["updated"] += 1
                    else:
                        print(f"✅ Skip: {sender_type} (no changes)")
                        stats["skipped"] += 1

            db.commit()
            stats["finished_at"] = datetime.now(timezone.utc).isoformat()
            print("🎉 Template import done.")
            return stats

        except Exception as e:
            db.rollback()
            msg = f"DB error: {e}"
            print(f"❌ {msg}")
            stats["errors"].append(msg)
            stats["finished_at"] = datetime.now(timezone.utc).isoformat()
            return stats

        finally:
            db.close()

    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)
        _refresh_lock.release()


if __name__ == "__main__":
    result = import_templates_from_repo()
    print(json.dumps(result, indent=2))
