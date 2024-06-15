# chart

## Chart

```ts
export declare class Chart {
    editor: string;
    game: string;
    get header(): schema.Header;
    metadata: schema.Metadata;
    get timing(): Readonly<Timing>;
    get lane_groups(): Readonly<Map<string, LaneGroup>>;

    constructor(chart_data: schema.Chart);
    
    static parse(src: string): Chart;
    static fromJSON(root: unknown): Chart;
    toJSON(): schema.Chart;
}
```

## LaneGroup

## Lane
