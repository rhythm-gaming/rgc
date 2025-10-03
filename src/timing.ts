import { type } from 'arktype';

import { U16, I32, F64, Tick } from "./scalar.js";

export const TimeSignature = type([U16.narrow((v, ctx) => v > 0 || ctx.mustBe("positive")), U16]);
export type TimeSignature = typeof TimeSignature.infer;

function sortTickArray<T>(arr: Array<[Tick, T]>): Array<[Tick, T]> {
    arr.sort(([x], [y]) => x < y ? -1 : x > y ? 1 : 0);

    return arr;
}

export const BPMDef = type([Tick, F64]);
export type BPMDef = typeof BPMDef.infer;

export const BPMDefArray = BPMDef.array().pipe((v) => sortTickArray(v)).pipe((v): BPMDef[] => v.length > 0 ? v : [[0n, 120]]);
export type BPMDefArray<BPMDefType = BPMDef> = BPMDefType[];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _type_BPMDefArray: BPMDefArray = BPMDefArray.infer;

export const SigDef = type([Tick, TimeSignature]);
export type SigDef = typeof SigDef.infer;

export const SigDefArray = SigDef.array().pipe((v) => sortTickArray(v)).pipe((v): SigDef[] => v.length > 0 ? v : [[0n, [4, 4]]]);
export type SigDefArray<SigDefType = SigDef> = SigDefType[];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _type_SigDefArray: SigDefArray = SigDefArray.infer;

export const Timing = type({
    "offset": I32.default(0),
    "res": U16.default(24),
    "bpm": BPMDefArray.default(() => [[0n, 120]]),
    "sig": SigDefArray.default(() => [[0n, [4, 4]]]),
}).onUndeclaredKey('reject');

export type Timing<BPMDefType=BPMDef, SigDefType=SigDef> = Omit<typeof Timing.infer, 'bpm'|'sig'> & {
    bpm: BPMDefArray<BPMDefType>,
    sig: SigDefArray<SigDefType>,
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _type_Timing: Timing = Timing.infer;