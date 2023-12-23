# RGC chart file format

Current version: `0.1.0-alpha-2`

## Introduction

The RGC ("rhythm game chart") file format is a JSON-based chart format for rhythm games. The RGC format aims to be able to represent charts from many different rhythm games.

The RGC format is inspired by [m4saka's KSON format](https://github.com/kshootmania/ksm-chart-format/blob/master/kson_format.md) for Sound Voltex charts and [the bmson format](https://bmson-spec.readthedocs.io/en/master/doc/index.html). The RGC format aims to be easily convertible to and from either formats. However, it's not a goal for the RGC format to be compatible to either formats.

### Goals

* Able to support as many rhythm games as possible.
* Easily convertible to/from as many rhythm game chart formats as possible.
* Enables quick prototyping of new rhythm games.

### Non-goals

* Aims to be "the standard format" for any particular rhythm game.
  * In particular, the RGC format does not try to replace either KSON or bmson.
* Specifies "the standard form" of any particular rhythm game.
  * In other words, there can be multiple equally-valid representations of a particular chart.
  * For several rhythm games, suggestions will be provided.

## Specification

### Overview

An RGC chart file consists of four parts:

1. Header
    * Metadata for the RGC chart file.
    * Headers are independent of chart contents.
2. Metadata
    * Metadata for the chart, such as information about musics and jacket images involved.
    * Metadata is independent of gameplay.
3. Timing
    * BPM and time signature changes.
    * Scroll speed changes are *not* included.
4. Notes (including auxillary data)
    * Objects or events with temporal positions.
    * Notes are grouped into lanes.
    * The RGC format does not distinguish between notes and auxillary data.
      * For example, there are various kinds of auxillary data in Sound Voltex, including camera angle changes and layer information.
      * However, as far as RGC chart format is concerned, those are represented as if they are just another kinds of notes.

#### Lanes

Lanes and lane groups are important concepts for the RGC format.

Notes are represented as a collection of *lanes*. Each *lane* contains homogeneous collection of data, and placements of notes in different lanes are independent.

Types of notes' positions on one lane are identical, and \# of coordinates constituting notes' position on a lane is called the *dimension* of the lane.

There can be many lanes with homogeneous properties. A collection of lanes with homogeneous properties is called a *lane group*.

Here are a few examples of lane groups.

* **Pop'n Music**
  * Recommended lane group:
    * 9 lanes of dimension 0
* **Beatmania IIDX SP**
  * Recommended lane groups:
    * 1 lane of dimension 0 (scratch)
    * 7 lanes of dimension 0 (buttons)
  * Alternative:
    * 8 lanes of dimension 0 (scratch + buttons)
    * Scratch notes and button notes are not homogeneous, so this is not recommended.
* **Beatmania IIDX DP**
  * Recommended lane groups:
    * 1 lane of dimension 0 (left scratch)
    * 7 lanes of dimension 0 (left buttons)
    * 7 lanes of dimension 0 (right buttons)
    * 1 lane of dimension 0 (right scratch)
  * Alternative:
    * 2 lane of dimension 0 (scratches)
    * 14 lanes of dimension 0 (buttons)
    * Not recommended.
* **Sound Voltex**
  * Recommended lane groups:
    * 4 lanes of dimension 0 (BT-notes)
    * 2 lanes of dimension 0 (FX-notes)
    * 2 lanes of dimension 1 (lasers)
* **Jubeat**
  * Recommended lane group:
    * 16 lanes of dimension 0
  * Note that, using 2-dim notes are not recommended.
    * Use note properties to specify arrows of long notes.

### File Format

An RGC chart file is a text file, which...

* usually has an extension `.rgc` (other extensions are allowed),
* MUST be UTF-8 encoded, SHOULD NOT include a BOM-mark,
* SHOULD use LF (and not CR+LF) as line separator,
* MUST be a valid JSON file which...
  * MUST have an object at the top level,
  * MUST NOT contain any duplicated fields, and
  * MAY NOT contain `null` unless specified otherwise.

Unless otherwise specified, fields of an object that are not specified in this document MAY be ignored by an implementation.

When there is a `// custom fields allowed` in the pseudocode of a struct, any implementation SHOULD preserve any unknown fields present in the struct.

For any field specified in this document, the specified type SHOULD be used to represent the field value in JSON (for example, strings MUST NOT be used to store an `i32` field), except for `i64` or `u64`.

For any field with `i64` or `u64` type, the field's value is permitted to be stored as the base-10 `string` representation of the integer, and any reader MUST be able to handle these cases.

The order of keys in an object MAY be arbitrary.

### Top-Level Object

```Rust
struct RGC {
  header: Header,
  meta: Metadata,
  timing: Timing,
  chart: map<string, LaneGroup>,

  // custom fields allowed
}
```

* `chart`: a map of lane groups, with the ID of each lane group as key.
  * The ID of a lane group MAY be an empty string.

### Header

The header acts as the metadata for the RGC chart file, independent of the chart itself.

```Rust
struct Header {
  version: string?,
  editor: string?,
  game: string?,

  // custom fields allowed
}
```

* `version` (optional): semver for the file format.
* `editor` (optional): identifier for the editor which created or last edited this file.
  * MUST NOT be used to alter behaviors of an editor; this data is purely informative.
  * RECOMMENDED to consist of the ID of the editor (RECOMMENDED to match `[0-9a-z\-]+`), a space, and the semver of the editor.
* `game` (optional): ID for the game (and the gamemode) this chart is for.
  * RECOMMENDED to match `[0-9a-z\-]+(\/[0-9a-z\-]+)?`.
  * If a gamemode is being specified, the ID for the game and the gamemode SHOULD be concatenated by a forward slash (`/`).
  * Examples: `sdvx`, `ddr/dp`

### Metadata

The metadata acts as the metadata for the chart, independent of gameplay.

```Rust
struct Metadata {
  title: string?,
  music: MetadataResource?,
  chart: MetadataResource?,
  jacket: MetadataResource?,

  // custom fields allowed
}
```

```Rust
struct MetadataResource {
  author: string?,
  path: string?,

  // custom fields allowed
}
```

### Timing

A chart file's main purpose is to store timestamps of notes, relative to the beginning of an audio file.

In an RGC chart, notes' timestamps are represented with ticks, which are integers representing time since the beginning of the chart.

`Timing` specifies the relation between ticks and timestamps.

```Rust
type Tick = u64;

type IimeSignature = [u16, u16];

struct Timing {
  offset: i32?,
  res: u16?,
  bpm: array<[Tick, f64]>?,
  sig: array<[Tick, TimeSignature]>?,
}
```

* `offset` (optional): position of the first timing segment, in milliseconds.
  * Defaults to 0.
  * "The beginning of the chart" (tick=0) refers to this position.
    * In other words, all other entities' positions in this chart depend on this value.
* `res` (optional): \# of ticks per a quarter note.
  * Defaults to 24 (96 ticks per a 4/4 measure) if not specified.
  * MUST be a positive integer.
  * `4*res` MUST be a multiple of the beat unit of all timing segments.
* `bpm` (RECOMMENDED to be present): an array of BPM changes.
  * Here, 'BPM' means "\# of quarter notes per 60 seconds".
  * BPM changes are specified with a pair of ticks and corresponding BPM.
  * BPM changes MUST be sorted by ticks, in ascending order.
  * It is RECOMMENDED to include at least BPM change, with t=0.
    * If there is no BPM change specified, the default value is 120.
    * If there is one BPM change with t≠0, it will be applied to the whole chart.
* `sig` (RECOMMENDED to be present): an array of time signature changes.
  * Each time signature `TimeSignature` is in the form of `[# of beat units per measure, beat unit]`.
    * It is RECOMMENDED for beat units to be powers of 2.
  * Time signatures MUST be sorted by `t`, in ascending order.
  * It's permitted for a time signature to not be aligned with a previous time signature's measures / beats.
  * It is RECOMMENDED to include at least one time signature.
    * When there is at least one time signature, the first time signature's tick MUST be zero.
    * If there is no time signature specified, the default value is [4, 4].

For `bpm` and `sig`, ticks SHOULD be non-negative. Implementations MAY omit supports for negative ticks in `bpm` and `sig`.

Note: currently, supports for [anacruses](https://en.wikipedia.org/wiki/Anacrusis) is omitted, due to relative complexity of handling them. Use two time signatures, one for the anacrusis and one for regular measures, when an anacrusis is needed.

### LaneGroup

```Rust
struct LaneGroup {
  dim: u8?,
  lane: array<array<Note>>,
}
```

* `dim` (optional): the dimension of notes in this lane group.
  * MUST be a non-negative integer.
  * MUST be compatible with positions of all notes in the group.
  * An implementation MAY heuristically determine the value if `dim` is omitted.
* `lane`: an array of lane(= array of note)s.
  * A lane MUST be sorted by `t` (ticks of notes), in ascending order.

### Note

```Rust
struct Note {
  t: Tick,
  id: string?,
  k: string?,
  
  l: Tick?
  v: Pos?,
  w: Pos?,
  p: object?,
}
```

* `t`: start tick for this note, from the beginning of the chart.
  * In an RGC chart, all notes' ticks MUST be strictly non-negative.
* `id` (optional): identifier for the note.
  * If present, it MUST NOT be an empty string.
  * RECOMMENDED to match `[0-9a-z\-]+`.
  * RECOMMENDED to be unique; implementations MAY reject charts containing notes with identical IDs.
* `k` (optional): kind (type) ID for this note.
  * If present, it MUST NOT be an empty string.
  * RECOMMENDED to match `[0-9a-z\-]+`.
* `l` (optional): length of this note, in ticks.
  * MUST be non-negative.
* `v` (optional): spatial position of this note (at the start).
  * MAY be omitted when the dimension is zero.
  * MUST be specified when the dimension is non-zero.
* `w` (optional): spatial position of this note (at the end).
  * Defaults to `w` when not specified.
* `p` (optional): arbitrary property of this note.
  * MUST be a valid JSON object.
  * SHOULD be preserved by an implementation.

#### Concise Format

`Note` MAY be represented by an array, or a single `t` value, as specified below, where only `t`, `k`, `p`, `l`, `v`, and `w` fields are present.

Array `Note` representation MUST NOT be used when `t` is not represented by a number.

```Rust
// For 0D notes
t
[k?, t, l?, p?]

// For 1+D notes
[k?, t, [v], l?, p?]
[k?, t, [v, w], l?, p?]
```

If either `dim` is provided or heuristically determined, then an implementation MUST accept charts containing notes in concise formats.

Otherwise, an implementation MAY reject such charts.

#### Pos

* MUST either be unspecified, or an empty array, for `dim`=0.
* MUST either be `i32`, `f64`, or a singleton array, for `dim`=1.
* Array of coordinate values for `dim`≥2.
  * Length MUST match the dimension of the lane.

## Example

This is the RGC chart for the "Calibration NOV" k-shoot mania chart.

```json
{
  "header": {
    "version": "0.1.0",
    "game": "sdvx"
  },
  "meta": {
    "title": "Calibration",
    "music": {"author": "HEXAGON", "path": "offset.ogg"},
    "chart": {"author": "HEXAGON"},
    "jacket": {"author": "HEXAGON", "path": "offset-1.png"}
  },
  "timing": {
    "offset": 1000,
    "res": 1,
    "bpm": [[0, 120]],
    "sig": [[0, [4, 4]]]
  },
  "chart": {
    "bt": {
      "dim": 0,
      "lane": [
        [0, 1, 2, 3, 16, 17, 18, 19, 32, 33, 34, 35, 48, 49, 50, 51],
        [4, 5, 6, 7, 20, 21, 22, 23, 36, 37, 38, 39, 52, 53, 54, 55],
        [8, 9, 10, 11, 24, 25, 26, 27, 40, 41, 42, 43, 56, 57, 58, 59],
        [12, 13, 14, 15, 28, 29, 30, 31, 44, 45, 46, 47, 60, 61, 62, 63]
      ]
    }
  }
}
```