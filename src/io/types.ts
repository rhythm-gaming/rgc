import {schema} from "../chart/index.js";

export interface Reader<SourceFormat=string> {
    toRGC(data: SourceFormat): schema.Chart;
}

export interface Writer<SourceFormat=string> {
    fromRGC(chart: schema.Chart): SourceFormat;
}

export interface Format<SourceFormat=string> extends Reader<SourceFormat>, Writer<SourceFormat> {}