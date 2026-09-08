from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

from PIL import Image


def foreground_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    rgb = image.convert("RGB")
    width, height = rgb.size
    pixels = rgb.load()
    background = pixels[0, 0]
    mask = [False] * (width * height)
    for y in range(height):
        for x in range(width):
            color = pixels[x, y]
            distance = sum(abs(color[channel] - background[channel]) for channel in range(3))
            mask[y * width + x] = distance > 42

    seen = [False] * len(mask)
    largest: list[int] = []
    for start, active in enumerate(mask):
        if not active or seen[start]:
            continue
        seen[start] = True
        component: list[int] = []
        queue = deque([start])
        while queue:
            index = queue.popleft()
            component.append(index)
            x, y = index % width, index // width
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if 0 <= nx < width and 0 <= ny < height:
                    neighbour = ny * width + nx
                    if mask[neighbour] and not seen[neighbour]:
                        seen[neighbour] = True
                        queue.append(neighbour)
        if len(component) > len(largest):
            largest = component

    if not largest:
        raise ValueError(f"No foreground found in {image}")
    xs = [index % width for index in largest]
    ys = [index // width for index in largest]
    return min(xs), min(ys), max(xs) + 1, max(ys) + 1


def normalize(source: Path, output: Path, canvas=(600, 900), occupancy=0.78) -> None:
    image = Image.open(source).convert("RGB")
    crop = image.crop(foreground_bbox(image))
    max_width = int(canvas[0] * occupancy)
    max_height = int(canvas[1] * occupancy)
    scale = min(max_width / crop.width, max_height / crop.height)
    resized = crop.resize((round(crop.width * scale), round(crop.height * scale)), Image.Resampling.LANCZOS)
    result = Image.new("RGB", canvas, "white")
    x = (canvas[0] - resized.width) // 2
    y = (canvas[1] - resized.height) // 2
    result.paste(resized, (x, y))
    result.save(output)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("reference", type=Path)
    parser.add_argument("render", type=Path)
    parser.add_argument("reference_out", type=Path)
    parser.add_argument("render_out", type=Path)
    args = parser.parse_args()
    normalize(args.reference, args.reference_out)
    normalize(args.render, args.render_out)


if __name__ == "__main__":
    main()
