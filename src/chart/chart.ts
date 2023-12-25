import { Timing } from "../timing/index.js";
import { VERSION } from "../version.js";
import { LaneGroup } from "./lane.js";
import * as schema from "./schema.js";

export class Chart {
    editor: string;
    game: string;
    
    get header(): schema.Header { return {version: VERSION, editor: this.editor, game: this.game}; }

    metadata: schema.Metadata;

    #timing: Timing;
    get timing(): Readonly<Timing> { return this.#timing; }

    #lane_groups = new Map<string, LaneGroup>();
    get lane_groups(): Readonly<Map<string, LaneGroup>> { return this.#lane_groups; }

    constructor(chart_data: schema.Chart) {
        this.editor = chart_data.header?.editor ?? "";
        this.game = chart_data.header?.game ?? "";
        this.metadata = chart_data.meta ?? {};
        this.#timing = new Timing(chart_data.timing ?? {});

        if(chart_data.chart) {
            for(const k in chart_data.chart) {
                this.#lane_groups.set(k, new LaneGroup(k, chart_data.chart[k]));
            }
        }
    }

    static parse(src: string): Chart {
        return Chart.fromJSON(JSON.parse(src));
    }

    static fromJSON(root: unknown): Chart {
        const {problems, data} = schema.chart(root);
        problems?.throw();

        if(!data) throw new Error("Failed to parse the chart!");
        return new Chart(data);
    }
}