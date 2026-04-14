# ivy-portfolio

The new portfolio, rebuilt slowly in public by Ivy Grzybowski -- creative technologist.

## Structure

```
ivy-portfolio/
├── experiments/         -- prototypes and design explorations (tracked in this repo)
│   └── hero-nav-neon-01/   first hero + nav experiment in neon direction
└── landing-page/        -- OLD site from Jan 2026 (NOT tracked here, see below)
```

## landing-page/ -- the old site

`landing-page/` is the Frankenstein React site built in January 2026 with Haiku.
It is its own git repo with its own history at:

**github.com/grzy/badges**

It is intentionally untracked in this repo (see `.gitignore`). It's kept on the
local filesystem while the new portfolio is under construction -- Ivy pulls
designs, layouts, and case study content from it as reference.

**Do not delete `landing-page/`.** It will be retired and removed once the new
site fully replaces it.

To run the old site locally:
```bash
cd landing-page && npm install && npm start
```

## experiments/ -- how we work

Each experiment lives in its own folder under `experiments/`. Self-contained
HTML/CSS/JS so each can be opened standalone. When one wins, the relevant
pieces get lifted into the real site at the root of this repo.

Serve all experiments at once:
```bash
cd experiments && python3 -m http.server 4444
# open http://localhost:4444/hero-nav-neon-01/
```

## Design context

Design direction comes from the Pinterest → Obsidian vault at `~/ivy-vault/`.
Board notes at `~/ivy-vault/pinterest/boards/{board}/✺ {board}.md` contain
palettes, tokens, visual references, and prompts ready to build from.
The cross-board identity lives in `~/ivy-vault/pinterest/✺ Design Manifesto.md`.

Current experiments pulling from: **neon** board.
