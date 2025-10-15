import { type } from 'arktype';

import { exportType } from "./type-util.js";
import { U16, I32, F64, Tick } from "./scalar.js";

export const TimeSignature = exportType(
    type([U16.narrow((v, ctx) => v > 0 || ctx.mustBe("positive")).pipe((v) => BigInt(v)), U16.pipe((v) => BigInt(v))])
);
export type TimeSignature = typeof TimeSignature.infer;

function sortTickArray<T>(arr: Array<[Tick, T]>): Array<[Tick, T]> {
    arr.sort(([x], [y]) => x < y ? -1 : x > y ? 1 : 0);

    return arr;
}

export const BPMDef = exportType(type([Tick, F64.narrow((v) => v > 0)]));
export type BPMDef = typeof BPMDef.infer;

export const BPMDefArray = exportType(BPMDef.array().pipe((v) => sortTickArray(v)).pipe((v): BPMDef[] => v.length > 0 ? v : [[0n, 120]]));
export type BPMDefArray = typeof BPMDefArray.infer;

export const SigDef = exportType(type([Tick, TimeSignature]));
export type SigDef = typeof SigDef.infer;

export const SigDefArray = exportType(SigDef.array().pipe((v) => sortTickArray(v)).pipe((v): SigDef[] => v.length > 0 ? v : [[0n, [4n, 4n]]]));
export type SigDefArray = typeof SigDefArray.infer;

export const Timing = exportType(type({
    "offset": I32.default(0),
    "res": U16.pipe((n) => BigInt(n)).default(24),
    "bpm": BPMDefArray.default(() => [[0n, 120]]),
    "sig": SigDefArray.default(() => [[0n, [4n, 4n]]]),
}).onUndeclaredKey('ignore'));
export type Timing = typeof Timing.infer;