import { Timing } from "../timing/index.js";
import * as schema from "./schema.js";

export class Chart {
    #timing: Timing;

    constructor(chart_data: schema.Chart) {
        this.#timing = new Timing(chart_data.timing ?? {});
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