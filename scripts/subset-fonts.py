#!/usr/bin/env python3
"""
Subset the self-hosted variable fonts to the characters this site uses (run after copy changes that add
new characters; needs `pip install fonttools brotli`). Keeps both axes (wght, wdth) and all OpenType
features. Input: node_modules/@fontsource-variable/*; output: src/assets/fonts/*.woff2 (committed).
Usage: npm run build && python3 scripts/subset-fonts.py && npm run build
"""
import glob, os, re, html
from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'src/assets/fonts')

# every character in the built pages and scripts, plus a safety set for dynamic text
text = set()
for f in glob.glob(os.path.join(ROOT, 'dist/**/*.html'), recursive=True) + glob.glob(os.path.join(ROOT, 'dist/_astro/*.js')):
    s = open(f, encoding='utf-8', errors='ignore').read()
    s = html.unescape(re.sub(r'<[^>]+>', ' ', s)) if f.endswith('.html') else s
    text.update(s)
safety = ''.join(chr(c) for c in range(0x20, 0x7F)) + 'ĄĆĘŁŃÓŚŹŻąćęłńóśźżÄÖÜäöüßÉéÈèÊêÁáÍíÚúÑñÇç' + '–—‘’“”„«»…·•×°²³€←→↑↓↗✓ ⁠​'
text.update(safety)
text = {c for c in text if ord(c) >= 0x20}

def run(src, dst):
    font = TTFont(src)
    cmap = font.getBestCmap()
    keep = sorted(ord(c) for c in text if ord(c) in cmap)
    opts = subset.Options()
    opts.layout_features = ['*']
    opts.flavor = 'woff2'
    opts.drop_tables += ['DSIG']
    opts.name_IDs = ['*']
    opts.notdef_outline = True
    s = subset.Subsetter(opts)
    s.populate(unicodes=keep)
    s.subset(font)
    font.flavor = 'woff2'
    font.save(dst)
    print(f'{os.path.basename(dst):44} {os.path.getsize(src)//1024:4d} KB -> {os.path.getsize(dst)//1024:3d} KB  ({len(keep)} chars)')

for fam, pre in [('archivo', 'archivo')]:
    for part in ['latin', 'latin-ext']:
        src = os.path.join(ROOT, f'node_modules/@fontsource-variable/{fam}/files/{pre}-{part}-standard-normal.woff2')
        run(src, os.path.join(OUT, f'{pre}-{part}.woff2'))
