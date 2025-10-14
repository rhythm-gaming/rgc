import { assert } from 'chai';

import { Metadata } from "./metadata.js";

describe("Metadata", function() {
    it("should be able to preserve fields for simple objects", function() {
        for(const obj of [
            {},
            {foo: 'foo', bar: 1234},
            {title: "x", x: 42}
        ] satisfies object[] as object[]) {
            assert.deepStrictEqual(Metadata.assert(obj), obj);
        }
    });
    
    it("should accept an empty header", () => {
        assert.deepStrictEqual(Metadata.assert({}), {});
    });

    it("should reject title with incorrect type", function() {
        for(const title of [
            true, false, null, (void 0),
            1234, 5678n, {}, [], () => {},
            Symbol('foo'),
        ]) {
            assert.throws(() => Metadata.assert({title}));
        }
    });
    
    it("should reject resource fields with incorrect types", () => {
        for(const key of ['music', 'chart', 'jacket']) {
            for(const value of [true, false, null, (void 0), 1234, 5678n, "hello", [], () => {}, Symbol('foo')]) {
                const data = { [key]: value };
                assert.throws(() => Metadata.assert(data));
            }
        }
    });
});