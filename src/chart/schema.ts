import { type, morph, union, arrayOf } from 'arktype';

function check<T>(checker: (value: T) => boolean, message: string): (value: T) => T {
    return (value: T) => {
        if(checker(value)) return value;
        else throw new Error(message);
    };
}

const coercedBigInt = union("bigint",
    union(
        morph("string", (s: string) => BigInt(s)),
        morph("number", (n: number) => BigInt(n)),
    )
);

const coercedNumber = type("number|parsedNumber");

const coercedInteger = union(
    "integer|parsedInteger",
    morph("bigint", (x: bigint) => check<number>(Number.isSafeInteger, "Out-of-bounds BigInt!")(Number(x))),
);

// Header

export const header = type({
    "version?": "string",
    "editor?": "string",
    "game?": "string",
});
export type Header = typeof header.infer;

// Metadata

export const metadataResource = type({
    "author?": "string",
    "path?": "string",
});
export type MetadataResource = typeof metadataResource.infer;

export const metadata = type({
    "title?": "string",
    "music?": metadataResource,
    "chart?": metadataResource,
    "jacket?": metadataResource,
});
export type Metadata = typeof metadata.infer;

// Timing

export const tick = coercedBigInt;
export type Tick = typeof tick.infer;

export const timeSignature = morph(type([coercedInteger, coercedInteger]), check(([num, den]: [number, number]) => num > 0 && den > 0, "Invalid time signature!"));
export type TimeSignature = typeof timeSignature.infer;

export const timing = type({
    "offset?": coercedInteger,
    "res?": "number",
    "bpm?:": [[tick, morph(coercedNumber, check((n: number) => Number.isFinite(n) && n > 0, "BPM must be positive!"))], '[]'],
    "sig?:": [[tick, timeSignature], '[]'],
});
export type Timing = typeof timing.infer;

// Note

export const coord = coercedNumber;
export type Coord = typeof coord.infer;

export const pos = union(arrayOf(coord), coord);
export type Pos = typeof pos.infer;

export const note = type({
    "t": tick,
    "id?": "string",
    "k?": "string",
    "l?": tick,
    "v?": pos,
    "w?": pos,
    "p?": "object",
});
export type Note = typeof note.infer;

const noteAsArray = morph(type("unknown[]"), (values: unknown[]): Note => {
    if(values.length === 0) throw new Error("Empty array can't be used for representing a note.");

    const note: Note = {
        t: 0n,
    };

    let i = 0;
    if(typeof values[0] === 'string') {
        note.k = values[0];
        ++i;
    }

    if(typeof values[i] !== 'number') {
        throw new Error("Tick was unspecified!");
    }

    note.t = BigInt(values[i++] as number);

    if(Array.isArray(values[i])) {
        const coords = values[i++] as unknown[];
        if(coords.length == 0) throw new Error("Invalid pos specified!");

        const parsed_v = pos(coords[0]);
        parsed_v.problems?.throw();
        note.v = parsed_v.data;

        if(coords.length > 1) {
            const parsed_w = pos(coords[1]);
            parsed_w.problems?.throw();
            note.w = parsed_w.data;
        }
    }

    if(i < values.length && typeof values[i] !== 'object') {
        const parsed_l = tick(values[i++]);
        parsed_l.problems?.throw();

        note.l = parsed_l.data;
    }

    if(typeof values[i] === 'object') {
        note.p = values[i] as object;
    }

    return note;
});

const noteAsTick = morph(tick, (t: bigint): Note => ({t}));

const coercedNote = union(noteAsTick, morph(type("object|unknown[]"), (value: object|unknown[]): Note => {
    let parsed;
    if(Array.isArray(value)) {
        parsed = noteAsArray(value);
    } else {
        parsed = note(value);
    }

    parsed.problems?.throw();

    if(!parsed.data) throw new Error("Unknown parse error!");
    return parsed.data;
}));

export const laneGroup = type({
    "dim?": morph(coercedInteger, check((n: number) => n >= 0, "Invalid LaneGroup dimension!")),
    "lane?": arrayOf(arrayOf(coercedNote)),
});
export type LaneGroup = typeof laneGroup.infer;

// Top-Level

export const chart = type({
    "header?": header,
});
export type Chart = typeof chart.infer;