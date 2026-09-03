from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1] / 'src' / 'static'
SIZE = 81
MUTED = (184, 154, 140, 255)
ACTIVE = (181, 71, 56, 255)


def canvas():
    return Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))


def draw_home(draw: ImageDraw.ImageDraw, color):
    # lantern body
    draw.rounded_rectangle((26, 28, 55, 62), radius=10, outline=color, width=4)
    draw.line((32, 22, 49, 22), fill=color, width=4)
    draw.line((40, 16, 40, 22), fill=color, width=4)
    draw.ellipse((36, 36, 45, 50), outline=color, width=3)
    draw.line((34, 62, 47, 62), fill=color, width=4)


def draw_tools(draw: ImageDraw.ImageDraw, color):
    draw.rounded_rectangle((20, 22, 61, 63), radius=8, outline=color, width=4)
    draw.line((20, 34, 61, 34), fill=color, width=4)
    draw.line((34, 22, 34, 63), fill=color, width=3)
    draw.line((47, 22, 47, 63), fill=color, width=3)
    draw.line((20, 46, 61, 46), fill=color, width=3)


def draw_mine(draw: ImageDraw.ImageDraw, color):
    draw.ellipse((28, 16, 53, 41), outline=color, width=4)
    draw.arc((18, 42, 63, 78), 200, 340, fill=color, width=4)


def save(name: str, painter, color):
    img = canvas()
    painter(ImageDraw.Draw(img), color)
    img.save(ROOT / name)


def main():
    ROOT.mkdir(parents=True, exist_ok=True)
    save('tab-home.png', draw_home, MUTED)
    save('tab-home-active.png', draw_home, ACTIVE)
    save('tab-tools.png', draw_tools, MUTED)
    save('tab-tools-active.png', draw_tools, ACTIVE)
    save('tab-mine.png', draw_mine, MUTED)
    save('tab-mine-active.png', draw_mine, ACTIVE)
    print('tab icons written')


if __name__ == '__main__':
    main()
