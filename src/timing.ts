import { type } from 'arktype';

import { U16, I32, F64, Tick } from "./scalar.js";

export const TimeSignature = type([U16, U16]);
export type TimeSignature = typeof TimeSignature.infer;

export const Timing = type({
    "offset": I32.default(0),
    "res": U16.default(24),
    "bpm": type([Tick, F64]).array().pipe((v) => v.length > 0 ? v : [[0, 120]]).default(() => [[0, 120]]),
    "sig": type([Tick, TimeSignature]).array().pipe((v) => v.length > 0 ? v : [[0, [4, 4]]]).default(() => [[0, [4, 4]]]),
}).onUndeclaredKey('reject');
export type Timing = typeof Timing.infer;