import { type, type Type, type Out } from 'arktype';

import type { ArrayArkType, BigIntLikeArkType, DefaultArkType, DefaultRaw, FloatLikeArkType, PipeArkType } from './type-util';
import { U16, I32, F64, Tick } from "./scalar.js";

export const TimeSignature: Type<[BigIntLikeArkType, BigIntLikeArkType]> =
    type([U16.narrow((v, ctx) => v > 0 || ctx.mustBe("positive")).pipe((v) => BigInt(v)), U16.pipe((v) => BigInt(v))]);
export type TimeSignature = typeof TimeSignature.infer;

function sortTickArray<T>(arr: Array<[Tick, T]>): Array<[Tick, T]> {
    arr.sort(([x], [y]) => x < y ? -1 : x > y ? 1 : 0);

    return arr;
}

type BPMDefArkType = [BigIntLikeArkType, FloatLikeArkType];
export const BPMDef: Type<BPMDefArkType> = type([Tick, F64]);
export type BPMDef = typeof BPMDef.infer;

export type BPMDefArray<BPMDefType = BPMDef> = BPMDefType[];
export const BPMDefArray: Type<ArrayArkType<typeof BPMDef>> = BPMDef.array().pipe((v) => sortTickArray(v)).pipe((v): BPMDef[] => v.length > 0 ? v : [[0n, 120]]);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _type_BPMDefArray: BPMDefArray = BPMDefArray.infer;

type SigDefArkType = [BigIntLikeArkType, [BigIntLikeArkType, BigIntLikeArkType]];
export const SigDef: Type<SigDefArkType> = type([Tick, TimeSignature]);
export type SigDef = typeof SigDef.infer;

export type SigDefArray<SigDefType = SigDef> = SigDefType[];
export const SigDefArray: Type<ArrayArkType<typeof SigDef>> = SigDef.array().pipe((v) => sortTickArray(v)).pipe((v): SigDef[] => v.length > 0 ? v : [[0n, [4n, 4n]]]);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _type_SigDefArray: SigDefArray = SigDefArray.infer;

export interface Timing<BPMDefType=BPMDef, SigDefType=SigDef> {
    offset: number;
    res: bigint;
    bpm: BPMDefArray<BPMDefType>,
    sig: SigDefArray<SigDefType>,
};

export interface TimingArkType {
    offset: DefaultRaw<number, 0> | ((In: DefaultRaw<string | bigint, 0>) => Out<number>);
    res: DefaultArkType<Type<PipeArkType<typeof U16, bigint>>, 24n>;
    bpm: DefaultArkType<typeof BPMDefArray, [[0n, 120]]>;
    sig: DefaultArkType<typeof SigDefArray, [[0n, [4n, 4n]]]>;
}

export const Timing: Type<TimingArkType> = type({
    "offset": I32.default(0),
    "res": U16.pipe((n) => BigInt(n)).default(24n),
    "bpm": BPMDefArray.default(() => [[0n, 120]]),
    "sig": SigDefArray.default(() => [[0n, [4n, 4n]]]),
}).onUndeclaredKey('reject');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _type_Timing: Timing = Timing.infer;
