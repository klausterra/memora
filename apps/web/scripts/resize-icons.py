from PIL import Image
from pathlib import Path

src = Path(r"C:\Users\klaus\.cursor\projects\d-Projetos-Cursor-memora\assets\memora-icon-1024.png")
out_dir = Path(r"D:\Projetos\Cursor\memora\apps\web\public")
img = Image.open(src).convert("RGBA")
img.save(out_dir / "icon-source.png", optimize=True)

for size, name in [
    (512, "icon-512.png"),
    (192, "icon-192.png"),
    (180, "apple-touch-icon.png"),
    (32, "favicon-32.png"),
    (16, "favicon-16.png"),
]:
    img.resize((size, size), Image.Resampling.LANCZOS).save(out_dir / name, optimize=True)

print("ok")
