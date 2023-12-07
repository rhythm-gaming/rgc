import { assert } from 'chai';
import { Timing } from "../dist/timing/timing.js";

describe("Timing", function() {
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
    });
});