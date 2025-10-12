export * from "./scalar.js";
export * from "./header.js";
export * from "./metadata.js";
export * from "./timing.js";
export * from "./lane-group.js";

import { Type, type } from 'arktype';

import { Header } from "./header.js";
import { Metadata } from "./metadata.js";
import { Timing, type TimingArkType } from "./timing.js";
import { LaneGroup, type LaneGroupArkType } from "./lane-group.js";

export interface ChartArkType {
    header: Header;
    meta: Metadata;
    timing: TimingArkType;
    chart: {
        [x: string]: LaneGroupArkType;
    };
}

export const Chart: Type<ChartArkType> = type({
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
    return Chart.assert(data);
}