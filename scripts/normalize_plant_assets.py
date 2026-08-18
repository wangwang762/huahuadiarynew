from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "assets" / "plants" / "final-v1"
RAW_DIR = ASSET_DIR / "raw"

PLANTS = [
    ("lvluo", "绿萝"), ("guibeizhu", "龟背竹"), ("diaolan", "吊兰"),
    ("facaishu", "发财树"), ("fuguizhu", "富贵竹"),
    ("xianrenzhang", "仙人掌"), ("duorou", "多肉植物"),
    ("hupilan", "虎皮兰"), ("luhui", "芦荟"),
    ("jinqianshu", "金钱树"), ("hudielan", "蝴蝶兰"),
    ("changshouhua", "长寿花"), ("yueji", "月季"),
    ("zhizihua", "栀子花"), ("molihua", "茉莉花"),
    ("wenzhu", "文竹"), ("baizhang", "白掌"),
    ("hongzhang", "红掌"), ("junzilan", "君子兰"),
    ("xiangrikui", "向日葵"), ("bohe", "薄荷"),
    ("xianrenqiu", "仙人球"), ("lanmeishu", "小型蓝莓树"),
    ("xiuqiuhua", "绣球花"), ("zhubai", "小型竹柏"),
]

CANVAS = (1000, 1240)
SUBJECT_MAX = (820, 1040)
BOTTOM_Y = 1160


def font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/PingFang.ttc",
        "/System/Library/Fonts/STHeiti Medium.ttc",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def normalize(slug: str) -> Image.Image:
    image = Image.open(RAW_DIR / f"{slug}.png").convert("RGBA")
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    if bbox is None:
        raise ValueError(f"{slug}: empty alpha mask")
    subject = image.crop(bbox)
    scale = min(SUBJECT_MAX[0] / subject.width, SUBJECT_MAX[1] / subject.height)
    size = (max(1, round(subject.width * scale)), max(1, round(subject.height * scale)))
    subject = subject.resize(size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    x = (CANVAS[0] - subject.width) // 2
    y = BOTTOM_Y - subject.height
    canvas.alpha_composite(subject, (x, y))
    canvas.save(ASSET_DIR / f"{slug}.png", optimize=True)
    return canvas


def contact_sheet(images: list[tuple[str, str, Image.Image]]) -> None:
    cell_w, cell_h = 300, 380
    sheet = Image.new("RGB", (cell_w * 5, cell_h * 5), "#eee6d6")
    draw = ImageDraw.Draw(sheet)
    label_font = font(28)
    for index, (slug, chinese, image) in enumerate(images):
        col, row = index % 5, index // 5
        x, y = col * cell_w, row * cell_h
        panel = Image.new("RGBA", (280, 360), "#faf7ef")
        thumb = image.copy()
        thumb.thumbnail((250, 285), Image.Resampling.LANCZOS)
        panel.alpha_composite(thumb, ((280 - thumb.width) // 2, 285 - thumb.height + 8))
        sheet.paste(panel.convert("RGB"), (x + 10, y + 10))
        draw.text((x + 24, y + 315), chinese, fill="#39342d", font=label_font)
        draw.text((x + 24, y + 347), slug, fill="#9b9284", font=font(15))
    sheet.save(ASSET_DIR / "contact-sheet.jpg", quality=94, optimize=True)


def main() -> None:
    images = [(slug, chinese, normalize(slug)) for slug, chinese in PLANTS]
    contact_sheet(images)
    print(f"Normalized {len(images)} assets to {CANVAS[0]}x{CANVAS[1]}")


if __name__ == "__main__":
    main()
