import type { BPMInfo, MeasureInfo, Tick } from "./types";

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

export function createBpmInfos(res: Tick, sorted_bpm_list: Iterable<[tick: Tick, bpm: number]>): BPMInfo[] {
    const bpm_infos: BPMInfo[] = [];
    const res_num: number = Number(res);

    let base_tick: Tick = 0n;
    let base_time: number = 0;
    let last_bpm: number = 0;

    for(const [bpm_tick, bpm_value] of sorted_bpm_list) {
        if(!Number.isFinite(bpm_value) || bpm_value <= 0) {
            throw new Error(`Invalid BPM value (${bpm_value}) specified at tick=${bpm_tick}`);
        }

        if(last_bpm === 0) {
            last_bpm = bpm_value;
        }

        const tick_diff = bpm_tick - base_tick;
        const time_diff = Number(60000n * tick_diff) / (res_num * last_bpm);

        base_tick = bpm_tick;
        last_bpm = bpm_value;
        base_time += time_diff;

        bpm_infos.push({
            tick: base_tick,
            time: base_time,
            bpm: bpm_value,
        });
    }

    return bpm_infos;
}