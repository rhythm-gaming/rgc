import type {Format} from "./types.js";
import {schema} from "../chart/index.js";

export class RGC implements Format<string> {
    toRGC(source: string) {
        const {problems, data} = schema.chart(JSON.parse(source));
        problems?.throw();

        if(!data) throw new Error("Failed to parse the chart!");
        return data;
    }

    fromRGC(chart: schema.Chart) {
        // TODO: optimize the results by optimizing note representations.
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return JSON.stringify(chart, (_key, value) => {
            if(typeof value === 'bigint') {
                return `${value}`;
            }
            
            return value;
        });
    }
}