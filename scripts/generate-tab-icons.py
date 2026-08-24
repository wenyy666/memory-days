#!/usr/bin/env python3
"""Generate simple PNG tab icons without third-party deps."""
from __future__ import annotations

import struct
import zlib
from pathlib import Path

SIZE = 81


def png(rgb_rows: list[list[tuple[int, int, int]]]) -> bytes:
    height = len(rgb_rows)
    width = len(rgb_rows[0])
    raw = b"".join(b"\x00" + b"".join(bytes(pixel) for pixel in row) for row in rgb_rows)

    def chunk(tag: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    return b"".join(
        [
            b"\x89PNG\r\n\x1a\n",
            chunk(b"IHDR", ihdr),
            chunk(b"IDAT", zlib.compress(raw, 9)),
            chunk(b"IEND", b""),
        ]
    )


def paint(draw) -> list[list[tuple[int, int, int]]]:
    rows = [[(247, 246, 243) for _ in range(SIZE)] for _ in range(SIZE)]
    for y in range(SIZE):
        for x in range(SIZE):
            color = draw(x, y)
            if color:
                rows[y][x] = color
    return rows


def circle(cx: int, cy: int, r: int, color: tuple[int, int, int]):
    def draw(x: int, y: int):
        if (x - cx) ** 2 + (y - cy) ** 2 <= r * r:
            return color
        return None

    return draw


def home(active: bool):
    color = (47, 107, 90) if active else (138, 133, 128)

    def draw(x: int, y: int):
        # roof triangle + body
        if 18 <= y <= 40 and abs((x - 40) * 22) <= (40 - y) * 22:
            return color
        if 38 <= y <= 62 and 26 <= x <= 54:
            return color
        if 46 <= y <= 62 and 35 <= x <= 45:
            return (247, 246, 243)
        return None

    return draw


def tools(active: bool):
    color = (47, 107, 90) if active else (138, 133, 128)

    def draw(x: int, y: int):
        if 20 <= x <= 60 and 36 <= y <= 44:
            return color
        if 36 <= x <= 44 and 20 <= y <= 60:
            return color
        if 24 <= x <= 32 and 24 <= y <= 32:
            return color
        if 48 <= x <= 56 and 48 <= y <= 56:
            return color
        return None

    return draw


def mine(active: bool):
    color = (47, 107, 90) if active else (138, 133, 128)

    def draw(x: int, y: int):
        if (x - 40) ** 2 + (y - 28) ** 2 <= 10 * 10:
            return color
        if 22 <= y <= 62 and abs(x - 40) <= 16 + (y - 42) // 4 and y >= 40:
            return color
        return None

    return draw


def main() -> None:
    out = Path(__file__).resolve().parents[1] / "src" / "static"
    out.mkdir(parents=True, exist_ok=True)
    files = {
        "tab-home.png": home(False),
        "tab-home-active.png": home(True),
        "tab-tools.png": tools(False),
        "tab-tools-active.png": tools(True),
        "tab-mine.png": mine(False),
        "tab-mine-active.png": mine(True),
    }
    for name, drawer in files.items():
        (out / name).write_bytes(png(paint(drawer)))
    # simple logo
    (out / "logo.png").write_bytes(png(paint(circle(40, 40, 28, (47, 107, 90)))))


if __name__ == "__main__":
    main()
