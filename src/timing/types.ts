/** Unit for represent note positions in a chart. */
export type Tick = bigint;
export type TickRange = [begin: Tick, end: Tick];

export type MeasureIdx = bigint;

export type TimeSig = [ numerator: number, denominator: number ];

/** Information on a specific timing segment. */
export interface TimingSegment {
    /** Start tick of this timing segment. */
    tick: Tick;

    /** Time signature for this timing segment. */
    time_sig: TimeSig;

    /** Tick resolution (length of a quarter note in ticks) for this timing segment. */
    res: Tick;
}

/** Information of a specific measure. */
export interface MeasureInfo {
    /** Measure index for this measure, starting from 0. */
    idx: MeasureIdx;
    /** Start tick of this measure. */
    tick: Tick;
    /** Timing segment containing this measure. */
    segment: TimingSegment;
    /**
     * Length of this measure, in ticks.
     * This could be shorter than `time_sig[0] * beat_length` when this measure isn't a full measure.
     **/
    length: Tick;
}

/** Timing information for a specific tick. */
export interface TimingInfo {
    tick: Tick;
    /** Time for the tick, in milliseconds. */
    time: number;
    /** The measure  */
    measure: MeasureInfo;
    /** Current timing segment. Equivalent to measure.segment. */
    segment: TimingSegment;
}