// @ts-check

import { assert } from 'chai';
import { Timing } from "../dist/timing/timing.js";

describe("Timing", function() {
    describe("constructor", function() {
        it("should throw on invalid resolution", function() {
            for(const res of [-24n, -1n, 0n]) {
                assert.throw(() => new Timing({res}), /invalid res/i, `res=${res}`);
            }
        });
    });

    describe("#getTimeByTick", function() {
        it("should return accurate values for simple cases", function() {
            const timing = new Timing({
                res: 24n,
                bpm: [[0n, 240]],
                sig: [[0n, [4, 4]]],
            });

            assert.strictEqual(timing.getTimeByTick(0n), 0);
            assert.strictEqual(timing.getTimeByTick(96n), 1000);
            assert.strictEqual(timing.getTimeByTick(-96n), -1000);
        });

        it("should return accurate values for charts with BPM changes", function() {
            const timing = new Timing({
                res: 24n,
                bpm: [[0n, 240], [96n, 120], [192n, 480]],
            });

            assert.strictEqual(timing.getTimeByTick(-96n), -1000);
            assert.strictEqual(timing.getTimeByTick(0n), 0);
            assert.strictEqual(timing.getTimeByTick(48n), 500);
            assert.strictEqual(timing.getTimeByTick(96n), 1000);
            assert.strictEqual(timing.getTimeByTick(144n), 2000);
            assert.strictEqual(timing.getTimeByTick(192n), 3000);
            assert.strictEqual(timing.getTimeByTick(288n), 3500);
        });

        it("should handle single BPM info regardless of timing", function() {
            for(const bpm_tick of [-100n, -50n, 0n, 50n, 100n]) {
                const timing = new Timing({
                    res: 24n,
                    bpm: [[bpm_tick, 240]],
                });

                for(let i=-2; i<=2; ++i) {
                    assert.strictEqual(timing.getTimeByTick(96n * BigInt(i)), 1000*i, `bpm_tick=${bpm_tick}, tick=${96*i}`);
                }
            }
        });
    });

    describe("#getMeasureInfoByTick", function() {
        it("should return accurate values for simple cases", function() {
            const timing = new Timing({
                res: 24n,
                bpm: [[0n, 240]],
                sig: [[0n, [4, 4]]],
            });

            assert.deepStrictEqual(timing.getMeasureInfoByTick(0n), {
                idx: 0n, tick: 0n, sig: [4, 4], full_length: 96n, beat_length: 24n,
            });
        });
    });
    
    describe("#getMeasureInfoByIdx", function() {
        it("should return accurate values for simple cases", function() {
            const timing = new Timing({
                res: 24n,
                bpm: [[0n, 240]],
                sig: [[0n, [4, 4]]],
            });

            assert.deepStrictEqual(timing.getMeasureInfoByIdx(0n), {
                idx: 0n, tick: 0n, sig: [4, 4], full_length: 96n, beat_length: 24n,
            });
        });
    });

    describe("#withTimingInfo", function() {
        const getTimingInfoArr = (timing, it) => {
            const arr = [];

            for(const [timing_info, data] of timing.withTimingInfo(it)) {
                arr.push([{...timing_info, measure: {...timing_info.measure}}, data]);
            }

            return arr;
        };

        it("should return accurate values for simple cases", function() {
            const timing = new Timing({
                res: 24n,
                bpm: [[0n, 240]],
                sig: [[0n, [4, 4]]],
            });

            /** @type {Array<[bigint, string]>} */
            const data = [[0n, 'a'], [50n, 'b'], [100n, 'c'], [191n, 'd'], [192n, 'e'], [193n, 'f'], [1000n, 'g']];
            const data_with_infos = getTimingInfoArr(timing, data.values());

            /** @type {import('../dist/timing/types.js').TimingInfo[]} */
            const timing_infos = data_with_infos.map((x) => x[0]);
            const measure_infos = timing_infos.map(({measure}) => measure);

            assert.isTrue(data_with_infos.every((x) => Array.isArray(x) && x.length === 2));
            assert.deepStrictEqual(data_with_infos.map((x) => x[1]), data.map((x) => x[1]));

            assert.deepStrictEqual(timing_infos.map(({tick}) => tick), data.map((x) => x[0]));
            assert.isTrue(timing_infos.every((x) => x.bpm === 240));
            assert.isTrue(measure_infos.every((x) => x.beat_length === 24n && x.full_length === 96n));
            assert.isTrue(measure_infos.every((x) => Array.isArray(x.sig) && x.sig.length === 2 && x.sig[0] === 4 && x.sig[1] === 4));
            assert.deepStrictEqual(measure_infos.map(({idx, tick}) => ({idx, tick})), [
                {idx: 0n, tick: 0n},
                {idx: 0n, tick: 0n},
                {idx: 1n, tick: 96n},
                {idx: 1n, tick: 96n},
                {idx: 2n, tick: 192n},
                {idx: 2n, tick: 192n},
                {idx: 10n, tick: 960n},
            ]);
        });
    })
});