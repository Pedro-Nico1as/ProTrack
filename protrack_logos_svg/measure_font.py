"""
Mede a largura exata de 'protrack' em Outfit Bold 700 @ 60px com letter-spacing -0.5px
e calcula as coordenadas do dot para o wordmark SVG.
"""
import urllib.request
import io
import re

# 1. Busca o CSS do Google Fonts para obter a URL real da fonte
gf_url = "https://fonts.googleapis.com/css2?family=Outfit:wght@700&display=swap"
req = urllib.request.Request(
    gf_url,
    headers={"User-Agent": "Mozilla/5.0 (compatible; python)"}
)
with urllib.request.urlopen(req) as r:
    css = r.read().decode("utf-8")

# Pega a primeira URL de fonte (preferencialmente woff2)
urls = re.findall(r"url\((https://[^\)]+\.(?:woff2|woff|ttf))\)", css)
if not urls:
    raise RuntimeError("Não encontrou URL de fonte no CSS:\n" + css)

font_url = urls[0]
print(f"Fonte encontrada: {font_url}")

# 2. Baixa a fonte
with urllib.request.urlopen(font_url) as r:
    font_data = r.read()
print(f"Fonte baixada: {len(font_data)} bytes")

# 3. Carrega com fonttools
from fontTools.ttLib import TTFont
font = TTFont(io.BytesIO(font_data))

# 4. Extrai métricas
cmap   = font.getBestCmap()           # char code -> glyph name
hmtx   = font["hmtx"].metrics        # glyph name -> (advance_width, lsb)
head   = font["head"]
upem   = head.unitsPerEm             # units per em (normalmente 1000)
os2    = font["OS/2"]
cap_h  = os2.sCapHeight              # cap height em units
asc    = os2.sTypoAscender           # ascender tipográfico
desc   = os2.sTypoDescender          # descender tipográfico (negativo)

FONT_SIZE      = 60      # px
LETTER_SPACING = -0.5    # px por espaço entre caracteres
TEXT           = "protrack"
SCALE          = FONT_SIZE / upem

# 5. Calcula largura total
total_advance = sum(hmtx[cmap[ord(c)]][0] for c in TEXT)
text_width_px = total_advance * SCALE
# letter-spacing aplica-se entre caracteres (n-1 espaços)
text_width_px += LETTER_SPACING * (len(TEXT) - 1)

print(f"\n=== Métricas Outfit Bold @ {FONT_SIZE}px ===")
print(f"UPM              : {upem}")
print(f"Cap Height (px)  : {cap_h * SCALE:.2f}")
print(f"Ascender (px)    : {asc  * SCALE:.2f}")
print(f"Descender (px)   : {desc * SCALE:.2f}")
print(f"Largura do texto : {text_width_px:.3f}px")

# 6. Posição do dot no SVG
# SVG height = 70px, baseline y = ?
# line-height:1 → element box = 60px
# align-items:flex-end → fundo do text box = fundo do container (y=70)
# fundo do text box = baseline + |descender|
# baseline = 70 - |descender_px|

desc_px   = abs(desc * SCALE)
asc_px    = asc  * SCALE
baseline_y = 70 - desc_px

# dot: margin-bottom:7px, height:10px (radius=5)
# dot bottom = container bottom - margin-bottom = 70 - 7 = 63
# dot center y = 63 - 5 = 58
dot_cy = 70 - 7 - 5

# dot center x = text_width + margin-left(2) + radius(5)
dot_cx = text_width_px + 2 + 5

# SVG total width (deixamos 2px de padding após o dot)
svg_width = dot_cx + 5 + 2

print(f"\n=== Coordenadas SVG ===")
print(f"Baseline y       : {baseline_y:.3f}px  → usar {baseline_y:.1f}")
print(f"Dot cx           : {dot_cx:.3f}px     → usar {dot_cx:.1f}")
print(f"Dot cy           : {dot_cy}px")
print(f"SVG total width  : {svg_width:.3f}px  → usar {svg_width:.0f}")
