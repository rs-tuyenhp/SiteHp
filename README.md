# Nexora AI — Website Template

A modern, premium, **dark-mode-first** marketing template for an AI SaaS startup.
Built with **semantic HTML5, modern CSS3, and vanilla JavaScript** — no frameworks,
no build step, no Bootstrap. Copy the folder, open `index.html`, and it runs.

Inspired by OpenAI, Anthropic, Perplexity, Notion AI, Vercel, and Linear.

---

## ▶️ Run it

Just open `index.html` in any modern browser. That's it.

For nicer routing while developing, serve the folder over HTTP:

```bash
# Python
python3 -m http.server 8000
# then open http://localhost:8000

# or Node
npx serve .
```

---

## 🗂 Project structure

```
SiteHp/
├── index.html          # Page 1 — Home
├── solutions.html      # Page 2 — Solutions
├── contact.html        # Page 3 — Contact
├── assets/
│   ├── css/
│   │   └── styles.css  # Full design system + all components
│   └── js/
│       └── main.js     # Menu, scroll-reveal, counters, FAQ, modal, form validation
└── README.md
```

---

## 🧭 Sitemap

```
Home (index.html)
├── Hero · CTA (Start Free Trial / Watch Demo)
├── Trusted by (logos)
├── Features (6 cards)
├── Product showcase (dashboard mockup)
├── Statistics (animated counters)
├── Testimonials (3)
├── Pricing (Starter / Pro / Enterprise)
└── Final CTA

Solutions (solutions.html)
├── Hero
├── Industry cards (6)
├── Workflow (Data → AI Engine → Analysis → Action → Result)
├── Case studies (3)
├── FAQ (8, accordion)
└── CTA

Contact (contact.html)
├── Hero
├── Contact form (validated) + Contact info
├── Office locations (SF / Singapore / Tokyo)
├── Interactive map placeholder
└── Social media
```

---

## 🎨 Design system

| Token group | Values |
|-------------|--------|
| **Primary** | `#6D5DFC` `#7C4DFF` |
| **Secondary** | `#00D4FF` `#14F195` |
| **Background** | `#050816` `#0B1020` `#111827` |
| **Text** | `#FFFFFF` `#D1D5DB` `#94A3B8` |
| **Display font** | Plus Jakarta Sans |
| **Body font** | Inter |
| **Radii** | 10 / 16 / 22 / 30 / pill |
| **Motion** | cubic-bezier easing, 160–520ms |

All tokens live as CSS custom properties in `:root` (see top of `styles.css`),
so you can re-theme the entire site by editing a handful of variables.

---

## ✨ Features

- Sticky, blur-on-scroll header + responsive mobile menu
- Glassmorphism cards, gradient borders, animated background orbs + grid
- Scroll-reveal animations (IntersectionObserver)
- Animated statistic counters
- Accordion FAQ (single-open)
- Demo / live-chat modal
- Fully validated contact form with inline error + success states
- Animated dashboard mockup (pure CSS/HTML)
- Responsive: mobile / tablet / desktop
- Accessible: skip link, focus-visible, ARIA labels, `prefers-reduced-motion`,
  keyboard-dismissable menu & modal
- SEO: semantic landmarks, meta description, Open Graph tags, descriptive titles
- All icons are inline SVG — zero image dependencies

---

## 🔧 Customizing

- **Brand name / colors** → edit `:root` variables in `assets/css/styles.css`.
- **Copy / content** → edit the HTML directly; sections are clearly commented.
- **Fonts** → swap the Google Fonts `<link>` and the `--font-*` variables.
- **Form backend** → the form is simulated client-side in `main.js`
  (search for `Simulated submit`); point it at your endpoint to go live.

> The only external dependency is Google Fonts (loaded via `<link>`).
> Remove it and the system font stack takes over gracefully — the site
> still works fully offline.
