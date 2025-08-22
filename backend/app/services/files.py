import os, hashlib, re
from pathlib import Path
from typing import TypedDict, Optional, Tuple
from fastapi import UploadFile

try:
    from PIL import Image
except ImportError:
    Image = None

from xml.etree import ElementTree as ET  # für SVG

UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "/var/app/uploads/branding"))
PUBLIC_PREFIX = "/static/branding"
MAX_BYTES = int(os.getenv("UPLOAD_MAX_LOGO_BYTES", str(1_000_000)))  # ~1MB
ALLOWED_EXT = {"png", "jpg", "jpeg", "webp", "svg"}
ALLOWED_MIME_PREFIX = "image/"

class SavedImageMeta(TypedDict):
    url: str
    path: str
    mime: str
    width: int
    height: int
    sha256: str
    filename: str
    size: int  # Dateigröße in Bytes

# ---------- Helpers: Dimensionen ----------
_DPI = 96  # gängiger Standard für SVG-Unit-Umrechnung

def _parse_svg_length(val: str, dpi: int = _DPI) -> Optional[float]:
    """
    Konvertiert SVG-Längenangaben in px. Unterstützt: px, cm, mm, in, pt, pc.
    Gibt None zurück, wenn Prozent/unklar.
    """
    if val is None:
        return None
    s = str(val).strip().lower()
    if not s or s.endswith('%'):
        return None
    m = re.match(r'^([+-]?\d+(\.\d+)?)(px|cm|mm|in|pt|pc)?$', s)
    if not m:
        return None
    num = float(m.group(1))
    unit = m.group(3) or 'px'
    if unit == 'px':
        return num
    if unit == 'in':
        return num * dpi
    if unit == 'cm':
        return num * dpi / 2.54
    if unit == 'mm':
        return num * dpi / 25.4
    if unit == 'pt':  # 1pt = 1/72in
        return num * dpi / 72.0
    if unit == 'pc':  # 1pc = 12pt
        return num * dpi / 6.0
    return None

def _get_svg_dimensions(path: Path) -> Tuple[int, int]:
    try:
        # Sicheres Parsen ohne externe Entitäten
        tree = ET.parse(str(path))
        root = tree.getroot()
        # Namespaces ignorieren, Attribute direkt lesen
        w_attr = root.get('width')
        h_attr = root.get('height')

        w = _parse_svg_length(w_attr) if w_attr else None
        h = _parse_svg_length(h_attr) if h_attr else None

        # Fallback: viewBox="minx miny width height"
        if (w is None or h is None):
            vb = root.get('viewBox') or root.get('viewbox')
            if vb:
                parts = re.split(r'[\s,]+', vb.strip())
                if len(parts) == 4:
                    try:
                        vb_w = float(parts[2])
                        vb_h = float(parts[3])
                        if w is None: w = vb_w
                        if h is None: h = vb_h
                    except Exception:
                        pass

        wi = int(round(w)) if w is not None else 0
        hi = int(round(h)) if h is not None else 0
        return max(wi, 0), max(hi, 0)
    except Exception:
        return 0, 0

def _get_raster_dimensions(path: Path) -> Tuple[int, int]:
    if not Image:
        return 0, 0
    try:
        with Image.open(path) as im:
            w, h = im.size
            # EXIF Orientation (274): 5..8 sind gedrehte Varianten (swap w/h)
            try:
                exif = im.getexif()
                if exif:
                    orientation = exif.get(274)
                    if orientation in (5, 6, 7, 8):
                        w, h = h, w
            except Exception:
                pass
            return int(w), int(h)
    except Exception:
        return 0, 0

def _detect_dimensions(path: Path, ext: str, mime: str) -> Tuple[int, int]:
    ext = (ext or '').lower()
    mime = (mime or '').lower()
    if ext == 'svg' or mime == 'image/svg+xml':
        return _get_svg_dimensions(path)
    return _get_raster_dimensions(path)

# ---------- Save ----------
def save_logo_image(file: UploadFile) -> SavedImageMeta:
    # MIME prüfen
    if not file.content_type or not file.content_type.startswith(ALLOWED_MIME_PREFIX):
        raise ValueError("Only image/* allowed")

    # Bytes lesen & begrenzen
    try:
        file.file.seek(0, os.SEEK_SET)
    except Exception:
        pass
    raw = file.file.read()
    size_bytes = len(raw)
    if size_bytes == 0:
        raise ValueError("Empty file")
    if size_bytes > MAX_BYTES:
        raise ValueError(f"File too large (max {MAX_BYTES} bytes)")

    # Verzeichnis sicherstellen
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    # Hash + Dateiname
    digest = hashlib.sha256(raw).hexdigest()
    ext = (file.filename or "logo").rsplit(".", 1)[-1].lower() if "." in (file.filename or "") else "png"
    if ext not in ALLOWED_EXT:
        ext = "png"
    filename = f"logo-{digest[:8]}.{ext}"
    abs_path = UPLOAD_DIR / filename
    abs_path.write_bytes(raw)

    # Dimensionen (Raster/SVG)
    width, height = _detect_dimensions(abs_path, ext, file.content_type or '')

    # Gegencheck Größe nach dem Schreiben (optional)
    try:
        size_bytes = abs_path.stat().st_size
    except Exception:
        pass

    return {
        "url": f"{PUBLIC_PREFIX}/{filename}",
        "path": str(abs_path),
        "mime": file.content_type,
        "width": width,
        "height": height,
        "sha256": digest,
        "filename": filename,
        "size": size_bytes,
    }

def delete_file_if_exists(path: Optional[str]) -> None:
    if not path:
        return
    try:
        p = Path(path)
        if p.is_file():
            p.unlink(missing_ok=True)
    except Exception:
        pass
