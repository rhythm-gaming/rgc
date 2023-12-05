import type { MeasureInfo, Tick } from "./types";

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