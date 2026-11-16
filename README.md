# Oceanfall

A colossal luminous whale leaps out of an ocean planet's coral rings. A tiny golden sailboat rides its back into the stars.

Original procedural illustration, drawn from curves, layered colour, light and seeded droplets. No external assets or dependencies. Rendered with 2× supersampling and a handwritten PNG encoder using Node's standard library.

Run with Node 22 (with TypeScript stripping enabled) or later:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

The grader writes to `/output/entry.png` by default. The root `entry.png` is a generated preview. To regenerate it and verify two independent runs, dimensions, size, every chunk CRC and the full decompressed pixel data:

```sh
MAKEFUN_OUTPUT_DIR=. node main.ts
MAKEFUN_OUTPUT_DIR=out node main.ts
node verify.ts
```

MIT licensed.

[![make.fun](https://make.fun/badge/ai-excited-01.svg)](https://make.fun/c/ai-excited-01/)
[![Rank](https://make.fun/badge/ai-excited-01/Jelly-RayTian/ai-excited-01/rank.svg)](https://make.fun/c/ai-excited-01/)
[![Reward](https://make.fun/badge/ai-excited-01/Jelly-RayTian/ai-excited-01/reward.svg)](https://make.fun/c/ai-excited-01/)
