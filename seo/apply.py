#!/usr/bin/env python3
"""Add search and sharing information to the gallery pages.

Run from the repo root:  python3 seo/apply.py

It is safe to run again at any time (for example after the room pages are
regenerated). It only touches:
  * the <title> and a block between <!--seo:start--> and <!--seo:end--> in <head>
  * a text block between <!--seo-text:start--> and <!--seo-text:end--> in <body>
  * sitemap.xml and robots.txt
The 3D room code and the ROOMS.space(...) settings are never changed.
Page text and descriptions live in seo/rooms.json.
"""
import html
import json
import os
import re
import sys
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = json.load(open(os.path.join(ROOT, "seo", "rooms.json"), encoding="utf-8"))
BASE = DATA["base"]
SITE = DATA["site"]
ARTIST = DATA["artist"]
PERSON_ID = SITE + "/#person"
WEBSITE_ID = BASE + "#website"
TODAY = date.today().isoformat()

H_START, H_END = "<!--seo:start-->", "<!--seo:end-->"
B_START, B_END = "<!--seo-text:start-->", "<!--seo-text:end-->"

AI_TRAINING_BOTS = [
    "AI2Bot", "Ai2Bot-Dolma", "aiHitBot", "Amazonbot", "anthropic-ai", "Applebot-Extended",
    "Bytespider", "CCBot", "ClaudeBot", "cohere-ai", "cohere-training-data-crawler",
    "DuckAssistBot", "FacebookBot", "Google-Extended", "GoogleOther", "GoogleOther-Image",
    "GoogleOther-Video", "GPTBot", "img2dataset", "Meta-ExternalAgent", "MyCentralAIScraperBot",
    "omgili", "omgilibot", "Quora-Bot", "TikTokSpider", "YouBot",
]

CSS = (
    ".seo-text{box-sizing:border-box;max-width:760px;margin:0 auto;padding:48px 16px 64px;"
    "color:#efe8dd;background:#1d1c1b;font:300 16px/1.65 'Helvetica Neue',Arial,sans-serif}"
    ".seo-text h1{font-weight:400;font-size:32px;letter-spacing:.03em;margin:0 0 4px}"
    ".seo-text h2{font-weight:400;font-size:20px;margin:40px 0 12px}"
    ".seo-text .by{margin:0 0 20px;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#a99d8d}"
    ".seo-text a{color:inherit}"
    ".seo-text ol,.seo-text ul{padding-left:0;list-style:none}"
    ".seo-text ol{display:grid;gap:32px}"
    ".seo-text figure{margin:0}"
    ".seo-text img{display:block;max-width:100%;height:auto}"
    ".seo-text figcaption{margin-top:8px;font-size:14px;color:#a99d8d}"
    "html.js .seo-text{position:absolute!important;width:1px;height:1px;margin:-1px;padding:0;"
    "border:0;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap}"
)


def esc(s):
    return html.escape(s, quote=True)


def absolute(src):
    return src if src.startswith("http") else BASE + src.lstrip("/")


def plain(meta):
    """'line one<br>line two' -> 'line one · line two' without tags."""
    s = re.sub(r"<br\s*/?>", " · ", meta or "")
    return html.unescape(re.sub(r"<[^>]+>", "", s)).strip()


def room_config(text):
    m = re.search(r"ROOMS\.space\((\{.*\})\);\s*</script>", text, re.S)
    return json.loads(m.group(1)) if m else None


def jsonld(obj):
    s = json.dumps(obj, ensure_ascii=False, indent=1)
    return '<script type="application/ld+json">\n' + s.replace("</", "<\\/") + "\n</script>"


def person():
    return {
        "@type": "Person",
        "@id": PERSON_ID,
        "name": ARTIST["name"],
        "url": ARTIST["url"],
        "sameAs": ARTIST["sameAs"],
        "description": ARTIST["description"],
        "jobTitle": "Photographer",
    }


def website():
    return {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        "url": BASE,
        "name": "Gallery Rooms by Volodymyr Demkiv",
        "inLanguage": "en",
        "publisher": {"@id": PERSON_ID},
    }


def head_block(title, desc, url, image, image_alt, ld, extra=""):
    lines = [
        H_START,
        extra,
        "<title>%s</title>" % esc(title),
        '<meta name="description" content="%s">' % esc(desc),
        '<meta name="author" content="%s">' % esc(ARTIST["name"]),
        '<meta name="robots" content="index,follow,max-image-preview:large">',
        '<link rel="canonical" href="%s">' % esc(url),
        '<meta property="og:type" content="website">',
        '<meta property="og:site_name" content="Volodymyr Demkiv">',
        '<meta property="og:locale" content="en_US">',
        '<meta property="og:title" content="%s">' % esc(title),
        '<meta property="og:description" content="%s">' % esc(desc),
        '<meta property="og:url" content="%s">' % esc(url),
        '<meta property="og:image" content="%s">' % esc(image),
        '<meta property="og:image:alt" content="%s">' % esc(image_alt),
        '<meta name="twitter:card" content="summary_large_image">',
        '<meta name="twitter:title" content="%s">' % esc(title),
        '<meta name="twitter:description" content="%s">' % esc(desc),
        '<meta name="twitter:image" content="%s">' % esc(image),
        '<meta name="twitter:image:alt" content="%s">' % esc(image_alt),
        jsonld(ld),
        H_END,
    ]
    return "\n".join(l for l in lines if l)


def strip_blocks(text):
    text = re.sub(r"\n?" + re.escape(H_START) + r".*?" + re.escape(H_END) + r"\n?", "", text, flags=re.S)
    text = re.sub(r"\n?" + re.escape(B_START) + r".*?" + re.escape(B_END) + r"\n?", "", text, flags=re.S)
    return re.sub(r"<title>.*?</title>\n?", "", text, flags=re.S)


def insert_head(text, block):
    m = re.search(r'<meta name="viewport"[^>]*>', text) or re.search(r"<meta charset=[^>]*>", text, re.I)
    if not m:
        sys.exit("No <meta charset> found; page layout changed?")
    return text[: m.end()] + "\n" + block + "\n" + text[m.end():].lstrip("\n")


def alt_for(work_title, series, subject, digital=False):
    kind = "colour digital work" if digital else "black and white film photograph"
    if work_title.lower().startswith(series.lower()):
        return "%s: %s, %s by Volodymyr Demkiv" % (work_title, subject, kind)
    return "%s, from %s by Volodymyr Demkiv: %s, %s" % (work_title, series, subject, kind)


def room_page(fname, text, cfg, info, all_rooms):
    slug = fname[:-5]
    series = cfg["title"]
    url = BASE + fname
    series_url = SITE + info["series"]
    works = cfg.get("works") or cfg.get("grid") or []
    digital = info.get("medium") == "Digital work"
    title = "%s — 3D Gallery Room | Volodymyr Demkiv" % series
    desc = info["description"]
    image = absolute(info["image"])
    image_alt = "%s, %s by Volodymyr Demkiv" % (series, "colour digital work" if digital else "black and white photograph")

    artworks = []
    for w in works:
        a = {
            "@type": "VisualArtwork",
            "name": w["t"],
            "image": absolute(w["f"]),
            "creator": {"@id": PERSON_ID},
            "artform": "Photograph",
        }
        if digital:
            a["artMedium"] = "Digital"
        elif info.get("single"):
            a["artMedium"] = "25 gelatin silver prints, 8 x 10 in each, in one frame"
        else:
            a["artMedium"] = "Gelatin silver print"
            a["artworkSurface"] = "Fiber-based paper"
            a["artEdition"] = "5 + 1 AP"
        artworks.append(a)

    ld = {
        "@context": "https://schema.org",
        "@graph": [
            person(),
            website(),
            {
                "@type": "CollectionPage",
                "@id": url,
                "url": url,
                "name": title,
                "description": desc,
                "inLanguage": "en",
                "isPartOf": {"@id": WEBSITE_ID},
                "primaryImageOfPage": {"@type": "ImageObject", "url": image},
                "author": {"@id": PERSON_ID},
                "about": {"@id": url + "#series"},
                "relatedLink": series_url,
                "breadcrumb": {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        {"@type": "ListItem", "position": 1, "name": "Gallery Rooms", "item": BASE},
                        {"@type": "ListItem", "position": 2, "name": series, "item": url},
                    ],
                },
            },
            {
                "@type": "Collection",
                "@id": url + "#series",
                "name": series,
                "description": info["text"],
                "creator": {"@id": PERSON_ID},
                "url": series_url,
                "hasPart": artworks,
            },
        ],
    }

    # Readable text: the same titles and labels the room shows, for search engines,
    # screen readers and browsers without WebGL. Shown as a page when JavaScript is off.
    items = []
    for w in works:
        cap = esc(w["t"]) + " · " + esc(plain(w.get("m") or cfg.get("meta")))
        items.append(
            '<li><figure><img src="%s" alt="%s" loading="lazy" decoding="async" crossorigin="anonymous">'
            "<figcaption>%s</figcaption></figure></li>"
            % (esc(w["f"]), esc(alt_for(w["t"], series, info["subject"], digital)), cap)
        )
    others = "".join(
        '<li><a href="%s">%s</a></li>' % (esc(f), esc(t)) for f, t in all_rooms if f != fname
    )
    note = (
        "Each print is made by hand by the artist in the darkroom, on fiber-based paper, "
        "signed and numbered in an edition of 5 + 1 AP. Prints are available; please "
        '<a href="%s/contact">inquire</a>.' % SITE
    )
    if digital:
        note = 'Size and edition on request; please <a href="%s/contact">inquire</a>.' % SITE
    if info.get("single"):
        note = 'Offered only as one complete work; please <a href="%s/contact">inquire</a>.' % SITE
    body = "\n".join([
        B_START,
        '<article class="seo-text" aria-label="About this room">',
        '<noscript><p>This walkable 3D room needs JavaScript and WebGL. The works in it are listed below.</p></noscript>',
        "<h1>%s</h1>" % esc(series),
        '<p class="by">Volodymyr Demkiv · 3D gallery room</p>',
        "<p>%s</p>" % esc(info["text"]),
        "<p>%s</p>" % note,
        "<h2>Works in this room</h2>",
        "<ol>%s</ol>" % "".join(items),
        "<h2>More</h2>",
        '<ul><li><a href="%s">%s on volodymyrdemkiv.com</a></li>' % (esc(series_url), esc(series)),
        '<li><a href="%s/prints">Silver gelatin prints</a></li>' % SITE,
        '<li><a href="%s/about">About Volodymyr Demkiv</a></li>' % SITE,
        '<li><a href="./">All gallery rooms</a></li></ul>',
        "<h2>Other rooms</h2>",
        "<ul>%s</ul>" % others,
        "</article>",
        B_END,
    ])

    extra = "<script>document.documentElement.classList.add('js')</script>\n<style>%s</style>" % CSS
    text = insert_head(text, head_block(title, desc, url, image, image_alt, ld, extra))
    text = re.sub(r"<body>\n?", "<body>\n" + body + "\n", text, count=1)
    return text


def index_page(text, rooms):
    info = DATA["index"]
    url = BASE
    image = absolute(info["image"])
    ld = {
        "@context": "https://schema.org",
        "@graph": [
            person(),
            website(),
            {
                "@type": "CollectionPage",
                "@id": url,
                "url": url,
                "name": info["title"],
                "description": info["description"],
                "inLanguage": "en",
                "isPartOf": {"@id": WEBSITE_ID},
                "author": {"@id": PERSON_ID},
                "primaryImageOfPage": {"@type": "ImageObject", "url": image},
                "relatedLink": SITE + "/",
                "mainEntity": {
                    "@type": "ItemList",
                    "itemListElement": [
                        {"@type": "ListItem", "position": i + 1, "name": t, "url": BASE + f}
                        for i, (f, t) in enumerate(rooms)
                    ],
                },
            },
        ],
    }
    extra = '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
    if re.search(r'<meta name="viewport"', text):
        extra = ""
    text = insert_head(text, head_block(info["title"], info["description"], url, image, info["imageAlt"], ld, extra))
    if not text.lstrip().lower().startswith("<!doctype"):
        text = '<!doctype html>\n<html lang="en">\n' + text
    return text


def main():
    pages = sorted(f for f in os.listdir(ROOT) if f.endswith(".html"))
    rooms, configs = [], {}
    for f in pages:
        if f == "index.html":
            continue
        cfg = room_config(open(os.path.join(ROOT, f), encoding="utf-8").read())
        if not cfg:
            print("skip (no room settings):", f)
            continue
        if f[:-5] not in DATA["rooms"]:
            print("WARNING: no SEO text for", f, "- add it to seo/rooms.json")
            continue
        configs[f] = cfg
        rooms.append((f, cfg["title"]))

    for f, cfg in configs.items():
        p = os.path.join(ROOT, f)
        text = strip_blocks(open(p, encoding="utf-8").read())
        out = room_page(f, text, cfg, DATA["rooms"][f[:-5]], rooms)
        open(p, "w", encoding="utf-8").write(out)
        print("updated", f)

    p = os.path.join(ROOT, "index.html")
    text = strip_blocks(open(p, encoding="utf-8").read())
    open(p, "w", encoding="utf-8").write(index_page(text, rooms))
    print("updated index.html")

    # sitemap.xml with the prints as image entries
    urls = ["<url><loc>%s</loc><lastmod>%s</lastmod></url>" % (BASE, TODAY)]
    for f, cfg in configs.items():
        imgs = "".join(
            "<image:image><image:loc>%s</image:loc></image:image>" % esc(absolute(w["f"]))
            for w in (cfg.get("works") or [])
        )
        urls.append("<url><loc>%s</loc><lastmod>%s</lastmod>%s</url>" % (BASE + f, TODAY, imgs))
    sm = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
        'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'
        + "\n".join(urls) + "\n</urlset>\n"
    )
    open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8").write(sm)
    print("wrote sitemap.xml (%d pages)" % len(urls))

    # robots.txt: same stance as volodymyrdemkiv.com (AI training crawlers kept out)
    rb = "# Same rules as volodymyrdemkiv.com: search engines welcome, AI training crawlers not.\n"
    rb += "".join("User-agent: %s\n" % b for b in AI_TRAINING_BOTS) + "Disallow: /\n\n"
    rb += "User-agent: *\nAllow: /\nDisallow: /*.tgz$\n\nSitemap: %ssitemap.xml\n" % BASE
    open(os.path.join(ROOT, "robots.txt"), "w", encoding="utf-8").write(rb)
    print("wrote robots.txt")


if __name__ == "__main__":
    main()
