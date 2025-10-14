import { assert } from 'chai';

import { U8, U16, I32, U64, F64, Tick, NumberTick, Property } from "./scalar.js";

function testPlainIntType(IntType: (typeof U8|typeof U16|typeof I32), accept_values: number[], reject_values: number[]) {
    it("should accept valid int values", function() {
        for(const v of accept_values) {
            for(const w of [v, `${v}`, BigInt(v)]) {
                assert.strictEqual(IntType.assert(w), v, `testing ${typeof w} type of ${v}`);
            }
        }
    });
    it("should reject int values out of range", function() {
        for(const v of reject_values) {
            for(const w of [v, `${v}`, BigInt(v)]) {
                assert.throws(() => IntType.assert(w));
            }
        }
    });
    it("should reject non-integer or non-finite values", function() {
        for(const v of [-0.01, 0.5, 42.1, 255.99, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NaN]) {
            for(const w of [v, `${v}`]) {
                assert.throws(() => IntType.assert(w));
            }
        }
    });
    it("should reject non-number values", function() {
        for(const v of ["", "hello", {}, [], true, false, null, undefined]) {
            assert.throws(() => IntType.assert(v));
        }
    });
}

function testUint64Type(Uint64: (typeof U64)|(typeof NumberTick), omit_string: boolean = false) {
    it("should accept valid uint64 values", function() {
        for(const v of [
            0,
            42,
            Number.MAX_SAFE_INTEGER,
            0n,
            42n,
            BigInt(Number.MAX_SAFE_INTEGER),
            BigInt(Number.MAX_SAFE_INTEGER) + 1n,
            "0",
            "42",
            `${Number.MAX_SAFE_INTEGER}`,
            `${BigInt(Number.MAX_SAFE_INTEGER) + 1n}`,
        ]) {
            if(omit_string && typeof v === 'string') {
                assert.throws(() => Uint64.assert(v));
            } else {
                assert.strictEqual(Uint64.assert(v), BigInt(v), `testing ${typeof v} type of ${v}`);
            }
        }
    });
    
    it("should reject negative values", function() {
        for(const v of [-1, -42, -1n, "-1", "-42"]) {
            assert.throws(() => Uint64.assert(v));
        }
    });
    
    it("should reject non-integer or non-finite values", function() {
        for(const v of [
            0.5, 42.1,
            Number.MAX_SAFE_INTEGER + 1,
            Number.POSITIVE_INFINITY,
            Number.NEGATIVE_INFINITY,
            Number.NaN,
            "", "0.5", "42.1",
        ]) {
            assert.throws(() => Uint64.assert(v));
        }
    });

    it("should reject non-number-like values", function() {
        for(const v of ["hello", {}, [], true, false, null, undefined]) {
            assert.throws(() => Uint64.assert(v));
        }
    });
}

describe("U8", function() {
    const arr = [];
    for(let v=0; v<256; ++v) arr.push(v);

    testPlainIntType(U8, arr, [-42, -1, 256, 1000]);
});

describe("U16", function() {
    testPlainIntType(U16, [0, 42, 1000, 65535], [-42, -1, 65536, 100000]);
});

describe("I32", function() {
    testPlainIntType(I32, [-(2**31), -100, 0, 100, 65536, 2**31-1], [-(2**31)-1, 2**31]);
});

describe("U64", function() {
    testUint64Type(U64);
});

describe("F64", function() {
    it("should accept valid float values", function() {
        for(const v of [
            0,
            -0,
            42,
            -42.5,
            Number.MAX_SAFE_INTEGER,
            Number.MIN_SAFE_INTEGER,
            Number.MAX_VALUE,
            Number.MIN_VALUE,
        ]) {
            for(const w of [v, `${v}`]) {
                if(typeof w === 'string' && w.includes("e")) continue;

                assert.strictEqual(F64.assert(w), v, `testing ${typeof w} type of ${v}`);
            }
        }
    });

    it("should reject non-finite values", function() {
        for(const v of [
            Number.POSITIVE_INFINITY,
            Number.NEGATIVE_INFINITY,
            Number.NaN
        ]) {
            for(const w of [v, `${v}`]) {
                assert.throws(() => F64.assert(w));
            }
        }
    });
    
    it("should reject non-number values", function() {
        for(const v of ["", "hello", {}, [], true, false, null, undefined, 123n]) {
            assert.throws(() => F64.assert(v));
        }
    });
});

describe("Tick", function() {
    testUint64Type(Tick);
});

describe("NumberTick", function() {
    testUint64Type(NumberTick, true);
});

describe("Property", function() {
    it("should accept records", function() {
        const v = {hello: "world", foo: 42, bar: {}};
        assert.deepStrictEqual(Property.assert(v), v);
    });

    it("should reject non-records", function() {
        for(const v of [
            null, undefined,
            0, 1, -1, 0n, 1n, -1n, 0.5,
            "", "hello", true, false,
            [], [1, 2, 3],
        ]) {
            assert.throws(() => Property.assert(v));
        }
    });
});