"""Crop the user's portrait into:
  1. avatar.png       — 512×512 circular avatar (transparent corners) for the portfolio site
  2. avatar-resume.jpg — 240×320 (3:4) headshot for the resume
"""
from PIL import Image, ImageDraw, ImageOps

SRC = "/Users/zhili/Pictures/Photos Library.photoslibrary/resources/derivatives/0/084FB842-B83E-4A8A-8E8C-DB2BCCDE7737_1_105_c.jpeg"
SITE_OUT = "/Users/zhili/Desktop/作品集/portfolio-app/src/assets/avatar.png"
RESUME_OUT = "/Users/zhili/Desktop/秋招/outputs/avatar-resume.jpg"

img = Image.open(SRC).convert("RGB")
w, h = img.size
print(f"Source: {w}x{h}")

# 1) Site avatar — center-crop a square, scale to 512, then mask to a circle
side = min(w, h)
left = (w - side) // 2
top = (h - side) // 2
square = img.crop((left, top, left + side, top + side))
square = square.resize((512, 512), Image.LANCZOS)

mask = Image.new("L", (512, 512), 0)
ImageDraw.Draw(mask).ellipse((0, 0, 512, 512), fill=255)
avatar = ImageOps.fit(square, (512, 512), centering=(0.5, 0.5))
avatar.putalpha(mask)
avatar.save(SITE_OUT, "PNG", optimize=True)
print(f"Saved circular avatar: {SITE_OUT}")

# 2) Resume headshot — 3:4 crop, vertically centered slightly above mid (face-up bias)
#    Head-shot 3:4 ratio is the standard for Chinese resumes (1-inch = 25mm tall)
#    Frame should show head + shoulders + a bit of chest.
target_w, target_h = 240, 320
target_ratio = target_w / target_h
src_ratio = w / h
if src_ratio > target_ratio:
    # source wider than target — crop sides
    new_w = int(h * target_ratio)
    left2 = (w - new_w) // 2
    head = img.crop((left2, 0, left2 + new_w, h))
else:
    new_h = int(w / target_ratio)
    # bias upward a bit so the face sits in the upper third
    top2 = max(0, int((h - new_h) * 0.25))
    head = img.crop((0, top2, w, top2 + new_h))
head = head.resize((target_w, target_h), Image.LANCZOS)
head.save(RESUME_OUT, "JPEG", quality=92, optimize=True)
print(f"Saved resume headshot: {RESUME_OUT}")
