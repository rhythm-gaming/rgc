export * from "./scalar.js";
export * from "./header.js";
export * from "./metadata.js";
export * from "./timing.js";
export * from "./lane-group.js";

import { type } from 'arktype';
import { exportType } from "./type-util.js";

import { Header } from "./header.js";
import { Metadata } from "./metadata.js";
import { Timing } from "./timing.js";
import { LaneGroup } from "./lane-group.js";
import { checkIsRecord } from "./scalar.js";

export const Chart = exportType(type({
    "header": Header,
    "meta": Metadata,
    "timing": Timing,
    "chart": {
        "[string]": LaneGroup,
    },
}).onUndeclaredKey('ignore').narrow(checkIsRecord));
export type Chart = typeof Chart.infer;

export function parseChart(data: unknown): Chart {
    if(typeof data === 'string') data = JSON.parse(data);
    return Chart.assert(data);
}