import { assert } from 'chai';
import { ArkErrors } from 'arktype';

import { TimeSignature, BPMDef, BPMDefArray, SigDef, SigDefArray, Timing } from "./timing.js";

describe("TimeSignature", function() {
    it("should accept valid time signatures", function() {
        for(const v of [
            [1, 1],
            [4, 4],
            [3, 8],
            ['2', '4'],
            [65535, 65535],
        ]) {
            const expected = [BigInt(v[0]), BigInt(v[1])];
            const actual = TimeSignature.assert(v);
            assert.deepStrictEqual(actual, expected);
        }
    });

    it("should reject invalid time signatures", function() {
        for(const v of [
            [0, 4], // numerator must be positive
            [-1, 4],
            [1, -1],
            [1.5, 4],
            [4, 1.5],
            [65536, 4],
            [4, 65536],
            [],
            [4],
            [4, 4, 4],
            "4/4",
        ]) {
            assert.throws(() => TimeSignature.assert(v));
        }
    });
});

describe("BPMDef", function() {
    it("should accept valid BPM definitions", function() {
        for(const v of [
            [0, 120],
            [0n, 120.5],
            ["123", "60.25"],
        ]) {
            const expected = [BigInt(v[0]), Number(v[1])];
            const actual = BPMDef.assert(v);
            assert.deepStrictEqual(actual, expected);
        }
    });

    it("should reject invalid BPM definitions", function() {
        for(const v of [
            [-1, 120],
            [0, Number.POSITIVE_INFINITY],
            [0, "abc"],
            [0, -120],
            [],
            [0],
            [0, 120, 1],
        ]) {
            assert.throws(() => BPMDef.assert(v));
        }
    });
});

describe("BPMDefArray", function() {
    it("should handle empty and default cases", function() {
        assert.deepStrictEqual(BPMDefArray.assert([]), [[0n, 120]]);
    });

    it("should sort BPM definitions", function() {
        const input = [[100, 180], [0, 120], [50, 150]];
        const expected: Array<BPMDef> = [[0n, 120], [50n, 150], [100n, 180]];
        const actual = BPMDefArray.assert(input);
        assert.deepStrictEqual(actual, expected);
    });

    it("should reject arrays with invalid BPM definitions", function() {
        const input = [[0, 120], [-1, 180]];
        assert.throws(() => BPMDefArray.assert(input));
    });
});


describe("SigDef", function() {
    it("should accept valid signature definitions", function() {
        const v = [0, [4, 4]];
        const expected = [0n, [4n, 4n]];
        const actual = SigDef.assert(v);
        assert.deepStrictEqual(actual, expected);
    });

    it("should reject invalid signature definitions", function() {
        for(const v of [
            [-1, [4, 4]],
            [0, [0, 4]],
            [0, "4/4"],
        ]) {
            assert.throws(() => SigDef.assert(v));
        }
    });
});

describe("SigDefArray", function() {
    it("should handle empty and default cases", function() {
        const result = SigDefArray.assert([]);
        assert.deepStrictEqual(result, [[0n, [4n, 4n]]]);
    });

    it("should sort signature definitions", function() {
        const input = [[100, [3, 4]], [0, [4, 4]], [50, [2, 4]]];
        const expected: Array<SigDef> = [[0n, [4n, 4n]], [50n, [2n, 4n]], [100n, [3n, 4n]]];
        const actual = SigDefArray.assert(input);
        assert.deepStrictEqual(actual, expected);
    });

    it("should reject arrays with invalid signature definitions", function() {
        const input = [[0, [4, 4]], [10, [0, 4]]];
        assert.throws(() => SigDefArray.assert(input));
    });
});

describe("Timing", function() {
    it("should return default values for an empty object", function() {
        const result = Timing.assert({});
        assert.deepStrictEqual(result, {
            offset: 0,
            res: 24n,
            bpm: [[0n, 120]],
            sig: [[0n, [4n, 4n]]],
        });
    });

    it("should accept a valid Timing object", function() {
        const input = {
            offset: -100,
            res: 480,
            bpm: [[0, 140], [1920, 160]],
            sig: [[0, [4, 4]], [960, [3, 4]]],
        };
        const result = Timing.assert(input);
        assert.deepStrictEqual(result, {
            offset: -100,
            res: 480n,
            bpm: [[0n, 140], [1920n, 160]],
            sig: [[0n, [4n, 4n]], [960n, [3n, 4n]]],
        });
    });

    it("should fill in missing fields with defaults", function() {
        for(const input of [
            {},
            {bpm: []},
            {sig: []},
        ]) {
            const result = Timing.assert(input);
            assert.deepStrictEqual(result, {
                offset: 0,
                res: 24n,
                bpm: [[0n, 120]],
                sig: [[0n, [4n, 4n]]],
            });
        }
    });

    it("should reject objects with invalid field values", function() {
        for(const v of [
            { offset: 1.5 },
            { res: -1 },
            { bpm: [[-1, 120]] },
            { sig: [[0, [0, 4]]] },
        ]) {
            assert.throws(() => Timing.assert(v));
        }
    });
});