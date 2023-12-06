import { default as BTree, type ISortedMap } from 'sorted-btree';

import type { BPMInfo, Tick, TimeSignature, TimeSignatureInfo } from './types';
import { createBpmInfos, createTimeSignatureInfos } from './util';

export interface TimingConstructorArgs {
    res?: number|bigint;
    bpm: Iterable<[tick: Tick, bpm: number]>;
    sig: Iterable<[tick: Tick, time_signature: TimeSignature]>;
}

/**
 * Class for managing timing information of a chart.
 * 
 * **IMPORTANT: Chart offsets must be handled manually**, as all times are relative to the beginning of the chart (tick = 0).
 */
export class Timing {
    resolution: bigint = 24n;

    bpm_by_tick: ISortedMap<Tick, BPMInfo>;
    bpm_by_time: ISortedMap<number, BPMInfo>;

    sig_by_tick: ISortedMap<Tick, TimeSignatureInfo>;
    sig_by_time: ISortedMap<number, TimeSignatureInfo>;

    constructor({res=24n, bpm, sig}: TimingConstructorArgs) {
        this.resolution = res = BigInt(res);

        const bpm_infos: BPMInfo[] = createBpmInfos(res, bpm);

        this.bpm_by_tick = new BTree<Tick, BPMInfo>(bpm_infos.map((info) => [info.tick, info]));
        this.bpm_by_time = new BTree<number, BPMInfo>(bpm_infos.map((info) => [info.time, info]));

        const time_sig_infos: TimeSignatureInfo[] = createTimeSignatureInfos(res, this.bpm_by_tick, sig);

        this.sig_by_tick = new BTree<Tick, TimeSignatureInfo>(time_sig_infos.map((info) => [info.tick, info]));
        this.sig_by_time = new BTree<number, TimeSignatureInfo>(time_sig_infos.map((info) => [info.time, info]));
    }
}