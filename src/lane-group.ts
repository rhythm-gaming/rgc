import { type, match, ArkErrors, type ArkError } from 'arktype';

import { exportType } from "./type-util.js";
import { U8, Coord, Tick, NumberTick, Property, checkIsRecord } from "./scalar.js";

// Last pipe was added for `tsc` to simplify the deduced type of `Pos`.
export const Pos = exportType(Coord.array().or(Coord.pipe((v) => [v])).pipe((v): number[] => v));
export type Pos = typeof Pos.infer;

export const FullNote = exportType(type({
    "t": Tick,
    "id?": 'string',
    "k?": 'string',

    "l?": Tick,
    "v?": Pos,
    "w?": Pos,
    "p?": Property,
}).onUndeclaredKey('ignore').narrow(checkIsRecord).narrow((v, ctx) => {
    if(v.v) {
        if(v.w) {
            if(v.v.length !== v.w.length) {
                return ctx.reject({
                    expected: `w length same as v: ${v.v.length}`,
                    actual: `${v.w.length}`,
                    path: ['w'],
                });
            }
        }
    } else if(v.w?.length) {
        return ctx.reject({
            expected: `w should not present when v doesn't`,
            path: ['w'],
        });
    }

    return true;
}));
export type FullNote = typeof FullNote.infer;

export const PosTuple = exportType(type.or([Pos], [Pos, Pos]).narrow((v, ctx) => {
    // ArkType seems to suffer from a bug involving nested types.
    // Manually apply unapplied pipes to mitigate from this bug.
    for(let i=0; i<v.length; ++i) {
        if(!Array.isArray(v[i])) v[i] = [v[i] as unknown as number];
    }

    if(v.length === 1) return true;

    if(v[0].length !== v[1].length) {
        return ctx.reject({
            expected: `w length same as v: ${v[0].length}`,
            actual: `${v[1].length}`,
            path: ['1'],
        });
    }

    return true;
}));
export type PosTuple = typeof PosTuple.infer;

const SimpleNoteScalar = Tick.pipe((v): FullNote => ({t: v}));
const SimpleNoteArray = match({})
    .case(type.or("string", PosTuple, NumberTick), (v) => v)
    .case(Property, (v) => v)
    .default("reject")
    .array().atLeastLength(1).atMostLength(5)
    .narrow((v): v is Array<Exclude<(typeof v)[number], ReadonlyArray<ArkError>>> => v.every((x) => !(x instanceof ArkErrors)))
    .pipe((v, ctx) => {
        const w = [...v];

        let kind: string|null = null;
        let tick: Tick;
        let pos_tuple: typeof PosTuple.infer|null = null;
        let len: Tick|null = null;
        let props: Property|null = null;

        if(w.length < 1 || w.length > 5) {
            return ctx.error("unexpected parsed SimpleNote length");
        }

        switch(typeof w[0]) {
            case 'bigint': break;
            case 'string': kind = w.shift() as string; break;
            default: return ctx.error(`unexpected first SimpleNote type: ${typeof w[0]}`);
        }

        do {
            if(typeof w[0] !== 'bigint') return ctx.error(`unexpected SimpleNote tick type: ${typeof w[0]}`);
            tick = w.shift() as Tick;
            if(w.length === 0) break;
            
            if(Array.isArray(w[0])) {
                pos_tuple = w.shift() as typeof PosTuple.infer;
                if(w.length === 0) break;
            }

            if(typeof w[0] === 'bigint') {
                len = w.shift() as bigint;
                if(w.length === 0) break;
            }

            if(w.length !== 1) return ctx.error("unexpected excessive SimpleNote contents");

            const last_value = w[0] as (typeof v[0]);
            if(typeof last_value !== 'object') return ctx.error(`unexpected last SimpleNote type: ${typeof last_value}`);
            if(Array.isArray(last_value)) return ctx.error(`unexpected last SimpleNote type: array`);

            props = last_value;
        // eslint-disable-next-line no-constant-condition
        } while(false);

        const ret_obj: FullNote = {
            t: tick,
        };

        if(kind != null) ret_obj.k = kind;

        if(pos_tuple != null) {
            ret_obj.v = pos_tuple[0];

            if(pos_tuple.length > 1) {
                ret_obj.w = pos_tuple[1] as Pos;
            }
        }
        
        if(len != null) {
            ret_obj.l = len;
        }

        if(props != null) {
            ret_obj.p = props;
        }

        return ret_obj;
});

const ObjectNote = type("Array|object").pipe((v) => Array.isArray(v) ? SimpleNoteArray(v) : FullNote(v));

export const Note = exportType(SimpleNoteScalar.or(ObjectNote));
export type Note = typeof Note.infer;

export const NoteLane = exportType(Note.array().pipe((v): FullNote[] => {
    v.sort((x, y) => x.t < y.t ? -1 : x.t > y.t ? 1 : 0);
    return v;
}));
export type NoteLane = typeof NoteLane.infer;

export const LaneGroup = exportType(type({
    "dim?": U8,
    "lane": NoteLane.array(),
}).onUndeclaredKey('ignore'));
export type LaneGroup = typeof LaneGroup.infer;
