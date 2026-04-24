"""Génère textures SVG et sons WAV procéduraux pour le prototype."""
from __future__ import annotations

import math
import random
import wave
from pathlib import Path
from struct import pack

ROOT = Path(__file__).parent
TEX = ROOT / 'assets' / 'textures'
SFX = ROOT / 'assets' / 'sfx'
TEX.mkdir(parents=True, exist_ok=True)
SFX.mkdir(parents=True, exist_ok=True)

PALETTE = {
    'minerai': ('#75808c', '#9aa5b1'),
    'cuivre': ('#ad6b39', '#e09d63'),
    'charbon': ('#2f3742', '#4b5563'),
    'sable': ('#d9b56f', '#f0d59b'),
    'pétrole': ('#111827', '#1f2937'),
    'cristaux': ('#00bcd4', '#6ee7f9'),
    'biomasse': ('#3d8b50', '#7ddc7f'),
    'eau': ('#2377d6', '#6ab6ff'),
}


def texture_svg(name: str, c1: str, c2: str) -> str:
    circles = []
    for _ in range(14):
        x = random.randint(3, 61)
        y = random.randint(3, 61)
        r = random.randint(2, 8)
        alpha = random.uniform(0.2, 0.7)
        circles.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c2}" opacity="{alpha:.2f}"/>')
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">'
        f'<rect width="64" height="64" fill="{c1}"/>'
        + ''.join(circles)
        + '</svg>'
    )


def write_wav(path: Path, freq: float, duration: float = 0.14, volume: float = 0.35) -> None:
    sample_rate = 44100
    n = int(sample_rate * duration)
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sample_rate)
        for i in range(n):
            env = math.exp(-4 * i / n)
            v = volume * env * math.sin(2 * math.pi * freq * i / sample_rate)
            w.writeframes(pack('<h', int(v * 32767)))


def main() -> None:
    random.seed(42)
    for name, (c1, c2) in PALETTE.items():
        (TEX / f'{name}.svg').write_text(texture_svg(name, c1, c2), encoding='utf-8')

    sfx_bank = {
        'build': 390,
        'extract': 120,
        'craft': 520,
        'success': 760,
        'alert': 220,
    }
    for filename, freq in sfx_bank.items():
        write_wav(SFX / f'{filename}.wav', freq)

    print(f'Textures: {len(PALETTE)} | Sons: {len(sfx_bank)} générés localement dans assets/.')


if __name__ == '__main__':
    main()
