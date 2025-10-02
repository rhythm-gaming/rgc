import { type, Type } from 'arktype';

import { U8, I32, F64, Tick, Property } from './scalar.js';

const Coord = I32.or(F64);

export const Pos = Coord.array().or(Coord.pipe((v): [number] => [v])).pipe((v): number[] => v);
export type Pos = typeof Pos.infer;

export const FullNote = type({
    "t": Tick,
    "id?": 'string',
    "k?": 'string',

    "l?": Tick,
    "v?": Pos,
    "w?": Pos,
    "p?": Property,
}).onUndeclaredKey('reject');
export type FullNote = typeof FullNote.infer;

const PosTuple = type([Pos]).or(type([Pos, Pos])).narrow((v, ctx) => {
    if(v.length === 1) return true;

    if(v[0].length !== v[1].length) {
        return ctx.reject({
            expected: `w length same as v: ${v[0].length}`,
            actual: `${v[1].length}`,
            path: ['1'],
        });
    }

    return true;
});

type SimpleNoteArrayBaseType = []|[typeof PosTuple];
type SimpleNoteArrayPrefixType = [typeof Tick, ...SimpleNoteArrayBaseType]|['string', typeof Tick, ...SimpleNoteArrayBaseType];

function SimpleNoteWithPrefixOf(prefix_types: SimpleNoteArrayPrefixType) {
    const WithoutLength = type([...prefix_types, Property.optional()]);
    const WithLength = type([...prefix_types, Tick, Property.optional()]);

    return WithoutLength.or(WithLength).pipe((v, ctx) => {
        const w = [...v];

        let kind: string|null = null;
        let tick: Tick;
        let pos_tuple: typeof PosTuple.infer|null = null;
        let len: Tick|null = null;
        let props: Property|null = null;

        if(w.length < 1 || w.length > 5) {
            return ctx.error("unexpected parsed SimpleNote length");
        }

        if(typeof w[0] !== 'bigint') {
            kind = w.shift() as string;
        }

        do {
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

            if(w.length !== 1) return ctx.error("unexpected parsed SimpleNote contents");
            props = w[0] as Property;
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
}

function SimpleNoteOf(base_types: SimpleNoteArrayBaseType) {
    return SimpleNoteWithPrefixOf([Tick, ...base_types]).or(SimpleNoteWithPrefixOf(['string', Tick, ...base_types]));
}

const SimpleNote0DScalar = Tick.pipe((v) => ({t: v}));
const SimpleNote0DArray = SimpleNoteOf([]);
const SimpleNote0D = SimpleNote0DScalar.or(SimpleNote0DArray);

const SimpleNoteND = SimpleNoteOf([PosTuple]);
const SimpleNote = SimpleNote0D.or(SimpleNoteND);

export const Note = FullNote.or(SimpleNote).narrow((v: FullNote, ctx): v is FullNote => {
    if(v.v) {
        if(v.w && v.v.length !== v.w.length) {
            return ctx.reject({
                expected: `w length same as v: ${v.v.length}`,
                path: ['w'],
            });
        }
    } else if(v.w) {
        return ctx.reject({
            expected: "w must not exist as v does not",
            path: ['w'],
        })
    }

    return true;
});
export type Note = typeof Note.infer;

export const LaneGroup = type({
    "dim?": U8,
    "lane": Note.array().array(),
}).onUndeclaredKey('reject');
export type LaneGroup = typeof LaneGroup.infer;