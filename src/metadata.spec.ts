import { assert } from 'chai';
import { Metadata } from "./metadata.js";

describe("Metadata", function() {
    it("should be able to preserve fields for simple objects", function() {
        for(const obj of [
            {},
            {foo: 'foo', bar: 1234},
            {title: "x", x: 42}
        ] satisfies object[] as object[]) {
            assert.deepStrictEqual(Metadata(obj), obj);
        }
    });
});