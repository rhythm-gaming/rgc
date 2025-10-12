# RGC specification

This is the specification for the RGC ("rhythm game chart") file format.

For the information on using this library, see [lib.md](./lib.md).

The version number of the specification follows the version of this package (`@rhythm-gaming/rgc`).

## Introduction

The RGC format is a JSON-based chart format for rhythm games.

### Goals

- The RGC format supports **various rhythm games**.
- The RGC format can be **easily convertible** from/to other rhythm game chart formats.
- The RGC format enables **rapid prototyping** of new rhythm games.

### Non-Goals

- The RGC format does not aim to be "the standard format" for any particular rhythm game.
  - In particular, the RGC format does not try to replace either KSON or bmson.
- This specification does not specify "the standard RGC representation" for any rhythm game.
- The RGC format does not aim to provide a "hashable" representation of a chart.
  - That is, semantically identical RGC charts are allowed to be stored as different sequences of bytes.

### Inspirations

The RGC format is inspired by [m4saka's KSON format](https://github.com/kshootmania/ksm-chart-format/blob/master/kson_format.md) for Sound Voltex charts and [the bmson format](https://bmson-spec.readthedocs.io/en/master/doc/index.html). The RGC format aims to be easily convertible to and from either formats.

## Overview

An RGC chart file is a UTF-8 encoded JSON file, consisting of the following four parts:

1. **Header**: Metadata for the RGC chart file, independent of chart contents.
2. **Metadata**: Metadata for the chart, such as title, music info, ..., which are independent of gameplay.
3. **Timing**: BPM and time signature changes; *excluding* scroll speed changes.
4. **Notes**: Time-dependent events, such as notes, scroll speed changes, and camera angle changes.

> [!NOTE]
> Many JSON objects, such as the root value, header, and metadata, may contain other fields that are not specified in this specification.

### Timing

A chart file's main purpose would be to store time-dependent events, relative to the beginning of an audio file.

In an RGC chart, a timepoint is stored as an integer called a **tick**, which can be translated to the time from the beginning of an audio file as following:

1. The **offset** value of the RGC chart specifies the location of the start of the first measure.
2. The **resolution** value of the RGC chart specifies the length of a tick relative to a quarter note.
3. BPM data specifies (via BPM values) how long is a quarter note.

With these three information combined, a tick can be translated to the time from the beginning of an audio file.

> [!TIP]
> Positions of BPM data is specified in ticks.
> Position of a BPM data can be computed by using the previous BPM data.

### Notes

As far as the RGC chart format is concerned, "notes" include *auxillary data/event*, which does not directly participate in defining entities that players are required to hit.

A note has a property called **position**, which is a tuple of zero or more values. \# of values to specify a position is called the **dimension** of the note.

Here are a few examples:

| Game | Data | Dimension |
| ---- | ---- | --------- |
| Taiko | Note | 0 |
| Sound Voltex | Note | 0 |
| Sound Voltex | Laser | 1 |
| Sound Voltex | Camera Angle | 1 |
| Pop'n Music! | Fever Time | 0 |
| Osu! | Note | 2 |

> [!NOTE]
> RGC by itself does not restrict on whether multiple notes on the same lane may share the same position. In other words, notes may overlap. For a specific game, arbitrary restrictions may be introduced by an editor or a game, such as disallowing overlapping notes.

### Lane Groups

Notes are grouped by **lanes**. Each lane is a homogeneous array of notes, and placements of notes in different lanes are independent.

A collection of lanes with homogeneous properties is called a **lane group**. Every note in a lane group MUST share the same dimension.

## Specification

### File

An RGC chart file is a text file, which...

- usually has an extension `.rgc` (other extensions are allowed),
- MUST be UTF-8 encoded, SHOULD NOT include a BOM-mark, and
- MUST be a valid JSON file which...
  - MUST have an object at the top level,
  - MUST NOT contain any duplicated fields, and
  - MAY NOT contain `null` unless specified otherwise.

Unless otherwise specified, fields of an object that are not specified in this document MAY be ignored by an implementation.

When there is a `// custom fields allowed` in the schema of an object, any implementation SHOULD preserve any unknown fields present in the struct unless specified otherwise.

Implementation MAY reject, preserve, or drop unknown fields of an object where custom fields are not explicitly allowed.

Implementations MUST NOT assume orders of object keys as they MAY be arbitrary.

> [!TIP]
> If a fixed ordering is needed, consider adding a custom field containing an array of keys to store their orders.

### Scalars

This specification uses following value types:

- **Integers**: `u8`, `u16`, `i32`, `u64`, `Tick` (an alias for `u64`)
- **Floats**: `f64`, `Coord` (an alias for `f64`)
- **Strings**: `string`
- **Property**: `object` (which is a JSON object)

#### Integers

Other than `i64` or `u64`, all integers MUST be stored as a JSON number.

For a value with `i64` or `u64` type, the value is permitted to be stored as the base-10 string representation of the integer. Any reader MUST be able to handle this case. 

For a value with `u64` type, values greater than $2^{63} - 1$ MUST NOT be used. Moreover, implementations MAY assume that absolute values of integer values are less than 2^53 (i.e. not greater than ECMAScript's `Number.MAX_SAFE_INTEGER`).

> [!TIP]
> Treat `u64` as a *signed* integer as subtraction would work as expected.
> For languages like Rust and C++, it is RECOMMENDED to use signed integers (such as `std::int64_t`)
> instead of unsigned integers (such as `std::uint64_t`).
> For JavaScript, prefer using `BigInt` over `number` for `u64`.

#### Floats

All floats MUST be stored as a JSON number.

Non-finite values (such as `NaN`, `Infinity`, and `-Infinity`) MUST NOT be used.

#### Strings

All strings MUST be stored as a JSON string.

#### Property

A property may be any JSON object, and may contain nested JSON arrays and objects.

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

- `chart`: a map of lane groups, with the ID of each lane group as key.
  - The ID of a lane group MAY be an empty string.

### Header: `header`

```Rust
struct Header {
  version?: string,
  editor?: string,
  game?: string,

  // custom fields allowed
}
```

- `version` (optional): [semver](https://semver.org/) for the file format.
  - Note that semvers are *not* prefixed with a `v`.
- `editor` (optional): identifier for the editor which created or last edited this file.
  - MUST NOT be used to alter behaviors of an editor; this data is purely informative.
  - RECOMMENDED to consist of the ID of the editor (RECOMMENDED to match `[0-9a-z\-]+`), a space, and the semver of the editor.
- `game` (optional): ID for the game (and the gamemode) this chart is for.
  - RECOMMENDED to match `[0-9a-z\-]+(\/[0-9a-z\-]+)?`.
  - If a gamemode is being specified, the ID for the game and the gamemode SHOULD be concatenated by a forward slash (`/`).
  - Examples: `sdvx`, `ddr/dp`

It is allowed for an implementation to drop unknown fields in the header.

> [!NOTE]
> The definition for "gamemode" is not important for the purposes of this specification.

> [!TIP]
> Editors may (and would usually) overwrite the whole header when saving a chart.

> [!TIP]
> The `version` value can be obtained by importing `@rhythm-gaming/rgc/package.json`.

### Metadata: `meta`

```Rust
struct Metadata {
  title?: string,
  music?: MetadataResource,
  chart?: MetadataResource,
  jacket?: MetadataResource,

  // custom fields allowed
}
```

> [!TIP]
> Store level and difficulty of a chart as custom fields in `Metadata`.

```Rust
struct MetadataResource {
  author?: string,
  path?: string,

  // custom fields allowed
}
```

> [!WARNING]
> Specifications of additional fields to `Metadata` and `MetadataResource` are expected to be added.

### Timing: `timing`

```Rust
type Tick = u64;
type BPMDef = [Tick, f64];

type TimeSignature = [u16, u16];
type SigDef = [Tick, TimeSignature];

struct Timing {
  offset?: i32,
  res?: u16,
  bpm?: array<BPMDef>,
  sig?: array<SigDef>,
}
```

#### Offset: `offset`

- The position (within an audio file) of the point where tick is equal to zero.
- The value is specified in milliseconds.
- Defaults to `0`.

> [!TIP]
> All tick values must be non-negative, which means that `offset` is the earliest time at which a note, a BPM change, or a time signature change can be placed.
> Note that the offset value itself may be negative.

#### Resolution: `res`

- \# of ticks per a quarter note.
- MUST be a positive, non-zero integer.
- Defaults to `24` (= 96 ticks per a 4/4 measure).
- `4*res` MUST be a multiple of beat units of all time signatures present in this file.

#### BPM: `bpm`

- An array of BPM changes.
  - Here, 'BPM' means "\# of quarter notes per 60 seconds".
- Each BPM change is stored via a pair of `[tick, bpm]`.
  - All BPM values MUST be positive.
- BPM changes MUST be sorted by ticks, in ascending order.
- Two different BPM changes MUST NOT share the same tick value.
- It is RECOMMENDED to include at least one BPM change, where t=0.
  - If no BPM changes have been specified, the default BPM will be set as `120`.
  - If there is exactly one BPM change, the BPM value will be used for the entire chart.

#### Time Signature: `sig`

- An array of time signature changes.
- Each time signature is stored via a pair of `[tick, [# of beat units per measure, beat unit]]`.
  - It is RECOMMENDED for beat units to be powers of 2.
  - \# of beat units per measure MUST be a positive, non-zero integer.
- Time signatures MUST be sorted by ticks, in ascending order.
- A time signature's tick MAY be unaligned with a previous time signature's beats.
- It is RECOMMENDED to include at least one time signature where t=0.
  - When there is at least one time signature, the first time signature's tick MUST be zero.
  - If no time signature has been specified, the default time signature will be `4/4` (`[0, [4, 4]]`).

> [!NOTE]
> Currently, supports for [anacruses](https://en.wikipedia.org/wiki/Anacrusis) is omitted, due to relative complexity of handling them. Use two time signatures, one for the anacrusis and one for regular measures, when one is needed.

### Notes: `chart`

#### LaneGroup

```Rust
struct LaneGroup {
  dim?: u8,
  lane: array<array<Note>>,
}
```

- `dim` (optional): the dimension of notes in this lane group.
  - MUST be a non-negative integer.
  - MUST be compatible with positions of all notes in the group.
  - An implementation MAY heuristically determine the value if `dim` is omitted.
- `lane`: an array of lanes, where a lane is an array of notes.
  - Notes in a lane MUST be sorted by their `t`, in ascending order.

#### Note

```Rust
type Coord =

struct Note {
  t: Tick,      // start tick
  id?: string,  // unique ID
  k?: string,   // "kind ID" (like CSS classes)
  
  l?: Tick,     // length
  v?: Pos,      // start position
  w?: Pos,      // end position
  p?: object,   // property
}
```

- `t`: start tick for this note, from the beginning of the chart.
  - MUST be non-negative.
- `id` (optional): identifier for the note.
  - If present, it MUST NOT be an empty string.
  - RECOMMENDED to match `[0-9a-z\-]+`.
  - RECOMMENDED to be unique; implementations MAY reject charts containing multiple notes with same IDs.
- `k` (optional): kind (type) ID for this note.
  - If present, it MUST NOT be an empty string.
  - RECOMMENDED to match `[0-9a-z\-]+`.
- `l` (optional): length of this note, in ticks.
  - MUST be non-negative, and MAY be zero.
- `v` (optional): spatial position of this note (at tick=`t`).
  - MAY be omitted when the dimension is zero.
  - MUST be specified when the dimension is non-zero.
- `w` (optional): spatial position of this note (at tick=`t+l`).
  - Defaults to `v` when not specified.
- `p` (optional): arbitrary property of this note.
  - If present, it MUST be a JSON object.
  - SHOULD be preserved by an implementation.

##### Pos

`Pos` values' type depends on the dimension of the lane group.

| `dim` | Value |
| --------- | ----- |
| 0 | MUST be omitted, or an empty array. |
| 1 | MUST be a `Coord` or a singleton array containing a `Coord`. |
| 2+ | MUST be an array of `Coord`s, and its length MUST match the dimension of the lane group. |

##### Compact Note Format

`Note` MAY be represented by an array, or a single `t` value, as specified below, as long as `t`, `k`, `p`, `l`, `v`, and `w` are the only fields present.

Array `Note` representation MUST NOT be used when `t` cannot be represented by a JSON number.

```Rust
// For 0D notes
t
[k?, t, l?, p?]

// For 1+D notes
[k?, t, [v], l?, p?]
[k?, t, [v, w], l?, p?]
```

Implementations MUST accept charts containing compact notes.

> [!TIP]
> From a compact note format in an array form, all note fields can be determined unambiguously.
> 
> - `k` is always a string and `t` is always a number, so `k` and `t` can be distinguished from others.
> - `l` is a number or a string, `p` is always an object, and `[v, w?]` is always an array. Therefore they can also be distinguished.

## Example

This is the RGC chart for the "Calibration NOV" k-shoot mania chart.

```json
{
  "header": {
    "version": "0.3.0",
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
