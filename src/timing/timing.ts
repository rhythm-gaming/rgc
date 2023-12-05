import { default as BTree, type ISortedMap } from 'sorted-btree';

import type { TimingSegment, Tick, TickRange, MeasureIdx, MeasureInfo, TimingInfo } from "./types";

/**
 * Class for managing timing information of a chart.
 */
export class Timing {
    /** Replace the whole segment info with `segments`. */
    setSegments(segments: Iterable<TimingSegment>) {}

    /** Replace the whole bpm info with `bpms`. */
    setBPMs(bpms: Iterable<[Tick, number]>) {}

    *measures(range: TickRange): Generator<[Tick, Readonly<MeasureInfo>]> {}
    *withTimingInfo<T>(it: IterableIterator<[Tick, T]>): Generator<[Readonly<TimingInfo>, T]> {}

    getMeasureInfoByIdx(measure_idx: MeasureIdx): MeasureInfo { throw new Error("Not yet implemented!"); }
    getMeasureInfoByTick(tick: Tick): MeasureInfo { throw new Error("Not yet implemented!"); }
    getTimeByTick(tick: Tick): number { throw new Error("Not yet implemented!") }

    toString(): string {
        return `[Timing with ${this.bpm_by_tick.size} bpm changes and ${this.segment_by_tick.size} segments]`;
    }
}