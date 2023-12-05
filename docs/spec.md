# RGC chart file format

Current version: `0.1.0`

## Introduction

The RGC ("rhythm game chart") file format is a JSON-based format, aims to be able to represent charts from many different rhythm games.

The RGC format is inspired by [m4saka's KSON format](https://github.com/kshootmania/ksm-chart-format/blob/master/kson_format.md) for Sound Voltex charts and [the bmson format](https://bmson-spec.readthedocs.io/en/master/doc/index.html). The RGC format aims to be easily convertible to and from either formats. However, it's not a goal for the RGC format to be compatible to either formats.

### Goals

* Easily convertible to/from various other rhythm game chart formats.
* Easily usable to represent charts from many different kinds of rhythm games.
* Enable quick prototyping of new rhythm games.

### Non-goals

* Aims to be "the standard format" for any particular rhythm game.
  * In particular, the RGC format does not try to replace either KSON or bmson.
* Aims to be "the normalized form" of any particular chart.
  * In other words, there might be multiple equally-valid representations of a chart.
  * For several rhythm games, few recommendations are provided, however.

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
4. Notes (including auxillary data)
    * The RGC format does not distinguish between notes and auxillary data.
      * For example, in Sound Voltex, camera angle changes and layer information are considered to be auxillary data, but as far as RGC chart format is concerned, they are also notes.

#### Lanes

Lanes and lane groups are important concepts for the RGC format.

Notes are represented as a collection of *lanes*. Each *lane* contain homogeneous collection of data, and different lanes do not interfere with each other.

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
* is a valid JSON file which...
    * MUST have an object at the top level, and
    * MAY NOT contain `null`.

Unless otherwise specified (usually with `// custom fields allowed` comment in the pseudocode), fields of an object that are not specified in this document might not be preserved by an implementation.

For any field specified in this document, any specified type SHOULD be obeyed (for example, strings MUST NOT be used for storing `i32`), except for `i64` or `u64`.

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
  * SHOULD consist of the ID of the editor (matching `[0-9a-z\-]+`), a space, and SEMVER of the editor.
* `game` (optional): ID for the game (and the gamemode) this chart is for.
  * If a gamemode is being specified, the ID for the game and the gamemode MUST be concatenated by a forward slash (`/`).
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

In an RGC chart, notes' timestamps are represented with ticks, integers representing time since the beginning of the chart.

`Timing` specifies the relation between ticks and timestamps.

```Rust
struct Timing {
  offset: i32?,
  segment: array<TimingSegment>,
}
```

* `offset`: position of the first timing segment, in milliseconds.
  * Defaults to 0.
  * "The beginning of the chart" (tick=0) refers to this position.
* `segment`: an array of timing segments.

```Rust
struct TimingSegment {
  t: i64,
  bpm: f64,
  sig: [u16, u16],
  res: u16?,
}
```

* `t`: number of ticks from the previous segment.
  * For the first timing segment, `t` MUST be 0.
  * For other timing segments, `t` MUST be a positive integer.
  * It's permitted for the beginning point of a timing segment to not be aligned with previous timing segment's measures / beats.
* `bpm`: \# of quarter notes per a minute.
* `sig`: time signature, in the form of `[# of beats per measure, beat unit]`.
  * Both numbers MUST be positive integers.
  * While not a requirement, beat units are recommended to be a power of 2.
* `res` (optional): \# of ticks per a quarter note.
  * Defaults to 24 (96 ticks per a 4/4 measure) if not specified.
  * MUST be a positive integer.
  * `4*res` MUST be a multiple of the beat unit of the current timing segment.

### LaneGroup

```Rust
struct LaneGroup {
  dim: u8?,
  lane: array<array<Note>>,
}
```

* `dim` (optional): the dimension of notes in this lane group.
  * MUST be a non-negative integer.
  * An implementation MAY heuristically determine the value if `dim` is omitted.
* `lane`: an array of lane(= array of note)s.
  * A lane SHOULD be sorted by `t` (ticks of notes), in ascending order.

### Note

```Rust
struct Note {
  t: int64,
  id: string?,
  k: string?,
  
  l: int64?
  v: Pos?,
  w: Pos?,
  p: object?,
}
```

* `t`: start tick for this note, from the beginning of the chart.
* `id` (optional): identifier for the note.
  * SHOULD match `[0-9a-z\-]+`
  * MAY be non-unique
* `k` (optional): kind (type) ID for this note.
* `l` (optional): length of this note, in ticks.
  * MUST be non-negative.
  * Note that a note may span across multiple timing segments.
* `v` (optional): position of this note (at the start).
* `w` (optional): position of this note (at the end).
  * Defaults to `w` when not specified.
* `p` (optional): arbitrary property of this note.

#### Concise Format

`Note` MAY be represented by an array, an integer, or a string, where only `t`, `k`, `p`, `l`, `v`, and `w` fields are present.

Array `Note` representation MUST NOT be used when `t` is not represented by a number.

```Rust
// For 0D notes
t
[k?, t, l?, p?]

// For 1+D notes
[k?, t, v, l?, p?]
[k?, t, [v, w], l?, p?]
```

#### Pos

* MUST either be unspecified, or an empty array, for 0D.
* MUST either be `i32`, `f64`, or a singleton array for 1D.
* Array of coordinate values for 2+D.
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
    "segment": [
      {"t": 0, "bpm": 180, "sig": [4, 4], "res": 1}
    ]
  },
  "chart": {
    "bt": {
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