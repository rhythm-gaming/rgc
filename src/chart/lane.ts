import { type ISortedMap, BTree } from "../sorted-btree.js";
import { type FixedSizeArray } from "../util.js";
import * as schema from "./schema.js";
import { Tick } from "../timing";

export type Pos<Dim extends number = number> = FixedSizeArray<number, Dim>;

export interface Note<Dim extends number = number> {
    tick: Tick;
    length: Tick;

    id?: string;
    kind?: string;

    pos: Pos<Dim>;
    pos_end?: Pos<Dim>;
}

function toPos<Dim extends number = number>(raw_pos: schema.Pos|undefined): [Dim, Pos<Dim>] {
    if(!raw_pos) {
        return [0 as Dim, [] as Pos<0> as Pos<Dim>];
    }

    if(Array.isArray(raw_pos)) {
        return [raw_pos.length as Dim, raw_pos as Pos<number> as Pos<Dim>];
    }

    return [1 as Dim, [raw_pos] as Pos<1> as Pos<Dim>];
}

export class Lane<Dim extends number = number> {
    #dim: Dim;
    get dim() { return this.#dim; }

    #notes: ISortedMap<Tick, Array<Note<Dim>>>;
    get notes() { return this.#notes; }

    constructor(notes: Iterable<schema.Note>, dim?: Dim) {
        const temp_notes = new Map<Tick, Array<Note<Dim>>>();
        for(const raw_note of notes) {
            const [curr_dim, pos] = toPos<Dim>(raw_note.v);
            if(dim === (void 0)) {
                dim = curr_dim;
            } else if(dim !== curr_dim) {
                throw new Error(`Dimension mismatch: expected dim=${dim}, but actual dim=${curr_dim} for t=${raw_note.t}`);
            }

            let pos_end: Pos<Dim>|undefined = void 0;
            if(raw_note.w) {
                const [curr_dim, out_pos_end] = toPos<Dim>(raw_note.w);
                
                // dim must not be undefined at this point
                if(dim !== curr_dim) {
                    throw new Error(`Dimension mismatch: expected dim=${dim}, but actual dim=${curr_dim} for t=${raw_note.t}`);
                }

                pos_end = out_pos_end;
            }

            const note: Note<Dim> = {
                tick: raw_note.t,
                length: raw_note.l ?? 0n,

                id: raw_note.id,
                kind: raw_note.k,

                pos, pos_end,
            };

            let arr = temp_notes.get(note.tick);
            if(!arr) {
                arr = [];
                temp_notes.set(note.tick, arr);
            }

            arr.push(note);
        }

        this.#notes = new BTree([...temp_notes.entries()]);
        this.#dim = dim ?? (0 as Dim);
    }

    toJSON(): schema.Note[] {
        const notes: schema.Note[] = [];

        for(const chord of this.#notes.values()) {
            for(const note of chord) {
                notes.push({
                    t: note.tick,
                    l: note.length,
                    id: note.id,
                    k: note.kind,
                    v: note.pos,
                    w: note.pos_end,
                });
            }
        }

        return notes;
    }
}

export interface ILaneGroup<Dim extends number = number> {
    id: string;
    dim: number;

    lanes: Lane<Dim>[];
    notes_by_id: Map<string, Note<Dim>>;
}

export class LaneGroup implements ILaneGroup {
    id: string = '';
    dim: number = 0;

    lanes: Lane[];
    notes_by_id = new Map<string, Note>;

    constructor(id: string, rawLaneGroup: schema.LaneGroup) {
        this.id = id;
        this.lanes = rawLaneGroup.lane ? rawLaneGroup.lane.map((lane) => new Lane(lane)) : [];

        let dim: number|undefined = rawLaneGroup.dim;
        const notes_by_id = new Map<string, Note>();
        for(const lane of this.lanes) {
            if(dim === (void 0)) dim = lane.dim;
            else if(dim !== lane.dim) throw new Error(`Lane dimensions do not match for lane group '${id}'!`);
    
            for(const notes of lane.notes.values()) {
                for(const note of notes) {
                    if(note.id !== (void 0)) {
                        notes_by_id.set(note.id, note);
                    }
                }
            }
        }

        this.dim = dim ?? 0;
    }

    toJSON(): schema.LaneGroup {
        return {
            dim: this.dim,
            lane: this.lanes.map((lane: Lane) => lane.toJSON()),
        };
    }
}