# RGC chart format

This library is currently working in progress.

The RGC ("rhythm game chart") file format is a JSON-based format, aims to be able to represent charts from many different rhythm games.

This repository provides [the specification](./docs/spec.md) for the format, and a TypeScript library for reading, manipulating, and writing the chart.

This library builds upon [kshoot.js](https://github.com/123jimin/kshoot.js), and intended to be used by chart viewer and editor for [r-g.kr](https://r-g.kr/) website.

## Interface

### Chart

```ts
export interface RGC {

}
```

### Timing

Provides various useful functions for querying and manipulating timing information of a chart.

## I/O

Planned:

* BMS, BMSON
* KSH, KSON
* Jubeat chart format