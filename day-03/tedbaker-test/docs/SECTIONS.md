# Section spec — source of truth for the agent

Observed on tedbaker.com (Sept 2026). The store changes promotions often: if an
image URL 404s, get the current one from DevTools → Network → Img.
Values marked TODO: measure in DevTools and fill in before styling that section.

Image URLs originally end in `width=3840`; we request smaller sizes on purpose
(performance). Use `width=1600` for full-bleed, `width=800` for tiles, `width=600` for cards.

---

## 1. Announcement bar  [MVP]
- Thin full-width bar above the header, centered uppercase text, links.
- Messages: "25% OFF SITEWIDE | SHOP NOW" · "SAVE 15% OFF YOUR FIRST ORDER" ·
  "FREE DELIVERY ON US ORDERS OVER $200"
- MVP: show the first message only. Stretch: CSS-only rotation.
- Element: a `<div>` or `<aside>` inside/above `<header>`, messages are `<a>` links.
- TODO: background color, text color, height feel, font size.

## 2. Header + nav  [MVP]
- Row: search button (left) · logo centered (link to "/") · icons right: wishlist,
  account, cart (Bootstrap Icons, icon-only buttons/links with aria-label).
- Nav below: Women · Men · Gifts · Sale · Outlet (uppercase, centered).
- Mobile (<992px): hamburger button opens a Bootstrap offcanvas with the nav links.
- Stretch: one mega-menu (e.g. Women: New / Clothing / Bags & Accessories / Shoes / Collections).
- Logo: inspect in Elements; if inline SVG, save to `assets/logo.svg`.
- TODO: header height feel, logo width, nav font size + letter-spacing.

## 3. Hero  [MVP]
- Full-bleed image with overlaid centered text.
- Images (`<picture>`):
  - mobile:  https://www.tedbaker.com/cdn/shop/files/M-Hero-26-09-17-copy.jpg?v=1789471226&width=800
  - desktop: https://www.tedbaker.com/cdn/shop/files/D-Hero-26-09-17.jpg?v=1789471225&width=1600
- Text: eyebrow "FRIENDS & FAMILY EVENT" (p) · **h1** "25% OFF SITEWIDE" ·
  "Automatically applied at checkout." (p — the real site uses a second h2; don't copy that)
- 4 CTA links: WOMEN'S NEW ARRIVALS · WOMEN'S SALE & OUTLET · MEN'S NEW ARRIVALS ·
  MEN'S SALE & OUTLET. 2×2 on mobile, 1 row on desktop.
- Use aspect-ratio / min-height, never a fixed height.

## 4. Campaign banner  [STRETCH]
- mobile:  https://www.tedbaker.com/cdn/shop/files/M-UK-26-09-02-Logo.jpg?v=1788254424&width=800
- desktop: https://www.tedbaker.com/cdn/shop/files/D-UK-26-09-02-Logo.jpg?v=1788254416&width=1600
- Short paragraph below/over it about the season and London (write your own paraphrase).

## 5. Video tiles  [STRETCH]
- Two tiles side by side on desktop, stacked on mobile.
- Video 1: https://www.tedbaker.com/cdn/shop/videos/c/vp/12b1efde999841519b810d64d56c3ddd/12b1efde999841519b810d64d56c3ddd.HD-1080p-7.2Mbps-93155909.mp4?v=0
  poster: https://www.tedbaker.com/cdn/shop/files/preview_images/12b1efde999841519b810d64d56c3ddd.thumbnail.0000000000_600x.jpg?v=1788251503
- Video 2: https://www.tedbaker.com/cdn/shop/videos/c/vp/f90b06051854428689a1602101920b2b/f90b06051854428689a1602101920b2b.HD-720p-4.5Mbps-93272097.mp4?v=0
  poster: https://www.tedbaker.com/cdn/shop/files/preview_images/f90b06051854428689a1602101920b2b.thumbnail.0000000000_600x.jpg?v=1788343551

## 6. New arrivals carousel  [MVP]
- h2 "25% OFF NEW ARRIVALS", then a horizontal scroll row of product cards, then a
  "SHOP ALL" link.
- Build 6–8 cards. Each card is an `<article>`:
  image (link) · "New In" badge · wishlist `<button aria-label>` (heart icon) ·
  product name (link, uppercase) · short description · price.
- Layout: CSS scroll-snap. ~2 cards visible at 375px, 3 at 768px, 4 at 1024px+.
- Example products (name / description / price):
  ONEIDA — Mock Neck Midi Dress with Faux Leather Skirt — $395.00
  RIYOZE — Wrap Front Cropped Leather Jacket — $595.00
  VALENTINA — Tailored Drop Waist Buttoned Mini Dress — $275.00
  ROSE — Midi Length Belted Wool Wrap Coat — $575.00
  HAMELS — Short Sleeve Cotton Polo Shirt — $195.00
  ANTWRP — Double Faced Wool Blend Harrington Jacket — $395.00
- TODO: product image URLs from DevTools (use width=600).

## 7. Workwear tiles  [MVP]  +  favorites grid  [STRETCH]
- Two image links side by side (stacked on mobile):
  - Women: mobile https://www.tedbaker.com/cdn/shop/files/M-US-26-09-02-Workwear-WW.jpg?v=1788266935&width=800
           desktop https://www.tedbaker.com/cdn/shop/files/D-US-26-09-02-Workwear-WW.jpg?v=1788266924&width=800
  - Men:   mobile https://www.tedbaker.com/cdn/shop/files/M-US-26-09-02-Workwear-MW.jpg?v=1788266935&width=800
           desktop https://www.tedbaker.com/cdn/shop/files/D-US-26-09-02-Workwear-MW.jpg?v=1788266924&width=800
- Stretch: h2 "WORKWEAR FAVORITES" + grid of 8 product images
  (`repeat(auto-fit, minmax(…, 1fr))`).

## 8. Footer  [MVP]
- Hand-written CSS Grid (no Bootstrap grid). Stacked on mobile, 4 columns on desktop.
- Columns:
  - "Ted Baker": About Us, Womenswear, Menswear, Sale, Outlet, Gifting, Gift Card
  - "Customer Service": Help & FAQs, Delivery & Returns, Customer Service, Contact Us,
    Track My Order, Size Guide
  - "Legal": Privacy Policy, Cookie Policy, Terms of Service, Returns Policy
  - Newsletter: heading "SIGN UP FOR 15% OFF", one line of text, email input with a
    real `<label>`, Subscribe button
- Bottom row: social icons (Facebook, X, Instagram, Pinterest, YouTube — icon links
  with aria-label), payment icons (optional), copyright line + "Learning exercise,
  not affiliated with Ted Baker."
- All links can point to "#".
