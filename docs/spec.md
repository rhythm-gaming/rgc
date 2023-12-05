# RGC chart file format

Current version: `0.0.1`

## Introduction

The RGC ("rhythm game chart") file format is a JSON-based format, aims to be able to represent most 

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
4. Notes and auxillary data
    * For example, in Sound Voltex, 'auxillary data' includes camera angle changes and layer information.
    * The RGC format does not distinguish between notes and auxillary data.

### File Format

### Top-Level Object

### Header

### Metadata

### Timing

### LaneGroup

### Note

#### Pos