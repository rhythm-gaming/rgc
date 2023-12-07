/** Unit for represent note positions in a chart. */
export type Tick = bigint;
export type TickRange = [begin: Tick, end: Tick];

export type TimeSignature = [ numerator: number, denominator: number ];

export type MeasureIdx = bigint;

/** Information of a specific measure. */
export interface MeasureInfo {
    /** Measure index for this measure, starting from 0. */
    idx: MeasureIdx;
    /** Start tick of this measure. */
    tick: Tick;
    /** Time signature for this measure. */
    sig: TimeSignature;
    /**
     * Full length of this measure, in ticks.
     * Equal to `this.sig[0] * this.beat_length`.
     */
    full_length: Tick;
    /** Beat length of this measure, in ticks. */
    beat_length: Tick;
}

export interface TickTimeInfo {
    tick: Tick;
    time: number;
}

export interface BPMInfo extends TickTimeInfo {
    bpm: number;
}

export interface TimeSignatureInfo extends TickTimeInfo {
    sig: TimeSignature;
    measure_idx: MeasureIdx;
}

/** Timing information for a specific tick. */
export interface TimingInfo extends TickTimeInfo {
    /** BPM for the tick. */
    bpm: number;
    /** The measure. */
    measure: MeasureInfo;
}