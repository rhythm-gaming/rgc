export class Chart {
    static parse(src: string): Chart {
        return Chart.fromJSON(JSON.parse(src));
    }

    static fromJSON(root: unknown): Chart {
        throw new Error("Not yet implemented!");
    }
}