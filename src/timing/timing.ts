import { BTree, type ISortedMap } from "../sorted-btree.js";

import type { BPMInfo, MeasureIdx, MeasureInfo, Tick, TickRange, TimeSignature, TimeSignatureInfo, TimingInfo } from './types';
import { createBpmInfos, createMeasureInfo, createTimeSignatureInfos, getTimeFromBPMInfo, updateMeasureInfoTick } from "./util.js";

interface TimingIterators {
    bpm: Iterator<[Tick, Readonly<BPMInfo>]>;
    sig: Iterator<[Tick, Readonly<TimeSignatureInfo>]>;
}

interface TimingStatus {
    bpm: Readonly<[Tick, BPMInfo]>;
    sig: Readonly<[Tick, TimeSignatureInfo]>;
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
 * Offsets are not taken into account.
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

    #sig_by_measure_idx: ISortedMap<MeasureIdx, TimeSignatureInfo>;
    get sig_by_measure_idx() { return this.#sig_by_measure_idx; }

    constructor({res=24n, bpm, sig}: TimingConstructorArgs) {
        this.#res = res = BigInt(res);
        if(res <= 0n) {
            throw new Error(`Invalid res=${res}`);
        }

        const bpm_infos: BPMInfo[] = createBpmInfos(res, bpm ?? []);

        this.#bpm_by_tick = new BTree<Tick, BPMInfo>(bpm_infos.map((info) => [info.tick, info]));
        this.#bpm_by_time = new BTree<number, BPMInfo>(bpm_infos.map((info) => [info.time, info]));

        const time_sig_infos: TimeSignatureInfo[] = createTimeSignatureInfos(res, this.bpm_by_tick, sig ?? []);

        this.#sig_by_tick = new BTree<Tick, TimeSignatureInfo>(time_sig_infos.map((info) => [info.tick, info]));
        this.#sig_by_measure_idx = new BTree<MeasureIdx, TimeSignatureInfo>(time_sig_infos.map((info) => [info.measure_idx, info]));
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
     * Get time (in milliseconds) from ticks.
     */
    getTimeByTick(tick: Tick): number {
        let pair = this.#bpm_by_tick.nextLowerPair(tick + 1n);

        if(!pair) {
            pair = this.#bpm_by_tick.entries().next().value;
            if(!pair) throw new Error(`Invalid internal state (empty 'bpm_by_tick')`);
        }

        return getTimeFromBPMInfo(this.#res, pair[1], tick);
    }
    
    /**
     * Get information about the measure containing the specied tick.
     */
    getMeasureInfoByTick(tick: Tick): Readonly<MeasureInfo> {
        let pair = this.#sig_by_tick.nextLowerPair(tick + 1n);
        if(!pair) {
            pair = this.#sig_by_tick.entries().next().value;
            if(!pair) throw new Error(`Invalid internal state (empty 'sig_by_tick')`);
        }

        const measure_info: MeasureInfo = createMeasureInfo(this.#res, pair[1]);
        
        updateMeasureInfoTick(measure_info, tick);
        
        return measure_info;
    }

    /**
     * Get information about the measure specified with its index.
     */
    getMeasureInfoByIdx(measure_idx: MeasureIdx): Readonly<MeasureInfo> {
        let pair = this.#sig_by_measure_idx.nextLowerPair(measure_idx + 1n);
        if(!pair) {
            pair = this.#sig_by_measure_idx.entries().next().value;
            if(!pair) throw new Error(`Invalid internal state (empty 'sig_by_measure_idx')`);
        }

        const measure_info: MeasureInfo = createMeasureInfo(this.#res, pair[1]);

        measure_info.tick += measure_info.full_length * (measure_idx - measure_info.idx);
        measure_info.idx = measure_idx;

        return measure_info;
    }

    /**
     * Converts an iterator of `[Tick, T]` into `[TimingInfo, T]`.
     * 
     * **WARNING**: `TimingInfo` and `MeasureInfo` are reused for each iteration. Be sure to copy them before reusing it.
     * 
     * @param it An iterator for pairs of `Tick` any any object.
     * @yields {[TimingInfo, T]} `it` but `Tick` replaced with the timing info
     */
    *withTimingInfo<T>(it: IterableIterator<[Tick, T]>): Generator<[Readonly<TimingInfo>, T]> {
        let iterators: TimingIterators|null = null;
        let curr_status: TimingStatus|null = null;
        let next_status: Partial<TimingStatus> = {};

        const timing_info: TimingInfo = {
            tick: 0n, time: 0, bpm: 0,
            measure: {
                idx: 0n, tick: 0n, sig: [4, 4],
                full_length: 0n, beat_length: 0n,
            },
        };

        for(const [tick, data] of it) {
            if(iterators === null) {
                const prev_bpm_tick = this.#bpm_by_tick.nextLowerKey(tick+1n);
                const prev_sig_tick = this.#sig_by_tick.nextLowerKey(tick+1n);

                if(prev_bpm_tick == null || prev_sig_tick == null) {
                    throw new Error(`Invalid initial state at tick=${tick}!`);
                }

                iterators = {
                    bpm: this.#bpm_by_tick.entries(prev_bpm_tick),
                    sig: this.#sig_by_tick.entries(prev_sig_tick),
                };

                curr_status = {
                    bpm: iterators.bpm.next().value,
                    sig: iterators.sig.next().value,
                };

                next_status = {
                    bpm: iterators.bpm.next().value,
                    sig: iterators.sig.next().value,
                };

                timing_info.bpm = curr_status.bpm[1].bpm;
                timing_info.measure = createMeasureInfo(this.#res, curr_status.sig[1]);
            }

            if(iterators == null || curr_status == null || timing_info.measure == null) {
                throw new Error(`BUG: Invalid internal state at tick=${tick}!`);
            }

            while(next_status.bpm && next_status.bpm[0] <= tick) {
                curr_status.bpm = next_status.bpm;
                next_status.bpm = iterators.bpm.next().value;

                timing_info.bpm = curr_status.bpm[1].bpm;
            }

            while(next_status.sig && next_status.sig[0] <= tick) {
                curr_status.sig = next_status.sig;
                next_status.sig = iterators.sig.next().value;

                timing_info.measure = createMeasureInfo(this.#res, curr_status.sig[1]);
            }

            updateMeasureInfoTick(timing_info.measure, tick);

            timing_info.tick = tick;
            timing_info.time = getTimeFromBPMInfo(this.#res, curr_status.bpm[1], tick);

            yield [timing_info, data];
        }
    }

    /**
     * Iterate through all measures in the specified (half-closed) range.
     * A partially-included measure also counts.
     * 
     * **WARNING**: `MeasureInfo` are reused for each iteration. Be sure to copy them before reusing it.
     */
    *measures([r_begin, r_end]: TickRange): Generator<MeasureInfo> {
        const it = this.#sig_by_tick.entries(this.#sig_by_tick.nextLowerKey(r_begin+1n) ?? 0n);

        let curr_info: [Tick, TimeSignatureInfo] = it.next().value;
        let next_info: [Tick, TimeSignatureInfo]|undefined = it.next().value;

        while(next_info && next_info[0] < r_end) {
            const measure_info = createMeasureInfo(this.#res, curr_info[1]);
            updateMeasureInfoTick(measure_info, r_begin);

            for(let idx = measure_info.idx; idx < next_info[1].measure_idx; ++idx) {
                yield measure_info;
                ++measure_info.idx;
                measure_info.tick += measure_info.full_length;
            }

            curr_info = next_info;
            next_info = it.next().value;
        }

        const measure_info = createMeasureInfo(this.#res, curr_info[1]);
        while(measure_info.tick < r_end) {
            yield measure_info;
            ++measure_info.idx;
            measure_info.tick += measure_info.full_length;
        }
    }
}