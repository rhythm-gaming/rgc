import { type } from 'arktype';
import { U16, I32, F64, Tick } from "./scalar.js";
import { exportType, type PublicType } from "./type-util.js";

export type TimeSignature = [bigint, bigint];
export const TimeSignature: PublicType<TimeSignature> = exportType(
    type([U16.narrow((v, ctx) => v > 0 || ctx.mustBe("positive")).pipe((v) => BigInt(v)), U16.pipe((v) => BigInt(v))])
);

function sortTickArray<T>(arr: Array<[Tick, T]>): Array<[Tick, T]> {
    arr.sort(([x], [y]) => x < y ? -1 : x > y ? 1 : 0);

    return arr;
}

export type BPMDef = [Tick, F64];
export const BPMDef: PublicType<BPMDef> = exportType(type([Tick, F64.narrow((v) => v > 0)]));

export type BPMDefArray = BPMDef[];
export const BPMDefArray: PublicType<BPMDefArray> = exportType(BPMDef.array().pipe((v) => sortTickArray(v)).pipe((v): BPMDef[] => v.length > 0 ? v : [[0n, 120]]));

export type SigDef = [Tick, TimeSignature];
export const SigDef: PublicType<SigDef> = exportType(type([Tick, TimeSignature]));

export type SigDefArray = SigDef[];
export const SigDefArray: PublicType<SigDefArray> = exportType(SigDef.array().pipe((v) => sortTickArray(v)).pipe((v): SigDef[] => v.length > 0 ? v : [[0n, [4n, 4n]]]));

export interface Timing {
    offset: I32;
    res: bigint;
    bpm: BPMDefArray;
    sig: SigDefArray;
}

export const Timing: PublicType<Timing> = exportType(type({
    "offset": I32.default(0),
    "res": U16.pipe((n) => BigInt(n)).default(24),
    "bpm": BPMDefArray.default(() => [[0n, 120]]),
    "sig": SigDefArray.default(() => [[0n, [4n, 4n]]]),
}).onUndeclaredKey('ignore'));