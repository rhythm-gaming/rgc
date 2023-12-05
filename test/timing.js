import { assert } from 'chai';
import { Timing } from "../dist/timing/timing.js";

const assertMeasuresEqual = (generator, expected, label) => {
    let ind = 0;
    for(const v of generator) {
        assert.deepStrictEqual(v, expected[ind], label);
        ++ind;
    }
};

describe("Timing", function() {
});