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

```ts
export interface Timing {
    bpm_by_pulse: ISortedMap<Pulse, Readonly<BPMInfo>>;
    bpm_by_time: ISortedMap<Pulse, Readonly<BPMInfo>>;
    time_sig_by_pulse: ISortedMap<Pulse, [MeasureIdx, ReadOnly<TimeSig>]>;
    time_sig_by_idx: ISortedMap<MeasureIdx, [Pulse, ReadOnly<TimeSig>]>;

    constructor(beat: BeatInfo);

    *measures(range: PulseRange): Generator<[Pulse, MeasureInfo]>;
    *withTimingInfo<T>(it: IterableIterator<[Pulse, T]>): Generator<[Readonly<TimingInfo>, T]>;

    getMeasureInfoByIdx(measure_idx: MeasureIdx): MeasureInfo;
    getMeasureInfoByPulse(pulse: Pulse): MeasureInfo;
    getTimeByPulse(pulse: Pulse): number;

    toString(): string;
}
```

## I/O

Planned:

* BMS, BMSON
* KSH, KSON
* Jubeat chart format