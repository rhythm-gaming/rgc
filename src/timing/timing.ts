import { BTree, type ISortedMap } from "../sorted-btree.js";

import type { BPMInfo, MeasureIdx, MeasureInfo, Tick, TickRange, TimeSignature, TimeSignatureInfo, TimingInfo } from './types';
import { createBpmInfos, createTimeSignatureInfos, getTimeFromBPMInfo } from "./util.js";

interface TimingIterators {
    bpm: Iterator<[Tick, Readonly<BPMInfo>]>;
    sig: Iterator<[Tick, Readonly<TimeSignatureInfo>]>;
}

interface TimingStatus {
    bpm: Readonly<BPMInfo>;
    sig: Readonly<TimeSignatureInfo>;
}

export interface TimingConstructorArgs {
    /** \# of ticks per a quarter note. Defaults to 24. */
    res?: number|bigint;
    /** A sorted list of BPM changes. */
    bpm?: Iterable<[tick: Tick, bpm: number]>;
    /** A sorted list of time signature changes. */
    sig?: Iterable<[tick: Tick, time_signature: TimeSignature]>;
}

/**
 * Class for managing timing information of a chart.
 * 
 * **IMPORTANT: Chart offsets must be handled manually**, as all times are relative to the beginning of the chart (tick = 0).
 */
export class Timing {
    #res: bigint = 24n;
    /** \# of ticks per a quarter note. Defaults to 24. */
    get res() { return this.#res; }

    #bpm_by_tick: ISortedMap<Tick, BPMInfo>;
    get bpm_by_tick() { return this.#bpm_by_tick; }

    #bpm_by_time: ISortedMap<number, BPMInfo>;
    get bpm_by_time() { return this.#bpm_by_time; }

    #sig_by_tick: ISortedMap<Tick, TimeSignatureInfo>;
    get sig_by_tick() { return this.#sig_by_tick; }

    #sig_by_time: ISortedMap<number, TimeSignatureInfo>;
    get sig_by_time() { return this.#sig_by_time; }

    constructor({res=24n, bpm, sig}: TimingConstructorArgs) {
        this.#res = res = BigInt(res);

        const bpm_infos: BPMInfo[] = createBpmInfos(res, bpm ?? []);

        this.#bpm_by_tick = new BTree<Tick, BPMInfo>(bpm_infos.map((info) => [info.tick, info]));
        this.#bpm_by_time = new BTree<number, BPMInfo>(bpm_infos.map((info) => [info.time, info]));

        const time_sig_infos: TimeSignatureInfo[] = createTimeSignatureInfos(res, this.bpm_by_tick, sig ?? []);

        this.#sig_by_tick = new BTree<Tick, TimeSignatureInfo>(time_sig_infos.map((info) => [info.tick, info]));
        this.#sig_by_time = new BTree<number, TimeSignatureInfo>(time_sig_infos.map((info) => [info.time, info]));
    }

    toString(): string {
        return `[Timing with ${this.#bpm_by_tick.size} bpm and ${this.#sig_by_tick.size} time_sig]`;
    }

    toJSON(): {res: bigint, bpm: Array<[Tick, number]>, sig: Array<[Tick, TimeSignature]>} {
        const bpm: Array<[Tick, number]> = [];
        for(const info of this.#bpm_by_tick.values()) {
            bpm.push([info.tick, info.bpm]);
        }

        const sig: Array<[Tick, TimeSignature]> = [];
        for(const info of this.#sig_by_tick.values()) {
            sig.push([info.tick, info.sig]);
        }

        return {
            res: this.#res,
            bpm, sig,
        };
    }

    /**
     * Converts an iterator of `[Tick, T]` into `[TimingInfo, T]`.
     * 
     * **WARNING**: since `TimingInfo` is reused for each iteration, be sure to copy it before reusing it.
     * 
     * @param it An iterator for pairs of `Tick` any any object.
     * @yields {[TimingInfo, T]} `it` but `Tick` replaced with the timing info
     */
    *withTimingInfo<T>(it: IterableIterator<[Tick, T]>): Generator<[Readonly<TimingInfo>, T]> {
        // TODO
    }

    /**
     * Iterate through all measures in the specified (half-closed) range.
     * A partially-included measure also counts.
     */
    *measures([r_begin, r_end]: TickRange): Generator<[Tick, MeasureInfo]> {
        // TODO
    }

    getMeasureInfoByTick(tick: Tick): MeasureInfo {
        // TODO
    }

    getMeasureInfoByIdx(measure_idx: MeasureIdx): MeasureInfo {
        // TODO
    }

    getTimeByTick(tick: Tick): number {
        let pair = this.#bpm_by_tick.nextLowerPair(tick + 1n);

        if(!pair) {
            pair = this.#bpm_by_tick.entries().next().value;
            if(!pair) throw new Error(`Invalid internal state (empty 'bpm_by_tick')`);
        }

        return getTimeFromBPMInfo(Number(this.#res), pair[1], tick);
    }
}