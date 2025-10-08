export * from "./scalar.js";
export * from "./header.js";
export * from "./metadata.js";
export * from "./timing.js";
export * from "./lane-group.js";

import { Type, type } from 'arktype';

import { Header } from "./header.js";
import { Metadata } from "./metadata.js";
import { Timing, type TimingArkType } from "./timing.js";
import { Note, LaneGroup, type LaneGroupArkType } from "./lane-group.js";

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

export type Chart<NoteType extends Note = Note> = Omit<typeof Chart.infer, 'chart'> & {
    chart: Record<string, LaneGroup<NoteType>>,
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _type_Chart: Chart = Chart.infer;

export function parseChart(data: unknown): Chart {
    if(typeof data === 'string') data = JSON.parse(data);
    return Chart.assert(data);
}

export type FnLaneGroupTransform<FromNoteType extends Note, ToNoteType extends Note> = (lane_group_id: string, lane_group: LaneGroup<FromNoteType>) => LaneGroup<ToNoteType>;
export function mapLaneGroups<FromNoteType extends Note, ToNoteType extends Note>(chart: Chart<FromNoteType>, fn: FnLaneGroupTransform<FromNoteType, ToNoteType>): Chart<ToNoteType> {
    const new_chart_data: Record<string, LaneGroup<ToNoteType>> = Object.fromEntries(
        Object.entries(chart.chart).map(([k, v]) => [k, fn(k, v)]),
    );
    
    return {
        ...chart,
        chart: new_chart_data,
    };
}