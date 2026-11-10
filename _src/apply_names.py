#!/usr/bin/env python3
"""Rewrite assets/data/products.js with real product names, cut-out images and plain descriptions.
Run from the repo root: python3 _src/apply_names.py"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "assets/data/products.js")
names = dict(l.rstrip("\n").split("|", 1) for l in open(os.path.join(ROOT, "_src/product-names.txt"), encoding="utf8") if "|" in l)
keep = set(l.strip() for l in open(os.path.join(ROOT, "_src/keep-original-photo.txt")) if l.strip())
NO_SUFFIX = ("glass-balls-", "plastic-balls-", "glass-figurines", "easter")
HIDE = {"easter-001"}  # photo is blank

src = open(DATA, encoding="utf8").read()
lines = src.split("\n")
iD = next(i for i, l in enumerate(lines) if l.lstrip().startswith("var D="))
iL = next(i for i, l in enumerate(lines) if l.lstrip().startswith("var L="))
D = json.loads(lines[iD].strip()[len("var D="):-1])
L = json.loads(lines[iL].strip()[len("var L="):-1])


def describe(p, d):
    size = (p.get("size") or d.get("size") or "").replace("Approx. ", "about ").replace(" options", "").replace(" in to ", " to ").replace(" cm to ", " to ").replace(" mm to ", " to ")
    pack = (p.get("packaging") or d.get("packaging") or "").replace(" options", "").replace(", or ", " or ")
    mat = (p.get("material") or d.get("material") or "").lower()
    bits = []
    if mat == "glass":
        bits.append("Hand-finished glass")
    elif mat:
        bits.append(mat.capitalize())
    if size:
        bits[-1:] = [bits[-1] + ", " + size] if bits else [size]
    out = (bits[0] + ". ") if bits else ""
    if pack:
        out += "Packaging: " + pack[0].lower() + pack[1:] + ". "
    out += "Colors and packaging can be changed for your order."
    return out


done = 0
for p in L:
    m = re.search(r"/catalog/[^/]+/([^/]+)\.(?:jpg|jpeg|png)$", p.get("image", ""))
    if not m:
        continue
    stem = m.group(1)
    if stem not in names:
        continue
    folder = stem.rsplit("-", 1)[0]
    name = names[stem]
    if not stem.startswith(NO_SUFFIX):
        name += " Ornament"
    p["name"] = name
    p["description"] = describe(p, D.get(p.get("category"), {}))
    cut = "./assets/images/cutouts/%s.webp" % stem
    if stem not in keep and os.path.exists(os.path.join(ROOT, cut[2:])):
        p["cutout"] = cut
    else:
        p.pop("cutout", None)
    if stem in HIDE:
        p["hidden"] = True
    done += 1

lines[iD] = "  var D=" + json.dumps(D, ensure_ascii=False, separators=(",", ":")) + ";"
lines[iL] = "  var L=" + json.dumps(L, ensure_ascii=False, separators=(",", ":")) + ";"
out = "\n".join(lines)
open(DATA, "w", encoding="utf8").write(out)
print("renamed", done, "of", len(L))
