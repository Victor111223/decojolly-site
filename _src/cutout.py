#!/usr/bin/env python3
"""Cut catalog photos out of their backgrounds.

usage: cutout.py <list-of-catalog-paths.txt> <out-dir> [model]
Each input line is a path under assets/images/catalog without extension.
Writes <out-dir>/<stem>.webp and appends cap position data to <out-dir>/_meta.json.
"""
import glob, json, os, sys
import numpy as np
from PIL import Image
from rembg import new_session, remove

ROOT = "/home/claude/decojolly-site/assets/images/catalog/"


def largest_blob(alpha):
    import cv2
    mask = (alpha > 96).astype("uint8")
    n, labels, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
    if n <= 1:
        return alpha
    keep = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    biggest = stats[keep, cv2.CC_STAT_AREA]
    # keep any other blob that is at least 4% of the main object (legs, cookies, skis)
    ok = np.zeros_like(mask)
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] >= biggest * 0.04:
            ok[labels == i] = 1
    grown = cv2.dilate(ok, np.ones((5, 5), "uint8"))
    return (alpha * grown).astype("uint8")


def strip_string(alpha):
    """Erase the hanging thread above the cap. The site draws its own."""
    h, w = alpha.shape
    solid = alpha > 128
    widest = solid.sum(axis=1).max()
    limit = max(9, int(widest * 0.075))
    top = 0
    for y in range(h):
        run = solid[y].sum()
        if run == 0:
            continue
        if run > limit:
            top = y
            break
    out = alpha.copy()
    out[:top] = 0
    return out, top


def process(session, stem, out_dir):
    src = glob.glob(ROOT + stem + ".*")[0]
    name = os.path.basename(stem)
    img = Image.open(src).convert("RGB")
    cut = remove(img, session=session, post_process_mask=True)
    a = np.asarray(cut).copy()
    alpha = largest_blob(a[..., 3])
    alpha, _ = strip_string(alpha)
    a[..., 3] = alpha
    ys, xs = np.where(alpha > 24)
    if len(xs) == 0:
        return name, None
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    crop = a[y0:y1, x0:x1]
    top = crop[..., 3][: max(3, int((y1 - y0) * 0.02))] > 128
    cols = np.where(top.any(axis=0))[0]
    cap = float(cols.mean() / (x1 - x0)) if len(cols) else 0.5
    Image.fromarray(crop).save(os.path.join(out_dir, name + ".webp"), "WEBP", quality=86, alpha_quality=92, method=5)
    return name, {"w": int(x1 - x0), "h": int(y1 - y0), "cap": round(cap, 3), "cover": round(float((crop[..., 3] > 128).mean()), 3)}


def main():
    stems = [l.strip() for l in open(sys.argv[1]) if l.strip()]
    out_dir = sys.argv[2]
    model = sys.argv[3] if len(sys.argv) > 3 else "isnet-general-use"
    os.makedirs(out_dir, exist_ok=True)
    meta_path = os.path.join(out_dir, "_meta.json")
    meta = json.load(open(meta_path)) if os.path.exists(meta_path) else {}
    session = new_session(model)
    for i, stem in enumerate(stems):
        name = os.path.basename(stem)
        if name in meta:
            continue
        try:
            k, v = process(session, stem, out_dir)
            if v:
                meta[k] = v
        except Exception as exc:  # keep going on a single bad photo
            print("FAIL", stem, exc, flush=True)
        if i % 25 == 0:
            json.dump(meta, open(meta_path, "w"))
            print(i, len(stems), flush=True)
    json.dump(meta, open(meta_path, "w"))
    print("done", len(meta), flush=True)


if __name__ == "__main__":
    main()
