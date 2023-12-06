import type { ISortedMap } from "sorted-btree";
import type { BPMInfo, MeasureInfo, Tick, TimeSignature, TimeSignatureInfo } from "./types";

/**
 * Compute time (in millisecond) from tick, based on BPM information.
 * @param res_num Resolution (ticks per quarter note)
 * @param bpm_info BPM information (assumed to be unchanging)
 * @param tick Tick
 */
export function getTimeFromBPMInfo(res_num: number, bpm_info: BPMInfo, tick: Tick): number {
    return bpm_info.time + Number(60000n * (tick - bpm_info.tick)) / (res_num * bpm_info.bpm);
}

/**
 * Adjusts `measure_info.idx` and `measure_info.tick` by `tick`.
 * It is assumed that the new measure is still in the same timing segment.
 * @param measure_info The measure info to be updated.
 * @param tick Offset in ticks. Should be multiples of `measure_info.length`.
 */
export function updateMeasureInfo(measure_info: MeasureInfo, tick: Tick): void {
    const diff_idx = tick >= measure_info.tick ?
        (tick - measure_info.tick) / measure_info.length :
        -((measure_info.tick - tick) / measure_info.length);
    measure_info.idx += diff_idx;
    measure_info.tick += diff_idx * measure_info.length;
}

/**
 * Create an array of `BPMInfo` based on sorted list of BPMs.
 */
export function createBpmInfos(res: Tick, sorted_bpm_list: Iterable<[tick: Tick, bpm: number]>): BPMInfo[] {
    const bpm_infos: BPMInfo[] = [];
    const res_num: number = Number(res);

    const last_bpm_info: BPMInfo = {
        tick: 0n, time: 0, bpm: 0,
    };

    for(const [bpm_tick, bpm_value] of sorted_bpm_list) {
        if(!Number.isFinite(bpm_value) || bpm_value <= 0) {
            throw new Error(`Invalid BPM value (${bpm_value}) specified at tick=${bpm_tick}`);
        }

        if(last_bpm_info.bpm === 0) {
            last_bpm_info.bpm = bpm_value;
            // tick and time fixed to be 0 (first BPM)
        } else {
            last_bpm_info.time += getTimeFromBPMInfo(res_num, last_bpm_info, bpm_tick);
            last_bpm_info.bpm = bpm_value;
            last_bpm_info.tick = bpm_tick;
        }

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
    const res_num: number = Number(res);

    const bpm_it = bpm_by_tick.entries();
    let curr_bpm = bpm_it.next();

    if(curr_bpm.done) {
        throw new Error(`Empty BPM info is not permitted!`);
    }

    let next_bpm = bpm_it.next();

    for(const [tick, sig] of sorted_sig_list) {
        while(!next_bpm.done && next_bpm.value[0] <= tick) {
            curr_bpm = next_bpm;
            next_bpm = bpm_it.next();
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, bpm_info] = curr_bpm.value;

        time_sig_info.push({
            tick,
            time: getTimeFromBPMInfo(res_num, bpm_info, tick),
            sig: [...sig],
        });
    }

    if(time_sig_info.length === 0) {
        time_sig_info.push({tick: 0n, time: 0, sig: [4, 4]})
    }

    return time_sig_info;
}