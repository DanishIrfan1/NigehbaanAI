"""Ensure repo root and backend package are on sys.path."""

from __future__ import annotations

import pathlib
import sys

_REPO_ROOT = pathlib.Path(__file__).resolve().parents[1]
_BACKEND = _REPO_ROOT / "backend"

for path in (str(_REPO_ROOT), str(_BACKEND)):
    if path not in sys.path:
        sys.path.insert(0, path)
