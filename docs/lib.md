# Library API

For the specification of the RGC file format, see [spec.md](./spec.md).

This library provides a convenient way to read and write RGC files.

## `parseChart`

Given a JSON object, or a string serialization of it, `parseChart` validates and transforms the given input into the `Chart` object.

In addition to data validation, `parseChart` also converts compact note values into full note objects.

## `serializeChart` (TODO)

Given a `Chart` object, `serializeChart` serializes the chart, while converting suitable notes into compact note formats.

## Helper Libraries (TODO)

This library provides the minimal API for reading and writing RGC files.
For convenient use, we provide additional helper libraries.

### Converters (TODO)

| Target Format | Library |
| ------------- | ------- |
| KSH, KSON | `@rhythm-gaming/rgc-kshoot` (WIP) |
| BMS, bmson | `@rhythm-gaming/rgc-bms` (TODO) |
| `.osu`, `.osz` | `@rhythm-gaming/rgc-osu` (TODO) |

### Additional Utilities (TODO)

The `@rhythm-gaming/rgc-tools` (TODO) library provides useful utilities for reading and editing a rhythm game chart.