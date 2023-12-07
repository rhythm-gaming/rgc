import type { ISortedMap } from "sorted-btree";
import type { BPMInfo, MeasureIdx, MeasureInfo, Tick, TimeSignature, TimeSignatureInfo } from "./types";

export function createMeasureInfo(res: Tick, idx: MeasureIdx, tick: Tick, sig: Readonly<TimeSignature>): MeasureInfo {
    const sig_num = BigInt(sig[0]);
    const sig_den = BigInt(sig[1]);

    let beat_length = 4n * res;
    if(beat_length % sig_den !== 0n) {
        throw new Error(`res=${res} and sig=${sig} are not compatible!`);
    }

    beat_length /= sig_den;

    return {
        idx, tick,
        sig: [sig[0], sig[1]],
        full_length: beat_length * sig_num,
        beat_length,
    };
}

/**
 * Compute time (in millisecond) from tick, based on BPM information.
 * @param res Resolution (ticks per quarter note)
 * @param bpm_info BPM information (assumed to be unchanging)
 * @param tick Tick
 */
export function getTimeFromBPMInfo(res: Tick, bpm_info: BPMInfo, tick: Tick): number {
    return bpm_info.time + Number(60000n * (tick - bpm_info.tick)) / (Number(res) * bpm_info.bpm);
}

export function getMeasureIdxFromTimeSignatureInfo(res: Tick, {tick: base_tick, measure_idx, sig}: TimeSignatureInfo, tick: Tick, round_up: boolean = false): MeasureIdx {
    const sig_num = BigInt(sig[0]);
    const sig_den = BigInt(sig[1]);

    let measure_ticks = 4n*res*sig_num;
    if(measure_ticks % sig_den !== 0n) {
        throw new Error(`res=${res} and sig=${sig} are not compatible!`);
    }

    measure_ticks /= sig_den;

    if(round_up) {
        if(tick >= base_tick) {
            return measure_idx + (tick - base_tick + measure_ticks - 1n) / measure_ticks;
        } else {
            return measure_idx - (base_tick - tick) / measure_ticks;
        }
    } else {
        if(tick >= base_tick) {
            return measure_idx + (tick - base_tick) / measure_ticks;
        } else {
            return measure_idx - (base_tick - tick + measure_ticks - 1n) / measure_ticks;
        }
    }
}

/**
 * Adjusts `measure_info.tick` to be `tick`.
 * It is assumed that the new measure is still in the same timing segment.
 * @param measure_info The measure info to be updated.
 * @param tick Offset in ticks. Automatically quantized by `measure_info.full_len`.
 */
export function updateMeasureInfoTick(measure_info: MeasureInfo, tick: Tick): void {
    const {tick: base_tick, full_length} = measure_info;
    const diff_idx = tick >= base_tick ?
        (tick - base_tick) / full_length :
        -((base_tick) / full_length);
    measure_info.idx += diff_idx;
    measure_info.tick += diff_idx * full_length;
}

/**
 * Create an array of `BPMInfo` based on sorted list of BPMs.
 */
export function createBpmInfos(res: Tick, sorted_bpm_list: Iterable<[tick: Tick, bpm: number]>): BPMInfo[] {
    const bpm_infos: BPMInfo[] = [];

    const last_bpm_info: BPMInfo = {
        tick: 0n, time: 0, bpm: 0,
    };

    for(const [bpm_tick, bpm_value] of sorted_bpm_list) {
        if(!Number.isFinite(bpm_value) || bpm_value <= 0) {
            throw new Error(`Invalid BPM value (${bpm_value}) specified at tick=${bpm_tick}`);
        }

        if(bpm_tick > 0n) {
            last_bpm_info.time += getTimeFromBPMInfo(res, last_bpm_info, bpm_tick);
            last_bpm_info.tick = bpm_tick;
        }

        last_bpm_info.bpm = bpm_value;

        bpm_infos.push({...last_bpm_info});
    }

    if(bpm_infos.length === 0) {
        bpm_infos.push({tick: 0n, time: 0, bpm: 120});
    }

    return bpm_infos;
}

/**
 * Create an array of `TimeSignatureInfo` based on sorted list of BPMs.
 */
export function createTimeSignatureInfos(res: Tick, bpm_by_tick: ISortedMap<Tick, BPMInfo>, sorted_sig_list: Iterable<[tick: Tick, sig: TimeSignature]>): TimeSignatureInfo[] {
    const time_sig_info: TimeSignatureInfo[] = [];

    const bpm_it = bpm_by_tick.entries();
    let curr_bpm = bpm_it.next();

    if(curr_bpm.done) {
        throw new Error(`Empty BPM info is not permitted!`);
    }

    let next_bpm = bpm_it.next();
    
    const last_time_sig_info: TimeSignatureInfo = {
        tick: 0n, time: 0, sig: [4, 4], measure_idx: 0n,
    };

    for(const [tick, sig] of sorted_sig_list) {
        while(!next_bpm.done && next_bpm.value[0] <= tick) {
            curr_bpm = next_bpm;
            next_bpm = bpm_it.next();
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, bpm_info] = curr_bpm.value;

        if(tick > 0n) {
            last_time_sig_info.time = getTimeFromBPMInfo(res, bpm_info, tick);
            last_time_sig_info.measure_idx = getMeasureIdxFromTimeSignatureInfo(res, last_time_sig_info, tick, true);
        }

        last_time_sig_info.sig = [...sig];

        time_sig_info.push({...last_time_sig_info});
    }

    if(time_sig_info.length === 0) {
        time_sig_info.push({tick: 0n, time: 0, sig: [4, 4], measure_idx: 0n})
    }

    return time_sig_info;
}