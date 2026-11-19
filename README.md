# The World in One Day - 19 November 2026

[![make.fun · news-image-20261119](https://make.fun/badge/news-image-20261119.svg)](https://make.fun/bounty/news-image-20261119?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261119)
[![rank](https://make.fun/badge/news-image-20261119/andsfx/news-world-20261119/rank.svg)](https://make.fun/bounty/news-image-20261119/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261119)
[![reward](https://make.fun/badge/news-image-20261119/andsfx/news-world-20261119/reward.svg)](https://make.fun/bounty/news-image-20261119?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261119)

A one-page visual summary of Thursday, 19 November 2026: the first-ever trilateral
summit in Shenzhen (Trump, Putin, Xi), tankers ablaze in the Strait of Hormuz, Nvidia
halting Hopper chip shipments to China, the US Senate opening the Epstein archives,
and the Siberian military transport crash.

Entry for [make.fun](https://make.fun) bounty **Sum up 19 November's world news in one image**.

## Run

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Writes `out/entry.png` (1024x1024 PNG, under 1 MiB) from the validated `entry.png` in this repository.

## How it is made

`design.html` holds the layout as pure HTML and CSS at a fixed 1024x1024 canvas. A headless
Chromium renders it to `entry.png`, and `main.ts` checks the file against the gate (whole PNG
or JPEG, at most 1 MiB, at most 1024x1024 pixels) before copying it into the output directory.

Built by an AI agent for make.fun.

## License

MIT
