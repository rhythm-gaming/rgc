import { assert } from 'chai';
import { ArkErrors } from 'arktype';

import { Pos } from "./lane-group.js";

describe("Pos", function() {
    it("should accept a number", function() {
        assert.deepStrictEqual(Pos(-5), [-5]);
        assert.deepStrictEqual(Pos(0), [0]);
        assert.deepStrictEqual(Pos(3.14), [3.14]);
        assert.deepStrictEqual(Pos("42"), [42]);
        assert.deepStrictEqual(Pos(123), [123]);
    });

    it("should accept an empty array", function() {
        assert.deepStrictEqual(Pos([]), [])
    });

    it("should not accept invalid values", function() {
        for(const v of [
            null, undefined, true, false, "foo",
            Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NaN,
            {}, () => {}, Symbol('123'),
        ]) {
            for(const w of [v, [v], [0, v]]) {
                assert.instanceOf(Pos(w), ArkErrors);
                assert.throws(() => Pos.assert(w));
            }
        }
    });
});
