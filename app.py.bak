#!/usr/bin/env python3
# simple Flask-based web front-end for the Sajid Writer UI (patched with phone-Download default)
import os
import tempfile
import time
import subprocess
import shutil
from pathlib import Path
from flask import Flask, render_template, request, jsonify, send_from_directory

# --- phone-storage aware DEFAULT_OUTDIR (inserted automatically) ---
from pathlib import Path as _Path
_candidates = [
    _Path("/sdcard/Download/"),
    _Path("/sdcard/Download"),
    _Path("/storage/emulated/0/Download/sajid_writer"),
    _Path("/storage/emulated/0/Download"),
    _Path.home() / "Downloads",
    _Path("/root/Downloads"),
]
DEFAULT_OUTDIR = None
for _c in _candidates:
    try:
        if _c.exists():
            DEFAULT_OUTDIR = _c
            break
    except Exception:
        continue
if DEFAULT_OUTDIR is None:
    DEFAULT_OUTDIR = _Path.cwd() / "output"
try:
    DEFAULT_OUTDIR.mkdir(parents=True, exist_ok=True)
except Exception:
    pass
# --- end phone-storage block ---

APP_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = APP_DIR / "static" / "uploads"
NOTES_DIR = APP_DIR / "data"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
NOTES_DIR.mkdir(parents=True, exist_ok=True)

# Prefer phone storage Download/sajid_writer if available
candidates = [
    Path("/sdcard/Download/sajid_writer"),
    Path("/sdcard/Download"),
    Path("/storage/emulated/0/Download/sajid_writer"),
    Path("/storage/emulated/0/Download"),
    Path.home() / "Downloads"
]
DEFAULT_OUTDIR = None
for c in candidates:
    try:
        if c.exists():
            DEFAULT_OUTDIR = c
            break
    except Exception:
        continue
if DEFAULT_OUTDIR is None:
    DEFAULT_OUTDIR = Path.home() / "Downloads"
if str(DEFAULT_OUTDIR).endswith("Download") or str(DEFAULT_OUTDIR).endswith("Downloads"):
    sub = DEFAULT_OUTDIR / "sajid_writer"
    try:
        sub.mkdir(parents=True, exist_ok=True)
        DEFAULT_OUTDIR = sub
    except Exception:
        DEFAULT_OUTDIR.mkdir(parents=True, exist_ok=True)
else:
    try:
        DEFAULT_OUTDIR.mkdir(parents=True, exist_ok=True)
    except Exception:
        pass

app = Flask(__name__, static_folder=str(APP_DIR / "static"), template_folder=str(APP_DIR / "templates"))
app.config['MAX_CONTENT_LENGTH'] = 40 * 1024 * 1024  # 40MB upload limit

def safe_filename(filename):
    return "".join(c for c in filename if c.isalnum() or c in "._- ").strip() or "unnamed"

def wkhtml_available():
    return shutil.which("wkhtmltopdf") is not None

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/save", methods=["POST"])
def api_save():
    data = request.json or {}
    name = data.get("name") or f"note_{int(time.time())}.html"
    name = safe_filename(name)
    content = data.get("html", "")
    path = NOTES_DIR / name
    try:
        path.write_text(content, encoding="utf-8")
        return jsonify({"ok": True, "path": str(path.name)})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

@app.route("/api/load", methods=["GET"])
def api_load():
    name = request.args.get("name")
    if not name:
        return jsonify({"ok": False, "error": "missing name"}), 400
    name = safe_filename(name)
    path = NOTES_DIR / name
    if not path.exists():
        return jsonify({"ok": False, "error": "not found"}), 404
    try:
        return jsonify({"ok": True, "html": path.read_text(encoding="utf-8")})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

@app.route("/api/upload-image", methods=["POST"])
def api_upload_image():
    f = request.files.get("image")
    if not f:
        return jsonify({"ok": False, "error": "no file"}), 400
    fname = safe_filename(f.filename) or f"img_{int(time.time())}.png"
    out = UPLOAD_DIR / fname
    f.save(str(out))
    url = f"/static/uploads/{fname}"
    return jsonify({"ok": True, "url": url, "name": fname})

@app.route("/api/export_pdf", methods=["POST"])
def api_export_pdf():
    data = request.json or {}
    html = data.get("html", "")
    outname = data.get("outname") or f"sajid_writer_{int(time.time())}.pdf"
    outname = safe_filename(outname)
    tmp = tempfile.NamedTemporaryFile(suffix=".html", delete=False)
    tmp.write(html.encode("utf-8"))
    tmp.flush(); tmp.close()
    outpath = DEFAULT_OUTDIR / outname
    try:
        wk = shutil.which("wkhtmltopdf")
        if wk:
            cmd = [wk, "--enable-local-file-access", tmp.name, str(outpath)]
            subprocess.run(cmd, check=True)
            return jsonify({"ok": True, "pdf": str(outpath)})
        else:
            fallback = DEFAULT_OUTDIR / (outname.replace(".pdf", ".html"))
            shutil.copy(tmp.name, str(fallback))
            return jsonify({"ok": False, "warning": "wkhtmltopdf not installed; saved HTML instead", "html": str(fallback)})
    except subprocess.CalledProcessError as cex:
        return jsonify({"ok": False, "error": f"wkhtml failed: {cex}"}), 500
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500
    finally:
        try:
            os.unlink(tmp.name)
        except Exception:
            pass

# autosave endpoints and list/delete
AUTOSAVE_NAME = ".autosave.html"

@app.route("/api/autosave", methods=["POST"])
def api_autosave():
    data = request.json or {}
    name = data.get("name") or AUTOSAVE_NAME
    name = safe_filename(name)
    path = NOTES_DIR / name
    try:
        content = data.get("html", "")
        path.write_text(content, encoding="utf-8")
        return jsonify({"ok": True, "path": str(path.name)})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

@app.route("/api/autosave/load", methods=["GET"])
def api_autosave_load():
    name = request.args.get("name") or AUTOSAVE_NAME
    name = safe_filename(name)
    path = NOTES_DIR / name
    if not path.exists():
        return jsonify({"ok": False, "error": "not found"}), 404
    try:
        return jsonify({"ok": True, "html": path.read_text(encoding="utf-8"), "path": str(path.name)})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

@app.route("/api/list", methods=["GET"])
def api_list():
    try:
        files = []
        for p in sorted(NOTES_DIR.iterdir(), key=lambda x: x.stat().st_mtime, reverse=True):
            if p.is_file() and not p.name.startswith("."):
                files.append({"name": p.name, "mtime": int(p.stat().st_mtime), "size": p.stat().st_size})
        return jsonify({"ok": True, "files": files})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

@app.route("/api/delete", methods=["POST"])
def api_delete():
    data = request.json or {}
    name = data.get("name")
    if not name:
        return jsonify({"ok": False, "error": "missing name"}), 400
    name = safe_filename(name)
    path = NOTES_DIR / name
    if not path.exists():
        return jsonify({"ok": False, "error": "not found"}), 404
    try:
        path.unlink()
        return jsonify({"ok": True})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

@app.route("/uploads/<path:filename>")
def uploads(filename):
    return send_from_directory(str(UPLOAD_DIR), filename)

if __name__ == "__main__":
    print("Starting Sajid Web Writer on http://127.0.0.1:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
