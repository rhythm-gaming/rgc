export * from "./scalar.js";
export * from "./header.js";
export * from "./metadata.js";
export * from "./timing.js";
export * from "./lane-group.js";

import { type, ArkErrors } from 'arktype';

import { Header } from "./header.js";
import { Metadata } from "./metadata.js";
import { Timing } from "./timing.js";
import { LaneGroup } from "./lane-group.js";

export const Chart = type({
    "header": Header,
    "meta": Metadata,
    "timing": Timing,
    "chart": {
        "[string]": LaneGroup,
    },
}).onUndeclaredKey('ignore');
export type Chart = typeof Chart.infer;

export function parseChart(data: unknown): Chart {
    if(typeof data === 'string') data = JSON.parse(data);
    const result = Chart(data);

    if(result instanceof ArkErrors) {
        throw new Error(result.summary);
    }

    return result;
}